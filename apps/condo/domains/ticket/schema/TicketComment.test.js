/**
 * Generated by `createschema ticket.TicketComment 'ticket:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; content:Text;'`
 */

const faker = require('faker')
const { updateTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationWithAccessToAnotherOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestTicket } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { TicketComment, createTestTicketComment, updateTestTicketComment } = require('@condo/domains/ticket/utils/testSchema')
const {
    catchErrorFrom,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAccessDeniedErrorToObjects,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
} = require('@condo/domains/common/utils/testSchema')

describe('TicketComment', () => {
    describe('field access', () => {
        it('does not allows user to set "user" field to another user', async () => {
            const userClient = await makeClientWithProperty()
            const anotherUserClient = await makeClientWithProperty()
            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketComment(userClient, ticket, anotherUserClient.user)
            })
        })
    })

    describe('create', () => {
        it('can be created by user, who has "canManageTicketComments" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageTickets: true,
                canManageTicketComments: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [ticket] = await createTestTicket(userClient, organization, property)

            const [obj, attrs] = await createTestTicketComment(userClient, ticket, userClient.user)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.content).toMatch(attrs.content)
            expect(obj.user.id).toMatch(userClient.user.id)
        })

        it('cannot be created by user, who does not have "canManageTicketComments" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageTickets: true,
                canManageTicketComments: false,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [ticket] = await createTestTicket(userClient, organization, property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketComment(userClient, ticket, userClient.user)
            })
        })

        it('can be created by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [ticket] = await createTestTicket(adminClient, organization, property)

            const [obj, attrs] = await createTestTicketComment(adminClient, ticket, adminClient.user)
            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.content).toMatch(attrs.content)
            expect(obj.user.id).toMatch(adminClient.user.id)
        })

        it('cannot be created by anonymous', async () => {
            const anonymous = await makeClient()

            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestTicketComment(anonymous, ticket, client.user)
            })
        })

        it('can be created by employee from "from" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, organizationTo, propertyTo, organizationFrom, employeeFrom } =
                await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)

            const [ticketComment] = await createTestTicketComment(clientFrom, ticket, clientFrom.user)
            expect(ticketComment.id).toMatch(UUID_RE)
        })

        it('cannot be created by employee from "to" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientTo, organizationFrom, propertyFrom } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestTicketComment(clientTo, ticket, clientTo.user)
            })
        })
    })

    describe('read', () => {
        it('can be read by user, who has read access to related ticket', async () => {
            const userClient = await makeClientWithProperty()
            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property)
            const [obj1] = await createTestTicketComment(userClient, ticket, userClient.user)

            const anotherUserClient = await makeClientWithProperty()
            const [anotherTicket] = await createTestTicket(
                anotherUserClient,
                anotherUserClient.organization,
                anotherUserClient.property,
            )
            await createTestTicketComment(anotherUserClient, anotherTicket, anotherUserClient.user)

            const objs = await TicketComment.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj1.id)
        })

        it('can be read by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()

            const userClient1 = await makeClientWithProperty()
            const [ticket1] = await createTestTicket(userClient1, userClient1.organization, userClient1.property)
            await createTestTicketComment(userClient1, ticket1, userClient1.user)

            const userClient2 = await makeClientWithProperty()
            const [ticket2] = await createTestTicket(userClient2, userClient2.organization, userClient2.property)
            await createTestTicketComment(userClient2, ticket2, userClient2.user)

            const objs = await TicketComment.getAll(adminClient, {}, { sortBy: ['updatedAt_ASC'] })
            expect(objs.length >= 2).toBeTruthy()
        })

        it('cannot be read by anonymous', async () => {
            const anonymous = await makeClient()

            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)
            await createTestTicketComment(client, ticket, client.user)

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await TicketComment.getAll(anonymous)
            })
        })

        it('can be read by employee from "from" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
            const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
            await createTestTicketComment(admin, ticket, clientFrom.user)

            const comments = await TicketComment.getAll(clientFrom)
            expect(comments).toHaveLength(1)
        })

        it('cannot be read by employee from "to" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, clientTo, organizationFrom, propertyFrom } =
                await createTestOrganizationWithAccessToAnotherOrganization()
            const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)
            await createTestTicketComment(admin, ticket, clientFrom.user)

            const comments = await TicketComment.getAll(clientTo)
            expect(comments).toHaveLength(0)
        })
    })

    describe('update', () => {
        it('can be updated by user, who has created it and has "canManageTicketComments" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageTickets: true,
                canManageTicketComments: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [ticket] = await createTestTicket(userClient, organization, property)

            const [objCreated] = await createTestTicketComment(userClient, ticket, userClient.user)

            const payload = {
                content: faker.random.alphaNumeric(10),
            }

            const [objUpdated, attrs] = await updateTestTicketComment(userClient, objCreated.id, payload)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.content).not.toEqual(objCreated.content)
            expect(objUpdated.user.id).toMatch(userClient.user.id)
        })

        it('cannot be updated by user, who has created it, but does not have "canManageTicketComments" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageTickets: true,
                canManageTicketComments: false,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [ticket] = await createTestTicket(userClient, organization, property)

            const [objCreated] = await createTestTicketComment(adminClient, ticket, userClient.user)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketComment(userClient, objCreated.id)
            })
        })

        it('cannot be updated by user, who has not created it', async () => {
            const userClient1 = await makeClientWithProperty()
            const userClient2 = await makeClientWithProperty()

            const [ticket1] = await createTestTicket(userClient1, userClient1.organization, userClient1.property)
            const [ticket2] = await createTestTicket(userClient2, userClient2.organization, userClient2.property)

            await createTestTicketComment(userClient1, ticket1, userClient1.user)
            const [commentByOther] = await createTestTicketComment(userClient2, ticket2, userClient2.user)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketComment(userClient1, commentByOther.id)
            })
        })

        it('can be updated by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()

            const userClient = await makeClientWithProperty()
            const [ticket] = await createTestTicket(userClient, userClient.organization, userClient.property)
            const [objCreated] = await createTestTicketComment(userClient, ticket, userClient.user)

            const payload = {
                content: faker.random.alphaNumeric(10),
            }

            const [objUpdated, attrs] = await updateTestTicketComment(adminClient, objCreated.id, payload)

            expect(objUpdated.id).toEqual(objCreated.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.content).not.toEqual(objCreated.content)
            expect(objUpdated.user.id).toMatch(userClient.user.id)
        })

        it('cannot be updated by anonymous', async () => {
            const anonymousClient = await makeClient()

            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)
            const [obj] = await createTestTicketComment(client, ticket, client.user)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestTicketComment(anonymousClient, obj.id)
            })
        })

        it('can be updated by employee from "from" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, propertyTo, organizationTo, organizationFrom, employeeFrom } =
                await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
            const [comment] = await createTestTicketComment(admin, ticket, clientFrom.user)
            const payload = {
                content: faker.random.alphaNumeric(10),
            }
            const [commentUpdated] = await updateTestTicketComment(clientFrom, comment.id, payload)

            expect(commentUpdated.id).toEqual(comment.id)
            expect(commentUpdated.content).toEqual(payload.content)
        })

        it('cannot be updated by employee from "to" relation organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { clientFrom, clientTo, organizationFrom, propertyFrom, employeeFrom } =
                await createTestOrganizationWithAccessToAnotherOrganization()
            const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                canManageTickets: true,
            })
            await updateTestOrganizationEmployee(admin, employeeFrom.id, {
                role: { connect: { id: role.id } },
            })
            const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)
            const [comment] = await createTestTicketComment(admin, ticket, clientFrom.user)
            const payload = {
                content: faker.random.alphaNumeric(10),
            }

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestTicketComment(clientTo, comment.id, payload)
            })
        })
    })

    describe('delete', () => {
        it('cannot be deleted by user', async () => {
            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)
            const [obj] = await createTestTicketComment(client, ticket, client.user)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketComment.delete(client, obj.id)
            })
        })

        it('cannot be deleted by admin', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)
            const [obj] = await createTestTicketComment(client, ticket, client.user)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketComment.delete(admin, obj.id)
            })
        })

        it('cannot be deleted by anonymous', async () => {
            const anonymous = await makeClient()
            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)
            const [obj] = await createTestTicketComment(client, ticket, client.user)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await TicketComment.delete(anonymous, obj.id)
            })
        })
    })
})
