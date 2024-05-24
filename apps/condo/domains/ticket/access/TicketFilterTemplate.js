/**
 * Generated by `createschema ticket.TicketFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE; filters:Json'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getByCondition, getById } = require('@open-condo/keystone/schema')

const { getEmployedOrganizationsByPermissions } = require('@condo/domains/organization/utils/accessSchema')

async function canReadTicketFilterTemplates ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return {}

    const permittedOrganizations = await getEmployedOrganizationsByPermissions(context, user, 'canReadTickets')

    return {
        employee: { organization: { id_in: permittedOrganizations }, user: { id: user.id }, deletedAt: null },
        createdBy: { id: user.id },
    }
}

async function canManageTicketFilterTemplates ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create') {
        const employeeForUser = await getByCondition('OrganizationEmployee', {
            id: originalInput.employee.connect.id,
            user: { id: user.id },
            role: { canReadTickets: true },
            deletedAt: null,
            isBlocked: false,
        })

        if (!employeeForUser) {
            return false
        }

        return true
    } else if (operation === 'update') {
        if (!itemId) return false
        const templateToEdit = await getById('TicketFilterTemplate', itemId)

        const employeeForUser = await getByCondition('OrganizationEmployee', {
            id: templateToEdit.employee,
            user: { id: user.id },
            role: { canReadTickets: true },
            deletedAt: null,
            isBlocked: false,
        })

        if (!employeeForUser) {
            return false
        }

        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketFilterTemplates,
    canManageTicketFilterTemplates,
}
