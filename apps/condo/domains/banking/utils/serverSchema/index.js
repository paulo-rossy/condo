/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/codegen/generate.server.utils')

const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankCategory = generateServerUtils(BankCategoryGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BankCategory,
/* AUTOGENERATE MARKER <EXPORTS> */
}
