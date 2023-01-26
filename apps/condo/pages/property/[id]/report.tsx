import { Row, Col, Tabs, Space } from 'antd'
import isNull from 'lodash/isNull'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography, Button } from '@open-condo/ui'

import BankContractorAccountTable from '@condo/domains/banking/components/BankContractorAccountTable'
import BankTransactionsTable from '@condo/domains/banking/components/BankTransactionsTable'
import { BankAccount } from '@condo/domains/banking/utils/clientSchema'
import ActionBar from '@condo/domains/common/components/ActionBar'
import { Button as DeprecatedButton } from '@condo/domains/common/components/Button'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { SberIconWithoutLabel } from '@condo/domains/common/components/icons/SberIcon'
import { Loader } from '@condo/domains/common/components/Loader'
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
    const UploadFileTitle = intl.formatMessage({ id: 'pages.banking.uploadTransactionsFile' })
    const RemoveReportTitle = intl.formatMessage({ id: 'pages.banking.removeReport' })

    return (
        <>
            <Tabs>
                <Tabs.TabPane tab={IncomeTitle} key='receive'>
                    <BankTransactionsTable bankAccount={bankAccount} type='receive' />
                </Tabs.TabPane>
                <Tabs.TabPane tab={WithdrawalTitle} key='withdraw'>
                    <BankTransactionsTable bankAccount={bankAccount} type='withdraw' />
                </Tabs.TabPane>
                <Tabs.TabPane tab={ContractorTitle} key='contractors'>
                    <BankContractorAccountTable organizationId={organizationId} />
                </Tabs.TabPane>
            </Tabs>
            <ActionBar>
                <Space size={12}>
                    <Button type='primary'>{UploadFileTitle}</Button>
                    <Button type='secondary' danger>{RemoveReportTitle}</Button>
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
                    <PageContent>
                        <PropertyReportPageContent property={property} />
                    </PageContent>
                </OrganizationRequired>
            </PageWrapper>
        </>
    )
}

export default PropertyReportPage
