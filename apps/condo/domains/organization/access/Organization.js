/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 */
const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { get, uniq, compact } = require('lodash')
const access = require('@condo/keystone/access')
const { find } = require('@condo/keystone/schema')

async function canReadOrganizations ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const userResidents = await find('Resident', { user:{ id: user.id }, deletedAt: null })
        if (!userResidents.length) return false
        const residentOrganizations = compact(userResidents.map(resident => get(resident, 'organization')))
        const residentsIds = userResidents.map(resident => resident.id)
        const userServiceConsumers = await find('ServiceConsumer', {
            resident: { id_in: residentsIds },
            deletedAt: null,
        })
        const serviceConsumerOrganizations = userServiceConsumers.map(sc => sc.organization)
        const organizations = [...residentOrganizations, ...serviceConsumerOrganizations]
        if (organizations.length) {
            return {
                id_in: uniq(organizations),
            }
        }

        return false
    }

    const acquiringIntegrationRights = await find('AcquiringIntegrationAccessRight', {
        user: { id: user.id },
        deletedAt: null,
    })

    // TODO(DOMA-1700): Better way to get access for acquiring integrations?
    if (acquiringIntegrationRights && acquiringIntegrationRights.length) {
        return {}
    }

    //TODO:Исправить для billing integration
    return {
        OR: [
            { employees_some: { user: { id: user.id } } },
            { relatedOrganizations_some: { from: { employees_some: { user: { id: user.id } } } } },
        ],
    }
}

async function canManageOrganizations ({ authentication: { item: user }, operation }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isSupport || user.isAdmin) return true

    if (operation === 'create') {
        return false
    } else if (operation === 'update') {
        // user is inside employee list and is not blocked
        return {
            employees_some: { user: { id: user.id }, role: { canManageOrganization: true }, isBlocked: false, deletedAt: null },
        }
    }
}

const canAccessToImportField = {
    read: access.userIsNotResidentUser,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessOnlyAdminField = {
    read: access.userIsAdmin,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOrganizations,
    canManageOrganizations,
    canAccessToImportField,
    canAccessOnlyAdminField,
}
