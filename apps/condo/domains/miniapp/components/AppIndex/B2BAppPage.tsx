import { useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import get from 'lodash/get'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo } from 'react'

import { useAuth } from '@open-condo/next/auth'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { Typography } from '@open-condo/ui'

import { PageContent, PageWrapper, PageHeader } from '@condo/domains/common/components/containers/BaseLayout'
import LoadingOrErrorPage from '@condo/domains/common/components/containers/LoadingOrErrorPage'
import { useTracking } from '@condo/domains/common/components/TrackingContext'
import { IFrame } from '@condo/domains/miniapp/components/IFrame'
import { GET_B2B_APP_LAUNCH_PARAMETERS_SIGNATURE_MUTATION } from '@condo/domains/miniapp/gql'
import { B2BAppContext, B2BAppRole } from '@condo/domains/miniapp/utils/clientSchema'
import { SIGN_KEYS } from '@condo/domains/miniapp/utils/serverSchema/generateSignature'


type B2BAppPageProps = {
    id: string
}

export const B2BAppPage: React.FC<B2BAppPageProps> = ({ id }) => {
    const intl = useIntl()
    const FallbackPageTitle = intl.formatMessage({ id: 'global.section.miniapps' })
    const SupportNotAllowedMessage = intl.formatMessage({ id: 'miniapp.supportIsNotAllowed' })
    const LoadingMessage = intl.formatMessage({ id: 'Loading' })

    const { logEvent } = useTracking()
    const router = useRouter()
    const auth = useAuth()
    const isSupport = get(auth, ['user', 'isSupport'], false)
    const isAdmin = get(auth, ['user', 'isAdmin'], false)
    const userOrganization = useOrganization()
    const organizationId = get(userOrganization, ['organization', 'id'], null)
    const employeeRoleId = get(userOrganization, ['link', 'role', 'id'], null)

    const {
        obj: context,
        loading: contextLoading,
        error: contextError,
    } = B2BAppContext.useObject({ where: { app: { id }, organization: { id: organizationId } } })
    const {
        obj: appRole,
        loading: appRoleLoading,
        error: appRoleError,
    } = B2BAppRole.useObject({ where: { app: { id }, role: { id: employeeRoleId } } })
    const { data, loading: signatureLoading, error: signatureError } = useQuery(GET_B2B_APP_LAUNCH_PARAMETERS_SIGNATURE_MUTATION, {
        variables: {
            data: {
                organization: { id: organizationId },
                app: { id },
            },
        },
    })

    const signature = get(data, 'signature', null)

    const appUrl = get(context, ['app', 'appUrl'], null)
    const appName = get(context, ['app', 'name'], null)
    const hasDynamicTitle = get(context, ['app', 'hasDynamicTitle'], false)

    const appUrlWithSignature = useMemo(() => {
        if (!appUrl) return appUrl

        const url = new URL(appUrl)
        if (signature) {
            url.searchParams.set('sign', signature)
        }
        url.searchParams.set('signKeys', SIGN_KEYS)

        return url.toString()
    }, [appUrl, signature])

    // NOTE 1: Page visiting is valid if context exists, visitor has B2BAppRole and app has appUrl
    // NOTE 2: In case of invalid id it will redirect to about page, where appId is checked
    useEffect(() => {
        if (!contextLoading && !contextError && !appRoleLoading && !appRoleError && (!context || !appRole || !appUrl)) {
            router.push(`/miniapps/${id}/about`)
        }
    }, [
        id,
        context,
        contextLoading,
        contextError,
        appRole,
        appRoleLoading,
        appRoleError,
        appUrl,
        router,
    ])

    const shouldSendAnalytics =
        !(contextLoading || contextError || appRoleLoading || appRoleError || isSupport || isAdmin)
        && Boolean(appUrl && appRole && context)

    useEffect(() => {
        if (!shouldSendAnalytics) return

        const visitedAt = dayjs().toISOString()
        logEvent({
            eventName: 'MiniappSessionStart',
            eventProperties: { appId: id, appUrl, appName, visitedAt },
        })

        return () => {
            const leftAt = dayjs().toISOString()
            const diff = dayjs(leftAt).diff(dayjs(visitedAt))
            const sessionTime = dayjs.duration(diff).format('YYYY-MM-DDTHH:mm:ss')
            logEvent({
                eventName: 'MiniappSessionEnd',
                eventProperties: { appId: id, appUrl, appName, visitedAt, leftAt, sessionTime },
            })
        }
    }, [shouldSendAnalytics])

    if (contextLoading || contextError || appRoleLoading || appRoleError || signatureLoading) {
        return (
            <LoadingOrErrorPage
                error={contextError || appRoleError || signatureError}
                loading={contextLoading || appRoleLoading || signatureLoading}
                title={LoadingMessage}
            />
        )
    }

    if (isSupport || isAdmin) {
        return <LoadingOrErrorPage title={FallbackPageTitle} error={SupportNotAllowedMessage}/>
    }


    return (
        <>
            <Head>
                <title>{appName || FallbackPageTitle}</title>
            </Head>
            <PageWrapper>
                {!hasDynamicTitle && (
                    <PageHeader title={<Typography.Title level={1}>{appName || FallbackPageTitle}</Typography.Title>} spaced/>
                )}
                <PageContent>
                    {/* NOTE: since router.push redirecting in useEffect is async
                    we need to prevent iframe loading in cases where everything is (not) loaded fine,
                    but redirect is still happening*/}
                    {Boolean(appUrl && appRole && context) && (
                        <IFrame
                            src={appUrlWithSignature}
                            reloadScope='organization'
                            withLoader
                            withPrefetch
                            withResize
                        />
                    )}
                </PageContent>
            </PageWrapper>
        </>
    )
}