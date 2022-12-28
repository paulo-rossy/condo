/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { BankAccount: BankAccountGQL } = require('@condo/domains/banking/gql')
const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
const { BankCostItem: BankCostItemGQL } = require('@condo/domains/banking/gql')
const { BankContractorAccount: BankContractorAccountGQL } = require('@condo/domains/banking/gql')
const { BankIntegration: BankIntegrationGQL } = require('@condo/domains/banking/gql')
const { CREATE_BANK_ACCOUNT_REQUEST_MUTATION } = require('@condo/domains/banking/gql')
const { BankIntegrationContext: BankIntegrationContextGQL } = require('@condo/domains/banking/gql')
const { BankTransaction: BankTransactionGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankAccount = generateServerUtils(BankAccountGQL)
const BankCategory = generateServerUtils(BankCategoryGQL)
const BankCostItem = generateServerUtils(BankCostItemGQL)
const BankContractorAccount = generateServerUtils(BankContractorAccountGQL)
const BankIntegration = generateServerUtils(BankIntegrationGQL)
const BankIntegrationContext = generateServerUtils(BankIntegrationContextGQL)
const BankTransaction = generateServerUtils(BankTransactionGQL)
async function createBankAccountRequest (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: CREATE_BANK_ACCOUNT_REQUEST_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to createBankAccountRequest',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BankAccount,
    BankCategory,
    BankCostItem,
    BankContractorAccount,
    BankIntegration,
    BankIntegrationContext,
    BankTransaction,
    createBankAccountRequest,
/* AUTOGENERATE MARKER <EXPORTS> */
}
