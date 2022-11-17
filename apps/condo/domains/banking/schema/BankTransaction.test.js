/**
 * Generated by `createschema banking.BankTransaction 'account:Relationship:BankAccount:CASCADE; contractorAccount:Relationship:BankContractorAccount:CASCADE; costItem?:Relationship:BankCostItem:SET_NULL; organization:Relationship:Organization:CASCADE; number:Text; date:CalendarDay; amount:Decimal; purpose:Text; dateWithdrawed:CalendarDay; dateReceived:CalendarDay; meta:Json; importId:Text; importRemoteSystem:Text;'`
 */

const { pick } = require('lodash')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowValidationFailureError,
} = require('@open-condo/keystone/test.utils')

const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')

const {
    BankTransaction,
    BankIntegration,
    createTestBankAccount,
    createTestBankContractorAccount,
    createTestBankTransaction,
    updateTestBankTransaction,
    createTestBankIntegrationContext,
} = require('@condo/domains/banking/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee, createTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const dayjs = require('dayjs')
const { BANK_INTEGRATION_IDS } = require('../constants')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')

let admin
let support
let anonymous
let bankIntegration

describe('BankTransaction', () => {
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        bankIntegration = await BankIntegration.getOne(admin, { id: BANK_INTEGRATION_IDS['1CClientBankExchange'] })
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(support, organization)
                const [obj, attrs] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                expect(obj.number).toEqual(attrs.number)
                expect(obj.date).toEqual(attrs.date)
                expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
                expect(obj.currencyCode).toEqual(attrs.currencyCode)
                expect(obj.purpose).toEqual(attrs.purpose)
                expect(obj.dateWithdrawed).toEqual(attrs.dateWithdrawed)
                expect(obj.importId).toEqual(attrs.importId)
                expect(obj.importRemoteSystem).toEqual(attrs.importRemoteSystem)
                expect(obj.meta).toEqual(attrs.meta)
                expect(obj.integrationContext).toMatchObject(pick(integrationContext, ['id', 'enabled']))
            })

            test('support can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(support, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(support, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user can if it is an employee of organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                const [obj, attrs] = await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            })

            test('user cannot if it is an employee of organization without "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user cannot if it is an employee of another organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user can if it is an employee of linked organization with "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, childOrganization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)

                const [obj, attrs] = await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, childOrganization)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            })

            test('user cannot if it is an employee of linked organization without "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, childOrganization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})

                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, childOrganization)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankTransaction(anonymous, account, contractorAccount, integrationContext, organization)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const [obj, attrs] = await updateTestBankTransaction(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('support can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(support, objCreated.id)
                })
            })

            test('user can if it is an employee of organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const [obj, attrs] = await updateTestBankTransaction(userClient, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user cannot if it is an employee of organization without "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('user cannot if it is an employee of another organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('user can if it is an employee of linked organization with "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, childOrganization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                const [obj, attrs] = await updateTestBankTransaction(userClient, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user cannot if it is an employee of linked organization without "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, childOrganization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankTransaction(anonymous, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(anonymous, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)
                const objs = await BankTransaction.getAll(admin, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('user can if it is an employee of organization', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('user cannot if it is an employee of another organization', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(0)
            })

            test('user can if it is an employee of linked organization', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, childOrganization)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [property] = await createTestProperty(admin, organization)
                const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, property, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankTransaction.getAll(anonymous, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const [organization] = await createTestOrganization(admin)
            const [property] = await createTestProperty(admin, organization)
            const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, property, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(support, organization)
            const [obj] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
        })

        it('cannot have both "dateWithdrawed" and "dateReceived" filled fields', async () => {
            const [organization] = await createTestOrganization(admin)
            const [property] = await createTestProperty(admin, organization)
            const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, property, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(support, organization)

            await expectToThrowValidationFailureError( async () => {
                await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                    dateWithdrawed: dayjs().format('YYYY-MM-DD'),
                    dateReceived: dayjs().format('YYYY-MM-DD'),
                })
            }, 'Cannot have both "dateWithdrawed" and "dateReceived" filled fields')
        })

        it('cannot have both blank fields "dateWithdrawed" and "dateReceived"', async () => {
            const [organization] = await createTestOrganization(admin)
            const [property] = await createTestProperty(admin, organization)
            const [integrationContext] = await createTestBankIntegrationContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, property, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(support, organization)

            await expectToThrowValidationFailureError( async () => {
                await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                    dateWithdrawed: null,
                    dateReceived: null,
                })
            }, 'Cannot have no values for both "dateWithdrawed" and "dateReceived" fields')
        })
    })
})