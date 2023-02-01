import { Row, Col } from 'antd'
import get from 'lodash/get'
import groupBy from 'lodash/groupBy'
import isNull from 'lodash/isNull'
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'

import { ChevronDown } from '@open-condo/icons'
import { useIntl } from '@open-condo/next/intl'
import { Modal, Typography, List, RadioGroup, Space, Button } from '@open-condo/ui'
import type { RadioGroupProps } from '@open-condo/ui'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'

import type { BankTransaction as BankTransactionType, BankContractorAccount as BankContractorAccountType } from '@app/condo/schema'
import type { RowProps } from 'antd'

const CATEGORY_MODAL_ROW_GUTTER: RowProps['gutter'] = [0, 40]

interface IUseCategoryModal {
    ({ bankTransactions }: {
        bankTransactions?: Array<BankTransactionType>,
        bankContractorAccounts?: Array<BankContractorAccountType>

    }): {
        categoryModal: JSX.Element,
        setOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
}

export const useCategoryModal: IUseCategoryModal = (props) => {
    const intl = useIntl()
    const ModalTitle = intl.formatMessage({ id: 'global.contractor' }, { isSingular: true })
    const BankAccountTitle = intl.formatMessage({ id: 'global.bankAccount' })
    const ChooseCategoryTitle = intl.formatMessage({ id: 'pages.banking.chooseCategory' })
    const SaveTitle = intl.formatMessage({ id: 'Save' })

    const { bankTransactions = [], bankContractorAccounts = [] } = props

    const { bankCostItems, loading } = useBankCostItemContext()

    const [open, setOpen] = useState(false)
    const [selectedCostItem, setSelectedCostItem] = useState(null)
    const groups = useRef<RadioGroupProps['groups']>([])

    useEffect(() => {
        // TODO: maybe move this calculations to the BankCostItemContext?
        groups.current = []
        const categoryObject = groupBy(bankCostItems, (costItem) => costItem.category.id)

        Object.entries(categoryObject).forEach(([categoryId, costItems]) => {
            groups.current.push({
                name: get(costItems, ['0', 'category', 'name']),
                options: costItems.map(costItem => ({
                    label: costItem.name,
                    value: costItem.id,
                })),
            })
        })
    }, [bankCostItems])

    const closeModal = useCallback(() => {
        setOpen(false)
    }, [])
    const onGroupChange = useCallback((event) => {
        setSelectedCostItem(event.target.value)
    }, [])
    const handleSave = useCallback(() => {
        // TODO: add save method based on received entity (bankTransactions or bankContractorAccounts)
        console.log(selectedCostItem)
    }, [selectedCostItem])

    const categoryModal = useMemo(() => (
        <Modal
            title={ModalTitle}
            open={open}
            onCancel={closeModal}
            footer={<Button
                type='primary'
                disabled={isNull(selectedCostItem) || loading}
                onClick={handleSave}>
                {SaveTitle}
            </Button>}
        >
            <Row gutter={CATEGORY_MODAL_ROW_GUTTER}>
                <Col span={24}>
                    <List dataSource={[{
                        label: BankAccountTitle,
                        value: String(bankTransactions.length === 1 ? get(bankTransactions, '0.account.number') : bankTransactions.length),
                    }]} />
                </Col>
                <Col span={24}>
                    <Space direction='vertical' size={24}>
                        <Typography.Title level={3}>{ChooseCategoryTitle}</Typography.Title>
                        <RadioGroup
                            onChange={onGroupChange}
                            icon={<ChevronDown size='small' />}
                            groups={groups.current}
                        />
                    </Space>
                </Col>
            </Row>
        </Modal>
    ), [open, closeModal, ModalTitle, BankAccountTitle, ChooseCategoryTitle, bankTransactions,
        onGroupChange, handleSave, selectedCostItem, SaveTitle])

    return { categoryModal, setOpen }
}
