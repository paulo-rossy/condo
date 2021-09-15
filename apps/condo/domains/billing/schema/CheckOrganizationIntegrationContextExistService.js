/**
 * Generated by `createservice billing.CheckOrganizationIntegrationContextExistService --type queries`
 */

import { BillingIntegrationOrganizationContext } from '../utils/serverSchema'

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/billing/access/CheckOrganizationIntegrationContextExistService')


const NO_ORGANIZATION_MESSAGE = 'No organizationId specified!'


const CheckOrganizationIntegrationContextExistService = new GQLCustomSchema('CheckOrganizationIntegrationContextExistService', {
    types: [
        {
            access: true,
            type: 'input CheckOrganizationIntegrationContextExistInput { organizationId: ID! }',
        },
        {
            access: true,
            type: 'type CheckOrganizationIntegrationContextExistOutput { isFound: Boolean! }',
        },
    ],
    
    queries: [
        {
            access: access.canCheckOrganizationIntegrationContextExist,
            schema: 'executeCheckOrganizationIntegrationContextExist (data: CheckOrganizationIntegrationContextExistInput!): CheckOrganizationIntegrationContextExistOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: inputData } = args
                const { organizationId } = inputData

                if (!organizationId) throw new Error(NO_ORGANIZATION_MESSAGE)

                const count = await BillingIntegrationOrganizationContext.count(context, {
                    organization: { id: organizationId },
                })
                return {
                    isFound: count > 0,
                }
            },
        },
    ],
    
})

module.exports = {
    CheckOrganizationIntegrationContextExistService,
}
