/**
 * Generated by `createschema billing.BillingRecipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; context?:Relationship:BillingIntegrationOrganizationContext:SET_NULL; bankAccount:Text; name?:Text; approved:Checkbox; meta?:Json;'`
 */

const { get } = require('lodash')
const { isEmpty } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { find, getById } = require('@open-condo/keystone/schema')

const { canReadBillingEntity, checkBillingIntegrationsAccessRights } = require('@condo/domains/billing/utils/accessSchema')
const { STAFF, SERVICE } = require('@condo/domains/user/constants/common')

async function canReadBillingRecipients ({ authentication }) {
    return await canReadBillingEntity(authentication)
}

// TODO(dkovyazin): Remove STAFF access to create or update BillingRecipient
async function canManageBillingRecipients ({ authentication: { item: user }, operation, originalInput, itemId, listKey }) {

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    let contextId

    if (operation === 'create') {
        contextId = get(originalInput, ['context', 'connect', 'id'])
    } else if (operation === 'update') {
        if (!itemId) return false
        const itemWithContext = await getById(listKey, itemId)
        contextId = get(itemWithContext, ['context'])
        if (!contextId) return false
    }

    const organizationContext = await getById('BillingIntegrationOrganizationContext', contextId)
    if (!organizationContext) return false

    const { integration: integrationId } = organizationContext

    if (user.type === STAFF && operation === 'create') {
        const employees = await find('OrganizationEmployee', {
            user: { id: user.id },
            organization: { id: organizationContext.organization },
            isBlocked: false,
            role: { canManageIntegrations: true },
            deletedAt: null,
        })
        if (!isEmpty(employees)) {
            return true
        }
    }

    return await checkBillingIntegrationsAccessRights(user.id, [integrationId])
}


async function canManageIsApprovedField ({ authentication: { item: user } }) {
    return !!(user.isAdmin || user.isSupport || user.type === SERVICE)
}
/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingRecipients,
    canManageBillingRecipients,
    canManageIsApprovedField,
}
