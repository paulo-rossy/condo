import { Row, Col, Tabs, Space, Upload } from 'antd'
import get from 'lodash/get'
import isNull from 'lodash/isNull'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { getClientSideSenderInfo } from '@open-condo/codegen/utils/userId'
import { useFeatureFlags } from '@open-condo/featureflags/FeatureFlagsContext'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Button, Checkbox } from '@open-condo/ui'

import { BankAccountVisibilitySelect } from '@condo/domains/banking/components/BankAccountVisibilitySelect'
import { BankCostItemProvider, PropertyReportTypes, useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import { SbbolImportModal } from '@condo/domains/banking/components/SbbolImportModal'
import { BANK_INTEGRATION_IDS } from '@condo/domains/banking/constants'
import useBankContractorAccountTable from '@condo/domains/banking/hooks/useBankContractorAccountTable'
import useBankTransactionsTable from '@condo/domains/banking/hooks/useBankTransactionsTable'
import { useCategoryModal } from '@condo/domains/banking/hooks/useCategoryModal'
import { BankAccount, BankIntegrationContext } from '@condo/domains/banking/utils/clientSchema'
import ActionBar from '@condo/domains/common/components/ActionBar'
import Input from '@condo/domains/common/components/antd/Input'
import { Button as DeprecatedButton } from '@condo/domains/common/components/Button'
import { PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { DeleteButtonWithConfirmModal } from '@condo/domains/common/components/DeleteButtonWithConfirmModal'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { SberIconWithoutLabel } from '@condo/domains/common/components/icons/SberIcon'
import { Loader } from '@condo/domains/common/components/Loader'
import DateRangePicker from '@condo/domains/common/components/Pickers/DateRangePicker'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { PROPERTY_REPORT_DELETE_ENTITIES } from '@condo/domains/common/constants/featureflags'
import { useDateRangeSearch } from '@condo/domains/common/hooks/useDateRangeSearch'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { Property } from '@condo/domains/property/utils/clientSchema'

import type {
    Property as PropertyType,
    BankAccount as BankAccountType,
    BankTransaction as BankTransactionType,
    BankContractorAccount as BankContractorAccountType,
    MakeOptional,
} from '@app/condo/schema'
import type { RowProps, UploadProps } from 'antd'

const PROPERTY_REPORT_PAGE_ROW_GUTTER: RowProps['gutter'] = [24, 20]
const PROPERTY_REPORT_PAGE_ROW_TABLE_GUTTER: RowProps['gutter'] = [0, 40]
const EMPTY_ROW_STYLE: React.CSSProperties = { height: 'calc(100% - 90px)' }
const DATE_DISPLAY_FORMAT = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}
const UPLOAD_OPTIONS: UploadProps = {
    multiple: false,
    itemRender: () => null,
    accept: '.txt',
}
const SBBOL_SYNC_CALLBACK_QUERY = 'sbbol-sync-callback'
const EMPTY_IMAGE_PATH = '/dino/searching@2x.png'
const PROCESSING_IMAGE_PATH = '/dino/processing@2x.png'
const INTEGRATION_PROCESSING_STATUS = 'inProgress'

type BankReportProps = {
    bankAccount: BankAccountType
    organizationId: string
}
interface IPropertyReportPageContent {
    ({ property }: { property: PropertyType }): React.ReactElement
}
interface IPropertyImportBankTransactions {
    ({ bankAccount, organizationId }: MakeOptional<BankReportProps, 'bankAccount'>): React.ReactElement
}
interface IPropertyReport {
    ({ bankAccount, organizationId }: BankReportProps): React.ReactElement
}

const PropertyImportBankTransactions: IPropertyImportBankTransactions = ({ bankAccount, organizationId }) => {
    const intl = useIntl()
    const ImportBankAccountTitle = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.title' })
    const ImportBankAccountDescription = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.description' })
    const ProcessingTitle = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.processing.title' })
    const ProcessingDescription = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.processing.description' })
    const LoginBySBBOLTitle = intl.formatMessage({ id: 'LoginBySBBOL' })
    const ImportFileTitle = intl.formatMessage({ id: 'pages.condo.property.report.importBankTransaction.importFileTitle' })

    const { query, asPath } = useRouter()
    const { id } = query

    // If current property already connected to the BankAccount -> query only it's context.
    // Otherwise -> query by current organization
    const { objs: bankIntegrationContexts, loading } = BankIntegrationContext.useObjects({
        where: get(bankAccount, 'integrationContext.id', false)
            ? { id: get(bankAccount, 'integrationContext.id') }
            : { organization: { id: organizationId } },
    })

    const hasSuccessCallback = query.hasOwnProperty(SBBOL_SYNC_CALLBACK_QUERY)
    let isProcessing = false

    if (!loading) {
        if (isNull(bankAccount)) {
            isProcessing = bankIntegrationContexts
                .every(context => get(context, 'meta.syncTransactionsTaskStatus') === INTEGRATION_PROCESSING_STATUS)
        } else {
            isProcessing = get(bankIntegrationContexts, '0.meta.syncTransactionsTaskStatus') === INTEGRATION_PROCESSING_STATUS
        }
    }

    return (
        <BasicEmptyListView image={isProcessing ? PROCESSING_IMAGE_PATH : EMPTY_IMAGE_PATH} spaceSize={20}>
            <Typography.Title level={3}>
                {isProcessing ? ProcessingTitle : ImportBankAccountTitle}
            </Typography.Title>
            <Typography.Paragraph>
                {isProcessing ? ProcessingDescription : ImportBankAccountDescription}
            </Typography.Paragraph>
            {!isProcessing && (
                <>
                    <DeprecatedButton
                        key='submit'
                        type='sberAction'
                        secondary
                        icon={<SberIconWithoutLabel/>}
                        href={`/api/sbbol/auth?redirectUrl=${asPath}?${SBBOL_SYNC_CALLBACK_QUERY}`}
                        block
                    >
                        {LoginBySBBOLTitle}
                    </DeprecatedButton>
                    <Upload {...UPLOAD_OPTIONS}>
                        <Button type='secondary' stateless>{ImportFileTitle}</Button>
                    </Upload>
                </>
            )}
            {hasSuccessCallback && (
                <SbbolImportModal propertyId={id as string} />
            )}
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

    // Local state
    const [tab, setTab] = useState<PropertyReportTypes>('income')
    const [categoryNotSet, setCategoryNotSet] = useState(false)

    // Hooks
    const { selectedItem } = useBankCostItemContext()
    const {
        Component: BankTransactionsTable,
        loading: bankTransactionsTableLoading,
        selectedRows: selectedBankTransactions,
        clearSelection: clearBankTransactionSelection,
        updateSelected: updateBankTransactions,
    } = useBankTransactionsTable({ bankAccount, type: tab, categoryNotSet })
    const {
        Component: BankContractorAccountTable,
        selectedRows: selectedContractorAccounts,
        clearSelection: clearBankContractorSelection,
        updateSelected: updateBankContractors,
    } = useBankContractorAccountTable({ organizationId, categoryNotSet })
    const [search, changeSearch] = useSearch<{ search?: string }>()
    const [dateRange, setDateRange] = useDateRangeSearch('date', bankTransactionsTableLoading)
    const { categoryModal, setOpen } = useCategoryModal({
        bankTransactions: selectedItem ? [selectedItem] as [BankTransactionType] : selectedBankTransactions,
        bankContractorAccounts: selectedItem ? [selectedItem] as [BankContractorAccountType] : selectedContractorAccounts,
        type: tab,
        updateSelected: tab === 'contractor' ? updateBankContractors : updateBankTransactions,
    })
    const { useFlag } = useFeatureFlags()

    // Handlers
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
    const handleTabChange = useCallback((tab: PropertyReportTypes) => {
        handleClearSelection()
        setTab(tab)
    }, [handleClearSelection])
    const handleEditSelectedRows = useCallback(() => {
        setOpen(true)
    }, [setOpen])
    const handleDeleteSelected = useCallback(async () => {
        const bankListPayload = tab === 'contractor' ? selectedContractorAccounts : selectedBankTransactions

        if (bankListPayload.length) {
            const sender = getClientSideSenderInfo()
            const updateAction = tab === 'contractor' ? updateBankContractors : updateBankTransactions
            await updateAction({
                variables: {
                    data: bankListPayload.map(item => {
                        return {
                            id: item.id,
                            data: {
                                dv: 1,
                                sender,
                                deletedAt: new Date().toDateString(),
                            },
                        }
                    }),
                },
            })
        }
    }, [tab, selectedBankTransactions, updateBankTransactions, selectedContractorAccounts, updateBankContractors])

    // Local render variables
    const tabContent = useMemo(() => {
        switch (tab) {
            case 'income':
            case 'withdrawal':
                return <BankTransactionsTable />
            case 'contractor':
                return <BankContractorAccountTable />
        }
    }, [tab, BankContractorAccountTable, BankTransactionsTable])

    const totalSelectedItems = selectedBankTransactions.length || selectedContractorAccounts.length
    const deleteModalTitle = selectedBankTransactions.length
        ? intl.formatMessage({ id: 'pages.banking.removeModal.transaction.title' }, { count: selectedBankTransactions.length })
        : intl.formatMessage({ id: 'pages.banking.removeModal.contractor.title' }, { count: selectedContractorAccounts.length })
    const deleteModalDescription = selectedBankTransactions.length
        ? intl.formatMessage({ id: 'pages.banking.removeModal.transaction.description' }, { count: selectedBankTransactions.length })
        : intl.formatMessage({ id: 'pages.banking.removeModal.contractor.description' }, { count: selectedContractorAccounts.length })
    const itemsSelectedTitle = intl.formatMessage({ id: 'pages.banking.report.itemsSelected' }, { count: totalSelectedItems })
    const fileImportIntegration = get(bankAccount, ['integrationContext', 'integration', 'id']) === BANK_INTEGRATION_IDS['1CClientBankExchange']
    const reportDeleteEntities = useFlag(PROPERTY_REPORT_DELETE_ENTITIES)

    return (
        <>
            <Row gutter={PROPERTY_REPORT_PAGE_ROW_TABLE_GUTTER}>
                <Col span={24}>
                    <Tabs activeKey={tab} onChange={handleTabChange}>
                        <Tabs.TabPane tab={IncomeTitle} key='income' />
                        <Tabs.TabPane tab={WithdrawalTitle} key='withdrawal' />
                        <Tabs.TabPane tab={ContractorTitle} key='contractor' />
                    </Tabs>
                </Col>
                <Col span={24}>
                    <TableFiltersContainer>
                        <Row gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER} align='middle'>
                            <Col span={6}>
                                <Input
                                    placeholder={SearchPlaceholderTitle}
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </Col>
                            {tab !== 'contractor' && (
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
                    {categoryModal}
                </Col>
            </Row>
            <ActionBar>
                <Space size={12}>
                    {
                        totalSelectedItems
                            ? (
                                <>
                                    <Typography.Title level={5}>{itemsSelectedTitle}</Typography.Title>
                                    <Button
                                        type='primary'
                                        onClick={handleEditSelectedRows}
                                    >
                                        {EditTitle}
                                    </Button>
                                    {reportDeleteEntities && (
                                        <DeleteButtonWithConfirmModal
                                            title={deleteModalTitle}
                                            message={deleteModalDescription}
                                            okButtonLabel={DeleteTitle}
                                            buttonContent={DeleteTitle}
                                            action={handleDeleteSelected}
                                            showCancelButton
                                        />
                                    )}
                                    <Button
                                        type='secondary'
                                        onClick={handleClearSelection}
                                    >
                                        {CancelSelectionTitle}
                                    </Button>
                                </>
                            )
                            : (
                                <>
                                    <Button type='primary' hidden={!fileImportIntegration}>{UploadFileTitle}</Button>
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

    const hasBankAccount = !loading && get(bankAccount, 'hasData', false)

    if (loading) {
        return (<Loader fill />)
    }

    return (
        <>
            <Row gutter={hasBankAccount ? [0, 40] : 0}>
                <Col span={24}>
                    <Row gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER}>
                        <Col span={24}>
                            <Typography.Title>{hasBankAccount ? PageReportTitle : PageImportTitle}</Typography.Title>

                        </Col>
                        <Col span={24}>
                            <Row justify='space-between' gutter={PROPERTY_REPORT_PAGE_ROW_GUTTER}>
                                <Col>
                                    <Typography.Text>
                                        {property.address}
                                    </Typography.Text>
                                    {hasBankAccount && (
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
                                    )}
                                </Col>
                                {hasBankAccount && (
                                    <Col>
                                        <BankAccountVisibilitySelect bankAccount={bankAccount} />
                                    </Col>
                                )}
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    {hasBankAccount && (
                        <PropertyReport bankAccount={bankAccount} organizationId={link.organization.id} />
                    )}

                </Col>
            </Row>
            {!hasBankAccount && (
                <Row align='middle' justify='center' style={EMPTY_ROW_STYLE}>
                    <Col span={24}>
                        <PropertyImportBankTransactions
                            bankAccount={bankAccount}
                            organizationId={link.organization.id}
                        />
                    </Col>
                </Row>
            )}
        </>
    )
}

const PropertyReportPage = (): React.ReactElement => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'pages.condo.property.report.pageImportTitle' })
    const ServerErrorTitle = intl.formatMessage({ id: 'ServerError' })

    const { query: { id } } = useRouter()

    const { loading, obj: property, error } = Property.useObject(
        { where: { id: id as string } },
        { fetchPolicy: 'cache-first' }
    )

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
                <BankCostItemProvider>
                    <TablePageContent>
                        <PropertyReportPageContent property={property} />
                    </TablePageContent>
                </BankCostItemProvider>
            </PageWrapper>
        </>
    )
}

PropertyReportPage.requiredAccess = OrganizationRequired

export default PropertyReportPage
