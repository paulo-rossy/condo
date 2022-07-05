/**
 * Generated by `createschema ticket.TicketExportTask 'status:Select:processing,completed,error; format:Select:excel; exportedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; meta?:Json'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketExportTask as TicketExportTaskGQL } from '@condo/domains/ticket/gql'
import { TicketExportTask, TicketExportTaskUpdateInput, QueryAllTicketExportTasksArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'status', 'format', 'exportedRecordsCount', 'totalRecordsCount', 'file', 'meta', '__typename']
const RELATIONS = []

export interface ITicketExportTaskUIState extends TicketExportTask {
    id: string
    // TODO(codegen): write ITicketExportTaskUIState or extends it from
}

function convertToUIState (item: TicketExportTask): ITicketExportTaskUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketExportTaskUIState
}

export interface ITicketExportTaskFormState {
    id?: undefined
    // TODO(codegen): write ITicketExportTaskUIFormState or extends it from
}

function convertToUIFormState (state: ITicketExportTaskUIState): ITicketExportTaskFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as ITicketExportTaskFormState
}

function convertToGQLInput (state: ITicketExportTaskFormState): TicketExportTaskUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    gql,
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
} = generateReactHooks<TicketExportTask, TicketExportTaskUpdateInput, ITicketExportTaskFormState, ITicketExportTaskUIState, QueryAllTicketExportTasksArgs>(TicketExportTaskGQL, { convertToGQLInput, convertToUIState })

export {
    gql,
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
}
