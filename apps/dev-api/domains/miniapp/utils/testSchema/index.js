/**
 * Generated by `createschema miniapp.B2CApp 'name:Text'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')
const conf = require('@open-condo/config')
const path = require('path')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')
const { buildFakeAddressAndMeta } = require('@condo/domains/property/utils/testSchema/factories')

const {
    B2CApp: B2CAppGQL,
    B2CAppBuild: B2CAppBuildGQL,
    B2CAppPublishRequest: B2CAppPublishRequestGQL,
    PUBLISH_B2C_APP_MUTATION,
    IMPORT_B2C_APP_MUTATION,
    ALL_B2C_APP_PROPERTIES_QUERY,
    CREATE_B2C_APP_PROPERTY_MUTATION,
    DELETE_B2C_APP_PROPERTY_MUTATION,
} = require('@dev-api/domains/miniapp/gql')
const { UploadingFile } = require('@open-condo/keystone/test.utils')
const { DEV_ENVIRONMENT } = require('@dev-api/domains/miniapp/constants/publishing')
const { generateGqlQueries } = require("@open-condo/codegen/generate.gql");
const { DEFAULT_COLOR_SCHEMA } = require("@dev-api/domains/miniapp/constants/b2c")
/* AUTOGENERATE MARKER <IMPORT> */

const B2CApp = generateGQLTestUtils(B2CAppGQL)
const B2CAppBuild = generateGQLTestUtils(B2CAppBuildGQL)
const B2CAppPublishRequest = generateGQLTestUtils(B2CAppPublishRequestGQL)
/* AUTOGENERATE MARKER <CONST> */

const FAKE_BUILD_ASSET_PATH = path.resolve(conf.PROJECT_ROOT, 'apps/dev-api/domains/miniapp/utils/testSchema/assets/build.zip')
const FAKE_B2C_APP_LOGO_PATH = path.resolve(conf.PROJECT_ROOT, 'apps/dev-api/domains/miniapp/utils/testSchema/assets/logo.png')

const CondoB2CApp = generateGQLTestUtils(generateGqlQueries('B2CApp', '{ id name developer logo { publicUrl filename } currentBuild { id } importId importRemoteSystem deletedAt v }'))
const CondoB2CAppBuild = generateGQLTestUtils(generateGqlQueries('B2CAppBuild', '{ id version data { publicUrl } importId importRemoteSystem }'))
const CondoB2CAppProperty = generateGQLTestUtils(generateGqlQueries('B2CAppProperty', '{ id address }'))

async function createCondoB2CApp (client) {
    const attrs = {
        dv: 1,
        sender: { dv: 1, fingerprint: faker.random.alphaNumeric(8) },
        name: faker.commerce.productName(),
        developer: faker.company.name(),
        colorSchema: DEFAULT_COLOR_SCHEMA,
        logo: new UploadingFile(FAKE_B2C_APP_LOGO_PATH),
    }

    const obj = await CondoB2CApp.create(client, attrs)
    return [obj, attrs]
}

async function updateCondoB2CApp(client, app, extraAttrs = {}) {
    const attrs = {
        dv: 1,
        sender: { dv: 1, fingerprint: faker.random.alphaNumeric(8) },
        ...extraAttrs,
    }
    const obj = await CondoB2CApp.update(client, app.id, attrs)
    return [obj, attrs]
}

async function createCondoB2CAppBuild (client, app, extraAttrs = {}) {
    const attrs = {
        dv: 1,
        sender: { dv: 1, fingerprint: faker.random.alphaNumeric(8) },
        app: { connect: { id: app.id } },
        version: `${faker.datatype.number()}.${faker.datatype.number()}.${faker.datatype.number()}`,
        data: new UploadingFile(FAKE_BUILD_ASSET_PATH),
        ...extraAttrs
    }

    const obj = await CondoB2CAppBuild.create(client, attrs)
    return [obj, attrs]
}

async function createCondoB2CAppProperties(client, condoApp, amount) {
    if (!client) throw new Error('No client')
    if (!condoApp || !condoApp.id) throw new Error('No app')

    const attrs = []
    for (let i = 0; i < amount; i++) {
        attrs.push({
            data: {
                dv: 1,
                sender: { dv: 1, fingerprint: faker.random.alphaNumeric(8) },
                app: { connect: { id: condoApp.id } },
                ...buildFakeAddressAndMeta(false)
            }
        })
    }

    const objs = await CondoB2CAppProperty.createMany(client, attrs)

    return [objs, attrs]
}

async function createTestB2CApp (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = `${faker.commerce.product()}`

    const attrs = {
        dv: 1,
        sender,
        name,
        ...extraAttrs,
    }
    const obj = await B2CApp.create(client, attrs)
    return [obj, attrs]
}

async function updateTestB2CApp (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await B2CApp.update(client, id, attrs)
    return [obj, attrs]
}

async function updateTestB2CApps (client, attrsArray) {
    if (!client) throw new Error('no client')
    if (!Array.isArray(attrsArray)) throw new Error('payload is not an array')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const data = attrsArray.map(item => ({ id: item.id, data: { ...item.data, dv: 1, sender } }))
    const objs = await B2CApp.updateMany(client, data)

    return [objs, data]
}

function generateBuildVersion () {
    return `${faker.datatype.number()}.${faker.datatype.number()}.${faker.datatype.number()}`
}

async function createTestB2CAppBuild (client, app, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const version = generateBuildVersion()
    const data = new UploadingFile(FAKE_BUILD_ASSET_PATH)

    const attrs = {
        dv: 1,
        sender,
        app: { connect: { id: app.id } },
        data,
        version,
        ...extraAttrs,
    }
    const obj = await B2CAppBuild.create(client, attrs)
    return [obj, attrs]
}

async function updateTestB2CAppBuild (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await B2CAppBuild.update(client, id, attrs)
    return [obj, attrs]
}

async function publishB2CAppByTestClient(client, app, options = undefined, environment = DEV_ENVIRONMENT) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        app: { id: app.id },
        environment,
        options: options || { info: true },
    }
    const { data, errors } = await client.mutate(PUBLISH_B2C_APP_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestB2CAppPublishRequest (client, app, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        app: { connect: { id: app.id } },
        ...extraAttrs,
    }
    const obj = await B2CAppPublishRequest.create(client, attrs)
    return [obj, attrs]
}

async function updateTestB2CAppPublishRequest (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await B2CAppPublishRequest.update(client, id, attrs)
    return [obj, attrs]
}

async function importB2CAppByTestClient(client, app, condoDevApp = null, condoProdApp = null, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app')
    if (condoDevApp && !condoDevApp.id) throw new Error('no condoDevApp.id')
    if (condoProdApp && !condoProdApp.id) throw new Error('no condoProdApp.id')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const from = {}
    if (condoDevApp) {
        from.developmentApp =  { id: condoDevApp.id }
    }
    if (condoProdApp) {
        from.productionApp = { id: condoProdApp.id }
    }

    const attrs = {
        dv: 1,
        sender,
        to: { app: { id: app.id } },
        from,
        options: { info: true, builds: true, publish: true },
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(IMPORT_B2C_APP_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function allB2CAppPropertiesByTestClient(client, app, environment, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app')
    if (!environment) throw new Error('no environment')

    const attrs = {
        app: { id: app.id },
        environment,
        first: 100,
        skip: 0,
        ...extraAttrs,
    }
    const { data, errors } = await client.query(ALL_B2C_APP_PROPERTIES_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createB2CAppPropertyByTestClient(client, app, environment, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!app || !app.id) throw new Error('no app')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const { address } = buildFakeAddressAndMeta(false)

    const attrs = {
        dv: 1,
        sender,
        app: { id: app.id },
        environment,
        address,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(CREATE_B2C_APP_PROPERTY_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function deleteB2CAppPropertyByTestClient(client, id, environment) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        id,
        environment,
    }
    const { data, errors } = await client.mutate(DELETE_B2C_APP_PROPERTY_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    CondoB2CApp, createCondoB2CApp,
    CondoB2CAppBuild, createCondoB2CAppBuild, updateCondoB2CApp,
    CondoB2CAppProperty, createCondoB2CAppProperties,
    B2CApp, createTestB2CApp, updateTestB2CApp, updateTestB2CApps,
    B2CAppBuild, createTestB2CAppBuild, updateTestB2CAppBuild, generateBuildVersion,
    B2CAppPublishRequest, createTestB2CAppPublishRequest, updateTestB2CAppPublishRequest,
    publishB2CAppByTestClient,
    importB2CAppByTestClient,
    allB2CAppPropertiesByTestClient,
    createB2CAppPropertyByTestClient,
    deleteB2CAppPropertyByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}