/**
 * Generated by `createschema miniapp.B2BAppAccessRight 'user:Relationship:User:PROTECT;'`
 */

const get = require('lodash/get')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { getByCondition } = require('@open-condo/keystone/schema')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/miniapp/access/B2BAppAccessRight')
const { ACCESS_RIGHT_SET_NOT_FOR_CONNECTED_B2B_APP } = require('@condo/domains/miniapp/constants')
const { SERVICE_USER_FIELD } = require('@condo/domains/miniapp/schema/fields/accessRight')


const ERRORS = {
    ACCESS_RIGHT_SET_NOT_FOR_CONNECTED_B2B_APP: {
        code: BAD_USER_INPUT,
        type: ACCESS_RIGHT_SET_NOT_FOR_CONNECTED_B2B_APP,
        message: '"accessRightSet" must be connected to B2BApp, which specified in "app"',
    },
}

const B2BAppAccessRight = new GQLListSchema('B2BAppAccessRight', {
    schemaDoc: 'Link between service user and B2B App. The existence of this connection means that this user has the rights to perform actions on behalf of the integration',
    fields: {
        user: SERVICE_USER_FIELD,
        app: {
            schemaDoc: 'Link to B2BApp.accessRights',
            type: 'Relationship',
            ref: 'B2BApp.accessRights',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
        accessRightSet: {
            schemaDoc: 'Link to the set of access rights.' +
                ' This set of access right will be used to check your service user access to schemas that are' +
                ' linked to "Organization" schema (such as "Organization", "Ticket" and others).' +
                '\n These accesses will only apply to entities that belong to organizations that connected your app',
            type: 'Relationship',
            ref: 'B2BAppAccessRightSet',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Required relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['app'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'b2b_app_access_right_unique_app',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadB2BAppAccessRights,
        create: access.canManageB2BAppAccessRights,
        update: access.canManageB2BAppAccessRights,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, context, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const accessRightSetId = get(newItem, 'accessRightSet')
            const shouldCheckAccessRight = Boolean(resolvedData['app'] || resolvedData['accessRightSet'])

            if (accessRightSetId && shouldCheckAccessRight) {
                const appId = get(newItem, 'app')
                const accessRightSet = await getByCondition('B2BAppAccessRightSet', {
                    app: { id: appId, deletedAt: null },
                    deletedAt: null,
                    id: accessRightSetId,
                })

                if (!accessRightSet) {
                    throw new GQLError(ERRORS.ACCESS_RIGHT_SET_NOT_FOR_CONNECTED_B2B_APP, context)
                }
            }
        },
    },
})

module.exports = {
    B2BAppAccessRight,
    ERRORS,
}
