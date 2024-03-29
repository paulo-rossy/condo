const { AbstractDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/AbstractDataLoader')
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')

class PropertyDataLoader extends AbstractDataLoader {
    async get ({ where }) {
        const propertyUnitDataLoader = new GqlWithKnexLoadList({
            listKey: 'Property',
            fields: 'id unitsCount uninhabitedUnitsCount address',
            where: {
                ...where,
                deletedAt: null,
            },
        })

        const propertyIds = await propertyUnitDataLoader.load()
        const result = await propertyUnitDataLoader.loadAggregate('SUM("unitsCount" + "uninhabitedUnitsCount")', propertyIds.map(({ id }) => id))

        const properties = propertyIds.map(({ address, unitsCount, uninhabitedUnitsCount }) => ({
            count: unitsCount + uninhabitedUnitsCount,
            address,
        }))

        return { sum: result.sum || 0, properties }
    }
}

module.exports = { PropertyDataLoader }
