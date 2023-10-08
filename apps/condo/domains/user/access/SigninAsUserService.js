/**
 * Generated by `createservice user.SigninAsUserService`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canSigninAsUser ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return !!(user.isSupport || user.isAdmin)
}

module.exports = {
    canSigninAsUser,
}
