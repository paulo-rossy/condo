import { Col, Form, Row, Space, Typography } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useIntl } from '@core/next/intl'
import { Button } from '@condo/domains/common/components/Button'
import ActionBar from '@condo/domains/common/components/ActionBar'
import { ErrorsContainer } from './ErrorsContainer'
import { FormWithAction } from '@condo/domains/common/components/containers/FormList'
import Prompt from '@condo/domains/common/components/Prompt'
import { PropertyAddressSearchInput } from '@condo/domains/property/components/PropertyAddressSearchInput'
import { MetersGroup } from './MetersGroup'
import { SnowflakeIcon } from '@condo/domains/common/components/icons/SnowflakeIcon'
import { Loader } from '@condo/domains/common/components/Loader'
import { useMeterReadingsValidations } from './hooks/useMeterReadingsValidations'
import { useObject } from '@condo/domains/property/utils/clientSchema/Property'
import { Meter, MeterResource, MeterReading } from '../utils/clientSchema'
import { useContactsEditorHook } from '@condo/domains/contact/components/ContactsEditor/useContactsEditorHook'
import { UnitInfo } from '@condo/domains/ticket/components/BaseTicketForm'
import { BillingAccountMeterReading } from '@condo/domains/billing/utils/clientSchema'
import { get } from 'lodash'
// @ts-ignore
import { SortBillingAccountMeterReadingsBy } from '../../../schema.ts'
import { useForm } from 'antd/lib/form/Form'
import { useRouter } from 'next/router'
import { 
    CALL_METER_READING_SOURCE_ID,
    HOT_WATER_METER_RESOURCE_ID,
    COLD_WATER_METER_RESOURCE_ID,
    GAS_SUPPLY_METER_RESOURCE_ID,
    ELECTRICITY_METER_RESOURCE_ID,
    HEAT_SUPPLY_METER_RESOURCE_ID,
} from '../constants/constants'
import { FireIcon } from '@condo/domains/common/components/icons/FireIcon'
import { BulbIcon } from '@condo/domains/common/components/icons/BulbIcon'
import { RadiatorIcon } from '@condo/domains/common/components/icons/RadiatorIcon'
import { StoveIcon } from '@condo/domains/common/components/icons/StoveIcon'
import styled from '@emotion/styled'
import { PlusCircleFilled } from '@ant-design/icons'
import { jsx } from '@emotion/core'
import EmptyListView, { BasicEmptyListView } from '../../common/components/EmptyListView'
import { fontSizes } from '../../common/constants/style'
import { useCreateAccountModal } from './hooks/useCreateAccountModal'


const resourceIds = [
    COLD_WATER_METER_RESOURCE_ID,
    HOT_WATER_METER_RESOURCE_ID,
    GAS_SUPPLY_METER_RESOURCE_ID,
    ELECTRICITY_METER_RESOURCE_ID,
    HEAT_SUPPLY_METER_RESOURCE_ID,
]

const resourceToIcon = {
    [COLD_WATER_METER_RESOURCE_ID]: SnowflakeIcon,
    [HOT_WATER_METER_RESOURCE_ID]: FireIcon,
    [GAS_SUPPLY_METER_RESOURCE_ID]: StoveIcon,
    [ELECTRICITY_METER_RESOURCE_ID]: BulbIcon,
    [HEAT_SUPPLY_METER_RESOURCE_ID]: RadiatorIcon,
}

export const LAYOUT = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
}

export const DisabledWrapper = styled.div`
  &.disabled {
    opacity: 0.5;
    pointer-events: none;  
  }
`

const ContactsInfo = ({ ContactsEditorComponent, form, selectedPropertyId, initialValues }) => {
    return (
        <Col span={24}>
            <Form.Item shouldUpdate noStyle>
                {({ getFieldsValue }) => {
                    const { unitName } = getFieldsValue(['unitName'])

                    const value = {
                        id: get(initialValues, ['contact', 'id']),
                        name: get(initialValues, 'clientName'),
                        phone: get(initialValues, 'clientPhone'),
                    }

                    return (
                        <DisabledWrapper className={!unitName ? 'disabled' : ''}>
                            <ContactsEditorComponent
                                form={form}
                                fields={{
                                    id: 'contact',
                                    phone: 'clientPhone',
                                    name: 'clientName',
                                }}
                                value={value}
                                property={selectedPropertyId}
                                unitName={unitName}
                            />
                        </DisabledWrapper>
                    )
                }}
            </Form.Item>
        </Col>
    )
}

export const CreateMeterReadingsActionBar = ({ handleSave, addMeter, accountNumber, isLoading }) => {
    const intl = useIntl()
    const SendMetersReadingMessage = intl.formatMessage({ id: 'pages.condo.meter.SendMetersReading' })
    const AddMeterMessage = intl.formatMessage({ id: 'pages.condo.meter.AddMeter' })

    return (
        <Form.Item noStyle dependencies={['property']}>
            {
                ({ getFieldsValue }) => {
                    const { property } = getFieldsValue(['property'])

                    return (
                        <ActionBar>
                            <Space size={12}>
                                <Button
                                    key='submit'
                                    onClick={handleSave}
                                    type='sberPrimary'
                                    loading={isLoading}
                                    disabled={!property || !accountNumber}
                                >
                                    {SendMetersReadingMessage}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    type='sberPrimary'
                                    loading={isLoading}
                                    disabled={!property || !accountNumber}
                                    icon={<PlusCircleFilled />}
                                    secondary
                                >
                                    {AddMeterMessage}
                                </Button>
                                <ErrorsContainer property={property}/>
                            </Space>
                        </ActionBar>
                    )
                }
            }
        </Form.Item>
    )
}

export const CreateMeterReadingsForm = ({ organization, role }) => {
    const intl = useIntl()
    const UserInfoTitle = intl.formatMessage({ id: 'pages.condo.ticket.title.ClientInfo' })
    const AddressLabel = intl.formatMessage({ id: 'field.Address' })
    const AddressPlaceholder = intl.formatMessage({ id: 'placeholder.Address' })
    const AddressNotFoundContent = intl.formatMessage({ id: 'field.Address.notFound' })
    const PromptTitle = intl.formatMessage({ id: 'pages.condo.meter.warning.modal.Title' })
    const PromptHelpMessage = intl.formatMessage({ id: 'pages.condo.meter.warning.modal.HelpMessage' })
    const MeterDataTitle = intl.formatMessage({ id: 'pages.condo.meter.MeterDataTitle' })
    const NoAccountNumber = intl.formatMessage({ id: 'pages.condo.meter.NoAccountNumber' })
    const AddAccountDescription = intl.formatMessage({ id: 'pages.condo.meter.AddAccountDescription' })
    const AddAccount = intl.formatMessage({ id: 'pages.condo.meter.AddAccount' })

    const validations = useMeterReadingsValidations()
    const router = useRouter()
    // const [form] = useForm()

    const { CreateAccountModal, setIsCreateAccountModalVisible } = useCreateAccountModal()

    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(null)
    const [selectedUnitName, setSelectedUnitName] = useState<string>(null)
    const [accountNumber, setAccountNumber] = useState<string>(null)

    const { createContact, canCreateContact, ContactsEditorComponent } = useContactsEditorHook({
        organization: organization.id,
        role,
    })

    const { obj: property, loading: propertyLoading } = useObject({ where: { id: selectedPropertyId ? selectedPropertyId : null } })

    const { objs: resources, loading: resourcesLoading } = MeterResource.useObjects({})

    const { objs: existingMeters, loading: existingMetersLoading, refetch } = Meter.useObjects({
        where: {
            property: { id: selectedPropertyId ? selectedPropertyId : null },
            unitName: selectedUnitName ? selectedUnitName : null,
        },
    })

    const existingMetersAccounts = existingMeters.map(meter => meter.accountNumber)

    // const { objs: billingMeterReadings, loading: billingMeterReadingsLoading } = BillingAccountMeterReading.useObjects({
    //     where: {
    //         meter: { account: { number_in: existingMetersAccounts } },
    //     },
    //     sortBy: [SortBillingAccountMeterReadingsBy.CreatedAtDesc],
    // })

    const selectPropertyIdRef = useRef(selectedPropertyId)
    useEffect(() => {
        selectPropertyIdRef.current = selectedPropertyId
    }, [selectedPropertyId])

    const selectedUnitNameRef = useRef(selectedUnitName)
    useEffect(() => {
        selectedUnitNameRef.current = selectedUnitName
        refetch()
    }, [selectedUnitName])

    const accountNumberRef = useRef(accountNumber)
    useEffect(() => {
        accountNumberRef.current = accountNumber
    }, [accountNumber])

    const canCreateContactRef = useRef(canCreateContact)
    useEffect(() => {
        canCreateContactRef.current = canCreateContact
    }, [canCreateContact])

    const existingMetersRef = useRef(existingMeters)
    useEffect(() => {
        existingMetersRef.current = existingMeters
    }, [existingMeters])

    const createMeterAction = Meter.useCreate({}, () => { return })

    const createMeterReadingAction = MeterReading.useCreate({
        source: CALL_METER_READING_SOURCE_ID,
    }, () => { return })

    const action = useCallback(async (variables) => {
        let createdContact
        if (role.canManageContacts && canCreateContactRef.current) {
            createdContact = await createContact(organization.id, selectPropertyIdRef.current, selectedUnitNameRef.current)
        }

        const { property, unitName, client, clientName, clientEmail, clientPhone, source } = variables

        const existedMetersFromForm = variables.existedMeters
        if (existedMetersFromForm) {
            const existingMetersCreateActions = Object.entries(existedMetersFromForm).map(([meterId, value]) => {
                if (!value) return
                const existedMeter = existingMetersRef.current.find(meter => meter.id === meterId)

                return createMeterReadingAction({
                    organization: organization.id,
                    contact: get(createdContact, 'id') || variables.contact,
                    value1: Number(value),
                    meter: meterId,
                    date: new Date(),
                    client,
                    clientName,
                    clientEmail,
                    clientPhone,
                    source,
                })
            })
            await Promise.all([existingMetersCreateActions])
        }


        const createNewMetersWithMeterReadingsActions = []
        resourceIds.forEach(resourceId => {
            const newMeterReadingsByResource = variables[resourceId]

            if (newMeterReadingsByResource) {
                createNewMetersWithMeterReadingsActions.push(
                    newMeterReadingsByResource.map(newMeterReading => (
                        createMeterAction({
                            number: newMeterReading.number,
                            organization: organization.id,
                            property: property,
                            numberOfTariffs: 1,
                            unitName,
                            accountNumber: newMeterReading.account,
                            place: newMeterReading.place,
                            resource: newMeterReading.meterResource,
                        })
                            .then(
                                meter => {
                                    if (!newMeterReading.value) return

                                    return createMeterReadingAction({
                                        organization: organization.id,
                                        contact: get(createdContact, 'id') || variables.contact,
                                        value1: Number(newMeterReading.value),
                                        meter: meter.id,
                                        date: new Date(),
                                        client,
                                        clientName,
                                        clientEmail,
                                        clientPhone,
                                        source,
                                    })
                                }
                            )
                    ))
                )
            }
        })
        await Promise.all(createNewMetersWithMeterReadingsActions)

        await router.push('/')
    }, [])

    // console.log('form.getFieldsValue()', form.getFieldsValue())

    return (
        <FormWithAction
            {...LAYOUT}
            action={action}
            validateTrigger={['onBlur', 'onSubmit']}
            formValuesToMutationDataPreprocessor={(values) => {
                values.property = selectPropertyIdRef.current
                values.unitName = selectedUnitNameRef.current
                return values
            }}
            // form={form}
        >
            {({ handleSave, isLoading, form }) => (
                <>
                    <Prompt
                        title={PromptTitle}
                        form={form}
                        handleSave={handleSave}
                    >
                        <Typography.Paragraph>
                            {PromptHelpMessage}
                        </Typography.Paragraph>
                    </Prompt>
                    <Col lg={13} md={24}>
                        <Row gutter={[0, 20]}>
                            <Col span={24}>
                                <Row justify={'space-between'} gutter={[0, 15]}>
                                    <Col span={24}>
                                        <Typography.Title level={5}
                                            style={{ margin: '0' }}>{UserInfoTitle}</Typography.Title>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={'property'} label={AddressLabel}
                                            rules={validations.property}>
                                            <PropertyAddressSearchInput
                                                organization={organization}
                                                autoFocus={true}
                                                onSelect={(_, option) => {
                                                    form.setFieldsValue({
                                                        unitName: null,
                                                        sectionName: null,
                                                        floorName: null,
                                                    })
                                                    setSelectedPropertyId(option.key)
                                                }}
                                                placeholder={AddressPlaceholder}
                                                notFoundContent={AddressNotFoundContent}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <UnitInfo
                                        property={property}
                                        loading={propertyLoading}
                                        setSelectedUnitName={setSelectedUnitName}
                                        form={form}
                                    />
                                </Row>
                            </Col>
                            <ContactsInfo
                                ContactsEditorComponent={ContactsEditorComponent}
                                form={form}
                                initialValues={{}}
                                selectedPropertyId={selectedPropertyId}
                            />
                            {
                                resourcesLoading || existingMetersLoading ? <Loader /> :
                                    !selectedUnitNameRef.current ? null :
                                        accountNumber ? (
                                            <Col span={24}>
                                                <Row gutter={[0, 12]} style={{ marginTop: '40px' }}>
                                                    <Typography.Paragraph
                                                        strong={true}
                                                        style={{ fontSize: '20px', marginBottom: 0 }}
                                                    >
                                                        {MeterDataTitle}
                                                    </Typography.Paragraph>
                                                    {/*{*/}
                                                    {/*    resourceIds.map(resourceId => (*/}
                                                    {/*        <Col key={resourceId} span={24}>*/}
                                                    {/*            <MetersGroup*/}
                                                    {/*                form={form}*/}
                                                    {/*                name={resourceId}*/}
                                                    {/*                existedMeters={existingMeters.filter(meter => meter.resource.id === resourceId)}*/}
                                                    {/*                billingMeterReadings={billingMeterReadings}*/}
                                                    {/*                Icon={resourceToIcon[resourceId]}*/}
                                                    {/*                meterResource={resources.find(resource => resource.id === resourceId)}*/}
                                                    {/*            />*/}
                                                    {/*        </Col>*/}
                                                    {/*    ))*/}
                                                    {/*}*/}
                                                </Row>
                                            </Col>
                                        ) : (
                                            <BasicEmptyListView>
                                                <Typography.Title level={3}>
                                                    {NoAccountNumber}
                                                </Typography.Title>
                                                <Typography.Text style={{ fontSize: fontSizes.content }}>
                                                    {AddAccountDescription}
                                                </Typography.Text>
                                                <Button
                                                    type='sberPrimary'
                                                    style={{ marginTop: '16px' }}
                                                    onClick={() => setIsCreateAccountModalVisible(true)}
                                                >
                                                    {AddAccount}
                                                </Button>
                                            </BasicEmptyListView>
                                        )
                            }
                        </Row>
                    </Col>

                    <CreateAccountModal
                        handleSubmit={({ accountNumber }) => { setAccountNumber(accountNumber) }}
                    />

                    <CreateMeterReadingsActionBar
                        handleSave={handleSave}
                        isLoading={isLoading}
                        accountNumber={accountNumberRef.current}
                    />
                </>
            )}
        </FormWithAction>
    )
}
