/**
 * Generated by `createschema ticket.UserFavoriteTicket 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE;'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, waitFor } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@open-condo/keystone/test.utils')

const { UserFavoriteTicket, createTestUserFavoriteTicket, updateTestUserFavoriteTicket } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')

describe('UserFavoriteTicket', () => {
    let adminClient
    let supportClient
    let userClient
    let anonymousClient

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymousClient = await makeClient()
    })

    describe('Create', () => {

    })

    describe('Read', () => {

    })

    describe('Update', () => {

    })

    describe('Soft delete', () => {

    })
})
