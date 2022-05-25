/**
 * This file is autogenerated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { Ticket } = require('./Ticket')
const { TicketReportService } = require('./TicketReportService')
const { TicketSource } = require('./TicketSource')
const { TicketStatus } = require('./TicketStatus')
const { TicketFile } = require('./TicketFile')
const { TicketChange } = require('./TicketChange')
const { TicketComment } = require('./TicketComment')
const { ExportTicketsService } = require('./ExportTicketsService')
const { TicketAnalyticsReportService } = require('./TicketAnalyticsReportService')
const { ShareTicketService } = require('./ShareTicketService')
const { TicketPlaceClassifier } = require('./TicketPlaceClassifier')
const { TicketCategoryClassifier } = require('./TicketCategoryClassifier')
const { TicketProblemClassifier } = require('./TicketProblemClassifier')
const { TicketClassifierRule } = require('./TicketClassifierRule')

const { CreateResidentTicketService } = require('./CreateResidentTicketService')
const { GetAllResidentTicketsService } = require('./GetAllResidentTicketsService')
const { UpdateResidentTicketService } = require('./UpdateResidentTicketService')
const { TicketFilterTemplate } = require('./TicketFilterTemplate')
const { PredictTicketClassificationService } = require('./PredictTicketClassificationService')
const { TicketCommentFile } = require('./TicketCommentFile')
const { TicketCommentsTime } = require('./TicketCommentsTime')
const { UserTicketCommentReadTime } = require('./UserTicketCommentReadTime')
const { TicketPropertyHint } = require('./TicketPropertyHint')
const { TicketPropertyHintProperty } = require('./TicketPropertyHintProperty')
const { ExportTicketTask } = require('./ExportTicketTask')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    Ticket,
    TicketReportService,
    TicketSource,
    TicketStatus,
    TicketFile,
    TicketChange,
    TicketComment,
    ExportTicketsService,
    TicketAnalyticsReportService,
    ShareTicketService,
    CreateResidentTicketService,
    GetAllResidentTicketsService,
    UpdateResidentTicketService,
    TicketPlaceClassifier,
    TicketCategoryClassifier,
    TicketProblemClassifier,
    TicketClassifierRule,
    TicketFilterTemplate,
    PredictTicketClassificationService,
    TicketCommentFile,
    TicketCommentsTime,
    UserTicketCommentReadTime,
    TicketPropertyHint,
    TicketPropertyHintProperty,
    ExportTicketTask,
/* AUTOGENERATE MARKER <EXPORTS> */
}
