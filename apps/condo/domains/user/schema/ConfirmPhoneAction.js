/**
 * Generated by `createschema user.ConfirmPhoneAction 'phone:Text;token:Text;smsCode:Integer;smsCodeRequestedAt:DateTimeUtc;smsCodeExpiresAt:DateTimeUtc;retries:Integer;isPhoneVerified:Checkbox;requestedAt:DateTimeUtc;expiresAt:DateTimeUtc;completedAt:DateTimeUtc;'`
 */
const { Text, Integer, Checkbox, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, uuided, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/user/access/ConfirmPhoneAction')
const { normalizePhone } = require('@condo/domains/common/utils/phone')

const {
    SMS_CODE_LENGTH,
} = require('@condo/domains/user/constants/common')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')

const ConfirmPhoneAction = new GQLListSchema('ConfirmPhoneAction', {
    schemaDoc: 'User confirm phone actions is used before registration starts',
    fields: {
        phone: {
            schemaDoc: 'Phone. In international E.164 format without spaces',
            type: Text,
            kmigratorOptions: { null: false, unique: false },
            isRequired: true,
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    if (resolvedData['phone']) {
                        return normalizePhone(resolvedData['phone'])
                    }
                },
            },
        },
        token: {
            schemaDoc: 'Unique token to complete confirmation',
            type: Text,
            isUnique: true,
            isRequired: true,
        },
        smsCode: {
            schemaDoc: 'Last sms code sent to user',
            type: Integer,
            length: SMS_CODE_LENGTH,
        },
        smsCodeRequestedAt: {
            schemaDoc: 'Time when sms code was requested',
            type: DateTimeUtc,
            isRequired: true,
        },
        smsCodeExpiresAt: {
            schemaDoc: 'Time when sms code becomes not valid',
            type: DateTimeUtc,
            isRequired: true,
        },
        retries: {
            schemaDoc: 'Number of times sms code input from user failed',
            type: Integer,
            defaultValue: 0,
        },
        isPhoneVerified: {
            schemaDoc: 'Phone verification flag. User verify phone by access to secret sms message',
            type: Checkbox,
            defaultValue: false,
        },
        requestedAt: {
            schemaDoc: 'DateTime when confirm phone action was started',
            type: DateTimeUtc,
            isRequired: true,
        },
        expiresAt: {
            schemaDoc: 'When confirm phone action becomes invalid',
            type: DateTimeUtc,
            isRequired: true,
        },
        completedAt: {
            schemaDoc: 'When confirm phone action was completed',
            type: DateTimeUtc,
            isRequired: false,
        },

    },
    plugins: [uuided(), softDeleted(), historical(), dvAndSender()],
    access: {
        read: access.canReadConfirmPhoneActions,
        create: access.canManageConfirmPhoneActions,
        update: access.canManageConfirmPhoneActions,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ConfirmPhoneAction,
}
