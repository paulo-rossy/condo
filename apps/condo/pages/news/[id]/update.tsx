import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'

import { useIntl } from '@open-condo/next/intl'
import { Typography } from '@open-condo/ui'

import { PageHeader, PageWrapper, PageContent } from '@condo/domains/common/components/containers/BaseLayout'
import { NewsForm } from '@condo/domains/news/components/NewsForm'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'


export interface IUpdateNewsPage extends React.FC {
    headerAction?: JSX.Element
    requiredAccess?: React.FC
}

const UpdateNewsPageContent: React.FC = () => {
    const intl = useIntl()
    const PageTitle = intl.formatMessage({ id: 'news.update.title' })

    const router = useRouter()

    const { query: { id } } = router as { query: { [key: string]: string } }

    return (
        <>
            <Head>
                <title>{PageTitle}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={<Typography.Title>{PageTitle}</Typography.Title>} />
                <PageContent>
                    <NewsForm 
                        id={id}
                        actionName='update'
                    />
                </PageContent>
            </PageWrapper>
        </>
    )
}

const UpdateNewsPage: IUpdateNewsPage = () => {
    return <UpdateNewsPageContent />
}

UpdateNewsPage.requiredAccess = OrganizationRequired

export default UpdateNewsPage
