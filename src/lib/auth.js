import { supabase } from './supabase';
import { collectDeviceInfo } from './deviceFingerprint';

// Sign in with email/password
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    // Log device info after successful login
    await logDeviceInfo(data.user.id);

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
    // Mark session inactive
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase
            .from('auth_sessions')
            .update({ is_active: false, logout_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('is_active', true);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Get current user profile (with role)
export async function getCurrentProfile(userId = null) {
    let uid = userId;

    if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        uid = user.id;
    }

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
        await supabase.from('auth_sessions').insert({
            user_id: userId,
            device_log_id: deviceLog?.id,
        });
    } catch (err) {
        console.error('Failed to log device info:', err);
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
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}
