/**
 * Generated by `createschema onboarding.UserHelpRequest 'type:Select:callback;importFile;user:Relationship:User:CASCADE;organization:Relationship:Organization:CASCADE;phone:Text;file?:File;meta?:Json'`
 */

import {
    UserHelpRequest,
    UserHelpRequestCreateInput,
    UserHelpRequestUpdateInput,
    QueryAllUserHelpRequestsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { UserHelpRequest as UserHelpRequestGQL } from '@condo/domains/onboarding/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<UserHelpRequest, UserHelpRequestCreateInput, UserHelpRequestUpdateInput, QueryAllUserHelpRequestsArgs>(UserHelpRequestGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
