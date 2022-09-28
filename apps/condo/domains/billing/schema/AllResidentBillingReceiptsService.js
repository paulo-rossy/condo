/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const dayjs = require('dayjs')
const { pick, get } = require('lodash')
const Big = require('big.js')
const { getAcquiringIntegrationContextFormula, FeeDistribution } = require('@condo/domains/acquiring/utils/serverSchema/feeDistribution')
const { BillingReceipt } = require('@condo/domains/billing/utils/serverSchema')
const access = require('@condo/domains/billing/access/AllResidentBillingReceipts')
const { PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS } = require('@condo/domains/acquiring/constants/payment')
const {
    BILLING_RECEIPT_RECIPIENT_FIELD_NAME,
    BILLING_RECEIPT_TO_PAY_DETAILS_FIELD_NAME,
    BILLING_RECEIPT_SERVICES_FIELD,
} = require('../constants/constants')
const { generateQuerySortBy } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { generateQueryWhereInput } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { GQLCustomSchema, find } = require('@condo/keystone/schema')


/**
 * Sums all DONE or WITHDRAWN payments for billingReceipt for <organization> with <accountNumber> and <period>
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


const ALL_RESIDENT_BILLING_RECEIPTS_FIELDS = {
    id: 'ID',
    period: 'String',
    toPay: 'String',
    printableNumber: 'String',
    serviceConsumer: 'ServiceConsumer',
}


const AllResidentBillingReceiptsService = new GQLCustomSchema('AllResidentBillingReceiptsService', {
    types: [
        {
            access: true,
            type: generateQueryWhereInput('ResidentBillingReceipt', ALL_RESIDENT_BILLING_RECEIPTS_FIELDS),
        },
        {
            access: true,
            type: generateQuerySortBy('ResidentBillingReceipt', Object.keys(ALL_RESIDENT_BILLING_RECEIPTS_FIELDS)),
        },
        {
            access: true,
            type: `type ResidentBillingReceiptOutput { dv: String!, recipient: ${BILLING_RECEIPT_RECIPIENT_FIELD_NAME}!, id: ID!, period: String!, toPay: String!, paid: String!, explicitFee: String!, printableNumber: String, toPayDetails: ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELD_NAME}, services: ${BILLING_RECEIPT_SERVICES_FIELD}, serviceConsumer: ServiceConsumer! currencyCode: String! category: BillingCategory! isPayable: Boolean! }`,
        },
    ],

    queries: [
        {
            access: access.canGetAllResidentBillingReceipts,
            schema: 'allResidentBillingReceipts (where: ResidentBillingReceiptWhereInput, first: Int, skip: Int, sortBy: [SortResidentBillingReceiptsBy!]): [ResidentBillingReceiptOutput]',
            resolver: async (parent, args, context = {}) => {
                const { where, first, skip, sortBy } = args

                const serviceConsumerWhere = get(where, 'serviceConsumer', {})
                const receiptsWhere = pick(where, ['id', 'period', 'toPay', 'printableNumber'])

                const userId = get(context, ['authedItem', 'id'])

                // We can't really use getting service consumer with all access here, since we do not show billingAccount to our user
                const GET_ONLY_OWN_SERVICE_CONSUMER_WHERE = { user: { id: userId } }
                if (!serviceConsumerWhere.resident) {
                    serviceConsumerWhere.resident = GET_ONLY_OWN_SERVICE_CONSUMER_WHERE
                    serviceConsumerWhere.deletedAt = null
                } else {
                    serviceConsumerWhere.resident.user = GET_ONLY_OWN_SERVICE_CONSUMER_WHERE.user
                    serviceConsumerWhere.deletedAt = null
                }

                const serviceConsumers = (await find('ServiceConsumer', serviceConsumerWhere))
                    .filter(consumer => get(consumer, 'billingAccount'))
                if (!Array.isArray(serviceConsumers) || !serviceConsumers.length) {
                    return []
                }

                //
                // Get basic receipts representation
                //
                const processedReceipts = []
                for (const serviceConsumer of serviceConsumers) {

                    const receiptsQuery = {
                        ...receiptsWhere,
                        account: { number: serviceConsumer.accountNumber, deletedAt: null },
                        context: { organization: { id: serviceConsumer.organization }, deletedAt: null },
                        deletedAt: null,
                    }
                    const receiptsForConsumer = await BillingReceipt.getAll(
                        context,
                        receiptsQuery,
                        {
                            sortBy, first, skip,
                        }
                    )
                    receiptsForConsumer.forEach(receipt => processedReceipts.push({
                        id: receipt.id,
                        dv: receipt.dv,
                        category: receipt.category,
                        recipient: receipt.recipient,
                        receiver: receipt.receiver,
                        account: receipt.account,
                        period: receipt.period,
                        toPay: receipt.toPay,
                        toPayDetails: receipt.toPayDetails,
                        services: receipt.services,
                        printableNumber: receipt.printableNumber,
                        serviceConsumer: serviceConsumer,
                        currencyCode: get(receipt, ['context', 'integration', 'currencyCode'], null),
                    }))
                }

                //
                // Set receipt.isPayable field
                // We select only one latest receipt from each receiver + accountNumber by period
                // Example:
                // - John pays for cold water and electricity
                // - John got the receipt for March for water
                // - John got the receipt for March for electricity
                // - John got the receipt for April for water
                // - In result of AllResidentBillingReceipts John should get 2 receipts:
                // - April water receipt,
                // - March electricity receipt
                //
                const receiptsByAccountAndRecipient = {}
                for (const receipt of processedReceipts) {
                    const accountId = get(receipt, ['account', 'id'])
                    const recipientId = get(receipt, ['receiver', 'id'])
                    const categoryId = get(receipt, ['category', 'id'])
                    const key = accountId + '-' + recipientId + '-' + categoryId

                    const period = dayjs(get(receipt, ['period']), 'YYYY-MM-DD')

                    if (!(key in receiptsByAccountAndRecipient)) {
                        receiptsByAccountAndRecipient[key] = receipt.id
                        continue
                    }

                    // If we have a receipt with later period -- we take it
                    const existingRecipientPeriod = dayjs(get(receiptsByAccountAndRecipient[key], 'period'), 'YYYY-MM-DD')
                    if (existingRecipientPeriod < period) {
                        receiptsByAccountAndRecipient[key] = receipt.id
                    }
                }

                const payableReceipts = Object.values(receiptsByAccountAndRecipient)
                processedReceipts.forEach(receipt => {
                    receipt.isPayable = payableReceipts.includes(receipt.id)
                })

                //
                // Set receipt.paid field and calculate fees
                //
                const receiptsWithPayments = []
                for (const receipt of processedReceipts) {
                    const organizationId = get(receipt.serviceConsumer, ['organization'])
                    const accountNumber = get(receipt.serviceConsumer, ['accountNumber'])
                    const paid = await getPaymentsSum(
                        context,
                        organizationId,
                        accountNumber,
                        get(receipt, 'period', null),
                        get(receipt, ['recipient', 'bic'], null),
                        get(receipt, ['recipient', 'bankAccount'], null)
                    )
                    const acquiringContextId = get(receipt, ['serviceConsumer', 'acquiringIntegrationContext'], null)
                    const toPay = get(receipt, ['toPay'], 0)
                    let fee = '0'
                    if (acquiringContextId) {
                        const formula = await getAcquiringIntegrationContextFormula(context, acquiringContextId)
                        const feeCalculator = new FeeDistribution(formula)
                        const { explicitFee } = feeCalculator.calculate(Big(toPay).minus(Big(paid)).toFixed(2))
                        fee = String(explicitFee)
                    }
                    receiptsWithPayments.push(({
                        ...receipt,
                        paid,
                        explicitFee: fee,
                    }))
                }
                return receiptsWithPayments
            },
        },
    ],
})

module.exports = {
    AllResidentBillingReceiptsService,
}
