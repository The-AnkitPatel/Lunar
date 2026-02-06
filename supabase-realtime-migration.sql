-- ============================================
-- LUNAR VALENTINE APP - REALTIME MIGRATION
-- Run this in Supabase SQL Editor to enable
-- real-time tracking for the admin dashboard
-- ============================================

-- ============================================
-- 1. ENABLE REPLICA IDENTITY FULL on tracking tables
--    (Required for Supabase Realtime Postgres Changes
--     to detect old/new row values on UPDATE/DELETE)
-- ============================================
ALTER TABLE public.device_logs REPLICA IDENTITY FULL;
ALTER TABLE public.auth_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.visit_events REPLICA IDENTITY FULL;
ALTER TABLE public.game_responses REPLICA IDENTITY FULL;

-- ============================================
-- 2. ADD TABLES TO supabase_realtime PUBLICATION
--    (Supabase only broadcasts changes for tables
--     in this publication)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'device_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.device_logs;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'auth_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.auth_sessions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'visit_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_events;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'game_responses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.game_responses;
    END IF;
END $$;

-- ============================================
-- 3. FIX RLS POLICIES FOR FAKE/SPECIAL USERS
--    The app uses fake user IDs like 'special-her-id-*'
--    which bypass Supabase Auth, so auth.uid() is NULL.
--    These broader policies allow the tracking to work.
-- ============================================

-- Drop restrictive policies if they exist, replace with broader ones
DO $$
BEGIN
    -- device_logs: allow any insert
    DROP POLICY IF EXISTS "Users can insert own device logs" ON public.device_logs;
    DROP POLICY IF EXISTS "Allow insert for any user device logs" ON public.device_logs;
    CREATE POLICY "Allow insert for any user device logs"
        ON public.device_logs FOR INSERT WITH CHECK (true);

    -- device_logs: allow any select (admin dashboard needs it)
    DROP POLICY IF EXISTS "Users can view own device logs" ON public.device_logs;
    DROP POLICY IF EXISTS "Admin can view all device logs" ON public.device_logs;
    DROP POLICY IF EXISTS "Anyone can view all device logs" ON public.device_logs;
    CREATE POLICY "Anyone can view all device logs"
        ON public.device_logs FOR SELECT USING (true);

    -- auth_sessions: allow any insert
    DROP POLICY IF EXISTS "Users can insert own sessions" ON public.auth_sessions;
    DROP POLICY IF EXISTS "Allow insert for any user sessions" ON public.auth_sessions;
    CREATE POLICY "Allow insert for any user sessions"
        ON public.auth_sessions FOR INSERT WITH CHECK (true);

    -- auth_sessions: allow any update (heartbeat, logout)
    DROP POLICY IF EXISTS "Users can update own sessions" ON public.auth_sessions;
    DROP POLICY IF EXISTS "Allow update for any user sessions" ON public.auth_sessions;
    CREATE POLICY "Allow update for any user sessions"
        ON public.auth_sessions FOR UPDATE USING (true);

    -- auth_sessions: allow any select
    DROP POLICY IF EXISTS "Users can view own sessions" ON public.auth_sessions;
    DROP POLICY IF EXISTS "Admin can view all sessions" ON public.auth_sessions;
    DROP POLICY IF EXISTS "Admin or anon can view all sessions" ON public.auth_sessions;
    CREATE POLICY "Admin or anon can view all sessions"
        ON public.auth_sessions FOR SELECT USING (true);

    -- visit_events: allow any insert
    DROP POLICY IF EXISTS "Users can insert own visit events" ON public.visit_events;
    CREATE POLICY "Users can insert own visit events"
        ON public.visit_events FOR INSERT WITH CHECK (true);

    -- visit_events: allow any select
    DROP POLICY IF EXISTS "Users can view own visit events" ON public.visit_events;
    DROP POLICY IF EXISTS "Admin can view all visit events" ON public.visit_events;
    CREATE POLICY "Admin can view all visit events"
        ON public.visit_events FOR SELECT USING (true);

    -- game_responses: allow any insert
    DROP POLICY IF EXISTS "Users can insert own game responses" ON public.game_responses;
    CREATE POLICY "Users can insert own game responses"
        ON public.game_responses FOR INSERT WITH CHECK (true);

    -- game_responses: allow any select
    DROP POLICY IF EXISTS "Users can view own game responses" ON public.game_responses;
    DROP POLICY IF EXISTS "Admin can view all game responses" ON public.game_responses;
    CREATE POLICY "Admin can view all game responses"
        ON public.game_responses FOR SELECT USING (true);

    -- game_responses: allow any update (editing)
    DROP POLICY IF EXISTS "Users can update own game responses" ON public.game_responses;
    CREATE POLICY "Users can update own game responses"
        ON public.game_responses FOR UPDATE USING (true);
END $$;

-- ============================================
-- 4. ENSURE last_active_at COLUMN EXISTS
-- ============================================
ALTER TABLE public.auth_sessions
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================
-- 5. ADD is_edited COLUMNS TO game_responses
--    (Needed for edit tracking in the dashboard)
-- ============================================
ALTER TABLE public.game_responses
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;

ALTER TABLE public.game_responses
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

ALTER TABLE public.game_responses
ADD COLUMN IF NOT EXISTS original_response_text TEXT;

ALTER TABLE public.game_responses
ADD COLUMN IF NOT EXISTS original_response_data JSONB;

-- ============================================
-- 6. VERIFY: Check what's in the publication
-- ============================================
SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;
