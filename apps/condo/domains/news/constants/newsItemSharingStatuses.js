const STATUSES = {
    SCHEDULED: 'scheduled',
    PROCESSING: 'processing',
    PUBLISHED: 'published',
    ERROR: 'error',
}

const ALLOWED_TRANSITIONS = {
    [STATUSES.SCHEDULED]: [STATUSES.PROCESSING, STATUSES.ERROR],
    [STATUSES.PROCESSING]: [STATUSES.PUBLISHED, STATUSES.ERROR],
    [STATUSES.PUBLISHED]: [STATUSES.ERROR],
    // Sometimes we would need to resend news item sharing. It would be done via this status transition
    [STATUSES.ERROR]: [STATUSES.SCHEDULED],
}

module.exports = {
    STATUSES,
    ALLOWED_TRANSITIONS,
}