/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

const { Text, Relationship, Checkbox } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingIntegration')
const { DEFAULT_BILLING_INTEGRATION_GROUP } = require('@condo/domains/billing/constants/constants')
const { CURRENCY_CODE_FIELD } = require('@condo/domains/common/schema/fields')
const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')
const { GALLERY_FIELD } = require('@condo/domains/miniapp/schema/fields/galleryField')
const {
    LOGO_FIELD,
    APPS_FILE_ADAPTER,
    DEVELOPER_FIELD,
    PARTNER_URL_FIELD,
    SHORT_DESCRIPTION_FIELD,
    APP_DETAILS_FIELD,
    IFRAME_URL_FIELD,
    IS_HIDDEN_FIELD,
    CONTEXT_DEFAULT_STATUS_FIELD,
    DISPLAY_PRIORITY_FIELD,
    LABEL_FIELD,
    PRICE_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')

const { DATA_FORMAT_FIELD } = require('./fields/BillingIntegration/DataFormat')


const logoMetaAfterChange = getFileMetaAfterChange(APPS_FILE_ADAPTER, 'logo')

const BillingIntegration = new GQLListSchema('BillingIntegration', {
    schemaDoc: 'Identification of the `integration component` which responsible for getting data from the `billing data source` and delivering the data to `this API`. Examples: tap-1c, ... ',
    fields: {
        name: {
            schemaDoc: 'The name of the `integration component` that the developer remembers',
            type: Text,
            isRequired: true,
        },

        logo: LOGO_FIELD,

        shortDescription: SHORT_DESCRIPTION_FIELD,

        developer: DEVELOPER_FIELD,

        partnerUrl: PARTNER_URL_FIELD,

        detailedDescription: APP_DETAILS_FIELD,

        appUrl: IFRAME_URL_FIELD,

        billingPageTitle: {
            schemaDoc: 'This title is shown on /billing page, usually contains word "Billing"',
            type: Text,
            isRequired: false,
        },

        group: {
            schemaDoc: 'Billing group which this billing is part of. Used to restrict certain billings from certain acquirings"',
            type: Text,
            isRequired: true,
            defaultValue: DEFAULT_BILLING_INTEGRATION_GROUP,
        },

        contextDefaultStatus: CONTEXT_DEFAULT_STATUS_FIELD,

        dataFormat: DATA_FORMAT_FIELD,

        currencyCode: {
            ...CURRENCY_CODE_FIELD,
            schemaDoc: 'Currency which this billing uses',
            isRequired: true,
        },

        // settings data structure config (settings field for BillingIntegrationOrganizationContext)
        // state data structure config (state field for BillingIntegrationOrganizationContext)
        // log messages translation and adaptation (message field for BillingIntegrationLog)
        accessRights: {
            type: Relationship,
            ref: 'BillingIntegrationAccessRight.integration',
            many: true,
        },

        isTrustedBankAccountSource: {
            schemaDoc: 'If checked, then bank account objects created by this billing are automatically approved. E.g government-controlled billing',
            type: Checkbox,
            isRequired: true,
            defaultValue: false,
        },

        // TODO(DOMA-1647): Need better solution, used to test UPS flow for now
        isHidden: IS_HIDDEN_FIELD,

        displayPriority: DISPLAY_PRIORITY_FIELD,
        label: LABEL_FIELD,
        gallery: GALLERY_FIELD,
        price: PRICE_FIELD,
    },
    hooks: {
        afterChange: logoMetaAfterChange,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingIntegrations,
        create: access.canManageBillingIntegrations,
        update: access.canManageBillingIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingIntegration,
}
