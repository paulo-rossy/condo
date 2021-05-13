/**
 * This file is autogenerated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

import { useMemo } from 'react'

import { useMutation } from '@core/next/apollo'

import { REGISTER_NEW_ORGANIZATION_MUTATION, INVITE_NEW_ORGANIZATION_EMPLOYEE_MUTATION } from '@condo/domains/organization/gql'
import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'

function convertGQLItemToUIState (item) {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return { ...item, dv: undefined }
}

function convertUIStateToGQLItem (state, obj = null) {
    const sender = getClientSideSenderInfo()
    return { dv: 1, sender, ...state }
}

function useRegisterNewOrganization (attrs = {}, onComplete) {
    if (typeof attrs !== 'object' || !attrs) throw new Error('useCreate(): invalid attrs argument')
    const [rowAction] = useMutation(REGISTER_NEW_ORGANIZATION_MUTATION)

    async function _action (state) {
        const { data, error } = await rowAction({
            variables: { data: convertUIStateToGQLItem({ ...state, ...attrs }) },
        })
        if (data && data.obj) {
            const result = convertGQLItemToUIState(data.obj)
            if (onComplete) onComplete(result)
            return result
        }
        if (error) {
            console.warn(error)
            throw error
        }
        throw new Error('unknown action result')
    }

    return useMemo(() => _action, [rowAction])
}

function useInviteNewOrganizationEmployee (attrs = {}, onComplete) {
    if (typeof attrs !== 'object' || !attrs) throw new Error('useCreate(): invalid attrs argument')
    const [rowAction] = useMutation(INVITE_NEW_ORGANIZATION_EMPLOYEE_MUTATION)

    async function _action (state) {
        const { data, error } = await rowAction({
            variables: { data: convertUIStateToGQLItem({ ...state, ...attrs }) },
        })
        if (data && data.obj) {
            const result = convertGQLItemToUIState(data.obj)
            if (onComplete) onComplete(result)
            return result
        }
        if (error) {
            console.warn(error)
            throw error
        }
        throw new Error('unknown action result')
    }

    return useMemo(() => _action, [rowAction])
}

module.exports = {
    convertGQLItemToUIState, convertUIStateToGQLItem,
    useRegisterNewOrganization,
    useInviteNewOrganizationEmployee,
}
export * as Organization from './Organization'
export * as OrganizationEmployee from './OrganizationEmployee'
export * as OrganizationEmployeeRole from './OrganizationEmployeeRole'
/* AUTOGENERATE MARKER <IMPORT-EXPORT> */
