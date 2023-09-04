/**
 * Generated by `createschema acquiring.Order 'property:Relationship:Property:PROTECT'`
 */

const { Text, Relationship } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/Order')
const { SERVICES_FIELD } = require('@condo/domains/billing/schema/fields/BillingReceipt/Services')
const { TO_PAY_DETAILS_FIELD } = require('@condo/domains/billing/schema/fields/BillingReceipt/ToPayDetailsField')
const { UNIT_TYPE_FIELD, MONEY_AMOUNT_FIELD } = require('@condo/domains/common/schema/fields')

const Order = new GQLListSchema('Order', {
    schemaDoc: 'TODO DOC!',
    fields: {
        property: {
            schemaDoc: 'Property',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            access: { read: access.canReadSensitiveOrderData },
        },

        ticket: {
            schemaDoc: 'Ticket',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        unitName: {
            schemaDoc: 'Flat number / door number of an apartment building (property)',
            type: Text,
            isRequired: true,
        },

        unitType: {
            ...UNIT_TYPE_FIELD,
            isRequired: true,
        },

        accountNumber: {
            schemaDoc: 'Account number of the resident who placed an Order',
            type: Text,
            isRequired: true,
        },

        toPay: {
            ...MONEY_AMOUNT_FIELD,
            schemaDoc: 'Total sum to pay. Usually counts as the sum of all services.',
            isRequired: true,
        },

        toPayDetails: TO_PAY_DETAILS_FIELD,

        services: SERVICES_FIELD,

        number: {
            schemaDoc: 'Order number',
            type: Text,
            isRequired: true,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOrders,
        create: access.canManageOrders,
        update: access.canManageOrders,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Order,
}
