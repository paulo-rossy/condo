// auto generated by kmigrator
// KMIGRATOR:0216_auto_20230203_0538:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi43IG9uIDIwMjMtMDItMDMgMDU6MzgKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMTVfcmVtb3ZlX3VzZXJleHRlcm5hbGlkZW50aXR5X3VzZXJleHRlcm5hbGlkZW50aXR5X3VuaXF1ZV9pZGVudGl0eWlkX2FuZF9pZGVudGl0eXR5cGVfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3JlbW90ZWNsaWVudCcsCiAgICAgICAgICAgIG5hbWU9J3B1c2hUb2tlblZvSVAnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSwgdW5pcXVlPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ncmVtb3RlY2xpZW50JywKICAgICAgICAgICAgbmFtZT0ncHVzaFRyYW5zcG9ydFZvSVAnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQ2hhckZpZWxkKGJsYW5rPVRydWUsIGNob2ljZXM9WygnZmlyZWJhc2UnLCAnZmlyZWJhc2UnKSwgKCdhcHBsZScsICdhcHBsZScpLCAoJ2h1YXdlaScsICdodWF3ZWknKV0sIG1heF9sZW5ndGg9NTAsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZW1vdGVjbGllbnQnLAogICAgICAgICAgICBuYW1lPSdwdXNoVHlwZVZvSVAnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQ2hhckZpZWxkKGJsYW5rPVRydWUsIGNob2ljZXM9WygnZGVmYXVsdCcsICdkZWZhdWx0JyksICgnc2lsZW50X2RhdGEnLCAnc2lsZW50X2RhdGEnKV0sIG1heF9sZW5ndGg9NTApLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ncmVtb3RlY2xpZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J3B1c2hUb2tlblZvSVAnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZW1vdGVjbGllbnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncHVzaFRyYW5zcG9ydFZvSVAnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdyZW1vdGVjbGllbnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncHVzaFR5cGVWb0lQJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s'; 

--
-- Add field pushTokenVoIP to remoteclient
--
ALTER TABLE "RemoteClient" ADD COLUMN "pushTokenVoIP" text NULL UNIQUE;
--
-- Add field pushTransportVoIP to remoteclient
--
ALTER TABLE "RemoteClient" ADD COLUMN "pushTransportVoIP" varchar(50) NULL;
--
-- Add field pushTypeVoIP to remoteclient
--
ALTER TABLE "RemoteClient" ADD COLUMN "pushTypeVoIP" varchar(50) DEFAULT '' NOT NULL;
ALTER TABLE "RemoteClient" ALTER COLUMN "pushTypeVoIP" DROP DEFAULT;
--
-- Add field pushTokenVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" ADD COLUMN "pushTokenVoIP" text NULL;
--
-- Add field pushTransportVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" ADD COLUMN "pushTransportVoIP" text NULL;
--
-- Add field pushTypeVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" ADD COLUMN "pushTypeVoIP" text NULL;
CREATE INDEX "RemoteClient_pushTokenVoIP_541d231c_like" ON "RemoteClient" ("pushTokenVoIP" text_pattern_ops);

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

--
-- Add field pushTypeVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" DROP COLUMN "pushTypeVoIP" CASCADE;
--
-- Add field pushTransportVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" DROP COLUMN "pushTransportVoIP" CASCADE;
--
-- Add field pushTokenVoIP to remoteclienthistoryrecord
--
ALTER TABLE "RemoteClientHistoryRecord" DROP COLUMN "pushTokenVoIP" CASCADE;
--
-- Add field pushTypeVoIP to remoteclient
--
ALTER TABLE "RemoteClient" DROP COLUMN "pushTypeVoIP" CASCADE;
--
-- Add field pushTransportVoIP to remoteclient
--
ALTER TABLE "RemoteClient" DROP COLUMN "pushTransportVoIP" CASCADE;
--
-- Add field pushTokenVoIP to remoteclient
--
ALTER TABLE "RemoteClient" DROP COLUMN "pushTokenVoIP" CASCADE;

--
-- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
--
SET statement_timeout = '10s';

COMMIT;

    `)
}
