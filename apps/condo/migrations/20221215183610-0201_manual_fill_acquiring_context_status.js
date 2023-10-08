// auto generated by kmigrator
// KMIGRATOR:20221215183610-0201_manual_fill_acquiring_context_status
// NOTE: Added acquiring context status field in previous auto-migration
// It's pseudo-required (not required, abut automatically resolved), so KMIGRATOR does not fill it with default value in previous migration

exports.up = async (knex) => {
    await knex.raw(`
        BEGIN;
        UPDATE "AcquiringIntegrationContext" SET "status" = 'Finished' WHERE True;
        COMMIT;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
        BEGIN;
        UPDATE "AcquiringIntegrationContext" SET "status" = null WHERE True;
        COMMIT;
    `)
}
