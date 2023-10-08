/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')
const { random, isEmpty, sample, get } = require('lodash')

const { getRandomString } = require('@open-condo/keystone/test.utils')

const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')

const {
    PUSH_TRANSPORT_TYPES, DEVICE_PLATFORM_TYPES, INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    MESSAGE_BATCH_TYPE_OPTIONS, PUSH_TRANSPORT_FIREBASE, PUSH_FAKE_TOKEN_SUCCESS, MESSAGE_TYPES, MESSAGE_TRANSPORTS,
} = require('@condo/domains/notification/constants/constants')
const {
    getRandomTokenData,
    getRandomFakeSuccessToken,
} = require('@condo/domains/notification/utils/testSchema/helpers')

const {
    Message: MessageGQL,
    SEND_MESSAGE,
    RESEND_MESSAGE,
    RemoteClient: RemoteClientGQL,
    SYNC_REMOTE_CLIENT_MUTATION,
    DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION,
    SET_MESSAGE_STATUS_MUTATION,
    MessageUserBlackList: MessageUserBlackListGQL,
    MessageOrganizationBlackList: MessageOrganizationBlackListGQL,
    MessageBatch: MessageBatchGQL,
} = require('@condo/domains/notification/gql')

const { NotificationUserSetting: NotificationUserSettingGQL } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Message = generateGQLTestUtils(MessageGQL)
const RemoteClient = generateGQLTestUtils(RemoteClientGQL)

const MessageUserBlackList = generateGQLTestUtils(MessageUserBlackListGQL)
const MessageOrganizationBlackList = generateGQLTestUtils(MessageOrganizationBlackListGQL)
const MessageBatch = generateGQLTestUtils(MessageBatchGQL)

const NotificationUserSetting = generateGQLTestUtils(NotificationUserSettingGQL)
/* AUTOGENERATE MARKER <CONST> */

const lang = 'en'
const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE

const getRandomEmail = () => `test.${getRandomString()}@example.com`.toLowerCase()

async function createTestMessage (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const email = getRandomEmail()
    const meta = { dv: 1, name: faker.random.alphaNumeric(8) }
    const attrs = { dv: 1, sender, email, type, meta, lang, ...extraAttrs }
    const obj = await Message.create(client, attrs)

    return [obj, attrs]
}

async function updateTestMessage (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const obj = await Message.update(client, id, attrs)

    return [obj, attrs]
}

async function sendMessageByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const email = getRandomEmail()
    const to = get(client, 'user.id') ? { email, user: { id: client.user.id } } : { email }
    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE
    const meta = { dv: 1, inviteCode: faker.random.alphaNumeric(8) }
    const attrs = { dv: 1, sender, to, type, meta, lang, ...extraAttrs }
    const { data, errors } = await client.mutate(SEND_MESSAGE, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function resendMessageByTestClient (client, message, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!message) throw new Error('no message')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, message: { id: message.id }, ...extraAttrs }
    const { data, errors } = await client.mutate(RESEND_MESSAGE, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function createTestRemoteClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const deviceId = faker.datatype.uuid()
    const appId = faker.datatype.uuid()
    const pushTransport = sample(PUSH_TRANSPORT_TYPES)
    const devicePlatform = sample(DEVICE_PLATFORM_TYPES)
    const attrs = {
        dv: 1,
        sender,
        deviceId,
        appId,
        pushTransport,
        devicePlatform,
        owner: !isEmpty(client.user) ? { connect: { id: client.user.id } } : null,
        ...extraAttrs,
    }
    const obj = await RemoteClient.create(client, attrs)

    return [obj, attrs]
}

async function updateTestRemoteClient (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = {
        dv: 1,
        sender,
        owner: !isEmpty(client.user) ? { disconnectAll: true, connect: { id: client.user.id } } : null,
        ...extraAttrs,
    }
    const obj = await RemoteClient.update(client, id, attrs)

    return [obj, attrs]
}

async function syncRemoteClientByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(SYNC_REMOTE_CLIENT_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function syncRemoteClientWithPushTokenByTestClient (client, extraAttrs = {}) {
    const tokenData = {
        pushToken: getRandomFakeSuccessToken(),
        pushTransport: PUSH_TRANSPORT_FIREBASE,
        ...extraAttrs,
    }
    const payload = getRandomTokenData(tokenData)
    /** Register fake success pushToken in order for user to be able to receive push notifications */
    const [device] = await syncRemoteClientByTestClient(client, payload)

    return [device, payload]
}

async function disconnectUserFromRemoteClientByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function setMessageStatusByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const sender = { dv: 1, fingerprint: faker.datatype.uuid() }
    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(SET_MESSAGE_STATUS_MUTATION, { data: attrs })

    throwIfError(data, errors)

    return [data.result, attrs]
}

async function createTestMessageUserBlackList (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const description = faker.random.alphaNumeric(8)

    const attrs = {
        dv: 1,
        sender,
        description,
        ...extraAttrs,
    }
    const obj = await MessageUserBlackList.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMessageUserBlackList (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MessageUserBlackList.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMessageOrganizationBlackList (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const description = faker.random.alphaNumeric(8)
    const type = INVITE_NEW_EMPLOYEE_MESSAGE_TYPE

    const attrs = {
        dv: 1,
        sender,
        description,
        type,
        ...extraAttrs,
    }
    const obj = await MessageOrganizationBlackList.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMessageOrganizationBlackList (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MessageOrganizationBlackList.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestMessageBatch (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        messageType: sample(MESSAGE_BATCH_TYPE_OPTIONS),
        title: faker.random.alphaNumeric(8),
        message: faker.random.alphaNumeric(8),
        deepLink: faker.random.alphaNumeric(8),
        targets: [get(client, 'user.id', faker.datatype.uuid())],
        ...extraAttrs,
    }
    const obj = await MessageBatch.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMessageBatch (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MessageBatch.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestNotificationUserSetting (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const user = get(client, 'user')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const messageType = MESSAGE_TYPES[random(MESSAGE_TYPES.length - 1)]
    const messageTransport = MESSAGE_TRANSPORTS[random(MESSAGE_TRANSPORTS.length - 1)]

    const attrs = {
        dv: 1,
        sender,
        messageType,
        messageTransport,
        isEnabled: false,
        user: user ? { connect: { id: user.id } } : null,
        ...extraAttrs,
    }
    const obj = await NotificationUserSetting.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNotificationUserSetting (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await NotificationUserSetting.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Message, createTestMessage, updateTestMessage, sendMessageByTestClient,
    resendMessageByTestClient, setMessageStatusByTestClient,
    RemoteClient, createTestRemoteClient, updateTestRemoteClient,
    syncRemoteClientByTestClient, syncRemoteClientWithPushTokenByTestClient,
    disconnectUserFromRemoteClientByTestClient,
    MessageUserBlackList, createTestMessageUserBlackList, updateTestMessageUserBlackList,
    MessageOrganizationBlackList, createTestMessageOrganizationBlackList,
    updateTestMessageOrganizationBlackList,
    MessageBatch, createTestMessageBatch, updateTestMessageBatch,
    NotificationUserSetting, createTestNotificationUserSetting, updateTestNotificationUserSetting,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
