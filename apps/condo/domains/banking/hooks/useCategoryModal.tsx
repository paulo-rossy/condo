import { Row, Col } from 'antd'
import get from 'lodash/get'
import React, { useState, useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Modal, Typography, List } from '@open-condo/ui'

import { useBankCostItemContext } from '@condo/domains/banking/components/BankCostItemContext'

import type { BankTransaction } from '@app/condo/schema'
import type { RowProps } from 'antd'

const CATEGORY_MODAL_ROW_GUTTER: RowProps['gutter'] = [0, 40]

interface IUseCategoryModal {
    ({ bankTransactions }: { bankTransactions: Array<BankTransaction> }): {
        categoryModal: JSX.Element,
        setOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
}

export const useCategoryModal: IUseCategoryModal = ({ bankTransactions }) => {
    const intl = useIntl()
    const ModalTitle = intl.formatMessage({ id: 'global.contractor' }, { isSingular: true })
    const BankAccountTitle = intl.formatMessage({ id: 'global.bankAccount' })
    const ChooseCategoryTitle = intl.formatMessage({ id: 'pages.banking.chooseCategory' })

    const { bankCostItems, loading } = useBankCostItemContext()
    const [open, setOpen] = useState(false)

    const closeModal = useCallback(() => {
        setOpen(false)
    }, [])

    const categoryModal = useMemo(() => (
        <Modal title={ModalTitle} open={open} onCancel={closeModal}>
            <Row gutter={CATEGORY_MODAL_ROW_GUTTER}>
                <Col span={24}>
                    <List dataSource={[{
                        label: BankAccountTitle,
                        value: String(bankTransactions.length === 1 ? get(bankTransactions, '0.account.number') : bankTransactions.length - 1),
                    }]} />
                </Col>
                <Col span={24}>
                    <Typography.Title level={3}>{ChooseCategoryTitle}</Typography.Title>
                </Col>
            </Row>
        </Modal>
    ), [open, closeModal, ModalTitle, BankAccountTitle, ChooseCategoryTitle, bankTransactions])

    return { categoryModal, setOpen }
}
