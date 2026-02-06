import { supabase } from './supabase';

/**
 * Save a game response to the database
 */
export async function saveGameResponse({ gameType, questionText, responseText, responseData = {} }) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const sessionId = localStorage.getItem('current_session_id');

        const { data, error } = await supabase
            .from('game_responses')
            .insert({
                user_id: user.id,
                session_id: sessionId || null,
                game_type: gameType,
                question_text: questionText,
                response_text: responseText,
                response_data: responseData,
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving game response:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Failed to save game response:', err);
        return null;
    }
}

/**
 * Update a game response (for editing). Stores original before overwriting.
 */
export async function updateGameResponse(responseId, { responseText, responseData }) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // First fetch original to preserve it
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

        // Only save original on first edit
        if (original && !original.is_edited) {
            updateObj.original_response_text = original.response_text;
            updateObj.original_response_data = original.response_data;
        }

        const { data, error } = await supabase
            .from('game_responses')
            .update(updateObj)
            .eq('id', responseId)
            .eq('user_id', user.id)
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
 * Track a visit event (page view, feature open/close)
 */
export async function trackEvent(eventType, featureName = null, metadata = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const sessionId = localStorage.getItem('current_session_id');

        await supabase
            .from('visit_events')
            .insert({
                user_id: user.id,
                session_id: sessionId || null,
                event_type: eventType,
                feature_name: featureName,
                metadata,
            });
    } catch (err) {
        console.error('Failed to track event:', err);
    }
}

/**
 * Track when a feature/game is opened
 */
export function trackFeatureOpen(featureName) {
    return trackEvent('feature_open', featureName);
}

/**
 * Track when a feature/game is closed
 */
export function trackFeatureClose(featureName) {
    return trackEvent('feature_close', featureName);
}

/**
 * Track a page view
 */
export function trackPageView() {
    return trackEvent('page_view', 'home');
}
