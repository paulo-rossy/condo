/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@condo/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@condo/keystone/test.utils')

const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const { BankCategory, createTestBankCategory, updateTestBankCategory } = require('@condo/domains/banking/utils/testSchema')

describe('BankCategory', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()

                const [obj, attrs] = await createTestBankCategory(admin)

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
                expect(obj.name).toMatch(attrs.name)
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankCategory(client)
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankCategory(client)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                const [obj, attrs] = await updateTestBankCategory(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankCategory(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankCategory(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestBankCategory(admin)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestBankCategory(admin)

                const objs = await BankCategory.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        name: obj.name,
                    }),
                ]))
            })

            test('user can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj] = await createTestBankCategory(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const objs = await BankCategory.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    name: obj.name,
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                await createTestBankCategory(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankCategory.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })  // TODO(codegen): write 'anonymous: read BankCategory' test
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            // TODO(codegen): check it!
        })
    })
})
