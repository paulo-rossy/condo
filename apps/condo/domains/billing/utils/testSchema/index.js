/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const get = require('lodash/get')
const { throwIfError } = require(
    '@condo/domains/common/utils/codegeneration/generate.test.utils')
const { makeLoggedInAdminClient } = require("@core/keystone/test.utils");
const { createTestOrganizationEmployee, createTestOrganizationEmployeeRole } = require("@condo/domains/organization/utils/testSchema");
const { makeClientWithNewRegisteredAndLoggedInUser } = require("@condo/domains/user/utils/testSchema");
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestOrganization } = require("@condo/domains/organization/utils/testSchema");
const { generateGQLTestUtils } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationLog: BillingIntegrationLogGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingMeterResource: BillingMeterResourceGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeter: BillingAccountMeterGQL } = require('@condo/domains/billing/gql')
const { BillingAccountMeterReading: BillingAccountMeterReadingGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingOrganization: BillingOrganizationGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingReceipt: ResidentBillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingRecipient: BillingRecipientGQL } = require('@condo/domains/billing/gql')
const { BillingCategory: BillingCategoryGQL } = require('@condo/domains/billing/gql')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { registerServiceConsumerByTestClient } = require('@condo/domains/resident/utils/testSchema')
const { registerResidentByTestClient } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithResidentUser, makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')
const { REGISTER_BILLING_RECEIPTS_MUTATION } = require('@condo/domains/billing/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateGQLTestUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateGQLTestUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateGQLTestUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationLog = generateGQLTestUtils(BillingIntegrationLogGQL)
const BillingProperty = generateGQLTestUtils(BillingPropertyGQL)
const BillingAccount = generateGQLTestUtils(BillingAccountGQL)
const BillingMeterResource = generateGQLTestUtils(BillingMeterResourceGQL)
const BillingAccountMeter = generateGQLTestUtils(BillingAccountMeterGQL)
const BillingAccountMeterReading = generateGQLTestUtils(BillingAccountMeterReadingGQL)
const BillingReceipt = generateGQLTestUtils(BillingReceiptGQL)
const BillingOrganization = generateGQLTestUtils(BillingOrganizationGQL)
const ResidentBillingReceipt = generateGQLTestUtils(ResidentBillingReceiptGQL)
const BillingRecipient = generateGQLTestUtils(BillingRecipientGQL)
const BillingCategory = generateGQLTestUtils(BillingCategoryGQL)
/* AUTOGENERATE MARKER <CONST> */

const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')

async function createTestBillingIntegration (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.company.companyName().replace(/ /, '-').toUpperCase() + ' TEST BILLING INTEGRATION'
    const currencyCode = 'RUB'

    const attrs = {
        dv: 1,
        sender,
        name,
        currencyCode,
        instruction: faker.datatype.string(),
        connectedMessage: faker.company.catchPhrase(),
        isHidden: true,
        shortDescription: faker.commerce.productDescription(),
        developer: faker.company.companyName(),
        ...extraAttrs,
    }
    const obj = await BillingIntegration.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegration (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegration.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationAccessRight (client, integration, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration')
    if (!user || !user.id) throw new Error('no user')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        user: { connect: { id: user.id } },
        ...extraAttrs,
    }
    const obj = await BillingIntegrationAccessRight.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationAccessRight (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationAccessRight.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationOrganizationContext (client, organization, integration, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!integration || !integration.id) throw new Error('no integration.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const settings = { dv: 1, 'billing data source': 'https://api.dom.gosuslugi.ru/' }
    const state = { dv: 1 }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        organization: { connect: { id: organization.id } },
        settings,
        state,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationOrganizationContext.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationOrganizationContext (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationOrganizationContext.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingIntegrationLog (client, context, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const type = faker.lorem.words().replace(/[ ]/g, '_').toUpperCase()
    const message = faker.lorem.sentences()
    const meta = { username: faker.lorem.word(), server: faker.internet.url(), ip: faker.internet.ipv6() }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        type, message, meta,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationLog.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingIntegrationLog (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingIntegrationLog.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingProperty (client, context, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        raw: { foo: faker.lorem.words() },
        globalId: faker.random.alphaNumeric(10),
        address: faker.address.streetAddress(true),
        meta: {
            test: 123,
        },
        ...extraAttrs,
    }
    const obj = await BillingProperty.create(client, attrs)
    return [obj, attrs]
}

async function createTestBillingProperties (client, contexts, extraAttrsArray = []) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrsArray = []

    for (let i = 0; i < contexts.length; i++) {
        attrsArray.push({
            data: {
                dv: 1,
                sender,
                context: { connect: { id: contexts[i].id } },
                raw: { foo: faker.lorem.words() },
                globalId: faker.random.alphaNumeric(10),
                address: faker.address.streetAddress(true),
                meta: {
                    test: 123,
                },
                ...get(extraAttrsArray, `${i}`, {})
            }
        })
    }
    const objs = await BillingProperty.createMany(client, attrsArray)
    return [objs, attrsArray]
}

async function updateTestBillingProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingProperty.update(client, id, attrs)
    return [obj, attrs]
}

async function updateTestBillingProperties (client, attrsArray) {
    if (!client) throw new Error('no client')
    if (!attrsArray.every(element => element.id)) throw new Error('no id for all elements')
    if (!attrsArray.every(element => element.data)) throw new Error('no data for all elements')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const extendedAttrsArray = attrsArray.map(element => ({
        id: element.id,
        data: {
            dv: 1,
            sender,
            ...element.data,
        }
    }))

    const obj = await BillingProperty.updateMany(client, extendedAttrsArray)
    return [obj, extendedAttrsArray]
}

async function createTestBillingAccount (client, context, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        raw: { foo: faker.lorem.words() },
        number: faker.random.alphaNumeric(8),
        unitName: faker.random.alphaNumeric(8),
        unitType: FLAT_UNIT_TYPE,
        meta: {
            dv: 1,
            test: 123,
        },
        ...extraAttrs,
    }
    const obj = await BillingAccount.create(client, attrs)
    return [obj, attrs]
}

async function createTestBillingAccounts (client, contexts, properties, extraAttrsArray = []) {
    if (!client) throw new Error('no client')
    if (!Array.isArray(contexts) || !contexts.length) throw new Error('no contexts')
    if (!Array.isArray(properties) || !properties.length) throw new Error('no properties')
    if (contexts.length !== properties.length) throw new Error('Contexts and properties not equal length')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrsArray = []

    for (let i = 0; i < contexts.length; i++) {
        attrsArray.push({
            data: {
                dv: 1,
                sender,
                context: { connect: { id: contexts[i].id } },
                property: { connect: { id: properties[i].id } },
                raw: { foo: faker.lorem.words() },
                number: faker.random.alphaNumeric(8),
                unitName: faker.random.alphaNumeric(8),
                unitType: FLAT_UNIT_TYPE,
                meta: {
                    dv: 1,
                    test: 123,
                },
                ...get(extraAttrsArray, `${i}`, {})
            }
        })
    }
    const objs = await BillingAccount.createMany(client, attrsArray)
    return [objs, attrsArray]
}

async function updateTestBillingAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccounts (client, attrsArray) {
    if (!client) throw new Error('no client')
    if (!attrsArray.every(element => element.id)) throw new Error('no id for all elements')
    if (!attrsArray.every(element => element.data)) throw new Error('no data for all elements')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const extendedAttrsArray = attrsArray.map(element => ({
        id: element.id,
        data: {
            dv: 1,
            sender,
            ...element.data,
        }
    }))

    const obj = await BillingAccount.updateMany(client, extendedAttrsArray)
    return [obj, extendedAttrsArray]
}

async function createTestBillingMeterResource (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.words(),
        ...extraAttrs,
    }
    const obj = await BillingMeterResource.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingMeterResource (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingMeterResource.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingAccountMeter (client, context, property, account, resource, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        raw: { foo: faker.lorem.words() },
        meta: {
            dv: 1,
        },
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        resource: { connect: { id: resource.id } },
        ...extraAttrs,
    }
    const obj = await BillingAccountMeter.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccountMeter (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccountMeter.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingAccountMeterReading (client, context, property, account, meter, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        meter: { connect: { id: meter.id } },
        raw: { foo: faker.lorem.words() },
        period: '2021-11-01',
        date: new Date(),
        value1: faker.datatype.number(),
        value2: faker.datatype.number(),
        value3: faker.datatype.number(),
        ...extraAttrs,
    }
    const obj = await BillingAccountMeterReading.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingAccountMeterReading (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingAccountMeterReading.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingReceipt (client, context, property, account, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        property: { connect: { id: property.id } },
        account: { connect: { id: account.id } },
        raw: { foo: faker.lorem.words() },
        period: '2021-12-01',
        importId: faker.random.alphaNumeric(8),
        toPay: (faker.datatype.number() + 50).toString(),
        recipient: createTestRecipient(),
        services: [
            {
                id: faker.datatype.number().toString(),
                name: faker.random.alphaNumeric(),
                toPay: faker.datatype.number().toString(),
                toPayDetails: {
                    formula: "charge + penalty",
                    charge: faker.datatype.number().toString(),
                    penalty: faker.datatype.number().toString(),
                }
            },
        ],
        toPayDetails: {
            formula: "charge + penalty",
            charge: faker.datatype.number().toString(),
            penalty: faker.datatype.number().toString(),
        },
        ...extraAttrs,
    }
    const obj = await BillingReceipt.create(client, attrs)
    return [obj, attrs]
}

async function createTestBillingReceipts (client, contexts, properties, accounts, extraAttrsArray = []) {
    if (!client) throw new Error('no client')
    if (!Array.isArray(contexts) || !contexts.length) throw new Error('no contexts')
    if (!Array.isArray(properties) || !properties.length) throw new Error('no properties')
    if (!Array.isArray(accounts) || !accounts.length) throw new Error('no properties')
    if (contexts.length !== properties.length) throw new Error('Contexts and properties not equal length')
    if (contexts.length !== accounts.length) throw new Error('Contexts and accounts not equal length')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrsArray = []

    for (let i = 0; i < contexts.length; i++) {
        attrsArray.push({
            data: {
                dv: 1,
                sender,
                context: { connect: { id: contexts[i].id } },
                property: { connect: { id: properties[i].id } },
                account: { connect: { id: accounts[i].id } },
                raw: { foo: faker.lorem.words() },
                period: '2021-12-01',
                importId: faker.random.alphaNumeric(8),
                toPay: (faker.datatype.number() + 50).toString(),
                recipient: createTestRecipient(),
                services: [
                    {
                        id: faker.datatype.number().toString(),
                        name: faker.random.alphaNumeric(),
                        toPay: faker.datatype.number().toString(),
                        toPayDetails: {
                            formula: "charge + penalty",
                            charge: faker.datatype.number().toString(),
                            penalty: faker.datatype.number().toString(),
                        }
                    },
                ],
                toPayDetails: {
                    formula: "charge + penalty",
                    charge: faker.datatype.number().toString(),
                    penalty: faker.datatype.number().toString(),
                },
                ...get(extraAttrsArray, `${i}`, {})
            }
        })
    }
    const objs = await BillingReceipt.createMany(client, attrsArray)
    return [objs, attrsArray]
}

async function updateTestBillingReceipt (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingReceipt.update(client, id, attrs)
    return [obj, attrs]
}

async function updateTestBillingReceipts (client, attrsArray) {
    if (!client) throw new Error('no client')
    if (!attrsArray.every(element => element.id)) throw new Error('no id for all elements')
    if (!attrsArray.every(element => element.data)) throw new Error('no data for all elements')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const extendedAttrsArray = attrsArray.map(element => ({
        id: element.id,
        data: {
            dv: 1,
            sender,
            ...element.data,
        }
    }))

    const obj = await BillingReceipt.updateMany(client, extendedAttrsArray)
    return [obj, extendedAttrsArray]
}

async function createTestBillingCategory (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.words(),
        ...extraAttrs,
    }
    const obj = await BillingCategory.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingCategory (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingCategory.update(client, id, attrs)
    return [obj, attrs]
}


async function updateTestBillingOrganization (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingOrganization.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBillingRecipient(client, context, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!context.id) throw new Error('no context')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const recipient = createTestRecipient()
    const attrs = {
        dv: 1,
        sender,
        context: { connect: { id: context.id } },
        importId: faker.datatype.uuid(),
        ...recipient,
        purpose: `Payment for service from ${recipient.name}`,
        isApproved: false,
        ...extraAttrs,
    }
    const obj = await BillingRecipient.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBillingRecipient(client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BillingRecipient.update(client, id, attrs)
    return [obj, attrs]
}

async function makeClientWithIntegrationAccess () {
    const admin = await makeLoggedInAdminClient()
    const [integration, integrationAttrs] = await createTestBillingIntegration(admin)

    const client = await makeClientWithServiceUser()

    // add access
    await createTestBillingIntegrationAccessRight(admin, integration, client.user)

    client.integration = integration
    client.integrationAttrs = integrationAttrs
    return client
}

async function registerBillingReceiptsByTestClient(client, args) {
    if (!client) throw new Error('no client')
    if (!args) throw new Error('no data')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...args,
    }
    const { data, errors } = await client.mutate(REGISTER_BILLING_RECEIPTS_MUTATION, { data: attrs })

    throwIfError(data, errors)
    return [data.result, attrs]
}

function createRegisterBillingReceiptsPayload(extraAttrs) {
    return {
        importId: faker.random.alphaNumeric(24),

        address: faker.random.alphaNumeric(24),

        unitType: FLAT_UNIT_TYPE,
        accountNumber: faker.random.alphaNumeric(10),
        unitName: faker.random.alphaNumeric(14),

        toPay: '100.00',
        period: '2022-03-01',

        category: { id: '928c97ef-5289-4daa-b80e-4b9fed50c629' },

        tin: faker.random.alphaNumeric(8),
        iec: faker.random.alphaNumeric(8),
        bic: faker.random.alphaNumeric(8),
        bankAccount: faker.random.alphaNumeric(8),

        ...extraAttrs
    }
}

/**
 * Simplifies creating series of instances
 */

async function addBillingIntegrationAndContext(client, organization) {
    if (!organization || !organization.id) {
        throw new Error('No organization')
    }

    const [ billingIntegration ] = await createTestBillingIntegration(client)
    const [ billingIntegrationContext ] = await createTestBillingIntegrationOrganizationContext(client, organization, billingIntegration)

    return {
        billingIntegration,
        billingIntegrationContext,
        client
    }
}

async function makeContextWithOrganizationAndIntegrationAsAdmin() {
    const admin = await makeLoggedInAdminClient()
    const [integration] = await createTestBillingIntegration(admin)
    const [organization] = await registerNewOrganization(admin)
    const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

    return { context, integration, organization, admin }
}

async function makeServiceUserForIntegration(integration) {
    const admin = await makeLoggedInAdminClient()
    const client = await makeClientWithServiceUser()
    const [accessRight] = await createTestBillingIntegrationAccessRight(admin, integration, client.user)
    client.accessRight = accessRight

    return client
}

async function makeOrganizationIntegrationManager(context = null) {
    const admin = await makeLoggedInAdminClient()
    let organization
    let integration
    if (context) {
        organization = get(context, ['organization'])
        integration = get(context, ['integration'])
    } else {
        [organization] = await createTestOrganization(admin)
        const [billingIntegration] = await createTestBillingIntegration(admin)
        integration = billingIntegration
    }
    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
        canManageIntegrations: true,
        canReadBillingReceipts: true,
        canReadPayments: true,
    })
    const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
    await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)
    return { organization, integration, managerUserClient }
}

async function createReceiptsReader(organization) {
    const admin = await makeLoggedInAdminClient()
    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
        canReadBillingReceipts: true,
    })
    const client = await makeClientWithNewRegisteredAndLoggedInUser()
    await createTestOrganizationEmployee(admin, organization, client.user, role)
    return client
}

async function makeClientWithPropertyAndBilling({ billingIntegrationContextArgs, billingPropertyArgs, billingAccountAttrs }) {
    const integrationClient = await makeClientWithIntegrationAccess()
    const integration = integrationClient.integration

    const client = await makeClientWithProperty()

    const [ context ] = await createTestBillingIntegrationOrganizationContext(client, client.organization, integration, billingIntegrationContextArgs)
    const [ property ] = await createTestBillingProperty(integrationClient, context, billingPropertyArgs)
    const [ account ] = await createTestBillingAccount(integrationClient, context, property, billingAccountAttrs)

    client.billingIntegration = integration
    client.billingIntegrationContext = context
    client.billingProperty = property
    client.billingAccount = account

    return { organizationClient: client, integrationClient: integrationClient }
}

function createTestRecipient (extra = {}) {
    const range = (length) => ({ min: Math.pow(10,length - 1), max: Math.pow(10,length)-1 })
    const validRecipient = {
        name: faker.company.companyName(),
        tin: faker.datatype.number(range(10)).toString(),
        iec: faker.datatype.number(range(9)).toString(),
        bic: faker.finance.bic().toString(),
        bankAccount: faker.finance.account(12).toString(),
        bankName: faker.company.companyName(),
        territoryCode: faker.datatype.number().toString(),
        offsettingAccount: faker.finance.account(12).toString(),
    }
    return {
        ...validRecipient,
        ...extra,
    }
}

async function makeResidentClientWithOwnReceipt(existingResidentClient) {

    let residentClient = existingResidentClient
    if (!residentClient) {
        residentClient = await makeClientWithResidentUser()
    }

    const adminClient = await makeLoggedInAdminClient()
    const { context, integration, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()

    const [property] = await createTestProperty(adminClient, organization)

    const addr = property.address
    const addrMeta = property.addressMeta

    const [resident] = await registerResidentByTestClient(residentClient, {
        address: addr,
        addressMeta: addrMeta,
    })

    const unitName = resident.unitName
    const unitType = resident.unitType

    const [billingProperty] = await createTestBillingProperty(adminClient, context, {
        address: addr,
    })
    const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty, {
        unitName: unitName,
        unitType: unitType,
    })
    const accountNumber = billingAccount.number

    const [serviceConsumer] = await registerServiceConsumerByTestClient(residentClient, {
        residentId: resident.id,
        accountNumber: accountNumber,
        organizationId: organization.id,
    })

    const [receipt] = await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)

    return {
        adminClient,
        residentClient,
        property,
        integration,
        context,
        organization,
        resident,
        billingProperty,
        billingAccount,
        serviceConsumer,
        receipt
    }
}


module.exports = {
    BillingIntegration, createTestBillingIntegration, updateTestBillingIntegration,
    BillingIntegrationAccessRight, createTestBillingIntegrationAccessRight, updateTestBillingIntegrationAccessRight,
    makeClientWithIntegrationAccess,
    BillingIntegrationOrganizationContext, createTestBillingIntegrationOrganizationContext, updateTestBillingIntegrationOrganizationContext,
    BillingIntegrationLog, createTestBillingIntegrationLog, updateTestBillingIntegrationLog,
    BillingProperty, createTestBillingProperty, createTestBillingProperties, updateTestBillingProperty, updateTestBillingProperties,
    BillingAccount, createTestBillingAccount, createTestBillingAccounts, updateTestBillingAccount, updateTestBillingAccounts,
    BillingMeterResource, createTestBillingMeterResource, updateTestBillingMeterResource,
    BillingAccountMeter, createTestBillingAccountMeter, updateTestBillingAccountMeter,
    BillingAccountMeterReading, createTestBillingAccountMeterReading, updateTestBillingAccountMeterReading,
    BillingReceipt, createTestBillingReceipt, createTestBillingReceipts, updateTestBillingReceipt, updateTestBillingReceipts,
    makeContextWithOrganizationAndIntegrationAsAdmin,
    makeOrganizationIntegrationManager, addBillingIntegrationAndContext,
    BillingOrganization, updateTestBillingOrganization,
    ResidentBillingReceipt,
    createReceiptsReader,
    makeClientWithPropertyAndBilling,
    BillingRecipient, createTestBillingRecipient, updateTestBillingRecipient,
    createTestRecipient,
    BillingCategory, createTestBillingCategory, updateTestBillingCategory,
    makeResidentClientWithOwnReceipt,
    makeServiceUserForIntegration,
    registerBillingReceiptsByTestClient,
    createRegisterBillingReceiptsPayload,
/* AUTOGENERATE MARKER <EXPORTS> */
}


