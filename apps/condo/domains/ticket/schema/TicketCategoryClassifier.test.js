/**
 * Generated by `createschema ticket.TicketCategoryClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */

const { makeLoggedInAdminClient, makeClient, makeLoggedInClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { createTestUser } = require('@condo/domains/user/utils/testSchema')
const {
    TicketCategoryClassifier,
    createTestTicketCategoryClassifier,
    updateTestTicketCategoryClassifier,
} = require('@condo/domains/ticket/utils/testSchema')
const {
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
} = require('@condo/domains/common/utils/testSchema')
const faker = require('faker')

describe('TicketCategoryClassifier CRUD', () => {
    describe('User', () => {
        it('can not create', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketCategoryClassifier(client)
            })
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            const [objCreated, attrs] = await createTestTicketCategoryClassifier(admin)
            const objs = await TicketCategoryClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs[0].id).toMatch(objCreated.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(objCreated.createdAt)
            expect(objs[0].updatedAt).toMatch(objCreated.updatedAt)
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [_, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const payload = { name: faker.lorem.word() }
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketCategoryClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const client = await makeLoggedInClient(userAttrs)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketCategoryClassifier.delete(client, objCreated.id)
            })
        })
    })
    describe('Support', () => {
        it('can create', async () => {
            const support = await makeClientWithSupportUser()
            const [obj, attrs] = await createTestTicketCategoryClassifier(support)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })
        it('can read', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated, attrs] = await createTestTicketCategoryClassifier(admin)
            const objs = await TicketCategoryClassifier.getAll(support, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs[0].id).toMatch(objCreated.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].newId).toEqual(null)
            expect(objs[0].deletedAt).toEqual(null)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(objCreated.createdAt)
            expect(objs[0].updatedAt).toMatch(objCreated.updatedAt)
        })
        it('can update', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const payload = { name: faker.lorem.word() }
            const [obj] = await updateTestTicketCategoryClassifier(support, objCreated.id, payload)
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            expect(obj.name).toEqual(payload.name)
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const support = await makeClientWithSupportUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketCategoryClassifier.delete(support, objCreated.id)
            })
        })
    })
    describe('Anonymous', () => {
        it('can not create', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestTicketCategoryClassifier(client)
            })
        })
        it('can read', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await TicketCategoryClassifier.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
            })
        })
        it('can not update', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const client = await makeClient()
            const payload = { name: faker.lorem.word() }
            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestTicketCategoryClassifier(client, objCreated.id, payload)
            })
        })
        it('can not delete', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestTicketCategoryClassifier(admin)
            const client = await makeClient()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketCategoryClassifier.delete(client, objCreated.id)
            })
        })
    })
})
