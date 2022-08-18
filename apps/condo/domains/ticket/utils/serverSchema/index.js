/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')
const { generateServerUtils, execGqlWithoutAccess } = require('@condo/keystone/codegeneration/generate.server.utils')
const { Ticket: TicketGQL } = require('@condo/domains/ticket/gql')
const { TicketStatus: TicketStatusGQL } = require('@condo/domains/ticket/gql')
const { TicketChange: TicketChangeGQL } = require('@condo/domains/ticket/gql')
const { TicketFile: TicketFileGQL } = require('@condo/domains/ticket/gql')
const { TicketComment: TicketCommentGQL } = require('@condo/domains/ticket/gql')
const { TicketPlaceClassifier: TicketPlaceClassifierGQL } = require('@condo/domains/ticket/gql')
const { TicketCategoryClassifier: TicketCategoryClassifierGQL } = require('@condo/domains/ticket/gql')
const { TicketProblemClassifier: TicketProblemClassifierGQL } = require('@condo/domains/ticket/gql')
const { TicketClassifier: TicketClassifierGQL } = require('@condo/domains/ticket/gql')
const { ResidentTicket: ResidentTicketGQL } = require('@condo/domains/ticket/gql')
const { TicketSource: TicketSourceGQL } = require('@condo/domains/ticket/gql')
const { TicketFilterTemplate: TicketFilterTemplateGQL } = require('@condo/domains/ticket/gql')
const { PREDICT_TICKET_CLASSIFICATION_QUERY } = require('@condo/domains/ticket/gql')
const { TicketCommentFile: TicketCommentFileGQL } = require('@condo/domains/ticket/gql')
const { TicketCommentsTime: TicketCommentsTimeGQL } = require('@condo/domains/ticket/gql')
const { UserTicketCommentReadTime: UserTicketCommentReadTimeGQL } = require('@condo/domains/ticket/gql')
const { TicketPropertyHint: TicketPropertyHintGQL } = require('@condo/domains/ticket/gql')
const { TicketPropertyHintProperty: TicketPropertyHintPropertyGQL } = require('@condo/domains/ticket/gql')
const { TicketExportTask: TicketExportTaskGQL } = require('@condo/domains/ticket/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Ticket = generateServerUtils(TicketGQL)
const TicketStatus = generateServerUtils(TicketStatusGQL)
const TicketChange = generateServerUtils(TicketChangeGQL)
const TicketFile = generateServerUtils(TicketFileGQL)
const TicketComment = generateServerUtils(TicketCommentGQL)
const TicketSource = generateServerUtils(TicketSourceGQL)

const TicketPlaceClassifier = generateServerUtils(TicketPlaceClassifierGQL)
const TicketCategoryClassifier = generateServerUtils(TicketCategoryClassifierGQL)
const TicketProblemClassifier = generateServerUtils(TicketProblemClassifierGQL)
const TicketClassifier = generateServerUtils(TicketClassifierGQL)

const ResidentTicket = generateServerUtils(ResidentTicketGQL)

const TicketFilterTemplate = generateServerUtils(TicketFilterTemplateGQL)

async function predictTicketClassification (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.details) throw new Error('no data details')

    return await execGqlWithoutAccess(context, {
        query: PREDICT_TICKET_CLASSIFICATION_QUERY,
        variables: { data },
        errorMessage: '[error] Unable to predictTicketClassification',
        dataPath: 'obj',
    })
}


const TicketCommentFile = generateServerUtils(TicketCommentFileGQL)
const TicketCommentsTime = generateServerUtils(TicketCommentsTimeGQL)
const UserTicketCommentReadTime = generateServerUtils(UserTicketCommentReadTimeGQL)
const TicketPropertyHint = generateServerUtils(TicketPropertyHintGQL)
const TicketPropertyHintProperty = generateServerUtils(TicketPropertyHintPropertyGQL)
const TicketExportTask = generateServerUtils(TicketExportTaskGQL)
/* AUTOGENERATE MARKER <CONST> */

/**
 * Creates instance of loader that fetches all necessary relations of ticket
 * @param where
 * @param sortBy
 * @return GqlWithKnexLoadList
 */
const buildTicketsLoader = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const ticketStatusLoader = new GqlWithKnexLoadList({
        listKey: 'TicketStatus',
        fields: 'id type',
    })
    const statuses = await ticketStatusLoader.load()
    const statusIndexes = Object.fromEntries(statuses.map(status => ([status.type, status.id])))
    return new GqlWithKnexLoadList({
        listKey: 'Ticket',
        fields: 'id number unitName unitType sectionName sectionType floorName clientName clientPhone isEmergency isPaid isWarranty details createdAt updatedAt deadline deferredUntil reviewValue reviewComment statusReopenedCounter propertyAddress ',
        singleRelations: [
            ['User', 'createdBy', 'name'],
            ['User', 'operator', 'name'],
            ['User', 'executor', 'name'],
            ['User', 'assignee', 'name'],
            ['Contact', 'contact', 'name'],
            ['Organization', 'organization', 'name'],
            ['Property', 'property', 'deletedAt'],
            ['TicketStatus', 'status', 'type'],
            ['TicketSource', 'source', 'name'],
            ['TicketClassifier', 'classifier', 'id'],
        ],
        multipleRelations: [
            [
                (idx, knex) => knex.raw(`MAX(mr${idx}."createdAt") as "startedAt"`),
                idx => [`TicketChange as mr${idx}`, function () {
                    this.on(`mr${idx}.ticket`, 'mainModel.id').onIn(`mr${idx}.statusIdTo`, [statusIndexes.processing])
                }],
            ],
            [
                (idx, knex) => knex.raw(`MAX(mr${idx}."createdAt") as "completedAt"`),
                idx => [`TicketChange as mr${idx}`, function () {
                    this.on(`mr${idx}.ticket`, 'mainModel.id').onIn(`mr${idx}.statusIdTo`, [statusIndexes.completed])
                }],
            ],
            [
                (idx, knex) => knex.raw(`MAX(mr${idx}."createdAt") as "closedAt"`),
                idx => [`TicketChange as mr${idx}`, function () {
                    this.on(`mr${idx}.ticket`, 'mainModel.id').onIn(`mr${idx}.statusIdTo`, [statusIndexes.canceled, statusIndexes.closed])
                }],
            ],
        ],
        sortBy,
        where,
    })
}

const loadTicketCommentsForExcelExport = async ({ ticketIds = [], sortBy = ['createdAt_DESC'] }) => {
    const ticketCommentsLoader = new GqlWithKnexLoadList({
        listKey: 'TicketComment',
        fields: 'id type content createdAt',
        singleRelations: [
            ['User', 'user', 'name', 'userName'],
            ['User', 'user', 'type', 'userType'],
            ['Ticket', 'ticket', 'id'],
        ],
        multipleRelations: [
            [
                (idx, knex) => knex.raw(`COUNT(mr${idx}.id) as "TicketCommentFiles"`),
                idx => [`TicketCommentFile as mr${idx}`, `mr${idx}.ticketComment`, 'mainModel.id'],
            ],
        ],
        sortBy,
        where: {
            ticket: {
                id_in: ticketIds,
            },
        },
    })

    return await ticketCommentsLoader.load()
}

const loadClassifiersForExcelExport = async ({ classifierRuleIds = [] }) => {
    const ticketClassifiersLoader = new GqlWithKnexLoadList({
        listKey: 'TicketClassifier',
        fields: 'id category place problem',
        singleRelations: [
            ['TicketCategoryClassifier', 'category', 'name'],
            ['TicketProblemClassifier', 'problem', 'name'],
            ['TicketPlaceClassifier', 'place', 'name'],
        ],
        where: {
            id_in: classifierRuleIds,
        },
    })

    return await ticketClassifiersLoader.load()
}

module.exports = {
    Ticket,
    TicketStatus,
    TicketChange,
    TicketFile,
    TicketComment,
    TicketPlaceClassifier,
    TicketCategoryClassifier,
    TicketProblemClassifier,
    TicketClassifier,
    ResidentTicket,
    TicketSource,
    buildTicketsLoader,
    loadTicketCommentsForExcelExport,
    loadClassifiersForExcelExport,
    TicketFilterTemplate,
    predictTicketClassification,
    TicketCommentFile,
    TicketCommentsTime,
    UserTicketCommentReadTime,
    TicketPropertyHint,
    TicketPropertyHintProperty,
    TicketExportTask,
/* AUTOGENERATE MARKER <EXPORTS> */
}
