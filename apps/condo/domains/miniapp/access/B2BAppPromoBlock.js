/**
 * Generated by `createschema miniapp.B2BAppPromoBlock 'title:Text; subtitle:Text; backgroundColor:Text; backgroundImage:File'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { canDirectlyManageSchemaObjects } = require('@condo/domains/user/utils/directAccess')

/**
 * B2BPromoBlocks are publicly available for any authed non-deleted user including:
 * 1. Admin / support
 * 2. Users with direct access
 * 3. Any employees of any organization
 */
async function canReadB2BAppPromoBlocks ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return {}
}

/**
 * B2BPromoBlocks can be managed by
 * 1. Admin / support
 * 2. Users with direct access
 */
async function canManageB2BAppPromoBlocks ({ authentication: { item: user }, listKey, originalInput, operation }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    return await canDirectlyManageSchemaObjects(user, listKey, originalInput, operation)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadB2BAppPromoBlocks,
    canManageB2BAppPromoBlocks,
}
