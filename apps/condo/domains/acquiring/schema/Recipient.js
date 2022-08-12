/**
 * Generated by `createschema acquiring.Recipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; bankAccount:Text; bankName?:Text; offsettingAccount?:Text; territoryCode?:Text; purpose?Text; name?:Text; isApproved:Checkbox; meta?:Json;'`
 */

const get = require('lodash/get')

const { Text, Checkbox } = require('@keystonejs/fields')
const { Json } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')

const access = require('@condo/domains/acquiring/access/Recipient')
const { DV_FIELD, SENDER_FIELD, IMPORT_ID_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const { validateTin } = require('@condo/domains/acquiring/utils/validate/tin.utils')
const { validateIec } = require('@condo/domains/acquiring/utils/validate/iec.utils')
const { validateBic } = require('@condo/domains/acquiring/utils/validate/bic.utils')
const { validateBankAccount } = require('@condo/domains/acquiring/utils/validate/bankAccount.utils')

const { getBankByBic } = require('@condo/domains/common/utils/serverSideRecipientApi')
const { Organization } = require('@condo/domains/organization/utils/serverSchema')

const Recipient = new GQLListSchema('Recipient', {
    schemaDoc: 'Organization\' recipient information: bank account, bic, and so on',
    labelResolver: item => item.tin,
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        importId: IMPORT_ID_FIELD,
        organization: ORGANIZATION_OWNED_FIELD,

        tin: {
            schemaDoc: 'Tax Identification Number',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError }) => {
                    const { tin } = resolvedData
                    const { result, errors } = validateTin(tin)

                    if ( !result ) {
                        addFieldValidationError(errors[0])
                    }
                },
            },
        },

        iec: {
            schemaDoc: 'Importer-Exporter Code',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError }) => {
                    const { iec } = resolvedData
                    const { result, errors } = validateIec(iec)

                    if ( !result ) {
                        addFieldValidationError(errors[0])
                    }
                },
            },
        },

        bic: {
            schemaDoc: 'Bank Identification Code',
            type: Text,
            isRequired: true,
            validateInput: async ({ existingItem, resolvedData, addFieldValidationError, context }) => {
                const newItem = { ...existingItem, ...resolvedData }
                const organizationId = get(newItem, 'organization')
                const [organization] = await Organization.getAll(context, { id: organizationId })

                const { bic } = resolvedData
                const { result, errors } = validateBic(bic, organization.country)

                if ( !result ) {
                    addFieldValidationError(errors[0])
                }
            },
        },

        bankAccount: {
            schemaDoc: 'Bank account number of this recipient',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError }) => {
                    const { bankAccount, bic } = resolvedData
                    const { result, errors } = validateBankAccount(bankAccount, bic)

                    if ( !result ) {
                        addFieldValidationError(errors[0])
                    }
                },
            },
        },

        bankName: {
            schemaDoc: 'Bank name',
            type: Text,
            isRequired: false,
        },

        offsettingAccount: {
            schemaDoc: 'Bank account',
            type: Text,
            isRequired: false,
        },

        territoryCode: {
            schemaDoc: 'Location code (Classifier of Territories of Municipal Units - OKTMO)',
            type: Text,
            isRequired: false,
        },

        name: {
            schemaDoc: 'Recipient name. The juristic name of the organization or the name given at creation',
            type: Text,
            isRequired: false,
        },

        isApproved: {
            schemaDoc: 'If set to True, then this recipient info is considered allowed and users are allowed to pay for receipts with this recipient',
            type: Checkbox,
            defaultValue: false,
            access: {
                read: true,
                create: access.canManageIsApprovedField,
                update: access.canManageIsApprovedField,
            },
        },

        meta: {
            schemaDoc: 'Structured metadata.',
            type: Json,
            isRequired: false,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadRecipients,
        create: access.canManageRecipients,
        update: access.canManageRecipients,
        delete: false,
        auth: true,
    },
    hooks: {
        resolveInput: async ({ operation, resolvedData, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }

            // If recipients is being updated -> drop isApproved!
            if (operation === 'update' && !('isApproved' in resolvedData)) {
                resolvedData.isApproved = false
            }

            if (!newItem.bankName || !newItem.offsettingAccount || !newItem.territoryCode) {
                const bankInfo = await getBankByBic(newItem.bic)

                resolvedData.bankName = newItem.bankName || get(bankInfo, 'value', '')
                resolvedData.offsettingAccount = newItem.offsettingAccount || get(bankInfo, ['data', 'correspondent_account'], '')
                resolvedData.territoryCode = newItem.territoryCode || get(bankInfo, ['data', 'address', 'data', 'oktmo'], '')

            }

            return resolvedData
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['tin', 'iec', 'bic', 'bankAccount'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'Recipient_unique_tin_iec_bic_bankAccount',
            },
        ],
    },
})

module.exports = {
    Recipient,
}
