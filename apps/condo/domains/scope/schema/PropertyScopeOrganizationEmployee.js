/**
 * Generated by `createschema scope.PropertyScopeOrganizationEmployee 'propertyScope:Relationship:PropertyScope:CASCADE; employee:Relationship:OrganizationEmployee:CASCADE;'`
 */

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/scope/access/PropertyScopeOrganizationEmployee')


const PropertyScopeOrganizationEmployee = new GQLListSchema('PropertyScopeOrganizationEmployee', {
    schemaDoc: 'Many-to-many relationship between PropertyScope and OrganizationEmployee',
    fields: {

        propertyScope: {
            type: 'Relationship',
            ref: 'PropertyScope',
            schemaDoc: 'Property scope which has an employee',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        employee: {
            type: 'Relationship',
            ref: 'OrganizationEmployee',
            schemaDoc: 'An employee who is in the property scope',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['propertyScope', 'employee'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'property_scope_organization_employee_unique_propertyScope_and_employee',
            },
        ],
    },
    plugins: [
        uuided(),
        versioned(),
        tracked(),
        softDeleted(),
        dvAndSender(),
        historical(),
    ],
    access: {
        read: access.canReadPropertyScopeOrganizationEmployees,
        create: access.canManagePropertyScopeOrganizationEmployees,
        update: access.canManagePropertyScopeOrganizationEmployees,
        delete: false,
        auth: true,
    },
})

module.exports = {
    PropertyScopeOrganizationEmployee,
}
