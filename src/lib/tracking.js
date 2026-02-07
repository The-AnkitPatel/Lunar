import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// BULLETPROOF TRACKING SYSTEM - MULTIPLE FALLBACK LAYERS
// Every response & event is saved locally FIRST, then pushed to DB.
// On every page load, ALL unsynced local items are force-pushed to DB.
// ═══════════════════════════════════════════════════════════════════════════

const FAILED_QUEUE_KEY = 'lunar_failed_tracking_queue';
const LOCAL_RESPONSES_KEY = 'lunar_local_responses';
const LOCAL_EVENTS_KEY = 'lunar_local_events';
const MAX_RETRIES = 5;
const RETRY_DELAY = 1500; // 1.5 seconds

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
        // Keep last 5000 items — never lose anything
        const trimmed = existing.slice(-5000);
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
        localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(queue.slice(-2000)));
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
                console.log('[Tracking] ✅ Successfully synced queued item!');
            } else {
                console.warn('[Tracking] ⚠️ Item exceeded max retries, dropping:', item);
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
// AGGRESSIVE SYNC: Push ALL unsynced localStorage items to database
// This runs on every page load to catch anything that failed before.
// Deduplicates by checking question_text + response_text + game_type
// Also scans EXTRA localStorage keys used by individual game components
// ═══════════════════════════════════════════════════════════════════════════

// Extra localStorage keys that game components use for local-only data
const EXTRA_LS_GAME_KEYS = [
    { key: 'spinHistory', gameType: 'spin_wheel', label: 'Spin Wheel History' },
    { key: 'couplesPlaylist', gameType: 'couples_playlist', label: 'Couples Playlist' },
    { key: 'fulfilledPromises', gameType: 'promise_jar', label: 'Promise Jar' },
    { key: 'readLetters', gameType: 'love_letter', label: 'Read Letters' },
    { key: 'redeemedCoupons', gameType: 'love_coupons', label: 'Redeemed Coupons' },
    { key: 'claimedPromises', gameType: 'promise_jar_claimed', label: 'Claimed Promises' },
    { key: 'completedBucketItems', gameType: 'bucket_list', label: 'Bucket List Items' },
];

let _syncRunning = false;

/**
 * Force-sync all unsynced local responses & events to the database.
 * Called automatically on every page load.
 */
export async function syncAllLocalData() {
    if (_syncRunning) return;
    _syncRunning = true;

    const userId = await getCurrentUserId();
    if (!userId) {
        console.warn('[Sync] No user ID, skipping sync');
        _syncRunning = false;
        return;
    }

    console.log('[Sync] ═══ Starting aggressive local→DB sync ═══');

    // ── 1. Sync unsynced RESPONSES ──
    try {
        const localResponses = JSON.parse(localStorage.getItem(LOCAL_RESPONSES_KEY) || '[]');
        const unsynced = localResponses.filter(r => !r.synced);
        console.log(`[Sync] Found ${unsynced.length} unsynced responses out of ${localResponses.length} total`);

        if (unsynced.length > 0) {
            // Fetch existing responses from DB to avoid duplicates
            const { data: existingDb } = await supabase
                .from('game_responses')
                .select('game_type, question_text, response_text, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5000);

            const existingSet = new Set(
                (existingDb || []).map(r =>
                    `${r.game_type}||${r.question_text}||${r.response_text}`
                )
            );

            let syncedCount = 0;
            for (const item of unsynced) {
                const gameType = item.game_type || item.gameType;
                const questionText = item.question_text || item.questionText;
                const responseText = item.response_text || item.responseText;
                const responseData = item.response_data || item.responseData || {};

                // Skip if already in DB
                const key = `${gameType}||${questionText}||${responseText}`;
                if (existingSet.has(key)) {
                    item.synced = true;
                    syncedCount++;
                    continue;
                }

                // Push to DB
                const payload = {
                    user_id: userId,
                    session_id: item.session_id || localStorage.getItem('current_session_id') || null,
                    game_type: gameType,
                    question_text: questionText,
                    response_text: responseText,
                    response_data: responseData,
                };

                try {
                    const { error } = await supabase
                        .from('game_responses')
                        .insert(payload);

                    if (!error) {
                        item.synced = true;
                        existingSet.add(key);
                        syncedCount++;
                        console.log(`[Sync] ✅ Pushed response: ${gameType} — "${(responseText || '').substring(0, 50)}"`);
                    } else {
                        console.warn('[Sync] Insert failed:', error.message);
                    }
                } catch (e) {
                    console.warn('[Sync] Error inserting response:', e.message);
                }
            }

            // Write back with updated synced flags
            localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(localResponses));
            console.log(`[Sync] Responses: ${syncedCount} synced out of ${unsynced.length} unsynced`);
        }
    } catch (e) {
        console.error('[Sync] Error syncing responses:', e);
    }

    // ── 2. Sync unsynced EVENTS ──
    try {
        const localEvents = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]');
        const unsyncedEvents = localEvents.filter(e => !e.synced);
        console.log(`[Sync] Found ${unsyncedEvents.length} unsynced events out of ${localEvents.length} total`);

        if (unsyncedEvents.length > 0) {
            let syncedCount = 0;
            for (const item of unsyncedEvents) {
                const payload = {
                    user_id: userId,
                    session_id: item.session_id || localStorage.getItem('current_session_id') || null,
                    event_type: item.event_type || item.eventType,
                    feature_name: item.feature_name || item.featureName || null,
                    metadata: item.metadata || {},
                };

                try {
                    const { error } = await supabase
                        .from('visit_events')
                        .insert(payload);

                    if (!error) {
                        item.synced = true;
                        syncedCount++;
                    }
                } catch (e) {
                    // Skip silently — events are less critical
                }
            }

            localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(localEvents));
            console.log(`[Sync] Events: ${syncedCount} synced out of ${unsyncedEvents.length} unsynced`);
        }
    } catch (e) {
        console.error('[Sync] Error syncing events:', e);
    }

    // ── 3. Sync EXTRA localStorage game data ──
    // These are local-only keys used by individual game components
    // We sync them as game_responses so they show in admin dashboard
    try {
        for (const { key: lsKey, gameType, label } of EXTRA_LS_GAME_KEYS) {
            const raw = localStorage.getItem(lsKey);
            if (!raw) continue;

            try {
                const data = JSON.parse(raw);
                if (!data || (Array.isArray(data) && data.length === 0)) continue;

                // Check if we already synced this specific key
                const syncFlagKey = `_synced_${lsKey}`;
                const lastSyncedHash = localStorage.getItem(syncFlagKey);
                const currentHash = JSON.stringify(data).length.toString();

                if (lastSyncedHash === currentHash) continue; // Already synced this version

                // Check if this data already exists in DB
                const { data: existing } = await supabase
                    .from('game_responses')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('game_type', gameType)
                    .eq('question_text', `[LOCAL] ${label}`)
                    .limit(1);

                const responseText = Array.isArray(data)
                    ? data.map(d => typeof d === 'object' ? JSON.stringify(d) : String(d)).join(', ')
                    : JSON.stringify(data);

                if (existing && existing.length > 0) {
                    // Update existing record with latest data
                    await supabase
                        .from('game_responses')
                        .update({
                            response_text: responseText.substring(0, 5000),
                            response_data: { localStorageKey: lsKey, rawData: data, updated_at: new Date().toISOString() },
                        })
                        .eq('id', existing[0].id);
                } else {
                    // Insert new record
                    await supabase
                        .from('game_responses')
                        .insert({
                            user_id: userId,
                            session_id: localStorage.getItem('current_session_id') || null,
                            game_type: gameType,
                            question_text: `[LOCAL] ${label}`,
                            response_text: responseText.substring(0, 5000),
                            response_data: { localStorageKey: lsKey, rawData: data, synced_at: new Date().toISOString() },
                        });
                }

                localStorage.setItem(syncFlagKey, currentHash);
                console.log(`[Sync] ✅ Synced extra LS key: ${lsKey}`);
            } catch (e) {
                console.warn(`[Sync] Error syncing ${lsKey}:`, e.message);
            }
        }
    } catch (e) {
        console.error('[Sync] Error syncing extra LS keys:', e);
    }

    // ── 4. Also process the retry queue ──
    await processRetryQueue();

    console.log('[Sync] ═══ Sync complete ═══');
    _syncRunning = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-SYNC: Aggressive — runs on load + every 30 seconds
// Realtime tracking is handled by Supabase WebSocket (ms-level instant)
// This sync only catches localStorage items that failed to save to DB
// ═══════════════════════════════════════════════════════════════════════════
if (typeof window !== 'undefined') {
    // Process retry queue every 20 seconds
    setInterval(() => {
        processRetryQueue();
    }, 20000);

    // Full sync on page load after short delay (catches morning's lost data)
    setTimeout(syncAllLocalData, 2000);

    // Second sync after 15s (in case auth wasn't ready on first try)
    setTimeout(syncAllLocalData, 15000);

    // Periodic full sync every 60 seconds
    setInterval(syncAllLocalData, 60000);
}
