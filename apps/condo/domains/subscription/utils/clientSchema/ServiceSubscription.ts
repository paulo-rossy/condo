/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 */

import {
    ServiceSubscription,
    ServiceSubscriptionCreateInput,
    ServiceSubscriptionUpdateInput,
    QueryAllServiceSubscriptionsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { ServiceSubscription as ServiceSubscriptionGQL } from '@condo/domains/subscription/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<ServiceSubscription, ServiceSubscriptionCreateInput, ServiceSubscriptionUpdateInput, QueryAllServiceSubscriptionsArgs>(ServiceSubscriptionGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
