/**
 * Generated by `createschema acquiring.Recipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; bankAccount:Text; bankName?:Text; offsettingAccount?:Text; territoryCode?:Text; purpose?Text; name?:Text; isApproved:Checkbox; meta?:Json;'`
 */

const { Text, Checkbox } = require('@keystonejs/fields')

const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const access = require('@condo/domains/acquiring/access/Recipient')
const { DV_FIELD, SENDER_FIELD, IMPORT_ID_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')
const { validateTin } = require('@condo/domains/acquiring/utils/validate/tin.utils')
const { validateIec } = require('@condo/domains/acquiring/utils/validate/iec.utils')
const { validateBic } = require('@condo/domains/acquiring/utils/validate/bic.utils')
const { validateBankAccount } = require('@condo/domains/acquiring/utils/validate/bankAccount.utils')
const { getOrganizationByTin } = require('@condo/domains/common/utils/serverSideRecipientApi')

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
            validateInput: ({ resolvedData, addFieldValidationError }) => {
                const { bic } = resolvedData
                const { result, errors } = validateBic(bic)

                if ( !result ) {
                    addFieldValidationError(errors[0])
                }
            },
        },

        bankAccount: {
            schemaDoc: 'Number of bank account of this recipient',
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
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadRecipients,
        create: access.canManageRecipients,
        update: access.canManageRecipients,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, context, addValidationError }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
        resolveInput: async ({ operation, resolvedData }) => {
            // If recipients is being updated -> drop isApproved!
            if (operation === 'update' && !('isApproved' in resolvedData)) {
                resolvedData.isApproved = false
            }

            //console.log(await getOrganizationByTin('047102651'))

            // const {
            //     data: {
            //         kpp: iec, inn: tin, oktmo: territoryCode,
            //         name: {
            //             short_with_opf: organizationName,
            //         },
            //         address: {
            //             data: {
            //                 country_iso_code: organizationCountry,
            //                 timezone,
            //             },
            //         },
            //     },
            // } = await getOrganizationByTin('6670082480')
            // console.log(iec, timezone, territoryCode, tin, organizationCountry, organizationName)

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
