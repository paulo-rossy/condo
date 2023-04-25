/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'
const BILLING_INTEGRATION_DATA_FORMAT_FIELDS = '{ hasToPayDetails hasServices hasServicesDetails }'
const BILLING_INTEGRATION_FIELDS = `{ name shortDescription gallery price detailedDescription logo { publicUrl } group developer partnerUrl appUrl contextDefaultStatus dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} isHidden ${COMMON_FIELDS} }`
const BillingIntegration = generateGqlQueries('BillingIntegration', BILLING_INTEGRATION_FIELDS)

const BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ integration { id name } user { id name } ${COMMON_FIELDS} }`
const BillingIntegrationAccessRight = generateGqlQueries('BillingIntegrationAccessRight', BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS)

const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS = `{ integration { id name appUrl billingPageTitle currencyCode dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} } organization { id tin name country } settings state status lastReport currentProblem { id title message } ${COMMON_FIELDS} }`
const BillingIntegrationOrganizationContext = generateGqlQueries('BillingIntegrationOrganizationContext', BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS)

const BILLING_INTEGRATION_PROBLEM_FIELDS = `{ context { id } title message meta ${COMMON_FIELDS} }`
const BillingIntegrationProblem = generateGqlQueries('BillingIntegrationProblem', BILLING_INTEGRATION_PROBLEM_FIELDS)

const BILLING_PROPERTY_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} property { id } importId address addressKey raw globalId meta ${COMMON_FIELDS} }`
const BillingProperty = generateGqlQueries('BillingProperty', BILLING_PROPERTY_FIELDS)

const BILLING_ACCOUNT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id, address } number unitName unitType raw globalId meta fullName ${COMMON_FIELDS} }`
const BillingAccount = generateGqlQueries('BillingAccount', BILLING_ACCOUNT_FIELDS)

const BILLING_RECIPIENT_FIELDS = `{ context { id } importId tin iec bic bankAccount purpose isApproved meta name ${COMMON_FIELDS} }`
const BillingRecipient = generateGqlQueries('BillingRecipient', BILLING_RECIPIENT_FIELDS)

const BILLING_CATEGORY_FIELDS = `{ name nameNonLocalized ${COMMON_FIELDS} }`
const BillingCategory = generateGqlQueries('BillingCategory', BILLING_CATEGORY_FIELDS)

const BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS = 'toPayDetails { charge formula balance recalculation privilege penalty paid }'
const BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS = BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS.replace('}', 'volume tariff measure }')
const BILLING_RECEIPT_SERVICE_FIELDS = `services { id name toPay ${BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS} }`
const BILLING_RECEIPT_RECIPIENT_FIELDS = 'recipient { tin iec bic bankAccount }'
const BILLING_RECEIPT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id, address } account { id, number, unitType, unitName, fullName } period toPay printableNumber ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} ${BILLING_RECEIPT_SERVICE_FIELDS} receiver { id tin iec bic bankAccount isApproved } ${BILLING_RECEIPT_RECIPIENT_FIELDS} ${COMMON_FIELDS} category ${BILLING_CATEGORY_FIELDS} invalidServicesError }`
const BillingReceipt = generateGqlQueries('BillingReceipt', BILLING_RECEIPT_FIELDS)

const RESIDENT_BILLING_RECEIPTS_FIELDS = `{ id ${BILLING_RECEIPT_RECIPIENT_FIELDS} period toPay paid ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} ${BILLING_RECEIPT_SERVICE_FIELDS} printableNumber serviceConsumer { id paymentCategory } currencyCode category { id name } isPayable }`
const ResidentBillingReceipt = generateGqlQueries('ResidentBillingReceipt', RESIDENT_BILLING_RECEIPTS_FIELDS)

const REGISTER_BILLING_RECEIPTS_MUTATION = gql`
    mutation registerBillingReceipts ($data: RegisterBillingReceiptsInput!) {
        result: registerBillingReceipts(data: $data) ${BILLING_RECEIPT_FIELDS}
    }
`

const SEARCH_BILLING_RECEIPTS_WITHOUT_CONSUMER_QUERY = gql`
    query searchBillingAccountsWithoutConsumer ($data: SearchBillingAccountsWithoutConsumerInput!) {
        obj: searchBillingAccountsWithoutConsumer(data: $data) { residentsAccounts { resident { id } accounts { number } } }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationProblem,
    BillingProperty,
    BillingAccount,
    BillingReceipt,
    ResidentBillingReceipt,
    RESIDENT_BILLING_RECEIPTS_FIELDS,
    BillingRecipient,
    BillingCategory,
    REGISTER_BILLING_RECEIPTS_MUTATION,
    SEARCH_BILLING_RECEIPTS_WITHOUT_CONSUMER_QUERY,

    /* AUTOGENERATE MARKER <EXPORTS> */
}
