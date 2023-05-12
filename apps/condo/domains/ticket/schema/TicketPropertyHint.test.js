/**
 * Generated by `createschema ticket.TicketPropertyHint 'organization:Relationship:Organization:CASCADE; name?:Text; properties:Relationship:Property:SET_NULL; content:Text;'`
 */
const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@open-condo/keystone/test.utils')
const { expectToThrowAuthenticationErrorToObj, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObjects } = require('@open-condo/keystone/test.utils')

const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee, createTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { TicketPropertyHint, createTestTicketPropertyHint, updateTestTicketPropertyHint } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

describe('TicketPropertyHint', () => {
    describe('Permissions', () => {
        describe('Create', () => {
            describe('Anonymous', () => {
                it('Cannot create TicketPropertyHint', async () => {
                    const client = await makeClient()

                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)

                    await expectToThrowAuthenticationErrorToObj(async () => {
                        await createTestTicketPropertyHint(client, organization, {})
                    })
                })
            })

            describe('Admin', () => {
                it('Can create TicketPropertyHint', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })
            })

            describe('Organization Employee', () => {
                it('can create TicketPropertyHint in the organization in which he is an employee with "canManageTicketPropertyHints" is true', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organization, user.user, role)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(user, organization, {})

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })

                it('can create TicketPropertyHint in the related "to" organization ' +
                    'if in the related "from" organization the employee with the "canManageTicketPropertyHints" is true', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationFrom] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

                    const [organizationTo] = await createTestOrganization(admin)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(clientFrom, organizationTo, {})

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })

                it('cannot create TicketPropertyHint in the organization in which he is not an employee', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()

                    const [organization] = await createTestOrganization(admin)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketPropertyHint(user, organization)
                    })
                })

                it('cannot create TicketPropertyHint in the organization in which he is an employee with "canManageTicketPropertyHints" is false', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, user.user, role)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketPropertyHint(user, organization, {})
                    })
                })

                it('cannot create TicketPropertyHint in the related "to" organization' +
                    'if in the related "from" organization the employee with "canManageTicketPropertyHints" is false', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationFrom] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
                    await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

                    const [organizationTo] = await createTestOrganization(admin)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketPropertyHint(clientFrom, organizationTo, {})
                    })
                })

                it('cannot create TicketPropertyHint in the related "from" organization', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const [organizationFrom] = await createTestOrganization(admin)

                    const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationTo] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationTo, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketPropertyHint(clientTo, organizationFrom, {})
                    })
                })
            })
        })

        describe('Read', () => {
            describe('Anonymous', () => {
                it('Cannot read TicketPropertyHints', async () => {
                    const client = await makeClient()

                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)

                    await createTestTicketPropertyHint(admin, organization, {})

                    await expectToThrowAuthenticationErrorToObjects(async () => {
                        await TicketPropertyHint.getAll(client)
                    })
                })
            })

            describe('Admin', () => {
                it('Can read TicketPropertyHints', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)

                    const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    const ticketPropertyHint = await TicketPropertyHint.getOne(admin, { id: createdTicketPropertyHint.id })

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })
            })

            describe('Organization Employee', () => {
                it('can read TicketPropertyHints from the organization in which he is an employee', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, user.user, role)

                    const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    const ticketPropertyHint = await TicketPropertyHint.getOne(user, { id: createdTicketPropertyHint.id })

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })

                it('can read TicketPropertyHints from the related "to" organization', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationFrom] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
                    await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

                    const [organizationTo] = await createTestOrganization(admin)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organizationTo, {})

                    const ticketPropertyHint = await TicketPropertyHint.getOne(clientFrom, { id: createdTicketPropertyHint.id })

                    expect(ticketPropertyHint.id).toMatch(UUID_RE)
                })

                it('cannot read TicketPropertyHints from the organization in which he is not an employee', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()

                    const [organization] = await createTestOrganization(admin)

                    const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    const ticketPropertyHint = await TicketPropertyHint.getOne(user, { id: createdTicketPropertyHint.id })

                    expect(ticketPropertyHint).toBeUndefined()
                })

                it('cannot read TicketPropertyHints from the related "from" organization', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const [organizationFrom] = await createTestOrganization(admin)

                    const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationTo] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationTo, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organizationFrom, {})

                    const ticketPropertyHint = await TicketPropertyHint.getOne(clientTo, { id: createdTicketPropertyHint.id })

                    expect(ticketPropertyHint).toBeUndefined()
                })
            })
        })

        describe('Update', () => {
            describe('Anonymous', () => {
                it('Cannot update TicketPropertyHint', async () => {
                    const client = await makeClient()

                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)

                    const [TicketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    await expectToThrowAuthenticationErrorToObj(async () => {
                        await updateTestTicketPropertyHint(client, TicketPropertyHint.id, {})
                    })
                })
            })

            describe('Admin', () => {
                it('Can update TicketPropertyHint', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await createTestOrganization(admin)
                    const newContent = faker.random.alphaNumeric(8)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    const [updatedTicketPropertyHint] = await updateTestTicketPropertyHint(admin, ticketPropertyHint.id, {
                        content: newContent,
                    })

                    expect(updatedTicketPropertyHint.id).toEqual(ticketPropertyHint.id)
                    expect(updatedTicketPropertyHint.content).toEqual(newContent)
                })
            })

            describe('Organization Employee', () => {
                it('can update TicketPropertyHint in the organization in which he is an employee with "canManageTicketPropertyHints" is true', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organization, user.user, role)
                    const newContent = faker.random.alphaNumeric(8)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(user, organization, {})

                    const [updatedTicketPropertyHint] = await updateTestTicketPropertyHint(user, ticketPropertyHint.id, {
                        content: newContent,
                    })

                    expect(updatedTicketPropertyHint.id).toEqual(ticketPropertyHint.id)
                    expect(updatedTicketPropertyHint.content).toEqual(newContent)
                })

                it('can update TicketPropertyHint in the related "to" organization' +
                    'if in the related "from" organization the employee with the "canManageTicketPropertyHints" is true', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationFrom] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

                    const [organizationTo] = await createTestOrganization(admin)
                    const newContent = faker.random.alphaNumeric(8)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(clientFrom, organizationTo, {})

                    const [updatedTicketPropertyHint] = await updateTestTicketPropertyHint(clientFrom, ticketPropertyHint.id, {
                        content: newContent,
                    })

                    expect(updatedTicketPropertyHint.id).toEqual(ticketPropertyHint.id)
                    expect(updatedTicketPropertyHint.content).toEqual(newContent)
                })

                it('cannot update TicketPropertyHint in the organization in which he is not an employee', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()

                    const [organization] = await createTestOrganization(admin)
                    const newContent = faker.random.alphaNumeric(8)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestTicketPropertyHint(user, ticketPropertyHint.id, {
                            content: newContent,
                        })
                    })
                })

                it('cannot update TicketPropertyHint in the organization in which he is an employee with "canManageTicketPropertyHints" is false', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const user = await makeClientWithNewRegisteredAndLoggedInUser()

                    const [organization] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, user.user, role)
                    const newContent = faker.random.alphaNumeric(8)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {})

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestTicketPropertyHint(user, ticketPropertyHint.id, {
                            content: newContent,
                        })
                    })
                })

                it('cannot update TicketPropertyHint in the related "to" organization' +
                    'if in the related "from" organization the employee with "canManageTicketPropertyHints" is false', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const clientFrom = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationFrom] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationFrom)
                    await createTestOrganizationEmployee(admin, organizationFrom, clientFrom.user, role)

                    const [organizationTo] = await createTestOrganization(admin)
                    const newContent = faker.random.alphaNumeric(8)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organizationTo, {})

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestTicketPropertyHint(clientFrom, ticketPropertyHint.id, {
                            content: newContent,
                        })
                    })
                })

                it('cannot update TicketPropertyHint in the related "from" organization', async () => {
                    const admin = await makeLoggedInAdminClient()

                    const [organizationFrom] = await createTestOrganization(admin)
                    const newContent = faker.random.alphaNumeric(8)
                    const clientTo = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organizationTo] = await createTestOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organizationTo, {
                        canManageTicketPropertyHints: true,
                    })
                    await createTestOrganizationEmployee(admin, organizationTo, clientTo.user, role)

                    await createTestOrganizationLink(admin, organizationFrom, organizationTo)

                    const [ticketPropertyHint] = await createTestTicketPropertyHint(admin, organizationFrom, {})

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestTicketPropertyHint(clientTo, ticketPropertyHint.id, {
                            content: newContent,
                        })
                    })
                })
            })
        })
    })
    describe('Validations', function () {
        test('xss', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const content = '<script> console.log(\'hello, world\') </script>'

            const [createdTicketPropertyHint] = await createTestTicketPropertyHint(admin, organization, {
                content,
            })

            const ticketPropertyHint = await TicketPropertyHint.getOne(admin, { id: createdTicketPropertyHint.id })

            expect(ticketPropertyHint.id).toMatch(UUID_RE)
            expect(ticketPropertyHint.content).toEqual('&lt;script&gt; console.log(\'hello, world\') &lt;/script&gt;')
        })
    })
})

