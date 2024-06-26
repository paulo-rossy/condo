/**
 * Generated by `createschema ticket.IncidentProperty 'incident:Relationship:Incident:CASCADE; property:Relationship:Property:PROTECT; propertyAddress:Text; propertyAddressMeta;'`
 */
const get = require('lodash/get')

const { isSoftDelete } = require('@open-condo/keystone/access')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    getEmployedOrRelatedOrganizationsByPermissions,
    checkPermissionsInEmployedOrRelatedOrganizations,
} = require('@condo/domains/organization/utils/accessSchema')


async function canReadIncidentProperties ({ authentication: { item: user }, context }) {
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

async function canManageIncidentProperties ({ authentication: { item: user }, context, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (operation === 'update' && !isSoftDelete(originalInput)) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId
    if (operation === 'create') {
        const incidentId = get(originalInput, 'incident.connect.id')
        const incident = await getById('Incident', incidentId)
        organizationId = get(incident, 'organization', null)
    } else if (operation === 'update') {
        if (!itemId) return false
        const incidentProperty = await getById('IncidentProperty', itemId)
        organizationId = get(incidentProperty, 'organization', null)
    }

    if (!organizationId) return false

    return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, organizationId, 'canManageIncidents')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadIncidentProperties,
    canManageIncidentProperties,
}
