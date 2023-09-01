// auto generated by kmigrator
// KMIGRATOR:0311_billingaccount_isclosed_billingaccount_ownertype_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi40IG9uIDIwMjMtMDktMDEgMDk6MjEKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMTBfYjJiYXBwYWNjZXNzcmlnaHRzZXRfY2FubWFuYWdlbWV0ZXJyZWFkaW5nc19hbmRfbW9yZScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2FjY291bnQnLAogICAgICAgICAgICBuYW1lPSdpc0Nsb3NlZCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoZGVmYXVsdD1GYWxzZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5nYWNjb3VudCcsCiAgICAgICAgICAgIG5hbWU9J293bmVyVHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdwZXJzb24nLCAncGVyc29uJyksICgnY29tcGFueScsICdjb21wYW55JyldLCBkZWZhdWx0PSdwZXJzb24nLCBtYXhfbGVuZ3RoPTUwKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdhY2NvdW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2lzQ2xvc2VkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkJvb2xlYW5GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ2FjY291bnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nb3duZXJUeXBlJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
    
--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';

--
-- Add field isClosed to billingaccount
--
ALTER TABLE "BillingAccount" ADD COLUMN "isClosed" boolean DEFAULT false NOT NULL;
ALTER TABLE "BillingAccount" ALTER COLUMN "isClosed" DROP DEFAULT;
--
-- Add field ownerType to billingaccount
--
ALTER TABLE "BillingAccount" ADD COLUMN "ownerType" varchar(50) DEFAULT 'person' NOT NULL;
ALTER TABLE "BillingAccount" ALTER COLUMN "ownerType" DROP DEFAULT;
--
-- Add field isClosed to billingaccounthistoryrecord
--
ALTER TABLE "BillingAccountHistoryRecord" ADD COLUMN "isClosed" boolean NULL;
--
-- Add field ownerType to billingaccounthistoryrecord
--
ALTER TABLE "BillingAccountHistoryRecord" ADD COLUMN "ownerType" text NULL;

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
-- Add field ownerType to billingaccounthistoryrecord
--
ALTER TABLE "BillingAccountHistoryRecord" DROP COLUMN "ownerType" CASCADE;
--
-- Add field isClosed to billingaccounthistoryrecord
--
ALTER TABLE "BillingAccountHistoryRecord" DROP COLUMN "isClosed" CASCADE;
--
-- Add field ownerType to billingaccount
--
ALTER TABLE "BillingAccount" DROP COLUMN "ownerType" CASCADE;
--
-- Add field isClosed to billingaccount
--
ALTER TABLE "BillingAccount" DROP COLUMN "isClosed" CASCADE;
COMMIT;

    `)
}
