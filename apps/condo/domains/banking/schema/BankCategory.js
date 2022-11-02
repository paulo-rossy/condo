/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File, Url } = require('@keystonejs/fields')
const { Json, LocalizedText } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const access = require('@condo/domains/banking/access/BankCategory')


const BankCategory = new GQLListSchema('BankCategory', {
    schemaDoc: 'Expenses category, that will be associated with transactions and contractors',
    fields: {

        name: {
            schemaDoc: 'TODO DOC!',
            type: LocalizedText,
            isRequired: true,
            template: 'banking.category.*.name',
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
