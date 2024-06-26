/**
 * Generated by `createschema meter.MeterReadingsImportTask 'status:Select:processing,completed,canceled,error; format:Select:excel,csv; importedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; errorFile?:File; user:Relationship:User:CASCADE;meta?:Json'`
 */
const Ajv = require('ajv')
const { get } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { CANCELLED } = require('@condo/domains/common/constants/import')

// Only cancelling the task is allowed for user
const ORIGINAL_INPUT_TO_CANCEL_TASK = {
    type: 'object',
    properties: {
        dv: {
            type: 'integer',
        },
        sender: {
            type: 'object',
        },
        status: {
            type: 'string',
            pattern: CANCELLED,
        },
    },
    additionalProperties: false,
    required: ['dv', 'sender', 'status'],
}

const ajv = new Ajv()
const originalInputToCancelTask = ajv.compile(ORIGINAL_INPUT_TO_CANCEL_TASK)

async function canReadMeterReadingsImportTasks ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    return { user: { id: user.id } }
}

async function canManageMeterReadingsImportTasks ({ authentication: { item: user }, originalInput, operation, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create' && get(originalInput, ['user', 'connect', 'id']) === user.id) {
        return true
    } else if (operation === 'update' && originalInputToCancelTask(originalInput)) {
        return { user: { id: user.id } }
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMeterReadingsImportTasks,
    canManageMeterReadingsImportTasks,
}
