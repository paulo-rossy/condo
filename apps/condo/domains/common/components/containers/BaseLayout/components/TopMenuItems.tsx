import React from 'react'
import { Space } from 'antd'
import { BellFilled } from '@ant-design/icons'
import { useAuth } from '@core/next/auth'
import { useOrganization } from '@core/next/organization'
import { OrganizationSelect } from '@condo/domains/organization/components/OrganizationSelect'
import { useOrganizationInvites } from '@condo/domains/organization/hooks/useOrganizationInvites'
import { menuIconStyles } from './styles'
import { UserMenu } from '@condo/domains/user/components/UserMenu'
import { Loader } from '@condo/domains/common/components/Loader'

export interface ITopMenuItemsProps {
    headerAction?: React.ElementType
}

export const TopMenuItems: React.FC<ITopMenuItemsProps> = (props) => {
    const auth = useAuth()
    const { isLoading } = useOrganization()
    const { loading: isInvitesLoading } = useOrganizationInvites()

    if (isLoading || auth.isLoading || isInvitesLoading) {
        return (
            <Loader fill={false} />
        )
    }

    return (
        <>
            {props.headerAction && props.headerAction}
            <Space direction={'horizontal'} size={40} style={{ marginLeft: 'auto' }}>
                <BellFilled style={{ ...menuIconStyles, marginLeft: 'auto' }}/>
                <OrganizationSelect/>
                <UserMenu/>
            </Space>
        </>
    )
}
