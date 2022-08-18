/**
 * Generated by `createschema billing.BillingAccount 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; bindingId:Text; number:Text; unit:Text; raw:Json; meta:Json'`
 */

const { Text } = require('@keystonejs/fields')
const { Json } = require('@condo/keystone/fields')
const { GQLListSchema, getById } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { IMPORT_ID_FIELD, UNIT_TYPE_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingAccount')
const {
    JSON_EXPECT_OBJECT_ERROR,
    UNEQUAL_CONTEXT_ERROR,
} = require('@condo/domains/common/constants/errors')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')
const { RAW_DATA_FIELD } = require('./fields/common')
const { INTEGRATION_CONTEXT_FIELD, BILLING_PROPERTY_FIELD } = require('./fields/relations')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')


const BillingAccount = new GQLListSchema('BillingAccount', {
    schemaDoc: 'All `account` objects from `billing data source`. In close account cases, these objects should be soft deleted',
    fields: {

        context: INTEGRATION_CONTEXT_FIELD,

        importId: IMPORT_ID_FIELD,

        raw: RAW_DATA_FIELD,

        property: BILLING_PROPERTY_FIELD,

        globalId: {
            schemaDoc: 'A well-known universal identifier that allows you to identify the same objects in different systems. It may differ in different countries. ' +
                'Example: for Russia, the dom.gosuslugi.ru account number is used',
            type: Text,
            isRequired: false,
            kmigratorOptions: {
                null: true,
            },
        },

        number: {
            schemaDoc: 'Account number',
            type: Text,
            isRequired: true,
        },

        // TODO(pahaz): make a link to property domain fields
        unitName: {
            schemaDoc: 'Flat number / door number of an apartment building (property)',
            type: Text,
            isRequired: true,
        },

        unitType: {
            ...UNIT_TYPE_FIELD,
            isRequired: true,
        },

        fullName: {
            schemaDoc: 'Full name of the account holder',
            type: Text,
            isRequired: false,
        },

        meta: {
            schemaDoc: 'Structured metadata obtained from the `billing data source`. Some of this data is required for use in the `receipt template`. ' +
                'Examples of data keys: `property unit number`, `floor`, `entrance`, `is parking`',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    const { resolvedData, fieldPath, addFieldValidationError } = args
                    if (!resolvedData.hasOwnProperty(fieldPath)) return // skip if on value
                    const value = resolvedData[fieldPath]
                    if (value === null) return // null is OK
                    if (!hasValidJsonStructure(args, true, 1, {}))
                        return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`)
                },
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingAccounts,
        create: access.canManageBillingAccounts,
        update: access.canManageBillingAccounts,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const { context: accountContextId, property: propertyId } = newItem

            const property = await getById('BillingProperty', propertyId)
            const { context: propertyContextId } = property
            if (accountContextId !== propertyContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:property:context] Context is not equal to property.context`)
            }
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['context', 'globalId'],
                name: 'billingAccount_unique_context_globalId',
            },
        ],
    },
})

module.exports = {
    BillingAccount,
}
