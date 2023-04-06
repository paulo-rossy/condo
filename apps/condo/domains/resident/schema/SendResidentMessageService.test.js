/**
 * Generated by `createservice resident.SendResidentMessageService --type mutations`
 */
const faker = require('faker')
const { isEmpty } = require('lodash')

const {
    makeLoggedInAdminClient, makeClient,
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
    expectToThrowGQLError, waitFor,
} = require('@open-condo/keystone/test.utils')

const { createTestBillingIntegration, createTestBillingIntegrationOrganizationContext, createTestBillingProperty } = require('@condo/domains/billing/utils/testSchema')
const { getStartDates } = require('@condo/domains/common/utils/date')
const {
    CUSTOM_CONTENT_MESSAGE_PUSH_TYPE, DEVICE_PLATFORM_ANDROID,
    APP_MASTER_ID_ANDROID, MESSAGE_SENT_STATUS,
} = require('@condo/domains/notification/constants/constants')
const { syncRemoteClientWithPushTokenByTestClient, Message } = require('@condo/domains/notification/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { SUCCESS_STATUS, ERRORS } = require('@condo/domains/resident/schema/sendResidentMessageService')
const { sendResidentMessageByTestClient, registerResidentByTestClient } = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
    makeClientWithResidentUser,
    makeClientWithServiceUser,
} = require('@condo/domains/user/utils/testSchema')


const CATEGORY_HOUSING = '928c97ef-5289-4daa-b80e-4b9fed50c629'

describe('SendResidentMessageService', () => {
    let adminClient, supportClient, serviceClient,
        anonymousClient, userClient, residentClient,
        sender, property, organization,
        integration, integrationContext, billingProperty

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymousClient = await makeClient()
        sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
        const organizationData = await createTestOrganization(adminClient)
        organization = organizationData[0]
        const propertyData = await createTestProperty(adminClient, organization)
        property = propertyData[0]
        residentClient = await makeClientWithResidentUser()
        serviceClient = await makeClientWithServiceUser()
        const integrationData = await createTestBillingIntegration(adminClient)
        integration = integrationData[0]
        const contextData = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integration)
        integrationContext = contextData[0]
        const billingPropertyData = await createTestBillingProperty(adminClient, integrationContext, { address: property.address })
        billingProperty = billingPropertyData[0]

    })

    describe('sendResidentMessage tests', () => {
        describe('check access', () => {
            test('admin can', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }
                const [data] = await sendResidentMessageByTestClient(adminClient, payload)

                expect(data.status).toEqual(SUCCESS_STATUS)
            })

            test('service user can', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }
                const [data] = await sendResidentMessageByTestClient(serviceClient, payload)

                expect(data.status).toEqual(SUCCESS_STATUS)

            })

            test('support can not', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await sendResidentMessageByTestClient(userClient, payload)
                })
            })

            test('random user can not', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await sendResidentMessageByTestClient(userClient, payload)
                })
            })

            test('resident user can not', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await sendResidentMessageByTestClient(residentClient, payload)
                })
            })

            test('anonymous user can not', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowAuthenticationErrorToResult(async () => {
                    await sendResidentMessageByTestClient(anonymousClient, payload)
                })
            })
        })

        describe('validations', () => {
            test('throws on non existent organization id', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: faker.datatype.uuid(),
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowGQLError(
                    async () => { await sendResidentMessageByTestClient(adminClient, payload) },
                    { ...ERRORS.INVALID_ORGANIZATION_PROVIDED },
                    'result'
                )
            })

            test('throws on non existent category id', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                    data: {
                        categoryId: faker.datatype.uuid(),
                    },
                }

                await expectToThrowGQLError(
                    async () => { await sendResidentMessageByTestClient(adminClient, payload) },
                    { ...ERRORS.INVALID_CATEGORY_PROVIDED },
                    'result'
                )
            })

            test('throws on non existent notification type', async () => {
                const payload = {
                    type: faker.datatype.uuid(),
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                }

                await expectToThrowGQLError(
                    async () => { await sendResidentMessageByTestClient(adminClient, payload) },
                    { ...ERRORS.INVALID_NOTIFICATION_TYPE_PROVIDED },
                    'result'
                )
            })

            test('throws on empty propertyDetails', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [],
                }

                await expectToThrowGQLError(
                    async () => { await sendResidentMessageByTestClient(adminClient, payload) },
                    { ...ERRORS.PROPERTY_DETAILS_IS_EMPTY },
                    'result'
                )
            })

            test('throws on missing property/billingProperty id', async () => {
                const payload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }, {}],
                }

                await expectToThrowGQLError(
                    async () => { await sendResidentMessageByTestClient(adminClient, payload) },
                    { ...ERRORS.PROPERTY_IS_REQUIRED },
                    'result'
                )
            })
        })
        describe('messages', () => {
            test('sends messages with proper contents to all residents of a property', async () => {
                // Create some residents and sync their users with remoteClients to be able to emulate sending push notifications
                const residentPayload = { address: property.address, addressMeta: property.addressMeta }
                const remoteClientPayload = { devicePlatform: DEVICE_PLATFORM_ANDROID, appId: APP_MASTER_ID_ANDROID }
                const residentsCount = Math.floor(Math.random() * 2) + 2
                let residentUsers = [], residents = []
                for (let i = 0; i < residentsCount; i++) {
                    residentUsers[i] = await makeClientWithResidentUser()

                    const [residentData] = await registerResidentByTestClient(residentUsers[i], residentPayload)

                    residents[i] = residentData
                    await syncRemoteClientWithPushTokenByTestClient(residentUsers[i], remoteClientPayload)
                }

                const { thisMonthStart } = getStartDates()
                const sendMessagePayload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                    data: {
                        categoryId: CATEGORY_HOUSING,
                        title: faker.datatype.uuid(),
                        message: faker.datatype.uuid(),
                        urlTemplate: `payments/addaccount/?residentId={residentId}&categoryId=${CATEGORY_HOUSING}&organizationTIN=${organization.tin}`,
                        period: thisMonthStart,
                    },
                    uniqKeyTemplate: [CATEGORY_HOUSING, thisMonthStart, '{residentId}' ].join(':'),
                }
                const [data] = await sendResidentMessageByTestClient(adminClient, sendMessagePayload)

                expect(data.status).toEqual(SUCCESS_STATUS)

                const residentUserIds = residents.map(resident => resident.user.id)
                const messageWhere = { user: { id_in: residentUserIds }, type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE }

                await waitFor(async () => {
                    const messages = await Message.getAll(adminClient, messageWhere)

                    expect(isEmpty(messages)).toBeFalsy()
                    expect(messages.length).toEqual(residentUsers.length)

                    for (const message of messages) {
                        expect(message.status).toEqual(MESSAGE_SENT_STATUS)
                    }

                })
            })

            test('properly maps billingProperty to property and sends messages with proper content to it\'s residents', async () => {
                // Create some residents and sync their users with remoteClients to be able to emulate sending push notifications
                const residentPayload = { address: property.address, addressMeta: property.addressMeta }
                const remoteClientPayload = { devicePlatform: DEVICE_PLATFORM_ANDROID, appId: APP_MASTER_ID_ANDROID }
                const residentsCount = Math.floor(Math.random() * 2) + 2
                let residentUsers = [], residents = []
                for (let i = 0; i < residentsCount; i++) {
                    residentUsers[i] = await makeClientWithResidentUser()

                    const [residentData] = await registerResidentByTestClient(residentUsers[i], residentPayload)

                    residents[i] = residentData
                    await syncRemoteClientWithPushTokenByTestClient(residentUsers[i], remoteClientPayload)
                }

                const { thisMonthStart } = getStartDates()
                const sendMessagePayload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ billingPropertyId: billingProperty.id }],
                    data: {
                        categoryId: CATEGORY_HOUSING,
                        title: faker.datatype.uuid(),
                        message: faker.datatype.uuid(),
                        urlTemplate: `payments/addaccount/?residentId={residentId}&categoryId=${CATEGORY_HOUSING}&organizationTIN=${organization.tin}`,
                        period: thisMonthStart,
                    },
                    uniqKeyTemplate: [CATEGORY_HOUSING, thisMonthStart, '{residentId}' ].join(':'),
                }
                const [data] = await sendResidentMessageByTestClient(adminClient, sendMessagePayload)

                expect(data.status).toEqual(SUCCESS_STATUS)

                const residentUserIds = residents.map(resident => resident.user.id)
                const messageWhere = { user: { id_in: residentUserIds }, type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE }

                await waitFor(async () => {
                    const messages = await Message.getAll(adminClient, messageWhere)

                    expect(isEmpty(messages)).toBeFalsy()
                    expect(messages.length).toEqual(residentUsers.length)

                    for (const message of messages) {
                        expect(message.status).toEqual(MESSAGE_SENT_STATUS)
                    }
                })
            })

            test('properly fills urlTemplate and uniqKeyTemplate', async () => {
                // Create some residents and sync their users with remoteClients to be able to emulate sending push notifications
                const residentPayload = { address: property.address, addressMeta: property.addressMeta }
                const remoteClientPayload = { devicePlatform: DEVICE_PLATFORM_ANDROID, appId: APP_MASTER_ID_ANDROID }
                const residentUser = await makeClientWithResidentUser()
                const [resident] = await registerResidentByTestClient(residentUser, residentPayload)

                await syncRemoteClientWithPushTokenByTestClient(residentUser, remoteClientPayload)

                const { thisMonthStart } = getStartDates()
                const sendMessagePayload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                    data: {
                        categoryId: CATEGORY_HOUSING,
                        title: faker.datatype.uuid(),
                        message: faker.datatype.uuid(),
                        urlTemplate: `payments/addaccount/?residentId={residentId}&categoryId=${CATEGORY_HOUSING}&organizationTIN=${organization.tin}`,
                        period: thisMonthStart,
                    },
                    uniqKeyTemplate: [CATEGORY_HOUSING, thisMonthStart, '{residentId}' ].join(':'),
                }
                const [data] = await sendResidentMessageByTestClient(adminClient, sendMessagePayload)

                expect(data.status).toEqual(SUCCESS_STATUS)

                const messageWhere = { user: { id_in: [resident.user.id] }, type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE }
                const url = `payments/addaccount/?residentId=${resident.id}&categoryId=${CATEGORY_HOUSING}&organizationTIN=${organization.tin}`
                const uniqKey = [CATEGORY_HOUSING, thisMonthStart, resident.id ].join(':')

                await waitFor(async () => {
                    const messages = await Message.getAll(adminClient, messageWhere)

                    expect(isEmpty(messages)).toBeFalsy()
                    expect(messages.length).toEqual(1)

                    const [message] = messages

                    console.log('message:', JSON.stringify(message, null, 2))

                    expect(message.status).toEqual(MESSAGE_SENT_STATUS)
                    expect(message.uniqKey).toEqual(uniqKey)
                    expect(message.meta.data.url).toEqual(url)
                })
            })


            test('no duplicate notifications sent', async () => {
                // Create some residents and sync their users with remoteClients to be able to emulate sending push notifications
                const residentPayload = { address: property.address, addressMeta: property.addressMeta }
                const remoteClientPayload = { devicePlatform: DEVICE_PLATFORM_ANDROID, appId: APP_MASTER_ID_ANDROID }
                const residentUser = await makeClientWithResidentUser()
                const [resident] = await registerResidentByTestClient(residentUser, residentPayload)

                await syncRemoteClientWithPushTokenByTestClient(residentUser, remoteClientPayload)

                const { thisMonthStart } = getStartDates()
                const sendMessagePayload = {
                    type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE,
                    organizationId: organization.id,
                    propertyDetails: [{ propertyId: property.id }],
                    data: {
                        categoryId: CATEGORY_HOUSING,
                        title: faker.datatype.uuid(),
                        message: faker.datatype.uuid(),
                        urlTemplate: `payments/addaccount/?residentId={residentId}&categoryId=${CATEGORY_HOUSING}&organizationTIN=${organization.tin}`,
                        period: thisMonthStart,
                    },
                    uniqKeyTemplate: [CATEGORY_HOUSING, thisMonthStart, '{residentId}' ].join(':'),
                }
                const [data] = await sendResidentMessageByTestClient(adminClient, sendMessagePayload)

                await sendResidentMessageByTestClient(adminClient, sendMessagePayload)

                expect(data.status).toEqual(SUCCESS_STATUS)

                const messageWhere = { user: { id_in: [resident.user.id] }, type: CUSTOM_CONTENT_MESSAGE_PUSH_TYPE }

                await waitFor(async () => {
                    const messages = await Message.getAll(adminClient, messageWhere)

                    expect(isEmpty(messages)).toBeFalsy()
                    expect(messages.length).toEqual(1)
                    expect(messages[0].status).toEqual(MESSAGE_SENT_STATUS)
                })
            })

        })
    })
})