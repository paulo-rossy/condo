/**
 * Generated by `createservice banking.ImportBankTransactionsService`
 */
const { get } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('../../organization/utils/accessSchema')

async function canImportBankTransactions ({ args, authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const organizationId = get(args, ['data', 'organizationId'])
    const canManageBankAccounts = checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageBankAccounts')
    if (!canManageBankAccounts) {
        return false
    }
    const propertyId = get(args, ['data', 'propertyId'])
    const property = await getById('Property', propertyId)
    if (!property) {
        return false
    }
    if (property.organization !== organizationId) {
        return false
    }

    return true
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canImportBankTransactions,
}