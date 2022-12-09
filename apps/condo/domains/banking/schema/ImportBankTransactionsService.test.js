/**
 * Generated by `createservice banking.ImportBankTransactionsService`
 */

const path = require('path')

const dayjs = require('dayjs')
const { pick } = require('lodash')

const conf = require('@open-condo/config')
const { makeClient, makeLoggedInAdminClient, UploadingFile, UUID_RE, expectToThrowAuthenticationErrorToResult, expectToThrowGQLError, expectToThrowAccessDeniedErrorToResult,
} = require('@open-condo/keystone/test.utils')

const { BANK_INTEGRATION_IDS } = require('@condo/domains/banking/constants')
const { importBankTransactionsByTestClient, BankTransaction } = require('@condo/domains/banking/utils/testSchema')
const { createTestBankIntegrationContext, createTestBankAccount, BankAccount, BankIntegration } = require('@condo/domains/banking/utils/testSchema')
const { PARSED_TRANSACTIONS_TO_COMPARE } = require('@condo/domains/banking/utils/testSchema/assets/1CClientBankExchangeToKeystoneObjects')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')


const pathToCorrectFile = path.resolve(conf.PROJECT_ROOT, 'apps/condo/domains/banking/utils/testSchema/assets/1CClientBankExchange.txt')
const uploadingFile = new UploadingFile(pathToCorrectFile)

const pathToInvalidFile = path.resolve(conf.PROJECT_ROOT, 'apps/condo/domains/banking/utils/testSchema/assets/1CClientBankExchange-Invalid.txt')
const invalidUploadingFile = new UploadingFile(pathToInvalidFile)


let adminClient

const expectCorrectBankTransaction = (obj, transactionDataToCompare, organization, bankAccount, attrs) => {
    expect(obj.id).toMatch(UUID_RE)
    expect(obj.dv).toEqual(1)
    expect(obj.sender).toEqual(attrs.sender)
    expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(transactionDataToCompare.amount), 2)
    expect(obj.date).toEqual(dayjs(transactionDataToCompare.date).format('YYYY-MM-DD'))
    expect(obj).toMatchObject(pick(transactionDataToCompare, ['number', 'isOutcome', 'purpose', 'currencyCode']))
    expect(obj.importId).toEqual(transactionDataToCompare.number)
    expect(obj.importRemoteSystem).toEqual('1CClientBankExchange')
    expect(obj.organization.id).toEqual(organization.id)
    expect(obj.account.id).toEqual(bankAccount.id)
    expect(obj.integrationContext.id).toEqual(bankAccount.integrationContext.id)
}

describe('ImportBankTransactionsService', () => {
    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
    })

    it('creates BankAccount, BankIntegrationContext, BankTransaction and BankContractorAccount records', async () => {
        const userClient = await makeClientWithRegisteredOrganization()
        const organization = userClient.organization
        const payload = {
            file: uploadingFile,
            organizationId: organization.id,
        }
        const [result, attrs] = await importBankTransactionsByTestClient(userClient, payload)

        const createdBankAccount = await BankAccount.getOne(userClient, { id: result.bankAccount.id })
        expect(result.bankAccount).toEqual(createdBankAccount)
        expect(createdBankAccount).toBeDefined()
        expect(createdBankAccount.dv).toEqual(1)
        expect(createdBankAccount.sender).toEqual(attrs.sender)
        expect(createdBankAccount.id).toMatch(UUID_RE)
        expect(createdBankAccount).toMatchObject({
            number: '40702810801500116391',
            routingNumber: '044525999',
            meta: {
                amount: '135394.23',
                amountAt: '2022-10-26T21:00:00.000Z',
            },
        })

        const createdBankTransactions = await BankTransaction.getAll(userClient, {
            organization: { id: organization.id },
            account: { id: createdBankAccount.id },
        }, {
            sortBy: 'createdAt_ASC',
        })
        expect(createdBankTransactions).toHaveLength(4)
        expectCorrectBankTransaction(createdBankTransactions[0], PARSED_TRANSACTIONS_TO_COMPARE[0], organization, createdBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[1], PARSED_TRANSACTIONS_TO_COMPARE[1], organization, createdBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[2], PARSED_TRANSACTIONS_TO_COMPARE[2], organization, createdBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[3], PARSED_TRANSACTIONS_TO_COMPARE[3], organization, createdBankAccount, attrs)
    })

    it('reuses existing BankAccount and BankIntegrationContext when it has the same integration', async () => {
        const userClient = await makeClientWithRegisteredOrganization()
        const organization = userClient.organization
        const bankIntegration = await BankIntegration.getOne(adminClient, { id: BANK_INTEGRATION_IDS['1CClientBankExchange'] })
        const [bankIntegrationContext] = await createTestBankIntegrationContext(adminClient, bankIntegration, organization)
        const [existingBankAccount] = await createTestBankAccount(adminClient, organization, {
            number: '40702810801500116391',
            routingNumber: '044525999',
            integrationContext: { connect: { id: bankIntegrationContext.id } },
        })
        const payload = {
            file: uploadingFile,
            organizationId: organization.id,
        }
        const [result, attrs] = await importBankTransactionsByTestClient(userClient, payload)
        expect(result.bankAccount).toBeDefined()
        expect(result.bankAccount.id).toEqual(existingBankAccount.id)
        expect(result.bankAccount).toMatchObject({
            number: '40702810801500116391',
            routingNumber: '044525999',
            integrationContext: {
                id: bankIntegrationContext.id,
            },
            meta: {
                amount: '135394.23',
                amountAt: '2022-10-26T21:00:00.000Z',
            },
        })

        const createdBankTransactions = await BankTransaction.getAll(userClient, {
            organization: { id: organization.id },
            account: { id: existingBankAccount.id },
        }, {
            sortBy: 'createdAt_ASC',
        })
        expect(createdBankTransactions).toHaveLength(4)
        expectCorrectBankTransaction(createdBankTransactions[0], PARSED_TRANSACTIONS_TO_COMPARE[0], organization, existingBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[1], PARSED_TRANSACTIONS_TO_COMPARE[1], organization, existingBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[2], PARSED_TRANSACTIONS_TO_COMPARE[2], organization, existingBankAccount, attrs)
        expectCorrectBankTransaction(createdBankTransactions[3], PARSED_TRANSACTIONS_TO_COMPARE[3], organization, existingBankAccount, attrs)
    })

    it('throws error when another integration of different type exist', async () => {
        const userClient = await makeClientWithRegisteredOrganization()
        const organization = userClient.organization
        const bankIntegration = await BankIntegration.getOne(adminClient, { id: BANK_INTEGRATION_IDS.SBBOL })
        const [bankIntegrationContext] = await createTestBankIntegrationContext(adminClient, bankIntegration, organization)
        await createTestBankAccount(adminClient, organization, {
            number: '40702810801500116391',
            routingNumber: '044525999',
            integrationContext: { connect: { id: bankIntegrationContext.id } },
        })
        const payload = {
            file: uploadingFile,
            organizationId: organization.id,
        }
        await expectToThrowGQLError(async () => {
            await importBankTransactionsByTestClient(userClient, payload)
        }, {
            'code': 'BAD_USER_INPUT',
            'type': 'ANOTHER_INTEGRATION_IS_USED',
            'message': 'Another integration is used for this bank account, that fetches transactions in a different way. You cannot import transactions from file in this case',
            'messageForUser': 'api.banking.importBankTransactions.ANOTHER_INTEGRATION_IS_USED',
            'mutation': 'importBankTransactions',
            'variable': ['data', 'file'],
        }, 'result')
    })

    it('throws error when no integration is connected to bank account', async () => {
        const userClient = await makeClientWithRegisteredOrganization()
        const organization = userClient.organization
        const [existingBankAccount] = await createTestBankAccount(adminClient, organization, {
            number: '40702810801500116391',
            routingNumber: '044525999',
        })
        const payload = {
            file: uploadingFile,
            organizationId: organization.id,
        }
        await expectToThrowGQLError(async () => {
            await importBankTransactionsByTestClient(userClient, payload)
        }, {
            'code': 'BAD_USER_INPUT',
            'type': 'BANK_ACCOUNT_HAS_NO_INTEGRATION',
            'message': 'For this import operation was found bank account with id "${id}" and it does not have integration. It means that this bank account has been initially used for something different or something goes wrong. In this case it cannot be used to fetch data from file',
            'messageForUser': 'api.banking.importBankTransactions.BANK_ACCOUNT_HAS_NO_INTEGRATION',
            'messageInterpolation': {
                id: existingBankAccount.id,
            },
            'mutation': 'importBankTransactions',
            'variable': ['data', 'file'],
        }, 'result')
    })

    it('throws INVALID_VILE_FORMAT error in case of file parsing error', async () => {
        const userClient = await makeClientWithRegisteredOrganization()
        const organization = userClient.organization
        const payload = {
            file: invalidUploadingFile,
            organizationId: organization.id,
        }
        await expectToThrowGQLError(async () => {
            await importBankTransactionsByTestClient(userClient, payload)
        }, {
            'code': 'BAD_USER_INPUT',
            'type': 'INVALID_FILE_FORMAT',
            'message': 'Cannot parse uploaded file',
            'messageForUser': 'api.banking.importBankTransactions.INVALID_FILE_FORMAT',
            'messageInterpolation': {
                message: 'Invalid node "СекцияРасчСчет" at line 14',
            },
            'mutation': 'importBankTransactions',
            'variable': ['data', 'file'],
        }, 'result')
    })

    describe('access', () => {
        it('can be executed by admin', async () => {
            const userClient = await makeClientWithRegisteredOrganization()
            const organization = userClient.organization
            const payload = {
                file: uploadingFile,
                organizationId: organization.id,
            }
            const [result, attrs] = await importBankTransactionsByTestClient(userClient, payload)

            const createdBankAccount = await BankAccount.getOne(adminClient, { id: result.bankAccount.id })
            expect(result.bankAccount).toEqual(createdBankAccount)
        })

        it('cannot be executed by organization employee user without "canManageBankAccounts" permission', async () => {
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageBankAccounts: false,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const payload = {
                file: uploadingFile,
                organizationId: organization.id,
            }

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await importBankTransactionsByTestClient(userClient, payload)
            })
        })

        it('cannot be executed by anonymous', async () => {
            const anonymousClient = await makeClient()
            const userClient = await makeClientWithRegisteredOrganization()
            const organization = userClient.organization
            expect(userClient).toBeDefined()
            const payload = {
                file: uploadingFile,
                organizationId: organization.id,
            }
            await expectToThrowAuthenticationErrorToResult(async () => {
                await importBankTransactionsByTestClient(anonymousClient, payload)
            })
        })
    })
})