/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { find } = require('@open-condo/keystone/schema')

const { CONTEXT_FINISHED_STATUS: ACQUIRING_CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { canManageBillingEntityWithContext } = require('@condo/domains/billing/utils/accessSchema')
const { CONTEXT_FINISHED_STATUS: BILLING_CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const { RESIDENT } = require('@condo/domains/user/constants/common')

// We allow only receipts:
//    1. With matching Property (compare by addressKey)
//    2. For organizations with Finished AcquiringContext
//    3. With Finished BillingContext
async function buildResidentAccessToReceiptsQuery (userId) {
    if (!userId) {
        return false
    }
    const residents = await find('Resident', { user: { id: userId }, deletedAt: null })
    if (!residents || residents.length === 0) {
        return false
    }
    let serviceConsumers = await find('ServiceConsumer', {
        resident: { id_in: residents.map(({ id }) => id) },
        deletedAt: null,
    })
    if (!serviceConsumers || serviceConsumers.length === 0) {
        return false
    }
    const organizationIds = serviceConsumers.map(({ organization }) => organization )
    // Exclude all serviceConsumers for organizations without AcquiringContext in Finished status
    const organizationsWithContract = (await find('AcquiringIntegrationContext', {
        organization: { id_in: organizationIds, deletedAt: null },
        integration: { deletedAt: null },
        status: ACQUIRING_CONTEXT_FINISHED_STATUS,
        deletedAt: null,
    })).map(({ organization }) => organization)
    serviceConsumers = serviceConsumers.filter(({ organization }) => organizationsWithContract.includes(organization))
    if (!serviceConsumers.length) {
        return false
    }
    // Properties created by organizations
    const propertiesForOrganizations = Object.fromEntries(
        await Promise.all(
            organizationsWithContract.map(
                async organizationId => [organizationId,  (
                    await find('Property', {
                        organization: { id: organizationId }, deletedAt: null,
                    })).map(({ addressKey }) => addressKey)]
            )
        )
    )
    return {
        OR: serviceConsumers.map(
            serviceConsumer => ({
                AND: [
                    {
                        account: {
                            number: serviceConsumer.accountNumber,
                            property: { addressKey_in: propertiesForOrganizations[serviceConsumer.organization] },
                            deletedAt: null,
                        },
                        context: {
                            organization: { id: serviceConsumer.organization },
                            deletedAt: null,
                            status: BILLING_CONTEXT_FINISHED_STATUS,
                        },
                        deletedAt: null,
                    }],
            }),
        ),
    }
}

async function canReadBillingReceipts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return {}

    if (user.type === RESIDENT) {
        return await buildResidentAccessToReceiptsQuery(user.id)
    } else {
        return {
            OR: [
                { context: { organization: { employees_some: { user: { id: user.id }, role: { canReadBillingReceipts: true }, deletedAt: null, isBlocked: false } } } },
                { context: { organization: { relatedOrganizations_some: { from: { employees_some: { user: { id: user.id }, role: { canReadBillingReceipts: true }, deletedAt: null, isBlocked: false } } } } } },
                { context: { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } } },
            ],
        }
    }
}

async function canReadSensitiveBillingReceiptData ({ authentication: { item: user } }) {
    return user.type !== RESIDENT
}

async function canManageBillingReceipts (args) {
    return await canManageBillingEntityWithContext(args)
}

const readOnlyAccess = { create: false, read: true, update: false }

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingReceipts,
    canManageBillingReceipts,
    canReadSensitiveBillingReceiptData,
    buildResidentAccessToReceiptsQuery,
    readOnlyAccess,
}
