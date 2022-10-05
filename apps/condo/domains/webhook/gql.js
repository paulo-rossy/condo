/**
 * Generated by `createschema webhook.WebHook 'name:Text; url:Url; description:Text'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const WEB_HOOK_FIELDS = `{ name url user { id } description ${COMMON_FIELDS} }`
const WebHook = generateGqlQueries('WebHook', WEB_HOOK_FIELDS)

const WEB_HOOK_SUBSCRIPTION_FIELDS = `{ webhook ${WEB_HOOK_FIELDS} lastUpdatedAt lastUpdatedAtOffset model fields filters ${COMMON_FIELDS} }`
const WebHookSubscription = generateGqlQueries('WebHookSubscription', WEB_HOOK_SUBSCRIPTION_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    WebHook,
    WebHookSubscription,
/* AUTOGENERATE MARKER <EXPORTS> */
}
