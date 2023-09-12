// auto generated by kmigrator
// KMIGRATOR:0313_auto_20230912_0636:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi41IG9uIDIwMjMtMDktMTIgMDY6MzYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMTJfdXNlcnJpZ2h0c3NldGhpc3RvcnlyZWNvcmRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2IyYmFwcCcsCiAgICAgICAgICAgIG5hbWU9J2lzR2xvYmFsJywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2IyYmFwcGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdpc0dsb2JhbCcsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHAnLAogICAgICAgICAgICBuYW1lPSdnbG9iYWxVcmwnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHBoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nZ2xvYmFsVXJsJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field isGlobal from b2bapp
--
ALTER TABLE "B2BApp" DROP COLUMN "isGlobal" CASCADE;
--
-- Remove field isGlobal from b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" DROP COLUMN "isGlobal" CASCADE;
--
-- Add field globalUrl to b2bapp
--
ALTER TABLE "B2BApp" ADD COLUMN "globalUrl" text NULL;
--
-- Add field globalUrl to b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" ADD COLUMN "globalUrl" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field globalUrl to b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" DROP COLUMN "globalUrl" CASCADE;
--
-- Add field globalUrl to b2bapp
--
ALTER TABLE "B2BApp" DROP COLUMN "globalUrl" CASCADE;
--
-- Remove field isGlobal from b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" ADD COLUMN "isGlobal" boolean NULL;
--
-- Remove field isGlobal from b2bapp
--
ALTER TABLE "B2BApp" ADD COLUMN "isGlobal" boolean NOT NULL;
COMMIT;

    `)
}