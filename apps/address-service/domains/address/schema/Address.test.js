/**
 * Generated by `createschema address.Address 'source:Text; address:Text; key:Text; meta:Json'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@address-service/domains/user/utils/testSchema')

const { Address, createTestAddress, updateTestAddress } = require('@address-service/domains/address/utils/testSchema')

describe('Address', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                // 1) prepare data
                const admin = await makeLoggedInAdminClient()

                // 2) action
                const [obj, attrs] = await createTestAddress(admin)

                // 3) check
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

            test('support can\'t', async () => {
                const client = await makeClientWithSupportUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestAddress(client)
                })
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestAddress(client)
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestAddress(client)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const [obj, attrs] = await updateTestAddress(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('support can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const client = await makeClientWithSupportUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestAddress(client, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestAddress(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestAddress(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Address.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Address.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestAddress(admin)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await Address.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestAddress(admin)

                const objs = await Address.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()

                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestAddress(admin)

                const objs = await Address.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestAddress(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await Address.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestAddress(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await Address.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    test.todo('Test address key generation')
})
