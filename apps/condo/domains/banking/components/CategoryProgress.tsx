import { Row, Col, Progress } from 'antd'
import get from 'lodash/get'
import isNull from 'lodash/isNull'
import React from 'react'

import { AlertCircle } from '@open-condo/icons'
import { useIntl } from '@open-condo/next/intl'
import { Typography, Space } from '@open-condo/ui'

import { Tooltip } from '@condo/domains/common/components/Tooltip'
import { colors } from '@condo/domains/common/constants/style'

import type { PropertyReportTypes } from './BankCostItemContext'
import type { BankAccount } from '@app/condo/schema'
import type { RowProps } from 'antd'

const CATEGORY_PROGRESS_ROW_GUTTER: RowProps['gutter'] = [24, 20]
const CATEGORY_PROGRESS_ICON_WRAPPER_STYLE: React.CSSProperties = { display: 'flex' }

interface ICategoryProgress {
    ({ totalRows, entity, emptyCostItems }: {
        totalRows: number,
        entity: PropertyReportTypes,
        emptyCostItems?: Pick<BankAccount, 'id' | 'uncategorizedIncomeTransactions' |
        'uncategorizedOutcomeTransactions' | 'uncategorizedContractorAccounts'>
    }): React.ReactElement
}

const CategoryProgress: ICategoryProgress = ({ totalRows, entity, emptyCostItems }) => {
    const intl = useIntl()
    const TransactionTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.transaction' })
    const ContractorTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.contractor' })
    const TransactionTooltipTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.tooltip.transaction' })
    const ContractorTooltipTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.tooltip.contractor' })

    let activeEntity = TransactionTitle
    let tooltipTitle = TransactionTooltipTitle
    let entityWithEmptyCostItem = 0

    if (entity === 'contractor') {
        activeEntity = ContractorTitle
        tooltipTitle = ContractorTooltipTitle
        entityWithEmptyCostItem = get(emptyCostItems, 'uncategorizedContractorAccounts', 0)
    } else if (entity === 'income') {
        entityWithEmptyCostItem = get(emptyCostItems, 'uncategorizedIncomeTransactions', 0)
    } else if (entity === 'withdrawal') {
        entityWithEmptyCostItem = get(emptyCostItems, 'uncategorizedOutcomeTransactions', 0)
    }

    const percent = Math.round( (totalRows - entityWithEmptyCostItem) / totalRows * 100)

    if (isNull(emptyCostItems) || isNull(totalRows) || entityWithEmptyCostItem === 0 || percent === 100) {
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
