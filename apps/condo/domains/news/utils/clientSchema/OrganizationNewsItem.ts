/**
 * Generated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 */

import {
    OrganizationNewsItem,
    OrganizationNewsItemCreateInput,
    OrganizationNewsItemUpdateInput,
    QueryAllOrganizationNewsItemsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { OrganizationNewsItem as OrganizationNewsItemGQL } from '@condo/domains/news/gql'

// TODO(codegen): write utils like convertToFormState and formValuesProcessor if needed, otherwise delete this TODO

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<OrganizationNewsItem, OrganizationNewsItemCreateInput, OrganizationNewsItemUpdateInput, QueryAllOrganizationNewsItemsArgs>(OrganizationNewsItemGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
