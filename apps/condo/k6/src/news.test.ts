import { check } from 'k6'
import { browser } from 'k6/experimental/browser'
import http from 'k6/http'

import {
    setupCondoAuth,
    createOrganization,
    createProperty,
} from './utils'

const BASE_APP_URL = __ENV.BASE_URL + '/news/create'
const TOTAL_DURATION = '60s'

export const options = {
    tags: { testid: 'news', serverUrl: __ENV.BASE_URL },
    scenarios: {
        appHealthcheck: {
            exec: 'healthcheck',
            executor: 'constant-arrival-rate',
            duration: TOTAL_DURATION,
            rate: 2,
            timeUnit: '1s',
            preAllocatedVUs: 2,
        },
        browser: {
            exec: 'createNewsViaBrowser',
            executor: 'constant-vus',
            vus: 1,
            duration: TOTAL_DURATION,
            options: { browser: { type: 'chromium' } },
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.01'],
        browser_http_req_duration: ['p(95) < 2500', 'med < 1900'],
        http_req_duration: ['p(95)<2000', 'med < 1200'],
        browser_web_vital_fcp: ['p(95) < 6000', 'med < 4000'],
        browser_web_vital_lcp: ['p(95) < 10000', 'med < 5000'],
    },
}

export function setup () {
    const { token, cookie } = setupCondoAuth()

    const createdOrganization = createOrganization({ token })
    const organizationId = createdOrganization.json('data.obj.id')
    createProperty({ token, organizationId })

    return { token, cookie, organizationId }
}

export function healthcheck () {
    const appHealthcheck = http.get(__ENV.BASE_URL + '/server-health?checks=postgres,redis')

    check(appHealthcheck, {
        'healthcheck should return 200': (res) => res.status === 200,
        'postgres should pass': (res) => res.json('#(name="postgres").statusText') === 'pass',
        'redis should pass': (res) => res.json('#(name="redis").statusText') === 'pass',
    })
}

export async function createNewsViaBrowser (data) {
    const context = browser.newContext()
    const page = context.newPage()

    context.addCookies([
        {
            name: 'keystone.sid',
            value: data.cookie,
            url: __ENV.BASE_URL,
        },
        {
            name: 'locale',
            value: 'en',
            url: __ENV.BASE_URL,
        },
        {
            name: 'cookieAgreementAccepted',
            value: 'true',
            url: __ENV.BASE_URL,
        },
        {
            name: 'organizationLinkId',
            value: data.organizationId,
            url: __ENV.BASE_URL,
        },
    ])

    try {
        await Promise.all([
            page.goto(BASE_APP_URL),
            page.waitForNavigation(),
        ])
        page.waitForSelector('[data-cy="news__create-title-input"] textarea').isVisible()
        page.locator('[data-cy="news__create-title-input"] textarea').type('Some title here')
        page.locator('[data-cy="news__create-body-input"] textarea').type('Some long description here')

        page.waitForSelector('[data-cy="news__create-property-section-search"] .ant-select-selector').isVisible()
        await page.locator('[data-cy="news__create-property-section-search"] .ant-select-selector').click()
        page.keyboard.down('Enter')

        for (let i = 0; i < 3; i++) {
            page.keyboard.down('ArrowDown')
            page.keyboard.down('Enter')
        }

        page.waitForSelector('button.condo-btn.condo-btn-primary').isVisible()

        await page.locator('button.condo-btn.condo-btn-primary').click()

        await page.waitForNavigation()

        check(page, {
            'news items created & redirected to table ': () => page.url() !== BASE_APP_URL && page.url() === __ENV.BASE_URL + '/news',
        })
    } finally {
        page.close()
    }
}
