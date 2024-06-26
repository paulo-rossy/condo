/**
 * Generated by `createschema ticket.Incident 'organization; number; details:Text; status; textForResident:Text; workStart:DateTimeUtc; workFinish:DateTimeUtc; isScheduled:Checkbox; isEmergency:Checkbox; hasAllProperties:Checkbox;'`
 */
const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    getEmployedOrRelatedOrganizationsByPermissions,
    checkPermissionsInEmployedOrRelatedOrganizations,
} = require('@condo/domains/organization/utils/accessSchema')


async function canReadIncidents ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadIncidents')

    return {
        organization: {
            id_in: permittedOrganizations,
        },
    }
}

async function canManageIncidents ({ authentication: { item: user }, originalInput, operation, itemId, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId
    if (operation === 'create') {
        organizationId = get(originalInput, 'organization.connect.id', null)
    } else if (operation === 'update') {
        if (!itemId) return false
        const item = await getById('Incident', itemId)
        organizationId = get(item, 'organization', null)
    }
    if (!organizationId) return false

    return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, organizationId, 'canManageIncidents')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadIncidents,
    canManageIncidents,
}
