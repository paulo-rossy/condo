/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const faker = require('faker')
const { createTestPhone } = require('@condo/domains/user/utils/testSchema')
const { createTestEmail } = require('@condo/domains/user/utils/testSchema')
const { acceptOrRejectOrganizationInviteById } = require('@condo/domains/organization/utils/testSchema/Organization')
const { inviteNewOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { updateTestUser } = require('@condo/domains/user/utils/testSchema')
const { makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('../utils/testSchema')
const { createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient, DATETIME_RE } = require('@core/keystone/test.utils')
const { pick } = require('lodash')

const {
    OrganizationEmployee,
    createTestOrganizationEmployee,
    updateTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const {
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
} = require('../../common/utils/testSchema')
const { createTestTicketCategoryClassifier } = require('@condo/domains/ticket/utils/testSchema')

describe('OrganizationEmployee', () => {
    describe('user: create OrganizationEmployee', () => {
        test('cannot without granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestOrganizationEmployee(notManagerUserClient, organization, user, role)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()

            const [categoryClassifier1] = await createTestTicketCategoryClassifier(admin)
            const [categoryClassifier2] = await createTestTicketCategoryClassifier(admin)

            const [obj, attrs] = await createTestOrganizationEmployee(managerUserClient, organization, user, role, {
                specializations: {
                    connect: [{ id: categoryClassifier1.id }, { id: categoryClassifier2.id }],
                },
            })
            expect(obj.id).toBeDefined()
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.specializations).toHaveLength(2)
            expect(obj.specializations).toEqual(
                expect.arrayContaining([expect.objectContaining(pick(categoryClassifier1, ['id', 'name']))]),
            )
            expect(obj.specializations).toEqual(
                expect.arrayContaining([expect.objectContaining(pick(categoryClassifier2, ['id', 'name']))]),
            )
        })
    })

    test('anonymous: create OrganizationEmployee', async () => {
        const anonymous = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: false,
        })
        const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestOrganizationEmployee(anonymous, organization, user, role)
        })
    })

    test('user: read OrganizationEmployee', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: false,
        })
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj, attrs] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)

        const objs = await OrganizationEmployee.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })

        expect(objs.length).toBeGreaterThan(0)
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
    })

    test('anonymous: read OrganizationEmployee', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await OrganizationEmployee.getAll(client)
        })
    })

    describe('user: update OrganizationEmployee', () => {
        test('cannot without granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            const [objCreated] = await createTestOrganizationEmployee(admin, organization, user, role)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestOrganizationEmployee(notManagerUserClient, objCreated.id)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            const [objCreated] = await createTestOrganizationEmployee(admin, organization, user, role)

            const payload = {
                name: faker.name.firstName(),
            }
            const [obj, attrs] = await updateTestOrganizationEmployee(managerClient, objCreated.id, payload)
            expect(obj.id).toBeDefined()
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(2)
            expect(obj.name).toEqual(attrs.name)
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })
    })

    test('anonymous: update OrganizationEmployee', async () => {
        const { employee } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()

        const client = await makeClient()
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestOrganizationEmployee(client, employee.id, payload)
        })
    })

    describe('user: softDelete OrganizationEmployee', () => {
        test('cannot without granted "canManageEmployees" permission', async () => {
            const { employee, admin, organization } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await OrganizationEmployee.softDelete(notManagerUserClient, employee.id)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const { employee, admin, organization } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerClient = await makeClientWithNewRegisteredAndLoggedInUser()

            await createTestOrganizationEmployee(admin, organization, managerClient.user, role, { isBlocked: false })

            const [obj] = await OrganizationEmployee.softDelete(managerClient, employee.id)

            expect(obj.id).toBeDefined()

            const objs = await OrganizationEmployee.getAll(admin, { id: obj.id })

            expect(objs).toHaveLength(0)
        })
    })

    test('anonymous: delete OrganizationEmployee', async () => {
        const { employee } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()

        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await OrganizationEmployee.delete(client, employee.id)
        })
    })

    describe('admin', () => {
        it('can count all', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization)
            const userClient1 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, userClient1.user, role)
            const userClient2 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, userClient2.user, role)

            const countOfCreatedByAdmin = await OrganizationEmployee.count(admin, { createdBy: { id: admin.user.id } })
            expect(countOfCreatedByAdmin).toBeGreaterThan(2)

            const countOfAll = await OrganizationEmployee.count(admin)
            expect(countOfAll).toBeGreaterThanOrEqual(countOfCreatedByAdmin)
        })
    })

    test('user: deleted user dont have access to update OrganizationEmployee', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: true,
            canManageOrganization: true,
        })

        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)

        await updateTestOrganizationEmployee(userClient, obj.id, { name: 'name2' })
        await updateTestOrganizationEmployee(userClient, obj.id, { deletedAt: 'true' })

        const objs = await OrganizationEmployee.getAll(userClient)
        expect(objs).toHaveLength(0)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestOrganizationEmployee(userClient, obj.id, { name: 'name3' })
        })
    })

    test('employee who accepted the invite: updates phone and email if employee user updates', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        await createTestOrganizationEmployee(admin, organization, userClient.user, role, { isAccepted: true })
        await createTestOrganizationEmployee(admin, organization, userClient.user, role, { isAccepted: true })

        const email = faker.random.alphaNumeric(10) + '@example.com'
        const phone = faker.phone.phoneNumber('+79#########')
        await updateTestUser(admin, userClient.user.id, {
            email,
            phone,
        })

        const employees = await OrganizationEmployee.getAll(userClient)

        expect(employees).toHaveLength(2)
        expect(employees[0].email).toEqual(email)
        expect(employees[1].email).toEqual(email)
        expect(employees[0].phone).toEqual(phone)
        expect(employees[1].phone).toEqual(phone)
    })

    test('employee: did not update phone and email when user did nothing with invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(invitedEmployee.phone)
        expect(employee.email).toEqual(invitedEmployee.email)
    })

    test('employee: update phone and email when user accept invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
        await acceptOrRejectOrganizationInviteById(client2, invitedEmployee)

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(phone)
        expect(employee.email).toEqual(email)
    })

    test('employee: did not update phone and email when user reject invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
        await acceptOrRejectOrganizationInviteById(client2, invitedEmployee, {
            isAccepted: false,
            isRejected: true,
        })

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(invitedEmployee.phone)
        expect(employee.email).toEqual(invitedEmployee.email)
    })
})
