// auto generated by kmigrator
// KMIGRATOR:0309_b2bappaccessrightsethistoryrecord_canmanagecontacts_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC41IG9uIDIwMjMtMDgtMjQgMTI6MTIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMDhfYjJiYXBwcGVybWlzc2lvbl9uYW1lX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBhY2Nlc3NyaWdodHNldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5NYW5hZ2VDb250YWN0cycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2IyYmFwcGFjY2Vzc3JpZ2h0c2V0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2Nhbk1hbmFnZU9yZ2FuaXphdGlvbnMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBhY2Nlc3NyaWdodHNldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5NYW5hZ2VQcm9wZXJ0aWVzJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYjJiYXBwYWNjZXNzcmlnaHRzZXRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZENvbnRhY3RzJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYjJiYXBwYWNjZXNzcmlnaHRzZXRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY2FuUmVhZE9yZ2FuaXphdGlvbnMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBhY2Nlc3NyaWdodHNldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkUHJvcGVydGllcycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageContacts to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canManageContacts" boolean NULL;
--
-- Add field canManageOrganizations to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canManageOrganizations" boolean NULL;
--
-- Add field canManageProperties to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canManageProperties" boolean NULL;
--
-- Add field canReadContacts to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canReadContacts" boolean NULL;
--
-- Add field canReadOrganizations to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canReadOrganizations" boolean NULL;
--
-- Add field canReadProperties to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" ADD COLUMN "canReadProperties" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadProperties to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canReadProperties" CASCADE;
--
-- Add field canReadOrganizations to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canReadOrganizations" CASCADE;
--
-- Add field canReadContacts to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canReadContacts" CASCADE;
--
-- Add field canManageProperties to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canManageProperties" CASCADE;
--
-- Add field canManageOrganizations to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canManageOrganizations" CASCADE;
--
-- Add field canManageContacts to b2bappaccessrightsethistoryrecord
--
ALTER TABLE "B2BAppAccessRightSetHistoryRecord" DROP COLUMN "canManageContacts" CASCADE;
COMMIT;

    `)
}
