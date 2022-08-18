/**
 * Generated by `createschema billing.BillingAccountMeter 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; resource:Relationship:BillingMeterResource:PROTECT; raw:Json; meta:Json'`
 */
import {
    BillingAccountMeter,
    BillingAccountMeterCreateInput,
    BillingAccountMeterUpdateInput,
    QueryAllBillingAccountMetersArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { BillingAccountMeter as BillingAccountMeterGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingAccountMeter, BillingAccountMeterCreateInput, BillingAccountMeterUpdateInput, QueryAllBillingAccountMetersArgs>(BillingAccountMeterGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
