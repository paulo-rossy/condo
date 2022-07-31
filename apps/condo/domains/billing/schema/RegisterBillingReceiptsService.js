/**
 * Generated by `createservice billing.RegisterBillingReceiptsService --type mutations`
 */

const _ = require('lodash')

const { BillingAccount, BillingProperty, BillingReceipt } = require('@condo/domains/billing/utils/serverSchema')

const access = require('@condo/domains/billing/access/RegisterBillingReceiptsService')
const { find, getById, GQLCustomSchema } = require('@core/keystone/schema')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT, INTERNAL_ERROR } } = require('@core/keystone/errors')
const { NOT_FOUND, WRONG_FORMAT, WRONG_VALUE } = require('@condo/domains/common/constants/errors')
const Big = require('big.js')

const RECEIPTS_LIMIT = 100

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    BILLING_CONTEXT_NOT_FOUND: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'context'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Provided BillingIntegrationOrganizationContext is not found',
    },
    BILLING_CATEGORY_NOT_FOUND: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'category'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Provided BillingCategory is not found for some receipts',
    },
    PERIOD_WRONG_FORMAT: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'period'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'field Period is in wrong format for some receipts. Period should be in format: {YEAR}-{MONTH}-01. Example: 2022-03-01 - March of 2022',
    },
    ADDRESS_WRONG_VALUE: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'address'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'field Address has wrong value for some receipts',
    },
    RECEIPTS_LIMIT_HIT: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: `Too many receipts in one query! We support up to ${RECEIPTS_LIMIT} receipts`,
    },
}

const getBillingPropertyKey = ({ address }) => address
const getBillingAccountKey = ({ unitName, unitType, number, property }) => [unitName, unitType, number, getBillingPropertyKey(property)].join('_')
const getBillingReceiptKey = ({ category: { id: categoryId }, period, property, account, recipient: { tin, bankAccount, iec, bic } }) => [categoryId, period, getBillingPropertyKey(property), getBillingAccountKey(account), tin, bankAccount, iec, bic].join('_')

// const DELETE = 'delete'
// const UPDATE = 'update'
// const CREATE = 'create'
//
// const syncObjects = async (context, list, existingObjs, objs, getKey, getOperation, convertToGQLInput = x => x) => {
//     const existingObjsIndex = Object.fromEntries(existingObjs.map((obj) => ([getKey(obj), obj])))
//
//     const toCreate = []
//     const toUpdate = []
//     const toDelete = []
//
//     objs.forEach(obj => {
//         const key = getKey(obj)
//         const existingObj = _.get(existingObjsIndex, key)
//         const operation = getOperation(existingObj, obj)
//
//         switch (operation) {
//             case CREATE:
//                 toCreate.push(convertToGQLInput({ obj, operation }))
//                 break
//             case UPDATE:
//                 toUpdate.push({ convertToGQLInput ({ obj, operation }) })
//                 break
//             case DELETE:
//                 toDelete.push(convertToGQLInput({ obj, operation }))
//                 break
//             default:
//                 break
//         }
//     })
//
//     const created = await toCreate.map(async input => await list.create(context, input))
//     const updated = await toUpdate.map(async input => await list.update(context, input.id, input.data))
//
//     return {
//         created,
//         updated,
//
//     }
// }

const syncBillingProperties = async (context, properties, { billingContextId }) => {
    const propertiesQuery = { address_in: properties.map(p => p.address), context: { id: billingContextId } }

    const existingProperties = await find('BillingProperty', propertiesQuery)
    const existingPropertiesIndex = Object.fromEntries(existingProperties.map((property) => ([getBillingPropertyKey(property), property.id])))

    const propertiesToAdd = properties.filter(((property) => !Reflect.has(existingPropertiesIndex, getBillingPropertyKey(property))))

    const createdProperties = []
    for (const property of propertiesToAdd) {

        const propertyToCreate = {
            ...property,
            context: { connect: { id: _.get(property, ['context', 'id']) } },
        }

        const newProperty = await BillingProperty.create(context, propertyToCreate)
        createdProperties.push(newProperty)
    }

    return [...createdProperties, ...existingProperties]
}

const syncBillingAccounts = async (context, accounts, { properties, billingContextId }) => {

    const propertiesIndex = Object.fromEntries(properties.map((item) => ([getBillingPropertyKey(item), item])))
    const propertiesIndexById = Object.fromEntries(properties.map((item) => ([item.id, item])))

    const existingAccountQuery = {
        OR: accounts.map(item => ({
            number: item.number,
            unitName: item.unitName,
            unitType: item.unitType,
            property: { id: _.get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') },
        })),
    }
    const existingAccounts = await find('BillingAccount', {
        ...existingAccountQuery,
        context: { id: billingContextId },
    })
    const existingAccountsWithData = existingAccounts.map(account => ({ ...account, ...{ property: _.get(propertiesIndexById, account.property ) } } ))
    const accountsIndex = Object.fromEntries(existingAccountsWithData.map((account) => ([getBillingAccountKey(account), account])))

    const accountsToAdd = accounts.filter(((item) => !Reflect.has(accountsIndex, getBillingAccountKey(item))))

    const newAccounts = []
    for (const account of accountsToAdd) {

        const accountGQLInput = {
            ...account,
            context: { connect: { id: _.get(account, ['context', 'id']) } },
            property: { connect: { id: _.get(propertiesIndex[getBillingPropertyKey(account.property)], 'id' ) } },
        }

        const newAccount = await BillingAccount.create(context, accountGQLInput)
        newAccounts.push(newAccount)
    }

    const newAccountsWithData = newAccounts.map(item => ({
        ...item,
        property: _.get(propertiesIndexById, _.get(item, ['property', 'id'])),
    }))

    return [ ...newAccountsWithData, ...existingAccountsWithData ]
}

const syncBillingReceipts = async (context, receipts, { accounts, properties, billingContextId } ) => {

    const propertiesIndex = Object.fromEntries(properties.map((item) => ([getBillingPropertyKey(item), item])))
    const propertiesIndexById = Object.fromEntries(properties.map((item) => ([item.id, item])))

    const accountsIndex = Object.fromEntries(accounts.map((item) => ([getBillingAccountKey(item), item])))
    const accountsIndexById = Object.fromEntries(accounts.map((item) => ([item.id, item])))

    const existingReceiptsQuery = {
        OR: receipts.map(item => ({
            period: item.period,
            category: { id: _.get(item, ['category', 'id']) },
            property: { id: _.get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') },
            account: { id: _.get(accountsIndex[getBillingAccountKey(item.account)], 'id') },
        })),
    }
    const existingReceipts = await find('BillingReceipt', {
        ...existingReceiptsQuery,
        context: { id: billingContextId },
    })
    const existingReceiptsWithData = existingReceipts.map(receipt => ({
        ...receipt,
        ...{
            property: _.get(propertiesIndexById, _.get(receipt, ['property'] )),
            account: _.get(accountsIndexById, _.get(receipt, ['account'])),
            category: { id: _.get(receipt, ['category']) },
        },
    }))
    const receiptsIndex = Object.fromEntries(existingReceiptsWithData.map((receipt) => ([getBillingReceiptKey(receipt), receipt])))

    const receiptsToUpdate = []
    const receiptsToAdd = []
    const notChangedReceipts = []

    receipts.forEach((item) => {
        const receiptKey = getBillingReceiptKey(
            {
                ...item,
                ...{ recipient: { tin: item.tin, iec: item.iec, bic: item.bic, bankAccount: item.bankAccount } } },
        )

        const receiptExists = Reflect.has(receiptsIndex, receiptKey)

        if (!receiptExists) {
            receiptsToAdd.push(item)
        } else {
            const existingReceiptByKey = receiptsIndex[receiptKey]

            const b1 = new Big(existingReceiptByKey.toPay)
            const b2 = new Big(item.toPay)
            const shouldUpdateReceipt = !b1.eq(b2)

            if (shouldUpdateReceipt) {
                item.id = existingReceiptByKey.id
                receiptsToUpdate.push(item)
            } else {
                notChangedReceipts.push(item)
            }
        }
    })

    const newReceipts = []
    for (const item of receiptsToAdd) {
        
        item.category = { connect: { id: _.get(item, ['category', 'id']) } }
        item.context = { connect: { id: _.get(item, ['context', 'id']) } }

        item.property = { connect: { id: _.get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') } }
        item.account = { connect: { id: _.get(accountsIndex[getBillingAccountKey(item.account)], 'id') } }

        item.recipient = {
            tin: item.tin,
            iec: item.iec,
            bankAccount: item.bankAccount,
            bic: item.bic,
        }

        const cleanItem = _.omit(item, ['tin', 'iec', 'bic', 'bankAccount'])

        const newReceipt = await BillingReceipt.create(context, cleanItem)
        newReceipts.push(newReceipt)
    }

    const updatedReceipts = []
    for (const item of receiptsToUpdate) {

        const itemId = item.id

        item.category = { connect: { id: _.get(item, ['category', 'id']) } }
        item.context = { connect: { id: _.get(item, ['context', 'id']) } }

        item.property = { connect: { id: _.get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') } }
        item.account = { connect: { id: _.get(accountsIndex[getBillingAccountKey(item.account)], 'id') } }

        item.recipient = {
            tin: item.tin,
            iec: item.iec,
            bankAccount: item.bankAccount,
            bic: item.bic,
        }

        const cleanItem = _.omit(item, ['tin', 'iec', 'bic', 'bankAccount'])

        const updatableItem = _.omit(cleanItem, ['context', 'id'])

        const updatedReceipt = await BillingReceipt.update(context, itemId, updatableItem)
        updatedReceipts.push(updatedReceipt)
    }

    return { createdReceipts: newReceipts, updatedReceipts: updatedReceipts, notChangedReceipts: notChangedReceipts }
}

const RegisterBillingReceiptsService = new GQLCustomSchema('RegisterBillingReceiptsService', {
    types: [
        {
            access: true,
            type: 'input RegisterBillingReceiptInput ' +
                '{ ' +
                    'importId: String! ' +

                    'address: String! ' +

                    'accountNumber: String! ' +
                    'unitName: String! ' + // Should delete this!
                    'unitType: String! ' + // Should delete this!
                    'fullName: String ' +

                    'toPay: String! ' +
                    'toPayDetails: BillingReceiptServiceToPayDetailsFieldInput ' +
                    'services: BillingReceiptServiceFieldInput ' +
                    'period: String! ' +

                    'category: BillingCategoryWhereUniqueInput! ' +

                    'tin: String! ' +
                    'iec: String! ' + // Should delete this!
                    'bic: String! ' +
                    'bankAccount: String! ' +

                    'raw: JSON ' +
                '}',
        },
        {
            access: true,
            type: 'input RegisterBillingReceiptsInput { dv: Int!, sender: SenderFieldInput!, context: BillingIntegrationOrganizationContextWhereUniqueInput, receipts: [RegisterBillingReceiptInput!]! }',
        },
    ],
    
    mutations: [
        {
            access: access.canRegisterBillingReceipts,
            schema: 'registerBillingReceipts(data: RegisterBillingReceiptsInput!): [BillingReceipt]',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { context: billingContextInput, receipts: receiptsInput, dv, sender } } = args

                // Step 0:
                // Perform basic validations:
                if (receiptsInput.length > RECEIPTS_LIMIT) {
                    throw new GQLError(errors.RECEIPTS_LIMIT_HIT, context)
                }

                const { id: billingContextId } = billingContextInput
                const billingContext = await getById('BillingIntegrationOrganizationContext', billingContextId)
                if (!billingContextId || !billingContext) {
                    throw new GQLError(errors.BILLING_CONTEXT_NOT_FOUND, context)
                }

                // Step 1:
                // Parse properties, accounts and receipts from input
                const { propertyIndex, accountIndex, receiptIndex } = receiptsInput.reduce((index, receiptInput) => {
                    const {
                        importId,
                        address,
                        accountNumber,
                        unitName,
                        unitType,
                        category,
                        period,
                        services,
                        toPay,
                        toPayDetails,
                        tin,
                        iec,
                        bic,
                        bankAccount,
                        raw,
                    } = receiptInput

                    const propertyFromInput = { address }
                    const accountFromInput = { unitName, unitType, number: accountNumber, property: propertyFromInput }
                    const receiptFromInput = { category, period, property: propertyFromInput, account: accountFromInput, services, recipient: { tin, iec, bic, bankAccount } }

                    const propertyKey = getBillingPropertyKey( propertyFromInput )
                    const accountKey = getBillingAccountKey( accountFromInput )
                    const receiptKey = getBillingReceiptKey(receiptFromInput)

                    if (!index.propertyIndex[propertyKey]) {
                        index.propertyIndex[propertyKey] = {
                            dv: dv,
                            sender: sender,
                            globalId: propertyKey,
                            address: address,
                            raw: { dv: 1 },
                            importId: propertyKey,
                            context: { id: billingContext.id },
                            meta: { dv: 1 },
                        }
                    }
                    if (!index.accountIndex[accountKey]) {
                        index.accountIndex[accountKey] = {
                            dv: dv,
                            sender: sender,
                            context: { id: billingContext.id },
                            number: accountNumber,
                            importId: accountKey,
                            globalId: accountKey,
                            unitName,
                            unitType,
                            property: index.propertyIndex[propertyKey],
                            raw: { dv: 1 },
                            meta: { dv: 1 },
                        }
                    }
                    if (!index.receiptIndex[receiptKey]) {
                        index.receiptIndex[receiptKey] = {
                            dv: dv,
                            sender: sender,
                            context: { id: billingContextId },
                            account: index.accountIndex[accountKey],
                            property: index.propertyIndex[propertyKey],
                            period: period,
                            importId: importId,
                            category: { id: category.id },
                            toPay: toPay,
                            services: services,
                            toPayDetails: toPayDetails,
                            tin,
                            iec,
                            bic,
                            bankAccount,
                            raw: { ...{ dv: 1 }, ...raw },
                        }
                    }
                    return index
                }, { propertyIndex: {}, accountIndex: {}, receiptIndex: {} })

                // Step 2:
                // Sync billing properties
                const syncedProperties = await syncBillingProperties(context, Object.values(propertyIndex), { billingContextId })

                // Step 3:
                // Sync Billing Accounts
                const syncedAccounts = await syncBillingAccounts(context, Object.values(accountIndex), { properties: syncedProperties, billingContextId })

                // Step 4:
                // Sync billing receipts
                const { createdReceipts, updatedReceipts, notChangedReceipts } = await syncBillingReceipts(context, Object.values(receiptIndex), { accounts: syncedAccounts, properties: syncedProperties, billingContextId })

                return [ ...createdReceipts, ...updatedReceipts ]
            },
        },
    ],
    
})

module.exports = {
    RegisterBillingReceiptsService,
}
