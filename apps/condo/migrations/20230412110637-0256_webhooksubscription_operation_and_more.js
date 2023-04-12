// auto generated by kmigrator
// KMIGRATOR:0256_webhooksubscription_operation_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMC41IG9uIDIwMjMtMDQtMTIgMDY6MDYKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyNTVfYXV0b18yMDIzMDQxMV8xMzA2JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSd3ZWJob29rc3Vic2NyaXB0aW9uJywKICAgICAgICAgICAgbmFtZT0nb3BlcmF0aW9uJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkNoYXJGaWVsZChibGFuaz1UcnVlLCBjaG9pY2VzPVsoJ2NyZWF0ZScsICdjcmVhdGUnKSwgKCd1cGRhdGUnLCAndXBkYXRlJyksICgnZGVsZXRlJywgJ2RlbGV0ZScpXSwgbWF4X2xlbmd0aD01MCwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3dlYmhvb2tzdWJzY3JpcHRpb25oaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nb3BlcmF0aW9uJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field operation to webhooksubscription
--
ALTER TABLE "WebhookSubscription" ADD COLUMN "operation" varchar(50) NULL;
--
-- Add field operation to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" ADD COLUMN "operation" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field operation to webhooksubscriptionhistoryrecord
--
ALTER TABLE "WebhookSubscriptionHistoryRecord" DROP COLUMN "operation" CASCADE;
--
-- Add field operation to webhooksubscription
--
ALTER TABLE "WebhookSubscription" DROP COLUMN "operation" CASCADE;
COMMIT;

    `)
}
