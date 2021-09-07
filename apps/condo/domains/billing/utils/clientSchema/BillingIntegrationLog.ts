/**
 * Generated by `createschema billing.BillingIntegrationLog 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; type:Text; message:Text; meta:Json'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { BillingIntegrationLog as BillingIntegrationLogGQL } from '@condo/domains/billing/gql'
import { BillingIntegrationLog, BillingIntegrationLogUpdateInput, QueryAllBillingIntegrationLogsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'context', 'type', 'message', 'meta']
const RELATIONS = ['context']

export interface IBillingIntegrationLogUIState extends BillingIntegrationLog {
    id: string
    // TODO(codegen): write IBillingIntegrationLogUIState or extends it from
}

function convertToUIState(item: BillingIntegrationLog): IBillingIntegrationLogUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IBillingIntegrationLogUIState
}

export interface IBillingIntegrationLogFormState {
    id?: undefined
    // TODO(codegen): write IBillingIntegrationLogUIFormState or extends it from
}

function convertToUIFormState(state: IBillingIntegrationLogUIState): IBillingIntegrationLogFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as IBillingIntegrationLogFormState
}

function convertToGQLInput(state: IBillingIntegrationLogFormState): BillingIntegrationLogUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? { connect: { id: attrId || state[attr] } } : state[attr]
    }
    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete } = generateReactHooks<
    BillingIntegrationLog,
    BillingIntegrationLogUpdateInput,
    IBillingIntegrationLogFormState,
    IBillingIntegrationLogUIState,
    QueryAllBillingIntegrationLogsArgs
>(BillingIntegrationLogGQL, { convertToGQLInput, convertToUIState })

export { useObject, useObjects, useCreate, useUpdate, useDelete, convertToUIFormState }
