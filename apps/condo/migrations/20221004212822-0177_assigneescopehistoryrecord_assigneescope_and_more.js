// auto generated by kmigrator
// KMIGRATOR:0177_assigneescopehistoryrecord_assigneescope_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIyLTEwLTA0IDE2OjI4Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCmltcG9ydCBkamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTc2X3JlbW92ZV9kaXZpc2lvbl9jcmVhdGVkYnlfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQ3JlYXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J2Fzc2lnbmVlc2NvcGVoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgZmllbGRzPVsKICAgICAgICAgICAgICAgICgndXNlcicsIG1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3RpY2tldCcsIG1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2lkJywgbW9kZWxzLlVVSURGaWVsZChwcmltYXJ5X2tleT1UcnVlLCBzZXJpYWxpemU9RmFsc2UpKSwKICAgICAgICAgICAgICAgICgndicsIG1vZGVscy5JbnRlZ2VyRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd1cGRhdGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnY3JlYXRlZEJ5JywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndXBkYXRlZEJ5JywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZGVsZXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ25ld0lkJywgbW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZHYnLCBtb2RlbHMuSW50ZWdlckZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdzZW5kZXInLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdoaXN0b3J5X2RhdGUnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnaGlzdG9yeV9hY3Rpb24nLCBtb2RlbHMuQ2hhckZpZWxkKGNob2ljZXM9WygnYycsICdjJyksICgndScsICd1JyksICgnZCcsICdkJyldLCBtYXhfbGVuZ3RoPTUwKSksCiAgICAgICAgICAgICAgICAoJ2hpc3RvcnlfaWQnLCBtb2RlbHMuVVVJREZpZWxkKGRiX2luZGV4PVRydWUpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnQXNzaWduZWVTY29wZUhpc3RvcnlSZWNvcmQnLAogICAgICAgICAgICB9LAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5DcmVhdGVNb2RlbCgKICAgICAgICAgICAgbmFtZT0nYXNzaWduZWVzY29wZScsCiAgICAgICAgICAgIGZpZWxkcz1bCiAgICAgICAgICAgICAgICAoJ2lkJywgbW9kZWxzLlVVSURGaWVsZChwcmltYXJ5X2tleT1UcnVlLCBzZXJpYWxpemU9RmFsc2UpKSwKICAgICAgICAgICAgICAgICgndicsIG1vZGVscy5JbnRlZ2VyRmllbGQoZGVmYXVsdD0xKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIGRiX2luZGV4PVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd1cGRhdGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBkYl9pbmRleD1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZGVsZXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgZGJfaW5kZXg9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ25ld0lkJywgbW9kZWxzLlVVSURGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZHYnLCBtb2RlbHMuSW50ZWdlckZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdzZW5kZXInLCBtb2RlbHMuSlNPTkZpZWxkKCkpLAogICAgICAgICAgICAgICAgKCdjcmVhdGVkQnknLCBtb2RlbHMuRm9yZWlnbktleShibGFuaz1UcnVlLCBkYl9jb2x1bW49J2NyZWF0ZWRCeScsIG51bGw9VHJ1ZSwgb25fZGVsZXRlPWRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24uU0VUX05VTEwsIHJlbGF0ZWRfbmFtZT0nKycsIHRvPSdfZGphbmdvX3NjaGVtYS51c2VyJykpLAogICAgICAgICAgICAgICAgKCd0aWNrZXQnLCBtb2RlbHMuRm9yZWlnbktleShkYl9jb2x1bW49J3RpY2tldCcsIG9uX2RlbGV0ZT1kamFuZ28uZGIubW9kZWxzLmRlbGV0aW9uLkNBU0NBREUsIHJlbGF0ZWRfbmFtZT0nKycsIHRvPSdfZGphbmdvX3NjaGVtYS50aWNrZXQnKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0ndXBkYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ3VzZXInLCBtb2RlbHMuRm9yZWlnbktleShkYl9jb2x1bW49J3VzZXInLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5DQVNDQURFLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEudXNlcicpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnQXNzaWduZWVTY29wZScsCiAgICAgICAgICAgIH0sCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZENvbnN0cmFpbnQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2Fzc2lnbmVlc2NvcGUnLAogICAgICAgICAgICBjb25zdHJhaW50PW1vZGVscy5VbmlxdWVDb25zdHJhaW50KGNvbmRpdGlvbj1tb2RlbHMuUSgoJ2RlbGV0ZWRBdF9faXNudWxsJywgVHJ1ZSkpLCBmaWVsZHM9KCd1c2VyJywgJ3RpY2tldCcpLCBuYW1lPSdhc3NpZ25lZV9zY29wZV91bmlxdWVfdXNlcl9hbmRfdGlja2V0JyksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model assigneescopehistoryrecord
--
CREATE TABLE "AssigneeScopeHistoryRecord" ("user" uuid NULL, "ticket" uuid NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "dv" integer NULL, "sender" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Create model assigneescope
--
CREATE TABLE "AssigneeScope" ("id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "dv" integer NOT NULL, "sender" jsonb NOT NULL, "createdBy" uuid NULL, "ticket" uuid NOT NULL, "updatedBy" uuid NULL, "user" uuid NOT NULL);
--
-- Create constraint assignee_scope_unique_user_and_ticket on model assigneescope
--
CREATE UNIQUE INDEX "assignee_scope_unique_user_and_ticket" ON "AssigneeScope" ("user", "ticket") WHERE "deletedAt" IS NULL;
CREATE INDEX "AssigneeScopeHistoryRecord_history_id_f722994a" ON "AssigneeScopeHistoryRecord" ("history_id");
ALTER TABLE "AssigneeScope" ADD CONSTRAINT "AssigneeScope_createdBy_4605faa4_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "AssigneeScope" ADD CONSTRAINT "AssigneeScope_ticket_e8a38c15_fk_Ticket_id" FOREIGN KEY ("ticket") REFERENCES "Ticket" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "AssigneeScope" ADD CONSTRAINT "AssigneeScope_updatedBy_3e164999_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "AssigneeScope" ADD CONSTRAINT "AssigneeScope_user_30b38706_fk_User_id" FOREIGN KEY ("user") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "AssigneeScope_createdAt_f0087a85" ON "AssigneeScope" ("createdAt");
CREATE INDEX "AssigneeScope_updatedAt_fd0fda5f" ON "AssigneeScope" ("updatedAt");
CREATE INDEX "AssigneeScope_deletedAt_521af26a" ON "AssigneeScope" ("deletedAt");
CREATE INDEX "AssigneeScope_createdBy_4605faa4" ON "AssigneeScope" ("createdBy");
CREATE INDEX "AssigneeScope_ticket_e8a38c15" ON "AssigneeScope" ("ticket");
CREATE INDEX "AssigneeScope_updatedBy_3e164999" ON "AssigneeScope" ("updatedBy");
CREATE INDEX "AssigneeScope_user_30b38706" ON "AssigneeScope" ("user");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create constraint assignee_scope_unique_user_and_ticket on model assigneescope
--
DROP INDEX IF EXISTS "assignee_scope_unique_user_and_ticket";
--
-- Create model assigneescope
--
DROP TABLE "AssigneeScope" CASCADE;
--
-- Create model assigneescopehistoryrecord
--
DROP TABLE "AssigneeScopeHistoryRecord" CASCADE;
COMMIT;

    `)
}
