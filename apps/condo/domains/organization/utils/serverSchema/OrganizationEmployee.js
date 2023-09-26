function filterEmployeePropertyScopes (propertyScopes, employee) {
    return propertyScopes.filter(scope =>
        scope.hasAllEmployees && scope.organization === employee.organization ||
        scope.employees.find(id => id === employee.id)
    )
}

function filterEmployeeSpecializations (organizationEmployeeSpecializations, employee) {
    return organizationEmployeeSpecializations
        .filter(organizationEmployeeSpecialization => organizationEmployeeSpecialization.employee === employee.id)
        .map(organizationEmployeeSpecialization => organizationEmployeeSpecialization.specialization)
}

function mapEmployeeToVisibilityTypeToEmployees (employeeToVisibilityType, type) {
    return employeeToVisibilityType.filter(({ visibilityType }) => visibilityType === type).map(({ employee }) => employee)
}

module.exports = {
    filterEmployeePropertyScopes,
    filterEmployeeSpecializations,
    mapEmployeeToVisibilityTypeToEmployees,
}