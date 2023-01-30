import { Space } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import CategoryProgress from '@condo/domains/banking/components/CategoryProgress'
import { useCategoryModal } from '@condo/domains/banking/hooks/useCategoryModal'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { useTableFilters } from '@condo/domains/banking/hooks/useTableFilters'
import { BankTransaction } from '@condo/domains/banking/utils/clientSchema'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

import type { BankAccount, BankTransactionWhereInput, BankTransaction as BankTransactionType } from '@app/condo/schema'
import type { PropertyReportTypes } from '@condo/domains/banking/components/BankCostItemContext'

interface IUseBankContractorAccountTable {
    ({ bankAccount, type, categoryNotSet }: {
        bankAccount: BankAccount,
        type: PropertyReportTypes,
        categoryNotSet: boolean
    }): {
        component: JSX.Element,
        loading: boolean,
        selectedRows: Array<BankTransactionType>,
        clearSelection: () => void
    }
}

const useBankContractorAccountTable: IUseBankContractorAccountTable = ({ bankAccount, type, categoryNotSet }) => {
    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const queryMeta = useTableFilters()
    const { filtersToWhere } = useQueryMappers(queryMeta, [])
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

    const selectedBankTransactions = useRef<BankTransactionType[]>([])

    const whereQuery: BankTransactionWhereInput = type === 'withdrawal'
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
    const { categoryModal, setOpen } = useCategoryModal({ bankTransactions: selectedBankTransactions.current })

    const [selectedRows, setSelectedRows] = useState([])
    const isLoading = loading || bankCostItemsLoading

    const handleSelectRow = useCallback((record, checked) => {
        const selectedKey = record.id
        if (checked) {
            setSelectedRows([...selectedRows, record])
        } else {
            setSelectedRows(selectedRows.filter(({ id }) => id !== selectedKey))
        }
    }, [selectedRows])
    const handleRowClick = useCallback((row) => {
        return {
            onClick: () => {
                selectedBankTransactions.current = [row]
                setOpen(true)
            },
        }
    }, [setOpen])
    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedRows(bankTransactions)
        } else {
            setSelectedRows([])
        }
    }, [bankTransactions])
    const clearSelection = () => {
        setSelectedRows([])
    }

    const component = useMemo(() => (
        <Space direction='vertical' size={40}>
            <CategoryProgress data={bankTransactions} entity={type} />
            <Table
                loading={isLoading}
                dataSource={bankTransactions.map(({ ...transaction }) => {
                    const costItem = bankCostItems.find(costItem => costItem.id === get(transaction, 'costItem.id'))

                    if (costItem) {
                        transaction.costItem = costItem
                    }

                    return transaction
                })}
                columns={bankTransactionTableColumns}
                rowSelection={{
                    type: 'checkbox',
                    onSelect: handleSelectRow,
                    onSelectAll: handleSelectAll,
                    selectedRowKeys: selectedRows.map(row => row.id),
                }}
                onRow={handleRowClick}
            />
            {categoryModal}
        </Space>
    ), [isLoading, bankTransactions, bankCostItems, bankTransactionTableColumns, categoryModal, handleRowClick, handleSelectRow, handleSelectAll, selectedRows, type])

    return { component, loading: isLoading, selectedRows, clearSelection }
}

export default useBankContractorAccountTable
