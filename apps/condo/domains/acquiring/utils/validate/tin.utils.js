const { RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')

const EMPTY = 'Tin is empty'
const NOT_NUMERIC = 'Tin can contain only numeric digits'
const WRONG_LENGTH = 'Tin length was expected to be 10 or 12, but received '
const WRONG_COUNTRY = 'Only RU organizations are supported'
const CONTROL_SUM_FAILED = 'Control sum is not valid for tin'

const RU_TIN_DIGITS = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8, 0]


//TODO: Fix all places where isValidTin is used


class RecipientTinValidation {

    errors = []

    getTinChecksumRU (num) {
        const weights = RU_TIN_DIGITS.slice(-num.length)
        let sum = 0

        for (let i = 0; i < num.length; i++)
            sum += num[i] * weights[i]

        return sum % 11 % 10
    }


    validateForNumbersAndLength (tin) {
        if (!tin.length) {
            this.errors.push(EMPTY)
        }
        if (!/^[0-9]{10,12}$/.test(tin)) {
            this.errors.push(NOT_NUMERIC)
        }
        if (tin.length !== 10 && tin.length !== 12) {
            this.errors.push(WRONG_LENGTH + tin.length)
        }
    }


    validateTin (tin, country = RUSSIA_COUNTRY) {
        if (country === RUSSIA_COUNTRY) {
            this.validateForNumbersAndLength(tin)
        } else {
            this.errors.push(WRONG_COUNTRY)
        }

        if (tin.length === 10)
            if (!this.getTinChecksumRU(tin) === tin.slice(-1)) {
                this.errors.push(CONTROL_SUM_FAILED)
            }

        if (tin.length === 12)
            if (!(this.getTinChecksumRU(tin.slice(0, 11)) === Number(tin.slice(10, -1))
                && this.getTinChecksumRU(tin) === Number(tin.slice(-1)))) {
                this.errors.push(CONTROL_SUM_FAILED)
            }

        return {
            result: !this.errors.length,
            errors: this.errors,
        }
    }
}

const validateTin = (tin, country) => {
    const validator = new RecipientTinValidation()
    const { result, errors } = validator.validateTin(tin, country)
    return { result, errors }
}

module.exports = {
    validateTin,
}
