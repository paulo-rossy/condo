/**
 * Generated by `createschema notification.MarketingMessage 'type:Select:sms,email,push; message:Text; deepLink?:Text; idList:Json; status:Select:created,done; processingMeta?:Json;'`
 */

const { isArray, isEmpty } = require('lodash')

const { Text, Select } = require('@keystonejs/fields')
const { Json } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')

const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')
const access = require('@condo/domains/notification/access/MarketingMessage')

const { JSON_EXPECT_ARRAY_ERROR, OPERATION_FORBIDDEN } = require('@condo/domains/common/constants/errors')

const {
    MARKETING_MESSAGE_TRANSPORT_TYPES,
    MARKETING_MESSAGE_STATUSES,
    MARKETING_MESSAGE_CREATED_STATUS,
} = require('../constants/constants')

const { sendMarketingMessagesTask } = require('../tasks/sendMarketingMessagesTask')

const operationForbiddenValidator = ({ fieldPath, addFieldValidationError, operation }) => {
    if (operation === 'update') addFieldValidationError(`${OPERATION_FORBIDDEN}] Updating ${fieldPath} is forbidden.`)
}

const MarketingMessage = new GQLListSchema('MarketingMessage', {
    schemaDoc: 'Marketing message batch. Adding record here will cause sending message to all users listed in idList via transport, selected in transportType.',
    fields: {

        transportType: {
            schemaDoc: 'Transport type to send notifications by.',
            type: Select,
            options: MARKETING_MESSAGE_TRANSPORT_TYPES,
            isRequired: true,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        title: {
            schemaDoc: 'Title for message to send.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        message: {
            schemaDoc: 'Message to send.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        deepLink: {
            schemaDoc: 'Used for push notifications only. Useful for moving user to proper position within mobile apps.',
            type: Text,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        idList: {
            schemaDoc: 'List of IDs (User.id for ex.) which will be used to query contacts to send notifications to.',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    const { resolvedData, fieldPath, addFieldValidationError } = args
                    const idList = resolvedData[fieldPath]

                    if (!isArray(idList) || isEmpty(idList)) addFieldValidationError(`${JSON_EXPECT_ARRAY_ERROR}${fieldPath}] Expect non-empty JSON Array`)

                    operationForbiddenValidator(args)
                },
            },
        },

        status: {
            schemaDoc: 'Batch processing status.',
            type: Select,
            options: MARKETING_MESSAGE_STATUSES,
            isRequired: true,
        },

        processingMeta: {
            schemaDoc: 'Batch processing results will be stored here.',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: (args) => {
                    if (!hasValidJsonStructure(args, false, 1, {})) return
                },
            },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadMarketingMessages,
        create: access.canManageMarketingMessages,
        update: access.canManageMarketingMessages,
        delete: false,
        auth: true,
    },
    hooks: {
        resolveInput: async ({ operation, resolvedData }) => {
            if (operation === 'create')  resolvedData.status = MARKETING_MESSAGE_CREATED_STATUS

            return resolvedData
        },
        afterChange: async ({ operation, updatedItem }) => {
            if (operation === 'create')  await sendMarketingMessagesTask.delay(updatedItem.id)
        },
    },
})

module.exports = {
    MarketingMessage,
}
