/**
 * Generated by `createservice notification._internalSendHashedResidentPhonesService '--type=mutations'`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { canDirectlyExecuteService } = require('@condo/domains/user/utils/directAccess')


async function can_internalSendHashedResidentPhones ({ authentication: { item: user }, gqlName }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return await canDirectlyExecuteService(user, gqlName)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    can_internalSendHashedResidentPhones,
}