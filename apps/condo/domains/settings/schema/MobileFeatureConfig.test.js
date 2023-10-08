/**
 * Generated by `createschema settings.MobileFeatureConfig 'organization:Relationship:Organization:CASCADE; emergencyPhone:Text; commonPhone:Text; onlyGreaterThanPreviousMeterReadingIsEnabled:Checkbox; meta:Json; ticketSubmittingIsEnabled:Checkbox'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, expectValuesOfCommonFields, catchErrorFrom, expectToThrowGQLError } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { createTestOrganization, createTestOrganizationEmployee, createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { MobileFeatureConfig, createTestMobileFeatureConfig, updateTestMobileFeatureConfig } = require('@condo/domains/settings/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')


describe('MobileFeatureConfig', () => {
    let admin, support
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
    })
    describe('CRUD tests', () => {
        describe('accesses', () => {
            describe('admin', () => {
                test('can create', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [obj, attrs] = await createTestMobileFeatureConfig(admin, organization)

                    expectValuesOfCommonFields(obj, attrs, admin)
                })

                test('can update', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [objCreated] = await createTestMobileFeatureConfig(admin, organization)

                    const [obj, attrs] = await updateTestMobileFeatureConfig(admin, objCreated.id)

                    expect(obj.dv).toEqual(1)
                    expect(obj.sender).toEqual(attrs.sender)
                    expect(obj.v).toEqual(2)
                    expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                })

                test('can\'t hard delete', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [objCreated] = await createTestMobileFeatureConfig(admin, organization)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await MobileFeatureConfig.delete(admin, objCreated.id)
                    })
                })

                test('can read', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [obj, attrs] = await createTestMobileFeatureConfig(admin, organization)

                    const objs = await MobileFeatureConfig.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                    expect(objs.length).toBeGreaterThanOrEqual(1)
                    expect(objs).toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            id: obj.id,
                        }),
                    ]))
                })
            })

            describe('support', () => {
                test('can create', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [obj, attrs] = await createTestMobileFeatureConfig(support, organization)

                    expectValuesOfCommonFields(obj, attrs, support)
                })

                test('can update', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [objCreated] = await createTestMobileFeatureConfig(support, organization)

                    const [obj, attrs] = await updateTestMobileFeatureConfig(support, objCreated.id)

                    expect(obj.dv).toEqual(1)
                    expect(obj.sender).toEqual(attrs.sender)
                    expect(obj.v).toEqual(2)
                    expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
                })

                test('can\'t hard delete', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [objCreated] = await createTestMobileFeatureConfig(support, organization)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await MobileFeatureConfig.delete(support, objCreated.id)
                    })
                })

                test('can read', async () => {
                    const [organization] = await createTestOrganization(admin)

                    const [obj, attrs] = await createTestMobileFeatureConfig(support, organization)

                    const objs = await MobileFeatureConfig.getAll(support, {}, { sortBy: ['updatedAt_DESC'] })

                    expect(objs.length).toBeGreaterThanOrEqual(1)
                    expect(objs).toEqual(expect.arrayContaining([
                        expect.objectContaining({
                            id: obj.id,
                        }),
                    ]))
                })
            })

            describe('anonymous', () => {
                test('can\'t create', async () => {
                    const client = await makeClient()
                    await expectToThrowAuthenticationErrorToObj(async () => {
                        await createTestMobileFeatureConfig(client, { id: 'id' })
                    })
                })

                test('can\'t update', async () => {
                    const client = await makeClient()
                    await expectToThrowAuthenticationErrorToObj(async () => {
                        await updateTestMobileFeatureConfig(client, 'id')
                    })
                })

                test('can\'t hard delete', async () => {
                    const client = await makeClient()
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await MobileFeatureConfig.delete(client, 'id')
                    })
                })

                test('can\'t read', async () => {
                    const client = await makeClient()
                    await expectToThrowAuthenticationErrorToObjects(async () => {
                        await MobileFeatureConfig.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                    })
                })
            })


            describe('employee', () => {
                test('can create', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)

                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageMobileFeatureConfigs: true,
                    })
                    await createTestOrganizationEmployee(admin, organization, client.user, role)

                    const [obj, attrs] = await createTestMobileFeatureConfig(client, organization)

                    expect(obj.id).toMatch(UUID_RE)
                    expect(obj.dv).toEqual(1)
                    expect(obj.sender).toEqual(attrs.sender)
                    expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
                })

                test('can update', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)

                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageMobileFeatureConfigs: true,
                    })
                    await createTestOrganizationEmployee(admin, organization, client.user, role)

                    const [objCreated] = await createTestMobileFeatureConfig(admin, organization)

                    const [obj, attrs] = await updateTestMobileFeatureConfig(client, objCreated.id)

                    expect(obj.id).toMatch(UUID_RE)
                    expect(obj.dv).toEqual(1)
                    expect(obj.sender).toEqual(attrs.sender)
                    expect(obj.v).toEqual(2)
                    expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
                })

                test('can\'t delete', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await MobileFeatureConfig.delete(client, 'id')
                    })
                })

                test('can read', async () => {
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)

                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
                    await createTestOrganizationEmployee(admin, organization, client.user, role)

                    const [objCreated] = await createTestMobileFeatureConfig(admin, organization)

                    const objs = await MobileFeatureConfig.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

                    expect(objs).toHaveLength(1)
                    expect(objs[0]).toMatchObject({
                        id: objCreated.id,
                    })
                })
            })
        })

        describe('Validation tests', () => {

            test('organization uniq constraint', async () => {
                const [organization] = await createTestOrganization(admin)

                await createTestMobileFeatureConfig(admin, organization, {
                    commonPhone: undefined,
                    ticketSubmittingIsDisabled: false,
                })

                await catchErrorFrom(async () => {
                    await createTestMobileFeatureConfig(admin, organization, {
                        ticketSubmittingIsDisabled: false,
                    })
                }, ({ errors, data }) => {
                    expect(errors[0].message).toMatch('duplicate key value violates unique constraint "mobilefeatureconfig_unique_organization"')
                    expect(data).toEqual({ 'obj': null })
                })


            })

            test('TICKET_SUBMITTING_PHONES_NOT_CONFIGURED', async () => {
                const [organization] = await createTestOrganization(admin)

                await expectToThrowGQLError(
                    async () => await createTestMobileFeatureConfig(admin, organization, {
                        commonPhone: undefined,
                        ticketSubmittingIsDisabled: true,
                    }),
                    {
                        code: 'BAD_USER_INPUT',
                        type: 'TICKET_SUBMITTING_PHONES_NOT_CONFIGURED',
                        message: 'commonPhone field not specified',
                    })
            })

            test('COMMON_PHONE_INVALID', async () => {
                const [organization] = await createTestOrganization(admin)

                await expectToThrowGQLError(
                    async () => await createTestMobileFeatureConfig(admin, organization, {
                        commonPhone: 'undefined',
                        ticketSubmittingIsDisabled: true,
                    }),
                    {
                        code: 'BAD_USER_INPUT',
                        type: 'WRONG_PHONE_FORMAT',
                        message: 'Wrong phone number format',
                    })
            })
        })
    })
})
