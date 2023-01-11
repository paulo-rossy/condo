import Head from 'next/head'
import { useIntl } from 'react-intl'

import type { ReactNode } from 'react'

export default function IndexPage (): ReactNode {
    const intl = useIntl()
    const HelloMessage = intl.formatMessage({ id: 'hello' })

    return (
        <>
            <Head>
                <title>Hello world!</title>
                <meta name='description' content='Generated by create next app' />
                <meta name='viewport' content='width=device-width, initial-scale=1' />
            </Head>
            <main>
                {HelloMessage}
            </main>
        </>
    )
}