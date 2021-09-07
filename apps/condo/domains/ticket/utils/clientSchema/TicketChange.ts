/**
 * Generated by `createschema ticket.TicketChange 'ticket:Relationship:Ticket:CASCADE;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { TICKET_CHANGE_DATA_FIELDS } from '@condo/domains/ticket/gql'

import { TicketChange as TicketChangeGQL } from '@condo/domains/ticket/gql'
import { TicketChange, TicketChangeUpdateInput, QueryAllTicketChangesArgs } from '../../../../schema'

const FIELDS = ['id', 'createdAt', 'createdBy', 'ticket', ...TICKET_CHANGE_DATA_FIELDS]
const RELATIONS = ['ticket']

export interface ITicketChangeUIState extends TicketChange {
    id: string
    // TODO(codegen): write ITicketChangeUIState or extends it from
}

function convertToUIState(item: TicketChange): ITicketChangeUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketChangeUIState
}

export interface ITicketChangeFormState {
    id?: undefined
    // TODO(codegen): write ITicketChangeUIFormState or extends it from
}

function convertToUIFormState(state: ITicketChangeUIState): ITicketChangeFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as ITicketChangeFormState
}

function convertToGQLInput(state: ITicketChangeFormState): TicketChangeUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? { connect: { id: attrId || state[attr] } } : state[attr]
    }
    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete } = generateReactHooks<
    TicketChange,
    TicketChangeUpdateInput,
    ITicketChangeFormState,
    ITicketChangeUIState,
    QueryAllTicketChangesArgs
>(TicketChangeGQL, { convertToGQLInput, convertToUIState })

export { useObject, useObjects, useCreate, useUpdate, useDelete, convertToUIFormState }
