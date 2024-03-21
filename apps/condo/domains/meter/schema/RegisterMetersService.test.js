/**
 * Generated by `createservice meter.RegisterMetersService --type mutations`
 */
const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')
const { map, flatten } = require('lodash')

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowAuthenticationError,
    expectToThrowAccessDeniedErrorToResult, expectToThrowGQLError,
} = require('@open-condo/keystone/test.utils')

const {
    COLD_WATER_METER_RESOURCE_ID,
} = require('@condo/domains/meter/constants/constants')
const { registerMetersByTestClient, Meter, MeterReading } = require('@condo/domains/meter/utils/testSchema')
const {
    createTestB2BApp,
    createTestB2BAppContext,
    createTestB2BAppAccessRight, createTestB2BAppAccessRightSet,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    createTestOrganization,
    makeEmployeeUserClientWithAbilities,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithResidentUser,
    makeClientWithServiceUser,
} = require('@condo/domains/user/utils/testSchema')

const getItemsForAccessTest = (property) => ([
    {
        address: property.address,
        unitType: 'flat',
        unitName: faker.random.alphaNumeric(4),
        accountNumber: faker.random.alphaNumeric(12),
        meters: [
            {
                numberOfTariffs: 1,
                resourceTypeId: COLD_WATER_METER_RESOURCE_ID,
                number: faker.random.numeric(8),
                readings: [{
                    date: dayjs().toISOString(),
                    v1: faker.random.numeric(3),
                    v2: faker.random.numeric(4),
                }],
            },
        ],
    },
])

describe('RegisterMetersService', () => {

    let adminClient, supportClient, residentClient, anonymousClient

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        residentClient = await makeClientWithResidentUser()
        anonymousClient = await makeClient()
    })

    describe('access to execution', () => {

        let o10n

        beforeAll(async () => {
            [o10n] = await createTestOrganization(adminClient)
        })

        test('admin can', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, o10n)
            const items = getItemsForAccessTest(property)
            const [data] = await registerMetersByTestClient(adminClient, o10n, items)

            const meters = await Meter.getAll(adminClient, {
                organization: { id: o10n.id },
                property: { id: property.id },
            })
            expect(meters).toHaveLength(1)
            expect(meters[0].number).toBe(items[0].meters[0].number)

            const metersReadings = await MeterReading.getAll(adminClient, { meter: { id_in: map(meters, 'id') } })
            expect(metersReadings).toHaveLength(1)
            expect(metersReadings[0].date).toBe(items[0].meters[0].readings[0].date)

            expect(data).toEqual({
                items: [{
                    address: items[0].address,
                    accountNumber: items[0].accountNumber,
                    result: {
                        error: null,
                        data: {
                            propertyId: property.id,
                            meters: [{
                                number: items[0].meters[0].number,
                                result: {
                                    error: null,
                                    data: {
                                        id: meters[0].id,
                                        readings: [{
                                            v1: items[0].meters[0].readings[0].v1,
                                            v2: items[0].meters[0].readings[0].v2,
                                            v3: null,
                                            v4: null,
                                            result: {
                                                error: null,
                                                data: {
                                                    id: metersReadings[0].id,
                                                },
                                            },
                                        }],
                                    },
                                },
                            }],
                        },
                    },
                }],
            })
        })

        test('support can', async () => {
            const [o10n] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, o10n)
            const items = getItemsForAccessTest(property)
            const [data] = await registerMetersByTestClient(supportClient, o10n, items)

            const meters = await Meter.getAll(adminClient, {
                organization: { id: o10n.id },
                property: { id: property.id },
            })
            expect(meters).toHaveLength(1)
            expect(meters[0].number).toBe(items[0].meters[0].number)

            const metersReadings = await MeterReading.getAll(adminClient, { meter: { id_in: map(meters, 'id') } })
            expect(metersReadings).toHaveLength(1)
            expect(metersReadings[0].date).toBe(items[0].meters[0].readings[0].date)

            expect(data).toEqual({
                items: [{
                    address: items[0].address,
                    accountNumber: items[0].accountNumber,
                    result: {
                        error: null,
                        data: {
                            propertyId: property.id,
                            meters: [{
                                number: items[0].meters[0].number,
                                result: {
                                    error: null,
                                    data: {
                                        id: meters[0].id,
                                        readings: [{
                                            v1: items[0].meters[0].readings[0].v1,
                                            v2: items[0].meters[0].readings[0].v2,
                                            v3: null,
                                            v4: null,
                                            result: {
                                                error: null,
                                                data: {
                                                    id: metersReadings[0].id,
                                                },
                                            },
                                        }],
                                    },
                                },
                            }],
                        },
                    },
                }],
            })
        })

        describe('staff', () => {
            test('with permissions can', async () => {
                const staffClient = await makeEmployeeUserClientWithAbilities({
                    canManageMeters: true,
                    canManageMeterReadings: true,
                })

                const items = getItemsForAccessTest(staffClient.property)
                const [data] = await registerMetersByTestClient(staffClient, staffClient.organization, items)

                const meters = await Meter.getAll(adminClient, {
                    organization: { id: staffClient.organization.id },
                    property: { id: staffClient.property.id },
                })
                expect(meters).toHaveLength(1)
                expect(meters[0].number).toBe(items[0].meters[0].number)

                const metersReadings = await MeterReading.getAll(adminClient, { meter: { id_in: map(meters, 'id') } })
                expect(metersReadings).toHaveLength(1)
                expect(metersReadings[0].date).toBe(items[0].meters[0].readings[0].date)

                expect(data).toEqual({
                    items: [{
                        address: items[0].address,
                        accountNumber: items[0].accountNumber,
                        result: {
                            error: null,
                            data: {
                                propertyId: staffClient.property.id,
                                meters: [{
                                    number: items[0].meters[0].number,
                                    result: {
                                        error: null,
                                        data: {
                                            id: meters[0].id,
                                            readings: [{
                                                v1: items[0].meters[0].readings[0].v1,
                                                v2: items[0].meters[0].readings[0].v2,
                                                v3: null,
                                                v4: null,
                                                result: {
                                                    error: null,
                                                    data: {
                                                        id: metersReadings[0].id,
                                                    },
                                                },
                                            }],
                                        },
                                    },
                                }],
                            },
                        },
                    }],
                })
            })

            test('without permissions can\'t', async () => {
                const staffClient = await makeEmployeeUserClientWithAbilities({
                    canManageMeters: false,
                    canManageMeterReadings: false,
                })

                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await registerMetersByTestClient(staffClient, staffClient.organization, [])
                })
            })
        })

        describe('service user', () => {
            test('with access rights can', async () => {
                const serviceClient = await makeClientWithServiceUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, o10n)

                const [app] = await createTestB2BApp(adminClient)
                await createTestB2BAppContext(adminClient, app, o10n, { status: 'Finished' })
                const [accessRightSet] = await createTestB2BAppAccessRightSet(adminClient, app, {
                    canExecuteRegisterMeters: true,
                })
                await createTestB2BAppAccessRight(adminClient, serviceClient.user, app, accessRightSet)

                const items = getItemsForAccessTest(property)
                const [data] = await registerMetersByTestClient(serviceClient, o10n, items)

                const meters = await Meter.getAll(adminClient, {
                    organization: { id: o10n.id },
                    property: { id: property.id },
                })
                expect(meters).toHaveLength(1)
                expect(meters[0].number).toBe(items[0].meters[0].number)

                const metersReadings = await MeterReading.getAll(adminClient, { meter: { id_in: map(meters, 'id') } })
                expect(metersReadings).toHaveLength(1)
                expect(metersReadings[0].date).toBe(items[0].meters[0].readings[0].date)

                expect(data).toEqual({
                    items: [{
                        address: items[0].address,
                        accountNumber: items[0].accountNumber,
                        result: {
                            error: null,
                            data: {
                                propertyId: property.id,
                                meters: [{
                                    number: items[0].meters[0].number,
                                    result: {
                                        error: null,
                                        data: {
                                            id: meters[0].id,
                                            readings: [{
                                                v1: items[0].meters[0].readings[0].v1,
                                                v2: items[0].meters[0].readings[0].v2,
                                                v3: null,
                                                v4: null,
                                                result: {
                                                    error: null,
                                                    data: {
                                                        id: metersReadings[0].id,
                                                    },
                                                },
                                            }],
                                        },
                                    },
                                }],
                            },
                        },
                    }],
                })
            })

            test('without permissions can\'t', async () => {
                const serviceClient = await makeClientWithServiceUser()
                const [o10n] = await createTestOrganization(adminClient)

                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await registerMetersByTestClient(serviceClient, o10n, [])
                })
            })
        })

        test('resident can\'t execute', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerMetersByTestClient(residentClient, o10n, [])
            })
        })

        test('anonymous can\'t execute', async () => {
            await expectToThrowAuthenticationError(async () => {
                await registerMetersByTestClient(anonymousClient, o10n, [])
            }, 'result')
        })
    })

    test('error on too much items', async () => {
        const [o10n] = await createTestOrganization(adminClient)
        await expectToThrowGQLError(
            async () => await registerMetersByTestClient(
                adminClient,
                o10n,
                flatten(Array(501).fill(getItemsForAccessTest({ address: faker.address.streetAddress(true) }))),
            ),
            {
                code: 'BAD_USER_INPUT',
                type: 'TOO_MUCH_ITEMS',
                message: 'Too much items. Maximum is 500.',
            },
            'result',
        )
    })

    test('Check for Meter model error: cannot create Meter if Meter with same accountNumber exist in user organization in other unit', async () => {
        const [o10n] = await createTestOrganization(adminClient)
        const [property1] = await createTestProperty(adminClient, o10n)
        const [property2] = await createTestProperty(adminClient, o10n)

        const accountNumber = faker.random.alphaNumeric(12)

        const items1 = getItemsForAccessTest(property1)
        items1[0].accountNumber = accountNumber

        await registerMetersByTestClient(adminClient, o10n, items1)

        const items2 = getItemsForAccessTest(property2)
        items2[0].accountNumber = accountNumber

        const [data] = await registerMetersByTestClient(adminClient, o10n, items2)
        expect(data).toEqual({
            items: [{
                address: items2[0].address,
                accountNumber: items2[0].accountNumber,
                result: {
                    error: null,
                    data: {
                        propertyId: property2.id,
                        meters: [{
                            number: items2[0].meters[0].number,
                            result: {
                                error: {
                                    message: '[unique:alreadyExists:accountNumber] Meter with same account number exist in current organization in other unit',
                                },
                                data: null,
                            },
                        }],
                    },
                },
            }],
        })
    })
})
