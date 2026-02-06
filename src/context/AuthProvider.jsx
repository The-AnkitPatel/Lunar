import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContext';
import { getCurrentProfile, getSession, onAuthStateChange, signOut } from '../lib/auth';

// Helper: check if a fake session exists in localStorage
function getFakeSession() {
    try {
        const str = localStorage.getItem('lunar_fake_session');
        if (str) return JSON.parse(str);
    } catch { }
    return null;
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile when session changes
    const fetchProfile = useCallback(async (uid) => {
        try {
            const userId = uid || session?.user?.id;
            if (!userId) return;

            const prof = await getCurrentProfile(userId);
            setProfile(prof);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setProfile(null);
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const currentSession = await getSession();
            if (mounted) {
                setSession(currentSession);
                if (currentSession) {
                    await fetchProfile(currentSession.user.id);
                }
                setLoading(false);
            }
        };

        init();

        // Listen for Supabase auth changes
        // IMPORTANT: For fake sessions (GF/Admin), Supabase fires with session=null.
        // We must NOT clear state if a fake session exists in localStorage.
        const { data: { subscription } } = onAuthStateChange(async (newSession) => {
            if (!mounted) return;

            if (newSession) {
                // Real Supabase session
                setSession(newSession);
                await fetchProfile(newSession.user.id);
                setLoading(false);
            } else {
                // Supabase says no session — check if we have a fake session
                const fake = getFakeSession();
                if (fake) {
                    // Keep the fake session alive, don't clear anything
                    setSession(fake);
                    await fetchProfile(fake.user.id);
                } else {
                    // Genuinely logged out
                    setSession(null);
                    setProfile(null);
                }
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [fetchProfile]);

    const handleSignOut = useCallback(async () => {
        await signOut();
        setSession(null);
        setProfile(null);
    }, []);

    const isAdmin = profile?.role === 'admin' || session?.user?.user_metadata?.role === 'admin';
    const isGf = profile?.role === 'gf' || session?.user?.user_metadata?.role === 'gf';
    const isAuthenticated = !!session;

    const login = useCallback(async (email, password) => {
        const data = await import('../lib/auth').then(m => m.signIn(email, password));
        if (data?.session) {
            setSession(data.session);
            if (data.user) {
                await fetchProfile(data.user.id);
            }
        }
        return data;
    }, [fetchProfile]);

    const value = {
        session,
        profile,
        loading,
        isAuthenticated,
        isAdmin,
        isGf,
        login, // Export login function
        signOut: handleSignOut,
        refreshProfile: fetchProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
