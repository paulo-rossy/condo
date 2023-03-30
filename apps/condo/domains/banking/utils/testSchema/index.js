/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const dayjs = require('dayjs')

const { bulidValidRequisitesForRuBankAccount } = require('@condo/domains/banking/utils/testSchema/bankAccount')
const { RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')
const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
const { BankCostItem: BankCostItemGQL } = require('@condo/domains/banking/gql')
const { BankAccount: BankAccountGQL } = require('@condo/domains/banking/gql')
const { BankContractorAccount: BankContractorAccountGQL } = require('@condo/domains/banking/gql')
const { BankIntegration: BankIntegrationGQL, CREATE_BANK_ACCOUNT_REQUEST_MUTATION } = require('@condo/domains/banking/gql')
const { BankIntegrationAccountContext: BankIntegrationAccountContextGQL } = require('@condo/domains/banking/gql')
const { BankTransaction: BankTransactionGQL } = require('@condo/domains/banking/gql')
const { BankSyncTask: BankSyncTaskGQL } = require('@condo/domains/banking/gql')
const { BankIntegrationOrganizationContext: BankIntegrationOrganizationContextGQL } = require('@condo/domains/banking/gql')
const { BankIntegrationAccessRight: BankIntegrationAccessRightGQL } = require('@condo/domains/banking/gql')
const { PREDICT_TRANSACTION_CLASSIFICATION_QUERY } = require('@condo/domains/banking/gql')
const { BankAccountReport: BankAccountReportGQL } = require('@condo/domains/banking/gql')
const { EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM } = require('@condo/domains/banking/constants')
const { BankAccountReportTask: BankAccountReportTaskGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankCategory = generateGQLTestUtils(BankCategoryGQL)
const BankCostItem = generateGQLTestUtils(BankCostItemGQL)
const BankAccount = generateGQLTestUtils(BankAccountGQL)
const BankContractorAccount = generateGQLTestUtils(BankContractorAccountGQL)

const BankIntegration = generateGQLTestUtils(BankIntegrationGQL)
const BankIntegrationAccountContext = generateGQLTestUtils(BankIntegrationAccountContextGQL)
const BankTransaction = generateGQLTestUtils(BankTransactionGQL)
const BankSyncTask = generateGQLTestUtils(BankSyncTaskGQL)
const BankIntegrationOrganizationContext = generateGQLTestUtils(BankIntegrationOrganizationContextGQL)
const BankIntegrationAccessRight = generateGQLTestUtils(BankIntegrationAccessRightGQL)
const BankAccountReport = generateGQLTestUtils(BankAccountReportGQL)
const BankAccountReportTask = generateGQLTestUtils(BankAccountReportTaskGQL)
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

async function createTestBankCostItem (client, category, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!category || !category.id) throw new Error('no category.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        category: { connect: { id: category.id } },
        isOutcome: faker.random.boolean(),
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCostItem.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankCostItem (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCostItem.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankAccount (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const requisitesForRuBankAccount = bulidValidRequisitesForRuBankAccount()
    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        importId: faker.datatype.uuid(),
        ...requisitesForRuBankAccount,
        ...extraAttrs,
    }
    const obj = await BankAccount.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankContractorAccount (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        name: faker.lorem.word(),
        tin: String(faker.datatype.number()),
        country: RUSSIA_COUNTRY,
        routingNumber: '044525256',
        number: 'n1',
        currencyCode: 'RUB',
        importId: faker.random.alphaNumeric(24),
        territoryCode: faker.datatype.number().toString(),
        bankName: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankContractorAccount.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankContractorAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        tin: String(faker.datatype.number()),
        country: RUSSIA_COUNTRY,
        importId: faker.random.alphaNumeric(24),
        territoryCode: faker.datatype.number().toString(),
        bankName: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankContractorAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankIntegration (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegration.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegration (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegration.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankIntegrationAccountContext (client, integration, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await BankIntegrationAccountContext.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegrationAccountContext (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegrationAccountContext.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankTransaction (client, account, contractorAccount, integrationContext, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!account || !account.id) throw new Error('no account.id')
    if (!contractorAccount || !contractorAccount.id) throw new Error('no contractorAccount.id')
    if (!integrationContext || !integrationContext.id) throw new Error('no integrationContext.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        account: { connect: { id: account.id } },
        contractorAccount: { connect: { id: contractorAccount.id } },
        integrationContext: { connect: { id: integrationContext.id } },
        organization: { connect: { id: organization.id } },
        number: faker.random.number().toString(),
        date: dayjs(faker.date.recent()).format('YYYY-MM-DD'),
        amount: faker.datatype.float({ precision: 0.01 }).toString(),
        isOutcome: faker.random.boolean(),
        currencyCode: 'RUB',
        purpose: faker.lorem.word(),
        importId: faker.datatype.uuid(),
        importRemoteSystem: faker.lorem.word(),
        meta: { someVendor: { v: '1', data: {} } },
        ...extraAttrs,
    }
    const obj = await BankTransaction.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankTransaction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }

    const obj = await BankTransaction.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankSyncTask (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    if (client.user) {
        attrs.user = { connect: { id: client.user.id } }
    }
    const obj = await BankSyncTask.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankSyncTask (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankSyncTask.update(client, id, attrs)
    return [obj, attrs]
}

async function createBankAccountRequestByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(CREATE_BANK_ACCOUNT_REQUEST_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: CREATE_BANK_ACCOUNT_REQUEST_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function importBankTransactionsByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(IMPORT_BANK_TRANSACTIONS_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: IMPORT_BANK_TRANSACTIONS_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}
async function createTestBankIntegrationOrganizationContext (client, integration, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await BankIntegrationOrganizationContext.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegrationOrganizationContext (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegrationOrganizationContext.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankIntegrationAccessRight (client, integration, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration.id')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        user: { connect: { id: user.id } },
        ...extraAttrs,
    }
    const obj = await BankIntegrationAccessRight.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegrationAccessRight (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegrationAccessRight.update(client, id, attrs)
    return [obj, attrs]
}


async function predictTransactionClassificationByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!extraAttrs.purpose) throw new Error('no purpose')

    const attrs = {
        ...extraAttrs,
    }
    const { data, errors } = await client.query(PREDICT_TRANSACTION_CLASSIFICATION_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
async function createTestBankAccountReport (client, account, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!account || !account.id) throw new Error('no account.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        account: { connect: { id: account.id } },
        organization: { connect: { id: organization.id } },
        version: 1,
        template: EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM,
        period: '2023-03',
        amount: faker.random.number().toString(),
        amountAt: dayjs().toISOString(),
        publishedAt: dayjs().toISOString(),
        totalIncome: faker.random.number().toString(),
        totalOutcome: faker.random.number().toString(),
        data: {
            categoryGroups: [{
                id: faker.random.uuid(),
                name: faker.lorem.word(2),
                costItemGroups: [{
                    id: faker.random.uuid(),
                    name: faker.lorem.word(2),
                    sum: faker.random.number(),
                }],
            }],
        },
        ...extraAttrs,
    }
    const obj = await BankAccountReport.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankAccountReport (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankAccountReport.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankAccountReportTask (client, account, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!account || !account.id) throw new Error('no account.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestBankAccountReportTask logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        account: { connect: { id: account.id } },
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await BankAccountReportTask.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankAccountReportTask (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestBankAccountReportTask logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankAccountReportTask.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    BankCategory, createTestBankCategory, updateTestBankCategory,
    BankCostItem, createTestBankCostItem, updateTestBankCostItem,
    BankAccount, createTestBankAccount, updateTestBankAccount,
    BankContractorAccount, createTestBankContractorAccount, updateTestBankContractorAccount,
    BankIntegration, createTestBankIntegration, updateTestBankIntegration,
    BankIntegrationAccountContext, createTestBankIntegrationAccountContext, updateTestBankIntegrationAccountContext,
    BankTransaction, createTestBankTransaction, updateTestBankTransaction,
    BankSyncTask, createTestBankSyncTask, updateTestBankSyncTask,
    createBankAccountRequestByTestClient,
    importBankTransactionsByTestClient,
    BankIntegrationOrganizationContext, createTestBankIntegrationOrganizationContext, updateTestBankIntegrationOrganizationContext,
    BankIntegrationAccessRight, createTestBankIntegrationAccessRight, updateTestBankIntegrationAccessRight,
    predictTransactionClassificationByTestClient,
    BankAccountReport, createTestBankAccountReport, updateTestBankAccountReport,
    BankAccountReportTask, createTestBankAccountReportTask, updateTestBankAccountReportTask,
/* AUTOGENERATE MARKER <EXPORTS> */
}
