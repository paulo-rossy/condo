const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const { expectToThrowGQLError } = require('@open-condo/keystone/test.utils')

const { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } = require('@condo/domains/user/constants/common')
const { GQL_ERRORS: USER_ERRORS } = require('@condo/domains/user/constants/errors')
const { REGISTER_NEW_USER_MUTATION } = require('@condo/domains/user/gql')
const { createTestUser, registerNewUser, createTestPhone, createTestEmail, createTestLandlineNumber, makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const { errors } = require('./RegisterNewUserService')


describe('RegisterNewUserService', () => {
    test('register new user', async () => {
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const [user] = await registerNewUser(client, { name })
        expect(user.id).toMatch(/^[0-9a-zA-Z-_]+$/)
        expect(user.name).toMatch(name)
    })

    test('register user with existed phone', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await createTestUser(admin)
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = faker.internet.password()
        const email = createTestEmail()
        const phone = userAttrs.phone
        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, phone, password, email }),
            errors.USER_WITH_SPECIFIED_PHONE_ALREADY_EXISTS,
            'user',
        )
    })

    test('register user with landline phone number', async () => {
        const client = await makeClient()
        const phone = createTestLandlineNumber()

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { phone }),
            errors.WRONG_PHONE_FORMAT,
            'user',
        )
    })

    test('register user with existed email', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await createTestUser(admin)
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = faker.internet.password()
        const email = userAttrs.email
        const phone = createTestPhone()
        const dv = 1
        const sender = { dv: 1, fingerprint: 'tests' }
        const { errors } = await client.mutate(REGISTER_NEW_USER_MUTATION, {
            data: {
                dv,
                sender,
                name,
                phone,
                password,
                email,
            },
        })
        expect(errors).toMatchObject([{
            message: 'User with specified email already exists',
            name: 'GQLError',
            path: ['user'],
            extensions: {
                mutation: 'registerNewUser',
                variable: ['data', 'email'],
                code: 'BAD_USER_INPUT',
                type: 'NOT_UNIQUE',
            },
        }])
    })

    test('register with empty password', async () => {
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = ''
        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.INVALID_PASSWORD_LENGTH,
            'user',
        )
    })

    test('register with weak password', async () => {
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = '123456789'
        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            errors.PASSWORD_IS_FREQUENTLY_USED,
            'user',
        )
    })

    test('register user with short password', async () => {
        const client = await makeClient()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = faker.internet.password(MIN_PASSWORD_LENGTH - 1)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.INVALID_PASSWORD_LENGTH,
            'user',
        )
    })

    test('register user with password starting or ending with a space', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = ' ' + faker.internet.password(12) + ' '

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.PASSWORD_CONTAINS_SPACES_AT_BEGINNING_OR_END,
            'user',
        )
    })

    test('register user with very long password', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = faker.internet.password(MAX_PASSWORD_LENGTH + 1)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.INVALID_PASSWORD_LENGTH,
            'user',
        )
    })

    test('register user with password consisting of different characters', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = faker.internet.password(12, false, /a+/)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.PASSWORD_CONSISTS_OF_IDENTICAL_CHARACTERS,
            'user',
        )
    })

    test('register user with password containing email', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const email = faker.internet.exampleEmail()
        const password = email + faker.internet.password(12)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password, email }),
            USER_ERRORS.PASSWORD_CONTAINS_EMAIL,
            'user',
        )
    })

    test('register user with password containing phone', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const phone = createTestPhone()
        const password = phone + faker.internet.password(12)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password, phone }),
            USER_ERRORS.PASSWORD_CONTAINS_PHONE,
            'user',
        )
    })

    test('register user with password containing name', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const name = faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}')
        const password = name + faker.internet.password(12)

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { name, password }),
            USER_ERRORS.PASSWORD_CONTAINS_NAME,
            'user',
        )
    })

    test('register with wrong token', async () => {
        const client = await makeClient()
        const confirmPhoneActionToken = faker.datatype.uuid()

        await expectToThrowGQLError(
            async () => await registerNewUser(client, { confirmPhoneActionToken }),
            errors.UNABLE_TO_FIND_CONFIRM_PHONE_ACTION,
            'user',
        )
    })
})
