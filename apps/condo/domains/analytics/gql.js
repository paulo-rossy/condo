/**
 * Generated by `createschema analytics.ExternalReport 'type:Select:metabase; title:Text; description?:Text; meta?:Json'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')


const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const EXTERNAL_REPORT_FIELDS = `{ type title description isHidden organization { id } meta ${COMMON_FIELDS} }`
const ExternalReport = generateGqlQueries('ExternalReport', EXTERNAL_REPORT_FIELDS)

const GET_EXTERNAL_REPORT_IFRAME_URL_QUERY = gql`
    query getExternalReportIframeUrl ($data: GetExternalReportIframeUrlInput!) {
        result: getExternalReportIframeUrl(data: $data) { title iframeUrl }
    }
`

const GET_OVERVIEW_DASHBOARD_MUTATION = gql`
    query getOverviewDashboard ($data: GetOverviewDashboardInput!) {
        result: getOverviewDashboard(data: $data) { 
            overview { 
                ticketByDay {
                    tickets {
                        count
                        dayGroup
                        status
                    }
                }
                ticketByProperty {
                    tickets {
                        count
                        property
                        status
                    }
                }
                ticketByExecutor {
                    tickets {
                        count
                        executor
                        status
                    }
                }
                ticketByCategory {
                    tickets {
                        categoryClassifier
                        count
                        status
                    }
                }
                ticketQualityControlValue {
                    tickets {
                        count
                        dayGroup
                        qualityControlValue
                    }
                    translations {
                        key
                        value
                    }
                }
                property {
                    sum
                }
                payment {
                    payments {
                        dayGroup
                        count
                        createdBy
                        sum
                    }
                    sum
                }
                resident {
                    residents {
                        count
                        address
                    }
                }
                receipt {
                    receipts {
                        count
                        dayGroup
                        sum
                    }
                    sum
                }
                incident {
                    count
                }
            } 
        }
    }
`

/* AUTOGENERATE MARKER <CONST> */

const GET_TICKET_WIDGET_REPORT_DATA = gql`
    query getWidgetData ($data: TicketReportWidgetInput!) {
        result: ticketReportWidgetData(data: $data) { data { statusName, currentValue, growth, statusType } }
    }
`

const TICKET_ANALYTICS_REPORT_QUERY = gql`
    query ticketAnalyticsReport ($data: TicketAnalyticsReportInput!) {
        result: ticketAnalyticsReport(data: $data) { groups { count status property dayGroup categoryClassifier executor assignee } ticketLabels { color label } }
    }
`
const EXPORT_TICKET_ANALYTICS_TO_EXCEL = gql`
    query exportTicketAnalyticsToExcel ($data: ExportTicketAnalyticsToExcelInput!) {
        result: exportTicketAnalyticsToExcel(data: $data) { link }
    }
`

module.exports = {
    ExternalReport,
    GET_TICKET_WIDGET_REPORT_DATA,
    TICKET_ANALYTICS_REPORT_QUERY,
    EXPORT_TICKET_ANALYTICS_TO_EXCEL,
    GET_EXTERNAL_REPORT_IFRAME_URL_QUERY,
    GET_OVERVIEW_DASHBOARD_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
