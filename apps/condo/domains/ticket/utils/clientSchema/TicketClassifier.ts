/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;parent?:Relationship:TicketClassifier:PROTECT;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketClassifier as TicketClassifierGQL } from '@condo/domains/ticket/gql'
import {
    TicketClassifier,
    TicketClassifierUpdateInput,
    QueryAllTicketClassifiersArgs,
    TicketClassifierWhereInput,
} from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'name', 'parent']
const RELATIONS = ['organization', 'parent']

export interface ITicketClassifierUIState extends TicketClassifier {
    id: string
    // TODO(codegen): write ITicketClassifierUIState or extends it from
}

export type TicketClassifierSelectWhereInput = Pick<
    TicketClassifierWhereInput,
    'parent' | 'parent_is_null' | 'id' | 'name_contains'
>

function convertToUIState(item: TicketClassifier): ITicketClassifierUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketClassifierUIState
}

export interface ITicketClassifierFormState {
    id?: undefined
    // TODO(codegen): write ITicketClassifierUIFormState or extends it from
}

function convertToUIFormState(state: ITicketClassifierUIState): ITicketClassifierFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as ITicketClassifierFormState
}

function convertToGQLInput(state: ITicketClassifierFormState): TicketClassifierUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? { connect: { id: attrId || state[attr] } } : state[attr]
    }
    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete } = generateReactHooks<
    TicketClassifier,
    TicketClassifierUpdateInput,
    ITicketClassifierFormState,
    ITicketClassifierUIState,
    QueryAllTicketClassifiersArgs
>(TicketClassifierGQL, { convertToGQLInput, convertToUIState })

export { useObject, useObjects, useCreate, useUpdate, useDelete, convertToUIFormState }
