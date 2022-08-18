/**
 * Generated by `createschema acquiring.AcquiringIntegrationAccessRight 'user:Relationship:User:PROTECT;'`
 */

import {
    AcquiringIntegrationAccessRight,
    AcquiringIntegrationAccessRightCreateInput,
    AcquiringIntegrationAccessRightUpdateInput,
    QueryAllAcquiringIntegrationAccessRightsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { AcquiringIntegrationAccessRight as AcquiringIntegrationAccessRightGQL } from '@condo/domains/acquiring/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<AcquiringIntegrationAccessRight, AcquiringIntegrationAccessRightCreateInput, AcquiringIntegrationAccessRightUpdateInput, QueryAllAcquiringIntegrationAccessRightsArgs>(AcquiringIntegrationAccessRightGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
