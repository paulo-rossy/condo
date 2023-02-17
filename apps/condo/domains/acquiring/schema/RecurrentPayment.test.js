/**
 * Generated by `createschema acquiring.RecurrentPayment 'status:Text;tryCount:Integer;state:Json;billingReceipts:Json'`
 */

const dayjs = require('dayjs')
const faker = require('faker')
const { v4: uuid } = require('uuid')

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, expectToThrowAuthenticationErrorToObj } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const {
    RECURRENT_PAYMENT_INIT_STATUS,
} = require('@condo/domains/acquiring/constants/recurrentPayment')
const { RecurrentPayment, createTestRecurrentPayment, updateTestRecurrentPayment, createTestRecurrentPaymentContext } = require('@condo/domains/acquiring/utils/testSchema')
const { createTestBillingCategory } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { RecurrentPaymentContext } = require("../utils/testSchema");

describe('RecurrentPayment', () => {
    let admin, 
        support,
        user,
        anonymous,
        getContextRequest,
        getPaymentRequest,
        billingCategory,
        serviceConsumerClient,
        recurrentPaymentContext

    beforeEach( async () => {
        serviceConsumerClient = await makeClientWithServiceConsumer()
        recurrentPaymentContext = (await createTestRecurrentPaymentContext(admin, getContextRequest()))[0]
    })

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        user = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()
        billingCategory = (await createTestBillingCategory(admin, { name: `Category ${new Date()}` }))[0]

        getContextRequest = () => ({
            enabled: false,
            limit: '10000',
            autoPayReceipts: false,
            paymentDay: 10,
            settings: { cardId: faker.datatype.uuid() },
            serviceConsumer: { connect: { id: serviceConsumerClient.serviceConsumer.id } },
            billingCategory: { connect: { id: billingCategory.id } },
        })

        getPaymentRequest = () => ({
            status: RECURRENT_PAYMENT_INIT_STATUS,
            payAfter: dayjs().toISOString(),
            tryCount: 0,
            state: {},
            billingReceipts: [],
            recurrentPaymentContext: { connect: { id: recurrentPaymentContext.id } },
        })
    })
    
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()

                const [obj, attrs] = await createTestRecurrentPayment(admin, getPaymentRequest())

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()

                const [obj, attrs] = await createTestRecurrentPayment(client, getPaymentRequest())

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestRecurrentPayment(client, getPaymentRequest())
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestRecurrentPayment(client, getPaymentRequest())
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()

                const [objCreated] = await createTestRecurrentPayment(admin, getPaymentRequest())

                const [obj, attrs] = await updateTestRecurrentPayment(admin, objCreated.id, {
                    ...getPaymentRequest(),
                    tryCount: 1,
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.tryCount).toEqual(1)
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()

                const [objCreated] = await createTestRecurrentPayment(client, getPaymentRequest())

                const [obj, attrs] = await updateTestRecurrentPayment(client, objCreated.id, {
                    ...getPaymentRequest(),
                    tryCount: 1,
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
                expect(obj.tryCount).toEqual(1)
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestRecurrentPayment(client, uuid(), getPaymentRequest())
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestRecurrentPayment(client, uuid(), getPaymentRequest())
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await RecurrentPayment.delete(admin, uuid())
                })
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await RecurrentPayment.delete(client, uuid())
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await RecurrentPayment.delete(client, uuid())
                })
            })
        })

        describe('read', () => {
            let recurrentPaymentId, serviceConsumerClient
            beforeAll(async () => {
                const admin = await makeLoggedInAdminClient()
                serviceConsumerClient = await makeClientWithServiceConsumer()

                const [testContext] = await createTestRecurrentPaymentContext(admin, {
                    ...getContextRequest(),
                    serviceConsumer: { connect: { id: serviceConsumerClient.serviceConsumer.id } },
                })

                const [obj] = await createTestRecurrentPayment(admin, {
                    ...getPaymentRequest(),
                    recurrentPaymentContext: { connect: { id: testContext.id } },
                })

                recurrentPaymentId = obj.id
            })

            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()

                const objs = await RecurrentPayment.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: recurrentPaymentId,
                    }),
                ]))
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()

                const objs = await RecurrentPayment.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: recurrentPaymentId,
                    }),
                ]))
            })

            test('user can', async () => {
                const objs = await RecurrentPayment.getAll(serviceConsumerClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: recurrentPaymentId,
                    }),
                ]))
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await RecurrentPayment.delete(client, uuid())
                })
            })
        })
    })
})
