/**
 * Generated by `createschema miniapp.B2BApp 'name:Text;'`
 */

import {
    B2BApp,
    B2BAppCreateInput,
    B2BAppUpdateInput,
    QueryAllB2BAppsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { B2BApp as B2BAppGQL } from '@condo/domains/miniapp/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<B2BApp, B2BAppCreateInput, B2BAppUpdateInput, QueryAllB2BAppsArgs>(B2BAppGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
