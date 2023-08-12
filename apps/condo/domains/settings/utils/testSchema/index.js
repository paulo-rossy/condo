/**
 * Generated by `createschema settings.MobileFeatureConfig 'organization:Relationship:Organization:CASCADE; emergencyPhone:Text; commonPhone:Text; onlyGreaterThanPreviousMeterReadingIsEnabled:Checkbox; meta:Json; ticketSubmittingIsEnabled:Checkbox'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')

const { MobileFeatureConfig: MobileFeatureConfigGQL } = require('@condo/domains/settings/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const MobileFeatureConfig = generateGQLTestUtils(MobileFeatureConfigGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestMobileFeatureConfig (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        commonPhone: faker.phone.number('+7922#######'),
        ticketSubmittingIsDisabled: false,
        onlyGreaterThanPreviousMeterReadingIsEnabled: false,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await MobileFeatureConfig.create(client, attrs)
    return [obj, attrs]
}

async function updateTestMobileFeatureConfig (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }


    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await MobileFeatureConfig.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    MobileFeatureConfig, createTestMobileFeatureConfig, updateTestMobileFeatureConfig,
/* AUTOGENERATE MARKER <EXPORTS> */
}
