/**
 * Generated by `createschema miniapp.B2CAppBuild 'app:Relationship:B2CApp:PROTECT; version:Text'`
 */

const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const { checkB2CAppAccessRight } = require('@condo/domains/miniapp/utils/accessSchema')
const { RESIDENT, SERVICE } = require('@condo/domains/user/constants/common')
const { canDirectlyReadSchemaObjects, canDirectlyManageSchemaObjects } = require('@condo/domains/user/utils/directAccess')

/**
 * B2CAppBuild can be read by:
 * 1. Admin / support
 * 2. Users with direct access
 * 3. Residents
 * 4. Service users with AccessRights to specific app
 */
async function canReadB2CAppBuilds ({ authentication: { item: user }, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}
    if (user.type === RESIDENT) return {}
    const hasDirectAccess = await canDirectlyReadSchemaObjects(user, listKey)
    if (hasDirectAccess) return true

    if (user.type === SERVICE) {
        return { app: { accessRights_some: { deletedAt: null, user: { id: user.id } } } }
    }

    return false
}

/**
 * B2CAppBuild can be managed by:
 * 1. Admin / support
 * 2. Users with direct access
 * 4. (TODO(DOMA-7062): remove this part) Service users with AccessRights to specific app
 */
async function canManageB2CAppBuilds ({ authentication: { item: user }, originalInput, operation, itemId, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    const hasDirectAccess = await canDirectlyManageSchemaObjects(user, listKey, originalInput, operation)
    if (hasDirectAccess) return true

    if (operation === 'create') {
        return await checkB2CAppAccessRight(user.id, get(originalInput, ['app', 'connect', 'id']))
    } else if (operation === 'update') {
        if (!itemId) return false
        if (user.type !== SERVICE) return false
        const item = await getById('B2CAppBuild', itemId)
        const appId = get(item, 'app')
        return await checkB2CAppAccessRight(user.id, appId)
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadB2CAppBuilds,
    canManageB2CAppBuilds,
}
