/**
 * Generated by `createschema marketplace.InvoiceContext 'organization:Relationship:Organization:PROTECT; recipient:Json; email:Text; settings:Json; state:Json;'`
 */

const INVOICE_CONTEXT_STATUS_INPROGRESS = 'inprogress'
const INVOICE_CONTEXT_STATUS_FINISHED = 'finished'
const INVOICE_CONTEXT_STATUSES = [
    INVOICE_CONTEXT_STATUS_INPROGRESS,
    INVOICE_CONTEXT_STATUS_FINISHED,
]

const ERROR_INVALID_MOBILE_SETTINGS = 'INVALID_MOBILE_SETTINGS'
const ERROR_INVALID_INVOICE_CONTEXT_SETTINGS = 'INVALID_INVOICE_CONTEXT_SETTINGS'
const ERROR_TAX_REGIME_AND_VAT_NOT_MATCHED = 'TAX_REGIME_AND_VAT_NOT_MATCHED'
const ERROR_INVALID_INVOICE_ROWS = 'INVALID_INVOICE_ROWS'
const ERROR_NO_INVOICE_RECEIVERS = 'NO_INVOICE_RECEIVERS'
const ERROR_INVOICE_ALREADY_PAID = 'INVOICE_ALREADY_PAID'
const ERROR_INVOICE_EMPTY_ROWS = 'EMPTY_ROWS'
const ERROR_INVOICE_ROW_WRONG_COUNT = 'WRONG_COUNT'
const ERROR_INVOICE_ROW_WRONG_PRICE = 'WRONG_PRICE'

const VAT_OPTIONS = [0, 10, 20]

const TAX_REGIME_GENEGAL = 'general'
const TAX_REGIME_SIMPLE = 'simple'
const TAX_REGIMES = [TAX_REGIME_GENEGAL, TAX_REGIME_SIMPLE]

const INVOICE_STATUS_DRAFT = 'draft'
const INVOICE_STATUS_PUBLISHED = 'published'
const INVOICE_STATUS_PAID = 'paid'
const INVOICE_STATUSES = [
    INVOICE_STATUS_DRAFT,
    INVOICE_STATUS_PUBLISHED,
    INVOICE_STATUS_PAID,
]

// The default value for invoice context
const DEFAULT_IMPLICIT_FEE_PERCENT = '5'

module.exports = {
    INVOICE_CONTEXT_STATUS_FINISHED,
    INVOICE_CONTEXT_STATUSES,
    ERROR_INVALID_INVOICE_CONTEXT_SETTINGS,
    ERROR_TAX_REGIME_AND_VAT_NOT_MATCHED,
    ERROR_INVALID_INVOICE_ROWS,
    ERROR_NO_INVOICE_RECEIVERS,
    ERROR_INVOICE_ALREADY_PAID,
    ERROR_INVOICE_EMPTY_ROWS,
    ERROR_INVOICE_ROW_WRONG_COUNT,
    ERROR_INVOICE_ROW_WRONG_PRICE,
    VAT_OPTIONS,
    TAX_REGIME_GENEGAL,
    TAX_REGIME_SIMPLE,
    TAX_REGIMES,
    ERROR_INVALID_MOBILE_SETTINGS,
    DEFAULT_IMPLICIT_FEE_PERCENT,
    INVOICE_STATUS_DRAFT,
    INVOICE_STATUS_PUBLISHED,
    INVOICE_STATUS_PAID,
    INVOICE_STATUSES,
}
