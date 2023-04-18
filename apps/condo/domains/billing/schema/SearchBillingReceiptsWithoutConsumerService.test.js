/**
 * Generated by `createservice billing.SearchBillingReceiptsWithoutConsumerService --type queries`
 */
const index = require('@app/condo/index')
const { v4: uuid } = require('uuid')


const {
    setFakeClientMode,
    catchErrorFrom,
    makeClient,
    expectToThrowAuthenticationErrorToObj,
} = require('@open-condo/keystone/test.utils')

const {
    makePayerWithMultipleConsumers,
} = require('@condo/domains/acquiring/utils/testSchema')
const {
    BillingIntegrationOrganizationContext,
} = require('@condo/domains/billing/utils/serverSchema')
const { searchBillingReceiptsWithoutConsumerByTestClient } = require('@condo/domains/billing/utils/testSchema')
const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const {
    Property,
} = require('@condo/domains/property/utils/serverSchema')
const {
    ServiceConsumer,
} = require('@condo/domains/resident/utils/serverSchema')

const { keystone } = index
const dvAndSender = { dv: 1, sender: { dv: 1, fingerprint: 'test-fingerprint-alphanumeric-value' } }

describe('SearchBillingReceiptsWithoutConsumerService', () => {
    let adminContext
    setFakeClientMode(index)

    beforeAll(async () => {
        adminContext = await keystone.createContext({ skipAccessControl: true })
    })

    describe('execute', () => {
        test('user: can execute', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                billingContext: { id: billingContextId },
                serviceConsumer: { id: serviceConsumerId },
                billingReceipts: [{ id: receiptId }],
                resident: { id: residentId },
            } = batch

            // set billing integration organization context as FINISHED
            await BillingIntegrationOrganizationContext.update(adminContext, billingContextId, {
                ...dvAndSender,
                status: CONTEXT_FINISHED_STATUS,
            })

            // let's delete ServiceConsumer
            await ServiceConsumer.softDelete(adminContext, serviceConsumerId, dvAndSender)

            // let's try to find a billing receipt without consumer
            const [result] = await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                residents: [{ id: residentId }],
            })

            expect(result).toHaveProperty('residentReceipts')
            expect(result.residentReceipts).toHaveLength(1)
            expect(result.residentReceipts[0]).toHaveProperty('resident')
            expect(result.residentReceipts[0].resident).toHaveProperty('id')
            expect(result.residentReceipts[0].resident.id).toEqual(residentId)
            expect(result.residentReceipts[0]).toHaveProperty('receipts')
            expect(result.residentReceipts[0].receipts).toHaveLength(1)
            expect(result.residentReceipts[0].receipts[0]).toHaveProperty('id')
            expect(result.residentReceipts[0].receipts[0].id).toEqual(receiptId)
        })

        test('anonymous: can not execute', async () => {
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObj(async () => {
                await searchBillingReceiptsWithoutConsumerByTestClient(client, { residents: [] })
            })
        })
    })


    describe('Business Logic', () => {
        test('empty residents input return empty residentReceipts', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                billingContext: { id: billingContextId },
                serviceConsumer: { id: serviceConsumerId },
            } = batch

            // set billing integration organization context as FINISHED
            await BillingIntegrationOrganizationContext.update(adminContext, billingContextId, {
                ...dvAndSender,
                status: CONTEXT_FINISHED_STATUS,
            })

            // let's delete ServiceConsumer
            await ServiceConsumer.softDelete(adminContext, serviceConsumerId, dvAndSender)

            // let's try to find a billing receipt without consumer
            const [result] = await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                residents: [],
            })

            expect(result).toHaveProperty('residentReceipts')
            expect(result.residentReceipts).toHaveLength(0)
        })

        test('billing context is not finished', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                serviceConsumer: { id: serviceConsumerId },
                resident: { id: residentId },
            } = batch

            // let's delete ServiceConsumer
            await ServiceConsumer.softDelete(adminContext, serviceConsumerId, dvAndSender)

            // let's try to find a billing receipt without consumer
            const [result] = await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                residents: [{ id: residentId }],
            })

            expect(result).toHaveProperty('residentReceipts')
            expect(result.residentReceipts).toHaveLength(1)
            expect(result.residentReceipts[0]).toHaveProperty('resident')
            expect(result.residentReceipts[0].resident).toHaveProperty('id')
            expect(result.residentReceipts[0].resident.id).toEqual(residentId)
            expect(result.residentReceipts[0]).toHaveProperty('receipts')
            expect(result.residentReceipts[0].receipts).toHaveLength(0)
        })

        test('resident has related consumer', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                billingContext: { id: billingContextId },
                resident: { id: residentId },
            } = batch

            // set billing integration organization context as FINISHED
            await BillingIntegrationOrganizationContext.update(adminContext, billingContextId, {
                ...dvAndSender,
                status: CONTEXT_FINISHED_STATUS,
            })

            // let's try to find a billing receipt without consumer
            const [result] = await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                residents: [{ id: residentId }],
            })

            expect(result).toHaveProperty('residentReceipts')
            expect(result.residentReceipts).toHaveLength(0)
        })
    })


    describe('Validations', () => {
        test('duplicated residents', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                resident: { id: residentId },
            } = batch

            await catchErrorFrom(async () => {
                await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                    residents: [{ id: residentId }, { id: residentId }],
                })
            }, ({ errors, data }) => {
                expect(errors).toMatchObject([{
                    message: 'There are resident duplication',
                    name: 'GQLError',
                    path: ['obj'],
                    extensions: {
                        mutation: 'searchBillingReceiptsWithoutConsumer',
                        variable: ['data', 'residents'],
                        code: 'BAD_USER_INPUT',
                        type: 'NOT_UNIQUE',
                        message: 'There are resident duplication',
                    },
                }])
            })
        })

        test('missing residents', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                resident: { id: residentId },
            } = batch


            await catchErrorFrom(async () => {
                await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                    residents: [{ id: residentId }, { id: uuid() }],
                })
            }, ({ errors, data }) => {
                expect(errors).toMatchObject([{
                    message: 'Can not find some residents',
                    name: 'GQLError',
                    path: ['obj'],
                    extensions: {
                        mutation: 'searchBillingReceiptsWithoutConsumer',
                        variable: ['data', 'residents'],
                        code: 'BAD_USER_INPUT',
                        type: 'NOT_UNIQUE',
                        message: 'Can not find some residents',
                    },
                }])
            })
        })

        test('missing resident property', async () => {
            // let's create a service consumer with connected resident
            const { commonData, batches: [batch] } = await makePayerWithMultipleConsumers(1, 1)
            const {
                billingContext: { id: billingContextId },
                serviceConsumer: { id: serviceConsumerId },
                resident: { id: residentId },
                property: { id: propertyId },
            } = batch

            // set billing integration organization context as FINISHED
            await BillingIntegrationOrganizationContext.update(adminContext, billingContextId, {
                ...dvAndSender,
                status: CONTEXT_FINISHED_STATUS,
            })

            // let's delete ServiceConsumer
            await ServiceConsumer.softDelete(adminContext, serviceConsumerId, dvAndSender)

            // let's delete resident property
            await Property.softDelete(adminContext, propertyId, dvAndSender)

            await catchErrorFrom(async () => {
                await searchBillingReceiptsWithoutConsumerByTestClient(commonData.client, {
                    residents: [{ id: residentId }],
                })
            }, ({ errors, data }) => {
                expect(errors).toMatchObject([{
                    message: 'Can not find some properties for specified residents',
                    name: 'GQLError',
                    path: ['obj'],
                    extensions: {
                        mutation: 'searchBillingReceiptsWithoutConsumer',
                        code: 'BAD_USER_INPUT',
                        type: 'NOT_UNIQUE',
                        message: 'Can not find some properties for specified residents',
                    },
                }])
            })
        })
    })
})