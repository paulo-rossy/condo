/**
 * Generated by `createschema billing.BillingProperty 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; bindingId:Text; address:Text; raw:Json; meta:Json'`
 */

import {
    BillingProperty,
    BillingPropertyCreateInput,
    BillingPropertyUpdateInput,
    QueryAllBillingPropertiesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { BillingProperty as BillingPropertyGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingProperty, BillingPropertyCreateInput, BillingPropertyUpdateInput, QueryAllBillingPropertiesArgs>(BillingPropertyGQL)


export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
