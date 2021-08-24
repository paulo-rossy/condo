// @ts-nocheck
/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; account?:Relationship:BillingAccount:SET_NULL; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

const { throwAuthenticationError } = require("@condo/domains/common/utils/apolloErrorFormatter")

async function canReadMeters ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    return {
        // TODO(codegen): write canReadMeters logic!
    }
}

async function canManageMeters ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        // TODO(codegen): write canManageMeters create logic!
        return true
    } else if (operation === 'update') {
        // TODO(codegen): write canManageMeters update logic!
        return true
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMeters,
    canManageMeters,
}
