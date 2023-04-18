const fs = require('fs')

const { stringify } = require('csv-stringify')
const dayjs = require('dayjs')
const Upload = require('graphql-upload/public/Upload')
const { get } = require('lodash')

const conf = require('@open-condo/config')
const { getLogger } = require('@open-condo/keystone/logging')

const { EXPORT_PROCESSING_BATCH_SIZE, COMPLETED } = require('@condo/domains/common/constants/export')
const { TASK_PROCESSING_STATUS } = require('@condo/domains/common/constants/tasks')
const { createWriteStreamForExport } = require('@condo/domains/common/utils/exportToExcel')
const { sleep } = require('@condo/domains/common/utils/sleep')
const { getTmpFile } = require('@condo/domains/common/utils/testSchema/file')

const { getHeadersTranslations, EXPORT_TYPE_TICKETS } = require('../exportToExcel')

const TASK_PROGRESS_UPDATE_INTERVAL = 10 * 1000 // 10sec
const CSV_DELIMITER = ';'

const logger = getLogger('export')

// Rough solution to offload server in case of exporting many thousands of records
const SLEEP_TIMEOUT = conf.WORKER_BATCH_OPERATIONS_SLEEP_TIMEOUT || 200

const buildUploadInputFrom = ({ stream, filename, mimetype, encoding, meta }) => {
    const uploadData = {
        createReadStream: () => {
            return stream
        },
        filename,
        mimetype,
        encoding,
        meta,
    }
    const uploadInput = new Upload()
    uploadInput.promise = new Promise(resolve => {
        resolve(uploadData)
    })
    return uploadInput
}

/**
 * Common fields of export task record
 *
 * @typedef ExportTask
 * @property {Number} id
 * @property {Number} exportedRecordsCount
 * @property {Number} totalRecordsCount
 */

/**
 * Converts record fetched from database to file row JSON representation
 * @typedef ConvertRecordToFileRowFunction
 */

/**
 * Loads records batch with specified offset and limit
 * @typedef LoadRecordsBatchFunction
 */

/**
 * Process records loaded by LoadRecordsBatchFunction
 * @typedef ProcessRecordBatchFunction
 */

/**
 * Queries records in batches to avoid database overload, converts them to file rows representation
 * @param {Object} args
 * @param args.context - Keystone context
 * @param {LoadRecordsBatchFunction} args.loadRecordsBatch - function to load a batch of records
 * @param {ProcessRecordBatchFunction} args.processRecordsBatch - function to convert record to file row JSON representation
 * @param args.taskServerUtils - utils from serverSchema
 * @param {string} args.taskId - task id
 * @param {number} args.totalRecordsCount - number of rows
 * @param args.baseAttrs - some extra attrs for taskServerUtils
 * @return {Promise<*[]>} - JSON representation of file rows, that will be saved to file
 */
const processRecords = async ({ context, loadRecordsBatch, processRecordsBatch, taskServerUtils, taskId, totalRecordsCount, baseAttrs }) => {
    let offset = 0
    let task // a fresh record we are working with
    const taskSchemaName = taskServerUtils.gql.SINGULAR_FORM
    let lastProgress = Date.now()

    do {
        // User can cancel the task at any time, in this all operations should be stopped
        task = await taskServerUtils.getOne(context, { id: taskId })
        const taskStatus = get(task, 'status')
        if (!task || taskStatus !== TASK_PROCESSING_STATUS) {
            logger.info({ msg: 'status != processing', taskStatus, taskSchemaName, taskId })
            return
        }

        const batch = await loadRecordsBatch(offset, EXPORT_PROCESSING_BATCH_SIZE)

        if (batch.length === 0) {
            // NOTE(pahaz): someone delete some records during the export
            logger.info({ msg: 'empty batch', offset, batchLength: batch.length, taskSchemaName, taskId })
            task = await taskServerUtils.update(context, taskId, {
                ...baseAttrs,
                totalRecordsCount: offset,
                exportedRecordsCount: offset,
            })
            return
        }

        await processRecordsBatch(batch)

        offset += batch.length

        if (Date.now() - lastProgress > TASK_PROGRESS_UPDATE_INTERVAL || offset >= totalRecordsCount) {
            lastProgress = Date.now()
            task = await taskServerUtils.update(context, taskId, {
                ...baseAttrs,
                totalRecordsCount,
                exportedRecordsCount: offset,
            })
        }

        await sleep(SLEEP_TIMEOUT)
    } while (offset < totalRecordsCount)
}

const exportRecordsAsXlsxFile = async ({ context, loadRecordsBatch, convertRecordToFileRow, buildExportFile, baseAttrs, taskServerUtils, totalRecordsCount, taskId }) => {
    let rows = []

    await processRecords({
        context,
        loadRecordsBatch,
        processRecordsBatch: async (batch) => {
            const convertedRecords = await Promise.all(batch.map(convertRecordToFileRow))
            rows.push(...convertedRecords)
        },
        taskServerUtils, taskId, totalRecordsCount, baseAttrs,
    })

    const file = buildUploadInputFrom(await buildExportFile(rows))

    await taskServerUtils.update(context, taskId, {
        ...baseAttrs,
        status: COMPLETED,
        file,
    })
}

const exportRecordsAsCsvFile = async ({ context, loadRecordsBatch, convertRecordToFileRow, baseAttrs, taskServerUtils, totalRecordsCount, taskId }) => {
    const filename = getTmpFile('csv')
    console.debug('>>> filename', filename)

    console.debug('>>> createWriteStreamForExport…')
    const writeStream = createWriteStreamForExport(filename)

    console.debug('>>> createWriteStreamForExport done')

    const task = await taskServerUtils.getOne(context, { id: taskId })
    const columns = getHeadersTranslations(EXPORT_TYPE_TICKETS, task.locale)
    const stringifier = stringify({ header: true, columns, delimiter: CSV_DELIMITER })
    stringifier.pipe(writeStream)

    console.debug('>>> processRecords…')

    await processRecords({
        context,
        loadRecordsBatch,
        processRecordsBatch: async (batch) => {
            const convertedRecords = await Promise.all(batch.map(convertRecordToFileRow))
            convertedRecords.forEach(row => {
                stringifier.write(Object.values(row))
            })
        },
        baseAttrs, taskServerUtils, totalRecordsCount, taskId,
    })

    stringifier.end()
    stringifier.unpipe(writeStream)

    console.debug('>>> processRecords done')



    console.debug('>>> writeStream.close')

    // if (!fs.existsSync(filename)) {
    //     return
    // }

    const stream = fs.createReadStream(filename, { encoding: 'utf8' })

    console.debug('>>> buildUploadInputFrom…')

    const file = buildUploadInputFrom({
        stream, filename: `export_${dayjs().format('DD_MM')}.csv`, mimetype: 'text/csv', encoding: 'utf8',
        meta: { listkey: taskServerUtils.gql.SINGULAR_FORM, id: taskId },
    })

    console.debug('>>> buildUploadInputFrom…done')

    await taskServerUtils.update(context, taskId, {
        ...baseAttrs,
        status: COMPLETED,
        file,
    })

    // fs.unlinkSync(filename)
    writeStream.close()
}

module.exports = {
    exportRecordsAsXlsxFile,
    exportRecordsAsCsvFile,
    buildUploadInputFrom,
}
