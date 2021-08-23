import { Space, Typography } from 'antd'
import React, { useCallback } from 'react'
import { colors } from '@condo/domains/common/constants/style'
import { ActivateStepIcon, IconContainer, StepContainer } from './components'

export enum OnBoardingStepType {
    DEFAULT = 'Default',
    COMPLETED = 'Completed',
    DISABLED = 'Disabled',
}

interface IOnBoardingStep {
    type: OnBoardingStepType,
    icon: React.FC,
    title: string,
    description: string,
    action?: () => void
}

export const OnBoardingStepItem: React.FC<IOnBoardingStep> = (props) => {
    const { type, icon, title, description, action } = props
    const StepIcon = icon

    const handleClick = useCallback(() => {
        if (action) {
            action()
        }
    }, [action])

    return (
        <StepContainer color={colors.transparent} type={props.type} onClick={handleClick}>
            <Space direction={'horizontal'} size={16}>
                <IconContainer type={type}>
                    <StepIcon/>
                </IconContainer>
                <Space direction={'vertical'} size={4}>
                    <Typography.Title level={5}>{title}</Typography.Title>
                    <Typography.Text>{description}</Typography.Text>
                </Space>
            </Space>
            <ActivateStepIcon />
        </StepContainer>
    )
}
