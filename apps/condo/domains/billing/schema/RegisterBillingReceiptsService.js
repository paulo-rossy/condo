/**
 * Generated by `createservice billing.RegisterBillingReceiptsService --type mutations`
 */

const { get } = require('lodash')

const { GQLError } = require('@open-condo/keystone/errors')
const { getLogger } = require('@open-condo/keystone/logging')
const { find, GQLCustomSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/RegisterBillingReceiptsService')
const {
    RECEIPTS_LIMIT,
    ERRORS,
} = require('@condo/domains/billing/constants/registerBillingReceiptService')
const {
    CategoryResolver,
    RecipientResolver,
    PropertyResolver,
    AccountResolver,
    PeriodResolver,
    ReceiptResolver,
} = require('@condo/domains/billing/schema/resolvers')
const { BillingIntegrationOrganizationContext: BillingContextApi } = require('@condo/domains/billing/utils/serverSchema')

const appLogger = getLogger('condo')
const registerReceiptLogger = appLogger.child({ module: 'register-billing-receipts' })


const RegisterBillingReceiptsService = new GQLCustomSchema('RegisterBillingReceiptsService', {
    types: [
        {
            access: true,
            type: `input RegisterBillingReceiptAddressMetaInput {
                globalId: String
                importId: String
                unitName: String
                unitType: String
            }`,
        },
        {
            access: true,
            type: `input RegisterBillingReceiptAccountMetaInput {
                globalId: String 
                importId: String
                fullName: String
                isClosed: Boolean
                ownerType: BillingAccountOwnerTypeType
            }`,
        },
        {
            access: true,
            type: 'input RegisterBillingReceiptInput ' +
                '{ ' +
                    'importId: String ' +

                    'address: String! ' +
                    'addressMeta: RegisterBillingReceiptAddressMetaInput ' +

                    'accountNumber: String! ' +
                    'accountMeta: RegisterBillingReceiptAccountMetaInput ' +

                    'toPay: String! ' +
                    'toPayDetails: BillingReceiptServiceToPayDetailsFieldInput ' +
                    'services: [BillingReceiptServiceFieldInput] ' +

                    'category: BillingCategoryWhereUniqueInput ' +

                    'month: Int! ' +
                    'year: Int! ' +

                    'tin: String! ' +
                    'routingNumber: String! ' +
                    'bankAccount: String! ' +

                    'raw: JSON ' +

                    // [DEPRECATED] Not used fields will be removed
                    'unitName: String ' +
                    'unitType: String ' +
                    'normalizedAddress: String ' +
                    'fullName: String ' +
                    'tinMeta: JSON ' +
                    'routingNumberMeta: JSON' +
                '}',
        },
        {
            access: true,
            type: 'input RegisterBillingReceiptsInput { dv: Int!, sender: SenderFieldInput!, context: BillingIntegrationOrganizationContextWhereUniqueInput, receipts: [RegisterBillingReceiptInput!]! }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterBillingReceipts,
            schema: 'registerBillingReceipts(data: RegisterBillingReceiptsInput!): [BillingReceipt]',
            resolver: async (parent, args, context = {}) => {
                const { data: { context: billingContextInput, receipts: receiptsInput } } = args
                
                if (receiptsInput.length > RECEIPTS_LIMIT) {
                    throw new GQLError(ERRORS.RECEIPTS_LIMIT_HIT, context)
                }
                const { id: billingContextId } = billingContextInput
                const billingContext = await BillingContextApi.getOne(context, { id: billingContextId })
                if (!billingContextId || !billingContext) {
                    throw new GQLError(ERRORS.BILLING_CONTEXT_NOT_FOUND, context)
                }
                // preserve order for response
                // errors are critical and receipt will be skipped, problems can be fixed later
                let receiptIndex = Object.fromEntries(receiptsInput.map((receiptInput, index) =>
                    ([index, { ...receiptInput, error: null, problems: [] }])
                ))
                let errorsIndex = {}
                const debug = []
                const resolvers = [PeriodResolver, RecipientResolver, PropertyResolver, AccountResolver, CategoryResolver, ReceiptResolver]
                for (const resolver of resolvers) {
                    try {
                        const worker = new resolver({ context, billingContext })
                        await worker.init()
                        const { errorReceipts, receipts } = await worker.processReceipts(receiptIndex)
                        debug.push(...worker.debugMessages)
                        errorsIndex = { ...errorsIndex, ...errorReceipts }
                        receiptIndex = receipts
                    } catch (error) {
                        registerReceiptLogger.error({ msg: 'Resolver fail', payload: { error } })
                    }
                }
                registerReceiptLogger.info({ msg: 'register-receipts-profiler', debug, context: billingContextInput, receiptsCount: receiptsInput.length })
                const receiptIds = Object.values(receiptIndex).map(({ id }) => id)

                const receipts = receiptIds.length ? await find('BillingReceipt', { id_in: receiptIds }) : []
                const receiptsIndex = Object.fromEntries(receipts.map(receipt => ([receipt.id, receipt])))
                return Object.values({ ...receiptIndex, ...errorsIndex }).map(idOrError => {
                    const id = get(idOrError, 'id')
                    if (id) {
                        return Promise.resolve(receiptsIndex[id])
                    } else {
                        return Promise.reject(idOrError)
                    }
                })
            },
        },
    ],
})

module.exports = {
    RegisterBillingReceiptsService,
}
