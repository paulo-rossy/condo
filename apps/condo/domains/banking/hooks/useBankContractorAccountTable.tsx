import { Col, Row } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { useMutation } from '@open-condo/next/apollo'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import CategoryProgress from '@condo/domains/banking/components/CategoryProgress'
import { BankContractorAccount as BankContractorAccountGQL } from '@condo/domains/banking/gql'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { BankContractorAccount } from '@condo/domains/banking/utils/clientSchema'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table/Index'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

import type {
    BankContractorAccount as BankContractorAccountType,
    MutationUpdateBankContractorAccountsArgs,
} from '@app/condo/schema'
import type { RowProps } from 'antd'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [40, 40]

interface IUseBankContractorAccountTable {
    ({ organizationId, categoryNotSet }: {
        organizationId: string,
        categoryNotSet: boolean
    }): {
        component: JSX.Element,
        loading: boolean,
        selectedRows: Array<BankContractorAccountType>,
        clearSelection: () => void,
        updateSelected: (args: unknown) => Promise<unknown>
    }
}

const useBankContractorAccountTable: IUseBankContractorAccountTable = ({ organizationId, categoryNotSet }) => {
    const router = useRouter()
    const { offset } = parseQuery(router.query)
    const pageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)
    const nullCategoryFilter = categoryNotSet ? { costItem_is_null: true } : {}

    const { objs: bankContractorAccounts, loading, refetch } = BankContractorAccount.useObjects({
        where: {
            organization: { id: organizationId },
            ...nullCategoryFilter,
        },
        first: DEFAULT_PAGE_SIZE,
        skip: (pageIndex - 1) * DEFAULT_PAGE_SIZE,
    })
    const [updateSelected, { loading: updateLoading }] = useMutation(BankContractorAccountGQL.UPDATE_OBJS_MUTATION, {
        onCompleted: () => refetch(),
    })
    const [, bankContractorAccountTableColumns] = useTableColumns()
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

    const [selectedRows, setSelectedRows] = useState<Array<BankContractorAccountType>>([])
    const isLoading = loading || bankCostItemsLoading || updateLoading

    const handleSelectRow = useCallback((record, checked) => {
        const selectedKey = record.id
        if (checked) {
            setSelectedRows([...selectedRows, record])
        } else {
            setSelectedRows(selectedRows.filter(({ id }) => id !== selectedKey))
        }
    }, [selectedRows])
    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            setSelectedRows(bankContractorAccounts)
        } else {
            setSelectedRows([])
        }
    }, [bankContractorAccounts])
    const clearSelection = () => {
        setSelectedRows([])
    }

    const component = useMemo(() => (
        <Row gutter={TABLE_ROW_GUTTER}>
            <Col span={24}>
                <CategoryProgress data={bankContractorAccounts} entity='contractor' />
            </Col>
            <Col span={24}>
                <Table
                    loading={isLoading}
                    dataSource={bankContractorAccounts.map(({ ...bankContractor }) => {
                        const costItem = bankCostItems.find(costItem => costItem.id === get(bankContractor, 'costItem.id'))

                        if (costItem) {
                            bankContractor.costItem = costItem
                        }

                        return bankContractor
                    })}
                    columns={bankContractorAccountTableColumns}
                    rowSelection={{
                        type: 'checkbox',
                        onSelect: handleSelectRow,
                        onSelectAll: handleSelectAll,
                        selectedRowKeys: selectedRows.map(row => row.id),
                    }}
                />
            </Col>
        </Row>
    ), [bankContractorAccounts, isLoading, bankContractorAccountTableColumns, bankCostItems, selectedRows, handleSelectRow, handleSelectAll])

    return { component, loading: isLoading, selectedRows, clearSelection, updateSelected }
}

export default useBankContractorAccountTable
