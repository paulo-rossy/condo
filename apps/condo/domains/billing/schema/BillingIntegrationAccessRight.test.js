/**
 * Generated by `createschema "billing.BillingIntegrationAccessRight integration:Relationship:BillingIntegration:PROTECT; user:Relationship:User:CASCADE;"`
 */

const { makeLoggedInAdminClient, makeClient } = require('@condo/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser, makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')
const { BillingIntegrationAccessRight, createTestBillingIntegrationAccessRight, updateTestBillingIntegrationAccessRight, createTestBillingIntegration } = require('../utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects, expectToThrowAuthenticationErrorToObjects, expectToThrowAuthenticationErrorToObj, expectToThrowAccessDeniedErrorToObj } = require('@condo/keystone/test.utils')

describe('BillingIntegrationAccessRight', () => {
    test('user: create BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()

        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationAccessRight(client, integration, serviceUserClient.user)
        })
    })

    test('anonymous: create BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()

        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingIntegrationAccessRight(client, integration, serviceUserClient.user)
        })
    })

    test('support: create BillingIntegrationAccessRight', async () => {
        const support = await makeClientWithSupportUser()

        const [integration] = await createTestBillingIntegration(support)
        const serviceUserClient = await makeClientWithServiceUser()

        const [integrationAccessRight] = await createTestBillingIntegrationAccessRight(support, integration,  serviceUserClient.user)
        expect(integrationAccessRight).toEqual(expect.objectContaining({
            integration: { id: integration.id, name: integration.name },
        }))
    })

    test('admin: create BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()

        const [integrationAccessRight] = await createTestBillingIntegrationAccessRight(
            admin, integration, serviceUserClient.user)
        expect(integrationAccessRight).toEqual(expect.objectContaining({
            integration: { id: integration.id, name: integration.name },
        }))
    })

    test('user: read BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()
        const [right] = await createTestBillingIntegrationAccessRight(admin, integration, serviceUserClient.user)


        await expectToThrowAccessDeniedErrorToObjects(async () => {
            await BillingIntegrationAccessRight.getAll(serviceUserClient, { id: right.id })
        })
    })

    test('anonymous: read BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()
        const [right] = await createTestBillingIntegrationAccessRight(admin, integration, serviceUserClient.user)
        const client = await makeClient()


        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingIntegrationAccessRight.getAll(client, { id: right.id })
        })
    })

    test('user: update BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()
        const [objCreated] = await createTestBillingIntegrationAccessRight(admin, integration, serviceUserClient.user)

        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingIntegrationAccessRight(client, objCreated.id, payload)
        })
    })

    test('anonymous: update BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()
        const [objCreated] = await createTestBillingIntegrationAccessRight(admin, integration, serviceUserClient.user)

        const client = await makeClient()
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestBillingIntegrationAccessRight(client, objCreated.id, payload)
        })
    })

    test('admin: delete BillingIntegrationAccessRight', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const serviceUserClient = await makeClientWithServiceUser()
        const [objCreated] = await createTestBillingIntegrationAccessRight(admin, integration, serviceUserClient.user)
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingIntegrationAccessRight.delete(admin, objCreated.id)
        })
    })
})
