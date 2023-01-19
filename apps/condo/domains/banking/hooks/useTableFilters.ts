import { useMemo } from 'react'
import { getDayRangeFilter } from '@condo/domains/common/utils/tables.utils'


const dateFilter = getDayRangeFilter('createdAt')

export function useTableFilters () {
    return useMemo(() => {
        return []
    }, [])
}
