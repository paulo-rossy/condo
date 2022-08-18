/**
 * Generated by `createschema notification.MessageUserBlackList 'user?:Relationship:User:CASCADE; phone?:Text; email?:Text; description:Text'`
 */

import {
    MessageUserBlackList,
    MessageUserBlackListCreateInput,
    MessageUserBlackListUpdateInput,
    QueryAllMessageUserBlackListsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { MessageUserBlackList as MessageUserBlackListGQL } from '@condo/domains/notification/gql'

// TODO(codegen): write utils like convertToFormState and formValuesProcessor if needed, otherwise delete this TODO

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<MessageUserBlackList, MessageUserBlackListCreateInput, MessageUserBlackListUpdateInput, QueryAllMessageUserBlackListsArgs>(MessageUserBlackListGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
