import React, { createContext, useContext } from 'react'

import { BankCostItem } from '@condo/domains/banking/utils/clientSchema'

import type { BankCostItem as BankCostItemType } from '@app/condo/schema'

interface IBankCostItemContext {
    bankCostItems: Array<BankCostItemType>
    loading: boolean
}
export type PropertyReportTypes = 'income' | 'withdrawal' | 'contractor'

const BankCostItemContext = createContext<IBankCostItemContext>({ bankCostItems: [], loading: false })

export const useBankCostItemContext = (): IBankCostItemContext => useContext<IBankCostItemContext>(BankCostItemContext)

export const BankCostItemProvider: React.FC = ({ children }) => {
    const { objs: bankCostItems, loading } = BankCostItem.useObjects({})

    return (
        <BankCostItemContext.Provider value={{ bankCostItems, loading }}>
            {children}
        </BankCostItemContext.Provider>
    )
}
