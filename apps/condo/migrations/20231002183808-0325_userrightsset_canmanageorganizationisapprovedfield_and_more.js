// auto generated by kmigrator
// KMIGRATOR:0325_userrightsset_canmanageorganizationisapprovedfield_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC41IG9uIDIwMjMtMTAtMDIgMTM6MzgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMjRfYXV0b18yMDIzMTAwMl8wNjUwJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd1c2VycmlnaHRzc2V0JywKICAgICAgICAgICAgbmFtZT0nY2FuTWFuYWdlT3JnYW5pemF0aW9uSXNBcHByb3ZlZEZpZWxkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChkZWZhdWx0PUZhbHNlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXJyaWdodHNzZXRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nY2FuTWFuYWdlT3JnYW5pemF0aW9uSXNBcHByb3ZlZEZpZWxkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageOrganizationIsApprovedField to userrightsset
--
ALTER TABLE "UserRightsSet" ADD COLUMN "canManageOrganizationIsApprovedField" boolean DEFAULT false NOT NULL;
ALTER TABLE "UserRightsSet" ALTER COLUMN "canManageOrganizationIsApprovedField" DROP DEFAULT;
--
-- Add field canManageOrganizationIsApprovedField to userrightssethistoryrecord
--
ALTER TABLE "UserRightsSetHistoryRecord" ADD COLUMN "canManageOrganizationIsApprovedField" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canManageOrganizationIsApprovedField to userrightssethistoryrecord
--
ALTER TABLE "UserRightsSetHistoryRecord" DROP COLUMN "canManageOrganizationIsApprovedField" CASCADE;
--
-- Add field canManageOrganizationIsApprovedField to userrightsset
--
ALTER TABLE "UserRightsSet" DROP COLUMN "canManageOrganizationIsApprovedField" CASCADE;
COMMIT;

    `)
}
