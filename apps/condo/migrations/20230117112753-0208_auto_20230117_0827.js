// auto generated by kmigrator
// KMIGRATOR:0208_auto_20230117_0827:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi45IG9uIDIwMjMtMDEtMTcgMDg6MjcKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMjA3X2F1dG9fMjAyMjEyMzBfMTAyMCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdzZXJ2aWNlc3Vic2NyaXB0aW9ucGF5bWVudCcsCiMgICAgICAgICAgICBuYW1lPSdjcmVhdGVkQnknLAojICAgICAgICApLAojICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAojICAgICAgICAgICAgbW9kZWxfbmFtZT0nc2VydmljZXN1YnNjcmlwdGlvbnBheW1lbnQnLAojICAgICAgICAgICAgbmFtZT0nb3JnYW5pemF0aW9uJywKIyAgICAgICAgKSwKIyAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKIyAgICAgICAgICAgIG1vZGVsX25hbWU9J3NlcnZpY2VzdWJzY3JpcHRpb25wYXltZW50JywKIyAgICAgICAgICAgIG5hbWU9J3N1YnNjcmlwdGlvbicsCiMgICAgICAgICksCiMgICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiMgICAgICAgICAgICBtb2RlbF9uYW1lPSdzZXJ2aWNlc3Vic2NyaXB0aW9ucGF5bWVudCcsCiMgICAgICAgICAgICBuYW1lPSd1cGRhdGVkQnknLAojICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlQ29uc3RyYWludCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nc2VydmljZXN1YnNjcmlwdGlvbicsCiAgICAgICAgICAgIG5hbWU9J3RyaWFsX2FuZF9wcmljZXNfY2hlY2snLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nc2VydmljZXN1YnNjcmlwdGlvbicsCiAgICAgICAgICAgIG5hbWU9J3NiYm9sT2ZmZXJBY2NlcHQnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nc2VydmljZXN1YnNjcmlwdGlvbmhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdzYmJvbE9mZmVyQWNjZXB0JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J3NlcnZpY2VzdWJzY3JpcHRpb25wYXltZW50JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuRGVsZXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J3NlcnZpY2VzdWJzY3JpcHRpb25wYXltZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgKSwKICAgIF0K

// NOTE(antonal): Keep data for backward compatibility with old code, will keep querying the table during deployment
// Table will be removed manually later, see 'fix-database-migration-state.js' script

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove constraint trial_and_prices_check from model servicesubscription
--
ALTER TABLE "ServiceSubscription" DROP CONSTRAINT "trial_and_prices_check";
--
-- Remove field sbbolOfferAccept from servicesubscription
--
--ALTER TABLE "ServiceSubscription" DROP COLUMN "sbbolOfferAccept" CASCADE;
--
-- Remove field sbbolOfferAccept from servicesubscriptionhistoryrecord
--
--ALTER TABLE "ServiceSubscriptionHistoryRecord" DROP COLUMN "sbbolOfferAccept" CASCADE;
--
-- Delete model servicesubscriptionpayment
--
--DROP TABLE "ServiceSubscriptionPayment" CASCADE;
--
-- Delete model servicesubscriptionpaymenthistoryrecord
--
--DROP TABLE "ServiceSubscriptionPaymentHistoryRecord" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Delete model servicesubscriptionpaymenthistoryrecord
--
--CREATE TABLE "ServiceSubscriptionPaymentHistoryRecord" ("dv" integer NULL, "sender" jsonb NULL, "type" text NULL, "status" text NULL, "externalId" text NULL, "amount" numeric(18, 4) NULL, "currency" text NULL, "organization" uuid NULL, "subscription" uuid NULL, "meta" jsonb NULL, "statusMeta" jsonb NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Delete model servicesubscriptionpayment
--
--CREATE TABLE "ServiceSubscriptionPayment" ("dv" integer NOT NULL, "sender" jsonb NOT NULL, "type" varchar(50) NOT NULL, "status" varchar(50) NOT NULL, "externalId" text NULL, "amount" numeric(18, 4) NOT NULL, "currency" varchar(50) NOT NULL, "meta" jsonb NULL, "statusMeta" jsonb NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "createdBy" uuid NULL, "organization" uuid NOT NULL, "subscription" uuid NOT NULL, "updatedBy" uuid NULL, CONSTRAINT "service_subscription_payment_type_check" CHECK ("type" IN ('default', 'sbbol')), CONSTRAINT "service_subscription_payment_status_check" CHECK ("status" IN ('created', 'processing', 'done', 'error', 'stopped', 'cancelled')), CONSTRAINT "service_subscription_payment_currency_check" CHECK ("currency" IN ('RUB')), CONSTRAINT "service_subscription_payment_positive_amount_check" CHECK ("amount" > 0));
--
-- Remove field sbbolOfferAccept from servicesubscriptionhistoryrecord
--
--ALTER TABLE "ServiceSubscriptionHistoryRecord" ADD COLUMN "sbbolOfferAccept" jsonb NULL;
--
-- Remove field sbbolOfferAccept from servicesubscription
--
--ALTER TABLE "ServiceSubscription" ADD COLUMN "sbbolOfferAccept" jsonb NULL;
--
-- Remove constraint trial_and_prices_check from model servicesubscription
--
-- NOTE: It will be impossible to bring constraint back after it was dropped, because newly created records can violate it
--ALTER TABLE "ServiceSubscription" ADD CONSTRAINT "trial_and_prices_check" CHECK ((("isTrial" AND "unitsCount" IS NULL AND "unitPrice" IS NULL AND "totalPrice" IS NULL AND "currency" IS NULL) OR (NOT "isTrial" AND "totalPrice" IS NOT NULL AND "currency" IS NOT NULL)));
--CREATE INDEX "ServiceSubscriptionPaymentHistoryRecord_history_id_123e9bce" ON "ServiceSubscriptionPaymentHistoryRecord" ("history_id");
--ALTER TABLE "ServiceSubscriptionPayment" ADD CONSTRAINT "ServiceSubscriptionPayment_createdBy_6355d454_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
--ALTER TABLE "ServiceSubscriptionPayment" ADD CONSTRAINT "ServiceSubscriptionP_organization_b2bce42a_fk_Organizat" FOREIGN KEY ("organization") REFERENCES "Organization" ("id") DEFERRABLE INITIALLY DEFERRED;
--ALTER TABLE "ServiceSubscriptionPayment" ADD CONSTRAINT "ServiceSubscriptionP_subscription_a62a2787_fk_ServiceSu" FOREIGN KEY ("subscription") REFERENCES "ServiceSubscription" ("id") DEFERRABLE INITIALLY DEFERRED;
--ALTER TABLE "ServiceSubscriptionPayment" ADD CONSTRAINT "ServiceSubscriptionPayment_updatedBy_0af71a32_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
--CREATE INDEX "ServiceSubscriptionPayment_externalId_bfd8bb49" ON "ServiceSubscriptionPayment" ("externalId");
--CREATE INDEX "ServiceSubscriptionPayment_externalId_bfd8bb49_like" ON "ServiceSubscriptionPayment" ("externalId" text_pattern_ops);
--CREATE INDEX "ServiceSubscriptionPayment_createdAt_ea103fea" ON "ServiceSubscriptionPayment" ("createdAt");
--CREATE INDEX "ServiceSubscriptionPayment_updatedAt_5e358a21" ON "ServiceSubscriptionPayment" ("updatedAt");
--CREATE INDEX "ServiceSubscriptionPayment_deletedAt_e2584920" ON "ServiceSubscriptionPayment" ("deletedAt");
--CREATE INDEX "ServiceSubscriptionPayment_createdBy_6355d454" ON "ServiceSubscriptionPayment" ("createdBy");
--CREATE INDEX "ServiceSubscriptionPayment_organization_b2bce42a" ON "ServiceSubscriptionPayment" ("organization");
--CREATE INDEX "ServiceSubscriptionPayment_subscription_a62a2787" ON "ServiceSubscriptionPayment" ("subscription");
--CREATE INDEX "ServiceSubscriptionPayment_updatedBy_0af71a32" ON "ServiceSubscriptionPayment" ("updatedBy");
COMMIT;

    `)
}
