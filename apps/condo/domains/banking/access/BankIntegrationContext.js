/**
 * Generated by `createschema banking.BankIntegrationContext 'integration:Relationship:BankIntegration:CASCADE; organization:Relationship:Organization:CASCADE; enabled:Checkbox'`
 */

const get = require('lodash/get')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('../../organization/utils/accessSchema')
const { queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')

async function canReadBankIntegrationContexts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    return {
        OR: [
            { organization: queryOrganizationEmployeeFor(user.id) },
            { organization: queryOrganizationEmployeeFromRelatedOrganizationFor(user.id) },
        ],
    }
}

async function canManageBankIntegrationContexts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId
    if (operation === 'create') {
        organizationId = get(originalInput, ['organization', 'connect', 'id'])
    }
    if (operation === 'update') {
        const item = await getById('BankIntegrationContext', itemId)
        organizationId = get(item, 'organization')
    }

    return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageBankIntegrationContexts')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBankIntegrationContexts,
    canManageBankIntegrationContexts,
}