/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

import {
    AcquiringIntegrationContext,
    AcquiringIntegrationContextCreateInput,
    AcquiringIntegrationContextUpdateInput,
    QueryAllAcquiringIntegrationContextsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { AcquiringIntegrationContext as AcquiringIntegrationContextGQL } from '@condo/domains/acquiring/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<AcquiringIntegrationContext, AcquiringIntegrationContextCreateInput, AcquiringIntegrationContextUpdateInput, QueryAllAcquiringIntegrationContextsArgs>(AcquiringIntegrationContextGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
