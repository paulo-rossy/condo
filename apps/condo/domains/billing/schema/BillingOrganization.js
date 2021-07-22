/**
 * Generated by `createschema billing.BillingOrganization 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; tin:Text; iec:Text; bic:Text; checkNumber:Text;'`
 */

const { Text } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingOrganization')
const { INTEGRATION_CONTEXT_FIELD } = require('./fields')

const BillingOrganization = new GQLListSchema('BillingOrganization', {
    schemaDoc: 'An organization which can accept payments from the BillingAccount',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        context: INTEGRATION_CONTEXT_FIELD,

        tin: {
            schemaDoc: 'Taxpayer Identification Number. In Russia: INN',
            type: Text,
            isRequired: true,
        },

        iec: {
            schemaDoc: ' Industrial Enterprise Classification. In Russia: KPP',
            type: Text,
            isRequired: true,
        },

        bic: {
            schemaDoc: 'Bank Identification Code. In Russia: BIK',
            type: Text,
            isRequired: true,
        },

        checkNumber: {
            schemaDoc: 'Number of the checking account of organization',
            type: Text,
            isRequired: true,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingOrganizations,
        create: access.canManageBillingOrganizations,
        update: access.canManageBillingOrganizations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingOrganization,
}
