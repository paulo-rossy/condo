/**
 * This file is autogenerated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Message } = require('./Message')
const { SendMessageService } = require('./SendMessageService')
const { RemoteClient } = require('./RemoteClient')
const { SyncRemoteClientService } = require('./SyncRemoteClientService')
const { DisconnectUserFromRemoteClientService } = require('./DisconnectUserFromRemoteClientService')
const { SetMessageStatusService } = require('./SetMessageStatusService')
const { MessageUserBlackList } = require('./MessageUserBlackList')
const { MessageOrganizationBlackList } = require('./MessageOrganizationBlackList')
const { MessageOrganizationWhiteList } = require('./MessageOrganizationWhiteList')
const { MarketingMessage } = require('./MarketingMessage')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Message,
    SendMessageService,
    RemoteClient,
    SyncRemoteClientService,
    DisconnectUserFromRemoteClientService,
    SetMessageStatusService,
    MessageUserBlackList,
    MessageOrganizationBlackList,
    MessageOrganizationWhiteList,
    MarketingMessage,
/* AUTOGENERATE MARKER <EXPORTS> */
}
