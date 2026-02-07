import { supabase } from './supabase';
import { collectDeviceInfo } from './deviceFingerprint';

// Sign in with email/password
export async function signIn(email, password) {
    // Hardcoded special access for her
    const specialUser = "foreverUs";
    const specialPass = "OnlyYouKajal";

    // Hardcoded Admin access
    const adminUser = "Ankit";
    const adminPass = "Ankit@Kajal#";

    const inputUsername = email.split('@')[0];

    let fakeSession = null;

    // Actual database user IDs from auth.users table
    const GF_USER_ID = "c6b344cb-705f-4567-9b76-63d28ed33115";
    const ADMIN_USER_ID = "9b9ebf95-6e32-455e-977a-ec907a89b19d";

    // Check GF (Case Insensitive)
    if (inputUsername.toLowerCase() === specialUser.toLowerCase() && password.toLowerCase() === specialPass.toLowerCase()) {
        const fakeUser = {
            id: GF_USER_ID, // Use actual database user ID
            email: "romantic@lunar.love",
            user_metadata: {
                display_name: "My Love",
                role: "gf"
            }
        };

        const sessionId = await logDeviceInfo(fakeUser.id);
        if (sessionId) {
            localStorage.setItem('current_session_id', sessionId);
        }

        fakeSession = { user: fakeUser, access_token: 'fake-jwt', user_metadata: fakeUser.user_metadata };
    }

    // Check Admin (Case Insensitive Username, Exact Password)
    else if (inputUsername.toLowerCase() === adminUser.toLowerCase() && password === adminPass) {
        const fakeAdmin = {
            id: ADMIN_USER_ID, // Use actual database user ID
            email: "admin@lunar.love",
            user_metadata: {
                display_name: "Ankit",
                role: "admin"
            }
        };

        const sessionId = await logDeviceInfo(fakeAdmin.id);
        if (sessionId) {
            localStorage.setItem('current_session_id', sessionId);
        }

        fakeSession = { user: fakeAdmin, access_token: 'fake-admin-jwt', user_metadata: fakeAdmin.user_metadata };
    }

    if (fakeSession) {
        localStorage.setItem('lunar_fake_session', JSON.stringify(fakeSession));
        return { user: fakeSession.user, session: fakeSession };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    // Log device info after successful login and get session ID
    const sessionId = await logDeviceInfo(data.user.id);

    // Store session ID for heartbeat
    if (sessionId) {
        localStorage.setItem('current_session_id', sessionId);
    }

    return data;
}

// Sign up with email/password + role
export async function signUp(email, password, displayName, role = 'gf') {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
                role: role,
            },
        },
    });

    if (error) throw error;
    return data;
}

// Sign out
export async function signOut() {
    // Mark current session inactive in DB
    const sessionId = localStorage.getItem('current_session_id');
    if (sessionId) {
        await supabase
            .from('auth_sessions')
            .update({ is_active: false, logout_at: new Date().toISOString() })
            .eq('id', sessionId);
    }

    // Clear fake session & session tracking
    localStorage.removeItem('lunar_fake_session');
    localStorage.removeItem('current_session_id');

    // Also try Supabase signout for real sessions
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('auth_sessions')
                .update({ is_active: false, logout_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('is_active', true);
        }
        await supabase.auth.signOut();
    } catch (e) {
        // Ignore — may be a fake user with no real Supabase session
    }
}

// Get current user profile (with role)
export async function getCurrentProfile(userId = null) {
    let uid = userId;

    if (!uid) {
        const session = await getSession();
        if (session) {
            uid = session.user.id;
        } else {
            return null;
        }
    }

    // Fake sessions now use actual database UUIDs, so no special handling needed
    // Just fetch from database like normal users

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return profile;
}

// Log device info to database
async function logDeviceInfo(userId) {
    try {
        const deviceInfo = await collectDeviceInfo();

        // Insert device log
        const { data: deviceLog, error: deviceError } = await supabase
            .from('device_logs')
            .insert({
                user_id: userId,
                ...deviceInfo,
            })
            .select()
            .single();

        if (deviceError) {
            console.error('Device log error:', deviceError);
            return;
        }

        // Create auth session
        const { data: sessionData, error: sessionError } = await supabase
            .from('auth_sessions')
            .insert({
                user_id: userId,
                device_log_id: deviceLog?.id,
                last_active_at: new Date().toISOString()
            })
            .select()
            .single();

        if (sessionError) {
            console.error('Session creation error:', sessionError);
            return null;
        }

        return sessionData?.id;
    } catch (err) {
        console.error('Failed to log device info:', err);
        return null;
    }
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
}

// Get session
export async function getSession() {
    // Check for fake session first
    const fakeSessionStr = localStorage.getItem('lunar_fake_session');
    if (fakeSessionStr) {
        return JSON.parse(fakeSessionStr);
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Update session heartbeat
export async function updateSessionHeartbeat(sessionId) {
    if (!sessionId) return;

    await supabase
        .from('auth_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', sessionId);
}
