/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const ACQUIRING_INTEGRATION_FIELDS = `{ name setupUrl canGroupReceipts hostUrl supportedBillingIntegrationsGroup ${COMMON_FIELDS} }`
const AcquiringIntegration = generateGqlQueries('AcquiringIntegration', ACQUIRING_INTEGRATION_FIELDS)

const ACQUIRING_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ user { id } integration { id } ${COMMON_FIELDS} }`
const AcquiringIntegrationAccessRight = generateGqlQueries('AcquiringIntegrationAccessRight', ACQUIRING_INTEGRATION_ACCESS_RIGHT_FIELDS)

const FEE_DISTRIBUTION_FIELDS = 'recipient percent minAmount maxAmount category'

const ACQUIRING_INTEGRATION_CONTEXT_FIELDS = `{ status integration { id name setupUrl explicitFeeDistributionSchema { ${FEE_DISTRIBUTION_FIELDS} } } organization { id } state settings ${COMMON_FIELDS} implicitFeeDistributionSchema { ${FEE_DISTRIBUTION_FIELDS} } email reason recipient { bic bankAccount iec tin } }`
const AcquiringIntegrationContext = generateGqlQueries('AcquiringIntegrationContext', ACQUIRING_INTEGRATION_CONTEXT_FIELDS)

const MULTI_PAYMENT_FIELDS = `{ amount explicitFee explicitServiceCharge implicitFee amountWithoutExplicitFee currencyCode withdrawnAt cardNumber paymentWay serviceCategory payerEmail serviceCategory transactionId meta status payments { id } integration { id } recurrentPaymentContext { id } ${COMMON_FIELDS} }`
const MultiPayment = generateGqlQueries('MultiPayment', MULTI_PAYMENT_FIELDS)

const PAYMENT_FIELDS = `{ amount explicitFee explicitServiceCharge implicitFee currencyCode advancedAt accountNumber purpose frozenReceipt receipt { id property { id address } account { unitName } } multiPayment { id transactionId } context { id integration { id name } } status paymentTransaction ${COMMON_FIELDS} period organization { id } recipientBic recipientBankAccount order frozenOrder }`
const Payment = generateGqlQueries('Payment', PAYMENT_FIELDS)

const REGISTER_MULTI_PAYMENT_MUTATION = gql`
    mutation registerMultiPayment ($data: RegisterMultiPaymentInput!) {
        result: registerMultiPayment(data: $data) { dv multiPaymentId webViewUrl feeCalculationUrl directPaymentUrl getCardTokensUrl }
    }
`

const PAYMENTS_FILTER_FIELDS = '{ advancedAt accountNumber address type paymentTransaction status }'
const PAYMENTS_FILTER_TEMPLATE_FIELDS = `{ name employee { id } fields ${PAYMENTS_FILTER_FIELDS} ${COMMON_FIELDS} }`
const PaymentsFilterTemplate = generateGqlQueries('PaymentsFilterTemplate', PAYMENTS_FILTER_TEMPLATE_FIELDS)

const REGISTER_MULTI_PAYMENT_FOR_ONE_RECEIPT_MUTATION = gql`
    mutation registerMultiPaymentForOneReceipt ($data: RegisterMultiPaymentForOneReceiptInput!) {
        result: registerMultiPaymentForOneReceipt(data: $data) { dv multiPaymentId webViewUrl feeCalculationUrl directPaymentUrl anonymousPaymentUrl }
    }
`

const REGISTER_MULTI_PAYMENT_FOR_VIRTUAL_RECEIPT_MUTATION = gql`
    mutation registerMultiPaymentForVirtualReceipt ($data: RegisterMultiPaymentForVirtualReceiptInput!) {
        result: registerMultiPaymentForVirtualReceipt(data: $data) { dv multiPaymentId webViewUrl feeCalculationUrl directPaymentUrl anonymousPaymentUrl }
    }
`

const GENERATE_PAYMENT_LINK_QUERY = gql`
    query generatePaymentLink ($data: GeneratePaymentLinkInput!) {
        result: generatePaymentLink(data: $data) { dv, paymentUrl }
    }
`


const SUM_PAYMENTS_QUERY = gql`
    query _allPaymentsSum ($where: PaymentWhereInput!) {
        result: _allPaymentsSum(where: $where) { sum }
    }
`

const RECURRENT_PAYMENT_CONTEXT_FIELDS = `{ enabled limit autoPayReceipts paymentDay settings { cardId } serviceConsumer { id resident { id user { id } } } billingCategory { id } ${COMMON_FIELDS} }`
const RecurrentPaymentContext = generateGqlQueries('RecurrentPaymentContext', RECURRENT_PAYMENT_CONTEXT_FIELDS)

const RECURRENT_PAYMENT_FIELDS = `{ status tryCount state payAfter billingReceipts { id } recurrentPaymentContext { id } ${COMMON_FIELDS} }`
const RecurrentPayment = generateGqlQueries('RecurrentPayment', RECURRENT_PAYMENT_FIELDS)

const ORDER_FIELDS = `{ property { id } unitName unitType accountNumber toPay toPayDetails services number ticket { id } ${COMMON_FIELDS} }`
const Order = generateGqlQueries('Order', ORDER_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

const EXPORT_PAYMENTS_TO_EXCEL =  gql`
    query exportPaymentsToExcel ($data: ExportPaymentsToExcelInput!) {
        result: exportPaymentsToExcel(data: $data) { status, linkToFile }
    }
`

module.exports = {
    AcquiringIntegration,
    AcquiringIntegrationAccessRight,
    AcquiringIntegrationContext,
    MultiPayment,
    Payment,
    REGISTER_MULTI_PAYMENT_MUTATION,
    EXPORT_PAYMENTS_TO_EXCEL,
    PaymentsFilterTemplate,
    REGISTER_MULTI_PAYMENT_FOR_ONE_RECEIPT_MUTATION,
    REGISTER_MULTI_PAYMENT_FOR_VIRTUAL_RECEIPT_MUTATION,
    GENERATE_PAYMENT_LINK_QUERY,
    SUM_PAYMENTS_QUERY,
    RecurrentPaymentContext,
    RecurrentPayment,
    Order,
/* AUTOGENERATE MARKER <EXPORTS> */
}
