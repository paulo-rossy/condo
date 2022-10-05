// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Select, SelectProps, Typography } from 'antd'
import get from 'lodash/get'
import throttle from 'lodash/throttle'
import isFunction from 'lodash/isFunction'
import isEmpty from 'lodash/isEmpty'
import uniqBy from 'lodash/uniqBy'

import { ApolloClient } from '@apollo/client'
import { useApolloClient } from '@condo/next/apollo'
import { useIntl } from '@condo/next/intl'

import {
    useTracking,
    TrackingEventPropertiesType,
    TrackingEventType,
} from '@condo/domains/common/components/TrackingContext'

import { WhereType } from '../../utils/tables.utils'
import { isNeedToLoadNewElements } from '../../utils/select.utils'


type GraphQlSearchInputOption = {
    value: string
    text: string
    data?: any
}

export type RenderOptionFunc = (option: GraphQlSearchInputOption) => JSX.Element

// TODO: add apollo cache shape typings
export interface ISearchInputProps extends SelectProps<string> {
    search: (client: ApolloClient<Record<string, unknown>>, searchText: string, where?: WhereType, first?: number, skip?: number) => Promise<Array<Record<string, unknown>>>
    initialValueSearch?: (client: ApolloClient<Record<string, unknown>>, searchText: string, where?: WhereType, first?: number, skip?: number) => Promise<Array<Record<string, unknown>>>
    onSelect?: (...args: Array<unknown>) => void
    onChange?: (...args: Array<unknown>) => void
    mode?: 'multiple' | 'tags'
    value?: string | string[]
    placeholder?: string
    label?: string
    showArrow?: boolean
    allowClear?: boolean
    disabled?: boolean
    autoFocus?: boolean
    initialValue?: string | string[]
    getInitialValueQuery?: (initialValue: string | string[]) => WhereType
    formatLabel?: (option: GraphQlSearchInputOption) => JSX.Element
    renderOptions?: (items: any[], renderOption: RenderOptionFunc) => JSX.Element[]
    infinityScroll?: boolean
    eventName?: string
    eventProperties?: TrackingEventPropertiesType
}

const DEBOUNCE_TIMEOUT = 800

const debug = (props, ...consoleLogProps) => {
    if (props.id === 'property') console.log(...consoleLogProps)
}

export const GraphQlSearchInput: React.FC<ISearchInputProps> = (props) => {
    const {
        search,
        initialValueSearch,
        onSelect,
        formatLabel,
        renderOptions,
        autoClearSearchValue,
        initialValue,
        getInitialValueQuery,
        infinityScroll,
        disabled,
        placeholder: initialPlaceholder,
        value: initialSelectedValues,
        eventName: propEventName,
        eventProperties = {},
        ...restProps
    } = props

    const intl = useIntl()
    const LoadingMessage = intl.formatMessage({ id: 'Loading' })

    const client = useApolloClient()
    const [isSearchLoading, setSearchLoading] = useState(false)
    const [isMoreLoading, setMoreLoading] = useState(false)
    const [isInitialLoading, seInitialLoading] = useState(false)
    const [isAllDataLoaded, setIsAllDataLoaded] = useState(false)
    const [startData, setStartData] = useState([])
    const [allData, setAllData] = useState([])
    const [showingData, setShowingData] = useState([])
    const [searchData, setSearchData] = useState([])
    const [searchValue, setSearchValue] = useState('')

    const isShowLoader = useMemo(() => isInitialLoading || ((isSearchLoading || isMoreLoading) && isEmpty(allData)),
        [allData, isInitialLoading, isMoreLoading, isSearchLoading])
    const placeholder = useMemo(() => isShowLoader ? LoadingMessage : initialPlaceholder,
        [LoadingMessage, initialPlaceholder, isShowLoader])
    const selectedValue = useMemo(() => isShowLoader ? [] : initialSelectedValues,
        [initialSelectedValues, isShowLoader])
    const isDisabled = useMemo(() => disabled || isShowLoader,
        [disabled, isShowLoader])

    const { logEvent, getEventName } = useTracking()

    const eventName = propEventName ? propEventName : getEventName(TrackingEventType.Select)
    const componentProperties = { ...eventProperties }

    const renderOption = (option, index?) => {
        let optionLabel = option.text

        if (formatLabel) {
            optionLabel = formatLabel(option)
        }
        const value = ['string', 'number'].includes(typeof option.value) ? option.value : JSON.stringify(option)

        return (
            <Select.Option id={index} key={option.key || value} value={value} title={option.text}>
                <Typography.Text title={option.text} disabled={disabled}>
                    {optionLabel}
                </Typography.Text>
            </Select.Option>
        )
    }

    const options = useMemo(() => renderOptions
        ? renderOptions(showingData, renderOption)
        : showingData.map((option, index) => renderOption(option, index)), [renderOption, renderOptions, showingData])

    const loadInitialOptions = useCallback(async () => {
        const values = initialValue || initialSelectedValues
        if (Array.isArray(values) && values.length) {
            seInitialLoading(true)
            const initialValueQuery = isFunction(getInitialValueQuery) ? getInitialValueQuery(values) : { id_in: values }
            const searchFn = isFunction(initialValueSearch) ? initialValueSearch : search
            const initialOptions = await searchFn(client, null, initialValueQuery, values.length)
            setStartData(prevData => uniqBy([...initialOptions, ...prevData], 'value'))
            seInitialLoading(false)
        }
    }, [initialValue, initialSelectedValues, getInitialValueQuery, initialValueSearch, search, client])

    const handleSearch = useCallback(async searchingValue => {
        if (!search) return
        setSearchValue(searchingValue)
        setIsAllDataLoaded(false)
        setSearchLoading(true)
        const data = await search(client, earchingValue)
        setSearchData(data)
        setSearchLoading(false)
    }, [client, props, search])

    const handleSelect = useCallback(async (value, option) => {
        if (onSelect) onSelect(value, option)

        if (eventName) {
            const componentValue = get(option, 'title')

            if (componentValue) {
                const componentId = get(restProps, 'id')
                componentProperties['component'] = { value: componentValue }

                if (componentId) {
                    componentProperties['component']['id'] = componentId
                }

                logEvent({ eventName, eventProperties: componentProperties })
            }
        }
        setSearchValue('')
    }, [onSelect])

    const searchMoreSuggestions = useCallback(
        async (value, skip) => {
            if (isAllDataLoaded) return

            setMoreLoading(true)
            const data = await search(client, value, null, 10, skip)

            if (data.length > 0) {
                if (searchValue) {
                    setSearchData(prevData => uniqBy([...prevData, ...data], 'value'))
                } else {
                    setAllData(prevData => uniqBy([...prevData, ...data], 'value'))
                }
            } else {
                setIsAllDataLoaded(true)
            }

            setMoreLoading(false)
        },
        [client, isAllDataLoaded, props, search, searchValue],
    )

    const handleClear = useCallback(() => {
        setSearchValue('')
    }, [])

    const throttledSearchMore = useMemo(
        () => {
            return throttle(searchMoreSuggestions, DEBOUNCE_TIMEOUT)
        },
        [searchMoreSuggestions],
    )

    const handleScroll = useCallback(async (scrollEvent) => {
        if (isNeedToLoadNewElements(scrollEvent, isSearchLoading)) {
            await throttledSearchMore(searchValue, searchValue ? searchData.length : allData.length)
        }
    }, [isSearchLoading, throttledSearchMore, searchValue, searchData.length, allData.length])

    useEffect(() => {
        searchMoreSuggestions('', 0)
        loadInitialOptions()
            .catch(err => console.error('failed to load initial options', err))
    }, [])

    useEffect(() => {
        if (searchValue) {
            setShowingData(uniqBy([...searchData], 'value'))
        } else {
            setShowingData(uniqBy([...allData, ...startData], 'value'))
        }
    }, [startData, allData, searchData, searchValue, props])

    return (
        <Select
            showSearch
            autoClearSearchValue={autoClearSearchValue || false}
            allowClear={true}
            optionFilterProp='title'
            defaultActiveFirstOption={false}
            onSearch={handleSearch}
            onSelect={handleSelect}
            onClear={handleClear}
            onPopupScroll={infinityScroll && handleScroll}
            searchValue={searchValue}
            value={selectedValue}
            placeholder={placeholder}
            loading={isSearchLoading}
            disabled={isDisabled}
            {...restProps}
        >
            {options}
        </Select>
    )
}
