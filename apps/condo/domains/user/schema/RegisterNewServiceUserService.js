/**
 * Generated by `createservice user.RegisterNewServiceUserService`
 */
const { faker } = require('@faker-js/faker')

const { GQLCustomSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/user/access/RegisterNewServiceUserService')
const { SERVICE } = require('@condo/domains/user/constants/common')
const { User } = require('@condo/domains/user/utils/serverSchema')


const RegisterNewServiceUserService = new GQLCustomSchema('RegisterNewServiceUserService', {
    types: [
        {
            access: true,
            type: 'input RegisterNewServiceUserInput { dv: Int!, sender: SenderFieldInput!, name: String!, email: String!, meta: JSON }',
        },
        {
            access: true,
            type: 'type RegisterNewServiceUserOutput { id: ID!, email: String!, password: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canRegisterNewServiceUser,
            schema: 'registerNewServiceUser(data: RegisterNewServiceUserInput!): RegisterNewServiceUserOutput',
            resolver: async (parent, args, context) => {
                const userData = {
                    ...args.data,
                    type: SERVICE,
                    password: faker.internet.password(),
                }
                const user = await User.create(context, userData)
                return { id: user.id, email: userData.email, password: userData.password }
            },
        },
    ],
    
})

module.exports = {
    RegisterNewServiceUserService,
}
