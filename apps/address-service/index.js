const { Keystone } = require('@keystonejs/keystone')
const { PasswordAuthStrategy } = require('@keystonejs/auth-password')
const { GraphQLApp } = require('@keystonejs/app-graphql')
const { AdminUIApp } = require('@keystonejs/app-admin-ui')
const { NextApp } = require('@keystonejs/app-next')
const { createItems } = require('@keystonejs/server-side-graphql-client')

const conf = require('@condo/config')
const access = require('@condo/keystone/access')
const { EmptyApp } = require('@condo/keystone/test.utils')
const { prepareDefaultKeystoneConfig } = require('@condo/keystone/setup.utils')
const { registerSchemas } = require('@condo/keystone/KSv5v6/v5/registerSchema')
const { SuggestionKeystoneApp } = require('@address-service/domains/common/utils/services/suggest/SuggestionKeystoneApp')

const keystone = new Keystone({
    ...prepareDefaultKeystoneConfig(conf),
})

registerSchemas(keystone, [
    require('@address-service/domains/User/schema'),
])

const authStrategy = keystone.createAuthStrategy({
    type: PasswordAuthStrategy,
    list: 'User',
})

module.exports = {
    keystone,
    apps: [
        new GraphQLApp({ apollo: { debug: conf.NODE_ENV === 'development' || conf.NODE_ENV === 'test' } }),
        new AdminUIApp({
            adminPath: '/admin',
            isAccessAllowed: access.userIsAdmin,
            authStrategy,
        }),
        new SuggestionKeystoneApp(),
        // conf.NODE_ENV === 'test' ? new EmptyApp() : new NextApp({ dir: '.' }),
    ],
}
