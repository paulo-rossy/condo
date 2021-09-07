/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */

const { DEFAULT_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')
const { createTestOrganizationEmployee } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const {
    OrganizationEmployeeRole,
    createTestOrganizationEmployeeRole,
    updateTestOrganizationEmployeeRole,
} = require('@condo/domains/organization/utils/testSchema')
const {
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
} = require('@condo/domains/common/utils/testSchema')
const { getTranslations, getAvailableLocales } = require('@condo/domains/common/utils/localesLoader')
const { DEFAULT_ROLES } = require('../constants/common')
const { makeClientWithRegisteredOrganization } = require('../utils/testSchema/Organization')

describe('OrganizationEmployeeRole', () => {
    describe('defaults', () => {
        it('has default values for ability attributes, according to schema defaults', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [obj] = await createTestOrganizationEmployeeRole(admin, organization)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.canManageOrganization).toBeFalsy()
            expect(obj.canManageEmployees).toBeFalsy()
            expect(obj.canManageRoles).toBeFalsy()
            expect(obj.canManageIntegrations).toBeFalsy()
            expect(obj.canManageProperties).toBeFalsy()
            expect(obj.canManageTickets).toBeFalsy()
            expect(obj.canManageContacts).toBeFalsy()
            expect(obj.canManageTicketComments).toBeTruthy()
            expect(obj.canManageDivisions).toBeFalsy()
            expect(obj.canShareTickets).toBeTruthy()
            expect(obj.canBeAssignedAsResponsible).toBeTruthy()
            expect(obj.canBeAssignedAsExecutor).toBeTruthy()
        })
    })
    describe('user: create OrganizationEmployeeRole', () => {
        it('can with granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            const [obj, attrs] = await createTestOrganizationEmployeeRole(managerUserClient, organization)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.name).toEqual(attrs.name)
            expect(obj.statusTransitions).toMatchObject(DEFAULT_STATUS_TRANSITIONS)
            expect(obj.organization).toEqual(expect.objectContaining({ id: organization.id }))
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })

        it('cannot without granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestOrganizationEmployeeRole(notManagerUserClient, organization)
            })
        })
    })

    test('anonymous: create OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const anonymous = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestOrganizationEmployeeRole(anonymous, organization)
        })
    })

    describe('user: read OrganizationEmployeeRole', () => {
        it('can only for organization it employed in', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role, attrs] = await createTestOrganizationEmployeeRole(admin, organization)
            const employeeUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, employeeUserClient.user, role)

            const [anotherOrganization] = await createTestOrganization(admin)
            await createTestOrganizationEmployeeRole(admin, anotherOrganization)

            const objs = await OrganizationEmployeeRole.getAll(employeeUserClient, {}, { sortBy: ['updatedAt_DESC'] })

            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(role.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(role.createdAt)
            expect(objs[0].updatedAt).toMatch(role.updatedAt)
        })
    })

    test('anonymous: read OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        await createTestOrganizationEmployeeRole(admin, organization)

        const anonymous = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await OrganizationEmployeeRole.getAll(anonymous)
        })
    })

    describe('user: update OrganizationEmployeeRole', () => {
        it('can with granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            const [objUpdated, attrs] = await updateTestOrganizationEmployeeRole(managerUserClient, role.id)

            expect(objUpdated.id).toEqual(role.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.name).toEqual(attrs.name)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        })

        it('cannot without granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: false,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestOrganizationEmployeeRole(managerUserClient, role.id)
            })
        })
    })

    test('anonymous: update OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: false,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestOrganizationEmployeeRole(client, role.id)
        })
    })

    test('user: delete OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: true,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        let thrownError
        try {
            await OrganizationEmployeeRole.delete(managerUserClient, role.id)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        // Method `toMatchObject` is not suitable here, because error message contains suggestions, generated by Keystone:
        // > Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation". Did you mean "createOrganizationEmployeeRole", "deleteOrganizationEmployee", "deleteOrganizationEmployees", "updateOrganizationEmployeeRole", or "createOrganizationEmployeeRoles"?
        // We don't know this suggestions list in advance.
        expect(thrownError.errors[0].message).toMatch('Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation"')
        expect(thrownError.errors[0].name).toMatch('ValidationError')
    })

    test('anonymous: delete OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: true,
        })

        const anonymous = await makeClient()
        let thrownError
        try {
            await OrganizationEmployeeRole.delete(anonymous, role.id)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        // Method `toMatchObject` is not suitable here, because error message contains suggestions, generated by Keystone:
        // > Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation". Did you mean "createOrganizationEmployeeRole", "deleteOrganizationEmployee", "deleteOrganizationEmployees", "updateOrganizationEmployeeRole", or "createOrganizationEmployeeRoles"?
        // We don't know this suggestions list in advance.
        expect(thrownError.errors[0].message).toMatch('Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation"')
        expect(thrownError.errors[0].name).toMatch('ValidationError')
    })

    test.each(getAvailableLocales())('localization [%s]: static roles has translations', async (locale) => {
        const translations = getTranslations(locale)

        const client = await makeClientWithRegisteredOrganization()
        client.setHeaders({
            'Accept-Language': locale,
        })

        const defaultRolesInstances = await OrganizationEmployeeRole.getAll(client, {
            organization: { id: client.organization.id },
        })
        Object.values(DEFAULT_ROLES).forEach((staticRole) => {
            const nameTranslation = translations[staticRole.name]
            const descriptionTranslation = translations[staticRole.description]
            const defaultRoleInstance = Object.values(defaultRolesInstances).find(
                (x) => x.name === nameTranslation && x.description === descriptionTranslation,
            )
            expect(defaultRoleInstance).toBeDefined()
        })
    })
})
