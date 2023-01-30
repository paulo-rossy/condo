import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { BankContractorAccount } from '@condo/domains/banking/utils/clientSchema'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table'
import { parseQuery, getPageIndexFromOffset } from '@condo/domains/common/utils/tables.utils'

interface IUseBankContractorAccountTable {
    ({ organizationId, categoryNotSet }: {
        organizationId: string,
        categoryNotSet: boolean
    }): { component: JSX.Element, loading: boolean }
}

const useBankContractorAccountTable: IUseBankContractorAccountTable = ({ organizationId, categoryNotSet }) => {
    const router = useRouter()
    const { offset } = parseQuery(router.query)
    const pageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)
    const nullCategoryFilter = categoryNotSet ? { costItem_is_null: true } : {}

    const { objs: bankContractorAccounts, loading } = BankContractorAccount.useObjects({
        where: {
            organization: { id: organizationId },
            ...nullCategoryFilter,
        },
        first: DEFAULT_PAGE_SIZE,
        skip: (pageIndex - 1) * DEFAULT_PAGE_SIZE,
    })
    const [, bankContractorAccountTableColumns] = useTableColumns()
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

    const isLoading = loading || bankCostItemsLoading

    const component = useMemo(() => (
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
            rowSelection={{ type: 'checkbox' }}
        />
    ), [bankContractorAccounts, isLoading, bankContractorAccountTableColumns, bankCostItems])

    return { component, loading: isLoading }
}

export default useBankContractorAccountTable
