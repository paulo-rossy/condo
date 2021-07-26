/**
 * Generated by `createschema ticket.TicketChange 'ticket:Relationship:Ticket:CASCADE;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadTicketChanges ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    return {
        ticket: { organization: { employees_some: { user: { id: user.id }, isBlocked: false } } },
    }
}

async function canManageTicketChanges ({ authentication: { item: user }, originalInput, operation, itemId }) {
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketChanges,
    canManageTicketChanges,
}
