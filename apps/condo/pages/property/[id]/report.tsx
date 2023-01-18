import React, { useCallback } from 'react'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import Head from 'next/head'
import { useRouter } from 'next/router'
import isNull from 'lodash/isNull'
import { Row, Col, Tabs, Space } from 'antd'
import type { RowProps } from 'antd'
import { Typography, Button } from '@open-condo/ui'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { Button as DeprecatedButton } from '@condo/domains/common/components/Button'
import { Table } from '@condo/domains/common/components/Table'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import Input from '@condo/domains/common/components/antd/Input'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { Property } from '@condo/domains/property/utils/clientSchema'
import {
    BankAccount,
    BankContractorAccount,
    BankTransaction,
} from '@condo/domains/banking/utils/clientSchema'

import type {
    Property as PropertyType,
    BankAccount as BankAccountType,
    BankContractorAccount as BankContractorAccountType,
} from '@app/condo/schema'
import { SberIconWithoutLabel } from '@condo/domains/common/components/icons/SberIcon'
import { Loader } from '@condo/domains/common/components/Loader'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'

const PROPERTY_REPORT_PAGE_ROW_GUTTER: RowProps['gutter'] = [0, 20]
const PROPERTY_REPORT_PAGE_ROW_CONTAINER_GUTTER: RowProps['gutter'] = [0, 60]
const DATE_DISPLAY_FORMAT = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}

interface IPropertyReportPageContent {
    ({ property }: { property: PropertyType }): React.ReactElement
}
interface IPropertyImportBankTransactions {
    (): React.ReactElement
}
interface IPropertyReport {
    ({ bankAccount, organizationId }: { bankAccount: BankAccountType, organizationId: string }): React.ReactElement
}

const PropertyImportBankTransactions: IPropertyImportBankTransactions = () => {
    const intl = useIntl()
    const ImportBankAccountTitle = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.title' })
    const ImportBankAccountDescription = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.description' })
    const LoginBySBBOLTitle = intl.formatMessage({ id: 'LoginBySBBOL' })
    const ImportFileTitle = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.importFileTitle' })

    return (
        <BasicEmptyListView image='/dino/searching@2x.png' spaceSize={20}>
            <Typography.Title level={3}>{ImportBankAccountTitle}</Typography.Title>
            <Typography.Paragraph>{ImportBankAccountDescription}</Typography.Paragraph>
            <DeprecatedButton
                key='submit'
                type='sberAction'
                secondary
                icon={<SberIconWithoutLabel/>}
                href='/api/sbbol/auth'
                block
            >
                {LoginBySBBOLTitle}
            </DeprecatedButton>
            <Button type='secondary' stateless>{ImportFileTitle}</Button>
        </BasicEmptyListView>
    )
}

const PropertyReport: IPropertyReport = ({ bankAccount, organizationId }) => {
    const intl = useIntl()
    const IncomeTitle = intl.formatMessage({ id: 'global.income' }, { isSingular: false })
    const WithdrawalTitle = intl.formatMessage({ id: 'global.withdrawal' }, { isSingular: false })
    const ContractorTitle = intl.formatMessage({ id: 'global.contractor' }, { isSingular: false })

    const { objs: bankTransactions } = BankTransaction.useObjects({
        where: {
            account: { id: bankAccount.id },
        },
    })
    const { objs: bankContractorAccounts } = BankContractorAccount.useObjects({
        where: {
            organization: { id: organizationId },

        },
    })

    const [bankTransactionTableColumns, bankContractorAccountTableColumns] = useTableColumns()
    const [search, changeSearch] = useSearch<{ search?: string }>()


    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])

    return (
        <>
            <TableFiltersContainer>
                <Row justify='end' gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER}>
                    <Col flex='auto'>
                        <Input
                            placeholder='search pl'
                            allowClear
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </Col>
                </Row>
            </TableFiltersContainer>
            <Tabs>
                <Tabs.TabPane tab={IncomeTitle} key='income'>
                    <Table
                        dataSource={bankTransactions.filter(transaction => isNull(transaction.dateWithdrawed))}
                        columns={bankTransactionTableColumns}
                        rowSelection={{ type: 'checkbox' }}
                        pagination={false}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab={WithdrawalTitle} key='withdrawal'>
                    <Table
                        dataSource={bankTransactions.filter(transaction => isNull(transaction.dateReceived))}
                        columns={bankTransactionTableColumns}
                        rowSelection={{ type: 'checkbox' }}
                        pagination={false}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab={ContractorTitle} key='contractors'>
                    <Table
                        dataSource={bankContractorAccounts}
                        columns={bankContractorAccountTableColumns}
                        rowSelection={{ type: 'checkbox' }}
                        pagination={false}
                    />
                </Tabs.TabPane>
            </Tabs>
        </>
    )
}

const PropertyReportPageContent: IPropertyReportPageContent = ({ property }) => {
    const intl = useIntl()
    const PageImportTitle = intl.formatMessage({ id: 'pages.condo.property.report.pageImportTitle' })
    const PageReportTitle = intl.formatMessage({ id: 'pages.condo.property.report.pageReportTitle' })

    const { link } = useOrganization()
    const { loading, obj: bankAccount } = BankAccount.useObject({
        where: {
            property: { id: property.id },
            organization: { id: link.organization.id },
        },
    })

    const hasBankAccount = !loading && !isNull(bankAccount)

    if (loading) {
        return (<Loader fill />)
    }

    return (
        <Row gutter={PROPERTY_REPORT_PAGE_ROW_CONTAINER_GUTTER}>
            <Col span={24}>
                <Row gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER}>
                    <Col span={24}>
                        <Typography.Title>{hasBankAccount ? PageReportTitle : PageImportTitle}</Typography.Title>

                    </Col>
                    <Col span={24}>
                        <Typography.Text>
                            {property.address}
                        </Typography.Text>
                        {hasBankAccount ? (
                            <>
                                &nbsp;
                                <Typography.Text type='secondary'>
                                    {intl.formatMessage(
                                        { id: 'pages.condo.property.report.pageReportDescription' },
                                        { bankAccountNumber: bankAccount.number }
                                    )}
                                </Typography.Text>
                                <Typography.Paragraph type='warning'>
                                    {
                                        intl.formatMessage(
                                            { id: 'pages.condo.property.report.dataUpdatedTitle' },
                                            { updatedAt: intl.formatDate(bankAccount.updatedAt, DATE_DISPLAY_FORMAT) }
                                        )
                                    }
                                </Typography.Paragraph>
                            </>
                        ) : null}
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                {hasBankAccount
                    ? <PropertyReport bankAccount={bankAccount} organizationId={link.organization.id} />
                    : <PropertyImportBankTransactions />}
            </Col>
        </Row>
    )
}

const PropertyReportPage = (): React.ReactElement => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'pages.condo.property.report.pageImportTitle' })
    const ServerErrorTitle = intl.formatMessage({ id: 'ServerError' })

    const { query: { id } } = useRouter()

    const { loading, obj: property, error } = Property.useObject({
        where: {
            id: id as string,
        },
    })

    if (error || loading) {
        return <LoadingOrErrorPage
            title={PageTitle}
            loading={loading}
            error={error ? ServerErrorTitle : null}
        />
    }

    return (
        <>
            <Head><title>{PageTitle}</title></Head>
            <PageWrapper>
                <OrganizationRequired>
                    <PageContent>
                        <PropertyReportPageContent property={property} />
                    </PageContent>
                </OrganizationRequired>
            </PageWrapper>
        </>
    )
}

export default PropertyReportPage
