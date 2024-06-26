import Link from 'next/link'

import { Building, ExternalLink, Meters, PlusCircle, Wallet } from '@open-condo/icons'

import {
    CREATE_METER_STEP_TYPE,
    CREATE_METER_READINGS_STEP_TYPE, CREATE_NEWS_STEP_TYPE,
    CREATE_PROPERTY_MAP_STEP_TYPE,
    CREATE_PROPERTY_STEP_TYPE,
    CREATE_TICKET_STEP_TYPE, UPLOAD_RECEIPTS_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE,
} from '@condo/domains/onboarding/constants/steps'


export const GUIDE_LINK = '/tour/guide'

/**
 * Link when clicking on an active step in the tour page
 */
export const TODO_STEP_CLICK_ROUTE = {
    [CREATE_PROPERTY_STEP_TYPE]: '/property',
    [CREATE_PROPERTY_MAP_STEP_TYPE]: ({ lastCreatedPropertyId }) => lastCreatedPropertyId ? `/property/${lastCreatedPropertyId}/map/update` : '/property',
    [CREATE_TICKET_STEP_TYPE]: '/ticket',
    [UPLOAD_RECEIPTS_STEP_TYPE]: '/billing',
    [CREATE_METER_STEP_TYPE]: '/meter?tab=meter',
    [CREATE_METER_READINGS_STEP_TYPE]: '/meter?tab=meter-reading',
    [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE]: GUIDE_LINK,
    [CREATE_NEWS_STEP_TYPE]: '/news',
}

/**
 * Permission allowing the step to be completed (if not specified, anyone can)
 */
export const TOUR_STEP_ACTION_PERMISSION = {
    [CREATE_PROPERTY_STEP_TYPE]: 'canManageProperties',
    [CREATE_PROPERTY_MAP_STEP_TYPE]: 'canManageProperties',
    [UPLOAD_RECEIPTS_STEP_TYPE]: 'canManageIntegrations',
    [CREATE_TICKET_STEP_TYPE]: 'canManageTickets',
    [CREATE_METER_STEP_TYPE]: 'canManageMeters',
    [CREATE_METER_READINGS_STEP_TYPE]: 'canManageMeterReadings',
    [CREATE_NEWS_STEP_TYPE]: 'canManageNewsItems',
}

/**
 * Link in the completed step in the tour page
 */
export const COMPLETED_STEP_LINK = {
    [CREATE_PROPERTY_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/property/create',
        AfterIcon: PlusCircle,
    },
    [CREATE_PROPERTY_MAP_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/property',
        AfterIcon: Building,
    },
    [UPLOAD_RECEIPTS_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/billing',
        AfterIcon: Wallet,
    },
    [CREATE_TICKET_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/ticket/create',
        AfterIcon: PlusCircle,
    },
    [CREATE_METER_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/meter/create?tab=meter',
        AfterIcon: PlusCircle,
    },
    [CREATE_METER_READINGS_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/meter?tab=meter-reading',
        AfterIcon: Meters,
    },
    [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE]: {
        LinkWrapper: Link,
        href: GUIDE_LINK,
        AfterIcon: ExternalLink,
    },
    [CREATE_NEWS_STEP_TYPE]: {
        LinkWrapper: Link,
        href: '/news/create',
        AfterIcon: PlusCircle,
    },
}