/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const gql = require('graphql-tag')

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const MESSAGE_FIELDS = `{ organization { id } user { id email phone } email emailFrom phone lang type meta status processingMeta sentAt deliveredAt readAt uniqKey ${COMMON_FIELDS} }`
const Message = generateGqlQueries('Message', MESSAGE_FIELDS)

const SEND_MESSAGE = gql`
    mutation sendMessage ($data: SendMessageInput!) {
        result: sendMessage(data: $data) { status id }
    }
`

const RESEND_MESSAGE = gql`
    mutation resendMessage ($data: ResendMessageInput!) {
        result: resendMessage(data: $data) { status id }
    }
`

const REMOTE_CLIENT_FIELDS = `{deviceId appId pushToken pushTransport devicePlatform meta owner { id, type } ${COMMON_FIELDS}}`

const RemoteClient = generateGqlQueries('RemoteClient', REMOTE_CLIENT_FIELDS)

const SYNC_REMOTE_CLIENT_MUTATION = gql`
    mutation syncRemoteClient ($data: SyncRemoteClientInput!) {
        result: syncRemoteClient(data: $data) ${REMOTE_CLIENT_FIELDS}
    }
`

const DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION = gql`
    mutation disconnectUserFromRemoteClient ($data: DisconnectUserFromRemoteClientInput!) {
        result: disconnectUserFromRemoteClient(data: $data) { status }
    }
`

const SET_MESSAGE_STATUS_MUTATION = gql`
    mutation setMessageStatus ($data: SetMessageStatusInput!) {
        result: setMessageStatus(data: $data) { status }
    }
`

const MESSAGE_USER_BLACK_LIST_FIELDS = `{ user { id } phone email description ${COMMON_FIELDS} }`
const MessageUserBlackList = generateGqlQueries('MessageUserBlackList', MESSAGE_USER_BLACK_LIST_FIELDS)

const MESSAGE_ORGANIZATION_BLACK_LIST_FIELDS = `{ organization { id } description ${COMMON_FIELDS} }`
const MessageOrganizationBlackList = generateGqlQueries('MessageOrganizationBlackList', MESSAGE_ORGANIZATION_BLACK_LIST_FIELDS)

const MESSAGE_ORGANIZATION_WHITE_LIST_FIELDS = `{ organization { id } description ${COMMON_FIELDS} }`
const MessageOrganizationWhiteList = generateGqlQueries('MessageOrganizationWhiteList', MESSAGE_ORGANIZATION_WHITE_LIST_FIELDS)

const MARKETING_MESSAGE_FIELDS = `{ transportType title message deepLink idList status processingMeta ${COMMON_FIELDS} }`
const MarketingMessage = generateGqlQueries('MarketingMessage', MARKETING_MESSAGE_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Message,
    SEND_MESSAGE,
    RESEND_MESSAGE,
    RemoteClient,
    SYNC_REMOTE_CLIENT_MUTATION,
    DISCONNECT_USER_FROM_REMOTE_CLIENT_MUTATION,
    SET_MESSAGE_STATUS_MUTATION,
    MessageUserBlackList,
    MessageOrganizationBlackList,
    MessageOrganizationWhiteList,
    MarketingMessage,
/* AUTOGENERATE MARKER <EXPORTS> */
}
