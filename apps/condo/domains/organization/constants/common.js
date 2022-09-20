const TIN_LENGTH = 10
const MIN_ORGANIZATION_NAME_LENGTH = 3
const DEFAULT_ORGANIZATION_TIMEZONE = 'Europe/Moscow'
const DEFAULT_ROLES = {
    // Administrator role is required for mutation logic
    'Administrator': {
        'name': 'employee.role.Administrator.name',
        'description': 'employee.role.Administrator.description',
        'canManageOrganization': true,
        'canManageEmployees': true,
        'canManageRoles': true,
        'canManageIntegrations': true,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': true,
        'canManageTicketComments': true,
        'canManageDivisions': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': true,
        'canReadBillingReceipts': true,
        'canReadEntitiesOnlyInScopeOfDivision': false,
        'canManageTicketPropertyHints': true,
    },
    'Dispatcher': {
        'name': 'employee.role.Dispatcher.name',
        'description': 'employee.role.Dispatcher.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': true,
        'canManageTicketComments': true,
        'canManageDivisions': true,
        'canShareTickets': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': true,
        'canReadBillingReceipts': true,
        'canReadEntitiesOnlyInScopeOfDivision': false,
        'canManageTicketPropertyHints': false,
    },
    'Manager': {
        'name': 'employee.role.Manager.name',
        'description': 'employee.role.Manager.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': true,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageDivisions': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canReadEntitiesOnlyInScopeOfDivision': false,
        'canManageTicketPropertyHints': false,
    },
    'Foreman': {
        'name': 'employee.role.Foreman.name',
        'description': 'employee.role.Foreman.description',
        'canManageOrganization': false,
        'canManageEmployees': true,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': true,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageDivisions': true,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canReadEntitiesOnlyInScopeOfDivision': false,
        'canManageTicketPropertyHints': false,
    },
    'Technician': {
        'name': 'employee.role.Technician.name',
        'description': 'employee.role.Technician.description',
        'canManageOrganization': false,
        'canManageEmployees': false,
        'canManageRoles': false,
        'canManageIntegrations': false,
        'canManageProperties': false,
        'canManageTickets': true,
        'canManageContacts': false,
        'canManageContactRoles': false,
        'canManageTicketComments': true,
        'canManageDivisions': false,
        'canManageMeters': true,
        'canManageMeterReadings': true,
        'canShareTickets': true,
        'canBeAssignedAsResponsible': true,
        'canBeAssignedAsExecutor': true,
        'canReadPayments': false,
        'canReadBillingReceipts': false,
        'canReadEntitiesOnlyInScopeOfDivision': false,
        'canManageTicketPropertyHints': false,
    },
}
module.exports = {
    TIN_LENGTH,
    MIN_ORGANIZATION_NAME_LENGTH,
    DEFAULT_ORGANIZATION_TIMEZONE,
    DEFAULT_ROLES,
}
