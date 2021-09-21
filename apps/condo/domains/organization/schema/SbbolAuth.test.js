const { SbbolOrganization } = require('@condo/domains/organization/sbbol/sync')
const { SBBOL_IMPORT_NAME } = require('@condo/domains/organization/sbbol/common')
const faker = require('faker')
const { v4: uuid } = require('uuid')
const { INN_LENGTH } = require('@condo/domains/organization/constants/common')
const { getSchemaCtx } = require('@core/keystone/schema')
const { updateTestUser, User: UserAPI } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { updateTestOrganization, Organization: OrganizationAPI, OrganizationEmployee: OrganizationEmployeeAPI  } = require('@condo/domains/organization/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')

const EXAMPLE_USER_INFO = {
    sub: 'f164e8c81fa7b5cd43d5d03164cf74764b2402d6314c67daa0964d8e691fd543',
    iss: 'https://edupirfintech.sberbank.ru:9443',
    inn: '7784523718',
    orgJuridicalAddress: '121222, Россия, г.Москва, г. Москва, ул.Космонавтов, д.1, корп./стр.1, кв.1',
    orgFullName: 'Общество с ограниченной ответственностью ТО-Партнер-626-01"',
    OrgName: 'ООО "ТО-Партнер-626-01"',
    tbIdentCode: '38',
    userGuid: 'c429a86d-38fc-3ac3-e054-00144ffb59b5',
    individualExecutiveAgency: 0,
    terBank: 'Московский Банк Сбербанка РФ',
    userSignatureType: 'Единственная подпись',
    aud: '111286',
    userCryptoType: 'SMS',
    userGroups: 'Руководитель',
    summOfferSmartCredit: 0,
    orgLawFormShort: 'ООО',
    HashOrgId: '8c80ef870028888bc444c27ba90873619cc7a6c99febd89f0e9fee155219b752',
    offerSmartCredit: false,
    orgOgrn: '1137746216261',
    isIdentified: false,
    inquiryOrder: true,
    phone_number: '79057362611',
    orgLawForm: 'Общество с ограниченной ответственностью',
    email: 'Client_Test62611@test.ru',
}


const userInfo = () => {
    const inn = faker.datatype.number({
        min: Math.pow(10, INN_LENGTH - 1) + 1,
        max: Math.pow(10, INN_LENGTH) - 1,
    })
    return {
        ...EXAMPLE_USER_INFO,
        inn,
        phone_number: faker.phone.phoneNumber('+792########'),
        email: faker.internet.email(),
        HashOrgId: uuid(),
        userGuid: uuid(),
    }
}

const createSync = async (userInfo) => {
    const { keystone } = await getSchemaCtx('User')
    const Sync = new SbbolOrganization({ keystone, userInfo })
    await Sync.init()
    return Sync
}

describe('Sbbol sync scenarios', () => {
    describe('User not exists, Organization not exists', () => {
        it('should create User, Organization, Employee with role', async () => {
            const info = userInfo()
            const Sync = await createSync(info)
            expect(Sync.keystone.defaultAccess).toBeDefined()
            await Sync.syncUser()
            await Sync.syncOrganization()
            const admin = await makeLoggedInAdminClient()
            const [user] = await UserAPI.getAll(admin, { phone: info.phone_number })
            expect(user.id).toEqual(Sync.user.id)
            expect(user.importId).toEqual(info.userGuid)
            expect(user.importRemoteSystem).toEqual(SBBOL_IMPORT_NAME)
            const [organization] = await OrganizationAPI.getAll(admin, { id: Sync.organization.id })
            expect(organization.meta.inn).toEqual(info.inn)
            expect(organization.name).toEqual(info.OrgName)
            expect(organization.importRemoteSystem).toEqual(SBBOL_IMPORT_NAME)
            expect(organization.importId).toEqual(info.HashOrgId)
            const [employee] = await OrganizationEmployeeAPI.getAll(admin, {
                organization: { id: Sync.organization.id },
                user: { id: Sync.user.id },
            })
            expect(employee.role.name).toEqual('Administrator')
        })
    })
    describe('User exists Organization not exists', () => {
        it('should update Organization importId if User has Organization with a same tin', async () => {
            const info = userInfo()
            const client = await makeClientWithRegisteredOrganization()
            const admin = await makeLoggedInAdminClient()
            await updateTestUser(admin, client.user.id, {
                phone: info.phone_number,
                importId: info.userGuid,
                importRemoteSystem: SBBOL_IMPORT_NAME,
            })
            await updateTestOrganization(admin, client.organization.id, {
                meta: { ...client.organization.meta, inn: info.inn },
            })
            const Sync = await createSync(info)
            await Sync.syncUser()
            await Sync.syncOrganization()
            const [organization] = await OrganizationAPI.getAll(client, { id: client.organization.id })
            expect(organization.importRemoteSystem).toEqual(SBBOL_IMPORT_NAME)
            expect(organization.importId).toEqual(info.HashOrgId)
            const [user] = await UserAPI.getAll(client, { id: client.user.id })
            expect(user.importId).toEqual(info.userGuid)
            expect(user.importRemoteSystem).toEqual(SBBOL_IMPORT_NAME)
        })
        it('should create Organization and make user its employee', async () => {
            const info = userInfo()
            const client = await makeClientWithRegisteredOrganization()
            const admin = await makeLoggedInAdminClient()
            await updateTestUser(admin, client.user.id, {
                phone: info.phone_number,
                importId: info.userGuid,
                importRemoteSystem: SBBOL_IMPORT_NAME,
            })
            const Sync = await createSync(info)
            await Sync.syncUser()
            await Sync.syncOrganization()
            const [organization] = await OrganizationAPI.getAll(admin, {
                importId: info.HashOrgId,
                importRemoteSystem: SBBOL_IMPORT_NAME,
            })
            expect(organization.id).not.toEqual(client.organization.id)
            expect(organization.meta.inn).toEqual(info.inn)
            const [employee] = await OrganizationEmployeeAPI.getAll(admin, {
                organization: { id: Sync.organization.id },
                user: { id: Sync.user.id },
            })
            expect(employee.role.name).toEqual('Administrator')
        })
    })
    describe('User not exists Organization exists', () => {
        it('should create User and make him employee for the Organization', async () => {
            const info = userInfo()
            const client = await makeClientWithRegisteredOrganization()
            const admin = await makeLoggedInAdminClient()
            await updateTestOrganization(admin, client.organization.id, {
                meta: { ...client.organization.meta, inn: info.inn },
                importId: info.HashOrgId,
                importRemoteSystem: SBBOL_IMPORT_NAME,
            })
            const Sync = await createSync(info)
            await Sync.syncUser()
            await Sync.syncOrganization()
            const [employee] = await OrganizationEmployeeAPI.getAll(admin, {
                organization: { id: client.organization.id },
                user: { id_not: client.user.id },
            })
            expect(employee).toBeDefined()
            expect(employee.role.name).toEqual('Administrator')
        })
    })
})
