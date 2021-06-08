// auto generated by kmigrator
// KMIGRATOR:0017_auto_20210608_0708:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi4zIG9uIDIwMjEtMDYtMDggMDc6MDgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwMTZfdGlja2V0c3RhdHVzaGlzdG9yeXJlY29yZF9jb2xvcnMnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3Byb3BlcnR5JywKICAgICAgICAgICAgbmFtZT0ndW5pdHNDb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5JbnRlZ2VyRmllbGQoZGVmYXVsdD0wKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ncHJvcGVydHloaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ndW5pdHNDb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5JbnRlZ2VyRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field unitsCount to property
--
ALTER TABLE "Property" ADD COLUMN "unitsCount" integer DEFAULT 0 NOT NULL;
ALTER TABLE "Property" ALTER COLUMN "unitsCount" DROP DEFAULT;
--
-- Alter field unitsCount on propertyhistoryrecord
--
ALTER TABLE "PropertyHistoryRecord" ALTER COLUMN "unitsCount" TYPE integer USING "unitsCount"::integer;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field unitsCount on propertyhistoryrecord
--
ALTER TABLE "PropertyHistoryRecord" ALTER COLUMN "unitsCount" TYPE jsonb USING "unitsCount"::jsonb;
--
-- Add field unitsCount to property
--
ALTER TABLE "Property" DROP COLUMN "unitsCount" CASCADE;
COMMIT;

    `)
}
