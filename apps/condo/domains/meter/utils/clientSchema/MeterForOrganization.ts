/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; organization:Relationship:Organization:CASCADE; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

import {
    Meter,
    MeterCreateInput,
    MeterUpdateInput,
    QueryAllMetersArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { MeterForOrganization as MeterForOrganizationGQL } from '@condo/domains/meter/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<Meter, MeterCreateInput, MeterUpdateInput, QueryAllMetersArgs>(MeterForOrganizationGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
}
