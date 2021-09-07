/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { execGqlWithoutAccess } = require('@condo/domains/organization/utils/serverSchema/utils')
const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationLog: BillingIntegrationLogGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingMeterResource: BillingMeterResourceGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeter: BillingAccountMeterGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeterReading: BillingAccountMeterReadingGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingOrganization: BillingOrganizationGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingReceipt: ResidentBillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingCurrency: BillingCurrencyGQL } = require('@condo/domains/billing/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateServerUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateServerUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateServerUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationLog = generateServerUtils(BillingIntegrationLogGQL)
const BillingProperty = generateServerUtils(BillingPropertyGQL)
const BillingAccount = generateServerUtils(BillingAccountGQL)
const BillingMeterResource = generateServerUtils(BillingMeterResourceGQL)
const BillingAccountMeter = generateServerUtils(BillingAccountMeterGQL)
const BillingAccountMeterReading = generateServerUtils(BillingAccountMeterReadingGQL)
const BillingReceipt = generateServerUtils(BillingReceiptGQL)
const BillingOrganization = generateServerUtils(BillingOrganizationGQL)
const ResidentBillingReceipt = generateServerUtils(ResidentBillingReceiptGQL)

const BillingCurrency = generateServerUtils(BillingCurrencyGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationLog,
    BillingProperty,
    BillingAccount,
    BillingMeterResource,
    BillingAccountMeter,
    BillingAccountMeterReading,
    BillingReceipt,
    BillingOrganization,
    ResidentBillingReceipt,
    BillingCurrency,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
