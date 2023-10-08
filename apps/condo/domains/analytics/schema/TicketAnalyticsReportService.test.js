/**
 * Generated by `createservice ticket.TicketAnalyticsReportService`
 */
const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')

const { expectToThrowAuthenticationErrorToResult, expectToThrowGraphQLRequestError, expectToThrowAccessDeniedErrorToResult } = require('@open-condo/keystone/test.utils')
const { makeClient, makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')

const { getTicketAnalyticsReport, getTicketAnalyticsExport  } = require('@condo/domains/analytics/utils/testSchema')
const isObsConfigured = require('@condo/domains/common/utils/testSchema/isObsConfigured')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestTicket, makeClientWithTicket, createTestTicketCategoryClassifier } = require('@condo/domains/ticket/utils/testSchema')
const { createTestUser, makeLoggedInClient } = require('@condo/domains/user/utils/testSchema')

const NULL_REPLACES = {
    categoryClassifier: 'categoryClassifier not set',
    executor: 'executor not set',
    assignee: 'assignee not set',
}

describe('TicketAnalyticsReportService', () => {
    describe('Validations', () => {
        it('receives error when incorrect groupBy field is passed', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPayable: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            await expectToThrowGraphQLRequestError(async () => {
                await getTicketAnalyticsReport(client, {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                            { property: { id_in: [ client.property.id ] } },
                            { isPayable: false },
                            { isEmergency: false },
                        ],
                    },
                    groupBy: ['status', faker.datatype.string()],
                    nullReplaces: NULL_REPLACES,
                })
            }, 'got invalid value')
        })
    })

    describe('User', () => {
        it('can read TicketAnalyticsReportService grouped counts [day, status]', async () => {
            const client = await makeClientWithTicket()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'day', 'status' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.some(group => group.count === 2)).toBeTruthy()
        })

        it('can read TicketAnalyticsReportService grouped counts [status, day]', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPayable: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                        { isEmergency: true },
                    ],
                },
                groupBy: [ 'status', 'day' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.some(group => group.count === 1)).toBeTruthy()
        })

        it('can read TicketAnalyticsReportService groupped with property filter', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPayable: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                        { property: { id_in: [ client.property.id ] } },
                        { isPayable: false },
                        { isEmergency: false },
                    ],
                },
                groupBy: [ 'property', 'status' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups[0].count).toEqual(1)
            expect(result.groups[0].property).toEqual(client.property.address)
        })

        it('can read TicketAnalyticsReportService with property and categoryClassifier filter', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const [categoryClassifier] = await createTestTicketCategoryClassifier(admin)

            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPayable: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                        { property: { id_in: [ client.property.id ] } },
                        { categoryClassifier: { id_in: [ categoryClassifier.id ] } },
                        { isPayable: false },
                        { isEmergency: false },
                    ],
                },
                groupBy: [ 'categoryClassifier', 'status' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.every(group => group.categoryClassifier === categoryClassifier.name)).toBeTruthy()
        })

        it('can read TicketAnalyticsReportService grouped counts [status, executor]', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property, {
                executor: { connect: { id: client.user.id } },
            })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'status', 'executor' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
        })

        it('can read TicketAnalyticsReportService with null assignee', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'status', 'assignee' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
            expect(result.groups.every(group => group.assignee !== null)).toBeTruthy()
            expect(result.groups.filter(group => group.count === 1)[0].assignee).toStrictEqual(NULL_REPLACES['assignee'])
        })

        it('can read TicketAnalyticsReportService with null categoryClassifier', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'status', 'categoryClassifier' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
            expect(result.groups.every(group => group.categoryClassifier !== null)).toBeTruthy()
            expect(result.groups.filter(group => group.count === 1)[0].categoryClassifier)
                .toStrictEqual(NULL_REPLACES['categoryClassifier'])
        })

        it('can read TicketAnalyticsReportService with null executor', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'status', 'executor' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
            expect(result.groups.every(group => group.executor !== null)).toBeTruthy()
            expect(result.groups.filter(group => group.count === 1)[0].executor)
                .toStrictEqual(NULL_REPLACES['executor'])
        })

        it('can read TicketAnalyticsReportService [status, executor] with id_in filter', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property, {
                executor: { connect: { id: client.user.id } },
            })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                        { executor: { id_in: [client.user.id] } },
                    ],
                },
                groupBy: [ 'status', 'executor' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
        })

        it('can read TicketAnalyticsReportService grouped counts [status, assignee]', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property, {
                assignee: { connect: { id: client.user.id } },
            })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'status', 'assignee' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
        })

        it('can read TicketAnalyticsReportService [status, assignee] with id_in filter', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property, {
                assignee: { connect: { id: client.user.id } },
            })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                        { assignee: { id_in: [client.user.id] } },
                    ],
                },
                groupBy: [ 'status', 'assignee' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(result).toHaveProperty('groups')
            expect(result.groups).toBeDefined()
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.filter(group => group.count === 1)).toHaveLength(1)
        })

        it('can not read TicketAnalyticsReportService from another organization', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const wrongClient = await makeClientWithProperty()
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            const [emptyResult] = await getTicketAnalyticsReport(wrongClient, {
                where: {
                    organization: { id: wrongClient.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'day', 'status' ],
                nullReplaces: NULL_REPLACES,
            })

            const [result] = await getTicketAnalyticsReport(client, {
                where: {
                    organization: { id: client.organization.id },
                    AND: [
                        { createdAt_gte: dateStart.toISOString() },
                        { createdAt_lte: dateEnd.toISOString() },
                    ],
                },
                groupBy: [ 'day', 'status' ],
                nullReplaces: NULL_REPLACES,
            })

            expect(emptyResult).toHaveProperty('groups')
            expect(emptyResult.groups).toMatchObject({})
            expect(result).toHaveProperty('groups')
            expect(result.groups.length).toBeGreaterThanOrEqual(1)
            expect(result.groups.some(group => group.count === 1)).toBeTruthy()
            expect(emptyResult.groups).not.toStrictEqual(result.groups)
        })

        it('can read exportTicketAnalyticsToExcel with selected organization', async () => {
            if (isObsConfigured()) {
                const client = await makeClientWithProperty()
                await createTestTicket(client, client.organization, client.property)
                const dateStart = dayjs().startOf('week')
                const dateEnd = dayjs().endOf('week')

                const [result] = await getTicketAnalyticsExport(client, {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: ['status', 'day'],
                    translates: {
                        property: client.property.address,
                    },
                    nullReplaces: NULL_REPLACES,
                })

                expect(result).toHaveProperty('link')
                expect(result.link).not.toHaveLength(0)
            }
        })

        it('can not read exportTicketAnalyticsToExcel from another organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const restrictedClient = await makeLoggedInClient(userAttrs)
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await getTicketAnalyticsExport(restrictedClient, {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: ['day', 'status'],
                    translates: {
                        property: client.property.address,
                    },
                    nullReplaces: NULL_REPLACES,
                })
            })
        })
    })

    describe('Anonymous', () => {
        it('can not read TicketAnalyticsReportService', async () => {
            const client = await makeClient()
            const clientWithProperty = await makeClientWithProperty()
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')

            await expectToThrowAuthenticationErrorToResult(async () => {
                await getTicketAnalyticsReport(client, {
                    where: {
                        organization: { id: clientWithProperty.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: [ 'day', 'status' ],
                    nullReplaces: NULL_REPLACES,
                })
            })
        })

        it('can not get ticket analytics export', async () => {
            const anonymousClient = await makeClient()
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            await expectToThrowAuthenticationErrorToResult(async () => {
                await getTicketAnalyticsExport(anonymousClient, {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: ['day', 'status'],
                    translates: {
                        property: client.property.address,
                    },
                    nullReplaces: NULL_REPLACES,
                })
            })
        })
    })
})
