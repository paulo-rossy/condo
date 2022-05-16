/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Contact as ContactGQL } from '@condo/domains/contact/gql'
import { Contact, ContactUpdateInput, QueryAllContactsArgs, BuildingUnitSubType } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'property', 'name', 'phone', 'unitName', 'unitType', 'email', 'organization']
const RELATIONS = ['organization', 'property']

export interface IContactUIState extends Contact {
    id: string
    unitName?: string
    unitType?: BuildingUnitSubType
    email?: string
    phone: string
    name: string
}

function convertToUIState (item: Contact): IContactUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IContactUIState
}

export interface IContactFormState {
    id?: undefined,
    organization: string,
    property?: string,
    unitName?: string,
    unitType?: BuildingUnitSubType,
    phone: string,
    name: string,
    email?: string
}

function convertToUIFormState (state: IContactUIState): IContactFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IContactFormState
}

function convertToGQLInput (state: IContactFormState): ContactUpdateInput {
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
    useSoftDelete,
} = generateReactHooks<Contact, ContactUpdateInput, IContactFormState, IContactUIState, QueryAllContactsArgs>(ContactGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
}
