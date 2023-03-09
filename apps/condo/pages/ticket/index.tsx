/** @jsx jsx */
import { DiffOutlined, FilterFilled, CloseOutlined } from '@ant-design/icons'
import { SortTicketsBy, Ticket as ITicket } from '@app/condo/schema'
import { jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { Col, Row, Typography } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import { Gutter } from 'antd/lib/grid/row'
import { TableRowSelection } from 'antd/lib/table/interface'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import isString from 'lodash/isString'
import Head from 'next/head'
import { NextRouter, useRouter } from 'next/router'
import { TableComponents } from 'rc-table/lib/interface'
import React, { CSSProperties, Key, useCallback, useMemo, useState } from 'react'

import { useDeepCompareEffect } from '@open-condo/codegen/utils/useDeepCompareEffect'
import { useFeatureFlags } from '@open-condo/featureflags/FeatureFlagsContext'
import { useAuth } from '@open-condo/next/auth'
import { useIntl } from '@open-condo/next/intl'

import ActionBar from '@condo/domains/common/components/ActionBar'
import Checkbox from '@condo/domains/common/components/antd/Checkbox'
import Input from '@condo/domains/common/components/antd/Input'
import { Button } from '@condo/domains/common/components/Button'
import { PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import { hasFeature } from '@condo/domains/common/components/containers/FeatureFlag'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { EmptyListView } from '@condo/domains/common/components/EmptyListView'
import { ImportWrapper } from '@condo/domains/common/components/Import/Index'
import { DEFAULT_PAGE_SIZE, Table, TableRecord } from '@condo/domains/common/components/Table/Index'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useTracking } from '@condo/domains/common/components/TrackingContext'
import { EXCEL } from '@condo/domains/common/constants/export'
import { TICKET_IMPORT } from '@condo/domains/common/constants/featureflags'
import {
    DEFAULT_RECORDS_LIMIT_FOR_IMPORT,
    EXTENDED_RECORDS_LIMIT_FOR_IMPORT,
} from '@condo/domains/common/constants/import'
import { fontSizes } from '@condo/domains/common/constants/style'
import {
    MultipleFilterContextProvider,
    FiltersTooltip,
    useMultipleFiltersModal,
} from '@condo/domains/common/hooks/useMultipleFiltersModal'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { updateQuery } from '@condo/domains/common/utils/helpers'
import { getPageIndexFromOffset, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { MAX_TICKET_BLANKS_EXPORT } from '@condo/domains/ticket/constants/export'
import { useTicketVisibility } from '@condo/domains/ticket/contexts/TicketVisibilityContext'
import { useBooleanAttributesSearch } from '@condo/domains/ticket/hooks/useBooleanAttributesSearch'
import { useFiltersTooltipData } from '@condo/domains/ticket/hooks/useFiltersTooltipData'
import { useImporterFunctions } from '@condo/domains/ticket/hooks/useImporterFunctions'
import { useTableColumns } from '@condo/domains/ticket/hooks/useTableColumns'
import { useTicketExportToExcelTask } from '@condo/domains/ticket/hooks/useTicketExportToExcelTask'
import { useTicketExportToPdfTask } from '@condo/domains/ticket/hooks/useTicketExportToPdfTask'
import { useTicketTableFilters } from '@condo/domains/ticket/hooks/useTicketTableFilters'
import { Ticket, TicketFilterTemplate } from '@condo/domains/ticket/utils/clientSchema'
import { IFilters } from '@condo/domains/ticket/utils/helpers'

interface ITicketIndexPage extends React.FC {
    headerAction?: JSX.Element
    requiredAccess?: React.FC
}

const PAGE_HEADER_TITLE_STYLES: CSSProperties = { margin: 0 }
const ROW_GUTTER: [Gutter, Gutter] = [0, 40]
const TAP_BAR_ROW_GUTTER: [Gutter, Gutter] = [0, 20]
const CHECKBOX_STYLE: CSSProperties = { paddingLeft: '0px', fontSize: fontSizes.content }
const TOP_BAR_FIRST_COLUMN_GUTTER: [Gutter, Gutter] = [40, 20]
const BUTTON_WRAPPER_ROW_GUTTER: [Gutter, Gutter] = [10, 0]
const DEBOUNCE_TIMEOUT = 400

const StyledTable = styled(Table)`
  .ant-checkbox-input {
    width: 50px;
    height: calc(100% + 32px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: red;
  }
  .ant-table-scroll-horizontal .ant-checkbox-input {
    width: 40px;
  }
  .number-column {
    padding-left: 0;
  }
`

const getInitialSelectedTicketKeys = (router: NextRouter) => {
    if ('selectedTicketIds' in router.query && isString(router.query.selectedTicketIds)) {
        try {
            return JSON.parse(router.query.selectedTicketIds as string)
        } catch (error) {
            console.warn('Failed to parse property value "selectedTicketIds"', error)
            return []
        }
    }
    return []
}

const TicketTable = ({
    sortBy,
    total,
    tickets,
    columns,
    filters,
    loading,
    ticketsWithFiltersCount,
    searchTicketsQuery,
}) => {
    const intl = useIntl()
    const CancelSelectedTicketLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.CancelSelectedTicket' })
    const CountSelectedTicketLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.CountSelectedTicket' })

    const { getTrackingWrappedCallback } = useTracking()
    const timeZone = intl.formatters.getDateTimeFormat().resolvedOptions().timeZone

    const auth = useAuth() as { user: { id: string } }
    const user = get(auth, 'user')

    const router = useRouter()

    const tooltipData = useFiltersTooltipData()

    const [selectedTicketKeys, setSelectedTicketKeys] = useState<Key[]>(() => getInitialSelectedTicketKeys(router))

    const changeQuery = useMemo(() => debounce(async (router: NextRouter, selectedTicketKeys: React.Key[]) => {
        await updateQuery(router, { newParameters: { selectedTicketIds: selectedTicketKeys } }, { routerAction: 'replace', resetOldParameters: false })
    }, DEBOUNCE_TIMEOUT), [])

    const updateSelectedTicketKeys = useCallback((selectedTicketKeys: Key[]) => {
        setSelectedTicketKeys(selectedTicketKeys)
        changeQuery(router, selectedTicketKeys)
    }, [changeQuery, router])

    const selectedRowKeysByPage = useMemo(() => {
        return tickets.filter(ticket => selectedTicketKeys.includes(ticket.id)).map(tickets => tickets.id)
    }, [selectedTicketKeys, tickets])

    const isSelectedAllRowsByPage = !loading && selectedRowKeysByPage.length > 0 && selectedRowKeysByPage.length === tickets.length
    const isSelectedSomeRowsByPage = !loading && selectedRowKeysByPage.length > 0 && selectedRowKeysByPage.length < tickets.length

    const selectedOneTicketId = useMemo(() => {
        if (selectedTicketKeys.length !== 1) return undefined
        return String(selectedTicketKeys[0])
    }, [selectedTicketKeys])

    const { TicketsExportToXlsxButton: TicketsExportToXlsxButton } = useTicketExportToExcelTask({
        where: searchTicketsQuery,
        sortBy,
        format: EXCEL,
        locale: intl.locale,
        timeZone,
        user: auth.user,
    })

    const { TicketBlanksExportToPdfModal, TicketBlanksExportToPdfButton } = useTicketExportToPdfTask({
        ticketId: selectedOneTicketId,
        where: {
            ...searchTicketsQuery,
            'id_in': selectedTicketKeys as string[],
        },
        sortBy,
        user,
        timeZone,
        locale: intl.locale,
        eventNamePrefix: 'TicketIndex',
    })

    const handleRowAction = useCallback((record) => {
        return {
            onClick: async () => {
                await router.push(`/ticket/${record.id}/`)
            },
        }
    }, [router])

    const handleResetSelectedTickets = useCallback(() => {
        updateSelectedTicketKeys([])
    }, [updateSelectedTicketKeys])

    const handleSelectAllRowsByPage = useCallback((e: CheckboxChangeEvent) => {
        const checked = e.target.checked
        if (checked) {
            const newSelectedTicketKeys = tickets
                .filter(ticket => !selectedRowKeysByPage.includes(ticket.id))
                .map(ticket => ticket.id)
            updateSelectedTicketKeys([...selectedTicketKeys, ...newSelectedTicketKeys])
        } else {
            updateSelectedTicketKeys(selectedTicketKeys.filter(key => !selectedRowKeysByPage.includes(key)))
        }
    }, [tickets, updateSelectedTicketKeys, selectedTicketKeys, selectedRowKeysByPage])

    const handleSelectRow: (record: ITicket, checked: boolean) => void = useCallback((record, checked) => {
        const selectedKey = record.id
        if (checked) {
            updateSelectedTicketKeys([...selectedTicketKeys, selectedKey])
        } else {
            updateSelectedTicketKeys(selectedTicketKeys.filter(key => selectedKey !== key))
        }
    }, [selectedTicketKeys, updateSelectedTicketKeys])

    const handleSelectRowWithTracking = useMemo(
        () => getTrackingWrappedCallback('TicketTableCheckboxSelectRow', null, handleSelectRow),
        [getTrackingWrappedCallback, handleSelectRow])

    const rowSelection: TableRowSelection<ITicket> = useMemo(() => ({
        selectedRowKeys: selectedRowKeysByPage,
        fixed: true,
        onSelect: handleSelectRowWithTracking,
        columnTitle: (
            <Checkbox
                checked={isSelectedAllRowsByPage}
                indeterminate={isSelectedSomeRowsByPage}
                onChange={handleSelectAllRowsByPage}
                eventName='TicketTableCheckboxSelectAll'
            />
        ),
    }), [handleSelectAllRowsByPage, handleSelectRowWithTracking, isSelectedAllRowsByPage, isSelectedSomeRowsByPage, selectedRowKeysByPage])

    const tableComponents: TableComponents<TableRecord> = useMemo(() => ({
        body: {
            row: (props) => (
                <FiltersTooltip
                    filters={filters}
                    tooltipData={tooltipData}
                    total={total}
                    tickets={tickets}
                    {...props}
                />
            ),
        },
    }), [tooltipData, filters, tickets, total])

    const TicketTableContent = useMemo(() => (
        <Col span={24}>
            <StyledTable
                totalRows={total}
                loading={loading}
                dataSource={loading ? null : tickets}
                columns={columns}
                onRow={handleRowAction}
                components={tableComponents}
                data-cy='ticket__table'
                rowSelection={rowSelection}
                sticky
            />
        </Col>
    ), [columns, handleRowAction, loading, rowSelection, tableComponents, tickets, total])

    useDeepCompareEffect(() => {
        if (total === null) return
        setSelectedTicketKeys([])
    }, [filters, sortBy])

    return (
        <>
            {TicketTableContent}
            <ActionBar hidden={loading || ticketsWithFiltersCount === 0}>
                {selectedTicketKeys.length > 0 && (
                    <Typography.Text strong>
                        {CountSelectedTicketLabel}: {selectedTicketKeys.length}
                    </Typography.Text>
                )}
                {selectedTicketKeys.length > 0 && (
                    <TicketBlanksExportToPdfButton disabled={selectedTicketKeys.length > MAX_TICKET_BLANKS_EXPORT} />
                )}
                {selectedTicketKeys.length < 1 && <TicketsExportToXlsxButton />}
                {selectedTicketKeys.length > 0 && (
                    <Button
                        secondary
                        type='sberBlack'
                        children={CancelSelectedTicketLabel}
                        onClick={handleResetSelectedTickets}
                        icon={<CloseOutlined />}
                    />
                )}
            </ActionBar>
            {TicketBlanksExportToPdfModal}
        </>
    )
}

const TicketsTableContainer = ({
    filterMetas,
    sortBy,
    searchTicketsQuery,
    useTableColumns,
    baseQueryLoading,
}) => {
    const { count: ticketsWithFiltersCount } = Ticket.useCount({ where: searchTicketsQuery })

    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    const {
        loading: isTicketsFetching,
        count: total,
        objs: tickets,
        refetch,
    } = Ticket.useObjects({
        sortBy,
        where: searchTicketsQuery,
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    })

    const [isRefetching, setIsRefetching] = useState(false)

    const { columns, loading: columnsLoading } = useTableColumns(filterMetas, tickets, refetch, isRefetching, setIsRefetching)

    const loading = (isTicketsFetching || columnsLoading || baseQueryLoading) && !isRefetching
    
    return (
        <TicketTable
            filters={filters}
            total={total}
            tickets={tickets}
            loading={loading}
            columns={columns}
            ticketsWithFiltersCount={ticketsWithFiltersCount}
            searchTicketsQuery={searchTicketsQuery}
            sortBy={sortBy}
        />
    )
}

const SORTABLE_PROPERTIES = ['number', 'status', 'order', 'details', 'property', 'unitName', 'assignee', 'executor', 'createdAt', 'clientName']
const TICKETS_DEFAULT_SORT_BY = ['order_ASC', 'createdAt_DESC']
const ATTRIBUTE_NAMES_To_FILTERS = ['isEmergency', 'isRegular', 'isWarranty', 'statusReopenedCounter', 'isPaid']
const CHECKBOX_WRAPPER_GUTTERS: [Gutter, Gutter] = [8, 16]
const DETAILED_LOGGING = ['status', 'source', 'attributes', 'reviewValue', 'unitType', 'contactIsNull']

const FiltersContainer = ({ TicketImportButton, filterMetas }) => {
    const intl = useIntl()
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const FiltersButtonLabel = intl.formatMessage({ id: 'FiltersLabel' })
    const EmergenciesLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.EmergenciesLabel' })
    const RegularLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.RegularLabel' })
    const WarrantiesLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.WarrantiesLabel' })
    const ReturnedLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.ReturnedLabel' })
    const PaidLabel = intl.formatMessage({ id: 'pages.condo.ticket.index.PaidLabel' })

    const router = useRouter()
    const { filters } = parseQuery(router.query)

    const reduceNonEmpty = (cnt, filter) => cnt + Number((typeof filters[filter] === 'string' || Array.isArray(filters[filter])) && filters[filter].length > 0)
    const appliedFiltersCount = Object.keys(filters).reduce(reduceNonEmpty, 0)

    const [search, changeSearch, handleResetSearch] = useSearch<IFilters>()
    const [attributes, handleChangeAttribute, handleResetAllAttributes, handleChangeAllAttributes] = useBooleanAttributesSearch(ATTRIBUTE_NAMES_To_FILTERS)
    const { isEmergency: emergency, isRegular: regular, isWarranty: warranty, statusReopenedCounter: returned, isPaid: paid } = attributes

    const handleAttributeCheckboxChange = useCallback((attributeName: string) => (e: CheckboxChangeEvent) => {
        const isChecked = get(e, ['target', 'checked'])
        handleChangeAttribute(isChecked, attributeName)
    }, [handleChangeAttribute])

    const handleResetFilters = useCallback(() => {
        handleResetAllAttributes()
        handleResetSearch()
    }, [handleResetAllAttributes, handleResetSearch])

    const { MultipleFiltersModal, ResetFiltersModalButton, setIsMultipleFiltersModalVisible } = useMultipleFiltersModal(
        filterMetas, TicketFilterTemplate, handleResetFilters, handleChangeAllAttributes, 'Ticket', DETAILED_LOGGING
    )

    const handleOpenMultipleFilter = useCallback(() => {
        setIsMultipleFiltersModalVisible(true)
    }, [setIsMultipleFiltersModalVisible])

    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])

    return (
        <>
            <TableFiltersContainer>
                <Row justify='end' gutter={TAP_BAR_ROW_GUTTER}>
                    <Col flex='auto'>
                        <Row
                            gutter={TOP_BAR_FIRST_COLUMN_GUTTER}
                            align='middle'
                            justify='start'
                        >
                            <Col xs={24} md={8}>
                                <Input
                                    placeholder={SearchPlaceholder}
                                    onChange={handleSearchChange}
                                    value={search}
                                    allowClear={true}
                                />
                            </Col>
                            <Col xs={24} md={16}>
                                <Row gutter={CHECKBOX_WRAPPER_GUTTERS}>
                                    <Col>
                                        <Checkbox
                                            onChange={handleAttributeCheckboxChange('isRegular')}
                                            checked={regular}
                                            style={CHECKBOX_STYLE}
                                            eventName='TicketFilterCheckboxRegular'
                                            data-cy='ticket__filter-isRegular'
                                        >
                                            {RegularLabel}
                                        </Checkbox>
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            onChange={handleAttributeCheckboxChange('isEmergency')}
                                            checked={emergency}
                                            style={CHECKBOX_STYLE}
                                            eventName='TicketFilterCheckboxEmergency'
                                            data-cy='ticket__filter-isEmergency'
                                        >
                                            {EmergenciesLabel}
                                        </Checkbox>
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            onChange={handleAttributeCheckboxChange('isPaid')}
                                            checked={paid}
                                            style={CHECKBOX_STYLE}
                                            eventName='TicketFilterCheckboxPaid'
                                            data-cy='ticket__filter-isPaid'
                                        >
                                            {PaidLabel}
                                        </Checkbox>
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            onChange={handleAttributeCheckboxChange('isWarranty')}
                                            checked={warranty}
                                            style={CHECKBOX_STYLE}
                                            eventName='TicketFilterCheckboxWarranty'
                                            data-cy='ticket__filter-isWarranty'
                                        >
                                            {WarrantiesLabel}
                                        </Checkbox>
                                    </Col>
                                    <Col>
                                        <Checkbox
                                            onChange={handleAttributeCheckboxChange('statusReopenedCounter')}
                                            checked={returned}
                                            style={CHECKBOX_STYLE}
                                            eventName='TicketFilterCheckboxReturned'
                                            data-cy='ticket__filter-isReturned'
                                        >
                                            {ReturnedLabel}
                                        </Checkbox>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Row justify='end' align='middle'>
                            {
                                appliedFiltersCount > 0 ? (
                                    <Col>
                                        <ResetFiltersModalButton />
                                    </Col>
                                ) : null
                            }
                            <Col>
                                <Row gutter={BUTTON_WRAPPER_ROW_GUTTER}>
                                    <Col>
                                        {TicketImportButton}
                                    </Col>
                                    <Col>
                                        <Button
                                            secondary
                                            type='sberPrimary'
                                            onClick={handleOpenMultipleFilter}
                                            data-cy='ticket__filters-button'
                                        >
                                            <FilterFilled/>
                                            {FiltersButtonLabel}
                                            {appliedFiltersCount > 0 ? ` (${appliedFiltersCount})` : null}
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </TableFiltersContainer>
            <MultipleFiltersModal />
        </>
    )
}

export const TicketsPageContent = ({
    baseTicketsQuery,
    filterMetas,
    sortableProperties,
    useTableColumns,
    showImport = false,
    baseQueryLoading = false,
}): JSX.Element => {
    const intl = useIntl()
    const EmptyListLabel = intl.formatMessage({ id: 'ticket.EmptyList.header' })
    const EmptyListMessage = intl.formatMessage({ id: 'ticket.EmptyList.title' })
    const CreateTicket = intl.formatMessage({ id: 'CreateTicket' })
    const TicketsMessage = intl.formatMessage({ id: 'global.section.tickets' })
    const TicketReadingObjectsNameManyGenitiveMessage = intl.formatMessage({ id: 'pages.condo.ticket.import.TicketReading.objectsName.many.genitive' })
    const ServerErrorMsg = intl.formatMessage({ id: 'ServerError' })

    const router = useRouter()
    const { filters, sorters } = parseQuery(router.query)
    const { filtersToWhere, sortersToSortBy } = useQueryMappers(filterMetas, sortableProperties)
    const searchTicketsQuery = useMemo(() => ({ ...baseTicketsQuery,  ...filtersToWhere(filters), ...{ deletedAt: null } }),
        [baseTicketsQuery, filters, filtersToWhere])
    const sortBy = sortersToSortBy(sorters, TICKETS_DEFAULT_SORT_BY) as SortTicketsBy[]

    const {
        count: ticketsWithoutFiltersCount,
        loading: ticketsWithoutFiltersCountLoading,
        error,
    } = Ticket.useCount({ where: baseTicketsQuery })

    const { useFlag } = useFeatureFlags()
    const isTicketImportFeatureEnabled = useFlag(TICKET_IMPORT)
    const [columns, ticketNormalizer, ticketValidator, ticketCreator] = useImporterFunctions()
    const loading = baseQueryLoading || ticketsWithoutFiltersCountLoading

    const TicketImportButton = useMemo(() => {
        return showImport && isTicketImportFeatureEnabled && (
            <ImportWrapper
                accessCheck={isTicketImportFeatureEnabled}
                domainTranslate={TicketReadingObjectsNameManyGenitiveMessage}
                columns={columns}
                objectsName={TicketsMessage}
                onFinish={undefined}
                rowValidator={ticketValidator}
                rowNormalizer={ticketNormalizer}
                objectCreator={ticketCreator}
                exampleTemplateLink='/ticket-import-example.xlsx'
                maxTableLength={
                    hasFeature('bigger_limit_for_import')
                        ? EXTENDED_RECORDS_LIMIT_FOR_IMPORT
                        : DEFAULT_RECORDS_LIMIT_FOR_IMPORT
                }
            >
                <Button
                    type='sberPrimary'
                    icon={<DiffOutlined/>}
                    secondary
                />
            </ImportWrapper>
        )
    }, [TicketReadingObjectsNameManyGenitiveMessage, TicketsMessage, columns, isTicketImportFeatureEnabled, showImport, ticketCreator, ticketNormalizer, ticketValidator])

    if (loading || error) {
        const errorToPrint = error ? ServerErrorMsg : null
        return <LoadingOrErrorPage loading={loading} error={errorToPrint}/>
    }

    if (ticketsWithoutFiltersCount === 0) {
        return (
            <EmptyListView
                label={EmptyListLabel}
                message={EmptyListMessage}
                createRoute='/ticket/create'
                createLabel={CreateTicket}
                button={TicketImportButton}
            />
        )
    }

    return (
        <Row gutter={ROW_GUTTER} align='middle' justify='center'>
            <Col span={24}>
                <FiltersContainer
                    TicketImportButton={TicketImportButton}
                    filterMetas={filterMetas}
                />
            </Col>
            <TicketsTableContainer
                useTableColumns={useTableColumns}
                filterMetas={filterMetas}
                sortBy={sortBy}
                searchTicketsQuery={searchTicketsQuery}
                baseQueryLoading={baseQueryLoading || ticketsWithoutFiltersCountLoading}
            />
        </Row>
    )
}

const TicketsPage: ITicketIndexPage = () => {
    const intl = useIntl()
    const PageTitleMessage = intl.formatMessage({ id: 'pages.condo.ticket.index.PageTitle' })

    const filterMetas = useTicketTableFilters()

    const { ticketFilterQuery, ticketFilterQueryLoading } = useTicketVisibility()

    return (
        <>
            <Head>
                <title>{PageTitleMessage}</title>
            </Head>
            <PageWrapper>
                <PageHeader
                    title={<Typography.Title style={PAGE_HEADER_TITLE_STYLES}>{PageTitleMessage}</Typography.Title>}
                />
                <TablePageContent>
                    <MultipleFilterContextProvider>
                        <TicketsPageContent
                            useTableColumns={useTableColumns}
                            baseTicketsQuery={ticketFilterQuery}
                            baseQueryLoading={ticketFilterQueryLoading}
                            filterMetas={filterMetas}
                            sortableProperties={SORTABLE_PROPERTIES}
                            showImport
                        />
                    </MultipleFilterContextProvider>
                </TablePageContent>
            </PageWrapper>
        </>
    )
}

TicketsPage.requiredAccess = OrganizationRequired

export default TicketsPage
