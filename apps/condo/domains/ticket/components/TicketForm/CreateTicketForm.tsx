import { Form, Space } from 'antd'
import React from 'react'
import { useOrganization } from '@core/next/organization'
import { useRouter } from 'next/router'
import { useAuth } from '@core/next/auth'
import { useIntl } from '@core/next/intl'
import { BaseTicketForm } from '../BaseTicketForm'
import { Button } from '@condo/domains/common/components/Button'
import { ErrorsContainer } from '../BaseTicketForm/ErrorsContainer'
import { Ticket } from '@condo/domains/ticket/utils/clientSchema'
import ActionBar from '@condo/domains/common/components/ActionBar'

const OPEN_STATUS = '6ef3abc4-022f-481b-90fb-8430345ebfc2'
const DEFAULT_TICKET_SOURCE_CALL_ID = '779d7bb6-b194-4d2c-a967-1f7321b2787f'

const REQUIRED_TICKET_FIELDS = ['property', 'details', 'placeClassifier', 'categoryClassifier', 'classifier']

export const CreateTicketActionBar = ({ handleSave, isLoading }) => {
    const intl = useIntl()
    const CreateTicketMessage = intl.formatMessage({ id: 'CreateTicket' })

    return (
        <Form.Item noStyle shouldUpdate>
            {
                ({ getFieldsValue }) => {
                    const { property, details, placeClassifier, categoryClassifier } = getFieldsValue(REQUIRED_TICKET_FIELDS)
                    const disabledCondition = !property || !details || !placeClassifier || !categoryClassifier

                    return (
                        <ActionBar>
                            <Space size={12}>
                                <Button
                                    key='submit'
                                    onClick={handleSave}
                                    type='sberPrimary'
                                    loading={isLoading}
                                    disabled={disabledCondition}
                                >
                                    {CreateTicketMessage}
                                </Button>
                                <ErrorsContainer
                                    isVisible={disabledCondition}
                                    property={property}
                                    details={details}
                                    placeClassifier={placeClassifier}
                                    categoryClassifier={categoryClassifier}
                                />
                            </Space>
                        </ActionBar>
                    )
                }
            }
        </Form.Item>
    )
}

export const CreateTicketForm: React.FC = () => {
    const { organization, link } = useOrganization()
    const router = useRouter()
    const auth = useAuth() as { user: { id: string } }

    const action = Ticket.useCreate(
        {
            organization: organization.id,
            status: OPEN_STATUS,
            source: DEFAULT_TICKET_SOURCE_CALL_ID,
        },
        () => {
            router.push('/ticket')
        })

    const initialValues = {
        assignee: auth.user.id,
        executor: auth.user.id,
    }

    return (
        <BaseTicketForm
            action={action}
            initialValues={initialValues}
            organization={organization}
            role={link.role}
            autoAssign
        >
            {({ handleSave, isLoading }) => <CreateTicketActionBar handleSave={handleSave} isLoading={isLoading}/>}
        </BaseTicketForm>
    )
}
