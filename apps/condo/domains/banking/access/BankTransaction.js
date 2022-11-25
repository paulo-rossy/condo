// @ts-nocheck
/**
 * Generated by `createschema banking.BankTransaction 'account:Relationship:BankAccount:CASCADE; contractorAccount:Relationship:BankContractorAccount:CASCADE; costItem?:Relationship:BankCostItem:SET_NULL; organization:Relationship:Organization:CASCADE; number:Text; date:CalendarDay; amount:Decimal; purpose:Text; dateWithdrawed:CalendarDay; dateReceived:CalendarDay; meta:Json; importId:Text; importRemoteSystem:Text;'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canReadBankTransactions ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    // TODO(codegen): write canReadBankTransactions logic for user!
    return false
}

async function canManageBankTransactions ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create') {
        // TODO(codegen): write canManageBankTransactions create logic!
        return false
    } else if (operation === 'update') {
        // TODO(codegen): write canManageBankTransactions update logic!
        return false
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBankTransactions,
    canManageBankTransactions,
}
