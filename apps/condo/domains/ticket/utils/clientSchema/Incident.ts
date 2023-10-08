/**
 * Generated by `createschema ticket.Incident 'organization; number; details:Text; status; textForResident:Text; workStart:DateTimeUtc; workFinish:DateTimeUtc; isScheduled:Checkbox; isEmergency:Checkbox; hasAllProperties:Checkbox;'`
 */

import {
    Incident,
    IncidentCreateInput,
    IncidentUpdateInput,
    QueryAllIncidentsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { Incident as IncidentGQL } from '@condo/domains/ticket/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<Incident, IncidentCreateInput, IncidentUpdateInput, QueryAllIncidentsArgs>(IncidentGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
}
