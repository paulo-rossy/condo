/**
 * Generated by `createservice resident.DiscoverServiceConsumersService --type mutations`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canDiscoverServiceConsumers ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canDiscoverServiceConsumers,
}