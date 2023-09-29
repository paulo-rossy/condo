/**
 * Generated by `createschema ticket.TicketPropertyHint 'organization:Relationship:Organization:CASCADE; name?:Text; properties:Relationship:Property:SET_NULL; content:Text;'`
 */

import {
    TicketPropertyHint,
    TicketPropertyHintCreateInput,
    TicketPropertyHintUpdateInput,
    QueryAllTicketPropertyHintsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { TicketPropertyHint as TicketPropertyHintGQL } from '@condo/domains/ticket/gql'

const {
    useCount,
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketPropertyHint, TicketPropertyHintCreateInput, TicketPropertyHintUpdateInput, QueryAllTicketPropertyHintsArgs>(TicketPropertyHintGQL)



export {
    useCount,
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
