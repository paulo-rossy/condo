/**
 * Generated by `createservice miniapp.AllOrganizationAppsService --type queries`
 */

const dayjs = require('dayjs')

const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const { find } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/miniapp/access/AllMiniAppsService')
const {
    APP_TYPES,
    B2B_APP_TYPE,
    ALL_APPS_CATEGORIES,
    CONTEXT_FINISHED_STATUS,
} = require('@condo/domains/miniapp/constants')
const { APPS_FILE_ADAPTER } = require('@condo/domains/miniapp/schema/fields/integration')

const priorityCompare = (lhs, rhs) => {
    const diff = rhs.displayPriority - lhs.displayPriority
    if (diff !== 0) {
        return diff
    } else {
        const lhsCreatedAt = dayjs(lhs.createdAt)
        const rhsCreatedAt = dayjs(rhs.createdAt)
        if (lhsCreatedAt.isAfter(rhsCreatedAt)) {
            return -1
        } else if (lhsCreatedAt.isBefore(rhsCreatedAt)) {
            return 1
        } else {
            return 0
        }
    }
}

const AllMiniAppsService = new GQLCustomSchema('AllMiniAppsService', {
    types: [
        {
            access: true,
            type: `enum AppType { ${APP_TYPES.join(' ')} }`,
        },
        {
            access: true,
            type: `enum AppCategory { ${ALL_APPS_CATEGORIES.join(' ')} }`,
        },
        {
            access: true,
            type: 'input AllMiniAppsWhereInput { connected: Boolean, id_not: String, category: String }',
        },
        {
            access: true,
            type: 'input AllMiniAppsInput { dv: Int!, sender: SenderFieldInput!, organization: OrganizationWhereUniqueInput!, search: String, where: AllMiniAppsWhereInput }',
        },
        {
            access: true,
            type: 'type MiniAppOutput { id: ID!, type: AppType!, connected: Boolean!, name: String!, shortDescription: String!, category: AppCategory!, logo: String, label: String }',
        },
    ],
    
    queries: [
        {
            access: access.canExecuteAllMiniApps,
            schema: 'allMiniApps (data: AllMiniAppsInput!): [MiniAppOutput!]',
            resolver: async (parent, args) => {
                const { data: { organization, search, where: { connected, category, ...restWhere } = {} } } = args
                let services = []

                const searchFilters = search ? {
                    name_contains_i: search,
                } : {}

                const B2BApps = await find('B2BApp', {
                    isHidden: false,
                    isGlobal: false,
                    deletedAt: null,
                    ...searchFilters,
                    ...restWhere,
                })
                const B2BAppContexts = await find('B2BAppContext', {
                    organization,
                    deletedAt: null,
                    status: CONTEXT_FINISHED_STATUS,
                })
                const connectedB2BApps = B2BAppContexts.map(context => context.app)
                for (const app of B2BApps) {
                    const logoUrl = app.logo ? APPS_FILE_ADAPTER.publicUrl({ filename: app.logo.filename }) : null
                    services.push({
                        id: app.id,
                        type: B2B_APP_TYPE,
                        name: app.name,
                        shortDescription: app.shortDescription,
                        connected: connectedB2BApps.includes(app.id),
                        category: app.category,
                        logo: logoUrl,
                        label: app.label,
                        // NOTE: Extra props for sort that will be omitted
                        displayPriority: app.displayPriority,
                        createdAt: app.createdAt,
                    })
                }
                if (connected !== undefined) {
                    services = services.filter(service => service.connected === connected)
                }
                if (category !== undefined) {
                    services = services.filter(service => service.category === category)
                }
                services.sort(priorityCompare)
                return services
            },
        },
    ],
    
})

module.exports = {
    AllMiniAppsService,
}
