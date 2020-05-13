/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { useState } from 'react'
import { Button, Form, Input, notification, Typography, Result } from 'antd'
import Head from 'next/head'
import Router from 'next/router'
import { useIntl } from '@core/next/intl'
import { useMutation } from '@core/next/apollo'
import gql from 'graphql-tag'

import BaseLayout from '../../containers/BaseLayout'
import { getQueryParams } from '../../utils/url.utils'

const { Title, Paragraph } = Typography

const CHANGE_PASSWORD_WITH_TOKEN_MUTATION = gql`
    mutation changePasswordWithToken($token: String!, $password: String!) {
        status: changePasswordWithToken(token: $token, password: $password)
    }
`

const layout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 10 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
    },
}

const tailLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
}

const ChangePasswordForm = () => {
    const [form] = Form.useForm()
    const intl = useIntl()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccessMessage, setIsSuccessMessage] = useState(false)
    const [changePassword, ctx] = useMutation(CHANGE_PASSWORD_WITH_TOKEN_MUTATION)
    let initialValues = getQueryParams()
    initialValues = { ...initialValues, password: '', confirm: '' }

    const PasswordMsg = intl.formatMessage({ id: 'Password' })
    const ConfirmPasswordMsg = intl.formatMessage({ id: 'ConfirmPassword' })
    const ChangeMsg = intl.formatMessage({ id: 'Change' })
    const ServerErrorMsg = intl.formatMessage({ id: 'ServerError' })
    const ChangedMsg = intl.formatMessage({ id: 'Changed' })
    const GoToLoginMsg = intl.formatMessage({ id: 'GoToLogin' })
    const PasswordWasChangedMsg = intl.formatMessage({ id: 'pages.auth.PasswordWasChanged' })
    const PasswordWasChangedDescriptionMsg = intl.formatMessage({ id: 'pages.auth.PasswordWasChangedDescription' })
    const PleaseInputYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseInputYourPassword' })
    const PleaseConfirmYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseConfirmYourPassword' })
    const PasswordIsTooShortMsg = intl.formatMessage({ id: 'pages.auth.PasswordIsTooShort' })
    const TwoPasswordDontMatchMsg = intl.formatMessage({ id: 'pages.auth.TwoPasswordDontMatch' })

    const onFinish = values => {
        setIsLoading(true)
        changePassword({ variables: values })
            .then(
                (data) => {
                    notification.success({ message: ChangedMsg })
                    setIsSuccessMessage(true)
                },
                (e) => {
                    console.log(e)
                    const errors = []
                    notification.error({
                        message: ServerErrorMsg,
                        description: e.message,
                    })
                    if (errors.length) {
                        form.setFields(errors)
                    }
                })
            .finally(() => {
                setIsLoading(false)
            })
    }

    if (isSuccessMessage) {
        return <Result
            status="success"
            title={PasswordWasChangedMsg}
            subTitle={PasswordWasChangedDescriptionMsg}
            extra={[
                <Button onClick={() => Router.push('/auth/signin')}>{GoToLoginMsg}</Button>,
            ]}
        />
    }

    return (
        <Form
            {...layout}
            form={form}
            name="change-password"
            onFinish={onFinish}
            initialValues={initialValues}
        >

            <Form.Item name="token" style={{ display: 'none' }}>
                <Input type="hidden"/>
            </Form.Item>

            <Form.Item
                name="password"
                label={PasswordMsg}
                rules={[
                    {
                        required: true,
                        message: PleaseInputYourPasswordMsg,
                    },
                    {
                        min: 7,
                        message: PasswordIsTooShortMsg,
                    },
                ]}
                hasFeedback
            >
                <Input.Password/>
            </Form.Item>

            <Form.Item
                name="confirm"
                label={ConfirmPasswordMsg}
                dependencies={['password']}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: PleaseConfirmYourPasswordMsg,
                    },
                    ({ getFieldValue }) => ({
                        validator (rule, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve()
                            }
                            return Promise.reject(TwoPasswordDontMatchMsg)
                        },
                    }),
                ]}
            >
                <Input.Password/>
            </Form.Item>


            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                    {ChangeMsg}
                </Button>
            </Form.Item>
        </Form>
    )
}

const ChangePasswordPage = () => {
    const intl = useIntl()
    const ChangePasswordTitleMsg = intl.formatMessage({ id: 'pages.auth.ChangePasswordTitle' })
    return (<>
        <Head>
            <title>{ChangePasswordTitleMsg}</title>
        </Head>
        <Title css={css`text-align: center;`} level={2}>{ChangePasswordTitleMsg}</Title>
        <ChangePasswordForm/>
    </>)
}

function CustomContainer (props) {
    return (<BaseLayout
        {...props}
        logo="topMenu"
        sideMenuStyle={{ display: 'none' }}
        mainContentWrapperStyle={{ maxWidth: '600px', minWidth: '490px', paddingTop: '50px', margin: '0 auto' }}
        mainContentBreadcrumbStyle={{ display: 'none' }}
    />)
}

ChangePasswordPage.container = CustomContainer

export default ChangePasswordPage
