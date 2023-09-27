/**
 * Generated by `createschema banking.BankAccountReportTask 'account:Relationship:BankAccount:CASCADE; organization:Relationship:Organization:CASCADE; status:Select:processing,completed,cancelled,errored; progress:Integer; meta:Json;'`
 */

const { Relationship, Integer, Select } = require('@keystonejs/fields')
const { values } = require('lodash')

const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/BankAccountReportTask')
const { generateReportsTask } = require('@condo/domains/banking/tasks')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const { BANK_SYNC_TASK_STATUS } = require('../constants')


const BankAccountReportTask = new GQLListSchema('BankAccountReportTask', {
    schemaDoc: 'Information about the report generation process',
    fields: {

        account: {
            schemaDoc: 'Bank account for which the current report generation operation is running.',
            type: Relationship,
            ref: 'BankAccount',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        organization: ORGANIZATION_OWNED_FIELD,

        status: {
            schemaDoc: 'Status of current generation operation',
            type: Select,
            options: values(BANK_SYNC_TASK_STATUS),
            defaultValue: BANK_SYNC_TASK_STATUS.PROCESSING,
            isRequired: true,
        },

        progress: {
            schemaDoc: 'Progress of current generation operation',
            type: Integer,
        },

        user: {
            schemaDoc: 'User that requested this operation. Will be used for read access checks to display all tasks somewhere and to display progress indicator of ongoing generating task for current user',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            knexOptions: { isNotNullable: true },
            access: {
                read: true,
                create: true,
                update: false,
            },
        },

        meta: {
            schemaDoc: 'Additional data, specific to used integration',
            type: Json,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    hooks: {
        afterChange: async (args) => {
            const { updatedItem, operation } = args
            if (operation === 'create') {
                await generateReportsTask.delay(updatedItem.id)
            }
        },
    },
    access: {
        read: access.canReadBankAccountReportTasks,
        create: access.canManageBankAccountReportTasks,
        update: access.canManageBankAccountReportTasks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BankAccountReportTask,
}
