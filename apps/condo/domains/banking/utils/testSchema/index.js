/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { generateGQLTestUtils } = require('@open-condo/codegen/generate.test.utils')

const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankCategory = generateGQLTestUtils(BankCategoryGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestBankCategory (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCategory.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankCategory (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCategory.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    BankCategory, createTestBankCategory, updateTestBankCategory,
/* AUTOGENERATE MARKER <EXPORTS> */
}
