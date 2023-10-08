/**
 * Generated by `createschema contact.ContactRole 'name:Text'`
 */

const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    queryOrganizationEmployeeFor,
    checkPermissionInUserOrganizationOrRelatedOrganization,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')

async function canReadContactRoles ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    return {
        OR: [
            { organization_is_null: true },
            { organization: queryOrganizationEmployeeFor(user.id, 'canReadContacts') },
            { organization: queryOrganizationEmployeeFromRelatedOrganizationFor(user.id, 'canReadContacts') },
        ],
    }
}

async function canManageContactRoles ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId
    if (operation === 'create') {
        organizationId = get(originalInput, ['organization', 'connect', 'id'])
    } else if (operation === 'update') {
        if (!itemId) return false
        organizationId = get(originalInput, ['organization', 'connect', 'id'])

        if (!organizationId) {
            const contactRole = await getById('ContactRole', itemId)
            organizationId = get(contactRole, 'organization')
        }
    }

    return checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageContactRoles')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadContactRoles,
    canManageContactRoles,
}
