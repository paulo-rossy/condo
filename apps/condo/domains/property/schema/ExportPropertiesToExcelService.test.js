/**
 * Generated by `createservice property.ExportPropertiesToExcelService --type queries`
 */

const { makeClient } = require('@core/keystone/test.utils')
const { exportPropertiesToExcelByTestClient } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationError,
} = require('@condo/domains/common/utils/testSchema')

// TODO(zuch): remove after tests will have obs configuration in .env
const isObsConfigured = () => {
    const S3Config = {
        ...(process.env.SBERCLOUD_OBS_CONFIG ? JSON.parse(process.env.SBERCLOUD_OBS_CONFIG) : {}),
    }
    return !!S3Config.bucket
}

describe('ExportPropertiesToExcelService', () => {
    describe('User', () => {
        it('can get properties export from selected organization', async () => {
            if (isObsConfigured()) {
                const client = await makeClientWithProperty()
                const [{ status, linkToFile }] = await exportPropertiesToExcelByTestClient(client, {
                    where: { organization: { id: client.organization.id } },
                    sortBy: 'id_ASC',
                })
                expect(status).toBe('ok')
                expect(linkToFile).not.toHaveLength(0)
            }
        })

        it('can not get properties export from another organization', async () => {
            const client1 = await makeClientWithProperty()
            const client2 = await makeClientWithProperty()
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await exportPropertiesToExcelByTestClient(client1, {
                    where: { organization: { id: client2.organization.id } },
                    sortBy: 'id_ASC',
                })
            })
        })
    })

    describe('Anonymous', () => {
        it('can not get tickets export', async () => {
            const client1 = await makeClient()
            const client2 = await makeClientWithProperty()
            await expectToThrowAuthenticationError(async () => {
                await exportPropertiesToExcelByTestClient(client1, {
                    where: { organization: { id: client2.organization.id } },
                    sortBy: 'id_ASC',
                })
            }, 'result')
        })
    })
})
