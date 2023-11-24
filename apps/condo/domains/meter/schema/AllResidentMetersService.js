/**
 * Generated by `createservice meter.AllResidentMetersService`
 */

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema, find } = require('@open-condo/keystone/schema')

const { NOT_FOUND } = require('@condo/domains/common/constants/errors')
const access = require('@condo/domains/meter/access/AllResidentMetersService')
const {
    Meter,
    MeterResourceOwner,
} = require('@condo/domains/meter/utils/serverSchema')
const { Resident } = require('@condo/domains/resident/utils/serverSchema')

const ERRORS = {
    RESIDENT_DOES_NOT_EXISTS: {
        query: 'allResidentMeters',
        variable: ['where', 'id'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Resident with provided id does not exist',
    },
}

const AllResidentMetersService = new GQLCustomSchema('AllResidentMetersService', {
    types: [
        {
            access: true,
            type: 'input AllResidentMetersInput { resident: ResidentWhereUniqueInput!, first: Int, skip: Int }',
        },
        {
            access: true,
            type: 'type ResidentMeter { organization: Organization!, property: Property!, resource: MeterResource!, numberOfTariffs: Int, installationDate: String, commissioningDate: String, verificationDate: String, nextVerificationDate: String, controlReadingsDate: String, sealingDate: String, isAutomatic: Boolean!, number: String!, accountNumber: String!, unitName: String!, unitType: String!, place: String, meta: JSON, b2bApp: B2BApp, b2cApp: B2CApp, v: Int, dv: Int!, sender: SenderField!, id: ID!, createdBy: User, updatedBy: User, deletedAt: String, updatedAt: String, createdAt: String, newId: String }',
        },
    ],

    queries: [
        {
            access: access.canExecuteAllResidentMeters,
            schema: 'allResidentMeters(resident: ResidentWhereUniqueInput!, first: Int, skip: Int, sortBy: [SortMetersBy!]): [ResidentMeter!]',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { resident: { id: residentId }, first, skip, sortBy } = args

                const residentWhere = {
                    id: residentId,
                    organization: { deletedAt: null },
                    property: { deletedAt: null },
                    deletedAt: null,
                    user: { id: context.authedItem.id },
                }

                if (context.authedItem.isAdmin || context.authedItem.isSupport) {
                    delete residentWhere['user']
                }

                const resident = await Resident.getOne(context, residentWhere)

                if (!resident) throw new GQLError(ERRORS.RESIDENT_DOES_NOT_EXISTS, context)

                const condition = {
                    deletedAt: null,
                    OR: [
                        { addressKey: resident.addressKey },
                        { address_i: resident.address },
                    ],
                }

                const userConsumers = await find('ServiceConsumer', {
                    resident: { id: residentId, deletedAt: null },
                    organization: { deletedAt: null },
                    deletedAt: null,
                })

                const meterResourceOwners = await MeterResourceOwner.getAll(context, condition)

                const meterWhere = {
                    unitName: resident.unitName,
                    unitType: resident.unitType,
                    deletedAt: null,
                    accountNumber_in: userConsumers.map(serviceConsumer => serviceConsumer.accountNumber),
                }

                return await Meter.getAll(context, {
                    ...meterWhere,
                    OR: meterResourceOwners.map(resourceOwner => ({
                        AND: [
                            { organization: { id: resourceOwner.organization.id } },
                            { resource: { id: resourceOwner.resource.id } },
                        ],
                    })),
                }, { first, skip, sortBy })
            },
        },
    ],
})

module.exports = {
    AllResidentMetersService,
}
