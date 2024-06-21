/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { isEmpty, get } = require('lodash')

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')
const conf = require('@open-condo/config')
const { getLogger } = require('@open-condo/keystone/logging')
const { find } = require('@open-condo/keystone/schema')
const { extractReqLocale } = require('@open-condo/locales/extractReqLocale')

const { LOCALES } = require('@condo/domains/common/constants/locale')
const { MESSAGE_TYPES } = require('@condo/domains/notification/constants/constants')
const { MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST, MESSAGE_TYPE_IN_USER_BLACK_LIST } = require('@condo/domains/notification/constants/errors')
const {
    SEND_MESSAGE,
    RESEND_MESSAGE,
    SYNC_DEVICE_MUTATION,
    DISCONNECT_USER_FROM_DEVICE_MUTATION,
    SET_MESSAGE_STATUS_MUTATION,
    Message: MessageGQL,
    RemoteClient: RemoteClientGQL,
    MessageUserBlackList: MessageUserBlackListGQL,
    MessageOrganizationBlackList: MessageOrganizationBlackListGQL,
    MessageBatch: MessageBatchGQL,
    NotificationUserSetting: NotificationUserSettingGQL,
} = require('@condo/domains/notification/gql')
const { TelegramUserChat: TelegramUserChatGQL } = require('@condo/domains/notification/gql')
const { NotificationAnonymousSetting: NotificationAnonymousSettingGQL } = require('@condo/domains/notification/gql')
const { _INTERNAL_SEND_NOTIFICATION_NEW_MOBILE_APP_VERSION_MUTATION } = require('@condo/domains/notification/gql')
const { _INTERNAL_SEND_HASHED_RESIDENT_PHONES_MUTATION } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const logger = getLogger('notification/serverSchema')
const Message = generateServerUtils(MessageGQL)

async function sendMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.to) throw new Error('no data.to')
    if (!data.to.email && !data.to.phone && !data.to.user && !data.to.remoteClient) throw new Error('wrong data.to')
    if (!data.type) throw new Error('no data.type')
    if (!MESSAGE_TYPES.includes(data.type)) throw new Error('unknown data.type')
    if (!data.lang) data.lang = extractReqLocale(context.req) || conf.DEFAULT_LOCALE
    if (!LOCALES[data.lang]) throw new Error('unknown data.lang')
    if (!data.dv) data.dv = 1

    const reqId = get(context, ['req', 'id'])

    logger.info({ msg: 'sendMessage', type: data.type, reqId })

    return await execGqlWithoutAccess(context, {
        query: SEND_MESSAGE,
        variables: { data },
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

        if (!isEmpty(messageOrganizationBlackListRules)) return { error: MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST }
    }

    const userCriteria = [
        message.user && { user: { id: message.user.id } },
        message.phone && { phone: message.phone },
        message.email && { email: message.email },
    ]
    const messageUserBlackListWhere = {
        OR: userCriteria.filter(Boolean),
        deletedAt: null,
    }

    const messageUserBlackListRules = await find('MessageUserBlackList',  messageUserBlackListWhere)

    if (!isEmpty(messageUserBlackListRules)) {
        const isMessageTypeInUserBlackList = messageUserBlackListRules.find(rule => rule.type === message.type || isEmpty(rule.type))

        if (isMessageTypeInUserBlackList) return { error: MESSAGE_TYPE_IN_USER_BLACK_LIST }
    }

    return { error: null }
}

const MessageUserBlackList = generateServerUtils(MessageUserBlackListGQL)
const MessageOrganizationBlackList = generateServerUtils(MessageOrganizationBlackListGQL)
const MessageBatch = generateServerUtils(MessageBatchGQL)
const NotificationUserSetting = generateServerUtils(NotificationUserSettingGQL)
const TelegramUserChat = generateServerUtils(TelegramUserChatGQL)
const NotificationAnonymousSetting = generateServerUtils(NotificationAnonymousSettingGQL)
async function _internalSendNotificationNewMobileAppVersion (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: _INTERNAL_SEND_NOTIFICATION_NEW_MOBILE_APP_VERSION_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to _internalSendNotificationNewMobileAppVersion',
        dataPath: 'obj',
    })
}

async function _internalSendHashedResidentPhones (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: _INTERNAL_SEND_HASHED_RESIDENT_PHONES_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to _internalSendHashedResidentPhones',
        dataPath: 'obj',
    })
}

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
    checkMessageTypeInBlackList,
    MessageBatch,
    NotificationUserSetting,
    TelegramUserChat,
    NotificationAnonymousSetting,
    _internalSendNotificationNewMobileAppVersion,
    _internalSendHashedResidentPhones,
/* AUTOGENERATE MARKER <EXPORTS> */
}
