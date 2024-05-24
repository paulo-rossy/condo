/**
 * Generated by `createschema analytics.ExternalReport 'type:Select:metabase; title:Text; description?:Text; meta?:Json'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const {
    getEmployedOrRelatedOrganizationsByPermissions,
} = require('@condo/domains/organization/utils/accessSchema')

async function canReadExternalReports ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadExternalReports')

    return {
        OR: [
            { organization_is_null: true },
            {
                organization: {
                    id_in: permittedOrganizations,
                },
            },
        ],
    }
}

async function canManageExternalReports ({ authentication: { item: user }, originalInput, operation, itemId }) {
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
    canReadExternalReports,
    canManageExternalReports,
}
