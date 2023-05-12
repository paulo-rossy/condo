/**
 * Generated by `createschema user.User 'name:Text;isAdmin:Checkbox;email:Text;password:Password;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')

const {
    generateGQLTestUtils,
} = require('@open-condo/codegen/generate.test.utils')

const { User: UserGQL } = require('@address-service/domains/user/gql')
const { getRandomString, makeLoggedInAdminClient, makeLoggedInClient } = require('@open-condo/keystone/test.utils')
/* AUTOGENERATE MARKER <IMPORT> */

const User = generateGQLTestUtils(UserGQL)
/* AUTOGENERATE MARKER <CONST> */

async function makeClientWithNewRegisteredAndLoggedInUser (extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const [user, userAttrs] = await createTestUser(admin, extraAttrs)
    const client = await makeLoggedInClient(userAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithSupportUser(extraAttrs = {}) {
    return await makeClientWithNewRegisteredAndLoggedInUser({ isSupport: true, ...extraAttrs })
}

function createTestEmail () {
    return ('test.' + getRandomString() + '@example.com').toLowerCase()
}

async function createTestUser (client, extraAttrs = {}, { raw = false } = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const password = getRandomString()

    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        password,
        ...extraAttrs,
    }
    const result = await User.create(client, attrs, { raw })
    if (raw) return result
    return [result, attrs]
}

async function updateTestUser (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await User.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
    User, createTestUser, updateTestUser,
/* AUTOGENERATE MARKER <EXPORTS> */
}
