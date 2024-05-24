/**
 * Generated by `createservice resident.GetResidentExistenceByPhoneAndAddressService --type queries`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const { checkUserEmploymentOrRelationToOrganization } = require('@condo/domains/organization/utils/accessSchema')


async function canGetResidentExistenceByPhoneAndAddress ({ authentication: { item: user }, context, args }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const { data: { propertyId } } = args
    const property = await getById('Property', propertyId)
    const propertyOrganization = property.organization

    if (!propertyOrganization) return false

    return await checkUserEmploymentOrRelationToOrganization(context, user, propertyOrganization)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canGetResidentExistenceByPhoneAndAddress,
}
