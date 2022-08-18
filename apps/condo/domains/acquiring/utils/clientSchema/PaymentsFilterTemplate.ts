/**
 * Generated by `createschema acquiring.PaymentsFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE'`
 */

import {
    PaymentsFilterTemplate,
    PaymentsFilterTemplateCreateInput,
    PaymentsFilterTemplateUpdateInput,
    QueryAllPaymentsFilterTemplatesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/keystone/codegeneration/generate.hooks'
import { PaymentsFilterTemplate as PaymentsFilterTemplateGQL } from '@condo/domains/acquiring/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<PaymentsFilterTemplate, PaymentsFilterTemplateCreateInput, PaymentsFilterTemplateUpdateInput, QueryAllPaymentsFilterTemplatesArgs>(PaymentsFilterTemplateGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
