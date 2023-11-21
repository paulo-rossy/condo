/**
 * Generated by `createservice miniapp.GetB2BAppLaunchParametersSignatureService --type queries`
 */
const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { STAFF } = require('@condo/domains/user/constants/common')


async function canGetB2BAppLaunchParametersSignature ({ args: { data: { organization } }, authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.type === STAFF) {
        const organizationId = get(organization, 'id', null)
        return await checkOrganizationPermission(user.id, organizationId)
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canGetB2BAppLaunchParametersSignature,
}