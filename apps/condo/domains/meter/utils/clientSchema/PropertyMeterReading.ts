/**
 * Generated by `createschema meter.PropertyMeterReading 'date:DateTimeUtc; meter:Relationship:Meter:CASCADE; organization:Relationship:Organization:CASCADE; value1:Integer; value2:Integer; value3:Integer; value4:Integer; source:Relationship:MeterSource:PROTECT'`
 */

import {
    PropertyMeterReading,
    PropertyMeterReadingCreateInput,
    PropertyMeterReadingUpdateInput,
    QueryAllPropertyMeterReadingsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { PropertyMeterReading as PropertyMeterReadingGQL } from '@condo/domains/meter/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
    useSoftDeleteMany,
} = generateReactHooks<PropertyMeterReading, PropertyMeterReadingCreateInput, PropertyMeterReadingUpdateInput, QueryAllPropertyMeterReadingsArgs>(PropertyMeterReadingGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
    useSoftDeleteMany,
}
