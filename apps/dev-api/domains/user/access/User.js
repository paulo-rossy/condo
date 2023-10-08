/**
 * Generated by `createschema user.User 'name:Text;password:Text;phone:Text;email:Text'`
 */

const access = require('@open-condo/keystone/access')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadUsers ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()

    return !user.deletedAt
}

async function canManageUsers ({ authentication: { item: user }, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    if (operation === 'create') return false
    if (operation === 'update') return itemId === user.id

    return false
}

const canAccessToPasswordField = {
    read: access.userIsThisItem,
    // NOTE: const false removing it UserCreateInput, so it's impossible to create user from bin/prepare
    create: () => false,
    update: access.userIsThisItem,
}

const canAccessToAccessControlField = {
    read: true,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessToPhoneField = {
    read: (auth) => access.userIsAdminOrIsSupport(auth) || access.userIsThisItem(auth),
    // NOTE: const false removing it UserCreateInput, so it's impossible to create user from bin/prepare
    create: () => false,
    update: false,
}



/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadUsers,
    canManageUsers,
    canAccessToPhoneField,
    canAccessToPasswordField,
    canAccessToAccessControlField,
}
