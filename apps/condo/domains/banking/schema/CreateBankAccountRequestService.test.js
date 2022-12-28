/**
 * Generated by `createservice banking.CreateBankAccountRequestService '--type=mutations'`
 */
const faker = require('faker')
const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const { expectToThrowAuthenticationErrorToResult, waitFor } = require('@open-condo/keystone/test.utils')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createBankAccountRequestByTestClient } = require('@condo/domains/banking/utils/testSchema')
const { Message } = require('@condo/domains/notification/utils/testSchema')
const { MESSAGE_SENT_STATUS } = require('@condo/domains/notification/constants/constants')

describe('CreateBankAccountRequestService', () => {
    test('user: can send create bank account request if has canManageProperties access', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const payload = {
            bankAccountClient: {
                phone: faker.phone.phoneNumber('+7988#######'),
                email: faker.internet.email(),
                name: client.user.name,
            },
            tin: client.organization.tin,
            name: client.organization.name,
            propertyAddress: client.property.address,
            organizationId: client.organization.id,
        }

        const [data] = await createBankAccountRequestByTestClient(client, payload)

        await waitFor(async () => {
            const message = await Message.getOne(admin, { id: data.id })
            expect(message).toBeDefined()
            expect(message.status).toEqual(MESSAGE_SENT_STATUS)
            // expect(message.processingMeta).toEqual(expect.objectContaining(payload))
        })
    })

    test('anonymous: can\'t send create bank account request', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToResult(async () => {
            await createBankAccountRequestByTestClient(client, {
                bankAccountClient: {
                    phone: faker.phone.phoneNumber('+7988#######'),
                    email: faker.internet.email(),
                    name: faker.name.firstName(),
                },
                tin: '000000000',
                name: '',
                propertyAddress: faker.address.streetName(),
                organizationId: faker.datatype.uuid(),
            })
        })
    })

    test('admin: execute', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithProperty()
        const payload = {
            bankAccountClient: {
                phone: faker.phone.phoneNumber('+7988#######'),
                email: faker.internet.email(),
                name: client.user.name,
            },
            tin: client.organization.tin,
            name: client.organization.name,
            propertyAddress: client.property.address,
            organizationId: client.organization.id,
        }
        const [data] = await createBankAccountRequestByTestClient(admin, payload)

        expect(data).toBeDefined()
        expect(data).toHaveProperty('id')
        expect(data).toHaveProperty('status')
    })
})
