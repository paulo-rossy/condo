/**
 * Generated by `createservice billing.RegisterBillingReceiptFileService --type mutations`
 */
const { readFileSync } = require('fs')

const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')

const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult, catchErrorFrom } = require('@open-condo/keystone/test.utils')

const { REGISTER_BILLING_RECEIPT_FILE_SKIPPED_STATUS, REGISTER_BILLING_RECEIPT_FILE_CREATED_STATUS, REGISTER_BILLING_RECEIPT_FILE_UPDATED_STATUS } = require('@condo/domains/billing/constants')
const { registerBillingReceiptFileByTestClient, PUBLIC_FILE } = require('@condo/domains/billing/utils/testSchema')
const { BillingReceiptFile } = require('@condo/domains/billing/utils/testSchema')
const {
    TestUtils,
    BillingTestMixin,
} = require('@condo/domains/billing/utils/testSchema/testUtils')

describe('RegisterBillingReceiptFileService', () => {

    const utils = new TestUtils([BillingTestMixin])

    beforeAll(async () => {
        await utils.init()
    })

    describe('Permissions check', () => {
        test('anonymous: can not execute', async () => {
            await expectToThrowAuthenticationErrorToResult(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.anonymous)
            })
        })
        test('user: can not execute', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.user)
            })
        })
        test('employee: can not execute', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.employee.billing)
            })
        })
        test('support: can not execute', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.support)
            })
        })
        test('service user: can execute', async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { id: receipt.id },
            }
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.service, payload)
            expect(data).toHaveProperty('id')
            expect(data).toHaveProperty('status')
        })
        test('admin: can execute', async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { id: receipt.id },
            }
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            expect(data).toHaveProperty('id')
            expect(data).toHaveProperty('status')
        })
    })

    describe('Basic logic', () => {
        test('Will create new billing receipt file if old one was deleted', async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { id: receipt.id },
            }
            const [dataBeforeDelete] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            await BillingReceiptFile.softDelete(utils.clients.admin, dataBeforeDelete.id)
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            expect(data.status).toEqual(REGISTER_BILLING_RECEIPT_FILE_CREATED_STATUS)
        })
        test('Will create billing receipt file for matching receipt by id', async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { id: receipt.id },
            }
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            const receiptFile = await BillingReceiptFile.getOne(utils.clients.admin, { id: data.id })
            expect(receiptFile.receipt.id).toEqual(receipt.id)
        })
        test('Will create billing receipt file for matching receipt by importId', async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { importId: receipt.importId },
            }
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            const receiptFile = await BillingReceiptFile.getOne(utils.clients.admin, { id: data.id })
            expect(receiptFile.receipt.id).toEqual(receipt.id)
        })
        test(`Will send status ${REGISTER_BILLING_RECEIPT_FILE_CREATED_STATUS} if new file was registered`, async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { importId: receipt.importId },
            }
            const [data] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            expect(data.status).toEqual(REGISTER_BILLING_RECEIPT_FILE_CREATED_STATUS)
        })
        test(`Will send status ${REGISTER_BILLING_RECEIPT_FILE_SKIPPED_STATUS} if the same file was send`, async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { importId: receipt.importId },
            }
            const [dataCreated] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            const [dataUpdated] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            expect(dataCreated.id).toEqual(dataUpdated.id)
            expect(dataUpdated.status).toEqual(REGISTER_BILLING_RECEIPT_FILE_SKIPPED_STATUS)
        })
        test(`Will send status ${REGISTER_BILLING_RECEIPT_FILE_UPDATED_STATUS} if new file was send`, async () => {
            const [[receipt]] = await utils.createReceipts()
            const payload = {
                context: { id: receipt.context.id },
                receipt: { importId: receipt.importId },
            }
            const [dataCreated] = await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            const [dataUpdated] = await registerBillingReceiptFileByTestClient(utils.clients.admin, {
                ...payload,
                base64EncodedPDF: readFileSync(PUBLIC_FILE).toString('base64'),
            })
            expect(dataCreated.id).toEqual(dataUpdated.id)
            expect(dataUpdated.status).toEqual(REGISTER_BILLING_RECEIPT_FILE_UPDATED_STATUS)
        })
    })

    describe('Check custom gql errors', () => {
        test('Will throw an error for multiple receipts found', async () => {
            const period = dayjs().format('YYYY-MM-01')
            const [year, month] = period.split('-').map(Number)
            await utils.createReceipts([
                utils.createJSONReceipt({ month, year }),
                utils.createJSONReceipt({ month, year }),
            ])
            const payload = {
                context: { id: utils.billingContext.id },
                receipt: { period },
            }
            await catchErrorFrom(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            }, ({ errors: [error] }) => {
                expect(error.message).toEqual('More then one receipt found for receipt file')
            })
        })
        test('Will throw an error for no receipts found', async () => {
            const payload = {
                context: { id: utils.billingContext.id },
                receipt: { id: faker.datatype.uuid() },
            }
            await catchErrorFrom(async () => {
                await registerBillingReceiptFileByTestClient(utils.clients.admin, payload)
            }, ({ errors: [error] }) => {
                expect(error.message).toEqual('There are no receipts to connect to this receipt file')
            })
        })
    })

})