/**
 * Generated by `createschema miniapp.B2CAppAccessRight 'app:Relationship:B2CApp:CASCADE; condoUserId:Text'`
 */

const get = require('lodash/get')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')


const { GET_USER_EMAIL_QUERY } = require('@dev-api/domains/common/gql')
const { productionClient, developmentClient } = require('@dev-api/domains/common/utils/serverClients')
const access = require('@dev-api/domains/miniapp/access/B2CAppAccessRight')
const {
    B2C_APP_ACCESS_RIGHT_UNIQUE_APP_CONSTRAINT,
} = require('@dev-api/domains/miniapp/constants/constraints')
const { AVAILABLE_ENVIRONMENTS, PROD_ENVIRONMENT } = require('@dev-api/domains/miniapp/constants/publishing')
const { exportable } = require('@dev-api/domains/miniapp/plugins/exportable')



const B2CAppAccessRight = new GQLListSchema('B2CAppAccessRight', {
    schemaDoc:
        'Link between service user and B2C App. ' +
        'The existence of this connection means that ' +
        'this condo user will have the rights to perform actions on behalf of the integration ' +
        'and modify some B2CApp-related models, such as B2CAppProperty / B2CAppBuild ' +
        'as soon as app will be published to specified environment',
    fields: {
        app: {
            schemaDoc: 'Link to B2CApp',
            type: 'Relationship',
            ref: 'B2CApp',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
        condoUserId: {
            schemaDoc: 'ID of condo user, which will be linked to the published app',
            type: 'Uuid',
            isRequired: true,
        },
        condoUserEmail: {
            schemaDoc: 'Email of service condo user linked to the published app',
            type: 'Virtual',
            graphQLReturnType: 'String',
            resolver: async (item) => {
                const { condoUserId, environment } = item
                const serverClient = environment === PROD_ENVIRONMENT
                    ? productionClient
                    : developmentClient
                const response = await serverClient.executeAuthorizedQuery({
                    query: GET_USER_EMAIL_QUERY,
                    variables: { id: condoUserId },
                })

                return get(response, ['data', 'user', 'email'], null)
            },
        },
        environment: {
            schemaDoc: 'Condo environment',
            type: 'Select',
            options: AVAILABLE_ENVIRONMENTS,
            isRequired: true,
            graphQLReturnType: 'AppEnvironment',
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['environment', 'app'],
                condition: 'Q(deletedAt__isnull=True)',
                name: B2C_APP_ACCESS_RIGHT_UNIQUE_APP_CONSTRAINT,
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), exportable(), historical()],
    access: {
        read: access.canReadB2CAppAccessRights,
        create: access.canManageB2CAppAccessRights,
        update: access.canManageB2CAppAccessRights,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2CAppAccessRight,
}
