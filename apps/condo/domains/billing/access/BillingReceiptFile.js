/**
 * Generated by `createschema billing.BillingReceiptFile 'file:File;context:Relationship:BillingIntegrationOrganizationContext:CASCADE;receipt:Relationship:BillingReceipt:CASCADE;controlSum:Text'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { canReadBillingEntity, canManageBillingEntityWithContext } = require('@condo/domains/billing/utils/accessSchema')
const {
    getEmployedOrRelatedOrganizationsByPermissions,
} = require('@condo/domains/organization/utils/accessSchema')
const { STAFF, RESIDENT, SERVICE } = require('@condo/domains/user/constants/common')

const { canReadBillingReceipts } = require('./BillingReceipt')


async function canReadBillingReceiptFiles ({ authentication, context }) {
    const user = authentication.item
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === STAFF) {
        const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, [])

        return {
            context: {
                organization: {
                    id_in: permittedOrganizations,
                },
            },
        }
    }

    if (user.type === RESIDENT) {
        // We allow access to those residents, who has access to related BillingReceipt
        const condition = await canReadBillingReceipts({ authentication })
        if (!condition) {
            return false
        }
        return {
            receipt: condition,
        }
    }

    return await canReadBillingEntity(authentication)
}

async function canManageBillingReceiptFiles (args) {
    return await canManageBillingEntityWithContext(args)
}

async function hasAccessToSensitiveDataFile ({ authentication:  { item: user } }) {
    // Access to fields will be checked after main access check
    // So we can allow all service users who has passed so far
    return (user.isAdmin || user.isSupport || user.type === SERVICE)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingReceiptFiles,
    canManageBillingReceiptFiles,
    hasAccessToSensitiveDataFile,
}
