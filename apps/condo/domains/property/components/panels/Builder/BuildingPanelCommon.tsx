/** @jsx jsx */
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { BuildingUnitSubType, B2BAppGlobalFeature } from '@app/condo/schema'
import { jsx, css } from '@emotion/react'
import styled from '@emotion/styled'
import { Col, Row, Typography, RowProps, Radio, RadioProps } from 'antd'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import React, { useRef, useEffect, useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'

import { Button } from '@condo/domains/common/components/Button'
import { CardVideo } from '@condo/domains/common/components/CardVideo'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { fontSizes, colors, gradients, UNIT_TYPE_COLOR_SET } from '@condo/domains/common/constants/style'
import { useGlobalAppsFeaturesContext } from '@condo/domains/miniapp/components/GlobalApps/GlobalAppsFeaturesContext'
import { IPropertyMapFormProps } from '@condo/domains/property/components/BasePropertyMapForm'
import { UnitButton } from '@condo/domains/property/components/panels/Builder/UnitButton'

import { FullscreenFooter } from './Fullscreen'
import { MapEdit, MapView, MapViewMode } from './MapConstructor'


const MESSAGE_DEBOUNCE_TIMEOUT = 2000

export const CustomScrollbarCss = css`
  & div::-webkit-scrollbar {
    width: 14px;
    border-right: 5px solid transparent;
  }
  & div::-webkit-scrollbar-thumb {
    background-color: ${colors.inputBorderGrey};
    border-radius: 10px;
    border: 4px solid transparent;
    background-clip: padding-box;
    width: 5px;
  }
  & div::-webkit-scrollbar-thumb:hover {
    background-color: ${colors.inputBorderHover};
    border: 2px solid transparent;
  }
  & div::-webkit-scrollbar-track {
    border-radius: 10px;
  }
  & div::-webkit-scrollbar-track,
  & div::-webkit-scrollbar-corner {
    background-color: ${colors.backgroundLightGrey};
  }
`

export const MapSectionContainer = styled.div<{ visible: boolean }>`
  display: ${({ visible }) => visible ? 'inline-block' : 'none'};
  margin-right: 28px;
  text-align: center;
`

export const PropertyMapFloor: React.FC = ({ children }) => {
    return (
        <div style={{ display: 'block' }}>
            {children}
        </div>
    )
}

export const EmptyFloor: React.FC = () => {
    return (
        <div style={{ display: 'block' }}>
            <UnitButton secondary disabled >&nbsp;</UnitButton>
        </div>
    )
}

interface IEmptyBuildingBlock extends Pick<IPropertyMapFormProps, 'canManageProperties'> {
    mode?: 'view' | 'edit'
}

const DESCRIPTION_STYLE: React.CSSProperties = {
    display: 'block',
    fontSize: fontSizes.content,
    maxWidth: '350px',
    color: colors.inputBorderHover,
    margin: 'auto',
    marginTop: '8px',
    whiteSpace: 'pre-line',
}

const EMPTY_BUILDING_BLOCK_BUTTON_STYLE = {
    marginTop: '20px',
}

const CARD_VIDEO_CONTAINER_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'center' }
const CARD_VIDEO_WRAPPER_STYLE = { maxHeight: '390px', maxWidth: '500px' }

const {
    publicRuntimeConfig,
} = getConfig()

const { createMapVideoUrl } = publicRuntimeConfig

export const EmptyBuildingBlock: React.FC<IEmptyBuildingBlock> = ({ mode = 'view', canManageProperties = false }) => {
    const intl = useIntl()
    const EmptyPropertyBuildingHeader = intl.formatMessage({ id: `pages.condo.property.EmptyBuildingBlock.${mode}.EmptyBuildingHeader` })
    const MapManualCreateTitle = intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.view.CreateMapManuallyTitle' })
    const MapAutoCreateTitle = intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.view.CreateMapAutomaticallyTitle' })
    const MapEditEmptyBuildingDescription = intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.edit.EmptyBuildingDescription' })
    const CardVideoTitle = intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.edit.CardVideoTitle' })
    const CardVideoDescription = intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.edit.CardVideoDescription' })

    const { push, asPath, query: { id: propertyId } } = useRouter()
    const createMapCallback = useCallback(() => {
        push(asPath + '/map/update')
    }, [asPath])

    const { features: { PropertyMapGeneration: generatorAppOrigin }, requestFeature } = useGlobalAppsFeaturesContext()

    const EmptyPropertyBuildingDescription = useMemo(() => {
        const services = generatorAppOrigin
            ? intl.formatMessage({ id: 'pages.condo.property.EmptyBuildingBlock.view.auto.EmptyBuildingDescription.services' })
            : ''
        const prefix = `${mode}.${generatorAppOrigin ? 'auto' : 'manual'}`
        const MapViewEmptyBuildingDescription = intl.formatMessage({ id: `pages.condo.property.EmptyBuildingBlock.${prefix}.EmptyBuildingDescription` }, { services })

        return mode === 'edit' ? MapEditEmptyBuildingDescription : MapViewEmptyBuildingDescription
    }, [
        intl,
        mode,
        generatorAppOrigin,
    ])

    const debouncedGenerateRequest = useMemo(() => {
        return debounce(() => {
            if (!Array.isArray(propertyId)) {
                requestFeature({ feature: B2BAppGlobalFeature.PropertyMapGeneration, propertyId })
            }
        }, MESSAGE_DEBOUNCE_TIMEOUT, { leading: true, trailing: false })
    }, [
        propertyId,
        requestFeature,
    ])

    const sendGenerateMapRequest = useCallback(() => {
        debouncedGenerateRequest()
    }, [debouncedGenerateRequest])

    const locale = useMemo(() => get(intl, 'locale'), [intl])
    const videoUrl = get(createMapVideoUrl, locale)

    if (mode === 'edit' && videoUrl) {
        return (
            <div style={CARD_VIDEO_CONTAINER_STYLE}>
                <div style={CARD_VIDEO_WRAPPER_STYLE}>
                    <CardVideo
                        src={videoUrl}
                        title={CardVideoTitle}
                        description={CardVideoDescription}
                    />
                </div>
            </div>
        )
    }

    return (
        <BasicEmptyListView image='/propertyEmpty.svg'>
            <Typography.Title level={3} style={EMPTY_BUILDING_BLOCK_BUTTON_STYLE}>
                {EmptyPropertyBuildingHeader}
            </Typography.Title>
            <Typography.Text style={DESCRIPTION_STYLE}>
                {EmptyPropertyBuildingDescription}
            </Typography.Text>
            {canManageProperties && (
                <>
                    {mode === 'view' && generatorAppOrigin && (
                        <Button
                            type='sberDefaultGradient'
                            style={EMPTY_BUILDING_BLOCK_BUTTON_STYLE}
                            onClick={sendGenerateMapRequest}
                        >{MapAutoCreateTitle}</Button>
                    )}
                    {mode === 'view' && (
                        <Button
                            type='sberDefaultGradient'
                            style={EMPTY_BUILDING_BLOCK_BUTTON_STYLE}
                            secondary
                            onClick={createMapCallback}
                        >{MapManualCreateTitle}</Button>

                    )}
                </>
            )}
        </BasicEmptyListView>
    )
}

interface IBuildingAxisYProps {
    floors: number[]
}

const BuildingAxisContainer = styled.div`
  display: inline-block;
  margin-right: 12px;
  position: sticky;
  left: 0;
  background-color: ${colors.backgroundLightGrey};
  z-index: 2;
`
const AXIS_UNIT_STYLE: React.CSSProperties = { display: 'block', color: colors.textSecondary }

export const BuildingAxisY: React.FC<IBuildingAxisYProps> = ({ floors }) => {
    return (
        <BuildingAxisContainer>
            {
                floors.map(floorNum => (
                    <UnitButton secondary disabled key={`floor_${floorNum}`} style={AXIS_UNIT_STYLE}>{floorNum}</UnitButton>
                ))
            }
            <UnitButton secondary disabled style={AXIS_UNIT_STYLE}>&nbsp;</UnitButton>
        </BuildingAxisContainer>
    )
}

interface IBuildingChooseSectionsProps {
    builder: MapEdit | MapView
    refresh(): void
    toggleFullscreen?(): void
    isFullscreen?: boolean
    mode?: 'view' | 'edit'
}

const FULLSCREEN_BUTTON_STYLE: React.CSSProperties = {
    position: 'relative',
}
const FULLSCREEN_FOOTER_GUTTER: RowProps['gutter'] = [40, 40]

export const BuildingChooseSections: React.FC<IBuildingChooseSectionsProps> = (props) => {
    const intl = useIntl()
    const RequestFullscreenMessage = intl.formatMessage({ id: 'FullscreenRequest' })
    const ExitFullscreenMessage = intl.formatMessage({ id: 'FullscreenExit' })

    const {
        toggleFullscreen,
        isFullscreen,
        mode = 'view',
        children,
    } = props

    return (

        <Row
            css={FullscreenFooter}
            gutter={FULLSCREEN_FOOTER_GUTTER}
        >
            <Col>
                {mode === 'view' ? (
                    <Button
                        style={FULLSCREEN_BUTTON_STYLE}
                        type='sberDefaultGradient'
                        secondary
                        icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                        size='large'
                        onClick={toggleFullscreen}
                    >
                        {isFullscreen
                            ? ExitFullscreenMessage
                            : RequestFullscreenMessage}
                    </Button>
                ) : children}
            </Col>
        </Row>

    )
}

export function useHorizontalScroll (): React.RefObject<HTMLElement>{
    const elementRef = useRef<HTMLElement | null>(null)
    useEffect(() => {
        const element = elementRef.current
        if (element) {
            const onWheel = (event: WheelEvent) => {
                if (event.deltaY == 0) return
                event.preventDefault()
                element.scrollTo({
                    left: element.scrollLeft + event.deltaY,
                })
            }
            element.addEventListener('wheel', onWheel)
            return () => element.removeEventListener('wheel', onWheel)
        }
    }, [])
    return elementRef
}

export const HintText = styled.div`
  color: ${colors.textSecondary};
  cursor: pointer;
  margin-top: 8px;
  
  &:hover {
    color: ${colors.black} 
  }  
`

const BuildingViewModeSelectCss = css`
  padding: 4px;
  background-color: ${colors.backgroundWhiteSecondary};
  height: 48px;
  border-radius: 8px;
  white-space: nowrap;

  & label.ant-radio-button-wrapper {
    background-color: ${colors.backgroundWhiteSecondary};
    height: 40px;
    border: none;
    border-radius: 4px;
    box-shadow: none;
    line-height: 40px;
    font-size: 14px;
    font-weight: 600;
  }
  & label.ant-radio-button-wrapper.ant-radio-button-wrapper-checked {
    background-color: ${colors.white};
    color: ${colors.black};
    border-color: transparent;
  }
  & .ant-radio-button-wrapper-checked::before,
  & .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover::before {
    background-color: ${colors.backgroundWhiteSecondary};
  }
  & .ant-radio-button-wrapper:hover {
    color: ${gradients.mainGradientPressed};
  }
  & .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
    background-color: ${colors.white};
    border-color: transparent;
    color: ${colors.black}
  }
  & .ant-radio-button-wrapper:not(.ant-radio-button-wrapper-disabled):not(.ant-radio-button-wrapper-checked):hover span:not(.ant-radio-button) {
    background: ${gradients.mainGradientPressed};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  & .ant-radio-button-wrapper.ant-radio-button-wrapper-disabled:not(.ant-radio-button-wrapper-checked) {
    color: ${colors.textSecondary};
  }
`

export const BuildingViewModeSelect: React.FC<RadioProps> = (props) => {
    const intl = useIntl()
    const ParkingBuildingLabel = intl.formatMessage({ id: 'pages.condo.property.select.option.parking' })
    const ResidentialBuildingLabel = intl.formatMessage({ id: 'pages.condo.property.select.option.residentialBuilding' })

    return (
        <Radio.Group
            {...props}
            optionType='button'
            buttonStyle='solid'
            css={BuildingViewModeSelectCss}
        >
            <Radio.Button value={MapViewMode.section}>{ResidentialBuildingLabel}</Radio.Button>
            <Radio.Button value={MapViewMode.parking}>{ParkingBuildingLabel}</Radio.Button>
        </Radio.Group>
    )
}

export const UnitTypeLegendItem = styled.div<{ unitType: BuildingUnitSubType }>`
  display: flex;
  height: 38px;
  align-items: center;
  
  &:before {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    margin-right: 5px;
    background-color: ${({ unitType }) => UNIT_TYPE_COLOR_SET[unitType]};
  }
`
