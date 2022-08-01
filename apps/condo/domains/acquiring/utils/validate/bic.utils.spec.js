const { SPACE_SYMBOLS, SPACE_SYMBOL_LABLES } = require('@condo/domains/common/utils/string.utils')
const { validateBic } = require('@condo/domains/acquiring/utils/validate/bic.utils')
const { createValidRuBic } = require('@condo/domains/acquiring/utils/testSchema/recipientGenerate')

const SPACES = SPACE_SYMBOLS.split('')

const VALID_RU_BIC = ['045809749', '042612466', '043194972']
const WRONG_LENGTH_RU_BIC = '0484528544'
const WRONG_FORMAT_RU_BIC = '04845B854'
const WRONG_CODE_COUNTRY_RU_BIC = '588453854'


describe('validateBic()', () => {
    VALID_RU_BIC.forEach(bic => {
        test(`for valid RU BIC (${bic})`, () => {
            const { result } = validateBic(bic)
            expect(result).toBe(true)
        })

        SPACES.forEach(spaceSymbol => {
            test(`for valid RU BIC (${bic}) with spaces symbol (${SPACE_SYMBOL_LABLES[spaceSymbol] || spaceSymbol})`, () => {
                const bicValue = `${spaceSymbol}${bic}${spaceSymbol}`

                const { result } = validateBic(bicValue)
                expect(result).toBe(true)
            })
        })
    })

    test('for wrong length number as RU BIC', () => {
        const { result, errors } = validateBic(WRONG_LENGTH_RU_BIC)
        expect(result).toBe(false)
        expect(errors[0]).toBe('Bic length was expected to be 9, but received 10')
    })
    test('for contains invalid characters as RU BIC', () => {
        const { result, errors } = validateBic(WRONG_FORMAT_RU_BIC)
        expect(result).toBe(false)
        expect(errors[0]).toBe('Bic can contain only numeric digits')
    })
    test('for empty value as RU BIC', () => {
        const { result, errors } = validateBic('')
        expect(result).toBe(false)
        expect(errors[0]).toBe('Bic is empty')
    })
    test('for create valid RU BIC', () => {
        const bic = createValidRuBic()
        const { result } = validateBic(bic)
        expect(result).toBe(true)
    })
    test('for wrong country code as RU BIC', () => {
        const { result, errors } = validateBic(WRONG_CODE_COUNTRY_RU_BIC)
        expect(result).toBe(false)
        expect(errors[0]).toBe('For RU organizations country code is 04, but bic have 58')
    })
})

module.exports = {
    VALID_RU_BIC,
    WRONG_LENGTH_RU_BIC,
    WRONG_FORMAT_RU_BIC,
}
