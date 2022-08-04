// @ts-nocheck
/**
 * Generated by `createschema acquiring.Recipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; bankAccount:Text; bankName?:Text; offsettingAccount?:Text; territoryCode?:Text; purpose?Text; name?:Text; isApproved:Checkbox; meta?:Json;'`
 */

const { get } = require('lodash')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canReadRecipients ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    return { organization: { employees_some: { user: { id: user.id }, deletedAt: null, isBlocked: false } } }
}

async function canManageRecipients ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    //TODO: Исправить для billingIntegration
    return false
}

async function canManageIsApprovedField ({ authentication: { item: user }, originalInput }) {
    if (user.isAdmin || user.isSupport) return true

    // If user is not support, then he only can drop isApproved field
    if (!get(originalInput, 'isApproved')) {
        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadRecipients,
    canManageRecipients,
    canManageIsApprovedField,
}
