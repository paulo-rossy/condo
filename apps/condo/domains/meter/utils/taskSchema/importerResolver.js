const { isNil, isEmpty } = require('lodash')

const { featureToggleManager } = require('@open-condo/featureflags/featureToggleManager')
const { i18n } = require('@open-condo/locales/loader')

const { BIGGER_LIMIT_FOR_IMPORT } = require('@condo/domains/common/constants/featureflags')
const {
    DOMA_EXCEL,
    CANCELLED,
    ERROR,
} = require('@condo/domains/common/constants/import')
const { DEFAULT_RECORDS_LIMIT_FOR_IMPORT } = require('@condo/domains/common/constants/import')
const {
    HOT_WATER_METER_RESOURCE_ID,
    COLD_WATER_METER_RESOURCE_ID,
    ELECTRICITY_METER_RESOURCE_ID,
    HEAT_SUPPLY_METER_RESOURCE_ID,
    GAS_SUPPLY_METER_RESOURCE_ID,
} = require('@condo/domains/meter/constants/constants')
const {
    EXISTING_METER_ACCOUNT_NUMBER_IN_OTHER_UNIT,
    EXISTING_METER_NUMBER_IN_SAME_ORGANIZATION,
    METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION,
} = require('@condo/domains/meter/constants/errors')
const { MeterReadingsImportTask, registerMetersReadings } = require('@condo/domains/meter/utils/serverSchema')
const {
    FLAT_UNIT_TYPE,
    PARKING_UNIT_TYPE,
    APARTMENT_UNIT_TYPE,
    WAREHOUSE_UNIT_TYPE,
    COMMERCIAL_UNIT_TYPE,
} = require('@condo/domains/property/constants/common')
const { User } = require('@condo/domains/user/utils/serverSchema')

const { DomaMetersImporter } = require('./DomaMetersImporter')
const { SbbolMetersImporter } = require('./SbbolMetersImporter')

const dvAndSender = { dv: 1, sender: { dv: 1, fingerprint: 'import-meter-job' } }

function getColumnNames (format, locale) {
    // A separate translation namespace is used to make import feature independent on other
    // to avoid sudden regressed changes of column names when many clients will already use provided spreadsheet
    const AddressColumnMessage = i18n('meter.import.column.address', { locale })
    const UnitNameColumnMessage = i18n('meter.import.column.unitName', { locale })
    const UnitTypeColumnMessage = i18n('meter.import.column.unitType', { locale })
    const AccountNumberColumnMessage = i18n('meter.import.column.accountNumber', { locale })
    const MeterTypeColumnMessage = i18n('meter.import.column.meterType', { locale })
    const MeterNumberColumnMessage = i18n('meter.import.column.meterNumber', { locale })
    const MeterTariffsNumberColumnMessage = i18n('meter.import.column.meterTariffsNumber', { locale })
    const Value1ColumnMessage = i18n('meter.import.column.value1', { locale })
    const Value2ColumnMessage = i18n('meter.import.column.value2', { locale })
    const Value3ColumnMessage = i18n('meter.import.column.value3', { locale })
    const Value4ColumnMessage = i18n('meter.import.column.value4', { locale })
    const ReadingSubmissionDateMessage = i18n('meter.import.column.meterReadingSubmissionDate', { locale })
    const VerificationDateMessage = i18n('meter.import.column.VerificationDate', { locale })
    const NextVerificationDateMessage = i18n('meter.import.column.NextVerificationDate', { locale })
    const InstallationDateMessage = i18n('meter.import.column.InstallationDate', { locale })
    const CommissioningDateMessage = i18n('meter.import.column.CommissioningDate', { locale })
    const SealingDateMessage = i18n('meter.import.column.SealingDate', { locale })
    const ControlReadingsDate = i18n('meter.import.column.ControlReadingsDate', { locale })
    const PlaceColumnMessage = i18n('meter.import.column.MeterPlace', { locale })

    return format === DOMA_EXCEL ? [
        { name: AddressColumnMessage, type: 'string', required: true },
        { name: UnitNameColumnMessage, type: 'string', required: true },
        { name: UnitTypeColumnMessage, type: 'string', required: true },
        { name: AccountNumberColumnMessage, type: 'string', required: true },
        { name: MeterTypeColumnMessage, type: 'string', required: true },
        { name: MeterNumberColumnMessage, type: 'string', required: true },
        { name: MeterTariffsNumberColumnMessage, type: 'string', required: true },
        { name: Value1ColumnMessage, type: 'string', required: false },
        { name: Value2ColumnMessage, type: 'string', required: false },
        { name: Value3ColumnMessage, type: 'string', required: false },
        { name: Value4ColumnMessage, type: 'string', required: false },
        { name: ReadingSubmissionDateMessage, type: 'custom', required: true },
        { name: VerificationDateMessage, type: 'date', required: false },
        { name: NextVerificationDateMessage, type: 'date', required: false },
        { name: InstallationDateMessage, type: 'date', required: false },
        { name: CommissioningDateMessage, type: 'date', required: false },
        { name: SealingDateMessage, type: 'date', required: false },
        { name: ControlReadingsDate, type: 'date', required: false },
        { name: PlaceColumnMessage, type: 'string', required: false },
    ] : null
}

function getMappers (format, locale) {
    const FlatUnitTypeValue = i18n('pages.condo.ticket.field.unitType.flat', { locale })
    const ParkingUnitTypeValue = i18n('pages.condo.ticket.field.unitType.parking', { locale })
    const ApartmentUnitTypeValue = i18n('pages.condo.ticket.field.unitType.apartment', { locale })
    const WarehouseUnitTypeValue = i18n('pages.condo.ticket.field.unitType.warehouse', { locale })
    const CommercialUnitTypeValue = i18n('pages.condo.ticket.field.unitType.commercial', { locale })

    const HotWaterResourceTypeValue = i18n('meter.import.value.meterResourceType.hotWater', { locale })
    const ColdWaterResourceTypeValue = i18n('meter.import.value.meterResourceType.coldWater', { locale })
    const ElectricityResourceTypeValue = i18n('meter.import.value.meterResourceType.electricity', { locale })
    const HeatSupplyResourceTypeValue = i18n('meter.import.value.meterResourceType.heatSupply', { locale })
    const GasSupplyResourceTypeValue = i18n('meter.import.value.meterResourceType.gasSupply', { locale })

    return format === DOMA_EXCEL ? {
        unitType: {
            [FlatUnitTypeValue.toLowerCase()]: FLAT_UNIT_TYPE,
            [ParkingUnitTypeValue.toLowerCase()]: PARKING_UNIT_TYPE,
            [ApartmentUnitTypeValue.toLowerCase()]: APARTMENT_UNIT_TYPE,
            [WarehouseUnitTypeValue.toLowerCase()]: WAREHOUSE_UNIT_TYPE,
            [CommercialUnitTypeValue.toLowerCase()]: COMMERCIAL_UNIT_TYPE,
        },
        resourceId: {
            [HotWaterResourceTypeValue]: HOT_WATER_METER_RESOURCE_ID,
            [ColdWaterResourceTypeValue]: COLD_WATER_METER_RESOURCE_ID,
            [ElectricityResourceTypeValue]: ELECTRICITY_METER_RESOURCE_ID,
            [HeatSupplyResourceTypeValue]: HEAT_SUPPLY_METER_RESOURCE_ID,
            [GasSupplyResourceTypeValue]: GAS_SUPPLY_METER_RESOURCE_ID,
        },
    } : {
        unitType: {},
        resourceId: {
            '1': GAS_SUPPLY_METER_RESOURCE_ID, // Gas,
            '2': ELECTRICITY_METER_RESOURCE_ID, // Electricity
            '3': ELECTRICITY_METER_RESOURCE_ID, // Electricity (day) (for 2-tariff meter)
            '4': ELECTRICITY_METER_RESOURCE_ID, // Electricity (night) (for 2-tariff meter)
            '5': ELECTRICITY_METER_RESOURCE_ID, // Electricity (peak) (for 3-tariff meter)
            '6': ELECTRICITY_METER_RESOURCE_ID, // Electricity (day) (for 3-tariff meter)
            '7': ELECTRICITY_METER_RESOURCE_ID, // Electricity (night) (for 3-tariff meter)
            '8': HOT_WATER_METER_RESOURCE_ID, // Hot water
            '9': COLD_WATER_METER_RESOURCE_ID, // Cold water
            '10': HEAT_SUPPLY_METER_RESOURCE_ID, // Heating
            '11': '', // Water disposal
            '12': '', // Water for irrigation
            '13': '', // Garbage
        },
    }
}

async function getErrors (keystone, format, locale, columns, mappers) {
    const maxTableLength = await featureToggleManager.getFeatureValue(
        keystone,
        BIGGER_LIMIT_FOR_IMPORT,
        DEFAULT_RECORDS_LIMIT_FOR_IMPORT,
    )

    const TooManyRowsErrorTitle = i18n('TooManyRowsInTable.title', { locale })
    const TooManyRowsErrorMessage = i18n('TooManyRowsInTable.message', {
        locale,
        meta: { value: maxTableLength },
    })
    const InvalidHeadersErrorTitle = i18n('TableHasInvalidHeaders.title', { locale })
    const EmptyRowsErrorTitle = i18n('EmptyRows.title', { locale })
    const EmptyRowsErrorMessage = i18n('EmptyRows.message', { locale })
    const NotValidRowTypesMessage = i18n('errors.import.InvalidColumnTypes', { locale })
    const NormalizationErrorMessage = i18n('errors.import.NormalizationError', { locale })
    const ValidationErrorMessage = i18n('errors.import.ValidationError', { locale })
    const CreationErrorMessage = i18n('errors.import.CreationError', { locale })

    const UnknownResource =  i18n('meter.import.error.unknownResourceType', { locale, meta: { knownList: Object.keys(mappers.resourceId).join(',') } })
    const UnknownUnitType =  i18n('meter.import.error.unknownUnitType', { locale, meta: { knownList: Object.keys(mappers.unitType).join(',') } })

    return {
        tooManyRows: { title: TooManyRowsErrorTitle, message: TooManyRowsErrorMessage },
        invalidColumns: {
            title: InvalidHeadersErrorTitle,
            message: columns ? i18n('TableHasInvalidHeaders.message', { locale, meta: {
                value: columns.map(column => `"${column.name}"`).join(', '),
            } }) : '',
        },
        invalidTypes: { message: NotValidRowTypesMessage },
        normalization: { message: NormalizationErrorMessage },
        validation: { message: ValidationErrorMessage },
        creation: { message: CreationErrorMessage },
        emptyRows: { title: EmptyRowsErrorTitle, message: EmptyRowsErrorMessage },
        unknownResource: { message: UnknownResource },
        unknownUnitType: { message: UnknownUnitType },
    }
}

function getMutationError (locale) {
    const MeterAccountNumberExistInOtherUnitMessage = i18n('meter.import.error.MeterAccountNumberExistInOtherUnit', locale)
    const MeterResourceOwnedByAnotherOrganizationMessage = i18n('api.meter.METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION', locale)
    const MeterNumberExistInOrganizationMessage = i18n('meter.import.error.MeterNumberExistInOrganization', locale)
    
    return {
        [EXISTING_METER_ACCOUNT_NUMBER_IN_OTHER_UNIT]: MeterAccountNumberExistInOtherUnitMessage,
        [EXISTING_METER_NUMBER_IN_SAME_ORGANIZATION]: MeterNumberExistInOrganizationMessage,
        [METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION]: MeterResourceOwnedByAnotherOrganizationMessage,
    }
}

async function importRows (keystone, userId, organizationId, rows) {
    // readings meter import must be called with the user context
    const userContext = await keystone.createContext({
        authentication: {
            item: await User.getOne(keystone, { id: userId }),
            listKey: 'User',
        },
    })

    // call it with user context - require for MeterReadings hooks
    const { errors, data: { result } } = await registerMetersReadings(userContext, {
        ...dvAndSender,
        organization: { id: organizationId },
        readings: rows,
    })
    
    // fatal error proceeding case - throw error in order to fail proceeding job - since this is not recoverable state
    if (isNil(result) && !isEmpty(errors)) {
        throw errors[0]
    }
    
    return { errors, result }
}

async function breakProcessChecker (keystone, id) {
    const task = await MeterReadingsImportTask.getOne(keystone, { id })
    return task.status === CANCELLED
}

async function errorHandler (keystone, id, error) {
    await MeterReadingsImportTask.update(keystone, id, {
        ...dvAndSender,
        status: ERROR,
        errorMessage: error,
    })
}

async function setTotalRows (keystone, id, total) {
    await MeterReadingsImportTask.update(keystone, id, {
        ...dvAndSender,
        totalRecordsCount: total,
    })
}

async function setProcessedRows (keystone, id, processed) {
    await MeterReadingsImportTask.update(keystone, id, {
        ...dvAndSender,
        processedRecordsCount: processed,
    })
}

async function setImportedRows (keystone, id, imported) {
    await MeterReadingsImportTask.update(keystone, id, {
        ...dvAndSender,
        importedRecordsCount: imported,
    })
}

async function getImporter (keystone, taskId, organizationId, userId, format, locale) {
    const MetersImporterClass = format === DOMA_EXCEL ? DomaMetersImporter : SbbolMetersImporter
    const columns = getColumnNames(format, locale)
    const mappers = getMappers(format, locale)
    const errors = await getErrors(keystone, format, locale, columns, mappers)
    const mutationErrorsToMessages = getMutationError(locale)
    const importRowsMutation = async (rows) => await importRows(keystone, userId, organizationId, rows)
    const breakProcessCheckerQuery = async () => await breakProcessChecker(keystone, taskId)
    const setTotalRowsMutation = async (total) => await setTotalRows(keystone, taskId, total)
    const setProcessedRowsMutation = async (processed) => await setProcessedRows(keystone, taskId, processed)
    const setImportedRowsMutation = async (imported) => await setImportedRows(keystone, taskId, imported)
    const errorHandlerMutation = async (error) => await errorHandler(keystone, taskId, error)

    return new MetersImporterClass(
        columns,
        mappers,
        importRowsMutation,
        errors,
        mutationErrorsToMessages,
        breakProcessCheckerQuery,
        setTotalRowsMutation,
        setProcessedRowsMutation,
        setImportedRowsMutation,
        errorHandlerMutation,
    )
}

module.exports = {
    getImporter,
}