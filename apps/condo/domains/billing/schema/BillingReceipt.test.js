import { catchErrorFrom } from '../../common/utils/testSchema'

/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const { createTestBillingIntegrationOrganizationContext } = require('../utils/testSchema')
const { makeOrganizationIntegrationManager } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingAccount } = require('../utils/testSchema')
const { createTestBillingProperty } = require('../utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingReceipt, createTestBillingReceipt, updateTestBillingReceipt } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects, expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('BillingReceipt', () => {
    test('admin: create BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        expect(obj.account.id).toEqual(billingAccount.id)
        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
    })

    test('user: create BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingReceipt(user, context, property, billingAccount)
        })
    })

    test('organization integration manager: create BillingReceipt', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)

        expect(obj.account.id).toEqual(billingAccount.id)
        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
    })

    test('anonymous: create BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestBillingReceipt(client, context, property, billingAccount)
        })
    })

    test('admin: read BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const objs = await BillingReceipt.getAll(admin, { id: obj.id })

        expect(objs).toHaveLength(1)
    })

    test('organization integration manager: read BillingReceipt', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)
        const objs = await BillingReceipt.getAll(managerUserClient, { id: obj.id })

        expect(objs).toHaveLength(1)
    })

    test('user: read BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const objs = await BillingReceipt.getAll(user, { id: billingAccount.id })

        expect(objs).toHaveLength(0)
    })

    test('anonymous: read BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await BillingReceipt.getAll(client, { id: billingAccount.id })
        })
    })

    test('admin: update BillingReceipt', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const payload = {
            toPayDetails: {
                formula: 'calc+recalc',
            },
        }
        const [objUpdated] = await updateTestBillingReceipt(admin, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.toPayDetails.formula).toEqual('calc+recalc')
    })

    test('organization integration manager: update BillingReceipt toPayDetail', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)
        const payload = {
            toPayDetails: {
                formula: 'charge+penalty',
                charge: 12341,
                penalty: -200,
            },
        }
        const [objUpdated] = await updateTestBillingReceipt(managerUserClient, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.toPayDetails.formula).toEqual('charge+penalty')
    })

    test('organization integration manager: update BillingReceipt services', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)
        const payload = {
            services: [
                {
                    id: 'COLD-WATER',
                    name: 'Cold water',
                    toPay: 1000,
                    toPayDetails: {
                        formula: 'charge+penalty',
                        charge: 1000,
                        penalty: 0,
                    },
                },
                {
                    id: 'HOT-WATER',
                    name: 'Hot water',
                    toPay: 1800,
                    toPayDetails: {
                        formula: 'charge+penalty',
                        charge: 2000,
                        penalty: 200,
                    },
                },
                {
                    id: 'ELECTRICITY',
                    name: 'Electricity to power your toxicity!',
                    toPay: 3000,
                    toPayDetails: {
                        formula: 'charge+penalty',
                        charge: 6000,
                        penalty: -3000,
                    },
                },
            ],
        }
        const [objUpdated] = await updateTestBillingReceipt(managerUserClient, obj.id, payload)

        expect(obj.id).toEqual(objUpdated.id)
        expect(objUpdated.services[0].id).toEqual('COLD-WATER')
    })

    test('organization integration manager: update BillingReceipt with wrong data in toPayDetails', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)

        // No formula in payload
        const payload = {
            toPayDetails: {
                charge: 12341,
                penalty: -200,
            },
        }

        await catchErrorFrom(
            async () => await updateTestBillingReceipt(managerUserClient, obj.id, payload),
            ({ errors, _ }) => {
                expect(errors[0]).toMatchObject({
                    'message': 'You attempted to perform an invalid mutation',
                })
            })
    })

    test('organization integration manager: update BillingReceipt with wrong data in services', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)

        // Wrong services toPay details 
        const payload = {
            services: [
                {
                    id: '1',
                    toPay: '1200',
                    name: 'Water',
                    // No formula
                    toPayDetails: {
                        charge: 12341,
                        penalty: -200,
                    },
                },
            ],
        }

        await catchErrorFrom(
            async () => await updateTestBillingReceipt(managerUserClient, obj.id, payload),
            ({ errors, _ }) => {
                expect(errors[0]).toMatchObject({
                    'message': 'You attempted to perform an invalid mutation',
                })
            })
    })

    test('organization integration manager: update BillingReceipt with wrong data in services 2', async () => {
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [obj] = await createTestBillingReceipt(managerUserClient, context, property, billingAccount)

        // No NAME in services
        const payload = {
            services: [
                {
                    toPay: '1200',
                    toPayDetails: {
                        formula: 'charge+penalty',
                        charge: 12341,
                        penalty: -200,
                    },
                },
            ],
        }

        await catchErrorFrom(
            async () => await updateTestBillingReceipt(managerUserClient, obj.id, payload),
            ({ errors, _ }) => {
                expect(errors[0]).toMatchObject({
                    'message': 'You attempted to perform an invalid mutation',
                })
            })
    })


    test('user: update BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingReceipt(user, obj.id, payload)
        })
    })

    test('anonymous: update BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestBillingReceipt(client, obj.id, payload)
        })
    })

    test('user: delete BillingReceipt', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingReceipt.delete(user, obj.id)
        })
    })

    test('anonymous: delete BillingReceipt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [obj] = await createTestBillingReceipt(admin, context, property, billingAccount)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingReceipt.delete(client, obj.id)
        })
    })
})

