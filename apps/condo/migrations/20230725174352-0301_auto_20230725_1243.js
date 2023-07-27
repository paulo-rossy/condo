// auto generated by kmigrator
// KMIGRATOR:0301_auto_20230725_1243:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMSBvbiAyMDIzLTA3LTI1IDEyOjQzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDMwMF9uZXdzaXRlbXRlbXBsYXRlX3R5cGVfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
    --
    -- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
    --
    SET statement_timeout = '1500s'; 
    
    -- [CUSTOM] change default PropertyScope name for all organizations that haven't changed it
    -- That's was done due to changes in translation key naming convention
    UPDATE "PropertyScope" SET name = 'settings.propertyScope.default.name'
    WHERE name = 'pages.condo.settings.propertyScope.default.name';
    
    -- [CUSTOM] update OrganizationEmployeeRole name for all organizations
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.administrator.name'
    WHERE name = 'employee.role.Administrator.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.dispatcher.name'
    WHERE name = 'employee.role.Dispatcher.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.manager.name'
    WHERE name = 'employee.role.Manager.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.foreman.name'
    WHERE name = 'employee.role.Foreman.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.technician.name'
    WHERE name = 'employee.role.Technician.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.contractor.name'
    WHERE name = 'employee.role.Contractor.name';
    
    --
    -- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
    --
    SET statement_timeout = '10s';
    
    COMMIT;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
    
    --
    -- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
    --
    SET statement_timeout = '1500s'; 
    
    UPDATE "PropertyScope" SET name = 'pages.condo.settings.propertyScope.default.name'
    WHERE name = 'settings.propertyScope.default.name';
    
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Administrator.name'
    WHERE name = 'employee.role.administrator.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Dispatcher.name'
    WHERE name = 'employee.role.dispatcher.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Manager.name'
    WHERE name = 'employee.role.manager.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Foreman.name'
    WHERE name = 'employee.role.foreman.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Technician.name'
    WHERE name = 'employee.role.technician.name';
    UPDATE "OrganizationEmployeeRole" SET name = 'employee.role.Contractor.name'
    WHERE name = 'employee.role.contractor.name';
    
    --
    -- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
    --
    SET statement_timeout = '10s';
    
    COMMIT;
    `)
}
