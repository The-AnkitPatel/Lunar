-- ============================================
-- LUNAR VALENTINE APP - TRACKING & GAME RESPONSES SCHEMA
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================

-- 1. Add last_active_at to auth_sessions (code already uses it)
ALTER TABLE public.auth_sessions
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- 2. VISIT TRACKING TABLE - Tracks every page/feature opened
CREATE TABLE IF NOT EXISTS public.visit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.auth_sessions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL DEFAULT 'page_view', -- page_view, feature_open, feature_close
    feature_name TEXT, -- e.g. 'truth', 'quiz', 'proposal', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. GAME RESPONSES TABLE - Captures all game answers/messages
CREATE TABLE IF NOT EXISTS public.game_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.auth_sessions(id) ON DELETE SET NULL,
    game_type TEXT NOT NULL, -- truth_or_love, would_you_rather, complete_sentence, love_quiz, proposal, dream_date, spin_wheel, promise_jar, love_coupons
    question_text TEXT,
    response_text TEXT,
    response_data JSONB DEFAULT '{}', -- structured data (choices, scores, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.visit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - visit_events
-- ============================================

-- Users can insert their own visit events
CREATE POLICY "Users can insert own visit events"
    ON public.visit_events FOR INSERT
    WITH CHECK (true);

-- Users can view their own visit events
CREATE POLICY "Users can view own visit events"
    ON public.visit_events FOR SELECT
    USING (auth.uid() = user_id);

-- Admin can view all visit events
CREATE POLICY "Admin can view all visit events"
    ON public.visit_events FOR SELECT
    USING (true);

-- ============================================
-- RLS POLICIES - game_responses
-- ============================================

-- Users can insert their own game responses
CREATE POLICY "Users can insert own game responses"
    ON public.game_responses FOR INSERT
    WITH CHECK (true);

-- Users can view their own game responses
CREATE POLICY "Users can view own game responses"
    ON public.game_responses FOR SELECT
    USING (auth.uid() = user_id);

-- Admin can view all game responses
CREATE POLICY "Admin can view all game responses"
    ON public.game_responses FOR SELECT
    USING (true);

-- Users can update their own game responses (for editing)
CREATE POLICY "Users can update own game responses"
    ON public.game_responses FOR UPDATE
    USING (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER TABLE public.visit_events REPLICA IDENTITY FULL;
ALTER TABLE public.game_responses REPLICA IDENTITY FULL;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_visit_events_user_id ON public.visit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_visit_events_created_at ON public.visit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visit_events_session_id ON public.visit_events(session_id);
CREATE INDEX IF NOT EXISTS idx_game_responses_user_id ON public.game_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_game_responses_game_type ON public.game_responses(game_type);
CREATE INDEX IF NOT EXISTS idx_game_responses_created_at ON public.game_responses(created_at DESC);
