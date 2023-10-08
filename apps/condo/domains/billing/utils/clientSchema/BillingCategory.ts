/**
 * Generated by `createschema billing.BillingCategory 'name:Text'`
 */
import {
    BillingCategory,
    BillingCategoryCreateInput,
    BillingCategoryUpdateInput,
    QueryAllBillingCategoriesArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { BillingCategory as BillingCategoryGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingCategory, BillingCategoryCreateInput, BillingCategoryUpdateInput, QueryAllBillingCategoriesArgs>(BillingCategoryGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
