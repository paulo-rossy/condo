/**
 * Generated by `createschema ticket.TicketChange 'ticket:Relationship:Ticket:CASCADE;'`
 */

const { catchErrorFrom, expectToThrowAuthenticationErrorToObjects } = require('../../common/utils/testSchema')
const faker = require('faker')
const { createTestOrganizationWithAccessToAnotherOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestContact } = require('@condo/domains/contact/utils/testSchema')
const { updateTestTicket } = require('../utils/testSchema')

const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

const { createTestTicket } = require('../utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient, makeClient, DATETIME_RE } = require('@core/keystone/test.utils')

const { TicketChange, TicketStatus, TicketSource, TicketClassifier, createTestTicketChange, updateTestTicketChange } = require('@condo/domains/ticket/utils/testSchema')

const { STATUS_IDS } = require('../constants/statusTransitions')

describe('TicketChange', () => {

    describe('create', () => {
        it('gets created when Ticket has changes in at least one field', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const client2 = await makeClientWithProperty()
            const client3 = await makeClientWithProperty()
            const client4 = await makeClientWithProperty()

            const openedStatus = (await TicketStatus.getAll(admin, { id: STATUS_IDS.OPEN }))[0]
            const inProgressStatus = (await TicketStatus.getAll(admin, { id: STATUS_IDS.IN_PROGRESS }))[0]
            const classifiers = await TicketClassifier.getAll(admin, {})
            const sources = await TicketSource.getAll(admin, {})
            const [contact] = await createTestContact(client, client.organization, client.property)
            const [contact2] = await createTestContact(client, client.organization, client.property)

            const [ticket2] = await createTestTicket(client, client.organization, client.property)
            const [ticket3] = await createTestTicket(client, client.organization, client.property)
            const [ticket] = await createTestTicket(client, client.organization, client.property, {
                sectionName: faker.lorem.word(),
                floorName: faker.lorem.word(),
                unitName: faker.lorem.word(),
                isEmergency: true,
                isPaid: true,
                isWarranty: true,
                status: { connect: { id: openedStatus.id } },
                client: { connect: { id: client.user.id } },
                contact: { connect: { id: contact.id } },
                operator: { connect: { id: client.user.id } },
                assignee: { connect: { id: client.user.id } },
                executor: { connect: { id: client.user.id } },
                classifier: { connect: { id: classifiers[0].id } },
                source: { connect: { id: sources[0].id } },
                related: { connect: { id: ticket2.id } },
                // TODO(antonal): figure out how to get old list of related items in many-to-many relationship.
                watchers: { connect: [{ id: client2.user.id }, { id: client3.user.id }] },
            })

            const payload = {
                details: faker.lorem.sentence(),
                number: ticket.number + 1,
                statusReason: faker.lorem.sentence(),
                clientName: faker.name.firstName(),
                clientEmail: faker.internet.email(),
                // TODO (SavelevMatthew) Better way to generate phone numbers?
                clientPhone: faker.phone.phoneNumber('+79#########'),
                sectionName: faker.lorem.word(),
                floorName: faker.lorem.word(),
                unitName: faker.lorem.word(),
                isEmergency: false,
                isWarranty: false,
                isPaid: false,
                property: { connect: { id: client2.property.id } },
                status: { connect: { id: inProgressStatus.id } },
                client: { connect: { id: client2.user.id } },
                contact: { connect: { id: contact2.id } },
                operator: { connect: { id: client2.user.id } },
                assignee: { connect: { id: client2.user.id } },
                executor: { connect: { id: client2.user.id } },
                classifier: { connect: { id: classifiers[1].id } },
                source: { connect: { id: sources[1].id } },
                related: { connect: { id: ticket3.id } },
                watchers: {
                    disconnect: [{ id: client2.user.id }],
                    connect: [{ id: client4.user.id }],
                },
            }

            const [updatedTicket] = await updateTestTicket(admin, ticket.id, payload)

            const objs = await TicketChange.getAll(admin, {
                ticket: { id: ticket.id },
            })

            expect(objs).toHaveLength(1)
            expect(objs[0].id).toBeDefined()
            expect(objs[0].v).toEqual(1)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(updatedTicket.sender)
            expect(objs[0].detailsFrom).toEqual(ticket.details)
            expect(objs[0].detailsTo).toEqual(payload.details)
            expect(objs[0].numberFrom).toEqual(ticket.number)
            expect(objs[0].numberTo).toEqual(payload.number)
            expect(objs[0].statusReasonFrom).toEqual(ticket.statusReason)
            expect(objs[0].statusReasonTo).toEqual(payload.statusReason)
            expect(objs[0].clientNameFrom).toEqual(ticket.clientName)
            expect(objs[0].clientNameTo).toEqual(payload.clientName)
            expect(objs[0].clientEmailFrom).toEqual(ticket.clientEmail)
            expect(objs[0].clientEmailTo).toEqual(payload.clientEmail)
            expect(objs[0].clientPhoneFrom).toEqual(ticket.clientPhone)
            expect(objs[0].clientPhoneTo).toEqual(payload.clientPhone)
            expect(objs[0].isEmergencyFrom).toEqual(ticket.isEmergency)
            expect(objs[0].isEmergencyTo).toEqual(payload.isEmergency)
            expect(objs[0].isWarrantyFrom).toEqual(ticket.isWarranty)
            expect(objs[0].isWarrantyTo).toEqual(payload.isWarranty)
            expect(objs[0].isPaidFrom).toEqual(ticket.isPaid)
            expect(objs[0].isPaidTo).toEqual(payload.isPaid)
            expect(objs[0].sectionNameFrom).toEqual(ticket.sectionName)
            expect(objs[0].sectionNameTo).toEqual(payload.sectionName)
            expect(objs[0].floorNameFrom).toEqual(ticket.floorName)
            expect(objs[0].floorNameTo).toEqual(payload.floorName)
            expect(objs[0].unitNameFrom).toEqual(ticket.unitName)
            expect(objs[0].unitNameTo).toEqual(payload.unitName)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(DATETIME_RE)
            expect(objs[0].updatedAt).toMatch(DATETIME_RE)

            expect(objs[0].propertyIdFrom).toEqual(ticket.property.id)
            expect(objs[0].propertyIdTo).toEqual(payload.property.connect.id)
            expect(objs[0].propertyDisplayNameFrom).toEqual(client.property.address)
            expect(objs[0].propertyDisplayNameTo).toEqual(client2.property.address)

            expect(objs[0].statusIdFrom).toEqual(ticket.status.id)
            expect(objs[0].statusIdTo).toEqual(payload.status.connect.id)
            expect(objs[0].statusDisplayNameFrom).toEqual(openedStatus.name)
            expect(objs[0].statusDisplayNameTo).toEqual(inProgressStatus.name)

            expect(objs[0].clientIdFrom).toEqual(ticket.client.id)
            expect(objs[0].clientIdTo).toEqual(payload.client.connect.id)
            expect(objs[0].clientDisplayNameFrom).toEqual(client.user.name)
            expect(objs[0].clientDisplayNameTo).toEqual(client2.user.name)

            expect(objs[0].contactIdFrom).toEqual(ticket.contact.id)
            expect(objs[0].contactIdTo).toEqual(payload.contact.connect.id)
            expect(objs[0].contactDisplayNameFrom).toEqual(contact.name)
            expect(objs[0].contactDisplayNameTo).toEqual(contact2.name)

            expect(objs[0].operatorIdFrom).toEqual(ticket.operator.id)
            expect(objs[0].operatorIdTo).toEqual(payload.operator.connect.id)
            expect(objs[0].operatorDisplayNameFrom).toEqual(client.user.name)
            expect(objs[0].operatorDisplayNameTo).toEqual(client2.user.name)

            expect(objs[0].assigneeIdFrom).toEqual(ticket.assignee.id)
            expect(objs[0].assigneeIdTo).toEqual(payload.assignee.connect.id)
            expect(objs[0].assigneeDisplayNameFrom).toEqual(client.user.name)
            expect(objs[0].assigneeDisplayNameTo).toEqual(client2.user.name)

            expect(objs[0].executorIdFrom).toEqual(ticket.executor.id)
            expect(objs[0].executorIdTo).toEqual(payload.executor.connect.id)
            expect(objs[0].executorDisplayNameFrom).toEqual(client.user.name)
            expect(objs[0].executorDisplayNameTo).toEqual(client2.user.name)

            expect(objs[0].classifierIdFrom).toEqual(ticket.classifier.id)
            expect(objs[0].classifierIdTo).toEqual(payload.classifier.connect.id)
            expect(objs[0].classifierDisplayNameFrom).toEqual(classifiers[0].name)
            expect(objs[0].classifierDisplayNameTo).toEqual(classifiers[1].name)

            expect(objs[0].sourceIdFrom).toEqual(ticket.source.id)
            expect(objs[0].sourceIdTo).toEqual(payload.source.connect.id)
            expect(objs[0].sourceDisplayNameFrom).toEqual(sources[0].name)
            expect(objs[0].sourceDisplayNameTo).toEqual(sources[1].name)

            expect(objs[0].relatedIdFrom).toEqual(ticket2.id)
            expect(objs[0].relatedIdTo).toEqual(payload.related.connect.id)
            expect(objs[0].relatedDisplayNameFrom).toEqual(ticket2.number.toString())
            expect(objs[0].relatedDisplayNameTo).toEqual(ticket3.number.toString())

            // TODO(antonal): figure out how to get old list of related items in many-to-many relationship.
            expect(objs[0].watchersIdsFrom).toEqual(expect.arrayContaining([client2.user.id, client3.user.id]))
            expect(objs[0].watchersIdsTo).toEqual(expect.arrayContaining([client3.user.id, client4.user.id]))
            expect(objs[0].watchersIdsFrom).toHaveLength(2)
            expect(objs[0].watchersIdsTo).toHaveLength(2)
            expect(objs[0].watchersDisplayNamesFrom).toEqual(expect.arrayContaining([client2.user.name, client3.user.name]))
            expect(objs[0].watchersDisplayNamesTo).toEqual(expect.arrayContaining([client3.user.name, client4.user.name]))
            expect(objs[0].watchersDisplayNamesFrom).toHaveLength(2)
            expect(objs[0].watchersDisplayNamesTo).toHaveLength(2)
        })

        it('not gets created when Ticket has no changes', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(client, client.organization, client.property)

            const payloadThatChangesNothing = {
                details: ticket.details,
                statusReason: ticket.statusReason,
                clientName: ticket.clientName,
                property: { connect: { id: client.property.id } },
            }

            await updateTestTicket(admin, ticket.id, payloadThatChangesNothing)

            const objs = await TicketChange.getAll(admin, {
                ticket: { id: ticket.id },
            })

            expect(objs).toHaveLength(0)
        })

        it('create related fields when Ticket has changes in at least one field from related fields', async () => {
            const client = await makeClientWithProperty()
            const unitName1 = faker.lorem.word()

            const [ticket] = await createTestTicket(client, client.organization, client.property, { unitName: unitName1 })

            const unitName2 = faker.lorem.word()

            await updateTestTicket(client, ticket.id, { unitName: unitName2 })

            const [ticketChange] = await TicketChange.getAll(client, {
                ticket: { id: ticket.id },
            })

            expect(ticketChange.propertyIdFrom).toEqual(client.property.id)
            expect(ticketChange.propertyIdTo).toEqual(client.property.id)
            expect(ticketChange.propertyDisplayNameFrom).toEqual(client.property.address)
            expect(ticketChange.propertyDisplayNameTo).toEqual(client.property.address)
            expect(ticketChange.unitNameFrom).toEqual(unitName1)
            expect(ticketChange.unitNameTo).toEqual(unitName2)
        })
    })

    test('user: create TicketChange', async () => {
        const client = await makeClientWithProperty()
        const [ticket] = await createTestTicket(client, client.organization, client.property)
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestTicketChange(client, ticket)
        })
    })

    test('anonymous: create TicketChange', async () => {
        const client = await makeClientWithProperty()
        const [ticket] = await createTestTicket(client, client.organization, client.property)
        const anonymous = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestTicketChange(anonymous, ticket)
        })
    })

    describe('user: read TicketChange', () => {
        it('only belonging to organization, it employed in', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithProperty()
            const [ticket] = await createTestTicket(admin, client.organization, client.property)

            const payload = {
                details: faker.lorem.sentence(),
            }

            await updateTestTicket(admin, ticket.id, payload)

            const objs = await TicketChange.getAll(client, {
                ticket: { id: ticket.id },
            })

            expect(objs).toHaveLength(1)
            expect(objs[0].ticket.id).toEqual(ticket.id)
        })
    })

    test('anonymous: read TicketChange', async () => {
        const anonymous = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await TicketChange.getAll(anonymous)
        })
    })

    test('user: update TicketChange', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const [ticket] = await createTestTicket(admin, client.organization, client.property)

        const payload = {
            details: faker.lorem.sentence(),
        }

        await updateTestTicket(admin, ticket.id, payload)

        const [objCreated] = await TicketChange.getAll(admin, {
            ticket: { id: ticket.id },
        })

        await catchErrorFrom(async () => {
            await updateTestTicketChange(client, objCreated.id)
        }, ({ errors, data }) => {
            // Custom match should be used here, because error message contains
            // suggestions, like "Did you mean …", that cannot be known in advance
            // So, just inspect basic part of the message
            expect(errors[0].message).toMatch('Unknown type "TicketChangeUpdateInput"')
        })
    })

    test('anonymous: update TicketChange', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const [ticket] = await createTestTicket(admin, client.organization, client.property)
        const anonymous = await makeClient()

        const payload = {
            details: faker.lorem.sentence(),
        }

        await updateTestTicket(admin, ticket.id, payload)

        const [objCreated] = await TicketChange.getAll(admin, {
            ticket: { id: ticket.id },
        })

        await catchErrorFrom(async () => {
            await updateTestTicketChange(anonymous, objCreated.id)
        }, ({ errors, data }) => {
            // Custom match should be used here, because error message contains
            // suggestions, like "Did you mean …", that cannot be known in advance
            // So, just inspect basic part of the message
            expect(errors[0].message).toMatch('Unknown type "TicketChangeUpdateInput"')
        })
    })

    test('user: delete TicketChange', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const [ticket] = await createTestTicket(admin, client.organization, client.property)

        const payload = {
            details: faker.lorem.sentence(),
        }

        await updateTestTicket(admin, ticket.id, payload)

        const [objCreated] = await TicketChange.getAll(admin, {
            ticket: { id: ticket.id },
        })

        await catchErrorFrom(async () => {
            await TicketChange.delete(client, objCreated.id)
        }, ({ errors, data }) => {
            // Custom match should be used here, because error message contains
            // suggestions, like "Did you mean …", that cannot be known in advance
            // So, just inspect basic part of the message
            expect(errors[0].message).toMatch('Cannot query field "deleteTicketChange" on type "Mutation"')
        })
    })

    test('anonymous: delete TicketChange', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const anonymous = await makeClient()
        const [ticket] = await createTestTicket(admin, client.organization, client.property)

        const payload = {
            details: faker.lorem.sentence(),
        }

        await updateTestTicket(admin, ticket.id, payload)

        const [objCreated] = await TicketChange.getAll(admin, {
            ticket: { id: ticket.id },
        })

        await catchErrorFrom(async () => {
            await TicketChange.delete(anonymous, objCreated.id)
        }, ({ errors, data }) => {
            // Custom match should be used here, because error message contains
            // suggestions, like "Did you mean …", that cannot be known in advance
            // So, just inspect basic part of the message
            expect(errors[0].message).toMatch('Cannot query field "deleteTicketChange" on type "Mutation"')
        })
    })

    test('employee from "from" relation: can read ticket changes from his "to" relation organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const { clientFrom, organizationTo, propertyTo } = await createTestOrganizationWithAccessToAnotherOrganization()
        const [ticket] = await createTestTicket(admin, organizationTo, propertyTo)
        const payload = {
            details: faker.lorem.sentence(),
        }
        await updateTestTicket(admin, ticket.id, payload)

        const objs = await TicketChange.getAll(clientFrom, {
            ticket: { id: ticket.id },
        })
        expect(objs).toHaveLength(1)
        expect(objs[0].ticket.id).toEqual(ticket.id)
    })

    test('employee from "to" relation: cannot read ticket changes from his "from" relation organization', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organizationFrom, propertyFrom, clientTo } = await createTestOrganizationWithAccessToAnotherOrganization()
        const [ticket] = await createTestTicket(admin, organizationFrom, propertyFrom)
        const payload = {
            details: faker.lorem.sentence(),
        }
        await updateTestTicket(admin, ticket.id, payload)

        const objs = await TicketChange.getAll(clientTo, {
            ticket: { id: ticket.id },
        })
        expect(objs).toHaveLength(0)
    })
})
