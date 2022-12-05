/**
 * Generated by `createschema ticket.TicketExportTask 'status:Select:processing,completed,error; format:Select:excel; exportedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; meta?:Json'`
 */
const { Text, Integer, Select, File } = require('@keystonejs/fields')

const conf = require('@open-condo/config')

const { Json } = require('@open-condo/keystone/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@condo/domains/ticket/access/TicketExportTask')
const { canOnlyServerSideWithoutUserRequest } = require('@open-condo/keystone/access')
const { EXPORT_STATUS_VALUES, EXPORT_FORMAT_VALUES, PROCESSING, COMPLETED, ERROR } = require('@condo/domains/common/constants/export')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { normalizeTimeZone } = require('@condo/domains/common/utils/timezone')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const { extractReqLocale } = require('@open-condo/locales/extractReqLocale')
const { exportTickets } = require('../tasks')
const { getFileMetaAfterChange } = require('../../common/utils/fileAdapter')
const { TICKET_EXPORT_PARAMETERS_FIELD } = require('./fields/TicketExportParameters')

const TICKET_EXPORT_TASK_FOLDER_NAME = 'TicketExportTask'
const TicketExportTaskFileAdapter = new FileAdapter(TICKET_EXPORT_TASK_FOLDER_NAME)

const setFileMetaAfterChange = getFileMetaAfterChange(TicketExportTaskFileAdapter, 'file')

const TicketExportTask = new GQLListSchema('TicketExportTask', {
    schemaDoc: 'Stores requested export format, status of export job, link to exported file and information about progress of export job',
    fields: {

        status: {
            schemaDoc: 'Status of export job',
            type: Select,
            options: EXPORT_STATUS_VALUES,
            isRequired: true,
            defaultValue: PROCESSING,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: true,
            },
        },

        format: {
            schemaDoc: 'Requested export file format',
            type: Select,
            options: EXPORT_FORMAT_VALUES,
            isRequired: true,
            access: {
                read: true,
                create: true,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

        exportedRecordsCount: {
            schemaDoc: 'How many records at the moment are exported',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

        totalRecordsCount: {
            schemaDoc: 'Total records to export that will be determined at server side in export operation',
            type: Integer,
            isRequired: false,
            defaultValue: 0,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

        file: {
            schemaDoc: 'Meta information about file, saved outside of database somewhere. Shape of meta information JSON object is specific to file adapter, used by saving a file.',
            type: File,
            adapter: TicketExportTaskFileAdapter,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

        meta: {
            schemaDoc: 'Stores information about query and ids of exported and failed records',
            type: Json,
            access: {
                read: true,
                create: canOnlyServerSideWithoutUserRequest,
                update: canOnlyServerSideWithoutUserRequest,
            },
        },

        where: {
            schemaDoc: 'Filtering conditions for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `TicketWhereInput` as a GraphQL type
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        sortBy: {
            schemaDoc: 'Sorting parameters for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `SortTicketsBy` as a GraphQL type
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        locale: {
            schemaDoc: 'Requested export locale, in that the resulting file will be rendered',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ context }) => {
                    return extractReqLocale(context.req) || conf.DEFAULT_LOCALE
                },
            },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        timeZone: {
            schemaDoc: 'To requested timeZone all datetime fields will be converted',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    const { timeZone } = resolvedData
                    return normalizeTimeZone(timeZone) || DEFAULT_ORGANIZATION_TIMEZONE
                },
            },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        user: {
            schemaDoc: 'User that requested this exporting operation. Will be used for read access checks to display all exported tasks somewhere and to display progress indicator of ongoing exporting task for current user',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            knexOptions: { isNotNullable: true },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        parameters: TICKET_EXPORT_PARAMETERS_FIELD,

    },
    hooks: {
        validateInput: async ({ resolvedData, existingItem, addValidationError }) => {
            if (existingItem) {
                if (resolvedData['status'] && existingItem['status'] === COMPLETED) {
                    addValidationError('status is already completed')
                }
                if (resolvedData['status'] && existingItem['status'] === ERROR) {
                    addValidationError('status is already error')
                }
            }
        },
        afterChange: async (args) => {
            const { updatedItem, operation } = args
            await setFileMetaAfterChange(args)
            if (operation === 'create') {
                await exportTickets.delay(updatedItem.id)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketExportTasks,
        create: access.canManageTicketExportTasks,
        update: access.canManageTicketExportTasks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketExportTask,
}
