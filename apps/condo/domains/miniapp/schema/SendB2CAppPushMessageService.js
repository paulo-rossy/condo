/**
 * Generated by `createservice miniapp.SendB2CAppPushMessageService --type mutations`
 */
const { GQLError, GQLErrorCode: { BAD_USER_INPUT, FORBIDDEN } } = require('@open-condo/keystone/errors')
const { checkDvAndSender } = require('@open-condo/keystone/plugins/dvAndSender')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { WRONG_FORMAT, DV_VERSION_MISMATCH } = require('@condo/domains/common/constants/errors')
const access = require('@condo/domains/miniapp/access/SendB2CAppPushMessageService')
const {
    USER_NOT_FOUND_ERROR, RESIDENT_NOT_FOUND_ERROR,
    APP_NOT_FOUND_ERROR, APP_BLACK_LIST_ERROR, DEBUG_APP_ID,
    DECLINE_VOIP_WITHOUT_REASON_ERROR, DECLINE_VOIP_WITHOUT_CALLID_ERROR, DECLINE_REASONS,
    DECLINE_REASON_NOT_PROVIDED, CALLID_NOT_PROVIDED,
} = require('@condo/domains/miniapp/constants')
const { MessageAppBlackList } = require('@condo/domains/miniapp/utils/serverSchema')
const { B2CApp } = require('@condo/domains/miniapp/utils/serverSchema')
const {
    VOIP_INCOMING_CALL_MESSAGE_TYPE,
    B2C_APP_MESSAGE_PUSH_TYPE,
    DECLINE_VOIP_INCOMING_CALL_MESSAGE_TYPE,
} = require('@condo/domains/notification/constants/constants')
const { sendMessage } = require('@condo/domains/notification/utils/serverSchema')
const { Resident } = require('@condo/domains/resident/utils/serverSchema')
const { User } = require('@condo/domains/user/utils/serverSchema')
const { RedisGuard } = require('@condo/domains/user/utils/serverSchema/guards')


const CACHE_TTL = {
    DEFAULT: 3600,
    VOIP_INCOMING_CALL_MESSAGE: 2,
    DECLINE_VOIP_INCOMING_CALL_MESSAGE: 2,
    B2C_APP_MESSAGE_PUSH: 3600,
}

//TODO(Kekmus) Better to use existing redisGuard if possible
const redisGuard = new RedisGuard()

const SERVICE_NAME = 'sendB2CAppPushMessage'
const ERRORS = {
    USER_NOT_FOUND: {
        mutation: SERVICE_NAME,
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND_ERROR,
        message: 'Unable to find user by provided id.',
        messageForUser: `api.miniapp.${SERVICE_NAME}.USER_NOT_FOUND`,
    },
    RESIDENT_NOT_FOUND: {
        mutation: SERVICE_NAME,
        code: BAD_USER_INPUT,
        type: RESIDENT_NOT_FOUND_ERROR,
        message: 'Unable to find resident by provided id.',
        messageForUser: `api.miniapp.${SERVICE_NAME}.RESIDENT_NOT_FOUND`,
    },
    APP_NOT_FOUND: {
        mutation: SERVICE_NAME,
        code: BAD_USER_INPUT,
        type: APP_NOT_FOUND_ERROR,
        message: 'Unable to find app by provided id.',
        messageForUser: `api.miniapp.${SERVICE_NAME}.APP_NOT_FOUND`,
    },
    DV_VERSION_MISMATCH: {
        mutation: SERVICE_NAME,
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
        messageForUser: `api.miniapp.${SERVICE_NAME}.DV_VERSION_MISMATCH`,
    },
    WRONG_SENDER_FORMAT: {
        mutation: SERVICE_NAME,
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
        messageForUser: `api.miniapp.${SERVICE_NAME}.WRONG_SENDER_FORMAT`,
    },
    APP_IN_BLACK_LIST: {
        mutation: SERVICE_NAME,
        code: FORBIDDEN,
        type: APP_BLACK_LIST_ERROR,
        message: 'Could not send notifications for the blacklisted app',
        messageForUser: `api.miniapp.${SERVICE_NAME}.APP_IN_BLACK_LIST`,
    },
    DECLINE_VOIP_WITHOUT_CALLID: {
        mutation: SERVICE_NAME,
        code: CALLID_NOT_PROVIDED,
        type: DECLINE_VOIP_WITHOUT_CALLID_ERROR,
        message: 'Could not send notifications to decline voip call without callId in data',
        messageForUser: `api.miniapp.${SERVICE_NAME}.DECLINE_VOIP_WITHOUT_CALLID`,
    },
    DECLINE_VOIP_WITHOUT_REASON: {
        mutation: SERVICE_NAME,
        code: DECLINE_REASON_NOT_PROVIDED,
        type: DECLINE_VOIP_WITHOUT_REASON_ERROR,
        message: 'Could not send notifications to decline voip call without declineReason in data',
        messageForUser: `api.miniapp.${SERVICE_NAME}.DECLINE_VOIP_WITHOUT_REASON`,
    },
}

const SendB2CAppPushMessageService = new GQLCustomSchema('SendB2CAppPushMessageService', {
    types: [
        {
            access: true,
            type: `enum SendB2CAppPushMessageType { ${VOIP_INCOMING_CALL_MESSAGE_TYPE} ${B2C_APP_MESSAGE_PUSH_TYPE} ${DECLINE_VOIP_INCOMING_CALL_MESSAGE_TYPE} }`,
        },
        {
            access: true,
            type: `enum VOIPMessageDeclineReason { ${DECLINE_REASONS.declinedByCaller} ${DECLINE_REASONS.receivedOnDevice} }`,
        },
        {
            access: true,
            type: 'input SendB2CAppPushMessageData { body: String!, title: String, B2CAppContext: String, callId: String, voipType: String, voipAddress: String, voipLogin: String, voipPassword: String, voipDtfmCommand: String, declineReason: VOIPMessageDeclineReason }',
        },
        {
            access: true,
            type: 'input SendB2CAppPushMessageInput { ' +
                    'dv: Int!, ' +
                    'sender: SenderFieldInput!, ' +
                    'app: B2CAppWhereUniqueInput!, ' +
                    'user: UserWhereUniqueInput!, ' +
                    'resident: ResidentWhereUniqueInput!, ' +
                    'type: SendB2CAppPushMessageType!, ' +
                    'data: SendB2CAppPushMessageData! ' +
                '}',
        },
        {
            access: true,
            type: 'type SendB2CAppPushMessageOutput { id: String!, status: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canSendB2CAppPushMessage,
            schema: 'sendB2CAppPushMessage(data: SendB2CAppPushMessageInput!): SendB2CAppPushMessageOutput',
            resolver: async (parent, args, context) => {
                const { data: argsData } = args
                const { dv, sender, app, user, resident, type, uniqKey,
                    data: { B2CAppContext, title, body, callId, declineReason, voipType, voipAddress, voipLogin, voipPassword, voipDtfmCommand },
                } = argsData

                checkDvAndSender(argsData, ERRORS.DV_VERSION_MISMATCH, ERRORS.WRONG_SENDER_FORMAT, context)

                const userExisted = await User.getOne(context, { id: user.id, deletedAt: null })

                if (!userExisted) throw new GQLError(ERRORS.USER_NOT_FOUND, context)

                if (type === DECLINE_VOIP_INCOMING_CALL_MESSAGE_TYPE) {
                    if (!callId) throw new GQLError(ERRORS.DECLINE_VOIP_WITHOUT_CALLID, context)
                    if (!declineReason) throw new GQLError(ERRORS.DECLINE_VOIP_WITHOUT_REASON, context)
                }

                /** resident must belong to the user */
                const residentWhere = {
                    id: resident.id,
                    user: { id: user.id },
                    deletedAt: null,
                }
                const residentExisted = await Resident.getOne(context, residentWhere)

                if (!residentExisted) throw new GQLError(ERRORS.RESIDENT_NOT_FOUND, context)

                let B2CAppName = 'Debug app'

                // App requested to send notification to is not a DEBUG one
                if (app.id !== DEBUG_APP_ID) {
                    const appExisted = await B2CApp.getOne(context, { id: app.id, deletedAt: null })

                    if (!appExisted) throw new GQLError(ERRORS.APP_NOT_FOUND, context)

                    B2CAppName = appExisted.name
                    const where = { app: { id: app.id }, type, deletedAt: null }
                    const appInBlackList = await MessageAppBlackList.getOne(context, where)

                    if (appInBlackList) throw new GQLError(ERRORS.APP_IN_BLACK_LIST, context)
                }

                const searchKey = `${type}_${app.id}_${user.id}`
                const ttl = CACHE_TTL[type] || CACHE_TTL['DEFAULT']

                await redisGuard.checkLock(searchKey, SERVICE_NAME, context)
                await redisGuard.lock(searchKey, SERVICE_NAME, ttl)

                const messageAttrs = {
                    uniqKey,
                    sender,
                    type,
                    to: { user: { id: user.id } },
                    meta: {
                        dv,
                        title,
                        body,
                        data: {
                            B2CAppContext,
                            B2CAppName,
                            B2CAppId: app.id,
                            residentId: resident.id,
                        },
                    },
                }

                if (voipType) {
                    messageAttrs.meta.data.voipType = voipType
                    messageAttrs.meta.data.voipAddress = voipAddress
                    messageAttrs.meta.data.voipLogin = voipLogin
                    messageAttrs.meta.data.voipPassword = voipPassword
                    messageAttrs.meta.data.voipDtfmCommand = voipDtfmCommand
                }

                if (type === 'decline') {
                    messageAttrs.meta.data.callId = callId
                    messageAttrs.meta.data.declineReason = declineReason
                }

                const sendingResult = await sendMessage(context, messageAttrs)

                return {
                    id: sendingResult.id,
                    status: sendingResult.status,
                }
            },
        },
    ],
    
})

module.exports = {
    SendB2CAppPushMessageService,
    ERRORS,
}
