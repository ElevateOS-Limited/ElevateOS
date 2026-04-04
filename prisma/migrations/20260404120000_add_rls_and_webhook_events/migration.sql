-- Backfill legacy nullable org ids so the new tenant scope stays aligned with
-- the authenticated user's workspace id.
UPDATE "Worksheet" SET "orgId" = "userId" WHERE "orgId" IS NULL;
UPDATE "Feedback" SET "orgId" = "userId" WHERE "orgId" IS NULL;
UPDATE "ActivityOpportunity" SET "orgId" = "createdByUserId" WHERE "orgId" IS NULL;

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')
$$;

CREATE OR REPLACE FUNCTION app.current_org_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.org_id', true), '')
$$;

CREATE OR REPLACE FUNCTION app.is_service()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT lower(coalesce(current_setting('app.auth_mode', true), '')) = 'service'
$$;

CREATE OR REPLACE FUNCTION app.can_access_user_row(row_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.is_service()
    OR (
      app.current_user_id() IS NOT NULL
      AND row_user_id = app.current_user_id()
    )
$$;

CREATE OR REPLACE FUNCTION app.can_access_org_row(row_org_id text, row_user_id text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT app.is_service()
    OR (
      row_org_id IS NOT NULL
      AND app.current_org_id() IS NOT NULL
      AND row_org_id = app.current_org_id()
    )
    OR (
      row_user_id IS NOT NULL
      AND app.current_user_id() IS NOT NULL
      AND row_user_id = app.current_user_id()
    )
$$;

CREATE OR REPLACE FUNCTION app.can_access_activity_child_row(activity_id text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "ActivityOpportunity" activity
    WHERE activity.id = activity_id
      AND app.can_access_org_row(activity."orgId", activity."createdByUserId")
  )
$$;

CREATE OR REPLACE FUNCTION app.can_access_practice_result_row(session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "PracticeSession" session_row
    WHERE session_row.id = session_id
      AND app.can_access_user_row(session_row."userId")
  )
$$;

CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
  "eventId" text PRIMARY KEY,
  "eventType" text NOT NULL,
  "status" text NOT NULL DEFAULT 'received',
  "receivedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp(3) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "error" text
);

CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_status_receivedAt_idx"
  ON "StripeWebhookEvent" ("status", "receivedAt");

CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_receivedAt_idx"
  ON "StripeWebhookEvent" ("receivedAt");

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "User";
CREATE POLICY "self_or_service"
  ON "User"
  FOR ALL
  USING (app.can_access_user_row(id))
  WITH CHECK (app.can_access_user_row(id));

ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only" ON "Account";
CREATE POLICY "service_only"
  ON "Account"
  FOR ALL
  USING (app.is_service())
  WITH CHECK (app.is_service());

ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only" ON "Session";
CREATE POLICY "service_only"
  ON "Session"
  FOR ALL
  USING (app.is_service())
  WITH CHECK (app.is_service());

ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only" ON "VerificationToken";
CREATE POLICY "service_only"
  ON "VerificationToken"
  FOR ALL
  USING (app.is_service())
  WITH CHECK (app.is_service());

ALTER TABLE "StripeWebhookEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StripeWebhookEvent" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only" ON "StripeWebhookEvent";
CREATE POLICY "service_only"
  ON "StripeWebhookEvent"
  FOR ALL
  USING (app.is_service())
  WITH CHECK (app.is_service());

ALTER TABLE "ChangelogEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChangelogEntry" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only" ON "ChangelogEntry";
CREATE POLICY "service_only"
  ON "ChangelogEntry"
  FOR ALL
  USING (app.is_service())
  WITH CHECK (app.is_service());

ALTER TABLE "SidebarPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SidebarPreference" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "SidebarPreference";
CREATE POLICY "self_or_service"
  ON "SidebarPreference"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Note" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Note" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Note";
CREATE POLICY "self_or_service"
  ON "Note"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "FlashcardDeck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FlashcardDeck" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "FlashcardDeck";
CREATE POLICY "self_or_service"
  ON "FlashcardDeck"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Flashcard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Flashcard" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Flashcard";
CREATE POLICY "self_or_service"
  ON "Flashcard"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "FlashcardReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FlashcardReview" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "FlashcardReview";
CREATE POLICY "self_or_service"
  ON "FlashcardReview"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "UserStats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserStats" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "UserStats";
CREATE POLICY "self_or_service"
  ON "UserStats"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "EventLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventLog" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "EventLog";
CREATE POLICY "self_or_service"
  ON "EventLog"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Goal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Goal";
CREATE POLICY "self_or_service"
  ON "Goal"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Deadline" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deadline" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Deadline";
CREATE POLICY "self_or_service"
  ON "Deadline"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarEvent" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "CalendarEvent";
CREATE POLICY "self_or_service"
  ON "CalendarEvent"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Question";
CREATE POLICY "self_or_service"
  ON "Question"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "PracticeSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PracticeSession" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "PracticeSession";
CREATE POLICY "self_or_service"
  ON "PracticeSession"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "PracticeResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PracticeResult" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "PracticeResult";
CREATE POLICY "self_or_service"
  ON "PracticeResult"
  FOR ALL
  USING (app.can_access_practice_result_row("sessionId"))
  WITH CHECK (app.can_access_practice_result_row("sessionId"));

ALTER TABLE "StudyMaterial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudyMaterial" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "StudyMaterial";
CREATE POLICY "self_or_service"
  ON "StudyMaterial"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Worksheet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Worksheet" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_or_service" ON "Worksheet";
CREATE POLICY "org_or_service"
  ON "Worksheet"
  FOR ALL
  USING (app.can_access_org_row("orgId", "userId"))
  WITH CHECK (app.can_access_org_row("orgId", "userId"));

ALTER TABLE "PastPaper" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PastPaper" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "PastPaper";
CREATE POLICY "self_or_service"
  ON "PastPaper"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Essay" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Essay" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "Essay";
CREATE POLICY "self_or_service"
  ON "Essay"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChatMessage" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "ChatMessage";
CREATE POLICY "self_or_service"
  ON "ChatMessage"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "self_or_service" ON "StudySession";
CREATE POLICY "self_or_service"
  ON "StudySession"
  FOR ALL
  USING (app.can_access_user_row("userId"))
  WITH CHECK (app.can_access_user_row("userId"));

ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Feedback" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_or_service" ON "Feedback";
CREATE POLICY "org_or_service"
  ON "Feedback"
  FOR ALL
  USING (app.can_access_org_row("orgId", "userId"))
  WITH CHECK (app.can_access_org_row("orgId", "userId"));

ALTER TABLE "ActivityOpportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityOpportunity" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_or_service" ON "ActivityOpportunity";
CREATE POLICY "org_or_service"
  ON "ActivityOpportunity"
  FOR ALL
  USING (app.can_access_org_row("orgId", "createdByUserId"))
  WITH CHECK (app.can_access_org_row("orgId", "createdByUserId"));

ALTER TABLE "ActivityOpportunityTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityOpportunityTag" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parent_activity_or_service" ON "ActivityOpportunityTag";
CREATE POLICY "parent_activity_or_service"
  ON "ActivityOpportunityTag"
  FOR ALL
  USING (app.can_access_activity_child_row("activityId"))
  WITH CHECK (app.can_access_activity_child_row("activityId"));

ALTER TABLE "ActivityEvidenceTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityEvidenceTemplate" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parent_activity_or_service" ON "ActivityEvidenceTemplate";
CREATE POLICY "parent_activity_or_service"
  ON "ActivityEvidenceTemplate"
  FOR ALL
  USING (app.can_access_activity_child_row("activityId"))
  WITH CHECK (app.can_access_activity_child_row("activityId"));

ALTER TABLE "ActivityReviewLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityReviewLog" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parent_activity_or_service" ON "ActivityReviewLog";
CREATE POLICY "parent_activity_or_service"
  ON "ActivityReviewLog"
  FOR ALL
  USING (app.can_access_activity_child_row("activityId"))
  WITH CHECK (app.can_access_activity_child_row("activityId"));
