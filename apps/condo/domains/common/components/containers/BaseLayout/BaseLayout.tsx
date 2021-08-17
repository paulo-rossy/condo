/** @jsx jsx */
import { jsx } from '@emotion/core'
import React, { createContext, CSSProperties, FunctionComponent, useContext, useState } from 'react'
import { ConfigProvider, Layout, PageHeader as AntPageHeader, PageHeaderProps } from 'antd'
import { useTopNotificationsHook, ITopNotification } from '@condo/domains/common/components/TopNotifications'
import { SideMenu } from './components/SideMenu'
import Router from 'next/router'
import enUS from 'antd/lib/locale/en_US'
import ruRU from 'antd/lib/locale/ru_RU'
import classnames from 'classnames'
import 'antd/dist/antd.less'
import { ITopMenuItemsProps, TopMenuItems as BaseTopMenuItems } from './components/TopMenuItems'
import { useIntl } from '@core/next/intl'
import { useAntdMediaQuery } from '../../../utils/mediaQuery.utils'
import { layoutCss, pageContentCss, pageHeaderCss, pageWrapperCss, subLayoutCss, topMenuCss } from './components/styles'
import { ElementType } from 'react'
import MenuItem from 'antd/lib/menu/MenuItem'

interface ILayoutContext {
    isMobile: boolean
    addNotification: (notification: ITopNotification) => void
}

const LayoutContext = createContext<ILayoutContext>({
    isMobile: false,
    addNotification: () => null,
})

const useLayoutContext = (): ILayoutContext => useContext<ILayoutContext>(LayoutContext)

const { Header, Content } = Layout

interface IBaseLayoutProps {
    headerAction?: ElementType<unknown>
    menuData?: React.ElementType
    style?: CSSProperties
    className?: string
    disableMobile?: boolean
    menuDataRender?: () => MenuItem[]
    TopMenuItems?: React.FC<ITopMenuItemsProps>
    logoLocation?: string
    onLogoClick?: () => void
}

const BaseLayout: React.FC<IBaseLayoutProps> = (props) => {
    const {
        style,
        children,
        className,
        menuData,
        disableMobile,
        headerAction,
        onLogoClick = () => Router.push('/'),
        TopMenuItems: TopMenuItemsFromProps,
    } = props
    const colSize = useAntdMediaQuery()
    const {
        TopNotificationComponent,
        addNotification,
    } = useTopNotificationsHook()
    // TODO(Dimitreee): add UA base isMobile detection
    const isMobile = (colSize === 'xs') && !disableMobile
    const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(!isMobile)
    const menuDataClassNames = classnames(
        'layout',
        { 'hided-side-menu': !menuData || menuData.length === 0 },
        className
    )
    const toggleSideMenuCollapsed = () => setIsSideMenuCollapsed(!isSideMenuCollapsed)

    const TopMenuItems = TopMenuItemsFromProps ? TopMenuItemsFromProps : BaseTopMenuItems

    return (
        <LayoutContext.Provider value={{ isMobile, addNotification }}>
            <TopNotificationComponent />
            <Layout className={menuDataClassNames} style={style} css={layoutCss} >
                <SideMenu {...{
                    onLogoClick,
                    menuData,
                    isMobile,
                    isSideMenuCollapsed,
                    toggleSideMenuCollapsed,
                }} />
                <Layout css={subLayoutCss}>
                    <Header css={topMenuCss}>
                        <TopMenuItems
                            headerAction={headerAction}
                            isMobile={isMobile}
                            isSideMenuCollapsed={isSideMenuCollapsed}
                            toggleSideMenuCollapsed={toggleSideMenuCollapsed}
                        />
                    </Header>
                    {children}
                </Layout>
            </Layout>
        </LayoutContext.Provider>
    )
}

interface IPageWrapperProps {
    className?: string
    style?: CSSProperties
}

const PageWrapper: FunctionComponent<IPageWrapperProps> = ({ children, className, style }) => {
    return (
        <Content className={classnames('page-wrapper', className)} css={pageWrapperCss}  style={style}>
            {children}
        </Content>
    )
}

interface IPageHeaderProps extends PageHeaderProps {
    title?: React.ReactChild
    subTitle?: string
    className?: string
    style?: CSSProperties
}

const PageHeader: FunctionComponent<IPageHeaderProps> = ({ children, className, style, title, subTitle, ...pageHeaderProps }) => {
    return (
        <AntPageHeader
            className={classnames('page-header', className)} css={pageHeaderCss} style={style}
            title={title} subTitle={subTitle}
            {...pageHeaderProps}
        >
            {children}
        </AntPageHeader>
    )
}

interface IPageContentProps {
    className?: string
    style?: CSSProperties
}

const PageContent: FunctionComponent<IPageContentProps> = ({ children, className, style }) => {
    return (
        <div className={classnames('page-content', className)} css={pageContentCss} style={style}>
            {children}
        </div>
    )
}

export default BaseLayout
export {
    useLayoutContext,
    PageWrapper,
    PageHeader,
    PageContent,
}
