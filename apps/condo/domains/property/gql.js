/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const { PARKING_UNIT_TYPE, FLAT_UNIT_TYPE, WAREHOUSE_UNIT_TYPE, COMMERCIAL_UNIT_TYPE, APARTMENT_UNIT_TYPE } = require('@condo/domains/property/constants/common')

const { ADDRESS_META_SUBFIELDS_QUERY_LIST, ADDRESS_META_SUBFIELDS_TABLE_LIST } = require('./schema/fields/AddressMetaField')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt organization { id name} newId createdBy { id name } updatedBy { id name } createdAt updatedAt'
const PROPERTY_MAP_SECTION_FIELDS = 'id type index name preview floors { id type index name units { id type unitType name label preview } }'
const PROPERTY_MAP_JSON_FIELDS = `dv type sections { ${PROPERTY_MAP_SECTION_FIELDS} } parking { ${PROPERTY_MAP_SECTION_FIELDS} }`
const PROPERTY_FIELDS = `{ name address addressMeta { ${ADDRESS_META_SUBFIELDS_QUERY_LIST} } type ticketsInWork yearOfConstruction area ticketsClosed ticketsDeferred unitsCount uninhabitedUnitsCount map { ${PROPERTY_MAP_JSON_FIELDS} } ${COMMON_FIELDS} isApproved addressKey }`
const PROPERTY_TABLE_FIELDS = `{ ${COMMON_FIELDS} unitsCount uninhabitedUnitsCount addressMeta { ${ADDRESS_META_SUBFIELDS_TABLE_LIST} }  ticketsInWork }`
const Property = generateGqlQueries('Property', PROPERTY_FIELDS)
const PropertyTable = generateGqlQueries('Property', PROPERTY_TABLE_FIELDS)

const PROPERTY_MAP_GRAPHQL_TYPES = `
    enum BuildingMapEntityType {
        building
        section
        floor
        unit
        village
    }

    enum BuildingMapType {
        building
    }

    enum BuildingSectionType {
        section
    }

    enum BuildingFloorType {
        floor
    }

    enum BuildingUnitType {
        unit
    }

    enum BuildingUnitSubType {
        ${PARKING_UNIT_TYPE}
        ${FLAT_UNIT_TYPE}
        ${APARTMENT_UNIT_TYPE}
        ${COMMERCIAL_UNIT_TYPE}
        ${WAREHOUSE_UNIT_TYPE}
    }

    type BuildingUnit {
        id: String!
        type: BuildingUnitType!
        unitType: BuildingUnitSubType
        name: String
        label: String!
        preview: Boolean
    }

    type BuildingFloor {
        id: String!
        type: BuildingFloorType!
        index: Int!
        name: String!
        units: [BuildingUnit]!
    }

    type BuildingSection {
        id: String!
        type: BuildingSectionType!
        index: Int!
        name: String!
        floors: [BuildingFloor]!
        preview: Boolean
    }

    """
    Technical map of the 'building' type Property object. We assume that there will be different maps for different property types. 
    """
    type BuildingMap {
        dv: Int!
        sections: [BuildingSection]
        parking: [BuildingSection]
        type: BuildingMapType
    }
    
    enum VillageMapType {
        village
    }

    """
    Technical map of the 'village' type Property object. We assume that there will be different maps for different property types. 
    """
    type VillageMap {
        dv: Int!
        type: VillageMapType
    }
    
    union PropertyMap = BuildingMap | VillageMap
`

const EXPORT_PROPERTIES_TO_EXCEL =  gql`
    query exportPropertiesToExcel ($data: ExportPropertiesToExcelInput!) {
        result: exportPropertiesToExcel(data: $data) { status, linkToFile }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Property,
    PropertyTable,
    PROPERTY_MAP_GRAPHQL_TYPES,
    EXPORT_PROPERTIES_TO_EXCEL,
    PROPERTY_MAP_JSON_FIELDS,
/* AUTOGENERATE MARKER <EXPORTS> */
}
