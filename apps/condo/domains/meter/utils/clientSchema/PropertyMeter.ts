/**
 * Generated by `createschema meter.PropertyMeter 'number:Text; numberOfTariffs:Integer; installationDate:DateTimeUtc; commissioningDate:DateTimeUtc; verificationDate:DateTimeUtc; nextVerificationDate:DateTimeUtc; controlReadingsDate:DateTimeUtc; sealingDate:DateTimeUtc; isAutomatic:Checkbox; organization:Relationship:Organization:CASCADE; property:Relationship:Property:CASCADE; resource:Relationship:MeterResource:CASCADE; meta:Json;'`
 */

import {
    PropertyMeter,
    PropertyMeterCreateInput,
    PropertyMeterUpdateInput,
    QueryAllPropertyMetersArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { PropertyMeter as PropertyMeterGQL } from '@condo/domains/meter/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<PropertyMeter, PropertyMeterCreateInput, PropertyMeterUpdateInput, QueryAllPropertyMetersArgs>(PropertyMeterGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
}
