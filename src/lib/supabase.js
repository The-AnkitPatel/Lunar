import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'lunar-auth-session',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Session persists for 30 days
        storage: {
            getItem: (key) => {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) return null;
                    // Check if session data has custom expiry
                    const parsed = JSON.parse(item);
                    if (parsed._lunar_expiry && Date.now() > parsed._lunar_expiry) {
                        localStorage.removeItem(key);
                        return null;
                    }
                    return item;
                } catch {
                    return localStorage.getItem(key);
                }
            },
            setItem: (key, value) => {
                try {
                    const parsed = JSON.parse(value);
                    // Add 30-day expiry marker
                    parsed._lunar_expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
                    localStorage.setItem(key, JSON.stringify(parsed));
                } catch {
                    localStorage.setItem(key, value);
                }
            },
            removeItem: (key) => localStorage.removeItem(key),
        },
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    global: {
        headers: {
            'x-app-name': 'lunar',
        },
    },
});
