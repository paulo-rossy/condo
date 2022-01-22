import { Col, Input, Row, Typography } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { get } from 'lodash'
import React, { useCallback } from 'react'
import { Gutter } from 'antd/es/grid/row'
import { useIntl } from '@core/next/intl'
import { useOrganization } from '@core/next/organization'
import { DiffOutlined } from '@ant-design/icons'
import { ExportToExcelActionBar } from '@condo/domains/common/components/ExportToExcelActionBar'

import {
    PageHeader,
    PageWrapper,
    useLayoutContext,
} from '@condo/domains/common/components/containers/BaseLayout'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import {
    getPageIndexFromQuery,
    CONTACT_PAGE_SIZE,
} from '@condo/domains/contact/utils/helpers'
import { getFiltersFromQuery } from '@condo/domains/common/utils/helpers'
import { IFilters } from '@condo/domains/contact/utils/helpers'
import { EmptyListView } from '@condo/domains/common/components/EmptyListView'
import { useTableColumns } from '@condo/domains/contact/hooks/useTableColumns'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { Contact } from '@condo/domains/contact/utils/clientSchema'
import { Button } from '@condo/domains/common/components/Button'
import { TitleHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { ImportWrapper } from '@condo/domains/common/components/Import/Index'
import { useImporterFunctions } from '@condo/domains/contact/hooks/useImporterFunctions'
import { getTableScrollConfig, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { Table } from '@condo/domains/common/components/Table/Index'
import { useContactsTableFilters } from '@condo/domains/contact/hooks/useTableFilters'
import { EXPORT_CONTACTS_TO_EXCEL } from '@app/condo/domains/contact/gql'

const ADD_CONTACT_ROUTE = '/contact/create/'
const ROW_VERTICAL_GUTTERS: [Gutter, Gutter] = [0, 40]
const ROW_HORIZONTAL_GUTTERS: [Gutter, Gutter] = [10, 0]

export const ContactsPageContent = ({
    tableColumns,
    searchContactsQuery,
    role,
    sortBy,
}) => {
    const intl = useIntl()
    const PageTitleMessage = intl.formatMessage({ id: 'pages.condo.contact.PageTitle' })
    const SearchPlaceholder = intl.formatMessage({ id: 'filters.FullSearch' })
    const EmptyListLabel = intl.formatMessage({ id: 'contact.EmptyList.header' })
    const EmptyListMessage = intl.formatMessage({ id: 'contact.EmptyList.title' })
    const CreateContact = intl.formatMessage({ id: 'AddContact' })
    const ContactsMessage = intl.formatMessage({ id: 'menu.Contacts' })
    const ContactTitle = intl.formatMessage({ id: 'pages.condo.contact.ImportTitle' })

    const router = useRouter()
    const offsetFromQuery = getPageIndexFromQuery(router.query)
    const filtersFromQuery = getFiltersFromQuery<IFilters>(router.query)
    const { isSmall } = useLayoutContext()

    const canManageContacts = get(role, 'canManageContacts', false)

    const {
        refetch,
        loading,
        count: total,
        objs: contacts,
    } = Contact.useObjects({
        sortBy,
        where: searchContactsQuery,
        skip: (offsetFromQuery * CONTACT_PAGE_SIZE) - CONTACT_PAGE_SIZE,
        first: CONTACT_PAGE_SIZE,
    }, {
        fetchPolicy: 'network-only',
    })

    const handleRowAction = useCallback((record) => {
        return {
            onClick: () => {
                router.push(`/contact/${record.id}/`)
            },
        }
    }, [])

    const [search, handleSearchChange] = useSearch<IFilters>(loading)
    const [columns, contactNormalizer, contactValidator, contactCreator] = useImporterFunctions()

    return (
        <>
            <Head>
                <title>{PageTitleMessage}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title style={{ margin: 0 }}>{PageTitleMessage}</Typography.Title>}/>
                <TablePageContent>
                    {
                        !contacts.length && !filtersFromQuery
                            ? (
                                <EmptyListView
                                    label={EmptyListLabel}
                                    message={EmptyListMessage}
                                    createRoute={ADD_CONTACT_ROUTE}
                                    createLabel={CreateContact}
                                />
                            )
                            : (
                                <Row gutter={ROW_VERTICAL_GUTTERS} align={'middle'} justify={'start'}>
                                    <Col span={24}>
                                        <Row justify={'space-between'} gutter={ROW_VERTICAL_GUTTERS}>
                                            <Col xs={24} lg={6}>
                                                <Input
                                                    placeholder={SearchPlaceholder}
                                                    onChange={(e) => {handleSearchChange(e.target.value)}}
                                                    value={search}
                                                />
                                            </Col>
                                            <Col>
                                                <Row gutter={ROW_HORIZONTAL_GUTTERS} align={'middle'} justify={'center'}>
                                                    <Col hidden={isSmall}>
                                                        {
                                                            canManageContacts && (
                                                                <ImportWrapper
                                                                    objectsName={ContactsMessage}
                                                                    accessCheck={canManageContacts}
                                                                    onFinish={refetch}
                                                                    columns={columns}
                                                                    rowNormalizer={contactNormalizer}
                                                                    rowValidator={contactValidator}
                                                                    objectCreator={contactCreator}
                                                                    domainTranslate={ContactTitle}
                                                                    exampleTemplateLink={'/contact-import-example.xlsx'}
                                                                >
                                                                    <Button
                                                                        type={'sberPrimary'}
                                                                        icon={<DiffOutlined />}
                                                                        block
                                                                        secondary
                                                                    />
                                                                </ImportWrapper>
                                                            )
                                                        }
                                                    </Col>
                                                    <Col>
                                                        {
                                                            canManageContacts && (
                                                                <Button
                                                                    block={!isSmall}
                                                                    key='left'
                                                                    type={'sberPrimary'}
                                                                    onClick={() => router.push(ADD_CONTACT_ROUTE)}
                                                                >
                                                                    {CreateContact}
                                                                </Button>
                                                            )
                                                        }
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={24}>
                                        <Table
                                            scroll={getTableScrollConfig(isSmall)}
                                            totalRows={total}
                                            loading={loading}
                                            dataSource={contacts}
                                            columns={tableColumns}
                                            onRow={handleRowAction}
                                        />
                                    </Col>
                                    <ExportToExcelActionBar
                                        hidden={isSmall}
                                        searchObjectsQuery={searchContactsQuery}
                                        sortBy={sortBy}
                                        exportToExcelQuery={EXPORT_CONTACTS_TO_EXCEL}
                                    />
                                </Row>
                            )
                    }
                </TablePageContent>
            </PageWrapper>
        </>
    )
}

const SORTABLE_PROPERTIES = ['name', 'unitName', 'phone', 'email']

const ContactsPage = () => {
    const router = useRouter()
    const filterMetas = useContactsTableFilters()
    const { filtersToWhere, sortersToSortBy } = useQueryMappers(filterMetas, SORTABLE_PROPERTIES)
    const tableColumns = useTableColumns(filterMetas)
    const { organization, link } = useOrganization()
    const userOrganizationId = get(organization, ['id'])
    const role = get(link, 'role')
    const { filters, sorters } = parseQuery(router.query)
    const searchContactsQuery = {
        ...filtersToWhere(filters), organization: { id: userOrganizationId },
    }

    return (
        <ContactsPageContent
            tableColumns={tableColumns}
            searchContactsQuery={searchContactsQuery}
            sortBy={sortersToSortBy(sorters)}
            role={role}
        />
    )
}

ContactsPage.headerAction = <TitleHeaderAction descriptor={{ id: 'pages.condo.contact.PageTitle' }}/>
ContactsPage.requiredAccess = OrganizationRequired

export default ContactsPage