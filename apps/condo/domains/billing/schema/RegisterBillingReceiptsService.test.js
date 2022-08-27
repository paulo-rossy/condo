/**
 * Generated by `createservice billing.RegisterBillingReceiptsService --type mutations`
 */
import { catchErrorFrom } from '@condo/domains/common/utils/testSchema'

const faker = require('faker')

const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE, APARTMENT_UNIT_TYPE } = require('@condo/domains/property/constants/common')

const { expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToResult } = require('@condo/domains/common/utils/testSchema')

const { registerBillingReceiptsByTestClient } = require('@condo/domains/billing/utils/testSchema')

const {
    makeServiceUserForIntegration,
    makeOrganizationIntegrationManager,
    createTestBillingProperty,
    createTestBillingAccount,
    createTestBillingIntegration,
    createTestBillingIntegrationOrganizationContext,
    BillingReceipt,
    BillingAccount,
    BillingProperty,
    updateTestBillingIntegrationAccessRight,
    createRegisterBillingReceiptsPayload,
} = require('@condo/domains/billing/utils/testSchema')

const {
    makeClientWithSupportUser,
    makeLoggedInClient,
} = require('@condo/domains/user/utils/testSchema')

const { makeClient, makeLoggedInAdminClient } = require('@condo/keystone/test.utils')

describe('RegisterBillingReceiptsService', () => {
    let admin
    let support
    let anonymous
    let user

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        user = await makeLoggedInClient()
    })

    describe('Execute', () => {
        test('Admin can execute mutation', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [],
            }

            const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)

            expect(data).toHaveLength(0)
        })

        test('Billing service account can execute mutation', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const integrationUser = await makeServiceUserForIntegration(integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [],
            }

            const [ data ] = await registerBillingReceiptsByTestClient(integrationUser, payload)

            expect(data).toHaveLength(0)
        })

        test('Billing service account without Access Right cant execute mutation', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const integrationUser = await makeServiceUserForIntegration(integration)
            await updateTestBillingIntegrationAccessRight(admin, integrationUser.accessRight.id, { deletedAt: 'true' })

            const payload = {
                context: { id: billingContext.id },
                receipts: [],
            }

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptsByTestClient(integrationUser, payload)
            })
        })

        test('Organization employee can not execute mutation', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
            const { managerUserClient } = await makeOrganizationIntegrationManager(billingContext)
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptsByTestClient(managerUserClient, { context: { id: '1234' }, receipts: [] })
            })
        })

        test('Support can not execute mutation', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptsByTestClient(support, { context: { id: '1234' }, receipts: [] })
            })
        })

        test('User can not execute mutation', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptsByTestClient(user, { context: { id: '1234' }, receipts: [] })
            })
        })

        test('Anonymous can not execute mutation', async () => {
            await expectToThrowAuthenticationError(async () => {
                await registerBillingReceiptsByTestClient(anonymous, { context: { id: '1234' }, receipts: [] })
            }, 'result')
        })
    })

    describe('Business Logic', () => {

        describe('BillingProperties', () => {
            test('BillingProperties are created and not deleted', async () => {
                /**
                 * Existing properties = {p1, p2}
                 * Properties from args = {p1, p3}
                 * Result: {p1, p2, p3}
                 */

                const EXISTING_TEST_ADDRESS_P1 = 'г. Екатеринбург, Тургенева 4'
                const EXISTING_TEST_ADDRESS_P2 = 'г. Екатеринбург, Проспект Ленина, 44'
                const NON_EXISTING_TEST_ADDRESS_P3 = 'г. Екатеринбург, Проспект Космонавтов 11б'

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const [billingProperty1] = await createTestBillingProperty(admin, billingContext, {
                    address: EXISTING_TEST_ADDRESS_P1,
                })

                const [billingProperty2] = await createTestBillingProperty(admin, billingContext, {
                    address: EXISTING_TEST_ADDRESS_P2,
                })

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        createRegisterBillingReceiptsPayload({
                            address: EXISTING_TEST_ADDRESS_P1,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: NON_EXISTING_TEST_ADDRESS_P3,
                        }),
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(3)
                expect(billingAccounts).toHaveLength(2)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })
        })

        describe('BillingAccounts', () => {
            test('BillingAccounts are created and not deleted', async () => {
                /**
                 * Existing properties = {p1}
                 * Properties from args = {p2}
                 * Existing accounts = {a1, a2} for p1
                 * Accounts from args = {a1, a3, a1', a2', a3'} // a1' a2' a3' are for p2
                 *
                 * Result Accounts: p1 -> {a1,  a2,  a3 }
                 *                  p2 -> {a1', a2', a3'}
                 */

                const TEST_ADDRESS_P1 = 'г. Екатеринбург, Тургенева 4'
                const TEST_ADDRESS_P2 = 'г. Екатеринбург, Проспект Космонавтов 11б'

                const TEST_BILLING_ACCOUNT_1_UNITNAME = '1'
                const TEST_BILLING_ACCOUNT_1_NUMBER = 'n1'

                const TEST_BILLING_ACCOUNT_2_UNITNAME = '2'
                const TEST_BILLING_ACCOUNT_2_NUMBER = 'n2'

                const TEST_BILLING_ACCOUNT_3_UNITNAME = '3'
                const TEST_BILLING_ACCOUNT_3_NUMBER = 'n3'

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const [billingProperty1] = await createTestBillingProperty(admin, billingContext, {
                    address: TEST_ADDRESS_P1,
                })

                const [billingAccount1] = await createTestBillingAccount(admin, billingContext, billingProperty1, {
                    number: TEST_BILLING_ACCOUNT_1_NUMBER,
                    unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,
                    unitType: FLAT_UNIT_TYPE,
                })

                const [billingAccount2] = await createTestBillingAccount(admin, billingContext, billingProperty1, {
                    number: TEST_BILLING_ACCOUNT_2_NUMBER,
                    unitName: TEST_BILLING_ACCOUNT_2_UNITNAME,
                    unitType: FLAT_UNIT_TYPE,
                })

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P1,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_1_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P1,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_3_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_3_UNITNAME,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P2,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_1_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P2,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_2_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_2_UNITNAME,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P2,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_3_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_3_UNITNAME,
                        }),
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(2)
                expect(billingAccounts).toHaveLength(6)
                expect(billingReceipts).toHaveLength(5)
                expect(data).toHaveLength(5)
            })

            test('BillingAccounts are created if they have different UnitTypes', async () => {

                const TEST_ADDRESS_P1 = 'г. Екатеринбург, Тургенева 4'

                const TEST_BILLING_ACCOUNT_1_UNITNAME = '1'
                const TEST_BILLING_ACCOUNT_1_NUMBER = 'n1'

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P1,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_1_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,

                            month: 4,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P1,

                            unitType: APARTMENT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_1_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,

                            month: 4,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: TEST_ADDRESS_P1,

                            unitType: APARTMENT_UNIT_TYPE,
                            accountNumber: TEST_BILLING_ACCOUNT_1_NUMBER,
                            unitName: TEST_BILLING_ACCOUNT_1_UNITNAME,

                            month: 5,
                        }),
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingAccounts).toHaveLength(2)
                expect(billingReceipts).toHaveLength(3)
                expect(data).toHaveLength(3)
            })
        })

        describe('BillingReceipts', () => {
            test('BillingReceipts are created if they are in different addresses', async () => {
                const TEST_ADDRESS_P1 = 'г. Екатеринбург, Тургенева 4'
                const TEST_ADDRESS_P2 = 'г. Екатеринбург, Проспект Ленина, 44'

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            address: TEST_ADDRESS_P1,
                            importId: faker.random.alphaNumeric(24),
                        },
                        {
                            ...receiptInput,
                            address: TEST_ADDRESS_P2,
                            importId: faker.random.alphaNumeric(24),
                        },
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(2)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })

            test('BillingReceipts are created if they have different accounts', async () => {

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            accountNumber: '1',
                            importId: faker.random.alphaNumeric(24),
                        },
                        {
                            ...receiptInput,
                            accountNumber: '2',
                            importId: faker.random.alphaNumeric(24),
                        },
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })

            test('BillingReceipts are created if they have different recipient', async () => {

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            tin: '1',
                            importId: faker.random.alphaNumeric(24),
                        },
                        {
                            ...receiptInput,
                            tin: '2',
                            importId: faker.random.alphaNumeric(24),
                        },
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })

            test('BillingReceipts are created if they have different categories', async () => {

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            importId: faker.random.alphaNumeric(24),
                        },
                        {
                            ...receiptInput,
                            category: { id: '35b0030f-d691-458a-a902-a6985f58d82e' },
                            importId: faker.random.alphaNumeric(24),
                        },
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })

            test('BillingReceipts are created if they have different periods', async () => {

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            month: 3,
                            importId: faker.random.alphaNumeric(24),
                        },
                        {
                            ...receiptInput,
                            month: 4,
                            importId: faker.random.alphaNumeric(24),
                        },
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingReceipts).toHaveLength(2)
                expect(data).toHaveLength(2)
            })

            test('BillingReceipts are not updated and not created if they refer to the same receipt', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                        },
                    ],
                }
                await registerBillingReceiptsByTestClient(admin, payload)

                const existingBillingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })
                const existingBillingReceiptId = existingBillingReceipts[0].id
                const existingBillingReceiptUpdatedAt = existingBillingReceipts[0].updatedAt

                const payload2 = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                        },
                    ],
                }
                const [data] = await registerBillingReceiptsByTestClient(admin, payload2)

                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingAccounts).toHaveLength(1)
                expect(billingReceipts).toHaveLength(1)
                expect(data).toHaveLength(0)
                expect(billingReceipts[0].id).toEqual(existingBillingReceiptId)
                expect(billingReceipts[0].updatedAt).toEqual(existingBillingReceiptUpdatedAt)
            })

            test('BillingReceipts are updated if only toPay is different', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const receiptInput = createRegisterBillingReceiptsPayload()

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            toPay: '190.00',
                        },
                    ],
                }
                const [ existingBillingReceipts ] = await registerBillingReceiptsByTestClient(admin, payload)
                const existingBillingReceiptId = existingBillingReceipts[0].id

                const payload2 = {
                    context: { id: billingContext.id },
                    receipts: [
                        {
                            ...receiptInput,
                            toPay: '200.00',
                        },
                    ],
                }
                const [data] = await registerBillingReceiptsByTestClient(admin, payload2)

                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(1)
                expect(billingReceipts).toHaveLength(1)
                expect(data).toHaveLength(1)
                expect(billingReceipts[0].id).toEqual(existingBillingReceiptId)
                expect(billingReceipts[0].toPay).toEqual('200.00000000')
            })

            test.skip('BillingReceipts are updated if only services are different', async () => {

            })

            test.skip('BillingReceipts are updated if only toPayDetails are different', async () => {

            })
        })
    })

    describe('Real life cases', () => {

        describe('Positive cases', () => {
            test.skip('Management company loads receipts for first time', async () => {

            })

            test.skip('Management company signs up for management of new property', async () => {

            })

            test.skip('Management company republish receipts only for one property', async () => {

            })
        })

        describe('Corner cases', () => {
            test.skip('Simple case is handled correctly', async () => {
                const EXISTING_TEST_ADDRESS = 'TEST'
                const EXISTING_TEST_UNIT_NAME = '0'
                const EXISTING_TEST_ACCOUNT_NUMBER = '0'

                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

                const [billingProperty] = await createTestBillingProperty(admin, billingContext, {
                    address: EXISTING_TEST_ADDRESS,
                })

                const [billingAccount] = await createTestBillingAccount(admin, billingContext, billingProperty, {
                    unitName: EXISTING_TEST_UNIT_NAME,
                    unitType: FLAT_UNIT_TYPE,
                    number: EXISTING_TEST_ACCOUNT_NUMBER,
                })

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        createRegisterBillingReceiptsPayload({
                            address: EXISTING_TEST_ADDRESS,

                            unitType: FLAT_UNIT_TYPE,
                            accountNumber: EXISTING_TEST_ACCOUNT_NUMBER,
                            unitName: EXISTING_TEST_UNIT_NAME,
                        }),
                        createRegisterBillingReceiptsPayload({
                            address: EXISTING_TEST_ADDRESS,
                        }),
                        createRegisterBillingReceiptsPayload(),
                    ],
                }

                const [ data ] = await registerBillingReceiptsByTestClient(admin, payload)
                const billingProperties = await BillingProperty.getAll(admin, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(admin, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(admin, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(2)
                expect(billingAccounts).toHaveLength(3)
                expect(billingReceipts).toHaveLength(3)
                expect(data).toHaveLength(3)
            })
        })

        describe('Hacky cases', () => {
            test('Hacker can not load receipts into other billing context related to other org', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integration] = await createTestBillingIntegration(admin)
                const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
                const { managerUserClient } = await makeOrganizationIntegrationManager(billingContext)

                const [organization2] = await createTestOrganization(admin)
                const [integration2] = await createTestBillingIntegration(admin)
                const [billingContext2] = await createTestBillingIntegrationOrganizationContext(admin, organization2, integration2)
                const { managerUserClient: hackerClient } = await makeOrganizationIntegrationManager(billingContext2)

                const payload = {
                    context: { id: billingContext.id },
                    receipts: [
                        createRegisterBillingReceiptsPayload(),
                    ],
                }

                await catchErrorFrom(async () => {
                    await registerBillingReceiptsByTestClient(hackerClient, payload)
                }, (e) => {
                    expect(e.errors[0].message).toContain('You do not have access to this resource')
                })

                const billingProperties = await BillingProperty.getAll(managerUserClient, { context: { id: billingContext.id } })
                const billingAccounts = await BillingAccount.getAll(managerUserClient, { context: { id: billingContext.id } })
                const billingReceipts = await BillingReceipt.getAll(managerUserClient, { context: { id: billingContext.id } })

                expect(billingProperties).toHaveLength(0)
                expect(billingAccounts).toHaveLength(0)
                expect(billingReceipts).toHaveLength(0)
            })
        })
    })

    describe('Validations', () => {
        test('Mutation checks wrong context-id', async () => {

            const payload = {
                context: { id: admin.user.id },
                receipts: [],
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Provided BillingIntegrationOrganizationContext is not found')
            })
        })

        test('Mutation has limit on receipts', async () => {

            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const RECEIPTS_LIMIT = 100

            const payload = {
                context: { id: billingContext.id },
                receipts: [],
            }

            for (let i = 0; i < RECEIPTS_LIMIT + 1; ++i) {
                payload.receipts.push(createRegisterBillingReceiptsPayload())
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Too many receipts in one query!')
            })
        })

        test('Mutation checks wrong category-id', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [
                    createRegisterBillingReceiptsPayload({
                        category: { id: '928c97ef-5289-4daa-b80e-4b9fed50c630' }, // Wrong category id
                    }),
                ],
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Category with this id is not found')
            })
        })

        test('Mutation checks wrong period format (bad year)', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [
                    createRegisterBillingReceiptsPayload({
                        year: -200,
                    }),
                ],
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Year is wrong')
            })
        })

        test('Mutation checks wrong period format (bad month)', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [
                    createRegisterBillingReceiptsPayload({
                        month: 20,
                    }),
                ],
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Month is wrong')
            })
        })

        test('Mutation checks wrong address', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [
                    createRegisterBillingReceiptsPayload({
                        address: '',
                    }),
                ],
            }

            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(admin, payload)
            }, (e) => {
                expect(e.errors[0].message).toContain('Address is wrong')
            })
        })

        test('If there is an error, mutation creates entities it can create, and sends errors for others', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integration] = await createTestBillingIntegration(admin)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

            const payload = {
                context: { id: billingContext.id },
                receipts: [
                    createRegisterBillingReceiptsPayload(),
                    createRegisterBillingReceiptsPayload(),
                    createRegisterBillingReceiptsPayload(),
                    createRegisterBillingReceiptsPayload({
                        month: 13,
                    }),
                    createRegisterBillingReceiptsPayload({
                        year: -20,
                    }),
                ],
            }

            const [result, errors] = await registerBillingReceiptsByTestClient(admin, payload, { raw: true })
            expect(result).toHaveLength(5)
            expect(result[3]).toBeNull()
            expect(result[4]).toBeNull()
            expect(errors).toHaveLength(2)
        })
    })
})