import { Typography } from 'antd'
import get from 'lodash/get'
import Head from 'next/head'
import React, { CSSProperties, useMemo } from 'react'

import { useFeatureFlags } from '@open-condo/featureflags/FeatureFlagsContext'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'
import { TabItem } from '@open-condo/ui'

import { PageHeader, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { TablePageContent } from '@condo/domains/common/components/containers/BaseLayout/BaseLayout'
import { hasFeature } from '@condo/domains/common/components/containers/FeatureFlag'
import { ControlRoomSettingsContent } from '@condo/domains/common/components/settings/ControlRoomSettingsContent'
import { MobileFeatureConfigContent } from '@condo/domains/common/components/settings/MobileFeatureConfigContent'
import { SettingsPageContent } from '@condo/domains/common/components/settings/SettingsPageContent'
import {
    SETTINGS_TAB_CONTACT_ROLES,
    SETTINGS_TAB_PAYMENT_DETAILS,
    SETTINGS_TAB_SUBSCRIPTION,
    SETTINGS_TAB_CONTROL_ROOM,
    SETTINGS_TAB_EMPLOYEE_ROLES,
    SETTINGS_TAB_MOBILE_FEATURE_CONFIG,
} from '@condo/domains/common/constants/settingsTabs'
import { ContactRolesSettingsContent } from '@condo/domains/contact/components/contactRoles/ContactRolesSettingsContent'
import {
    EmployeeRolesSettingsContent,
} from '@condo/domains/organization/components/EmployeeRolesSettingsContent'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { RecipientSettingsContent } from '@condo/domains/organization/components/Recipient/SettingsContent'
import { MANAGING_COMPANY_TYPE } from '@condo/domains/organization/constants/common'
import { useEmployeeRolesPermissionsGroups } from '@condo/domains/organization/hooks/useEmployeeRolesPermissionsGroups'
import { SettingsReadPermissionRequired } from '@condo/domains/settings/components/PageAccess'
import { SubscriptionPane } from '@condo/domains/subscription/components/SubscriptionPane'


const TITLE_STYLES: CSSProperties = { margin: 0 }

const ALWAYS_AVAILABLE_TABS = []

const SettingsPage = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'global.section.settings' })
    const SubscriptionTitle = intl.formatMessage({ id: 'Subscription' })
    const RolesTitle = intl.formatMessage({ id: 'ContactRoles' })
    const DetailsTitle = intl.formatMessage({ id: 'PaymentDetails' })
    const ControlRoomTitle = intl.formatMessage({ id: 'ControlRoom' })
    const EmployeeRolesTitle = intl.formatMessage({ id: 'EmployeeRoles' })
    const MobileFeatureConfigTitle = intl.formatMessage({ id: 'pages.condo.settings.barItem.MobileFeatureConfig' })

    const hasSubscriptionFeature = hasFeature('subscription')

    const userOrganization = useOrganization()
    const isManagingCompany = get(userOrganization, 'organization.type', MANAGING_COMPANY_TYPE) === MANAGING_COMPANY_TYPE
    const canManageContactRoles = useMemo(() => get(userOrganization, ['link', 'role', 'canManageContactRoles']), [userOrganization])
    const canManageEmployeeRoles = useMemo(() => get(userOrganization, ['link', 'role', 'canManageRoles'], false), [userOrganization])
    const canManageMobileFeatureConfigsRoles = useMemo(() => get(userOrganization, ['link', 'role', 'canManageMobileFeatureConfigs']), [userOrganization])

    const availableTabs = useMemo(() => {
        const availableTabs = [...ALWAYS_AVAILABLE_TABS]

        if (hasSubscriptionFeature && isManagingCompany) availableTabs.push(SETTINGS_TAB_SUBSCRIPTION)
        if (canManageEmployeeRoles && isManagingCompany) availableTabs.push(SETTINGS_TAB_EMPLOYEE_ROLES)
        if (isManagingCompany) availableTabs.push(SETTINGS_TAB_PAYMENT_DETAILS)
        if (canManageContactRoles && isManagingCompany) availableTabs.push(SETTINGS_TAB_CONTACT_ROLES)
        if (isManagingCompany) availableTabs.push(SETTINGS_TAB_CONTROL_ROOM)
        if (canManageMobileFeatureConfigsRoles) availableTabs.push(SETTINGS_TAB_MOBILE_FEATURE_CONFIG)

        return availableTabs
    }, [hasSubscriptionFeature, isManagingCompany, canManageContactRoles, canManageMobileFeatureConfigsRoles, canManageEmployeeRoles])

    const settingsTabs: TabItem[] = useMemo(
        () => [
            hasSubscriptionFeature && isManagingCompany && {
                key: SETTINGS_TAB_SUBSCRIPTION,
                label: SubscriptionTitle,
                children: <SubscriptionPane/>,
            },
            canManageEmployeeRoles && isManagingCompany && {
                key: SETTINGS_TAB_EMPLOYEE_ROLES,
                label: EmployeeRolesTitle,
                children: <EmployeeRolesSettingsContent useEmployeeRolesTableData={useEmployeeRolesPermissionsGroups} />,
            },
            isManagingCompany && {
                key: SETTINGS_TAB_PAYMENT_DETAILS,
                label: DetailsTitle,
                children: <RecipientSettingsContent/>,
            },
            canManageContactRoles && isManagingCompany && {
                key: SETTINGS_TAB_CONTACT_ROLES,
                label: RolesTitle,
                children: <ContactRolesSettingsContent/>,
            },
            isManagingCompany && {
                key: SETTINGS_TAB_CONTROL_ROOM,
                label: ControlRoomTitle,
                children: <ControlRoomSettingsContent/>,
            },
            canManageMobileFeatureConfigsRoles && {
                key: SETTINGS_TAB_MOBILE_FEATURE_CONFIG,
                label: MobileFeatureConfigTitle,
                children: <MobileFeatureConfigContent/>,
            },
        ].filter(Boolean),
        [isManagingCompany, hasSubscriptionFeature, SubscriptionTitle, canManageEmployeeRoles, EmployeeRolesTitle, DetailsTitle, canManageContactRoles, RolesTitle, ControlRoomTitle, canManageMobileFeatureConfigsRoles, MobileFeatureConfigTitle],
    )

    const titleContent = useMemo(() => (
        <Typography.Title style={TITLE_STYLES}>{PageTitle}</Typography.Title>
    ), [PageTitle])

    return (
        <>
            <Head>
                <title>
                    {PageTitle}
                </title>
            </Head>
            <PageWrapper>
                <OrganizationRequired>
                    <PageHeader title={titleContent}/>
                    <TablePageContent>
                        <SettingsPageContent settingsTabs={settingsTabs} availableTabs={availableTabs}/>
                    </TablePageContent>
                </OrganizationRequired>
            </PageWrapper>
        </>
    )
}

SettingsPage.requiredAccess = SettingsReadPermissionRequired

export default SettingsPage
