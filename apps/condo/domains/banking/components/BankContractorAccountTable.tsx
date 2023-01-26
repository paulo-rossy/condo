import { Row, Col, RowProps } from 'antd'
import React, { useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'

import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { BankContractorAccount } from '@condo/domains/banking/utils/clientSchema'
import Input from '@condo/domains/common/components/antd/Input'
import { Table } from '@condo/domains/common/components/Table'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useSearch } from '@condo/domains/common/hooks/useSearch'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [24, 40]

interface IBankContractorAccountTable {
    ({ organizationId }: { organizationId: string }): React.ReactElement
}

const BankContractorAccountTable: IBankContractorAccountTable = ({ organizationId }) => {
    const intl = useIntl()
    const SearchPlaceholderTitle = intl.formatMessage({ id: 'filters.FullSearch' })

    const { objs: bankContractorAccounts, loading } = BankContractorAccount.useObjects({
        where: {
            organization: { id: organizationId },
        },
    })
    const [, bankContractorAccountTableColumns] = useTableColumns()
    const [search, changeSearch] = useSearch<{ search?: string }>()


    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])

    return (
        <Row gutter={TABLE_ROW_GUTTER}>
            <Col span={24}>
                <TableFiltersContainer>
                    <Row gutter={TABLE_ROW_GUTTER}>
                        <Col span={8}>
                            <Input
                                placeholder={SearchPlaceholderTitle}
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </Col>
                    </Row>
                </TableFiltersContainer>
            </Col>
            <Col span={24}>
                <Table
                    loading={loading}
                    dataSource={bankContractorAccounts}
                    columns={bankContractorAccountTableColumns}
                    rowSelection={{ type: 'checkbox' }}
                />
            </Col>
        </Row>
    )
}

export default BankContractorAccountTable
