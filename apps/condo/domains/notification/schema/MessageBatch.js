/**
 * Generated by `createschema notification.MessageBatch 'messageType:Text; title:Text; message:Text; deepLink?:Text; targets:Json; status:Select:created,processing,failed,done; processingMeta?:Json;'`
 */

const { Text, Select } = require('@keystonejs/fields')
const { isArray, isEmpty } = require('lodash')


const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { JSON_EXPECT_ARRAY_ERROR, OPERATION_FORBIDDEN } = require('@condo/domains/common/constants/errors')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')
const access = require('@condo/domains/notification/access/MessageBatch')
const {
    CUSTOM_CONTENT_MESSAGE_TYPE,
    MESSAGE_BATCH_STATUSES,
    MESSAGE_BATCH_CREATED_STATUS,
    MESSAGE_BATCH_TYPE_OPTIONS,
} = require('@condo/domains/notification/constants/constants')
const { sendMessageBatchTask } = require('@condo/domains/notification/tasks')

const operationForbiddenValidator = ({ fieldPath, addFieldValidationError, operation }) => {
    if (operation === 'update') addFieldValidationError(`${OPERATION_FORBIDDEN}] Updating ${fieldPath} is forbidden.`)
}

const MessageBatch = new GQLListSchema('MessageBatch', {
    schemaDoc: 'Message batch. Adding record here will cause sending message to all targets (user, phone or email) listed in targets via transport detected based on target type.',
    fields: {
        messageType: {
            schemaDoc: 'Message type to use for sending notification',
            type: Select,
            options: MESSAGE_BATCH_TYPE_OPTIONS,
            defaultValue: CUSTOM_CONTENT_MESSAGE_TYPE,
            isRequired: false,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        title: {
            schemaDoc: 'Common title for messages to be sent. Single line, shouldn\'t be very long.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        message: {
            schemaDoc: 'Common body for messages to be sent. Can be multiline, but shouldn\'t be very long in case of SMS or Push.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        deepLink: {
            schemaDoc: 'A link to bring user to specified position within a mobile app. Used ONLY for push notifications',
            type: Text,
            hooks: {
                validateInput: operationForbiddenValidator,
            },
        },

        targets: {
            schemaDoc: 'List of ids for "push", "email", "sms" message types; list of emails for "email" message types; list of phone numbers for "sms" message types. Can be mixed. For each entry an appropriate message type will be used.',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    const { resolvedData, fieldPath, addFieldValidationError } = args
                    const targets = resolvedData[fieldPath]

                    if (!isArray(targets) || isEmpty(targets)) addFieldValidationError(`${JSON_EXPECT_ARRAY_ERROR}${fieldPath}] Expect non-empty JSON Array`)

                    operationForbiddenValidator(args)
                },
            },
        },

        status: {
            schemaDoc: 'Batch processing status',
            type: Select,
            options: MESSAGE_BATCH_STATUSES,
            defaultValue: MESSAGE_BATCH_CREATED_STATUS,
            isRequired: true,
        },

        processingMeta: {
            schemaDoc: 'Batch processing results will be stored here',
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
        read: access.canReadMessageBatches,
        create: access.canManageMessageBatches,
        update: access.canManageMessageBatches,
        delete: false,
        auth: true,
    },
    hooks: {
        resolveInput: async ({ operation, resolvedData }) => {
            if (operation === 'create') resolvedData.status = MESSAGE_BATCH_CREATED_STATUS

            return resolvedData
        },
        afterChange: async ({ operation, updatedItem }) => {
            if (operation === 'create') await sendMessageBatchTask.delay(updatedItem.id)
        },
    },
})

module.exports = {
    MessageBatch,
}
