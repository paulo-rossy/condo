import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import React, { createContext, useContext, useEffect, useRef } from 'react'

import type { RadioGroupProps } from '@open-condo/ui'

import { BankCostItem } from '@condo/domains/banking/utils/clientSchema'

import type { BankCostItem as BankCostItemType } from '@app/condo/schema'

interface IBankCostItemContext {
    bankCostItems: Array<BankCostItemType>
    bankCostItemGroups: RadioGroupProps['groups']
    loading: boolean
}
export type PropertyReportTypes = 'income' | 'withdrawal' | 'contractor'

const BankCostItemContext = createContext<IBankCostItemContext>({ bankCostItems: [], loading: false, bankCostItemGroups: [] })

export const useBankCostItemContext = (): IBankCostItemContext => useContext<IBankCostItemContext>(BankCostItemContext)

export const BankCostItemProvider: React.FC = ({ children }) => {
    const { objs: bankCostItems, loading } = BankCostItem.useObjects({})
    const bankCostItemGroups = useRef<RadioGroupProps['groups']>([])

    useEffect(() => {
        if (!loading) {
            const categoryObject = groupBy(bankCostItems, (costItem) => costItem.category.id)

            Object.values(categoryObject).forEach(costItems => {
                bankCostItemGroups.current.push({
                    name: get(costItems, ['0', 'category', 'name']),
                    options: costItems.map(costItem => ({
                        label: costItem.name,
                        value: costItem.id,
                    })),
                })
            })
        } else {
            bankCostItemGroups.current = []
        }
    }, [bankCostItems, loading])

    return (
        <BankCostItemContext.Provider
            value={{ bankCostItems, loading, bankCostItemGroups: bankCostItemGroups.current }}
        >
            {children}
        </BankCostItemContext.Provider>
    )
}
