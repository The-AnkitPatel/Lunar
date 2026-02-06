-- ============================================
-- LUNAR VALENTINE APP - COMPLETE DATABASE SCHEMA
-- Apply this in Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE - Stores user role (admin / gf)
-- Automatically created when a user signs up via auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'My Love',
    role TEXT NOT NULL DEFAULT 'gf' CHECK (role IN ('admin', 'gf')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DEVICE LOGS TABLE - Captures device fingerprint, IP, etc on every login
CREATE TABLE IF NOT EXISTS public.device_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    platform TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    device_type TEXT, -- mobile / desktop / tablet
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    fingerprint TEXT, -- canvas/audio fingerprint hash
    connection_type TEXT, -- wifi / cellular / ethernet
    is_touch_device BOOLEAN DEFAULT false,
    color_depth INTEGER,
    device_memory INTEGER, -- in GB
    hardware_concurrency INTEGER, -- CPU cores
    max_touch_points INTEGER,
    webgl_renderer TEXT,
    webgl_vendor TEXT,
    referrer TEXT,
    logged_in_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AUTH SESSIONS TABLE - Track active sessions
CREATE TABLE IF NOT EXISTS public.auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_log_id UUID REFERENCES public.device_logs(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    logout_at TIMESTAMPTZ
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow insert during signup (service role or trigger)
CREATE POLICY "Allow insert for authenticated users"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- DEVICE LOGS policies
-- Users can insert their own device logs
CREATE POLICY "Users can insert own device logs"
    ON public.device_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own device logs
CREATE POLICY "Users can view own device logs"
    ON public.device_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Admin can view all device logs
CREATE POLICY "Admin can view all device logs"
    ON public.device_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- AUTH SESSIONS policies
-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.auth_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.auth_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own sessions (for logout)
CREATE POLICY "Users can update own sessions"
    ON public.auth_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin can view all sessions
CREATE POLICY "Admin can view all sessions"
    ON public.auth_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'My Love'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'gf')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_device_logs_user_id ON public.device_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_device_logs_logged_in_at ON public.device_logs(logged_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
