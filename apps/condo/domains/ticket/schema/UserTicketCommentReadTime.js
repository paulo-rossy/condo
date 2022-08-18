/**
 * Generated by `createschema ticket.UserTicketCommentReadTime 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE; readResidentCommentAt:DateTimeUtc;'`
 */

const { Relationship, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const access = require('@condo/domains/ticket/access/UserTicketCommentReadTime')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')


const UserTicketCommentReadTime = new GQLListSchema('UserTicketCommentReadTime', {
    schemaDoc: 'Time when a comment from a resident was last read by a specific user in a specific ticket',
    fields: {
        user: {
            schemaDoc: 'The user who read the comment',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        ticket: {
            schemaDoc: 'Ticket in which the user read the comment',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        readCommentAt: {
            schemaDoc: 'Time when the last comment was last read by the user',
            type: DateTimeUtc,
        },

        readResidentCommentAt: {
            schemaDoc: 'Time when the last comment from a resident was last read by the user',
            type: DateTimeUtc,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'ticket'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'unique_user_and_ticket',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadUserTicketCommentReadTimes,
        create: access.canManageUserTicketCommentReadTimes,
        update: access.canManageUserTicketCommentReadTimes,
        delete: false,
        auth: true,
    },
})

module.exports = {
    UserTicketCommentReadTime,
}
