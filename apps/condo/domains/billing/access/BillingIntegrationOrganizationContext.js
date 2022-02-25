/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

const { checkBillingIntegrationAccessRight } = require('@condo/domains/billing/utils/accessSchema')
const { get } = require('lodash')
const { getById } = require('@core/keystone/schema')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

/**
 * Context could be read either by:
 * 1. Support / Admin
 * 2. Integration service account
 * 3. Integration manager from user's organization
 */
async function canReadBillingIntegrationOrganizationContexts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isSupport || user.isAdmin) return true

    return {
        OR: [
            { organization: { employees_some: { user: { id: user.id }, role: { OR: [{ canReadBillingReceipts: true }, { canManageIntegrations: true }] }, isBlocked: false } } },
            { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } },
        ],
    }
}

/**
 * Context could be created by:
 * 1. Admin
 * 2. Integration manager from user's organization
 *
 * Context could be updated by:
 * 1. Admin / Support
 * 2.
 */
async function canManageBillingIntegrationOrganizationContexts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isAdmin) return true
    if (user.isSupport && !get(originalInput, ['organization', 'connect', 'id'])) return true

    let organizationId, integrationId

    if (operation === 'create') {
        // NOTE: can only be created by the organization integration manager
        organizationId = get(originalInput, ['organization', 'connect', 'id'])
        integrationId = get(originalInput, ['integration', 'connect', 'id'])
        if (!organizationId || !integrationId) return false
    } else if (operation === 'update') {
        // NOTE: can update by the organization integration manager OR the integration account
        if (!itemId) return false
        const context = await getById('BillingIntegrationOrganizationContext', itemId)
        if (!context) return false
        const { organization, integration } = context
        organizationId = organization
        integrationId = integration
    }

    if (!organizationId || !integrationId) return false
    const canManageIntegrations = await checkOrganizationPermission(user.id, organizationId, 'canManageIntegrations')
    if (canManageIntegrations) return true

    return await checkBillingIntegrationAccessRight(user.id, integrationId)
}

/**
 * Payment related fields such as paymentsAllowedFrom or paymentsAllowedTo may ony be created or updated only by:
 * 1. Admin / Support
 */
async function canManagePaymentsRelatedFields ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return true
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingIntegrationOrganizationContexts,
    canManageBillingIntegrationOrganizationContexts,
    canManagePaymentsRelatedFields,
}
