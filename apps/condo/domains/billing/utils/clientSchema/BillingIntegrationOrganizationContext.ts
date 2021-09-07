/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { BillingIntegrationOrganizationContext as BillingIntegrationOrganizationContextGQL } from '@condo/domains/billing/gql'
import {
    BillingIntegrationOrganizationContext,
    BillingIntegrationOrganizationContextUpdateInput,
    QueryAllBillingIntegrationOrganizationContextsArgs,
} from '../../../../schema'

const FIELDS = [
    'id',
    'deletedAt',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
    'integration',
    'organization',
    'settings',
    'state',
    'status',
    'lastReport',
]
const RELATIONS = ['integration', 'organization']

export interface IBillingIntegrationOrganizationContextUIState extends BillingIntegrationOrganizationContext {
    id: string
    status: string
}

function convertToUIState(item: BillingIntegrationOrganizationContext): IBillingIntegrationOrganizationContextUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IBillingIntegrationOrganizationContextUIState
}

export interface IBillingIntegrationOrganizationContextFormState {
    id?: undefined
    integration?: string
    organization?: string
    status?: string
}

function convertToUIFormState(
    state: IBillingIntegrationOrganizationContextUIState,
): IBillingIntegrationOrganizationContextFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as IBillingIntegrationOrganizationContextFormState
}

function convertToGQLInput(
    state: IBillingIntegrationOrganizationContextFormState,
): BillingIntegrationOrganizationContextUpdateInput {
    const sender = getClientSideSenderInfo()
    const defaultDv = { dv: 1, sender }
    const result = { ...defaultDv, state: defaultDv, settings: defaultDv }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? { connect: { id: attrId || state[attr] } } : state[attr]
    }
    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete } = generateReactHooks<
    BillingIntegrationOrganizationContext,
    BillingIntegrationOrganizationContextUpdateInput,
    IBillingIntegrationOrganizationContextFormState,
    IBillingIntegrationOrganizationContextUIState,
    QueryAllBillingIntegrationOrganizationContextsArgs
>(BillingIntegrationOrganizationContextGQL, { convertToGQLInput, convertToUIState })

export { useObject, useObjects, useCreate, useUpdate, useDelete, convertToUIFormState }
