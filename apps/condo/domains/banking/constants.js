/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 */

const BANK_INTEGRATION_IDS = {
    SBBOL: 'd94743b0-e5d5-4d06-a244-ea4b2edb8633',
    '1CClientBankExchange': '61e3d767-bd62-40e3-a503-f885b242d262',
}

const _1C_CLIENT_BANK_EXCHANGE = '1CClientBankExchange'
const SBBOL = 'sbbol'

const IMPORT_REMOTE_SYSTEM_VALUES = [_1C_CLIENT_BANK_EXCHANGE, SBBOL]

const BANKING_TABLE_PAGE_SIZE = 10

const BANK_SYNC_TASK_STATUS = {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled',
}

const EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM = 'expenses_grouped_by_category_and_cost_item'
const BANK_ACCOUNT_REPORT_TEMPLATE_VALUES = [EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM]

// Errors
const INCORRECT_PROPERTY_ID = 'INCORRECT_PROPERTY_ID'
const EMPTY_BANK_ACCOUNT_REQUEST_EMAIL_TARGET_VALUE = 'EMPTY_BANK_ACCOUNT_REQUEST_EMAIL_TARGET_VALUE'
const WRONG_INTEGRATION = {
    message: 'BankAccount connected to another integration',
    messageForUser: 'api.banking.bankSyncTask.WRONG_INTEGRATION',
}
const INVALID_DATE = {
    message: 'Invalid options.dateTo or options.DateFrom',
    messageForUser: 'api.banking.bankSyncTask.INVALID_DATE',
}

module.exports = {
    BANK_INTEGRATION_IDS,
    _1C_CLIENT_BANK_EXCHANGE,
    SBBOL,
    IMPORT_REMOTE_SYSTEM_VALUES,
    INCORRECT_PROPERTY_ID,
    EMPTY_BANK_ACCOUNT_REQUEST_EMAIL_TARGET_VALUE,
    BANK_SYNC_TASK_STATUS,
    BANKING_TABLE_PAGE_SIZE,
    EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM,
    BANK_ACCOUNT_REPORT_TEMPLATE_VALUES,
    INVALID_DATE,
    WRONG_INTEGRATION,
}
