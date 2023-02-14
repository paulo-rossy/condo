import { Row, Col, Progress } from 'antd'
import React from 'react'

import { AlertCircle } from '@open-condo/icons'
import { useIntl } from '@open-condo/next/intl'
import { Typography, Space } from '@open-condo/ui'

import { Tooltip } from '@condo/domains/common/components/Tooltip'
import { colors } from '@condo/domains/common/constants/style'

import type { PropertyReportTypes } from './BankCostItemContext'
import type { BankTransaction, BankContractorAccount } from '@app/condo/schema'
import type { RowProps } from 'antd'

const CATEGORY_PROGRESS_ROW_GUTTER: RowProps['gutter'] = [24, 20]
const CATEGORY_PROGRESS_ICON_WRAPPER_STYLE: React.CSSProperties = { display: 'flex' }

interface ICategoryProgress {
    ({ data, entity }: {
        data: Array<BankTransaction | BankContractorAccount>,
        entity: PropertyReportTypes
    }): React.ReactElement
}

const CategoryProgress: ICategoryProgress = ({ data, entity }) => {
    const intl = useIntl()
    const TransactionTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.transaction' })
    const ContractorTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.contractor' })
    const TransactionTooltipTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.tooltip.transaction' })
    const ContractorTooltipTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.tooltip.contractor' })

    let activeEntity = TransactionTitle
    let tooltipTitle = TransactionTooltipTitle
    if (entity === 'contractor') {
        activeEntity = ContractorTitle
        tooltipTitle = ContractorTooltipTitle
    }

    const percent = Math.round(data.filter(e => e.costItem !== null).length / data.length * 100)

    if (isNaN(percent) || percent === 100) {
        return null
    }

    return (
        <Col span={24}>
            <Row gutter={CATEGORY_PROGRESS_ROW_GUTTER} justify='space-between'>
                <Col>
                    <Space direction='horizontal' size={12} align='center'>
                        <Typography.Text>
                            {intl.formatMessage({ id: 'pages.banking.categoryProgress.title' }, {
                                entity: activeEntity,
                            })}
                        </Typography.Text>
                        <Tooltip title={tooltipTitle}>
                            <div style={CATEGORY_PROGRESS_ICON_WRAPPER_STYLE}><AlertCircle size='medium'/></div>
                        </Tooltip>
                    </Space>
                </Col>
                <Col>
                    <Typography.Text type='danger' size='small'>
                        {intl.formatMessage({ id: 'pages.banking.categoryProgress.description' }, {
                            percent: 100 - percent,
                        })}
                    </Typography.Text>
                </Col>
                <Col span={24}>
                    <Progress
                        type='line'
                        showInfo={false}
                        trailColor={colors.warningText}
                        strokeColor={colors.infoIconColor}
                        percent={percent}
                    />
                </Col>
            </Row>
        </Col>
    )
}

export default CategoryProgress
