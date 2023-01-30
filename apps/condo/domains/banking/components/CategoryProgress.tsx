import { Row, Col, Progress } from 'antd'
import React from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Typography } from '@open-condo/ui'

import { colors } from '@condo/domains/common/constants/style'

import type { PropertyReportTypes } from './BankCostItemContext'
import type { BankTransaction, BankContractorAccount } from '@app/condo/schema'
import type { RowProps } from 'antd'

const CATEGORY_PROGRESS_ROW_GUTTER: RowProps['gutter'] = [24, 20]

interface ICategoryProgress {
    ({ data, entity }: {
        data: Array<BankTransaction | BankContractorAccount>,
        entity: PropertyReportTypes
    }): React.ReactElement
}

const CategoryProgress: ICategoryProgress = ({ data, entity }) => {
    const intl = useIntl()
    const IncomeTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.income' })
    const WithdrawalTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.withdrawal' })
    const ContractorTitle = intl.formatMessage({ id: 'pages.banking.categoryProgress.title.contractor' })

    let activeEntity = IncomeTitle
    if (entity === 'withdrawal') {
        activeEntity = WithdrawalTitle
    } else if (entity === 'contractor') {
        activeEntity = ContractorTitle
    }

    const percent = Math.round(data.filter(e => e.costItem !== null).length / data.length * 100)

    if (percent === 100) {
        return null
    }

    return (
        <Row gutter={CATEGORY_PROGRESS_ROW_GUTTER} justify='space-between'>
            <Col>
                <Typography.Text>
                    {intl.formatMessage({ id: 'pages.banking.categoryProgress.title' }, {
                        entity: activeEntity,
                    })}
                </Typography.Text>
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
    )
}

export default CategoryProgress
