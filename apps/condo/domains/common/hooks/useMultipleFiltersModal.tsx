import { SizeType } from 'antd/lib/config-provider/SizeContext'
import React, { CSSProperties, useCallback, useMemo, useRef, useState } from 'react'
import Form from 'antd/lib/form'
import {
    Col,
    FormInstance,
    Row,
    Tabs,
    Typography,
    ModalProps,
} from 'antd'
import { Options } from 'scroll-into-view-if-needed'

import { Modal as DefaultModal } from '@condo/domains/common/components/Modal'
import { Tooltip } from '@condo/domains/common/components/Tooltip'
import Input from '@condo/domains/common/components/antd/Input'
import Select from '@condo/domains/common/components/antd/Select'
import Checkbox from '@condo/domains/common/components/antd/Checkbox'
import { useRouter } from 'next/router'
import { useIntl } from '@condo/next/intl'
import get from 'lodash/get'
import { FormItemProps } from 'antd/es'
import { CloseOutlined } from '@ant-design/icons'
import { Gutter } from 'antd/es/grid/row'
import isFunction from 'lodash/isFunction'
import isEmpty from 'lodash/isEmpty'
import pickBy from 'lodash/pickBy'
import { useOrganization } from '@condo/next/organization'

import {
    OptionType,
    parseQuery,
    QueryArgType,
} from '@condo/domains/common/utils/tables.utils'
import { IFilters } from '@condo/domains/ticket/utils/helpers'
import { useLayoutContext } from '../components/LayoutContext'

import DatePicker from '../components/Pickers/DatePicker'
import DateRangePicker from '../components/Pickers/DateRangePicker'
import { GraphQlSearchInput } from '../components/GraphQlSearchInput'
import { Button } from '../components/Button'
import { FormWithAction } from '../components/containers/FormList'
import { Loader } from '../components/Loader'
import { DeleteButtonWithConfirmModal } from '../components/DeleteButtonWithConfirmModal'
import { FILTERS_POPUP_CONTAINER_ID } from '../constants/filters'
import {
    ComponentType, FilterComponentSize,
    FilterComponentType,
    FiltersMeta,
    getFiltersModalPopupContainer,
    getQueryToValueProcessorByType,
    updateQuery,
} from '../utils/filters.utils'
import { Ticket } from '@app/condo/schema'

interface IFilterComponentProps<T> {
    name: string
    label?: string
    size?: FilterComponentSize
    queryToValueProcessor?: (a: QueryArgType) => T | T[],
    formItemProps?: FormItemProps
    filters: IFilters,
    children: React.ReactNode
}

const LABEL_COL_PROPS = {
    style: {
        padding: 0,
        margin: 0,
    },
}

export type FiltersTooltipDataObject<T> = {
    name: string
    label: string
    getFilteredValue: (record: T) => string
    getTooltipValue: (record: T) => string
}

type FiltersTooltipProps<T> = {
    filters: IFilters
    tooltipData: FiltersTooltipDataObject<T>[]
    total: number
    tickets: Ticket[]
}

const TOOLTIP_PARAGRAPH_STYLE: CSSProperties = { margin: 0 }

export const FiltersTooltip: React.FC<FiltersTooltipProps<unknown>> = ({ total, filters, tooltipData, tickets,  ...otherProps }) => {
    const rowindex = otherProps.children[0]?.props?.index
    const ticket = tickets[rowindex]

    const filteredFieldsOutOfTable = ticket && tooltipData.filter(({ name, getFilteredValue }) => {
        return !isEmpty(filters[name]) && filters[name].includes(getFilteredValue(ticket))
    })

    const getTooltipText = useCallback(() => (
        filteredFieldsOutOfTable
            .map(({ label, getTooltipValue }, index) => (
                <Typography.Paragraph style={TOOLTIP_PARAGRAPH_STYLE} key={index}>
                    <Typography.Text strong> {label}: </Typography.Text> {getTooltipValue(ticket)}
                </Typography.Paragraph>
            ))
    ), [filteredFieldsOutOfTable, ticket])

    if (total > 0 && filteredFieldsOutOfTable && filteredFieldsOutOfTable.length > 0) {
        return (
            <Tooltip title={getTooltipText()}>
                <tr {...otherProps} />
            </Tooltip>
        )
    }

    return (
        <tr {...otherProps} />
    )
}

function FilterComponent<T> ({
    name,
    label,
    size = FilterComponentSize.Large,
    queryToValueProcessor,
    formItemProps,
    filters,
    children,
}: IFilterComponentProps<T>) {
    const value = get(filters, name)
    const initialValue = queryToValueProcessor && value ? queryToValueProcessor(value) : value

    return (
        <Col span={size}>
            <Form.Item
                name={name}
                initialValue={initialValue}
                label={label}
                labelCol={LABEL_COL_PROPS}
                {...formItemProps}
            >
                {children}
            </Form.Item>
        </Col>
    )
}

const DATE_PICKER_STYLE: CSSProperties = { width: '100%' }
const DATE_RANGE_PICKER_STYLE: CSSProperties = { width: '100%' }
const DATE_PICKER_DATE_FORMAT = 'DD.MM.YYYY'
const TAGS_SELECT_STYLE: CSSProperties = { width: '100%' }
const SELECT_STYLE: CSSProperties = { width: '100%' }
const GQL_SELECT_STYLE: CSSProperties = { width: '100%' }
const TAGS_SELECT_DROPDOWN_STYLE = { display: 'none' }

export const getModalFilterComponentByMeta = (filters: IFilters, keyword: string, component: FilterComponentType, form: FormInstance): React.ReactElement => {
    const type = get(component, 'type')
    const props = {
        // It is necessary so that dropdowns do not go along with the screen when scrolling the modal window
        getPopupContainer: getFiltersModalPopupContainer,
        ...get(component, 'props', {}),
    }

    switch (type) {
        case ComponentType.Input: {
            return (
                <Input
                    {...props}
                />
            )
        }

        case ComponentType.Date: {
            return (
                <DatePicker
                    format={DATE_PICKER_DATE_FORMAT}
                    style={DATE_PICKER_STYLE}
                    {...props}
                />
            )
        }

        case ComponentType.CheckboxGroup: {
            const options: OptionType[] = get(component, 'options')

            return (
                <Checkbox.Group
                    options={options}
                    {...props}
                />
            )
        }

        case ComponentType.DateRange: {
            return (
                <DateRangePicker
                    format={DATE_PICKER_DATE_FORMAT}
                    style={DATE_RANGE_PICKER_STYLE}
                    separator={null}
                    {...props}
                />
            )
        }

        case ComponentType.Select: {
            const options: OptionType[] = get(component, 'options')

            return (
                <Select
                    defaultValue={get(filters, keyword)}
                    style={SELECT_STYLE}
                    optionFilterProp='title'
                    {...props}
                >
                    {options.map(option => (
                        <Select.Option
                            key={option.value}
                            value={option.value}
                            title={option.label}
                        >
                            {option.label}
                        </Select.Option>
                    ))}
                </Select>
            )
        }

        case ComponentType.GQLSelect: {
            const initialData = form.getFieldValue(keyword)

            return (
                <GraphQlSearchInput
                    initialValue={initialData}
                    style={GQL_SELECT_STYLE}
                    allowClear
                    {...props}
                />
            )
        }

        case ComponentType.TagsSelect: {
            return (
                <Select
                    mode='tags'
                    allowClear
                    style={TAGS_SELECT_STYLE}
                    dropdownStyle={TAGS_SELECT_DROPDOWN_STYLE}
                    {...props}
                />
            )
        }

        default: return
    }
}

function getModalComponents <T> (filters: IFilters, filterMetas: Array<FiltersMeta<T>>, form: FormInstance, breakpoints): React.ReactElement[] {
    if (!form) return

    return filterMetas.map(filterMeta => {
        const { keyword, component } = filterMeta

        const modalFilterComponentWrapper = get(component, 'modalFilterComponentWrapper')
        if (!modalFilterComponentWrapper) return

        const size = get(modalFilterComponentWrapper, 'size')
        const spaceSizeAfter = get(modalFilterComponentWrapper, 'spaceSizeAfter')
        const label = get(modalFilterComponentWrapper, 'label')
        const formItemProps = get(modalFilterComponentWrapper, 'formItemProps')
        const type = get(component, 'type')

        let Component
        if (type === ComponentType.Custom) {
            const componentGetter = get(component, 'modalFilterComponent')
            Component = isFunction(componentGetter) ? componentGetter(form) : componentGetter
        }
        else
            Component = getModalFilterComponentByMeta(filters, keyword, component, form)

        const queryToValueProcessor = getQueryToValueProcessorByType(type)

        return (
            <>
                <FilterComponent
                    key={keyword}
                    name={keyword}
                    filters={filters}
                    size={(breakpoints.xs && !breakpoints.md) ? 24 : size}
                    label={label}
                    formItemProps={formItemProps}
                    queryToValueProcessor={queryToValueProcessor}
                >
                    {Component}
                </FilterComponent>
                {
                    spaceSizeAfter && <Col span={spaceSizeAfter}/>
                }
            </>
        )
    })
}

const MODAL_PROPS: ModalProps = { width: 978 }
const CLEAR_ALL_MESSAGE_STYLE: CSSProperties = { fontSize: '12px' }
const FILTER_WRAPPERS_GUTTER: [Gutter, Gutter] = [24, 12]
const MODAL_FORM_VALIDATE_TRIGGER: string[] = ['onBlur', 'onSubmit']

type ResetFiltersModalButtonProps = {
    handleReset?: () => void
    style?: CSSProperties
    size?: SizeType
}

const ResetFiltersModalButton: React.FC<ResetFiltersModalButtonProps> = ({
    handleReset: handleResetFromProps,
    style,
    size = 'large',
}) => {
    const intl = useIntl()
    const ClearAllFiltersMessage = intl.formatMessage({ id: 'ClearAllFilters' })
    const router = useRouter()

    const handleReset = useCallback(async () => {
        await updateQuery(router, {})

        if (isFunction(handleResetFromProps)) {
            await handleResetFromProps()
        }
    }, [handleResetFromProps, router])

    return (
        <Button
            style={style}
            key='reset'
            type='text'
            onClick={handleReset}
            size={size}
            data-cy='common__filters-button-reset'
        >
            <Typography.Text strong type='secondary'>
                {ClearAllFiltersMessage} <CloseOutlined style={CLEAR_ALL_MESSAGE_STYLE} />
            </Typography.Text>
        </Button>
    )
}

const { TabPane } = Tabs
const MAIN_ROW_GUTTER: [Gutter, Gutter] = [0, 10]
const SCROLL_TO_FIRST_ERROR_CONFIG: Options = { behavior: 'smooth', block: 'center' }
const NON_FIELD_ERROR_NAME = '_NON_FIELD_ERROR_'

type MultipleFiltersModalProps = {
    isMultipleFiltersModalVisible: boolean
    setIsMultipleFiltersModalVisible: React.Dispatch<React.SetStateAction<boolean>>
    filterMetas: Array<FiltersMeta<unknown>>
    filtersSchemaGql?
}

const Modal: React.FC<MultipleFiltersModalProps> = ({
    isMultipleFiltersModalVisible,
    setIsMultipleFiltersModalVisible,
    filterMetas,
    filtersSchemaGql,
}) => {
    const intl = useIntl()
    const FiltersModalTitle = intl.formatMessage({ id: 'FiltersLabel' })
    const ApplyMessage = intl.formatMessage({ id: 'filters.Apply' })
    const NewFilterMessage = intl.formatMessage({ id: 'filters.NewFilter' })
    const TemplateMessage = intl.formatMessage({ id: 'filters.Template' })
    const NewTemplateLabel = intl.formatMessage({ id: 'filters.NewTemplateLabel' })
    const TemplateLabel = intl.formatMessage({ id: 'filters.TemplateLabel' })
    const NewTemplatePlaceholder = intl.formatMessage({ id: 'filters.NewTemplatePlaceholder' })
    const DeleteLabel = intl.formatMessage({ id: 'Delete' })
    const DeleteTitle = intl.formatMessage({ id: 'filters.DeleteTitle' })
    const DeleteMessage = intl.formatMessage({ id: 'filters.DeleteMessage' })
    const SaveTemplateMessage = intl.formatMessage({ id: 'filters.SaveTemplate' })
    const FieldRequiredMessage = intl.formatMessage({ id: 'field.required' })

    const [selectedFiltersTemplate, setSelectedFiltersTemplate] = useState()

    const router = useRouter()
    const { filters } = parseQuery(router.query)
    const { link } = useOrganization()
    const { breakpoints } = useLayoutContext()

    const handleSaveRef = useRef(null)
    const [form] = Form.useForm()

    const { objs: filtersTemplates, loading, refetch } = filtersSchemaGql.useObjects({
        sortBy: 'createdAt_ASC',
        where: {
            employee: { id: link.id },
            deletedAt: null,
        },
    })

    const createFiltersTemplateAction = filtersSchemaGql.useCreate({
        employee: { connect: { id: link.id } },
    }, refetch)

    const updateFiltersTemplateAction = filtersSchemaGql.useUpdate({
        employee: { connect: { id: link.id } },
    }, refetch)

    const handleResetFilters = useCallback(() => {
        const keys = Object.keys(form.getFieldsValue())
        const emptyFields = keys.reduce((acc, key) => {
            acc[key] = undefined
            return acc
        }, {})

        form.setFieldsValue(emptyFields)
    }, [form])

    const showTemplateNameError = useCallback((fieldName: string) => {
        form.setFields([{ name: fieldName, errors: [FieldRequiredMessage] }])
        form.scrollToField(fieldName, SCROLL_TO_FIRST_ERROR_CONFIG)
    }, [FieldRequiredMessage, form])

    const handleSaveFiltersTemplate = useCallback(async () => {
        const { newTemplateName, existedTemplateName, ...otherValues } = form.getFieldsValue()
        const filtersValue = pickBy(otherValues)
        const trimmedNewTemplateName = newTemplateName && newTemplateName.trim()
        const trimmedExistedTemplateName = existedTemplateName && existedTemplateName.trim()
        if (selectedFiltersTemplate && !trimmedExistedTemplateName) {
            showTemplateNameError('existedTemplateName')
            return
        }
        if (!selectedFiltersTemplate && !trimmedNewTemplateName) {
            showTemplateNameError('newTemplateName')
            return
        }

        if (trimmedNewTemplateName) {
            const createdFilter = await createFiltersTemplateAction({
                name: trimmedNewTemplateName,
                fields: filtersValue,
            })
            setSelectedFiltersTemplate(createdFilter || null)
        }

        if (trimmedExistedTemplateName) {
            await updateFiltersTemplateAction({
                name: trimmedExistedTemplateName,
                fields: filtersValue,
            }, selectedFiltersTemplate)
        }

        await handleSaveRef.current()
    }, [createFiltersTemplateAction, form, selectedFiltersTemplate, showTemplateNameError, updateFiltersTemplateAction])

    const handleDeleteFiltersTemplate = useCallback(async () => {
        await updateFiltersTemplateAction({
            deletedAt: new Date().toDateString(),
        }, selectedFiltersTemplate)

        setSelectedFiltersTemplate(null)
    }, [selectedFiltersTemplate, updateFiltersTemplateAction])

    const handleSubmit = useCallback(async (values) => {
        const { newTemplateName, existedTemplateName, ...otherValues } = values
        const filtersValue = pickBy(otherValues)

        await updateQuery(router, filtersValue)
        setIsMultipleFiltersModalVisible(false)
    }, [router, setIsMultipleFiltersModalVisible])

    const ExistingFiltersTemplateNameInputRules = useMemo(
        () => [{ required: true, message: FieldRequiredMessage, whitespace: true }], [FieldRequiredMessage])

    const NewFiltersTemplateNameInputRules = useMemo(
        () => [{ required: false, message: FieldRequiredMessage, whitespace: true }], [FieldRequiredMessage])

    const ExistingFiltersTemplateNameInput = useCallback(() => (
        <Form.Item
            name='existedTemplateName'
            label={TemplateLabel}
            labelCol={LABEL_COL_PROPS}
            initialValue={get(selectedFiltersTemplate, 'name')}
            required
            rules={ExistingFiltersTemplateNameInputRules}
        >
            <Input placeholder={NewTemplatePlaceholder} />
        </Form.Item>
    ), [ExistingFiltersTemplateNameInputRules, NewTemplatePlaceholder, TemplateLabel, selectedFiltersTemplate])

    const NewFiltersTemplateNameInput = useCallback(() => (
        <Form.Item
            name='newTemplateName'
            label={NewTemplateLabel}
            labelCol={LABEL_COL_PROPS}
            rules={NewFiltersTemplateNameInputRules}
        >
            <Input placeholder={NewTemplatePlaceholder} />
        </Form.Item>
    ), [NewFiltersTemplateNameInputRules, NewTemplateLabel, NewTemplatePlaceholder])

    const handleSubmitButtonClick = useCallback(async () => {
        const values = form.getFieldsValue()
        if (values.hasOwnProperty(NON_FIELD_ERROR_NAME)) delete values[NON_FIELD_ERROR_NAME]
        await handleSubmit(values)
    }, [form, handleSubmit])

    const modalFooter = useMemo(() => [
        <Row key='footer' justify='space-between' gutter={[0, 10]}>
            <Col>
                <ResetFiltersModalButton
                    key='reset'
                    handleReset={handleResetFilters}
                />
            </Col>
            <Col>
                <Row gutter={[20, 10]}>
                    {
                        selectedFiltersTemplate && (
                            <Col>
                                <DeleteButtonWithConfirmModal
                                    key='delete'
                                    title={DeleteTitle}
                                    message={DeleteMessage}
                                    okButtonLabel={DeleteLabel}
                                    action={handleDeleteFiltersTemplate}
                                    buttonCustomProps={{ type: 'sberDangerGhost' }}
                                />
                            </Col>
                        )
                    }
                    <Col>
                        <Button
                            key='saveFilters'
                            onClick={handleSaveFiltersTemplate}
                            eventName='ModalFilterSaveClick'
                            type='sberGrey'
                            secondary
                        >
                            {SaveTemplateMessage}
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            key='submit'
                            onClick={handleSubmitButtonClick}
                            eventName='ModalFilterSubmitClick'
                            type='sberPrimary'
                            data-cy='common__filters-button-submit'
                        >
                            {ApplyMessage}
                        </Button>
                    </Col>
                </Row>
            </Col>
        </Row>,
    ], [handleResetFilters, selectedFiltersTemplate, DeleteTitle, DeleteMessage, DeleteLabel, handleDeleteFiltersTemplate, handleSaveFiltersTemplate, SaveTemplateMessage, handleSubmitButtonClick, ApplyMessage])

    const handleCancelModal = useCallback(() => setIsMultipleFiltersModalVisible(false),
        [setIsMultipleFiltersModalVisible])

    const handleTabChange = useCallback((filtersTemplateId) => {
        const selectedTemplateId = get(selectedFiltersTemplate, 'id')

        if (selectedTemplateId === filtersTemplateId) {
            return
        }

        if (filtersTemplateId) {
            const filtersTemplate = filtersTemplates.find(filterTemplate => filterTemplate.id === filtersTemplateId)

            setSelectedFiltersTemplate(filtersTemplate)
        }

        handleResetFilters()
    }, [filtersTemplates, handleResetFilters, selectedFiltersTemplate])

    const tabsActiveKey = useMemo(() => get(selectedFiltersTemplate, 'id', 'newFilter'), [selectedFiltersTemplate])

    const templatesTabs = useMemo(() => filtersTemplates.map((filterTemplate, index) => (
        <TabPane
            tab={get(filterTemplate, 'name', `${TemplateMessage} ${index + 1}`)}
            key={filterTemplate.id}
        >
            <ExistingFiltersTemplateNameInput />
        </TabPane>
    )), [ExistingFiltersTemplateNameInput, TemplateMessage, filtersTemplates])

    const initialFormValues = useMemo(() => get(selectedFiltersTemplate, 'fields', filters), [filters, selectedFiltersTemplate])
    const modalComponents = useMemo(() => getModalComponents(pickBy(initialFormValues), filterMetas, form, breakpoints), [breakpoints, filterMetas, form, initialFormValues])

    const ModalFormItems = useCallback(() => {
        return (
            <Col span={24}>
                <Row gutter={FILTER_WRAPPERS_GUTTER} id={FILTERS_POPUP_CONTAINER_ID}>
                    {modalComponents}
                </Row>
            </Col>
        )
    }, [modalComponents])

    return (
        <DefaultModal
            title={FiltersModalTitle}
            visible={isMultipleFiltersModalVisible}
            onCancel={handleCancelModal}
            footer={modalFooter}
            centered
            {...MODAL_PROPS}
        >
            {
                !loading ? (
                    <FormWithAction
                        validateTrigger={MODAL_FORM_VALIDATE_TRIGGER}
                        handleSubmit={handleSubmit}
                        formInstance={form}
                        scrollToFirstError={SCROLL_TO_FIRST_ERROR_CONFIG}
                    >
                        {
                            ({ handleSave }) => {
                                handleSaveRef.current = handleSave

                                return (
                                    <Row gutter={MAIN_ROW_GUTTER}>
                                        <Col span={24}>
                                            {
                                                !isEmpty(filtersTemplates) ? (
                                                    <Tabs onChange={handleTabChange} activeKey={tabsActiveKey}>
                                                        <TabPane tab={NewFilterMessage} key='newFilter'>
                                                            <NewFiltersTemplateNameInput />
                                                        </TabPane>
                                                        {templatesTabs}
                                                    </Tabs>
                                                ) : (
                                                    <NewFiltersTemplateNameInput />
                                                )
                                            }
                                        </Col>
                                        <ModalFormItems />
                                    </Row>
                                )
                            }
                        }
                    </FormWithAction>
                ) : <Loader />
            }
        </DefaultModal>
    )
}

export function useMultipleFiltersModal <T> (filterMetas: Array<FiltersMeta<T>>, filtersSchemaGql) {
    const [isMultipleFiltersModalVisible, setIsMultipleFiltersModalVisible] = useState<boolean>()

    const MultipleFiltersModal = useMemo(() => (
        <Modal
            isMultipleFiltersModalVisible={isMultipleFiltersModalVisible}
            setIsMultipleFiltersModalVisible={setIsMultipleFiltersModalVisible}
            filterMetas={filterMetas}
            filtersSchemaGql={filtersSchemaGql}
        />
    ), [filterMetas, filtersSchemaGql, isMultipleFiltersModalVisible])

    return { MultipleFiltersModal, ResetFiltersModalButton, setIsMultipleFiltersModalVisible }
}
