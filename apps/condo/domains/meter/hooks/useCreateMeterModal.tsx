import { BuildingUnitSubType } from '@app/condo/schema'
import { Typography } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'

import { BaseMeterModalForm } from '@condo/domains/meter/components/BaseMeterModal/BaseMeterModalForm'
import { PropertyMeter, Meter, MeterPageTypes, METER_PAGE_TYPES } from '@condo/domains/meter/utils/clientSchema'


export function useCreateMeterModal (organizationId: string, propertyId: string, meterType: MeterPageTypes, unitName: string, unitType: BuildingUnitSubType, refetch) {
    const intl = useIntl()
    const AddMeterMessage = intl.formatMessage({ id: 'meter.AddMeter' })

    const [isCreateMeterModalVisible, setIsCreateMeterModalVisible] = useState<boolean>(false)

    const isPropertyMeter = meterType === METER_PAGE_TYPES.propertyMeter
    const MeterIdentity = isPropertyMeter ? PropertyMeter : Meter
    const createMeterAction = MeterIdentity.useCreate({}, refetch)

    const handleMeterCreate = useCallback(values => {
        const numberOfTariffs = values.numberOfTariffs || 1
        createMeterAction({
            ...values,
            resource: { connect: { id: values.resource } },
            numberOfTariffs,
            organization: { connect: { id: organizationId } },
            property: { connect: { id: propertyId } },
            unitName: isPropertyMeter ? undefined : unitName,
            unitType: isPropertyMeter ? undefined : unitType,
        })
        setIsCreateMeterModalVisible(false)
    },
    [createMeterAction, organizationId, propertyId, unitName, unitType, meterType])

    const initialValues = useMemo(() => ({
        propertyId,
        unitName: isPropertyMeter ? undefined : unitName,
        unitType: isPropertyMeter ? undefined : unitType,
    }), [propertyId, unitName, unitType, meterType])

    const handleCancelModal = useCallback(() => setIsCreateMeterModalVisible(false),
        [setIsCreateMeterModalVisible])

    const CreateMeterModal = useCallback(() => {
        return (
            <BaseMeterModalForm
                propertyId={propertyId}
                unitName={unitName}
                unitType={unitType}
                initialValues={initialValues}
                ModalTitleMsg={<Typography.Title level={3}>{AddMeterMessage}</Typography.Title>}
                visible={isCreateMeterModalVisible}
                handleSubmit={handleMeterCreate}
                showCancelButton={false}
                cancelModal={handleCancelModal}
                organizationId={organizationId}
                meterType={meterType}
                centered
            />
        )
    }, [AddMeterMessage, handleCancelModal, handleMeterCreate, initialValues, isCreateMeterModalVisible])

    return useMemo(() => ({ CreateMeterModal, setIsCreateMeterModalVisible }), [CreateMeterModal])
}
