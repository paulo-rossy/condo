/**
 * Generated by `createschema user.OidcClient 'clientId:Text; payload:Json; name?:Text; meta?:Json'`
 */

const { Text, DateTimeUtc } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/user/access/OidcClient')
const Ajv = require('ajv')

const ajv = new Ajv()

const payloadJsonSchema = {
    type: 'object',
    properties: {
        client_id: {
            type: 'string',
        },
        client_secret: {
            type: 'string',
        },
        redirect_uris: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
        },
    },
    additionalProperties: true,
    required: [
        'client_id',
        'client_secret',
        'redirect_uris',
    ],
}

const jsonPayloadValidator = ajv.compile(payloadJsonSchema)

const OidcClient = new GQLListSchema('OidcClient', {
    schemaDoc: 'The OIDC clients list',
    fields: {

        clientId: {
            schemaDoc: 'The clientId',
            type: Text,
            isRequired: true,
            isUnique: true,
        },

        payload: {
            schemaDoc: 'The payload of the client (clientId, clientSecret, callbackUrl, ...)',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    const value = resolvedData[fieldPath]
                    if (!jsonPayloadValidator(value)) {
                        addFieldValidationError(`Invalid json structure of ${fieldPath} field`)
                    }
                },
            },
        },

        name: {
            schemaDoc: 'The human readable name for client',
            type: Text,
            isUnique: true,
        },

        meta: {
            schemaDoc: 'The additional client data',
            type: Json,
        },

        expiresAt: {
            schemaDoc: 'The timestamp of the client expiration',
            type: DateTimeUtc,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOidcClients,
        create: access.canManageOidcClients,
        update: access.canManageOidcClients,
        delete: false,
        auth: true,
    },
})

module.exports = {
    OidcClient,
}
