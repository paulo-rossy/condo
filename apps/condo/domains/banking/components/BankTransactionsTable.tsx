import React, { useCallback, useMemo } from 'react'
import { Row, Col, RowProps } from 'antd'
import { useIntl } from '@open-condo/next/intl'
import { Table } from '@condo/domains/common/components/Table'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { useDateRangeSearch } from '@condo/domains/common/hooks/useDateRangeSearch'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import Input from '@condo/domains/common/components/antd/Input'
import DateRangePicker from '@condo/domains/common/components/Pickers/DateRangePicker'
import { BankTransaction } from '@condo/domains/banking/utils/clientSchema'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { useTableFilters } from '@condo/domains/banking/hooks/useTableFilters'
import type { BankAccount, BankTransactionWhereInput } from '@app/condo/schema'
import { useRouter } from 'next/router'
import { parseQuery } from '../../common/utils/tables.utils'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [24, 40]

interface IBankContractorAccountTable {
    ({ bankAccount, type }: { bankAccount: BankAccount, type: 'withdraw' | 'receive' }): React.ReactElement
}

const BankContractorAccountTable: IBankContractorAccountTable = ({ bankAccount, type }) => {
    const intl = useIntl()
    const SearchPlaceholderTitle = intl.formatMessage({ id: 'filters.FullSearch' })

    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const queryMeta = useTableFilters()
    const { filtersToWhere } = useQueryMappers(queryMeta, [])

    const whereQuery: BankTransactionWhereInput = type === 'withdraw'
        ? { dateReceived: null }
        : { dateWithdrawed: null }

    const { objs: bankTransactions, loading } = BankTransaction.useObjects({
        where: {
            account: { id: bankAccount.id },
            ...whereQuery,
            ...filtersToWhere(filters),
        },
    })
    const [bankTransactionTableColumns] = useTableColumns()
    const [search, changeSearch] = useSearch<{ search?: string }>()
    const [dateRange, setDateRange] = useDateRangeSearch('date', loading)

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
                        <Col span={8}>
                            <DateRangePicker
                                value={dateRange}
                                onChange={setDateRange}
                            />
                        </Col>
                    </Row>
                </TableFiltersContainer>
            </Col>
            <Col span={24}>
                <Table
                    loading={loading}
                    dataSource={bankTransactions}
                    columns={bankTransactionTableColumns}
                    rowSelection={{ type: 'checkbox' }}
                />
            </Col>
        </Row>
    )
}

export default BankContractorAccountTable
