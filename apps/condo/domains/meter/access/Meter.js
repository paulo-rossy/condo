/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; account?:Relationship:BillingAccount:SET_NULL; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

const { get } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getByCondition } = require('@open-condo/keystone/schema')

const { getAvailableResidentMeters } = require('@condo/domains/meter/utils/serverSchema')
const {
    canReadObjectsAsB2BAppServiceUser,
    canManageObjectsAsB2BAppServiceUser,
} = require('@condo/domains/miniapp/utils/b2bAppServiceUserAccess')
const {
    checkPermissionsInEmployedOrRelatedOrganizations,
    getEmployedOrRelatedOrganizationsByPermissions,
} = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT, SERVICE } = require('@condo/domains/user/constants/common')


async function canReadMeters (args) {
    const { authentication: { item: user }, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    
    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const availableMeters = await getAvailableResidentMeters(user.id)
        const availableMetersIds = availableMeters.map(meter => meter.id)

        return {
            id_in: availableMetersIds,
            deletedAt: null,
        }
    }

    if (user.type === SERVICE) {
        return await canReadObjectsAsB2BAppServiceUser(args)
    }

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadMeters')

    return {
        organization: {
            id_in: permittedOrganizations,
        },
    }
}

async function canManageMeters (args) {
    const { authentication: { item: user }, originalInput, operation, itemId, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type === SERVICE) {
        return await canManageObjectsAsB2BAppServiceUser(args)
    }

    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        if (!organizationId) return false
        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        const property = await getByCondition('Property', {
            id: propertyId,
            deletedAt: null,
        })
        if (!property) return false
        if (organizationId !== get(property, 'organization')) return false

        return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, organizationId, 'canManageMeters')
    }

    if (operation === 'update' && itemId) {
        const meter = await getByCondition('Meter', {
            id: itemId,
            deletedAt: null,
        })
        if (!meter) return false
        // if we pass property then we need check that this Property is in the organization in which the Meter is located
        const meterOrganization = get(meter, 'organization')
        if (!meterOrganization) return false

        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        if (propertyId) {
            const property = await getByCondition('Property', {
                id: propertyId,
                deletedAt: null,
            })
            if (!property) return false
            if (meterOrganization !== get(property, 'organization')) return false
        }

        return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, meterOrganization, 'canManageMeters')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMeters,
    canManageMeters,
}
