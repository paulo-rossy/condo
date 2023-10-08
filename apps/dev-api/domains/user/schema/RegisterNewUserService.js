/**
 * Generated by `createservice user.RegisterNewUserService`
 */

const dayjs = require('dayjs')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getById } = require('@open-condo/keystone/schema')

const {
    USER_ALREADY_EXISTS,
    ACTION_NOT_FOUND,
} = require('@dev-api/domains/user/constants/errors')
const { User, ConfirmPhoneAction } = require('@dev-api/domains/user/utils/serverSchema')

const ERRORS = {
    USER_ALREADY_EXISTS: {
        code: BAD_USER_INPUT,
        type: USER_ALREADY_EXISTS,
        message: 'User with specified phone number is already registered',
    },
    ACTION_NOT_FOUND: {
        code: BAD_USER_INPUT,
        type: ACTION_NOT_FOUND,
        message: 'ConfirmPhoneAction with the specified ID is not verified, expired, or does not exist',
    },
}

const RegisterNewUserService = new GQLCustomSchema('RegisterNewUserService', {
    types: [
        {
            access: true,
            type: 'input RegisterNewUserInput { dv: Int!, sender: SenderFieldInput!, confirmPhoneActionId: String!, name: String!, password: String!}',
        },
    ],
    mutations: [
        {
            access: true,
            schema: 'registerNewUser(data: RegisterNewUserInput!): User',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, confirmPhoneActionId, name, password } } = args

                const currentTime = dayjs().toISOString()
                const confirmAction = await ConfirmPhoneAction.getOne(context, {
                    deletedAt: null,
                    id: confirmPhoneActionId,
                    isVerified: true,
                    expiresAt_gte: currentTime,
                })

                if (!confirmAction) {
                    throw new GQLError(ERRORS.ACTION_NOT_FOUND, context)
                }


                const createdUser = await User.create(context, {
                    name,
                    dv,
                    sender,
                    phone: confirmAction.phone,
                    password,
                }, {
                    errorMapping: {
                        'duplicate key value violates unique constraint "user_unique_phone"': ERRORS.USER_ALREADY_EXISTS,
                    },
                })

                return await getById('User', createdUser.id)
            },
        },
    ],
    
})

module.exports = {
    RegisterNewUserService,
}
