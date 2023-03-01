import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { BankAccountCategoryProgress as BankAccountCategoryProgressGQL } from '@condo/domains/banking/gql'

import type {
    BankAccount,
    BankAccountCreateInput,
    BankAccountUpdateInput,
    QueryAllBankAccountsArgs,
} from '@app/condo/schema'

const { useObject } = generateReactHooks<BankAccount, BankAccountCreateInput, BankAccountUpdateInput, QueryAllBankAccountsArgs>(BankAccountCategoryProgressGQL)

export {
    useObject,
}
