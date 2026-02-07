import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// BULLETPROOF TRACKING SYSTEM - MULTIPLE FALLBACK LAYERS
// ═══════════════════════════════════════════════════════════════════════════

const FAILED_QUEUE_KEY = 'lunar_failed_tracking_queue';
const LOCAL_RESPONSES_KEY = 'lunar_local_responses';
const LOCAL_EVENTS_KEY = 'lunar_local_events';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * LAYER 1: Get current user ID with multiple fallback sources
 */
async function getCurrentUserId() {
    // Priority 1: Check localStorage fake session
    try {
        const fakeSessionStr = localStorage.getItem('lunar_fake_session');
        if (fakeSessionStr) {
            const fakeSession = JSON.parse(fakeSessionStr);
            if (fakeSession?.user?.id) {
                console.log('[Tracking] Using fake session user ID:', fakeSession.user.id);
                return fakeSession.user.id;
            }
        }
    } catch (e) {
        console.warn('[Tracking] Error reading fake session:', e);
    }

    // Priority 2: Supabase auth
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
            console.log('[Tracking] Using Supabase auth user ID:', user.id);
            return user.id;
        }
    } catch (e) {
        console.warn('[Tracking] Error getting Supabase user:', e);
    }

    console.error('[Tracking] CRITICAL: No user ID found!');
    return null;
}

/**
 * LAYER 2: Save to localStorage as immediate backup
 */
function saveToLocalBackup(type, data) {
    try {
        const key = type === 'response' ? LOCAL_RESPONSES_KEY : LOCAL_EVENTS_KEY;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
            ...data,
            local_timestamp: new Date().toISOString(),
            synced: false
        });
        // Keep last 500 items
        const trimmed = existing.slice(-500);
        localStorage.setItem(key, JSON.stringify(trimmed));
        console.log(`[Tracking] Backed up ${type} to localStorage`);
        return true;
    } catch (e) {
        console.error('[Tracking] Failed to save local backup:', e);
        return false;
    }
}

/**
 * LAYER 3: Add failed item to retry queue
 */
function addToRetryQueue(type, payload) {
    try {
        const queue = JSON.parse(localStorage.getItem(FAILED_QUEUE_KEY) || '[]');
        queue.push({
            type,
            payload,
            attempts: 0,
            created_at: new Date().toISOString()
        });
        localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(queue.slice(-100)));
        console.log('[Tracking] Added to retry queue');
    } catch (e) {
        console.error('[Tracking] Failed to add to retry queue:', e);
    }
}

/**
 * LAYER 4: Process retry queue (call this periodically)
 */
export async function processRetryQueue() {
    try {
        const queue = JSON.parse(localStorage.getItem(FAILED_QUEUE_KEY) || '[]');
        if (queue.length === 0) return;

        console.log(`[Tracking] Processing ${queue.length} items in retry queue`);
        const remaining = [];

        for (const item of queue) {
            item.attempts++;
            let success = false;

            try {
                if (item.type === 'response') {
                    const { error } = await supabase.from('game_responses').insert(item.payload);
                    success = !error;
                    if (error) console.error('[Tracking] Retry failed:', error);
                } else if (item.type === 'event') {
                    const { error } = await supabase.from('visit_events').insert(item.payload);
                    success = !error;
                    if (error) console.error('[Tracking] Retry failed:', error);
                }
            } catch (e) {
                console.error('[Tracking] Retry error:', e);
            }

            if (!success && item.attempts < MAX_RETRIES) {
                remaining.push(item);
            } else if (success) {
                console.log('[Tracking] Successfully synced queued item!');
            }
        }

        localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(remaining));
    } catch (e) {
        console.error('[Tracking] Error processing retry queue:', e);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN TRACKING FUNCTIONS WITH FALLBACKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Save a game response with multiple fallback layers
 */
export async function saveGameResponse({ gameType, questionText, responseText, responseData = {} }) {
    const userId = await getCurrentUserId();
    const sessionId = localStorage.getItem('current_session_id');

    const payload = {
        user_id: userId,
        session_id: sessionId || null,
        game_type: gameType,
        question_text: questionText,
        response_text: responseText,
        response_data: responseData,
    };

    // FALLBACK 1: Always save to localStorage first
    saveToLocalBackup('response', { ...payload, gameType, questionText, responseText, responseData });

    if (!userId) {
        console.error('[Tracking] No user ID - response saved locally only');
        addToRetryQueue('response', payload);
        return null;
    }

    // FALLBACK 2: Try to save to database with retry
    let lastError = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const { data, error } = await supabase
                .from('game_responses')
                .insert(payload)
                .select()
                .single();

            if (!error && data) {
                console.log(`[Tracking] ✅ Game response saved successfully (attempt ${attempt}):`, gameType);
                // Mark as synced in local backup
                markLocalItemSynced(LOCAL_RESPONSES_KEY, payload);
                return data;
            }

            lastError = error;
            console.warn(`[Tracking] Attempt ${attempt} failed:`, error?.message);

            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
            }
        } catch (err) {
            lastError = err;
            console.warn(`[Tracking] Attempt ${attempt} error:`, err.message);
            if (attempt < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
            }
        }
    }

    // FALLBACK 3: Add to retry queue for later
    console.error('[Tracking] All attempts failed, adding to retry queue');
    addToRetryQueue('response', payload);
    return null;
}

/**
 * Track visit events with fallbacks
 */
export async function trackEvent(eventType, featureName = null, metadata = {}) {
    const userId = await getCurrentUserId();
    const sessionId = localStorage.getItem('current_session_id');

    const payload = {
        user_id: userId,
        session_id: sessionId || null,
        event_type: eventType,
        feature_name: featureName,
        metadata,
    };

    // FALLBACK 1: Save to localStorage
    saveToLocalBackup('event', { ...payload, eventType, featureName });

    if (!userId) {
        console.error('[Tracking] No user ID - event saved locally only');
        addToRetryQueue('event', payload);
        return;
    }

    // FALLBACK 2: Try database with retry
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const { error } = await supabase.from('visit_events').insert(payload);
            if (!error) {
                console.log(`[Tracking] ✅ Event tracked: ${eventType} ${featureName || ''}`);
                return;
            }
            console.warn(`[Tracking] Event attempt ${attempt} failed:`, error.message);
        } catch (err) {
            console.warn(`[Tracking] Event error:`, err.message);
        }
    }

    // FALLBACK 3: Queue for later
    addToRetryQueue('event', payload);
}

/**
 * Mark a local item as synced
 */
function markLocalItemSynced(key, match) {
    try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = items.map(item => {
            if (item.question_text === match.question_text &&
                item.response_text === match.response_text &&
                !item.synced) {
                return { ...item, synced: true };
            }
            return item;
        });
        localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) { }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function trackFeatureOpen(featureName) {
    return trackEvent('feature_open', featureName);
}

export function trackFeatureClose(featureName) {
    return trackEvent('feature_close', featureName);
}

export function trackPageView() {
    return trackEvent('page_view', 'home');
}

/**
 * Update a game response (for editing)
 */
export async function updateGameResponse(responseId, { responseText, responseData }) {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    try {
        const { data: original } = await supabase
            .from('game_responses')
            .select('response_text, response_data, is_edited, original_response_text')
            .eq('id', responseId)
            .single();

        const updateObj = {
            response_text: responseText,
            is_edited: true,
            edited_at: new Date().toISOString(),
        };

        if (responseData !== undefined) {
            updateObj.response_data = responseData;
        }

        if (original && !original.is_edited) {
            updateObj.original_response_text = original.response_text;
            updateObj.original_response_data = original.response_data;
        }

        const { data, error } = await supabase
            .from('game_responses')
            .update(updateObj)
            .eq('id', responseId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating game response:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Failed to update game response:', err);
        return null;
    }
}

/**
 * Get game responses for a specific game type
 */
export async function getGameResponses(gameType) {
    const userId = await getCurrentUserId();
    if (!userId) {
        // Return from local backup if no user
        try {
            const local = JSON.parse(localStorage.getItem(LOCAL_RESPONSES_KEY) || '[]');
            return local
                .filter(r => r.game_type === gameType || r.gameType === gameType)
                .map(item => ({
                    id: item.id || `local-${Date.now()}`,
                    question: item.question_text || item.questionText,
                    answer: item.response_text || item.responseText,
                    responseData: item.response_data || item.responseData,
                    ...item
                }));
        } catch { return []; }
    }

    try {
        const { data, error } = await supabase
            .from('game_responses')
            .select('*')
            .eq('user_id', userId)
            .eq('game_type', gameType)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching game responses:', error);
            return [];
        }
        return data.map(item => ({
            id: item.id,
            question: item.question_text,
            answer: item.response_text,
            responseData: item.response_data,
            ...item
        }));
    } catch (err) {
        console.error('Failed to fetch game responses:', err);
        return [];
    }
}

/**
 * Save a dream date plan
 */
export async function saveDreamDate({ location, activity, food, time, comment }) {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    try {
        const { data, error } = await supabase
            .from('dream_dates')
            .insert({
                user_id: userId,
                location,
                activity,
                food,
                time,
                comment
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving dream date:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Failed to save dream date:', err);
        return null;
    }
}

/**
 * Get all locally stored responses (for admin recovery)
 */
export function getLocalBackup() {
    try {
        return {
            responses: JSON.parse(localStorage.getItem(LOCAL_RESPONSES_KEY) || '[]'),
            events: JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]'),
            failedQueue: JSON.parse(localStorage.getItem(FAILED_QUEUE_KEY) || '[]'),
        };
    } catch {
        return { responses: [], events: [], failedQueue: [] };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-SYNC: Process retry queue every 60 seconds
// ═══════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    setInterval(() => {
        processRetryQueue();
    }, 60000);

    // Also process on page load after a delay
    setTimeout(processRetryQueue, 5000);
}
