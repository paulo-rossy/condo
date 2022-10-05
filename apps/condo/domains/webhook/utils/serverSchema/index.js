/**
 * Generated by `createschema webhook.WebHook 'name:Text; url:Url; description:Text'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { WebHook: WebHookGQL } = require('@condo/domains/webhook/gql')
const { WebHookSubscription: WebHookSubscriptionGQL } = require('@condo/domains/webhook/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const WebHook = generateServerUtils(WebHookGQL)
const WebHookSubscription = generateServerUtils(WebHookSubscriptionGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    WebHook,
    WebHookSubscription,
/* AUTOGENERATE MARKER <EXPORTS> */
}
