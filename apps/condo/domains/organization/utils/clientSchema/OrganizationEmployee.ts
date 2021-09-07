/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { OrganizationEmployee as OrganizationEmployeeGQL } from '@condo/domains/organization/gql'
import { OrganizationEmployee, OrganizationEmployeeUpdateInput, QueryAllOrganizationEmployeesArgs } from '../../../../schema'

const FIELDS = [
    'id',
    'deletedAt',
    'createdAt',
    'updatedAt',
    'createdBy',
    'isBlocked',
    'updatedBy',
    'organization',
    'user',
    'inviteCode',
    'name',
    'email',
    'phone',
    'role',
    'position',
    'isAccepted',
    'isRejected',
]
const RELATIONS = ['organization', 'user', 'role']

export interface IOrganizationEmployeeUIState extends OrganizationEmployee {
    id: string
    // TODO(codegen): write IOrganizationEmployeeUIState or extends it from
}

function convertToUIState(item: OrganizationEmployee): IOrganizationEmployeeUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IOrganizationEmployeeUIState
}

export interface IOrganizationEmployeeFormState {
    id?: undefined
    isBlocked?: boolean
    // TODO(codegen): write IOrganizationEmployeeUIFormState or extends it from
}

function convertToUIFormState(state: IOrganizationEmployeeUIState): IOrganizationEmployeeFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = RELATIONS.includes(attr) && state[attr] ? attrId || state[attr] : state[attr]
    }
    return result as IOrganizationEmployeeFormState
}

function convertGQLItemToFormSelectState(item: OrganizationEmployee): { value: string; label: string } | undefined {
    const userOrganization = get(item, 'organization')
    if (!userOrganization) {
        return
    }

    const { name } = userOrganization

    return { value: item.id, label: name }
}

function convertToGQLInput(state: IOrganizationEmployeeFormState): OrganizationEmployeeUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }

    // TODO(Dimitreee): refactor client utils to add disconectFeature, think about solution
    for (const fieldName of Object.keys(state)) {
        if (Object(state).hasOwnProperty(fieldName) && RELATIONS.includes(fieldName)) {
            const fieldValue = get(state, fieldName)
            const id = get(fieldValue, 'id')

            if (id) {
                result[fieldName] = {
                    connect: {
                        id,
                    },
                }
            } else if (fieldValue) {
                result[fieldName] = {
                    connect: {
                        id: state[fieldName],
                    },
                }
            } else if (fieldValue === null) {
                result[fieldName] = {
                    disconnectAll: true,
                }
            }
        } else {
            result[fieldName] = state[fieldName]
        }
    }

    return result
}

const { useObject, useObjects, useCreate, useUpdate, useDelete, useSoftDelete } = generateReactHooks<
    OrganizationEmployee,
    OrganizationEmployeeUpdateInput,
    IOrganizationEmployeeFormState,
    IOrganizationEmployeeUIState,
    QueryAllOrganizationEmployeesArgs
>(OrganizationEmployeeGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertGQLItemToFormSelectState,
    convertToGQLInput,
    convertToUIFormState,
}
