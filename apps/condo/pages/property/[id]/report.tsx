import { Row, Col, Tabs, Space } from 'antd'
import isNull from 'lodash/isNull'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Button, Checkbox } from '@open-condo/ui'

import { BankCostItemProvider } from '@condo/domains/banking/components/BankCostItemContext'
import useBankContractorAccountTable from '@condo/domains/banking/hooks/useBankContractorAccountTable'
import useBankTransactionsTable from '@condo/domains/banking/hooks/useBankTransactionsTable'
import { BankAccount } from '@condo/domains/banking/utils/clientSchema'
import ActionBar from '@condo/domains/common/components/ActionBar'
import Input from '@condo/domains/common/components/antd/Input'
import { Button as DeprecatedButton } from '@condo/domains/common/components/Button'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { SberIconWithoutLabel } from '@condo/domains/common/components/icons/SberIcon'
import { Loader } from '@condo/domains/common/components/Loader'
import DateRangePicker from '@condo/domains/common/components/Pickers/DateRangePicker'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useDateRangeSearch } from '@condo/domains/common/hooks/useDateRangeSearch'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { Property } from '@condo/domains/property/utils/clientSchema'

import type {
    Property as PropertyType,
    BankAccount as BankAccountType,
} from '@app/condo/schema'
import type { RowProps } from 'antd'

const PROPERTY_REPORT_PAGE_ROW_GUTTER: RowProps['gutter'] = [24, 20]
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
    const SearchPlaceholderTitle = intl.formatMessage({ id: 'filters.FullSearch' })
    const CategoryCheckboxTitle = intl.formatMessage({ id: 'pages.banking.categoryNotSet' })
    const UploadFileTitle = intl.formatMessage({ id: 'pages.banking.uploadTransactionsFile' })
    const RemoveReportTitle = intl.formatMessage({ id: 'pages.banking.removeReport' })
    const EditTitle = intl.formatMessage({ id: 'Edit' })
    const CancelSelectionTitle = intl.formatMessage({ id: 'pages.condo.ticket.index.CancelSelectedTicket' })
    const DeleteTitle = intl.formatMessage({ id: 'Delete' })

    const [tab, setTab] = useState('receive')

    const [categoryNotSet, setCategoryNotSet] = useState(false)

    const {
        component: bankTransactionsTable,
        loading: bankTransactionsTableLoading,
        selectedRows: selectedBankTransactions,
        clearSelection: clearBankTransactionSelection,
    } = useBankTransactionsTable({ bankAccount, type: tab, categoryNotSet })
    const {
        component: bankContractorAccountTable,
        selectedRows: selectedContractorAccounts,
        clearSelection: clearBankContractorSelection,
    } = useBankContractorAccountTable({ organizationId, categoryNotSet })
    const [search, changeSearch] = useSearch<{ search?: string }>()
    const [dateRange, setDateRange] = useDateRangeSearch('date', bankTransactionsTableLoading)

    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])
    const handleCategoryFilterChange = useCallback(() => {
        setCategoryNotSet(!categoryNotSet)
    }, [categoryNotSet])
    const handleClearSelection = useCallback(() => {
        if (selectedBankTransactions.length) {
            clearBankTransactionSelection()
        }
        if (selectedContractorAccounts.length) {
            clearBankContractorSelection()
        }
    }, [selectedContractorAccounts, selectedBankTransactions, clearBankTransactionSelection, clearBankContractorSelection])
    const handleTabChange = useCallback((tab) => {
        handleClearSelection()
        setTab(tab)
    }, [handleClearSelection])

    const tabContent = useMemo(() => {
        switch (tab) {
            case 'receive':
            case 'withdraw':
                return bankTransactionsTable
            case 'contractors':
                return bankContractorAccountTable
        }
    }, [tab, bankContractorAccountTable, bankTransactionsTable])

    return (
        <>
            <Row gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER}>
                <Col span={24}>
                    <Tabs activeKey={tab} onChange={handleTabChange}>
                        <Tabs.TabPane tab={IncomeTitle} key='receive' />
                        <Tabs.TabPane tab={WithdrawalTitle} key='withdraw' />
                        <Tabs.TabPane tab={ContractorTitle} key='contractors' />
                    </Tabs>
                    <TableFiltersContainer>
                        <Row gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER} align='middle'>
                            <Col span={6}>
                                <Input
                                    placeholder={SearchPlaceholderTitle}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </Col>
                            {tab !== 'contractors' && (
                                <Col span={6}>
                                    <DateRangePicker
                                        value={dateRange}
                                        onChange={setDateRange}
                                    />
                                </Col>
                            )}
                            <Col>
                                <Checkbox
                                    label={CategoryCheckboxTitle}
                                    checked={categoryNotSet}
                                    onChange={handleCategoryFilterChange}
                                />
                            </Col>
                        </Row>
                    </TableFiltersContainer>
                </Col>
                <Col span={24}>
                    {tabContent}
                </Col>
            </Row>
            <ActionBar>
                <Space size={12}>
                    {
                        selectedBankTransactions.length || selectedContractorAccounts.length
                            ? (
                                <>
                                    <Button type='primary'>{EditTitle}</Button>
                                    <Button type='secondary' danger>{DeleteTitle}</Button>
                                    <Button type='secondary' onClick={handleClearSelection}>{CancelSelectionTitle}</Button>
                                </>
                            )
                            : (
                                <>
                                    <Button type='primary'>{UploadFileTitle}</Button>
                                    <Button type='secondary' danger>{RemoveReportTitle}</Button>
                                </>
                            )
                    }

                </Space>
            </ActionBar>
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
                    <BankCostItemProvider>
                        <PageContent>
                            <PropertyReportPageContent property={property} />
                        </PageContent>
                    </BankCostItemProvider>
                </OrganizationRequired>
            </PageWrapper>
        </>
    )
}

export default PropertyReportPage
