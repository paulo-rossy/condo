// auto generated by kmigrator
// KMIGRATOR:0327_remove_billingreceipt_recipient_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4yIG9uIDIwMjMtMTAtMTggMTM6NDEKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMzI2X2ludm9pY2Vjb250ZXh0aGlzdG9yeXJlY29yZF9hbmRfbW9yZScpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ3JlY2VpcHQnLAogICAgICAgICAgICBuYW1lPSdyZWNpcGllbnQnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW1vdmVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ3JlY2VpcHRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncmVjaXBpZW50JywKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field recipient from billingreceipt
--
ALTER TABLE "BillingReceipt" DROP COLUMN "recipient" CASCADE;
--
-- Remove field recipient from billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" DROP COLUMN "recipient" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field recipient from billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" ADD COLUMN "recipient" jsonb NULL;
--
-- Remove field recipient from billingreceipt
--
ALTER TABLE "BillingReceipt" ADD COLUMN "recipient" jsonb NOT NULL;
COMMIT;

    `)
}