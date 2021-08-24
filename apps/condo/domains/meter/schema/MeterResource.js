/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/meter/access/MeterResource')


const MeterResource = new GQLListSchema('MeterResource', {
    schemaDoc: 'Resource for Meter',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'name of the meter resource',
            type: Text,
            isRequired: true,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadMeterResources,
        create: access.canManageMeterResources,
        update: access.canManageMeterResources,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MeterResource,
}
