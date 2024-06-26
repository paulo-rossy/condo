/**
 * Generated by `createschema ticket.IncidentChange 'incident:Relationship:Incident:CASCADE;'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { getEmployedOrRelatedOrganizationsByPermissions } = require('@condo/domains/organization/utils/accessSchema')


async function canReadIncidentChanges ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadIncidents')

    return {
        incident: {
            organization: {
                id_in: permittedOrganizations,
            },
        },
    }
}

async function canManageIncidentChanges () {
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadIncidentChanges,
    canManageIncidentChanges,
}
