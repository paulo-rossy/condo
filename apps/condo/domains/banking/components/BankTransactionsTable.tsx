import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useRef } from 'react'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import { useCategoryModal } from '@condo/domains/banking/hooks/useCategoryModal'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { useTableFilters } from '@condo/domains/banking/hooks/useTableFilters'
import { BankTransaction } from '@condo/domains/banking/utils/clientSchema'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

import type { BankAccount, BankTransactionWhereInput, BankTransaction as BankTransactionType } from '@app/condo/schema'

interface IBankContractorAccountTable {
    ({ bankAccount, type, categoryNotSet }: {
        bankAccount: BankAccount,
        type: 'withdraw' | 'receive',
        categoryNotSet: boolean
    }): React.ReactElement
}

const BankContractorAccountTable: IBankContractorAccountTable = ({ bankAccount, type, categoryNotSet }) => {
    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const queryMeta = useTableFilters()
    const { filtersToWhere } = useQueryMappers(queryMeta, [])
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

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
    const { categoryModal, setOpen } = useCategoryModal({ bankTransactions: selectedBankTransactions.current })

    const handleRowClick = useCallback((row) => {
        return {
            onClick: () => {
                selectedBankTransactions.current = [row]
                setOpen(true)
            },
        }
    }, [setOpen])

    return (
        <>
            <Table
                loading={loading || bankCostItemsLoading}
                dataSource={bankTransactions.map(({ ...transaction }) => {
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
            {categoryModal}
        </>
    )
}

export default BankContractorAccountTable
