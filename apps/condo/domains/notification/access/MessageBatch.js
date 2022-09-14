/**
 * Generated by `createschema notification.MessageBatch 'messageType:Text; title:Text; message:Text; deepLink?:Text; targets:Json; status:Select:created,processing,failed,done; processingMeta?:Json;'`
 */

const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')

async function canReadMessageBatches ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    return false
}

async function canManageMessageBatches ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMessageBatches,
    canManageMessageBatches,
}
