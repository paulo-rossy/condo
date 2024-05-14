/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */
const { get, omit } = require('lodash')

const {
    createInstance: createAddressServiceClientInstance,
} = require('@open-condo/clients/address-service-client')
const { getLogger } = require('@open-condo/keystone/logging')
const { getById, GQLCustomSchema } = require('@open-condo/keystone/schema')

const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { BillingAccount } = require('@condo/domains/billing/utils/serverSchema')
const { MANAGING_COMPANY_TYPE } = require('@condo/domains/organization/constants/common')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { Property: PropertyAPI } = require('@condo/domains/property/utils/serverSchema')
const { getAddressUpToBuildingFrom } = require('@condo/domains/property/utils/serverSchema/helpers')
const access = require('@condo/domains/resident/access/RegisterResidentService')
const {
    RESIDENT_DISCOVER_CONSUMERS_WINDOW_SEC,
    MAX_RESIDENT_DISCOVER_CONSUMERS_BY_WINDOW_SEC,
} = require('@condo/domains/resident/constants/constants')
const { Resident: ResidentAPI } = require('@condo/domains/resident/utils/serverSchema')
const { discoverServiceConsumers } = require('@condo/domains/resident/utils/serverSchema')
const { RedisGuard } = require('@condo/domains/user/utils/serverSchema/guards')

const redisGuard = new RedisGuard()

const logger = getLogger('registerResident')

const checkLimits = async (uniqueField) => {
    await redisGuard.checkCustomLimitCounters(
        `discover-service-consumers-${uniqueField}`,
        RESIDENT_DISCOVER_CONSUMERS_WINDOW_SEC,
        MAX_RESIDENT_DISCOVER_CONSUMERS_BY_WINDOW_SEC,
    )
}

const RegisterResidentService = new GQLCustomSchema('RegisterResidentService', {
    types: [
        {
            access: true,
            // TODO(DOMA-6063): we need to remove `addressMeta` attribute here! We can work only with the `address` argument and request all data from addressService by addressKey or raw address string
            type: 'input RegisterResidentInput { dv: Int!, sender: SenderFieldInput!, address: String!, addressMeta: AddressMetaFieldInput!, unitName: String!, unitType: BuildingUnitSubType }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterResident,
            schema: 'registerResident(data: RegisterResidentInput!): Resident',
            resolver: async (parent, args, context) => {
                const { data: { dv, sender, address, addressMeta, unitName, unitType } } = args
                const reqId = get(context, ['req', 'id'])

                const attrs = {
                    dv,
                    sender,
                    address,
                    addressMeta,
                    unitName,
                    unitType,
                    user: { connect: { id: context.authedItem.id } },
                }

                const client = createAddressServiceClientInstance({ address })

                const addressItem = await client.search(address)

                const [existingResident] = await ResidentAPI.getAll(context, {
                    // Keep searching by address string and additionally search by addressKey
                    OR: [
                        { address_i: address },
                        { addressKey: addressItem.addressKey },
                    ],
                    unitName_i: unitName,
                    unitType,
                    user: { id: context.authedItem.id },
                }, {
                    first: 1,
                })

                const propertyAddress = getAddressUpToBuildingFrom(addressMeta)
                const [property] = await PropertyAPI.getAll(
                    context,
                    {
                        OR: [
                            { address_i: propertyAddress },
                            { addressKey: addressItem.addressKey },
                        ],
                        organization: { type: MANAGING_COMPANY_TYPE },
                        deletedAt: null,
                    },
                    { sortBy: ['isApproved_DESC', 'createdAt_ASC'], first: 1 },
                )

                if (property) {
                    attrs.property = { connect: { id: property.id } }
                }

                if (!attrs.unitType) {
                    attrs.unitType = FLAT_UNIT_TYPE
                }

                let id
                if (existingResident) {
                    const nextAttrs = omit(
                        { ...attrs, deletedAt: null },
                        ['address', 'addressMeta', 'unitName'],
                    )

                    // TODO(DOMA-1780): we need to update address and addressMeta from property
                    await ResidentAPI.update(context, existingResident.id, nextAttrs)
                    id = existingResident.id
                } else {
                    const propertyAddress = getAddressUpToBuildingFrom(addressMeta)
                    const residentAttrs = { ...attrs, address: propertyAddress }
                    const resident = await ResidentAPI.create(context, residentAttrs)

                    id = resident.id
                }


                try {
                    // checkLimits throws an error if the limit was reached
                    await checkLimits(context.authedItem.id)
                    const billingAccounts = await BillingAccount.getAll(
                        context,
                        {
                            context: { status: CONTEXT_FINISHED_STATUS, deletedAt: null },
                            property: { address, deletedAt: null },
                            unitType,
                            unitName,
                        },
                    )

                    try {
                        if (billingAccounts.length > 0) {
                            // Call the mutation directly (without task) to make the resident see receipts immediately
                            const discoveringResult = await discoverServiceConsumers(context, {
                                dv,
                                sender,
                                billingAccountsIds: billingAccounts.map(({ id }) => id),
                                filters: { residentsIds: [id] },
                            })
                            logger.info({
                                msg: 'discoverServiceConsumers done',
                                result: discoveringResult,
                                user: { id: context.authedItem.id }, resident: { id }, reqId,
                            })
                        }
                    } catch (err) {
                        logger.error({ msg: 'discoverServiceConsumers fail', user: { id: context.authedItem.id }, resident: { id }, err, reqId })
                    }
                } catch (err) {
                    logger.warn({ msg: 'discoverServiceConsumers limit error', user: { id: context.authedItem.id }, resident: { id }, err, reqId })
                }

                // Hack that helps to resolve all subfields in result of this mutation
                return await getById('Resident', id)
            },
        },
    ],

})

module.exports = {
    RegisterResidentService,
}
