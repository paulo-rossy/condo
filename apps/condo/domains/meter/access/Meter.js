/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; account?:Relationship:BillingAccount:SET_NULL; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

const { getMetersDataFromRequestBody } = require('@condo/domains/meter/utils/serverSchema')
const { ServiceConsumer } = require('@condo/domains/resident/utils/serverSchema')
const { Meter } = require('../utils/serverSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { Property } = require('@condo/domains/property/utils/serverSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { queryOrganizationEmployeeFromRelatedOrganizationFor, queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { Resident: ResidentServerUtils } = require('@condo/domains/resident/utils/serverSchema')
const { get } = require('lodash')


async function canReadMeters ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin || user.isSupport) return {}

    const userId = user.id

    if (user.type === RESIDENT) {
        const { property: propertyFromQuery, unitName: unitNameFromQuery, meter: meterFromQuery } = getMetersDataFromRequestBody(context)
        let property = propertyFromQuery
        let unitName = unitNameFromQuery

        if (!property || !unitName) {
            const [meter] = await Meter.getAll(context, {
                ...meterFromQuery,
                deletedAt: null,
            })

            const propertyId = get(meter, ['property', 'id'], null)
            property = { id: propertyId }
            unitName = get(meter, 'unitName', null)
        }

        const [resident] = await ResidentServerUtils.getAll(context, {
            user: { id: userId },
            property: { ...property, deletedAt: null },
            unitName,
            deletedAt: null,
        })
        const residentId = get(resident, 'id', null)
        const serviceConsumers = await ServiceConsumer.getAll(context, {
            resident: { id: residentId, deletedAt: null },
            deletedAt: null,
        })
        const serviceConsumerAccounts = serviceConsumers.map(serviceConsumer => serviceConsumer.accountNumber)

        return {
            property,
            unitName,
            accountNumber_in: serviceConsumerAccounts,
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(userId),
                queryOrganizationEmployeeFromRelatedOrganizationFor(userId),
            ],
        },
    }
}

async function canManageMeters ({ authentication: { item: user }, originalInput, operation, itemId, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true

    if (operation === 'create') {
        const organizationIdFromMeter = get(originalInput, ['organization', 'connect', 'id'])

        if (!organizationIdFromMeter) {
            return false
        }
        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        const [property] = await Property.getAll(context, { id: propertyId, deletedAt: null })

        if (!property) {
            return false
        }
        const organizationIdFromProperty = get(property, ['organization', 'id'])

        if (organizationIdFromMeter !== organizationIdFromProperty)
            return false

        return await checkPermissionInUserOrganizationOrRelatedOrganization(context, user.id, organizationIdFromMeter, 'canManageMeters')

    } else if (operation === 'update') {
        if (!itemId) {
            return false
        }

        const [meter] = await Meter.getAll(context, { id: itemId, deletedAt: null })
        if (!meter)
            return false

        // if we pass property then we need check that this Property is in the organization in which the Meter is located
        const organizationIdFromMeter = get(meter, ['organization', 'id'])
        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        if (propertyId) {
            const [property] = await Property.getAll(context, { id: propertyId, deletedAt: null })
            if (!property)
                return false

            const organizationIdFromProperty = get(property, ['organization', 'id'])
            if (organizationIdFromMeter !== organizationIdFromProperty)
                return false
        }

        return await checkPermissionInUserOrganizationOrRelatedOrganization(context, user.id, organizationIdFromMeter, 'canManageMeters')
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
