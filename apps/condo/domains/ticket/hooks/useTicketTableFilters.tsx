import {
    BuildingUnitSubType,
    Ticket,
    TicketCategoryClassifier as TicketCategoryClassifierType,
    TicketSource as TicketSourceType,
    TicketStatus as TicketStatusType,
    TicketWhereInput,
} from '@app/condo/schema'
import get from 'lodash/get'
import React, { useMemo } from 'react'

import { useAuth } from '@open-condo/next/auth'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'

import { getSelectFilterDropdown } from '@condo/domains/common/components/Table/Filters'
import {
    ComponentType,
    convertToOptions,
    FilterComponentSize,
    FiltersMeta,
} from '@condo/domains/common/utils/filters.utils'
import {
    getDayRangeFilter,
    getFilter,
    getNumberFilter,
    getStringContainsFilter,
} from '@condo/domains/common/utils/tables.utils'
import {
    searchOrganizationPropertyScope,
} from '@condo/domains/scope/utils/clientSchema/search'
import { VISIBLE_TICKET_SOURCE_TYPES } from '@condo/domains/ticket/constants/common'
import { FEEDBACK_VALUES_BY_KEY } from '@condo/domains/ticket/constants/feedback'
import { QUALITY_CONTROL_VALUES_BY_KEY } from '@condo/domains/ticket/constants/qualityControl'
import { TicketCategoryClassifier, TicketSource, TicketStatus } from '@condo/domains/ticket/utils/clientSchema'

import {
    FilterModalCategoryClassifierSelect,
    FilterModalPlaceClassifierSelect,
    FilterModalProblemClassifierSelect,
} from './useModalFilterClassifiers'

import {
    searchEmployeeUser,
    searchOrganizationProperty,
} from '../utils/clientSchema/search'
import {
    getClientNameFilter,
    getFilterAddressForSearch,
    getIsResidentContactFilter,
    getPropertyScopeFilter,
    getTicketAttributesFilter, getTicketTypeFilter,
} from '../utils/tables.utils'


const filterNumber = getNumberFilter('number')
const filterCreatedAtRange = getDayRangeFilter('createdAt')
const filterDeadlineRange = getDayRangeFilter('deadline')
const filterCompletedAtRange = getDayRangeFilter('completedAt')
const filterLastResidentCommentAtRange = getDayRangeFilter('lastResidentCommentAt')
const filterStatus = getFilter(['status', 'type'], 'array', 'string', 'in')
const filterDetails = getStringContainsFilter('details')
const filterProperty = getFilter(['property', 'id'], 'array', 'string', 'in')
const filterAddress = getStringContainsFilter(['property', 'address'])
const filterAddressForSearch = getFilterAddressForSearch()
const filterClientName = getClientNameFilter()
const filterExecutor = getFilter(['executor', 'id'], 'array', 'string', 'in')
const filterAssignee = getFilter(['assignee', 'id'], 'array', 'string', 'in')
const filterExecutorName = getStringContainsFilter(['executor', 'name'])
const filterAssigneeName = getStringContainsFilter(['assignee', 'name'])
const filterAttribute = getTicketAttributesFilter(['isEmergency', 'isPaid', 'isWarranty', 'statusReopenedCounter', 'isRegular'])
const filterIsResidentContact = getIsResidentContactFilter()
const filterFeedbackValue = getFilter('feedbackValue', 'array', 'string', 'in')
const filterQualityControlValue = getFilter('qualityControlValue', 'array', 'string', 'in')
const filterSource = getFilter(['source', 'id'], 'array', 'string', 'in')
const filterSection = getFilter('sectionName', 'array', 'string', 'in')
const filterFloor = getFilter('floorName', 'array', 'string', 'in')
const filterUnit = getFilter('unitName', 'array', 'string', 'in')
const filterUnitType = getFilter('unitType', 'array', 'string', 'in')
const filterPlaceClassifier = getFilter(['classifier', 'place', 'id'], 'array', 'string', 'in')
const filterCategoryClassifier = getFilter(['classifier', 'category', 'id'], 'array', 'string', 'in')
const filterProblemClassifier = getFilter(['classifier', 'problem', 'id'], 'array', 'string', 'in')
const filterCategoryClassifierSearch = getStringContainsFilter(['classifier', 'category', 'name'])
const filterClientPhone = getFilter('clientPhone', 'array', 'string', 'in')
const filterTicketAuthor = getFilter(['createdBy', 'id'], 'array', 'string', 'in')
const filterTicketContact = getFilter(['contact', 'id'], 'array', 'string', 'in')
const filterPropertyScope = getPropertyScopeFilter()


export function useTicketTableFilters (): Array<FiltersMeta<TicketWhereInput, Ticket>> {
    const intl = useIntl()
    const EmergencyMessage = intl.formatMessage({ id: 'emergency' }).toLowerCase()
    const WarrantyMessage = intl.formatMessage({ id: 'warranty' }).toLowerCase()
    const RegularMessage = intl.formatMessage({ id: 'regular' }).toLowerCase()
    const NumberMessage = intl.formatMessage({ id: 'ticketsTable.number' })
    const PaidMessage = intl.formatMessage({ id: 'paid' }).toLowerCase()
    const DateMessage = intl.formatMessage({ id: 'createdDate' })
    const CompletedAtMessage = intl.formatMessage({ id: 'ticket.filters.completedAt' })
    const CompleteBeforeMessage = intl.formatMessage({ id: 'ticket.deadline.completeBefore' })
    const StatusMessage =  intl.formatMessage({ id: 'status' })
    const DescriptionMessage = intl.formatMessage({ id: 'description' })
    const AddressMessage = intl.formatMessage({ id: 'field.address' })
    const EnterAddressMessage = intl.formatMessage({ id: 'meter.enterAddress' })
    const UserNameMessage = intl.formatMessage({ id: 'filters.userName' })
    const ExecutorMessage = intl.formatMessage({ id: 'field.executor' })
    const StartDateMessage = intl.formatMessage({ id: 'meter.startDate' })
    const EndDateMessage = intl.formatMessage({ id: 'meter.endDate' })
    const SourceMessage = intl.formatMessage({ id: 'field.source' })
    const SectionMessage = intl.formatMessage({ id: 'property.section.name' })
    const FloorMessage = intl.formatMessage({ id: 'property.floor.name' })
    const UnitTypeMessage = intl.formatMessage({ id: 'field.unitType' })
    const UnitMessage = intl.formatMessage({ id: 'field.flatNumber' })
    const EnterPhoneMessage = intl.formatMessage({ id: 'ticket.filters.enterPhone' })
    const ClientPhoneMessage = intl.formatMessage({ id: 'ticket.filters.clientPhone' })
    const AssigneeMessage = intl.formatMessage({ id: 'field.responsible' })
    const SelectMessage = intl.formatMessage({ id: 'select' })
    const PlaceClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.placeLabel' })
    const CategoryClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.categoryLabel' })
    const ProblemClassifierLabel = intl.formatMessage({ id: 'ticket.filters.problemClassifier' })
    const EnterUnitNameLabel = intl.formatMessage({ id: 'ticket.filters.enterUnitName' })
    const AttributeLabel = intl.formatMessage({ id: 'ticket.filters.attribute' })
    const AuthorMessage = intl.formatMessage({ id: 'ticket.filters.author' })
    const EnterFullNameMessage = intl.formatMessage({ id: 'ticket.filters.enterFullName' })
    const GoodFeedbackMessage = intl.formatMessage({ id: 'ticket.feedback.good' })
    const BadFeedbackMessage = intl.formatMessage({ id: 'ticket.feedback.bad' })
    const FeedbackValueMessage = intl.formatMessage({ id: 'ticket.feedback' })
    const QualityControlValueMessage = intl.formatMessage({ id: 'ticket.qualityControl.filter.label' })
    const GoodQualityControlMessage = intl.formatMessage({ id: 'ticket.qualityControl.good' })
    const BadQualityControlMessage = intl.formatMessage({ id: 'ticket.qualityControl.bad' })
    const ReturnedMessage = intl.formatMessage({ id: 'returned' })
    const IsResidentContactLabel = intl.formatMessage({ id: 'ticket.filters.isResidentContact' })
    const IsResidentContactMessage = intl.formatMessage({ id: 'ticket.filters.isResidentContact.true' })
    const IsNotResidentContactMessage = intl.formatMessage({ id: 'ticket.filters.isResidentContact.false' })
    const LastCommentAtMessage = intl.formatMessage({ id: 'ticket.filters.lastCommentAt' })
    const PropertyScopeMessage = intl.formatMessage({ id: 'settings.propertyScope' })
    const TicketTypeMessage = intl.formatMessage({ id: 'ticket.filters.ticketType' })
    const OwnTicketTypeMessage = intl.formatMessage({ id: 'ticket.filters.ticketType.own' })
    const FavoriteTicketTypeMessage = intl.formatMessage({ id: 'ticket.filters.ticketType.favorite' })

    const { user } = useAuth()

    const { objs: statuses } = TicketStatus.useObjects({})
    const statusOptions = useMemo(() => convertToOptions<TicketStatusType>(statuses, 'name', 'type'), [statuses])

    const { objs: sources } = TicketSource.useObjects({
        where: { type_in: VISIBLE_TICKET_SOURCE_TYPES },
    })
    const sourceOptions = useMemo(() => convertToOptions<TicketSourceType>(sources, 'name', 'id'), [sources])

    const attributeOptions = useMemo(() => [
        { label: RegularMessage, value: 'isRegular' },
        { label: PaidMessage, value: 'isPaid' },
        { label: EmergencyMessage, value: 'isEmergency' },
        { label: WarrantyMessage, value: 'isWarranty' },
        { label: ReturnedMessage.toLowerCase(), value: 'statusReopenedCounter' },
    ], [EmergencyMessage, PaidMessage, RegularMessage, ReturnedMessage, WarrantyMessage])
    const feedbackValueOptions = useMemo(() => [
        { label: GoodFeedbackMessage, value: FEEDBACK_VALUES_BY_KEY.GOOD },
        { label: BadFeedbackMessage, value: FEEDBACK_VALUES_BY_KEY.BAD },
    ], [BadFeedbackMessage, GoodFeedbackMessage])
    const qualityControlValueOptions = useMemo(() => [
        { label: GoodQualityControlMessage, value: QUALITY_CONTROL_VALUES_BY_KEY.GOOD },
        { label: BadQualityControlMessage, value: QUALITY_CONTROL_VALUES_BY_KEY.BAD },
    ], [BadQualityControlMessage, GoodQualityControlMessage])
    const unitTypeOptions = useMemo(() => [
        { label: intl.formatMessage({ id: `field.UnitType.${BuildingUnitSubType.Flat}` }), value: BuildingUnitSubType.Flat },
        { label: intl.formatMessage({ id: `field.UnitType.${BuildingUnitSubType.Parking}` }), value: BuildingUnitSubType.Parking },
        { label: intl.formatMessage({ id: `field.UnitType.${BuildingUnitSubType.Apartment}` }), value: BuildingUnitSubType.Apartment },
        { label: intl.formatMessage({ id: `field.UnitType.${BuildingUnitSubType.Commercial}` }), value: BuildingUnitSubType.Commercial },
        { label: intl.formatMessage({ id: `field.UnitType.${BuildingUnitSubType.Warehouse}` }), value: BuildingUnitSubType.Warehouse },
    ], [intl])
    const isResidentContactOptions = useMemo(() => [
        { label: IsResidentContactMessage, value: 'false' },
        { label: IsNotResidentContactMessage, value: 'true' },
    ], [IsNotResidentContactMessage, IsResidentContactMessage])
    const { objs: categoryClassifiers } = TicketCategoryClassifier.useObjects({})
    const categoryClassifiersOptions = useMemo(() => convertToOptions<TicketCategoryClassifierType>(categoryClassifiers, 'name', 'id'), [categoryClassifiers])

    const userOrganization = useOrganization()
    const userOrganizationId = get(userOrganization, ['organization', 'id'])

    const ticketTypeOptions = useMemo(
        () => [
            { label: FavoriteTicketTypeMessage, value: 'favorite' },
            { label: OwnTicketTypeMessage, value: 'own' },
        ],
        [FavoriteTicketTypeMessage, OwnTicketTypeMessage]
    )
    const filterTicketType = useMemo(
        () => getTicketTypeFilter(user.id),
        [user.id]
    )

    return useMemo(() => {
        return [
            {
                keyword: 'search',
                filters: [
                    filterNumber,
                    filterClientName,
                    filterAddressForSearch,
                    filterDetails,
                    filterExecutorName,
                    filterAssigneeName,
                    filterCreatedAtRange,
                    filterCategoryClassifierSearch,
                ],
                combineType: 'OR',
            },
            {
                keyword: 'address',
                filters: [filterAddress],
                component: {
                    type: ComponentType.Input,
                    props: {
                        placeholder: AddressMessage,
                    },
                },
            },
            {
                keyword: 'details',
                filters: [filterDetails],
                component: {
                    type: ComponentType.Input,
                    props: {
                        placeholder: DescriptionMessage,
                    },
                },
            },
            {
                keyword: 'clientName',
                filters: [filterClientName],
                component: {
                    type: ComponentType.Input,
                    props: {
                        placeholder: UserNameMessage,
                    },
                },
            },
            {
                keyword: 'number',
                filters: [filterNumber],
                component: {
                    type: ComponentType.Input,
                    props: {
                        placeholder: NumberMessage,
                    },
                },
            },
            {
                keyword: 'property',
                filters: [filterProperty],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchOrganizationProperty(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: EnterAddressMessage,
                        infinityScroll: true,
                    },
                    modalFilterComponentWrapper: {
                        label: AddressMessage,
                        size: FilterComponentSize.MediumLarge,
                    },
                    columnFilterComponentWrapper: {
                        width: '400px',
                    },
                },
            },
            {
                keyword: 'propertyScope',
                filters: [filterPropertyScope],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchOrganizationPropertyScope(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                        keyField: 'key',
                    },
                    modalFilterComponentWrapper: {
                        label: PropertyScopeMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'unitType',
                filters: [filterUnitType],
                component: {
                    type: ComponentType.Select,
                    options: unitTypeOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: UnitTypeMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'unitName',
                filters: [filterUnit],
                component: {
                    type: ComponentType.TagsSelect,
                    props: {
                        placeholder: EnterUnitNameLabel,
                    },
                    modalFilterComponentWrapper: {
                        label: UnitMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'type',
                filters: [filterTicketType],
                component: {
                    type: ComponentType.Select,
                    options: ticketTypeOptions,
                    props: {
                        loading: false,
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: TicketTypeMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'sectionName',
                filters: [filterSection],
                component: {
                    type: ComponentType.TagsSelect,
                    props: {
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: SectionMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'floorName',
                filters: [filterFloor],
                component: {
                    type: ComponentType.TagsSelect,
                    props: {
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: FloorMessage,
                        size: FilterComponentSize.Small,
                        spaceSizeAfter: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'placeClassifier',
                filters: [filterPlaceClassifier],
                component: {
                    type: ComponentType.Custom,
                    modalFilterComponent: (form) => <FilterModalPlaceClassifierSelect form={form} />,
                    modalFilterComponentWrapper: {
                        label: PlaceClassifierLabel,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'categoryClassifier',
                filters: [filterCategoryClassifier],
                component: {
                    type: ComponentType.Custom,
                    modalFilterComponent: (form) => <FilterModalCategoryClassifierSelect form={form} />,
                    modalFilterComponentWrapper: {
                        label: CategoryClassifierLabel,
                        size: FilterComponentSize.Small,
                    },
                    getComponentFilterDropdown: getSelectFilterDropdown({
                        selectProps: {
                            options: categoryClassifiersOptions,
                            placeholder: CategoryClassifierLabel,
                            mode: 'multiple',
                            id: 'categoryClassifierFilterDropdown',
                        },
                    }),
                },
            },
            {
                keyword: 'problemClassifier',
                filters: [filterProblemClassifier],
                component: {
                    type: ComponentType.Custom,
                    modalFilterComponent: (form) => <FilterModalProblemClassifierSelect form={form} />,
                    modalFilterComponentWrapper: {
                        label: ProblemClassifierLabel,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'status',
                filters: [filterStatus],
                component: {
                    type: ComponentType.Select,
                    options: statusOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: StatusMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'attributes',
                filters: [filterAttribute],
                component: {
                    type: ComponentType.Select,
                    options: attributeOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: AttributeLabel,
                        size: FilterComponentSize.Small,
                        spaceSizeAfter: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'source',
                filters: [filterSource],
                component: {
                    type: ComponentType.Select,
                    options: sourceOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: SourceMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'contactIsNull',
                filters: [filterIsResidentContact],
                component: {
                    type: ComponentType.Select,
                    options: isResidentContactOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: IsResidentContactLabel,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'clientPhone',
                filters: [filterClientPhone],
                component: {
                    type: ComponentType.TagsSelect,
                    props: {
                        placeholder: EnterPhoneMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: ClientPhoneMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'lastCommentAt',
                filters: [filterLastResidentCommentAtRange],
                component: {
                    type: ComponentType.DateRange,
                    props: {
                        placeholder: [StartDateMessage, EndDateMessage],
                    },
                    modalFilterComponentWrapper: {
                        label: LastCommentAtMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'feedbackValue',
                filters: [filterFeedbackValue],
                component: {
                    type: ComponentType.Select,
                    options: feedbackValueOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: FeedbackValueMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'qualityControlValue',
                filters: [filterQualityControlValue],
                component: {
                    type: ComponentType.Select,
                    options: qualityControlValueOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: QualityControlValueMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'executor',
                filters: [filterExecutor],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId, ({ role }) => (
                            get(role, 'canBeAssignedAsExecutor', false)
                        )),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: EnterFullNameMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: ExecutorMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'assignee',
                filters: [filterAssignee],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId, ({ role }) => (
                            get(role, 'canBeAssignedAsResponsible', false)
                        )),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: EnterFullNameMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: AssigneeMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'createdBy',
                filters: [filterTicketAuthor],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: EnterFullNameMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: AuthorMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'createdAt',
                filters: [filterCreatedAtRange],
                component: {
                    type: ComponentType.DateRange,
                    props: {
                        placeholder: [StartDateMessage, EndDateMessage],
                    },
                    modalFilterComponentWrapper: {
                        label: DateMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'completedAt',
                filters: [filterCompletedAtRange],
                component: {
                    type: ComponentType.DateRange,
                    props: {
                        placeholder: [StartDateMessage, EndDateMessage],
                    },
                    modalFilterComponentWrapper: {
                        label: CompletedAtMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'deadline',
                filters: [filterDeadlineRange],
                component: {
                    type: ComponentType.DateRange,
                    props: {
                        placeholder: [StartDateMessage, EndDateMessage],
                        disabledDate: () => false,
                    },
                    modalFilterComponentWrapper: {
                        label: CompleteBeforeMessage,
                        size: FilterComponentSize.Small,
                    },
                },
            },
            {
                keyword: 'contact',
                filters: [filterTicketContact],
            },
        ]
    }, [AddressMessage, DescriptionMessage, UserNameMessage, NumberMessage, userOrganizationId, EnterAddressMessage, SelectMessage, PropertyScopeMessage, unitTypeOptions, UnitTypeMessage, EnterUnitNameLabel, UnitMessage, filterTicketType, ticketTypeOptions, TicketTypeMessage, SectionMessage, FloorMessage, PlaceClassifierLabel, CategoryClassifierLabel, categoryClassifiersOptions, ProblemClassifierLabel, statusOptions, StatusMessage, attributeOptions, AttributeLabel, sourceOptions, SourceMessage, isResidentContactOptions, IsResidentContactLabel, EnterPhoneMessage, ClientPhoneMessage, StartDateMessage, EndDateMessage, LastCommentAtMessage, feedbackValueOptions, FeedbackValueMessage, qualityControlValueOptions, QualityControlValueMessage, EnterFullNameMessage, ExecutorMessage, AssigneeMessage, AuthorMessage, DateMessage, CompletedAtMessage, CompleteBeforeMessage])
}
