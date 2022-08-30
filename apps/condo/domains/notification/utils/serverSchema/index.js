/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { LOCALES } = require('@condo/domains/common/constants/locale')
const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const {
    Message: MessageGQL,
    SEND_MESSAGE,
    RESEND_MESSAGE,
    RemoteClient: RemoteClientGQL,
    SYNC_DEVICE_MUTATION,
    DISCONNECT_USER_FROM_DEVICE_MUTATION,
    SET_MESSAGE_STATUS_MUTATION,
} = require('@condo/domains/notification/gql')
const { MESSAGE_TYPES } = require('@condo/domains/notification/constants/constants')

const { MessageUserBlackList: MessageUserBlackListGQL } = require('@condo/domains/notification/gql')
const { MessageOrganizationBlackList: MessageOrganizationBlackListGQL } = require('@condo/domains/notification/gql')
const { MessageOrganizationWhiteList: MessageOrganizationWhiteListGQL } = require('@condo/domains/notification/gql')
const isEmpty = require('lodash/isEmpty')
const get = require('lodash/get')
const { MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST, MESSAGE_TYPE_IN_USER_BLACK_LIST } = require('@condo/domains/notification/constants/errors')
const { find } = require('@condo/keystone/schema')
const { MarketingMessage: MarketingMessageGQL } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Message = generateServerUtils(MessageGQL)

async function sendMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.to) throw new Error('no data.to')
    if (!data.to.email && !data.to.phone && !data.to.user) throw new Error('wrong data.to')
    if (!data.type) throw new Error('no data.type')
    if (!MESSAGE_TYPES.includes(data.type)) throw new Error('unknown data.type')
    if (!LOCALES[data.lang]) throw new Error('unknown data.lang')

    return await execGqlWithoutAccess(context, {
        query: SEND_MESSAGE,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendMessage',
        dataPath: 'result',
    })
}

async function resendMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.message || !data.message.id) throw new Error('no data.message')

    return await execGqlWithoutAccess(context, {
        query: RESEND_MESSAGE,
        variables: { data },
        errorMessage: '[error] Unable to resendMessage',
        dataPath: 'result',
    })
}

const RemoteClient = generateServerUtils(RemoteClientGQL)

/**
 * Connects a device that could be sent push notifications with user and/or pushToken
 * Should be called for:
 * 1. Registration of a device: required fields deviceId, optional fields: pushToken + pushTransport, user, meta
 * 2. Connection of a device to current authorized user: required fields: deviceId
 * 3. Update pushToken value: required field: deviceId, pushToken + pushTransport (pushTransport should always follow pushToken, in order to select proper push transport)
 * 4. Update meta value: required field: deviceId, meta
 * @param context
 * @param data
 * @returns {Promise<*>}
 */
async function syncRemoteClient (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.deviceId) throw new Error('no data.deviceId')

    return await execGqlWithoutAccess(context, {
        query: SYNC_DEVICE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to syncRemoteClient',
        dataPath: 'obj',
    })
}

async function disconnectUserFromRemoteClient (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.deviceId) throw new Error('no data.deviceId')

    return await execGqlWithoutAccess(context, {
        query: DISCONNECT_USER_FROM_DEVICE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to disconnectUserFromRemoteClient',
        dataPath: 'obj',
    })
}

async function setMessageStatus (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.message || !data.message.id) throw new Error('no data.message')
    if (!data.deliveredAt && !data.readAt) throw new Error('no data.deliveredAt and data.readAt')

    return await execGqlWithoutAccess(context, {
        query: SET_MESSAGE_STATUS_MUTATION,
        variables: { data },
        errorMessage: '[error] Unable to setMessageStatus',
        dataPath: 'obj',
    })
}

async function checkMessageTypeInBlackList (context, message) {
    if (message.organization) {
        const messageOrganizationBlackListWhere = {
            type: message.type,
            OR: [
                { organization_is_null: true },
                { organization: { id: message.organization.id } },
            ],
            deletedAt: null,
        }
        const messageOrganizationBlackListRules = await MessageOrganizationBlackList.getAll(context, messageOrganizationBlackListWhere)

        if (!isEmpty(messageOrganizationBlackListRules)) {
            const messageOrganizationBlackListRule = messageOrganizationBlackListRules.find(rule => get(rule, ['organization', 'id']) === message.organization.id)
            const allOrganizationsBlackListRule = messageOrganizationBlackListRules.find(rule => !rule.organization)

            if (!messageOrganizationBlackListRule && allOrganizationsBlackListRule) {
                const messageOrganizationWhiteListRule = await MessageOrganizationWhiteList.getOne(context, {
                    type: message.type,
                    organization: { id: message.organization.id },
                    deletedAt: null,
                })

                if (messageOrganizationWhiteListRule) {
                    return { error: null }
                }
            }

            return {
                error: MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST,
            }
        }
    }

    const messageUserBlackListWhere = {
        OR: [
            message.user && { user: { id: message.user.id } },
            message.phone && { phone: message.phone },
            message.email && { email: message.email },
        ].filter(Boolean),
        deletedAt: null,
    }

    const messageUserBlackListRules = await find('MessageUserBlackList',  messageUserBlackListWhere)

    if (!isEmpty(messageUserBlackListRules)) {
        const isMessageTypeInUserBlackList = messageUserBlackListRules.find(rule => rule.type === message.type || isEmpty(rule.type))

        if (isMessageTypeInUserBlackList) {
            return {
                error: MESSAGE_TYPE_IN_USER_BLACK_LIST,
            }
        }
    }

    return { error: null }
}

const MessageUserBlackList = generateServerUtils(MessageUserBlackListGQL)
const MessageOrganizationBlackList = generateServerUtils(MessageOrganizationBlackListGQL)
const MessageOrganizationWhiteList = generateServerUtils(MessageOrganizationWhiteListGQL)
const MarketingMessage = generateServerUtils(MarketingMessageGQL)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Message,
    sendMessage,
    resendMessage,
    RemoteClient,
    syncRemoteClient,
    disconnectUserFromRemoteClient,
    setMessageStatus,
    MessageUserBlackList,
    MessageOrganizationBlackList,
    MessageOrganizationWhiteList,
    checkMessageTypeInBlackList,
    MarketingMessage,
/* AUTOGENERATE MARKER <EXPORTS> */
}
