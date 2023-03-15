// auto generated by kmigrator
// KMIGRATOR:0234_webhooksubscription_operations_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC41IG9uIDIwMjMtMDMtMTUgMDg6MzIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMzNfYmFua2ludGVncmF0aW9ub3JnYW5pemF0aW9uY29udGV4dGhpc3RvcnlyZWNvcmRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3dlYmhvb2tzdWJzY3JpcHRpb24nLAogICAgICAgICAgICBuYW1lPSdvcGVyYXRpb25zJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nd2ViaG9va3N1YnNjcmlwdGlvbmhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdvcGVyYXRpb25zJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field operations to webhooksubscription
--
ALTER TABLE "WebhookSubscription" ADD COLUMN "operations" jsonb NULL;
--
-- Add field operations to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" ADD COLUMN "operations" jsonb NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field operations to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" DROP COLUMN "operations" CASCADE;
--
-- Add field operations to webhooksubscription
--
ALTER TABLE "WebhookSubscription" DROP COLUMN "operations" CASCADE;
COMMIT;

    `)
}
