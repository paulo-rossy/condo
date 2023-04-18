/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const Big = require('big.js')

const { generateServerUtils } = require('@open-condo/codegen/generate.server.utils')
const { execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')
const { find } = require('@open-condo/keystone/schema')

const { PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS } = require('@condo/domains/acquiring/constants/payment')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationProblem: BillingIntegrationProblemGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingReceipt: ResidentBillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingRecipient: BillingRecipientGQL } = require('@condo/domains/billing/gql')
const { BillingCategory: BillingCategoryGQL } = require('@condo/domains/billing/gql')
const { REGISTER_BILLING_RECEIPTS_MUTATION } = require('@condo/domains/billing/gql')
const { SEARCH_BILLING_RECEIPTS_WITHOUT_CONSUMER_QUERY } = require('@condo/domains/billing/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateServerUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateServerUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateServerUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationProblem = generateServerUtils(BillingIntegrationProblemGQL)
const BillingProperty = generateServerUtils(BillingPropertyGQL)
const BillingAccount = generateServerUtils(BillingAccountGQL)
const BillingReceipt = generateServerUtils(BillingReceiptGQL)
const ResidentBillingReceipt = generateServerUtils(ResidentBillingReceiptGQL)
const BillingRecipient = generateServerUtils(BillingRecipientGQL)
const BillingCategory = generateServerUtils(BillingCategoryGQL)

async function registerBillingReceipts (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    // TODO(codegen): write registerBillingReceipts serverSchema guards

    return await execGqlWithoutAccess(context, {
        query: REGISTER_BILLING_RECEIPTS_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerBillingReceipts',
        dataPath: 'result',
    })
}

/**
 * Sums up all DONE or WITHDRAWN payments for billingReceipt for <organization> with <accountNumber> and <period>
 * @param context {Object}
 * @param organizationId {string}
 * @param accountNumber {string}
 * @param bic {string}
 * @param bankAccount {string}
 * @param period {string}
 * @return {Promise<*>}
 */
const getPaymentsSum = async (context, organizationId, accountNumber, period, bic, bankAccount) => {
    const payments = await  find('Payment', {
        organization: { id: organizationId },
        accountNumber: accountNumber,
        period: period,
        status_in: [PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS],
        recipientBic: bic,
        recipientBankAccount: bankAccount,
    })
    return payments.reduce((total, current) => (Big(total).plus(current.amount)), 0).toFixed(8).toString()
}

async function searchBillingReceiptsWithoutConsumer (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEARCH_BILLING_RECEIPTS_WITHOUT_CONSUMER_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to searchBillingReceiptsWithoutConsumer',
        dataPath: 'obj',
    })
}

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
    BillingRecipient,
    BillingCategory,
    registerBillingReceipts,
    getPaymentsSum,
    searchBillingReceiptsWithoutConsumer,
/* AUTOGENERATE MARKER <EXPORTS> */
}
