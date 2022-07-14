/**
 * Generated by `createschema acquiring.Recipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; bankAccount:Text; bankName?:Text; offsettingAccount?:Text; territoryCode?:Text; purpose?Text; name?:Text; isApproved:Checkbox; meta?:Json;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Recipient as RecipientGQL } from '@condo/domains/acquiring/gql'
import { Recipient, RecipientUpdateInput, QueryAllRecipientsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'tin', 'iec', 'bic', 'bankAccount', 'bankName', 'offsettingAccount', 'territoryCode', 'name', 'isApproved', 'meta']
const RELATIONS = ['organization']

export interface IRecipientUIState extends Recipient {
    id: string
    // TODO(codegen): write IRecipientUIState or extends it from
}

function convertToUIState (item: Recipient): IRecipientUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IRecipientUIState
}

export interface IRecipientFormState {
    id?: undefined
    // TODO(codegen): write IRecipientUIFormState or extends it from
}

function convertToUIFormState (state: IRecipientUIState): IRecipientFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IRecipientFormState
}

function convertToGQLInput (state: IRecipientFormState): RecipientUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<Recipient, RecipientUpdateInput, IRecipientFormState, IRecipientUIState, QueryAllRecipientsArgs>(RecipientGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
