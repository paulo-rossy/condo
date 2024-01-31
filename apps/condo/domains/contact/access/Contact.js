/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 */

const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    canReadObjectsAsB2BAppServiceUser,
    canManageObjectsAsB2BAppServiceUser,
} = require('@condo/domains/miniapp/utils/b2bAppServiceUserAccess')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { SERVICE } = require('@condo/domains/user/constants/common')


async function canReadContacts (args) {
    const { authentication: { item: user } } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isAdmin) return {}

    if (user.type === SERVICE) {
        return await canReadObjectsAsB2BAppServiceUser(args)
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id, 'canReadContacts'),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id, 'canReadContacts'),
            ],
        },
    }
}

async function canManageContacts (args) {
    const { authentication: { item: user }, originalInput, operation, itemId } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return true

    if (user.type === SERVICE) {
        return await canManageObjectsAsB2BAppServiceUser(args)
    }
    
    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])

        return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageContacts')
    }

    if (operation === 'update' && itemId) {
        const contact = await getById('Contact', itemId)
        if (!contact) return false
        const contactOrganization = contact.organization

        return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, contactOrganization, 'canManageContacts')
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
