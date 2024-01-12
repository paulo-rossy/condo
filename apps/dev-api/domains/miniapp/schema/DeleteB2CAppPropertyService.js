/**
 * Generated by `createservice miniapp.DeleteB2CAppPropertyService`
 */

const dayjs = require('dayjs')

const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const { productionClient, developmentClient } = require('@dev-api/domains/common/utils/serverClients')
const { CondoB2CAppPropertyGql } = require('@dev-api/domains/condo/gql')
const access = require('@dev-api/domains/miniapp/access/DeleteB2CAppPropertyService')
const { PROD_ENVIRONMENT } = require('@dev-api/domains/miniapp/constants/publishing')

const DeleteB2CAppPropertyService = new GQLCustomSchema('DeleteB2CAppPropertyService', {
    types: [
        {
            access: true,
            type: 'input DeleteB2CAppPropertyInput { dv: Int!, sender: SenderFieldInput!, id: ID!, environment: AppEnvironment! }',
        },
        {
            access: true,
            type: 'type DeleteB2CAppPropertyOutput { id: String!, deletedAt: String, address: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canDeleteB2CAppProperty,
            schema: 'deleteB2CAppProperty(data: DeleteB2CAppPropertyInput!): DeleteB2CAppPropertyOutput',
            resolver: async (parent, args) => {
                const { data: { dv, sender, id, environment } } = args

                const serverClient = environment === PROD_ENVIRONMENT
                    ? productionClient
                    : developmentClient

                return await serverClient.updateModel({
                    modelGql: CondoB2CAppPropertyGql,
                    id,
                    updateInput: {
                        dv,
                        sender,
                        deletedAt: dayjs().toISOString(),
                    },
                })
            },
        },
    ],
    
})

module.exports = {
    DeleteB2CAppPropertyService,
}
