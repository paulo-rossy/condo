/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; organization:Relationship:Organization:CASCADE; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

import {
    Meter,
    MeterCreateInput,
    MeterUpdateInput,
    QueryAllMetersArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { Meter as MeterGQL } from '@condo/domains/meter/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<Meter, MeterCreateInput, MeterUpdateInput, QueryAllMetersArgs>(MeterGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
