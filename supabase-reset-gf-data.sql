-- ============================================
-- RESET ALL GF (GIRLFRIEND) DATA
-- Run this in Supabase SQL Editor to clear
-- all tracked data for the GF profile
-- ============================================

-- 1. Delete all game responses from GF users
-- (GF fake users have IDs starting with 'special-her-id-')
DELETE FROM public.game_responses
WHERE user_id::text LIKE 'special-her-id-%';

-- Also delete any from profiles with role = 'gf'
DELETE FROM public.game_responses
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'gf'
);

-- 2. Delete all visit events from GF users
DELETE FROM public.visit_events
WHERE user_id::text LIKE 'special-her-id-%';

DELETE FROM public.visit_events
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'gf'
);

-- 3. Delete all auth sessions from GF users
DELETE FROM public.auth_sessions
WHERE user_id::text LIKE 'special-her-id-%';

DELETE FROM public.auth_sessions
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'gf'
);

-- 4. Delete all device logs from GF users
DELETE FROM public.device_logs
WHERE user_id::text LIKE 'special-her-id-%';

DELETE FROM public.device_logs
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'gf'
);

-- 5. Verification: Check remaining data
SELECT 'game_responses' AS table_name, COUNT(*) AS remaining FROM public.game_responses
UNION ALL
SELECT 'visit_events', COUNT(*) FROM public.visit_events
UNION ALL
SELECT 'auth_sessions', COUNT(*) FROM public.auth_sessions
UNION ALL
SELECT 'device_logs', COUNT(*) FROM public.device_logs;
