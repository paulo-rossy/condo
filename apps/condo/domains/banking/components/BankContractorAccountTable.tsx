import { Row, Col } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Checkbox } from '@open-condo/ui'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'
import { useTableColumns } from '@condo/domains/banking/hooks/useTableColumns'
import { BankContractorAccount } from '@condo/domains/banking/utils/clientSchema'
import Input from '@condo/domains/common/components/antd/Input'
import { Table, DEFAULT_PAGE_SIZE } from '@condo/domains/common/components/Table'
import { TableFiltersContainer } from '@condo/domains/common/components/TableFiltersContainer'
import { useSearch } from '@condo/domains/common/hooks/useSearch'

import { useQueryMappers } from '../../common/hooks/useQueryMappers'
import { parseQuery, getPageIndexFromOffset } from '../../common/utils/tables.utils'

import type { RowProps } from 'antd'

const TABLE_ROW_GUTTER: RowProps['gutter'] = [24, 40]

interface IBankContractorAccountTable {
    ({ organizationId }: { organizationId: string }): React.ReactElement
}

const BankContractorAccountTable: IBankContractorAccountTable = ({ organizationId }) => {
    const intl = useIntl()
    const SearchPlaceholderTitle = intl.formatMessage({ id: 'filters.FullSearch' })
    const CategoryCheckboxTitle = intl.formatMessage({ id: 'pages.banking.categoryNotSet' })

    const router = useRouter()
    const { offset } = parseQuery(router.query)
    const pageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)

    const [categoryNotSet, setCategoryNotSet] = useState(false)

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
    const [search, changeSearch] = useSearch<{ search?: string }>()
    const { bankCostItems, loading: bankCostItemsLoading } = useBankCostItemContext()

    const handleSearchChange = useCallback((e) => {
        changeSearch(e.target.value)
    }, [changeSearch])
    const handleCategoryFilterChange = useCallback(() => {
        setCategoryNotSet(!categoryNotSet)
    }, [categoryNotSet])

    return (
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
                    dataSource={bankContractorAccounts.map(bankContractor => {
                        const costItem = bankCostItems.find(costItem => costItem.id === get(bankContractor, 'costItem.id'))

                        if (costItem) {
                            bankContractor.costItem = costItem
                        }

                        return bankContractor
                    })}
                    columns={bankContractorAccountTableColumns}
                    rowSelection={{ type: 'checkbox' }}
                />
            </Col>
        </Row>
    )
}

export default BankContractorAccountTable
