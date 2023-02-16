/** @jsx jsx */
import { css, jsx } from '@emotion/react'
import styled from '@emotion/styled'
import { Row, Col, Form, FormProps } from 'antd'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useState, useCallback, useEffect, useRef } from 'react'

import { PlusCircle, XCircle } from '@open-condo/icons'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Modal, Select, Option, Alert, Button, Typography, Space } from '@open-condo/ui'

import { BankAccount } from '@condo/domains/banking/utils/clientSchema'
import { Property } from '@condo/domains/property/utils/clientSchema'

const MODAL_ROW_GUTTER: React.ComponentProps<typeof Row>['gutter'] = [16, 24]

const TextButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  & > span {
    margin-right: 8px;
  }
`

interface ISbbolImportModal {
    ({ open }: { open: boolean }): React.ReactElement
}

const SbbolImportModal: ISbbolImportModal = ({ open }) => {
    const intl = useIntl()
    const SetupSyncTitle = intl.formatMessage({ id: 'pages.banking.report.accountSetupTitle' })
    const BankAccountNotFoundTitle = intl.formatMessage({ id: 'pages.banking.report.accountNotFound' })
    const AlertMessage = intl.formatMessage({ id: 'pages.banking.report.alertInfo.title' })
    const AlertDescription = intl.formatMessage({ id: 'pages.banking.report.alertInfo.description' })
    const BankAccountPlaceholder = intl.formatMessage({ id:'pages.banking.report.chooseBankAccountPlaceholder' })
    const PropertyPlaceholder = intl.formatMessage({ id:'pages.banking.report.choosePropertyPlaceholder' })
    const FieldIsRequiredMsg = intl.formatMessage({ id: 'FieldIsRequired' })
    const SaveTitle = intl.formatMessage({ id: 'Save' })
    const AddTitle = intl.formatMessage({ id: 'pages.banking.report.addAnotherBankAccount' })
    const CancelTitle = intl.formatMessage({ id: 'Cancel' })

    const { query: { id } } = useRouter()
    const { organization } = useOrganization()
    const { objs: bankAccounts, loading: bankAccountsLoading } = BankAccount.useObjects({
        where: {
            organization: { id: get(organization, 'id') },
            property_is_null: true,
        },
    })
    const { objs: properties, loading: propertiesLoading } = Property.useObjects({
        where: { organization: { id: get(organization, 'id') } },
    })
    const [form] = Form.useForm()
    const formWatch = Form.useWatch('items', form)

    useEffect(() => {
        if (!propertiesLoading && !bankAccountsLoading) {
            if (bankAccounts.length === 1) {
                form.setFieldValue(['items', 0, 'property'], id)
                form.setFieldValue(['items', 0, 'bankAccount'], bankAccounts[0].id)
            } else if (bankAccounts.length > 1 && properties.length > 1) {
                form.setFieldValue(['items', 0, 'property'], id)
            }
        }
    }, [propertiesLoading, properties, bankAccountsLoading, bankAccounts, id])

    const handleRemove = useCallback((remove) => {
        remove(formWatch.length - 1)
    }, [formWatch])
    const handleSubmit = useCallback(() => {
        console.log(form.getFieldsValue())
    }, [form])

    const hasBankAccounts = !bankAccountsLoading && bankAccounts.length
    const formValues = formWatch ? formWatch : []

    return (
        <Modal
            title={hasBankAccounts ? SetupSyncTitle : BankAccountNotFoundTitle}
            open={open}
            footer={hasBankAccounts ? <Button type='primary' onClick={handleSubmit}>{SaveTitle}</Button> : null}
        >
            <Row gutter={MODAL_ROW_GUTTER}>
                <Col span={24}>
                    <Alert type='info' message={AlertMessage} description={AlertDescription} showIcon />
                </Col>
                <Col span={24} hidden={!hasBankAccounts}>
                    <Typography.Text>
                        {intl.formatMessage({ id: 'pages.banking.report.importHelpText' }, { isSingular: bankAccounts.length })}
                    </Typography.Text>
                </Col>
                <Col span={24}>
                    <Form
                        form={form}
                        initialValues={{ items: [{ property: null, bankAccount: null }] }}
                    >
                        <Form.List name='items'>
                            {(fields, { add, remove }) => (
                                <Row gutter={MODAL_ROW_GUTTER}>
                                    {fields.map(({ key, name, ...restField }, index) => (
                                        <>
                                            <Col span={14}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'property']}
                                                    rules={[{ required: true, message: FieldIsRequiredMsg }]}
                                                    shouldUpdate
                                                >
                                                    <Select
                                                        placeholder={PropertyPlaceholder}
                                                        disabled={bankAccounts.length === 1 || index === 0}
                                                    >
                                                        {properties.map(property => (
                                                            <Option key={property.id} value={property.id}>
                                                                {property.address}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={10}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'bankAccount']}
                                                    rules={[{ required: true, message: FieldIsRequiredMsg }]}
                                                    shouldUpdate
                                                >
                                                    <Select
                                                        placeholder={BankAccountPlaceholder}
                                                        disabled={bankAccounts.length === 1}
                                                    >
                                                        {bankAccounts.map(bankAccount => (
                                                            <Option key={bankAccount.id} value={bankAccount.id}>
                                                                {bankAccount.number}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </>
                                    ))}
                                    <Col
                                        span={24}
                                        hidden={bankAccounts.length === 1 || properties.length === 1}
                                    >
                                        <Space size={40} direction='vertical'>
                                            {formValues.length !== 1 && (
                                                <TextButton onClick={() => handleRemove(remove)}>
                                                    <XCircle size='small' />
                                                    <Typography.Title level={5}>{CancelTitle}</Typography.Title>
                                                </TextButton>
                                            )}
                                            <TextButton onClick={add}>
                                                <PlusCircle size='small' />
                                                <Typography.Title level={5}>{AddTitle}</Typography.Title>
                                            </TextButton>
                                        </Space>
                                    </Col>
                                </Row>
                            )}
                        </Form.List>
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export { SbbolImportModal }
