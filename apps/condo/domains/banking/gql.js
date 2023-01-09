/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const BANK_CATEGORY_FIELDS = `{ name ${COMMON_FIELDS} }`
const BankCategory = generateGqlQueries('BankCategory', BANK_CATEGORY_FIELDS)

// TODO(antonal): maybe we can avoid querying related BankCategory for each BankCostItem. For example, keep whole list of BankCategory in React Context and pull categories from it when needed
const BANK_COST_ITEM_FIELDS = `{ name category { id name } ${COMMON_FIELDS} }`
const BankCostItem = generateGqlQueries('BankCostItem', BANK_COST_ITEM_FIELDS)

const BANK_ACCOUNT_FIELDS = `{ organization { id } integrationContext { id enabled } tin country routingNumber number currencyCode approvedAt approvedBy { id name } importId territoryCode bankName meta ${COMMON_FIELDS} }`
const BankAccount = generateGqlQueries('BankAccount', BANK_ACCOUNT_FIELDS)

const BANK_CONTRACTOR_ACCOUNT_FIELDS = `{ name organization { id } costItem { id } tin country routingNumber number currencyCode importId territoryCode bankName meta ${COMMON_FIELDS} }`
const BankContractorAccount = generateGqlQueries('BankContractorAccount', BANK_CONTRACTOR_ACCOUNT_FIELDS)

const BANK_INTEGRATION_FIELDS = `{ name ${COMMON_FIELDS} }`
const BankIntegration = generateGqlQueries('BankIntegration', BANK_INTEGRATION_FIELDS)

const BANK_INTEGRATION_CONTEXT_FIELDS = `{ integration { id } organization { id } enabled ${COMMON_FIELDS} }`
const BankIntegrationContext = generateGqlQueries('BankIntegrationContext', BANK_INTEGRATION_CONTEXT_FIELDS)

const BANK_TRANSACTION_FIELDS = `{ account { id } contractorAccount { id } costItem { id } integrationContext { id enabled } organization { id } number date amount currencyCode purpose dateWithdrawed dateReceived meta importId importRemoteSystem ${COMMON_FIELDS} }`
const BankTransaction = generateGqlQueries('BankTransaction', BANK_TRANSACTION_FIELDS)

const CREATE_BANK_ACCOUNT_REQUEST_MUTATION = gql`
    mutation createBankAccountRequest ($data: CreateBankAccountRequestInput!) {
        result: createBankAccountRequest(data: $data) { status id }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BankAccount,
    BankCategory,
    BankCostItem,
    BankContractorAccount,
    BankIntegration,
    BankIntegrationContext,
    BankTransaction,
    CREATE_BANK_ACCOUNT_REQUEST_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
