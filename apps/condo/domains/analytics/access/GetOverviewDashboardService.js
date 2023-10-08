/**
 * Generated by `createservice analytics.OverviewDashboardService`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { checkUserBelongsToOrganization, checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')

async function canGetOverviewDashboard ({ authentication: { item: user }, args: { data: { where: { organization } } } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}

    const userBelongsToOrganization = checkUserBelongsToOrganization(user.id, organization)
    if (!userBelongsToOrganization) return false

    const canReadAnalytics = await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organization, 'canReadAnalytics')

    return !!canReadAnalytics
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canGetOverviewDashboard,
}
