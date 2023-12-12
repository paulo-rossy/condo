const get = require('lodash/get')
const fetch = require('node-fetch')

const { getLogger } = require('@open-condo/keystone/logging')
const { getSchemaCtx, getById } = require('@open-condo/keystone/schema')
const { createTask } = require('@open-condo/keystone/tasks')

const { NewsItemSharing } = require('@condo/domains/news/utils/serverSchema')

const { STATUSES } = require('../constants/newsItemSharingStatuses')

const logger = getLogger('publishSharedNewsItem')

const DV_SENDER = { dv: 1, sender: { dv: 1, fingerprint: 'publishSharedNewsItem' } }

async function _publishSharedNewsItem (newsItem, newsItemSharing){
    const { keystone: contextNewsItemSharing } = getSchemaCtx('NewsItemSharing')

    if (!newsItem) {
        throw new Error('no news item')
    }

    // If current news item was processed (not scheduled)
    if (newsItemSharing.status !== STATUSES.SCHEDULED) return
    await NewsItemSharing.update(contextNewsItemSharing, newsItemSharing.id, {
        ...DV_SENDER,
        status: STATUSES.PROCESSING,
    })

    const { title, body, type } = newsItem
    const sharingParams = get(newsItemSharing, 'sharingParams')

    const b2bAppContextId = get( newsItemSharing, 'b2bAppContext')
    const b2bAppContext = await getById('B2BAppContext', b2bAppContextId)

    const b2bAppId = get(b2bAppContext, 'app')
    const b2bApp = await getById('B2BApp', b2bAppId)

    const newsSharingConfigId = get(b2bApp, 'newsSharingConfig')
    if (!newsSharingConfigId) {
        throw new Error('news sharing is not supported in provided miniapp')
    }
    const newsSharingConfig = await getById('B2BAppNewsSharingConfig', newsSharingConfigId)

    const publishUrl = get(newsSharingConfig, 'publishUrl')
    const contextSettings = get(b2bAppContext, ['settings'])

    try {
        const response = await fetch(publishUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orgId: '',
                newsItem: {
                    title,
                    body,
                    type,
                },
                contextSettings,
                sharingParams,
            }),
        })

        if (response.status === 200) {
            await NewsItemSharing.update(contextNewsItemSharing, newsItemSharing.id, {
                ...DV_SENDER,
                status: STATUSES.PUBLISHED,
            })
        }
    } catch (err) {
        await NewsItemSharing.update(contextNewsItemSharing, newsItemSharing.id, {
            ...DV_SENDER,
            status: STATUSES.ERROR,
        })
    }
}

/**
 * Publish given News Item Sharing
 * @param {string} newsItemSharingId
 * @returns {Promise<void>}
 */
async function publishSharedNewsItem (newsItemSharingId) {
    const newsItemSharing = await getById('NewsItemSharing', newsItemSharingId)
    const newsItem = await getById('NewsItem', newsItemSharing.newsItem)

    return await _publishSharedNewsItem(newsItem, newsItemSharing)
}

module.exports = createTask('publishSharedNewsItem', publishSharedNewsItem, { priority: 3 })
