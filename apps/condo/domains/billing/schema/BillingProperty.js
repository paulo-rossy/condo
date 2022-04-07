/**
 * Generated by `createschema billing.BillingProperty 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; bindingId:Text; address:Text; raw:Json; meta:Json'`
 */

const { Text } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD, IMPORT_ID_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingProperty')
const { Checkbox } = require('@keystonejs/fields')
const { INTEGRATION_CONTEXT_FIELD } = require('./fields/relations')
const { RAW_DATA_FIELD } = require('./fields/common')


const BillingProperty = new GQLListSchema('BillingProperty', {
    schemaDoc: 'All `property` objects from `billing data source`',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        context: INTEGRATION_CONTEXT_FIELD,

        importId: IMPORT_ID_FIELD,

        raw: RAW_DATA_FIELD,

        globalId: {
            schemaDoc: 'A well-known universal identifier that allows you to identify the same objects in different systems. It may differ in different countries. Example: for Russia, the FIAS ID is used',
            type: Text,
            isRequired: true,
            kmigratorOptions: {
                null: false,
            },
        },

        address: {
            schemaDoc: 'The non-modified address from the `billing data source`. Used in `receipt template`',
            type: Text,
            isRequired: true,
        },

        meta: {
            schemaDoc: 'Structured metadata obtained from the `billing data source`. Some of this data is required for use in the `receipt template`. ' +
                'Examples of data keys: `total space of building`, `property beginning of exploitation year`, `has cultural heritage status`, `number of underground floors`, `number of above-ground floors`',
            // TODO(pahaz): research keys!
            type: Json,
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingProperties,
        create: access.canManageBillingProperties,
        update: access.canManageBillingProperties,
        delete: false,
        auth: true,
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['context', 'globalId'],
                name: 'billingProperty_unique_context_globalId',
            },
        ],
    },
})

module.exports = {
    BillingProperty,
}
