import { Row, Col } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { useMutation } from '@open-condo/next/apollo'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import CategoryProgress from '@condo/domains/banking/components/CategoryProgress'
import { BankTransaction as BankTransactionGQL } from '@condo/domains/banking/gql'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { useTableFilters } from '@condo/domains/banking/hooks/useTableFilters'
import { BankTransaction } from '@condo/domains/banking/utils/clientSchema'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table/Index'
import { useQueryMappers } from '@condo/domains/common/hooks/useQueryMappers'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

import type {
    BankAccount,
    BankTransaction as BankTransactionType,
    MutationUpdateBankTransactionsArgs,
} from '@app/condo/schema'
import type { PropertyReportTypes } from '@condo/domains/banking/components/BankCostItemContext'
import type { RowProps } from 'antd'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [40, 40]

export interface BaseMutationArgs<T> {
    variables: T
}

export type UpdateSelectedTransactions = (args: BaseMutationArgs<MutationUpdateBankTransactionsArgs>) => Promise<unknown>

interface IUseBankContractorAccountTable {
    ({ bankAccount, type, categoryNotSet }: {
        bankAccount: BankAccount,
        type: PropertyReportTypes,
        categoryNotSet: boolean
    }): {
        component: JSX.Element,
        loading: boolean,
        selectedRows: Array<BankTransactionType>,
        clearSelection: () => void,
        updateSelected: UpdateSelectedTransactions
    }
}

const useBankContractorAccountTable: IUseBankContractorAccountTable = (props) => {
    const router = useRouter()
    const { filters, offset } = parseQuery(router.query)
    const queryMeta = useTableFilters()
    const { filtersToWhere } = useQueryMappers(queryMeta, [])
    const { bankCostItems, loading: bankCostItemsLoading, setSelectedItem } = useBankCostItemContext()

    const { bankAccount, type, categoryNotSet } = props

    const nullCategoryFilter = categoryNotSet ? { costItem_is_null: true } : {}
    const pageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    const { objs: bankTransactions, loading, refetch } = BankTransaction.useObjects({
        where: {
            account: { id: bankAccount.id },
            isOutcome: type === 'withdrawal',
            ...nullCategoryFilter,
            ...filtersToWhere(filters),
        },
        first: DEFAULT_PAGE_SIZE,
        skip: (pageIndex - 1) * DEFAULT_PAGE_SIZE,
    })
    const [updateSelected, { loading: updateLoading }] = useMutation(BankTransactionGQL.UPDATE_OBJS_MUTATION, {
        onCompleted: () => refetch(),
    })
    const [bankTransactionTableColumns] = useTableColumns()

    const [selectedRows, setSelectedRows] = useState([])

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
                setSelectedItem(row)
            },
        }
    }, [setSelectedItem])
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

    const isLoading = loading || bankCostItemsLoading || updateLoading

    const component = useMemo(() => (
        <Row gutter={TABLE_ROW_GUTTER}>
            <CategoryProgress data={bankTransactions} entity={type} />
            <Col span={24}>
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
            </Col>
        </Row>
    ), [isLoading, bankTransactions, bankCostItems, bankTransactionTableColumns, handleRowClick, handleSelectRow, handleSelectAll, selectedRows, type])

    return { component, loading: isLoading, selectedRows, clearSelection, updateSelected }
}

export default useBankContractorAccountTable
