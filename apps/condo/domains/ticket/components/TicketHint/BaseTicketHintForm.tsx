import { Alert, Col, Form, Input, Row, Typography } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import { differenceWith, flatten, get, isEmpty } from 'lodash'
import getConfig from 'next/config'
import { Rule } from 'rc-field-form/lib/interface'
import React, { CSSProperties, useCallback, useMemo, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'

import { useIntl } from '@core/next/intl'

import Checkbox from '@condo/domains/common/components/antd/Checkbox'
import Select from '@condo/domains/common/components/antd/Select'
import { FormWithAction } from '@condo/domains/common/components/containers/FormList'
import { GraphQlSearchInput } from '@condo/domains/common/components/GraphQlSearchInput'
import { Loader } from '@condo/domains/common/components/Loader'
import { colors } from '@condo/domains/common/constants/style'
import { useValidations } from '@condo/domains/common/hooks/useValidations'

import { searchOrganizationProperty } from '../../utils/clientSchema/search'
import { Property } from '../../../property/utils/clientSchema'
import { TicketHint, TicketHintProperty } from '../../utils/clientSchema'

const INPUT_LAYOUT_PROPS = {
    labelCol: {
        sm: 6,
    },
    wrapperCol: {
        sm: 14,
    },
}

const LAYOUT = {
    layout: 'horizontal',
}

const HINT_LINK_STYLES: CSSProperties = { color: colors.black, textDecoration: 'underline' }
const TEXT_STYLES: CSSProperties = { margin: 0 }

const TicketHintAlert = () => {
    const intl = useIntl()
    const AlertMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.title' })
    const AlertContent = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.content' })
    const ShowHintsMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.alert.showHints' })

    const AlertDescription = useMemo(() => (
        <>
            <Typography.Paragraph style={TEXT_STYLES}>{AlertContent}</Typography.Paragraph>
            <a href={'/settings?tab=hint'} target={'_blank'} rel="noreferrer">
                <Typography.Link style={HINT_LINK_STYLES}>
                    {ShowHintsMessage}
                </Typography.Link>
            </a>
        </>
    ), [AlertContent, ShowHintsMessage])

    return (
        <Alert
            message={AlertMessage}
            description={AlertDescription}
            showIcon
            type={'warning'}
        />
    )
}

const GUTTER_0_40: [Gutter, Gutter] = [0, 40]
const GUTTER_0_25: [Gutter, Gutter] = [0, 25]
const APARTMENT_COMPLEX_NAME_FIELD_PROPS = {
    labelCol: {
        sm: 6,
    },
    wrapperCol:{
        sm: 8,
    },
}
const HINT_CONTENT_FIELD_LAYOUT_PROPS = {
    wrapperCol: { span: 0 },
}

const {
    publicRuntimeConfig,
} = getConfig()

const { TinyMceApiKey } = publicRuntimeConfig

const EDITOR_INIT_VALUES = {
    link_title: false,
    contextmenu: '',
    menubar: false,
    statusbar: false,
    plugins: 'link',
    toolbar: 'undo redo | ' +
        'link | bold italic backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat',
}

export const BaseTicketHintForm = ({ children, action, organizationId, initialValues, mode }) => {
    const intl = useIntl()
    const ApartmentComplexNameMessage  = intl.formatMessage({ id: 'ApartmentComplexName' })
    const HintMessage = intl.formatMessage({ id: 'Hint' })
    const BuildingsMessage = intl.formatMessage({ id: 'pages.condo.property.index.TableField.Buildings' })
    const AddALlPropertiesMessage = intl.formatMessage({ id: 'pages.condo.settings.hint.addAllProperties' })

    const { requiredValidator } = useValidations()
    const validations: { [key: string]: Rule[] } = {
        properties: [requiredValidator],
        content: [requiredValidator],
    }

    const [editorValue, setEditorValue] = useState('')
    const [editorLoading, setEditorLoading] = useState(true)

    const initialContent = useMemo(() => get(initialValues, 'content'), [initialValues])

    const { objs: properties, loading: propertiesLoading } = Property.useObjects({
        where: {
            organization: { id: organizationId },
        },
    })
    const { objs: organizationTicketHintProperties, loading: organizationTicketHintPropertiesLoading } = TicketHintProperty.useObjects({
        where: {
            organization: { id: organizationId },
        },
    })
    const createTicketHintPropertyAction = TicketHintProperty.useCreate({ organization: organizationId }, () => Promise.resolve())
    const softDeleteTicketHintPropertyAction = TicketHintProperty.useSoftDelete({}, () => Promise.resolve())

    const initialProperties = useMemo(() => {
        const initialTicketHintId = get(initialValues, 'id')

        return initialTicketHintId ?
            organizationTicketHintProperties
                .filter(ticketHintProperty => ticketHintProperty.ticketHint.id === initialTicketHintId)
                .map(ticketHintProperty => ticketHintProperty.property) : []
    }, [initialValues, organizationTicketHintProperties])

    const initialPropertyIds = useMemo(() => {
        return initialProperties.map(property => property.id)
    }, [initialProperties])

    const propertiesWithTicketHint = useMemo(() => {
        const propertyIds = organizationTicketHintProperties.map(ticketHintProperty => ticketHintProperty.property.id)

        return properties.filter(property => propertyIds.includes(property.id))
    }, [organizationTicketHintProperties, properties])

    const propertiesWithoutTicketHint = useMemo(() => properties.filter(property => !propertiesWithTicketHint.includes(property)),
        [properties, propertiesWithTicketHint])

    const options = useMemo(() =>
        [...propertiesWithoutTicketHint, ...initialProperties] // тут было propertiesWithoutTicketHint
            .map(property => ({ label: property.address, value: property.id })),
    [initialProperties, propertiesWithoutTicketHint])
    const optionValues = useMemo(() => options.map(option => option.value),
        [options])

    const handleEditorChange = useCallback((newValue, form) => {
        setEditorValue(newValue)
        form.setFieldsValue({ content: newValue })
    }, [])

    const handleCheckboxChange = useCallback((e, form) => {
        const checkboxValue = e.target.checked

        if (checkboxValue) {
            form.setFieldsValue({ properties: optionValues })
        } else {
            form.setFieldsValue({ properties: [] })
        }
    }, [optionValues])

    const handleEditorLoad = useCallback(() => setEditorLoading(false), [])

    const handleFormSubmit = useCallback(async (values) => {
        // Если нет такого ticketHint, то есть нет initialValues.id =>
        // 1. Создать ticketHintProperty
        // 2. Для массива properties из формы, для каждого propertyId создать TicketHintProperty
        //
        // Если есть ticketHint, то обновить его name и content и
        // 1. Если преданного в properties propertyId нет в initialPropertyIds, то создать ticketHintProperty
        // 2. Если в initialPropertyIds есть какой-то propertyId, которого нет в property, то удалить этот ticketHintProperty

        const { properties, ...otherValues } = values
        const ticketHint = await action(otherValues)

        const initialTicketHintId = get(initialValues, 'id')

        if (!initialTicketHintId) {
            for (const propertyId of properties) {
                await createTicketHintPropertyAction({ ticketHint: ticketHint.id, property: propertyId })
            }
        } else {
            for (const propertyId of properties) {
                if (!initialPropertyIds.includes(propertyId)) {
                    await createTicketHintPropertyAction({ ticketHint: ticketHint.id, property: propertyId })
                }
            }

            for (const initialPropertyId of initialPropertyIds) {
                if (!properties.includes(initialPropertyId)) {
                    const ticketHintProperty = organizationTicketHintProperties
                        .find(
                            ticketHintProperty => ticketHintProperty.property.id === initialPropertyId &&
                                ticketHintProperty.ticketHint.id === initialTicketHintId
                        )

                    await softDeleteTicketHintPropertyAction({}, ticketHintProperty)
                }
            }
        }
    }, [action, createTicketHintPropertyAction, initialPropertyIds, initialValues, organizationTicketHintProperties, softDeleteTicketHintPropertyAction])

    if (propertiesLoading || organizationTicketHintPropertiesLoading) {
        return (
            <Loader fill size={'large'}/>
        )
    }

    return (
        <Row gutter={GUTTER_0_40}>
            {
                mode === 'create' && !isEmpty(propertiesWithTicketHint) && (
                    <Col span={24}>
                        <TicketHintAlert />
                    </Col>
                )
            }
            <Col span={24}>
                <FormWithAction
                    initialValues={initialValues}
                    action={handleFormSubmit}
                    {...LAYOUT}
                >
                    {({ handleSave, isLoading, form }) => (
                        <Row gutter={GUTTER_0_40}>
                            <Col span={24}>
                                <Row gutter={GUTTER_0_25}>
                                    <Col span={24}>
                                        <Form.Item
                                            name={'properties'}
                                            label={BuildingsMessage}
                                            labelAlign={'left'}
                                            validateFirst
                                            rules={validations.properties}
                                            required
                                            {...INPUT_LAYOUT_PROPS}
                                        >
                                            <Select
                                                // @ts-ignore
                                                defaultValue={initialPropertyIds}
                                                options={options}
                                                mode={'multiple'}
                                                disabled={!organizationId}
                                            />
                                        </Form.Item>
                                    </Col>
                                    {
                                        mode === 'create' && (
                                            <Col offset={6} span={24}>
                                                <Checkbox
                                                    disabled={!organizationId}
                                                    onChange={e => handleCheckboxChange(e, form)}>
                                                    {AddALlPropertiesMessage}
                                                </Checkbox>
                                            </Col>
                                        )
                                    }
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name={'name'}
                                    label={ApartmentComplexNameMessage}
                                    labelAlign={'left'}
                                    {...APARTMENT_COMPLEX_NAME_FIELD_PROPS}
                                >
                                    <Input disabled={!organizationId} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Row>
                                    <Col span={6}>
                                        <Form.Item
                                            name={'content'}
                                            label={HintMessage}
                                            labelAlign={'left'}
                                            rules={validations.content}
                                            required
                                            {...HINT_CONTENT_FIELD_LAYOUT_PROPS}
                                        />
                                    </Col>
                                    <Col span={14}>
                                        {editorLoading && <Loader />}
                                        <Editor
                                            onLoadContent={handleEditorLoad}
                                            apiKey={TinyMceApiKey}
                                            disabled={!organizationId}
                                            value={editorValue}
                                            onEditorChange={(newValue) => handleEditorChange(newValue, form)}
                                            initialValue={initialContent}
                                            init={EDITOR_INIT_VALUES}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            {children({ handleSave, isLoading, form })}
                        </Row>
                    )}
                </FormWithAction>
            </Col>
        </Row>
    )
}