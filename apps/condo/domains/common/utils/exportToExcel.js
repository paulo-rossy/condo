const { i18n } = require('@condo/domains/common/utils/localesLoader')
const conf = require('@core/config')

const EXCEL_TEMPLATES_HEADERS = {
    payments: ['date', 'account', 'address', 'unitName', 'type', 'transaction', 'amount'],
}

/**
 * Builds translation key using template `excelExport.headers.${registry}.${column}`
 * @param {string} registry
 * @param {string} column
 * @returns {string}
 */
function translationStringKeyForExcelExportHeader (registry, column) {
    return `excelExport.headers.${registry}.${column}`
}

/**
 * @param {string} registry
 * @param {string} lang
 * @returns {Object<string, string>}
 */
function getHeadersTranslations (registry, lang = conf.DEFAULT_LOCALE) {
    return EXCEL_TEMPLATES_HEADERS[registry].reduce((acc, curr) => {
        return { ...acc, [curr]: i18n(translationStringKeyForExcelExportHeader(registry, curr), { lang }) }
    }, {})
}

module.exports = {
    EXCEL_TEMPLATES_HEADERS,
    getHeadersTranslations,
    translationStringKeyForExcelExportHeader,
}
