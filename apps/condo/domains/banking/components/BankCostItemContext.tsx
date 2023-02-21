import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

import type { RadioGroupProps } from '@open-condo/ui'

import { BankCostItem } from '@condo/domains/banking/utils/clientSchema'

import type {
    BankCostItem as BankCostItemType,
    BankTransaction as BankTransactionType,
    BankContractorAccount as BankContractorAccountType,
} from '@app/condo/schema'

interface IBankCostItemContext {
    bankCostItems: Array<BankCostItemType>
    bankCostItemGroups: RadioGroupProps['groups']
    incomeCostItems: Array<BankCostItemType>
    loading: boolean
    selectedItem: BankTransactionType | BankContractorAccountType | null
    setSelectedItem: React.Dispatch<React.SetStateAction<BankTransactionType | BankContractorAccountType>>
}
export type PropertyReportTypes = 'income' | 'withdrawal' | 'contractor'

const BankCostItemContext = createContext<IBankCostItemContext>({
    bankCostItems: [],
    loading: false,
    bankCostItemGroups: [],
    incomeCostItems: [],
    selectedItem: null,
    setSelectedItem: () => null,
})

export const useBankCostItemContext = (): IBankCostItemContext => useContext<IBankCostItemContext>(BankCostItemContext)

export const BankCostItemProvider: React.FC = ({ children }) => {
    const { objs: bankCostItems, loading } = BankCostItem.useObjects({}, { fetchPolicy: 'cache-first' })

    const bankCostItemGroups = useRef<RadioGroupProps['groups']>([])
    const incomeCostItems = useRef<Array<BankCostItemType>>([])
    const [selectedItem, setSelectedItem] = useState<BankTransactionType | BankContractorAccountType | null>(null)

    useEffect(() => {
        if (!loading) {
            const categoryObject = groupBy(bankCostItems.filter(costItem => costItem.isOutcome), (costItem) => costItem.category.id)

            Object.values(categoryObject).forEach(costItems => {
                bankCostItemGroups.current.push({
                    name: get(costItems, ['0', 'category', 'name']),
                    options: costItems.map(costItem => ({
                        label: costItem.name,
                        value: costItem.id,
                    })),
                })
            })

            incomeCostItems.current = bankCostItems.filter(costItem => !costItem.isOutcome)
        } else {
            bankCostItemGroups.current = []
            incomeCostItems.current = []
        }
    }, [bankCostItems, loading])

    return (
        <BankCostItemContext.Provider
            value={{
                bankCostItems,
                loading,
                bankCostItemGroups: bankCostItemGroups.current,
                incomeCostItems: incomeCostItems.current,
                selectedItem,
                setSelectedItem,
            }}
        >
            {children}
        </BankCostItemContext.Provider>
    )
}
