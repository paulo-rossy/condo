import { ParsedUrlQuery } from 'querystring'
import get from 'lodash/get'

import { IRecordWithId, RecordWithAddressDetails } from '../types'
import {FilterValue} from "antd/es/table/interface";
import {IFilters} from "../../ticket/utils/helpers";

const DEFAULT_WIDTH_PRECISION = 2
const PHONE_FORMAT_REGEXP = /(\d)(\d{3})(\d{3})(\d{2})(\d{2})/

/**
 * Formats a phone, convert it from number string to string with dividers
 * for example: 01234567890 -> 0 (123) 456-78-90
*/
export const formatPhone = (phone?: string): string =>
    phone ? phone.replace(PHONE_FORMAT_REGEXP, '$1 ($2) $3-$4-$5') : phone


export const getFiltersFromQuery = <T>(query: ParsedUrlQuery): T | Record<string, never> => {
    const { filters } = query

    if (!filters || typeof filters !== 'string') {
        return {}
    }

    try {
        return JSON.parse(filters)
    } catch (e) {
        return {}
    }
}

export const preciseFloor = (x: number, precision: number = DEFAULT_WIDTH_PRECISION) => {
    return Math.floor(x * Math.pow(10, precision)) / 100
}

/**
 * Tries to extract address details from a record
 * @param record
 * @param ShortFlatNumber
 */
export const getAddressDetails = (record: RecordWithAddressDetails, ShortFlatNumber?: string) => {
    const property = get(record, 'property')
    const unitName = get(record, 'unitName')
    const text = get(property, 'address')
    const unitPrefix = unitName ? `${ShortFlatNumber} ${unitName}` : ''

    return { text, unitPrefix }
}

/**
 * Tries to get id of string type from any record that might contain such
 * @param record
 */
export const getId = (record: IRecordWithId): string | null => record && record.id || null

/**
 * Generic function for extracting value from filters
 * @param filters
 * @param key
 */
export const getFilteredValue = <T>(filters: T, key: string | Array<string>): FilterValue => get(filters, key, null)
