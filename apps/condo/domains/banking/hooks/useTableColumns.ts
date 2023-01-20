import { useCallback, useMemo } from 'react'
import isNull from 'lodash/isNull'
import type { FilterValue } from 'antd/lib/table/interface'
import { useIntl } from '@open-condo/next/intl'
import { useRouter } from 'next/router'
import { getFilteredValue } from '@condo/domains/common/utils/helpers'
import {
    getTextRender,
    getDateRender,
    getMoneyRender,
    getTableCellRenderer,
} from '@condo/domains/common/components/Table/Renders'
import type { RenderReturnType } from '@condo/domains/common/components/Table/Renders'
import { parseQuery } from '@condo/domains/common/utils/tables.utils'

const renderCategory = (search: FilterValue | string, nullReplace: string) => {
    return function render (text: string): RenderReturnType {
        return getTableCellRenderer(search)(isNull(text) ? nullReplace : text)
    }
}

export function useTableColumns () {
    const intl = useIntl()
    const ContractorTitle = intl.formatMessage({ id: 'global.contractor' }, { isSingular: true })
    const TinTitle = intl.formatMessage({ id: 'global.tin' })
    const BankAccountTitle = intl.formatMessage({ id: 'global.bankAccount' })
    const CategoryTitle = intl.formatMessage({ id: 'global.category' })
    const NumberTitle = intl.formatMessage({ id: 'global.number' })
    const DateTitle = intl.formatMessage({ id: 'Date' })
    const ReceiverTitle = intl.formatMessage({ id: 'global.receiver' })
    const PaymentPurposeTitle = intl.formatMessage({ id: 'global.paymentPurpose' })
    const SumTitle = intl.formatMessage({ id: 'global.sum' })
    const CategoryNotSetTitle = intl.formatMessage({ id: 'pages.banking.table.notSet' })

    const router = useRouter()

    const { filters } = parseQuery(router.query)
    const search = getFilteredValue(filters, 'search')

    return useMemo(() => [
        [
            {
                title: NumberTitle,
                key: 'number',
                width: '10%',
                render: getTextRender(search),
                dataIndex: 'number',
            },
            {
                title: DateTitle,
                key: 'date',
                width: '10%',
                dataIndex: 'date',
                render: getDateRender(intl, search),
            },
            {
                title: ReceiverTitle,
                key: 'receiver',
                width: '12%',
                render: getTextRender(search),
                dataIndex: ['contractorAccount', 'name'],
            },
            {
                title: BankAccountTitle,
                key:'bankAccount',
                width: '17%',
                render: getTextRender(search),
                dataIndex: ['account', 'number'],
            },
            {
                title: PaymentPurposeTitle,
                key: 'target',
                width: '18%',
                render: getTextRender(search),
                dataIndex: 'purpose',
            },
            {
                title: CategoryTitle,
                key: 'category',
                width: '12%',
                render: renderCategory(search, CategoryNotSetTitle),
                dataIndex: ['costItem', 'category', 'name'],
            },
            {
                title: SumTitle,
                key: 'sum',
                width: '15%',
                render: getMoneyRender(intl, 'rub'),
                dataIndex: 'amount',
            },
        ],
        [
            {
                title: ContractorTitle,
                dataIndex: 'name',
                key: 'name',
                width: '20%',
                render: getTextRender(search),
            },
            {
                title: TinTitle,
                dataIndex: 'tin',
                key: 'tin',
                width: '20%',
                render: getTextRender(search),
            },
            {
                title: BankAccountTitle,
                dataIndex: 'number',
                key: 'number',
                width: '25%',
                render: getTextRender(search),
            },
            {
                title: CategoryTitle,
                dataIndex: ['costItem', 'category', 'name'],
                key: 'category',
                width: '35%',
                render: renderCategory(search, CategoryNotSetTitle),
            },
        ],
    ], [search, ContractorTitle, TinTitle, BankAccountTitle, CategoryTitle, NumberTitle,
        DateTitle, PaymentPurposeTitle, SumTitle, ReceiverTitle])
}
