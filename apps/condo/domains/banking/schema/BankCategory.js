/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File, Url } = require('@keystonejs/fields')
const { Json } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const access = require('@condo/domains/banking/access/BankCategory')


const BankCategory = new GQLListSchema('BankCategory', {
    // TODO(codegen): write doc for the BankCategory domain model!
    schemaDoc: 'TODO DOC!',
    fields: {

        name: {
            // TODO(codegen): write doc for BankCategory.name field!
            schemaDoc: 'TODO DOC!',
            type: Text,
            isRequired: true,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBankCategories,
        create: access.canManageBankCategories,
        update: access.canManageBankCategories,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BankCategory,
}
