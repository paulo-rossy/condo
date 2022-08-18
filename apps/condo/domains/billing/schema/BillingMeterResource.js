/**
 * Generated by `createschema billing.BillingMeterResource 'name:Text'`
 */

const { Text } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const access = require('@condo/domains/billing/access/BillingMeterResource')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')


const BillingMeterResource = new GQLListSchema('BillingMeterResource', {
    schemaDoc: 'Meter `resource types`',
    fields: {
        name: {
            schemaDoc: 'The name of the `resource types`',
            type: Text,
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingMeterResources,
        create: access.canManageBillingMeterResources,
        update: access.canManageBillingMeterResources,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingMeterResource,
}
