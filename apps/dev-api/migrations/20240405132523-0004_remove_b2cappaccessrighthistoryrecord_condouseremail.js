// auto generated by kmigrator
// KMIGRATOR:0004_remove_b2cappaccessrighthistoryrecord_condouseremail:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS41IG9uIDIwMjQtMDQtMDUgMDg6MjUKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMDAzX2IyY2FwcGFjY2Vzc3JpZ2h0aGlzdG9yeXJlY29yZF9hbmRfbW9yZScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYjJjYXBwYWNjZXNzcmlnaHRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY29uZG9Vc2VyRW1haWwnLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field condoUserEmail from b2cappaccessrighthistoryrecord
--
ALTER TABLE "B2CAppAccessRightHistoryRecord" DROP COLUMN "condoUserEmail" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field condoUserEmail from b2cappaccessrighthistoryrecord
--
ALTER TABLE "B2CAppAccessRightHistoryRecord" ADD COLUMN "condoUserEmail" jsonb NULL;
COMMIT;

    `)
}
