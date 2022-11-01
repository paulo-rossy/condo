// auto generated by kmigrator
// KMIGRATOR:0185_webhooksubscription_failurescount_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS4yIG9uIDIwMjItMTEtMDYgMTE6MTMKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxODRfYXV0b18yMDIyMTEwMl8xNDAyJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd3ZWJob29rc3Vic2NyaXB0aW9uJywKICAgICAgICAgICAgbmFtZT0nZmFpbHVyZXNDb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5JbnRlZ2VyRmllbGQoZGVmYXVsdD0wKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3dlYmhvb2tzdWJzY3JpcHRpb25oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nZmFpbHVyZXNDb3VudCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5JbnRlZ2VyRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field failuresCount to webhooksubscription
--
ALTER TABLE "WebhookSubscription" ADD COLUMN "failuresCount" integer DEFAULT 0 NOT NULL;
ALTER TABLE "WebhookSubscription" ALTER COLUMN "failuresCount" DROP DEFAULT;
--
-- Add field failuresCount to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" ADD COLUMN "failuresCount" integer NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field failuresCount to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" DROP COLUMN "failuresCount" CASCADE;
--
-- Add field failuresCount to webhooksubscription
--
ALTER TABLE "WebhookSubscription" DROP COLUMN "failuresCount" CASCADE;
COMMIT;

    `)
}
