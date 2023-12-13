/**
 * Generated by `createservice billing.RegisterBillingReceiptsService --type mutations`
 */
const { faker  } = require('@faker-js/faker/locale/ru')
const Big = require('big.js')
const dayjs = require('dayjs')

const {
    catchErrorFrom,
} = require('@open-condo/keystone/test.utils')
const { makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')

const { BILLING_ACCOUNT_OWNER_TYPE_COMPANY, BILLING_ACCOUNT_OWNER_TYPE_PERSON } = require('@condo/domains/billing/constants/constants')
const {
    ERRORS,
} = require('@condo/domains/billing/constants/registerBillingReceiptService')
const { registerBillingReceiptsByTestClient } = require('@condo/domains/billing/utils/testSchema')
const {
    createTestBillingIntegration,
    createTestBillingIntegrationOrganizationContext,
    BillingReceipt,
    BillingAccount,
    BillingRecipient,
    generateServicesData,
} = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingCategory } = require('@condo/domains/billing/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')

const createAddressWithUnit = () => `${faker.address.cityName()} ${faker.address.streetAddress(true)}`

const createJSONReceipt = (extra = {}) => {
    const [month, year] = dayjs().add(-1, 'month').format('MM-YYYY').split('-').map(Number)
    return Object.fromEntries(Object.entries({
        importId: faker.datatype.uuid(),
        address: createAddressWithUnit(),
        accountNumber: randomNumber(10).toString(),
        toPay: faker.finance.amount(-100, 5000),
        month,
        year,
        services: generateServicesData(faker.datatype.number({ min: 3, max: 5 })),
        ...createRecipient(),
        ...extra,
    }).filter(([, value]) => !!value))
}

const createRecipient = (extra = {}) => {
    return {
        tin: faker.random.numeric(8),
        routingNumber: faker.random.numeric(5),
        bankAccount: faker.random.numeric(12),
        ...extra,
    }
}

const createValidELS = () => `${randomNumber(2)}БГ${randomNumber(6)}`

const randomNumber = (numDigits) => {
    const min = 10 ** (numDigits - 1)
    const max = 10 ** numDigits - 1
    return faker.datatype.number({ min, max })
}

describe('RegisterBillingReceiptsService', () => {

    const clients = {}
    let integration = {}

    beforeAll(async () => {
        clients.admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(clients.admin)
        const [billingIntegration] = await createTestBillingIntegration(clients.admin)
        const [billingContext] = await createTestBillingIntegrationOrganizationContext(clients.admin, organization, billingIntegration)
        integration = { organization, billingIntegration, billingContext }
    })

    describe('PeriodResolver',  () => {
        test('should return an error on a wrong year format', async () => {
            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createJSONReceipt({ year: 23 })],
                })
            }, (e) => {
                expect(e.errors[0].extensions.code).toEqual(ERRORS.WRONG_YEAR.code)
                expect(e.errors[0].extensions.type).toEqual(ERRORS.WRONG_YEAR.type)
            })
        })
        test('should return an error on a wrong month', async () => {
            await catchErrorFrom(async () => {
                await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createJSONReceipt({ month: 13 })],
                })
            }, (e) => {
                expect(e.errors[0].extensions.code).toEqual(ERRORS.WRONG_MONTH.code)
                expect(e.errors[0].extensions.type).toEqual(ERRORS.WRONG_MONTH.type)
            })
        })
    })

    describe('RecipientResolver', () => {
        test('Should create approved recipient on TIN matched', async () => {
            const recipientInput = createRecipient({ tin: integration.organization.tin })
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt(recipientInput)],
            })
            const recipient = await BillingRecipient.getOne(clients.admin, { bankAccount: recipientInput.bankAccount, context: { id: integration.billingContext.id } } )
            expect(recipient.isApproved).toEqual(true)
        })
        test('Should create not approved recipient on TIN  mismatch', async () => {
            const recipientInput = createRecipient({ tin: integration.organization.tin + '0' })
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt(recipientInput)],
            })
            const recipient = await BillingRecipient.getOne(clients.admin, { bankAccount: recipientInput.bankAccount, context: { id: integration.billingContext.id } } )
            expect(recipient.isApproved).toEqual(false)
        })
        test('Should not modify isApproved if support user remove this flag', async () => {
            const recipientInput = createRecipient({ bankAccount: faker.random.numeric(12), tin: integration.organization.tin  })
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt(recipientInput)],
            })
            const recipient = await BillingRecipient.getOne(clients.admin, { bankAccount: recipientInput.bankAccount, context: { id: integration.billingContext.id } } )
            expect(recipient.isApproved).toBeTruthy()
            await BillingRecipient.update(clients.admin, recipient.id, { isApproved: false })

            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt(recipientInput)],
            })
            const recipientAfterAnotherReceiptCreation = await BillingRecipient.getOne(clients.admin, { bankAccount: recipientInput.bankAccount, context: { id: integration.billingContext.id } } )
            expect(recipientAfterAnotherReceiptCreation.isApproved).toBeFalsy()
        })
        test('Should fill deprecated recipient field as we do not remove it still', async () => {
            const recipientInput = createRecipient({ })
            const [receipts] = await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt(recipientInput)],
            })
            const { recipient } = receipts[0]
            expect(recipient).toHaveProperty('name')
            expect(recipient).toHaveProperty('bankAccount')
            expect(recipient).toHaveProperty('bic')
            expect(recipient).toHaveProperty('tin')
        })
    })

    describe('AccountResolver', () => {
        test('Can exist 2 accounts with same number but different houses', async () => {
            const accountNumber = randomNumber(10).toString()
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountNumber }), createJSONReceipt({ accountNumber })],
            })
            const accounts = await BillingAccount.getAll(clients.admin, { number: accountNumber, context: { id: integration.billingContext.id } } )
            expect(accounts).toHaveLength(2)
        })
        test('Will set information from accountMeta to BillingAccount', async () => {
            const accountMeta = {
                globalId: createValidELS(),
                importId: randomNumber(10).toString(),
                fullName: faker.name.fullName(),
                isClosed: true,
            }
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta })],
            })
            const account = await BillingAccount.getOne(clients.admin, { importId: accountMeta.importId, context: { id: integration.billingContext.id } } )
            expect(account.fullName).toEqual(accountMeta.fullName)
            expect(account.importId).toEqual(accountMeta.importId)
            expect(account.globalId).toEqual(accountMeta.globalId)
            expect(account.isClosed).toEqual(accountMeta.isClosed)
            expect(account.ownerType).toEqual(BILLING_ACCOUNT_OWNER_TYPE_PERSON)
            const companyAccountMeta = {
                globalId: createValidELS() + '0',
                importId: randomNumber(10).toString(),
                fullName: faker.lorem.sentence(),
                isClosed: false,
            }
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta: companyAccountMeta })],
            })
            const companyAccount = await BillingAccount.getOne(clients.admin, { importId: companyAccountMeta.importId, context: { id: integration.billingContext.id } } )
            expect(companyAccount.fullName).toEqual(companyAccountMeta.fullName)
            expect(companyAccount.importId).toEqual(companyAccountMeta.importId)
            expect(companyAccount.globalId).toBeNull()
            expect(companyAccount.isClosed).toEqual(companyAccountMeta.isClosed)
            expect(companyAccount.ownerType).toEqual(BILLING_ACCOUNT_OWNER_TYPE_COMPANY)
        })
        test('It will not create another account on address change if importId is the same', async () => {
            const importId = randomNumber(50).toString()
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta: { importId } })],
            })
            const accounts = await BillingAccount.getAll(clients.admin, { importId, context: { id: integration.billingContext.id } } )
            expect(accounts).toHaveLength(1)
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta: { importId } })],
            })
            expect(accounts).toHaveLength(1)
        })
        test('isPerson validation "company" ownerType test', async () => {
            const importId = randomNumber(50).toString()
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta: { importId, fullName: 'ИП Фамилия' } })],
            })
            const accounts = await BillingAccount.getAll(clients.admin, { importId, context: { id: integration.billingContext.id } } )

            expect(accounts[0].ownerType).toEqual(BILLING_ACCOUNT_OWNER_TYPE_COMPANY)
        })
        test('isPerson validation "person" ownerType test', async () => {
            const importId = randomNumber(50).toString()
            await registerBillingReceiptsByTestClient(clients.admin, {
                context: { id: integration.billingContext.id },
                receipts: [createJSONReceipt({ accountMeta: { importId, fullName: 'Фамилияоао Имя' } })],
            })
            const accounts = await BillingAccount.getAll(clients.admin, { importId, context: { id: integration.billingContext.id } } )

            expect(accounts[0].ownerType).toEqual(BILLING_ACCOUNT_OWNER_TYPE_PERSON)
        })
    })

    describe('ReceiptResolver', () => {
        describe('Do not create new receipt on: ', () => {
            test('[importId]. Address change (was resolved wrong and then fixed)', async () => {
                const wrongAddress = createAddressWithUnit()
                const receiptWithWrongAddress = createJSONReceipt({ address: wrongAddress })
                await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [receiptWithWrongAddress],
                })
                const createdReceipt = await BillingReceipt.getOne(clients.admin, { importId: receiptWithWrongAddress.importId, context: { id: integration.billingContext.id } } )
                const wrongHouseAddress = createdReceipt.property.address
                const correctAddress = createAddressWithUnit()
                const receiptWithCorrectAddress = { ...receiptWithWrongAddress, address: correctAddress }
                await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [receiptWithCorrectAddress],
                })
                const updatedReceipt = await BillingReceipt.getOne(clients.admin, { importId: receiptWithCorrectAddress.importId, context: { id: integration.billingContext.id } } )
                const correctHouseAddress = updatedReceipt.property.address
                expect(updatedReceipt.property.address).not.toEqual(wrongHouseAddress)
                expect(updatedReceipt.property.address).toEqual(correctHouseAddress)
                expect(updatedReceipt.account.property.address).toEqual(correctHouseAddress)
                expect(createdReceipt.account.id).toEqual(updatedReceipt.account.id)
            })
            test('[all] Category change (first load without services, then added services)', async () => {
                const name = faker.lorem.sentence(3)
                const serviceName = faker.lorem.sentence(2)
                await createTestBillingCategory(clients.admin, { name, serviceNames: [serviceName] })
                const createInput = createJSONReceipt({ importId: null, services: null })
                const [[createdReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createInput],
                })
                const [[updatedReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [{ ...createInput, services: [{ name: serviceName, toPay: '0' }] }],
                })
                expect(createdReceipt.category.id).not.toEqual(updatedReceipt.category.id)
                expect(createdReceipt.id).toEqual(updatedReceipt.id)
            })
            test('[all] Recipient change do not creates new receipt', async () => {
                const wrongRecipient = createRecipient()
                const correctRecipient = createRecipient()
                const createInput = createJSONReceipt({ importId: null, ...wrongRecipient })
                const [[createdReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createInput],
                })
                const [[updatedReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [{ ...createInput, ...correctRecipient }],
                })
                expect(createdReceipt.receiver.id).not.toEqual(updatedReceipt.receiver.id)
                expect(createdReceipt.id).toEqual(updatedReceipt.id)
            })
            test('[all] Services change updates services in receipt', async () => {
                const createServices = generateServicesData(3, '1000')
                const createInput = createJSONReceipt({ services: createServices })
                const [[createdReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createInput],
                })
                const updateServices = generateServicesData(4, '1000')
                const updateInput = createJSONReceipt({ ...createInput, services: updateServices })
                const [[updatedReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [updateInput],
                })
                expect(createdReceipt.id).toEqual(updatedReceipt.id)
                expect(createdReceipt.services).toHaveLength(3)
                expect(updatedReceipt.services).toHaveLength(4)
                expect(updatedReceipt.services.map(({ id, name, toPay }) => ({ id, name, toPay }) )).toEqual(updateServices.map(({ id, name, toPay }) => ({ id, name, toPay }) ))
            })
        })
        describe('Check receipt output', () => {
            test('related fields are created', async () => {
                const createInput = createJSONReceipt()
                const [[createdReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                    context: { id: integration.billingContext.id },
                    receipts: [createInput],
                })
                expect(createdReceipt.property.id).toBeDefined()
                expect(createdReceipt.account.id).toBeDefined()
                expect(createdReceipt.receiver.id).toBeDefined()
                expect(createdReceipt.context.id).toBeDefined()
            })
        })
        describe('Resolvers tests', () => {
            describe('receiptResolver', () => {
                test('Update Receipt toPay field', async () => {
                    const originalToPayValue = Big(faker.finance.amount(-100, 5000)).toFixed(2)
                    const updatedToPayValue = Big(originalToPayValue).add(1000).toFixed(2)
                    const createInput = createJSONReceipt({ toPay: originalToPayValue })
                    const updateInput = { ...createInput, toPay: updatedToPayValue }
                    const [[createdReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                        context: { id: integration.billingContext.id },
                        receipts: [createInput],
                    })
                    const [[updatedReceipt]] = await registerBillingReceiptsByTestClient(clients.admin, {
                        context: { id: integration.billingContext.id },
                        receipts: [updateInput],
                    })
                    expect(createdReceipt.id).toEqual(updatedReceipt.id)
                    expect(Big(updatedReceipt.toPay).toFixed(2)).toEqual(updatedToPayValue)
                })
            })

        })
    })

})
