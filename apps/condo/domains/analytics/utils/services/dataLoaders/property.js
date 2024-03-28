const { AbstractDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/AbstractDataLoader')
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')

class PropertyDataLoader extends AbstractDataLoader {
    async get ({ where }) {
        // TODO: we should count all units including uninhabitedUnitsCount too!!!

        const propertyUnitDataLoader = new GqlWithKnexLoadList({
            listKey: 'Property',
            fields: 'id unitsCount address',
            where: {
                ...where,
                deletedAt: null,
            },
        })

        const propertyIds = await propertyUnitDataLoader.load()
        const result = await propertyUnitDataLoader.loadAggregate('SUM("unitsCount")', propertyIds.map(({ id }) => id))

        const properties = propertyIds.map(({ address, unitsCount }) => ({
            count: unitsCount,
            address,
        }))

        return { sum: result.sum || 0, properties }
    }
}

module.exports = { PropertyDataLoader }
