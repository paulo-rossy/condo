/**
 * Generated by `createservice miniapp.ImportB2CAppService`
 */

const got = require('got')
const get = require('lodash/get')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const { wrapUploadFile } = require('@open-condo/keystone/upload')

const { REMOTE_SYSTEM } = require('@dev-api/domains/common/constants/common')
const { productionClient, developmentClient } = require('@dev-api/domains/common/utils/serverClients')
const access = require('@dev-api/domains/miniapp/access/ImportB2CAppService')
const { APP_NOT_FOUND } = require('@dev-api/domains/miniapp/constants/errors')
const { PUBLISH_REQUEST_APPROVED_STATUS } = require('@dev-api/domains/miniapp/constants/publishing')
const { B2CApp, B2CAppBuild, B2CAppPublishRequest } = require('@dev-api/domains/miniapp/utils/serverSchema')

const ERRORS = {
    DEV_APP_NOT_FOUND: {
        code: BAD_USER_INPUT,
        type: APP_NOT_FOUND,
        message: 'No app with specified ID found on condo development stand',
    },
    PROD_APP_NOT_FOUND: {
        code: BAD_USER_INPUT,
        type: APP_NOT_FOUND,
        message: 'No app with specified ID found on condo production stand',
    },
}

const FETCH_BUILDS_CHUNK_SIZE = 10
const IMPORTABLE_VERSION = /^\d{1,10}.\d{1,10}.\d{1,10}$/
const CondoB2CAppGQL = generateGqlQueries('B2CApp', '{ id developer name logo { publicUrl filename mimetype encoding } }')
const CondoB2CAppBuildGQL = generateGqlQueries('B2CAppBuild', '{ id version data { publicUrl originalFilename mimetype encoding } }')

async function importAppInfo ({ args, context }) {
    const {
        data: {
            dv,
            sender,
            from,
            to: { app: { id: appId } },
        },
    } = args

    const developmentAppId = get(from, ['developmentApp', 'id'])
    const productionAppId = get(from, ['productionApp', 'id'])

    let devApp, prodApp

    if (developmentAppId) {
        devApp = await developmentClient.updateModel({
            modelGql: CondoB2CAppGQL,
            id: developmentAppId,
            updateInput: {
                dv,
                sender,
                importId: appId,
                importRemoteSystem: REMOTE_SYSTEM,
            },
        })
        if (!devApp) {
            throw new GQLError(ERRORS.DEV_APP_NOT_FOUND, context)
        }
    }

    if (productionAppId) {
        prodApp = await productionClient.updateModel({
            modelGql: CondoB2CAppGQL,
            id: productionAppId,
            updateInput: {
                dv,
                sender,
                importId: appId,
                importRemoteSystem: REMOTE_SYSTEM,
            },
        })
    }

    // Use fetched apps to update dev-api app with priority to production one
    if (prodApp) {
        const stream = got.stream(prodApp.logo.publicUrl, {
            headers: { 'Authorization': `Bearer ${productionClient.authToken}` },
        })
        await B2CApp.update(context, appId, {
            dv,
            sender,
            name: prodApp.name,
            developer: prodApp.developer,
            logo: wrapUploadFile({
                stream: stream,
                filename: prodApp.logo.filename,
                mimetype: prodApp.logo.mimetype,
                encoding: prodApp.logo.encoding,
            }),
            productionExportId: productionAppId,
        })
    }
    if (devApp) {
        // If prod data is used to update info -> update only exportId
        if (prodApp) {
            await B2CApp.update(context, appId, {
                dv,
                sender,
                developmentExportId: developmentAppId,
            })
        } else {
            const stream = got.stream(devApp.logo.publicUrl, {
                headers: { 'Authorization': `Bearer ${developmentClient.authToken}` },
            })
            await B2CApp.update(context, appId, {
                dv,
                sender,
                name: devApp.name,
                developer: devApp.developer,
                logo: wrapUploadFile({
                    stream: stream,
                    filename: devApp.logo.filename,
                    mimetype: devApp.logo.mimetype,
                    encoding: devApp.logo.encoding,
                }),
                developmentExportId: developmentAppId,
            })
        }
    }
}

async function _importBuildFromClient ({ serverClient, remoteAppId, versionSuffix, exportPrefix, args, context }) {
    const {
        data: {
            dv,
            sender,
            to: { app: { id: appId } },
        },
    } = args

    let buildsFetched = FETCH_BUILDS_CHUNK_SIZE
    const exportField = `${exportPrefix}ExportId`

    let skip = 0

    while (buildsFetched === FETCH_BUILDS_CHUNK_SIZE) {
        const builds = await serverClient.getModels({
            modelGql: CondoB2CAppBuildGQL,
            where: {
                app: { id: remoteAppId },
                importId: null,
            },
            first: FETCH_BUILDS_CHUNK_SIZE,
            skip: skip,
            sortBy: ['createdAt_ASC'],
        })

        if (!builds || !builds.length) {
            break
        }

        buildsFetched = builds.length
        const existingSuffixedBuilds = await B2CAppBuild.getAll(context, {
            app: { id: appId },
            deletedAt: null,
            version_in: builds.map(build => `${build.version}-${versionSuffix}`),
        })
        const existingSuffixedVersions = new Set(existingSuffixedBuilds.map(build => build.version))

        const devApiCreatePayload = []

        for (const build of builds) {
            if (!IMPORTABLE_VERSION.test(build.version) || existingSuffixedVersions.has(`${build.version}-${versionSuffix}`)) {
                skip += 1
                continue
            }
            devApiCreatePayload.push({
                data: {
                    dv,
                    sender,
                    version: `${build.version}-${versionSuffix}`,
                    app: { connect: { id: appId } },
                    data: wrapUploadFile({
                        stream: got.stream(build.data.publicUrl, {
                            headers: { 'Authorization': `Bearer ${serverClient.authToken}` },
                        }),
                        filename: build.data.originalFilename,
                        mimetype: build.data.mimetype,
                        encoding: build.data.encoding,
                    }),
                    [exportField]: build.id,
                },
            })
        }
        const createdBuilds = await B2CAppBuild.createMany(context, devApiCreatePayload)
        const condoUpdatePayload = createdBuilds.map(build => ({
            id: build[exportField],
            data: {
                dv,
                sender,
                importId: build.id,
                importRemoteSystem: REMOTE_SYSTEM,
            },

        }))
        await serverClient.updateModels({
            modelGql: CondoB2CAppBuildGQL,
            updateInputs: condoUpdatePayload,
        })
    }
}

async function importAppBuilds ({ args, context }) {
    const developmentAppId = get(args, ['data', 'from', 'developmentApp', 'id'])
    const productionAppId = get(args, ['data', 'from', 'productionApp', 'id'])

    if (developmentAppId) {
        await _importBuildFromClient({
            serverClient: developmentClient,
            remoteAppId: developmentAppId,
            versionSuffix: 'dev',
            exportPrefix: 'development',
            args,
            context,
        })
    }
    if (productionAppId) {
        await _importBuildFromClient({
            serverClient: productionClient,
            remoteAppId: productionAppId,
            versionSuffix: 'prod',
            exportPrefix: 'production',
            args,
            context,
        })
    }
}

const ImportB2CAppService = new GQLCustomSchema('ImportB2CAppService', {
    types: [
        {
            access: true,
            type: 'input ImportB2CAppFromInput { developmentApp: B2CAppWhereUniqueInput, productionApp: B2CAppWhereUniqueInput }',
        },
        {
            access: true,
            type: 'input ImportB2CAppToInput { app: B2CAppWhereUniqueInput! }',
        },
        {
            access: true,
            type: 'input ImportB2CAppOptionsInput { info: Boolean!, builds: Boolean!, publish: Boolean! }',
        },
        {
            access: true,
            type: 'input ImportB2CAppInput { dv: Int!, sender: SenderFieldInput!, from: ImportB2CAppFromInput!, to: ImportB2CAppToInput!, options: ImportB2CAppOptionsInput! }',
        },
        {
            access: true,
            type: 'type ImportB2CAppOutput { success: Boolean! }',
        },
    ],
    
    mutations: [
        {
            access: access.canImportB2CApp,
            schema: 'importB2CApp(data: ImportB2CAppInput!): ImportB2CAppOutput',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, options, to: { app: { id: appId } } } } = args

                // Step 1. App info sync
                if (options.info) {
                    await importAppInfo({ args, context })
                }

                // Step 2. Import builds
                if (options.builds) {
                    await importAppBuilds({ args, context })
                }


                if (options.publish) {
                    const publishPayload = {
                        dv,
                        sender,
                        status: PUBLISH_REQUEST_APPROVED_STATUS,
                        isAppTested: true,
                        isContractSigned: true,
                        isInfoApproved: true,
                    }
                    const existingPublishRequest = await B2CAppPublishRequest.getOne(context, {
                        app: { id: appId },
                        deletedAt: null,
                    })
                    if (existingPublishRequest) {
                        await B2CAppPublishRequest.update(context, existingPublishRequest.id, publishPayload)
                    } else {
                        await B2CAppPublishRequest.create(context, {
                            ...publishPayload,
                            app: { connect: { id: appId } },
                        })
                    }
                }

                return {
                    success: true,
                }
            },
        },
    ],
    
})

module.exports = {
    ImportB2CAppService,
}
