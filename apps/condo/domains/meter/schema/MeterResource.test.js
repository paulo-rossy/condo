/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 */
const { expectToThrowAccessDeniedErrorToObj } = require('@open-condo/keystone/test.utils')
const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')

const { COLD_WATER_METER_RESOURCE_ID } = require('@condo/domains/meter/constants/constants')
const { createTestMeterResource, updateTestMeterResource } = require('@condo/domains/meter/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const { MeterResource } = require('../utils/testSchema')

const METER_RESOURCE_NAME_NON_LOCALIZED_TEMPLATE_REGEXP = /^meterResource\.([a-zA-Z])+\.name$/
const METER_RESOURCE_MEASURE_NON_LOCALIZED_TEMPLATE_REGEXP = /^meterResource\.([a-zA-Z])+\.measure$/

describe('MeterResource', () => {
    describe('Create', () => {
        test('user: cannot create MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterResource(client)
            })
        })

        test('anonymous: cannot create Meter', async () => {
            const client = await makeClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterResource(client)
            })
        })

        test('admin: cannot create Meter', async () => {
            const admin = await makeLoggedInAdminClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterResource(admin)
            })
        })
    })
    describe('Update', () => {
        test('user: cannot create MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(client, resource.id, {})
            })
        })

        test('anonymous: cannot update Meter', async () => {
            const client = await makeClient()
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(client, resource.id, {})
            })
        })

        test('admin: cannot update Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const [resource] = await MeterResource.getAll(admin, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(admin, resource.id, {})
            })
        })
    })
    describe('Soft delete', () => {
        test('user: cannot soft delete MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(client, resource.id, {})
            })
        })

        test('anonymous: cannot soft delete Meter', async () => {
            const client = await makeClient()
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(client, resource.id, {})
            })
        })

        test('admin: cannot soft delete Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const [resource] = await MeterResource.getAll(admin, { id: COLD_WATER_METER_RESOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterResource(admin, resource.id, {})
            })
        })
    })
    describe('Read', () => {
        test('user: can read MeterReadingSources', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const sources = await MeterResource.getAll(client, {})

            expect(sources.length).toBeGreaterThan(0)
            sources.forEach(source => {
                expect(source.nameNonLocalized).toMatch(METER_RESOURCE_NAME_NON_LOCALIZED_TEMPLATE_REGEXP)
                expect(source.measureNonLocalized).toMatch(METER_RESOURCE_MEASURE_NON_LOCALIZED_TEMPLATE_REGEXP)
            })
        })

        test('anonymous: cannot read MeterReadingSources', async () => {
            const client = await makeClient()
            const sources = await MeterResource.getAll(client, {})

            expect(sources.length).toBeGreaterThan(0)
        })

        test('admin: can read MeterReadingSources', async () => {
            const admin = await makeLoggedInAdminClient()
            const sources = await MeterResource.getAll(admin, {})

            expect(sources.length).toBeGreaterThan(0)
        })
    })
})
