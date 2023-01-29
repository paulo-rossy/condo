import { Row, Col } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useRef, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Checkbox } from '@open-condo/ui'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import { useCategoryModal } from '@condo/domains/banking/hooks/useCategoryModal'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { useTableFilters } from '@condo/domains/banking/hooks/useTableFilters'
import { BankTransaction } from '@condo/domains/banking/utils/clientSchema'
import Input from '@condo/domains/common/components/antd/Input'
import DateRangePicker from '@condo/domains/common/components/Pickers/DateRangePicker'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useDateRangeSearch } from '@condo/domains/common/hooks/useDateRangeSearch'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { useSearch } from '@condo/domains/common/hooks/useSearch'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

import type { BankAccount, BankTransactionWhereInput, BankTransaction as BankTransactionType } from '@app/condo/schema'
import type { RowProps } from 'antd'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [24, 40]

interface IBankContractorAccountTable {
    ({ bankAccount, type }: { bankAccount: BankAccount, type: 'withdraw' | 'receive' }): React.ReactElement
}

const BankContractorAccountTable: IBankContractorAccountTable = ({ bankAccount, type }) => {
    const intl = useIntl()
    const SearchPlaceholderTitle = intl.formatMessage({ id: 'filters.FullSearch' })
    const CategoryCheckboxTitle = intl.formatMessage({ id: 'pages.banking.categoryNotSet' })

    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const queryMeta = useTableFilters()
    const { filtersToWhere } = useQueryMappers(queryMeta, [])
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

    const [categoryNotSet, setCategoryNotSet] = useState(false)
    const selectedBankTransactions = useRef<BankTransactionType[]>([])

    const whereQuery: BankTransactionWhereInput = type === 'withdraw'
        ? { dateReceived: null }
        : { dateWithdrawed: null }
    const nullCategoryFilter = categoryNotSet ? { costItem_is_null: true } : {}
    const pageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    const { objs: bankTransactions, loading } = BankTransaction.useObjects({
        where: {
            account: { id: bankAccount.id },
            ...nullCategoryFilter,
            ...whereQuery,
            ...filtersToWhere(filters),
        },
        first: DEFAULT_PAGE_SIZE,
        skip: (pageIndex - 1) * DEFAULT_PAGE_SIZE,
    })
    const [bankTransactionTableColumns] = useTableColumns()
    const [search, changeSearch] = useSearch<{ search?: string }>()
    const [dateRange, setDateRange] = useDateRangeSearch('date', loading)
    const { categoryModal, setOpen } = useCategoryModal({ bankTransactions: selectedBankTransactions.current })

    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])
    const handleRowClick = useCallback((row) => {
        return {
            onClick: () => {
                selectedBankTransactions.current = [row]
                setOpen(true)
            },
        }
    }, [setOpen])
    const handleCategoryFilterChange = useCallback(() => {
        setCategoryNotSet(!categoryNotSet)
    }, [categoryNotSet])

    return (
        <>
            <Row gutter={TABLE_ROW_GUTTER}>
                <Col span={24}>
                    <TableFiltersContainer>
                        <Row gutter={TABLE_ROW_GUTTER} align='middle'>
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
                    <Table
                        loading={loading || bankCostItemsLoading}
                        dataSource={bankTransactions.map(transaction => {
                            const costItem = bankCostItems.find(costItem => costItem.id === get(transaction, 'costItem.id'))

                            if (costItem) {
                                transaction.costItem = costItem
                            }

                            return transaction
                        })}
                        columns={bankTransactionTableColumns}
                        rowSelection={{ type: 'checkbox' }}
                        onRow={handleRowClick}
                    />
                </Col>
            </Row>
            {categoryModal}
        </>
    )
}

export default BankContractorAccountTable
