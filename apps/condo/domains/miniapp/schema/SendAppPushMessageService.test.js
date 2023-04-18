/**
 * Generated by `createservice miniapp.SendAppPushMessageService --type mutations`
 */
const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, catchErrorFrom } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
} = require('@open-condo/keystone/test.utils')

const {
    createTestB2CApp,
    sendAppPushMessageByTestClient,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    B2C_APP_MESSAGE_PUSH_TYPE,
} = require('@condo/domains/notification/constants/constants')
const {
    makeClientWithRegisteredOrganization,
} = require('@condo/domains/organization/utils/testSchema/Organization')
const {
    makeClientWithSupportUser,
    createTestUser,
    makeClientWithStaffUser,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')


describe('SendAppPushMessageService', () => {
    let admin

    beforeEach( async () => {
        admin = await makeLoggedInAdminClient()
    })

    describe('accesses', () => {
        it('Admin can SendAppPushMessageService', async () => {
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            const [message] = await sendAppPushMessageByTestClient(admin, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                app: { id: b2c.id  },
                user: { id: user.id  },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        it('Support can SendAppPushMessageService', async () => {
            const supportClient = await makeClientWithSupportUser()
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            const [message] = await sendAppPushMessageByTestClient(supportClient, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                app: { id: b2c.id  },
                user: { id: user.id  },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        it('Anonymous cannot SendAppPushMessageService', async () => {
            const anonymousClient = await makeClient()
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)


            await expectToThrowAuthenticationErrorToResult(async () => {
                await sendAppPushMessageByTestClient(anonymousClient, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                })
            })
        })

        it('Management company admin user cannot SendAppPushMessageService to other users', async () => {
            const client = await makeClientWithRegisteredOrganization()
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)


            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendAppPushMessageByTestClient(client, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                })
            })
        })

        it('Staff cannot SendAppPushMessageService to other users', async () => {
            const staffClient = await makeClientWithStaffUser()
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendAppPushMessageByTestClient(staffClient, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                })
            })
        })

        it('Staff can SendAppPushMessageService to himself', async () => {
            const staffClient = await makeClientWithStaffUser()
            const [b2c] = await createTestB2CApp(admin)

            const [message] = await sendAppPushMessageByTestClient(staffClient, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                app: { id: b2c.id  },
                user: { id: staffClient.user.id  },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        it('Resident cannot SendAppPushMessageService to other users', async () => {
            const residentClient = await makeClientWithResidentUser()
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendAppPushMessageByTestClient(residentClient, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                })
            })
        })

        it('Resident can SendAppPushMessageService to himself', async () => {
            const residentClient = await makeClientWithResidentUser()
            const [b2c] = await createTestB2CApp(admin)

            const [message] = await sendAppPushMessageByTestClient(residentClient, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                app: { id: b2c.id  },
                user: { id: residentClient.user.id  },
            })

            expect(message.id).toMatch(UUID_RE)
        })
    })

    describe('errors', () => {
        it('No user with this id', async () => {
            const fakeUserId = faker.datatype.uuid()
            const [b2c] = await createTestB2CApp(admin)

            await catchErrorFrom(async () => {
                await sendAppPushMessageByTestClient(admin, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: fakeUserId  },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Unable to find user by provided id.',
                    path: ['result'],
                    extensions: {
                        mutation: 'sendAppPushMessage',
                        code: 'BAD_USER_INPUT',
                        type: 'USER_NOT_FOUND',
                        message: 'Unable to find user by provided id.',
                    },
                }])
            })
        })

        it('No app with this id', async () => {
            const [user] = await createTestUser(admin)
            const fakeb2cAppId = faker.datatype.uuid()

            await catchErrorFrom(async () => {
                await sendAppPushMessageByTestClient(admin, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: fakeb2cAppId  },
                    user: { id: user.id  },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Unable to find app by provided id.',
                    path: ['result'],
                    extensions: {
                        mutation: 'sendAppPushMessage',
                        code: 'BAD_USER_INPUT',
                        type: 'APP_NOT_FOUND',
                        message: 'Unable to find app by provided id.',
                    },
                }])
            })
        })

        it('Should have correct dv field (=== 1)', async () => {
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            await catchErrorFrom(async () => {
                await sendAppPushMessageByTestClient(admin, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                    dv: 2,
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Wrong value for data version number',
                    path: ['result'],
                    extensions: {
                        mutation: 'sendAppPushMessage',
                        code: 'BAD_USER_INPUT',
                        type: 'DV_VERSION_MISMATCH',
                        message: 'Wrong value for data version number',
                    },
                }])
            })
        })

        it('Should have correct sender field [\'Dv must be equal to 1\']', async () => {
            const [user] = await createTestUser(admin)
            const [b2c] = await createTestB2CApp(admin)

            await catchErrorFrom(async () => {
                await sendAppPushMessageByTestClient(admin, {
                    type: B2C_APP_MESSAGE_PUSH_TYPE,
                    app: { id: b2c.id  },
                    user: { id: user.id  },
                    sender: { dv: 2, fingerprint: faker.random.alphaNumeric(8) },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Invalid format of "sender" field value. dv: [\'Dv must be equal to 1\']',
                    path: ['result'],
                    extensions: {
                        mutation: 'sendAppPushMessage',
                        code: 'BAD_USER_INPUT',
                        type: 'WRONG_FORMAT',
                        message: 'Invalid format of "sender" field value. {details}',
                    },
                }])
            })
        })
    })
})