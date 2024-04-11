/**
 * Generated by `createservice resident.SendMessageToResidentScopesService --type mutations`
 */

const { isEmpty } = require('lodash')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { SUCCESS_STATUS } = require('@condo/domains/common/constants')
const { NOT_FOUND } = require('@condo/domains/common/constants/errors')
const access = require('@condo/domains/resident/access/SendMessageToResidentScopesService')
const { sendMessageToResidentScopesTask } = require('@condo/domains/resident/tasks/sendMessageToResidentScopes.task')

const MUTATION_NAME = 'sendMessageToResidentScopes'

const ERRORS = {
    SCOPES_IS_EMPTY: {
        mutation: MUTATION_NAME,
        variable: ['data', 'scopes'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Scopes could not be empty',
        messageForUser: `api.resident.${MUTATION_NAME}.SCOPES_IS_EMPTY`,
    },
}


/**
 * Validate data for SendMessageToResidentScopesService.
 * Throws typed errors on invalid values.
 * Prepares data for sendMessageToResidentScopesTask
 * @param context
 * @param data
 * @returns {Promise<[{organization: {id}, scopes}]>}
 */
const validateData = async (context, data) => {
    const { scopes } = data

    if (isEmpty(scopes)) throw new GQLError(ERRORS.SCOPES_IS_EMPTY, context)
}

const SendMessageToResidentScopesService = new GQLCustomSchema('SendMessageToResidentScopesService', {
    types: [
        {
            access: true,
            type: 'input PropertyUnitInput { unitType: String!, unitName: String! }',
        },
        {
            access: true,
            type: 'input ResidentScopesInput { property: PropertyWhereUniqueInput!, units: [PropertyUnitInput], billingAccountNumbers: [ID], skipUnits: [PropertyUnitInput], skipBillingAccountNumbers: [ID] }',
        },
        {
            access: true,
            type:   'input SendMessageToResidentScopesServiceInput { ' +
                        'dv: Int!, ' +
                        'sender: JSON!, ' +
                        'type: MessageType!, ' +
                        'lang: SendMessageLang, ' +
                        'uniqKeyTemplate: String, ' +
                        'scopes: [ResidentScopesInput!]!, ' +
                        'meta: JSON' +
                    '}',
        },
        {
            access: true,
            type: 'type SendMessageToResidentScopesServiceOutput { status: String! }',
        },
    ],

    mutations: [
        {
            access: access.canSendMessageToResidentScopes,
            schema: 'sendMessageToResidentScopes(data: SendMessageToResidentScopesServiceInput!): SendMessageToResidentScopesServiceOutput',
            doc: {
                summary: 'Sends notification of requested type to all residents of provided scopes',
                errors: ERRORS,
            },
            resolver: async (parent, args, context) => {
                const { data } = args

                await validateData(context, data)
                await sendMessageToResidentScopesTask.delay(JSON.stringify(data))

                return { status: SUCCESS_STATUS }
            },
        },
    ],

})

module.exports = {
    SendMessageToResidentScopesService,
    ERRORS,
}
