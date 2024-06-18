const CALL_METER_READING_SOURCE_ID = '61764f14-0630-11ec-9a03-0242ac130003'
const MOBILE_APP_SOURCE_ID = '694014c8-0630-11ec-9a03-0242ac130003'
const IMPORT_CONDO_METER_READING_SOURCE_ID = 'b0caa26a-bfba-41e3-a9fe-64d7f02f0650'
const EMAIL_METER_READING_SOURCE_ID = 'ae17162e-d24f-4bf0-9828-e7bc368f32e8'
const REMOTE_SYSTEM_METER_READING_SOURCE_ID = '681c2687-7423-47aa-8e61-4ccdfffa8470'
const OTHER_METER_READING_SOURCE_ID = '1e56f2a6-c90e-429c-a99b-8324e896722c'
const VISIT_METER_READING_SOURCE_ID = '4a727d8a-b698-4848-88d7-639f2a6bf036'
const WEB_APP_METER_READING_SOURCE_ID = '7f3142a5-7f02-4a18-b9a1-7a93b7143005'
const ORGANIZATION_SITE_METER_READING_SOURCE_ID = 'f52af431-0b52-4fe1-95dd-60c3d45b9ae0'
const MESSENGER_METER_READING_SOURCE_ID = 'e5f3d3d3-abc2-48a8-99e8-33ade60ea205'
const SOCIAL_NETWORK_METER_READING_SOURCE_ID = 'e07c307f-1c7a-4da6-87b9-1c03a990a19d'
const MOBILE_APP_STAFF_METER_READING_SOURCE_ID = '43c9fd8e-802f-4e8a-98b9-532596d7f8c1'
const CRM_METER_READING_SOURCE_ID = 'b09fec04-5bc2-4c58-a364-04b1ea505503'

const COLD_WATER_METER_RESOURCE_ID = 'e2bd70ac-0630-11ec-9a03-0242ac130003'
const HOT_WATER_METER_RESOURCE_ID = '0f54223c-0631-11ec-9a03-0242ac130003'
const ELECTRICITY_METER_RESOURCE_ID = '139a0d98-0631-11ec-9a03-0242ac130003'
const HEAT_SUPPLY_METER_RESOURCE_ID = '18555734-0631-11ec-9a03-0242ac130003'
const GAS_SUPPLY_METER_RESOURCE_ID = '1c267e92-0631-11ec-9a03-0242ac130003'

const METER_MODAL_FORM_ITEM_SPAN = 11

const METER_READING_SOURCE_CALL_TYPE = 'call'
const METER_READING_SOURCE_INTERNAL_IMPORT_TYPE = 'import_condo'
const METER_READING_SOURCE_EXTERNAL_IMPORT_TYPE = 'external_import'
const METER_READING_SOURCE_MOBILE_RESIDENT_APP_TYPE = 'mobile_app'
const METER_READING_SOURCE_EMAIL_TYPE = 'email'
const METER_READING_SOURCE_REMOTE_SYSTEM_TYPE = 'remote_system'
const METER_READING_SOURCE_OTHER_TYPE = 'other'
const METER_READING_SOURCE_VISIT_TYPE = 'visit'
const METER_READING_SOURCE_WEB_APP_TYPE = 'web_app'
const METER_READING_SOURCE_ORGANIZATION_SITE_TYPE = 'organization_site'
const METER_READING_SOURCE_MESSENGER_TYPE = 'messenger'
const METER_READING_SOURCE_SOCIAL_NETWORK_TYPE = 'social_network'
const METER_READING_SOURCE_MOBILE_APP_STAFF_TYPE = 'mobile_app_staff'
const METER_READING_SOURCE_CRM_TYPE = 'crm'

const METER_READING_SOURCE_TYPES = [
    METER_READING_SOURCE_INTERNAL_IMPORT_TYPE,
    METER_READING_SOURCE_CALL_TYPE,
    METER_READING_SOURCE_MOBILE_RESIDENT_APP_TYPE,
    METER_READING_SOURCE_EXTERNAL_IMPORT_TYPE,
    METER_READING_SOURCE_EMAIL_TYPE,
    METER_READING_SOURCE_REMOTE_SYSTEM_TYPE,
    METER_READING_SOURCE_OTHER_TYPE,
    METER_READING_SOURCE_VISIT_TYPE,
    METER_READING_SOURCE_WEB_APP_TYPE,
    METER_READING_SOURCE_ORGANIZATION_SITE_TYPE,
    METER_READING_SOURCE_MESSENGER_TYPE,
    METER_READING_SOURCE_SOCIAL_NETWORK_TYPE,
    METER_READING_SOURCE_MOBILE_APP_STAFF_TYPE,
    METER_READING_SOURCE_CRM_TYPE,
]

const DAY_SELECT_OPTIONS = Array(31).fill(0).map((num, index) => ({ label: String(index + 1), value: index + 1 }))
const METER_REPORTING_PERIOD_FRONTEND_FEATURE_FLAG = 'meter-reporting-period-frontend'

const METER_ACTIVE_STATUS = 'active'
const METER_ARCHIVED_STATUS = 'archived'

const METER_STATUSES = [
    METER_ACTIVE_STATUS,
    METER_ARCHIVED_STATUS,
]

module.exports = {
    COLD_WATER_METER_RESOURCE_ID,
    HOT_WATER_METER_RESOURCE_ID,
    ELECTRICITY_METER_RESOURCE_ID,
    HEAT_SUPPLY_METER_RESOURCE_ID,
    GAS_SUPPLY_METER_RESOURCE_ID,
    CALL_METER_READING_SOURCE_ID,
    MOBILE_APP_SOURCE_ID,
    EMAIL_METER_READING_SOURCE_ID,
    REMOTE_SYSTEM_METER_READING_SOURCE_ID,
    OTHER_METER_READING_SOURCE_ID,
    VISIT_METER_READING_SOURCE_ID,
    WEB_APP_METER_READING_SOURCE_ID,
    ORGANIZATION_SITE_METER_READING_SOURCE_ID,
    MESSENGER_METER_READING_SOURCE_ID,
    SOCIAL_NETWORK_METER_READING_SOURCE_ID,
    MOBILE_APP_STAFF_METER_READING_SOURCE_ID,
    METER_MODAL_FORM_ITEM_SPAN,
    IMPORT_CONDO_METER_READING_SOURCE_ID,
    METER_READING_SOURCE_TYPES,
    METER_READING_SOURCE_INTERNAL_IMPORT_TYPE,
    METER_READING_SOURCE_EXTERNAL_IMPORT_TYPE,
    METER_READING_SOURCE_CRM_TYPE,
    CRM_METER_READING_SOURCE_ID,
    DAY_SELECT_OPTIONS,
    METER_REPORTING_PERIOD_FRONTEND_FEATURE_FLAG,
    METER_READING_SOURCE_MOBILE_RESIDENT_APP_TYPE,
    METER_ACTIVE_STATUS,
    METER_ARCHIVED_STATUS,
    METER_STATUSES,
}