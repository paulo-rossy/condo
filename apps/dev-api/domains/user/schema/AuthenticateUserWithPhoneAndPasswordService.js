/**
 * Generated by `createservice user.AuthenticateUserWithPhoneAndPasswordService`
 */
const { GQLError, GQLErrorCode: { BAD_USER_INPUT, TOO_MANY_REQUESTS } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, getByCondition, getSchemaCtx } = require('@open-condo/keystone/schema')

const { AUTH_WITH_PHONE_DAILY_LIMIT_BY_IP } = require('@dev-api/domains/user/constants')
const { INCORRECT_PHONE_OR_PASSWORD, AUTH_ATTEMPTS_DAILY_LIMIT_REACHED } = require('@dev-api/domains/user/constants/errors')
const { RedisGuard } = require('@dev-api/domains/user/utils/guards')

const ERRORS =  {
    INCORRECT_PHONE_OR_PASSWORD: {
        code: BAD_USER_INPUT,
        type: INCORRECT_PHONE_OR_PASSWORD,
        message: 'Incorrect phone number or password',
    },
    AUTH_ATTEMPTS_DAILY_LIMIT_REACHED: {
        code: TOO_MANY_REQUESTS,
        type: AUTH_ATTEMPTS_DAILY_LIMIT_REACHED,
        message: 'Too many authorization attempts have been made from this IP address. Please try again later',
    },
}

const redisGuard = new RedisGuard()

function getDailyIPKey (ip) {
    return `authenticate_user_with_phone:ip:${ip}`
}

async function checkDailyFailedAuthAttempts (context) {
    const rawIP = context.req.ip
    const ip = rawIP.split(':').pop()

    const byIpCounter = await redisGuard.getDayCounter(getDailyIPKey(ip))
    if (byIpCounter >= AUTH_WITH_PHONE_DAILY_LIMIT_BY_IP) {
        throw new GQLError(ERRORS.AUTH_ATTEMPTS_DAILY_LIMIT_REACHED, context)
    }
}

async function incrementFailedAuthsByIP (context) {
    const rawIP = context.req.ip
    const ip = rawIP.split(':').pop()

    await redisGuard.incrementDayCounter(getDailyIPKey(ip))
}

const AuthenticateUserWithPhoneAndPasswordService = new GQLCustomSchema('AuthenticateUserWithPhoneAndPasswordService', {
    types: [
        {
            access: true,
            type: 'input AuthenticateUserWithPhoneAndPasswordInput { phone: String!, password: String! }',
        },
        {
            access: true,
            type: 'type AuthenticateUserWithPhoneAndPasswordOutput { token: String!, item: User! }',
        },
    ],
    mutations: [
        {
            access: true,
            schema: 'authenticateUserWithPhoneAndPassword(data: AuthenticateUserWithPhoneAndPasswordInput!): AuthenticateUserWithPhoneAndPasswordOutput',
            resolver: async (parent, args, context) => {
                const { data: { phone, password } } = args

                await checkDailyFailedAuthAttempts(context)

                const user = await getByCondition('User', {
                    deletedAt: null,
                    phone,
                })

                // NOTE: There's 2 places to throw error, if no user or if password not match,
                // but we want to combine this error into single one for preventing reverse engineering :)
                if (user) {
                    const { keystone } = getSchemaCtx('User')
                    const { auth: { User: { password: PasswordStrategy } } } = keystone
                    const list = PasswordStrategy.getList()

                    const { success } = await PasswordStrategy._matchItem(user, { password }, list.fieldsByPath['password'] )

                    if (success) {
                        const token = await context.startAuthedSession({ item: user, list: keystone.lists['User'] })

                        return {
                            token,
                            item: user,
                        }
                    }
                }

                await incrementFailedAuthsByIP(context)
                throw new GQLError(ERRORS.INCORRECT_PHONE_OR_PASSWORD, context)
            },
        },
    ],
    
})

module.exports = {
    ERRORS,
    AuthenticateUserWithPhoneAndPasswordService,
}
