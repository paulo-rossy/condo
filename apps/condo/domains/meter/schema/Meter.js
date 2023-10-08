/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; organization:Relationship:Organization:CASCADE; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */
const { Text, Relationship } = require('@keystonejs/fields')
const { get, isString } = require('lodash')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, find, getByCondition, getById } = require('@open-condo/keystone/schema')

const { UNIQUE_ALREADY_EXISTS_ERROR } = require('@condo/domains/common/constants/errors')
const { UNIT_TYPE_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/meter/access/Meter')
const {
    AUTOMATIC_METER_NO_MASTER_APP,
    B2B_APP_NOT_CONNECTED,
    B2C_APP_NOT_AVAILABLE,
    METER_NUMBER_HAVE_INVALID_VALUE,
    METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE,
} = require('@condo/domains/meter/constants/errors')
const { deleteReadingsOfDeletedMeter } = require('@condo/domains/meter/tasks')
const { Meter: MeterApi } = require('@condo/domains/meter/utils/serverSchema')
const { serviceUserAccessForB2BApp } = require('@condo/domains/miniapp/schema/plugins/serviceUserAccessForB2BApp')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const { numberOfTariffs, installationDate, commissioningDate, verificationDate, nextVerificationDate, controlReadingsDate, sealingDate, isAutomatic, resource, b2bApp } = require('./fields')


const ERRORS = {
    NUMBER_HAVE_INVALID_VALUE: {
        code: BAD_USER_INPUT,
        type: METER_NUMBER_HAVE_INVALID_VALUE,
        message: 'value of "number" field must be non-empty string',
        messageForUser: 'api.meter.METER_NUMBER_HAVE_INVALID_VALUE',
        variable: ['data', 'number'],
    },
    ACCOUNT_NUMBER_HAVE_INVALID_VALUE: {
        code: BAD_USER_INPUT,
        type: METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE,
        message: 'value of "accountNumber" field must be non-empty string',
        messageForUser: 'api.meter.METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE',
        variable: ['data', 'accountNumber'],
    },
}

// TODO(DOMA-6195): replace 'addFieldValidationError' and 'addValidationError' to 'GQLError'
const Meter = new GQLListSchema('Meter', {
    schemaDoc: 'Resource meter at a certain place in the unitName',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,
        numberOfTariffs,
        installationDate,
        commissioningDate,
        verificationDate,
        nextVerificationDate,
        controlReadingsDate,
        sealingDate,
        isAutomatic,
        resource,
        b2bApp,
        
        property: {
            schemaDoc: 'Link to property which contains unit with this meter',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
        number: {
            schemaDoc: 'Number of resource meter, such as "А03 9908"',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath }) => {
                    const value = resolvedData[fieldPath]
                    return isString(value) ? value.trim() : value
                },
                validateInput: async ({ context, operation, existingItem, resolvedData, fieldPath, addFieldValidationError }) => {
                    const value = resolvedData[fieldPath]

                    if (!isString(value) || value.length < 1) {
                        throw new GQLError(ERRORS.NUMBER_HAVE_INVALID_VALUE, context)
                    }

                    // should be unique inside organization
                    let metersWithSameResourceAndNumberInOrganization
                    if (operation === 'create') {
                        metersWithSameResourceAndNumberInOrganization = await find('Meter', {
                            number: value,
                            organization: { id: resolvedData.organization },
                            resource: { id: resolvedData.resource },
                            deletedAt: null,
                        })
                    } else if (operation === 'update' && resolvedData.number !== existingItem.number) {
                        const organization = resolvedData.organization ? resolvedData.organization : existingItem.organization
                        const resource = resolvedData.resource ? resolvedData.resource : existingItem.resource

                        metersWithSameResourceAndNumberInOrganization = await MeterApi.getAll(context, {
                            number: value,
                            organization: { id: organization },
                            resource: { id: resource },
                            deletedAt: null,
                        })
                    }

                    if (metersWithSameResourceAndNumberInOrganization && metersWithSameResourceAndNumberInOrganization.length > 0) {
                        addFieldValidationError(`${UNIQUE_ALREADY_EXISTS_ERROR}${fieldPath}] Meter with same number and resource exist in current organization`)
                    }
                },
            },
        },

        accountNumber: {
            schemaDoc: 'Client\'s billing account',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath }) => {
                    const value = resolvedData[fieldPath]
                    return isString(value) ? value.trim() : value
                },
                validateInput: async ({ context, operation, existingItem, resolvedData, fieldPath, addFieldValidationError }) => {
                    const value = resolvedData[fieldPath]

                    if (!isString(value) || value.length < 1) {
                        throw new GQLError(ERRORS.ACCOUNT_NUMBER_HAVE_INVALID_VALUE, context)
                    }

                    if (operation === 'create' || (operation === 'update' && resolvedData.accountNumber !== existingItem.accountNumber)) {
                        const newItem = { ...existingItem, ...resolvedData }

                        const metersWithSameAccountNumberInOtherUnit = await MeterApi.getAll(context, {
                            accountNumber: value,
                            organization: { id: newItem.organization },
                            deletedAt: null,
                            OR: [
                                { unitName_not: newItem.unitName },
                                { unitType_not: newItem.unitType },
                                { property: { id_not: newItem.property } },
                            ],
                        })

                        if (metersWithSameAccountNumberInOtherUnit && metersWithSameAccountNumberInOtherUnit.length > 0) {
                            addFieldValidationError(`${UNIQUE_ALREADY_EXISTS_ERROR}${fieldPath}] Meter with same account number exist in current organization in other unit`)
                        }
                    }
                },
            },
        },
        unitName: {
            schemaDoc: 'Unit with this meter',
            type: Text,
            isRequired: true,
        },
        unitType: UNIT_TYPE_FIELD,
        place: {
            schemaDoc: 'Certain place in unit where meter is, such as kitchen',
            type: Text,
        },
        meta: {
            schemaDoc: 'Meter metadata. Can be used to store additional settings from external sources, such as billing integrations or mini apps',
            type: Json,
            isRequired: false,
        },
        b2cApp: {
            schemaDoc: 'Ref to the B2CApp which used to replace default integration with meter by resident\'s user in resident\'s app',
            type: Relationship,
            ref: 'B2CApp',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['organization', 'number', 'resource'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'meter_unique_organization_and_number',
            },
        ],
    },
    hooks: {
        validateInput: async ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            if (newItem.isAutomatic && !newItem.b2bApp) {
                return addValidationError(AUTOMATIC_METER_NO_MASTER_APP)
            }
            if (resolvedData['b2bApp']) {
                const activeContext = await getByCondition('B2BAppContext', {
                    organization: { id: newItem.organization, deletedAt: null },
                    app: { id: newItem.b2bApp, deletedAt: null },
                    deletedAt: null,
                })
                if (!activeContext) {
                    return addValidationError(B2B_APP_NOT_CONNECTED)
                }
            }
            if (resolvedData['b2cApp']) {
                const property = await getById('Property', newItem.property)
                const address = get(property, 'address', null)
                const appProperty = await getByCondition('B2CAppProperty', {
                    deletedAt: null,
                    app: { id: newItem.b2cApp, deletedAt: null },
                    address_i: address,
                })
                if (!appProperty) {
                    return addValidationError(B2C_APP_NOT_AVAILABLE)
                }
            }
        },
        afterChange: async ({ operation, originalInput, updatedItem }) => {
            if (operation === 'update') {
                const deletedMeterAt = get(originalInput, 'deletedAt')

                if (deletedMeterAt) {
                    await deleteReadingsOfDeletedMeter.delay(updatedItem, deletedMeterAt)
                }
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical(), serviceUserAccessForB2BApp()],
    access: {
        read: access.canReadMeters,
        create: access.canManageMeters,
        update: access.canManageMeters,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Meter,
    METER_ERRORS: ERRORS,
}
