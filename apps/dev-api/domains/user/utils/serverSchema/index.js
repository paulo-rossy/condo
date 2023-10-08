/**
 * Generated by `createschema user.User 'name:Text;password:Text;phone:Text;email:Text'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { User: UserGQL } = require('@dev-api/domains/user/gql')
const { ConfirmPhoneAction: ConfirmPhoneActionGQL } = require('@dev-api/domains/user/gql')
const { REGISTER_NEW_USER_MUTATION } = require('@dev-api/domains/user/gql')
const { AUTHENTICATE_USER_WITH_PHONE_AND_PASSWORD_MUTATION } = require('@dev-api/domains/user/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const User = generateServerUtils(UserGQL)
const ConfirmPhoneAction = generateServerUtils(ConfirmPhoneActionGQL)

async function registerNewUser (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_NEW_USER_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerNewUser',
        dataPath: 'obj',
    })
}

async function authenticateUserWithPhoneAndPassword (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: AUTHENTICATE_USER_WITH_PHONE_AND_PASSWORD_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to authenticateUserWithPhoneAndPassword',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    User,
    ConfirmPhoneAction,
    registerNewUser,
    authenticateUserWithPhoneAndPassword,
/* AUTOGENERATE MARKER <EXPORTS> */
}
