/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;parent?:Relationship:TicketClassifier:PROTECT;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadTicketClassifiers({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    return {}
}

async function canManageTicketClassifiers({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        return user.isSupport
    } else if (operation === 'update') {
        return user.isSupport
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketClassifiers,
    canManageTicketClassifiers,
}
