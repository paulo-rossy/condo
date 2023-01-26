import { Row, Col } from 'antd'
import get from 'lodash/get'
import React, { useState, useCallback, useMemo } from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Modal, Typography, List } from '@open-condo/ui'

import type { BankTransaction } from '@app/condo/schema'

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

    const [open, setOpen] = useState(false)

    const closeModal = useCallback(() => {
        setOpen(false)
    }, [])

    console.log(bankTransactions)

    const categoryModal = useMemo(() => (
        <Modal title={ModalTitle} open={open} onCancel={closeModal}>
            <Row gutter={[0, 40]}>
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
    ), [open, closeModal, ModalTitle])

    return { categoryModal, setOpen }
}
