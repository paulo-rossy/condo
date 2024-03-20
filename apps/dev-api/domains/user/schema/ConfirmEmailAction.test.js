/**
 * Generated by `createschema user.ConfirmEmailAction 'email:Text; code:Text; isVerified:Checkbox; expiresAt:DateTimeUtc; attempts:Integer'`
 */

const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')

const {
    makeClient,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAccessDeniedErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const { CONFIRM_EMAIL_ACTION_CODE_LENGTH } = require('@dev-api/domains/user/constants')
const {
    ConfirmEmailAction,
    createTestConfirmEmailAction,
    updateTestConfirmEmailAction,
    makeLoggedInAdminClient,
    makeRegisteredAndLoggedInUser,
    makeLoggedInSupportClient,
    startConfirmEmailActionByTestClient,
} = require('@dev-api/domains/user/utils/testSchema')

describe('ConfirmEmailAction', () => {
    const actors = {
        admin: undefined,
        support: undefined,
        user: undefined,
        anonymous: undefined,
    }
    let actionId
    beforeAll(async () => {
        actors.admin = await makeLoggedInAdminClient()
        actors.anonymous = await makeClient()
        actors.user = await makeRegisteredAndLoggedInUser()
        actors.support = await makeLoggedInSupportClient();
        [{ actionId }] = await startConfirmEmailActionByTestClient(actors.user)
    })
    describe('CRUD', () => {
        describe('Create', () => {
            test.each(Object.keys(actors))('%p cannot', async (actor) => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestConfirmEmailAction(actors[actor])
                })
            })
        })
        describe('Read', () => {
            test('Admin can', async () => {
                const actions = await ConfirmEmailAction.getAll(actors.admin, {}, { first: 100 })
                expect(actions.length).toBeGreaterThan(0)
            })
            test('Support cannot', async () => {
                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await ConfirmEmailAction.getAll(actors.support, {})
                })
            })
            test('User cannot', async () => {
                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await ConfirmEmailAction.getAll(actors.support, {})
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await ConfirmEmailAction.getAll(actors.anonymous, {})
                })
            })
        })
        describe('Update', () => {
            test('Admin can update expiresAt', async () => {
                const [updatedAction] = await updateTestConfirmEmailAction(actors.admin, actionId, {
                    expiresAt: dayjs().toISOString(),
                })
                expect(updatedAction).toBeDefined()

                const payloads = [
                    { email: faker.internet.email() },
                    { code: faker.random.numeric(CONFIRM_EMAIL_ACTION_CODE_LENGTH) },
                    { isVerified: true },
                ]

                for (const payload of payloads) {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestConfirmEmailAction(actors.admin, updatedAction.id, payload)
                    })
                }
            })
            test('Support cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.support, actionId, {})
                })
            })
            test('User cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.user, actionId, {})
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.anonymous, actionId, {})
                })
            })
        })
        describe('Soft-delete', () => {
            test('Admin can update', async () => {
                const [updatedAction] = await updateTestConfirmEmailAction(actors.admin, actionId, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(updatedAction).toHaveProperty('deletedAt')
                expect(updatedAction.deletedAt).not.toBeNull()
            })
            test('Support cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.support, actionId, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
            test('User cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.user, actionId, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestConfirmEmailAction(actors.anonymous, actionId, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
        })
        describe('Hard-delete', () => {
            test.each(Object.keys(actors))('%p cannot', async (actor) => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ConfirmEmailAction.delete(actors[actor], actionId)
                })
            })
        })
    })
})
