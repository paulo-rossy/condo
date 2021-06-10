/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 */

const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const get = require('lodash/get')
const { Contact } = require('../utils/serverSchema')

async function canReadContacts ({ authentication: { item: user } }) {
    if (!user) return false
    if (user.isAdmin) return {}
    return {
        organization: { employees_some: { user: { id: user.id }, isBlocked: false } },
    }
}

async function canManageContacts ({ authentication: { item: user }, originalInput, operation, itemId, context }) {
    if (!user) return false
    if (user.isAdmin) return true
    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        const canManageContacts = await checkOrganizationPermission(user.id, organizationId, 'canManageContacts')
        return canManageContacts
    } else if (operation === 'update') {
        const [contact] = await Contact.getAll(context, { id: itemId })
        if (!contact) {
            return false
        }
        const canManageContacts = await checkOrganizationPermission(user.id, contact.organization.id, 'canManageContacts')
        return canManageContacts
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadContacts,
    canManageContacts,
}
