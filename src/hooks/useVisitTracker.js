import { useEffect, useRef } from 'react';
import { updateSessionHeartbeat } from '../lib/auth';
import { trackPageView, trackEvent, syncAllLocalData } from '../lib/tracking';

export const useVisitTracker = () => {
    const pageOpenTime = useRef(Date.now());

    useEffect(() => {
        // Track initial page view
        trackPageView();
        pageOpenTime.current = Date.now();

        // ══ AGGRESSIVE SYNC: Push any unsynced localStorage data to DB ══
        // This catches her responses that were saved locally but never made it to DB
        syncAllLocalData().catch(err => {
            console.warn('[VisitTracker] Sync failed, will retry:', err);
        });

        // Heartbeat: update session every 30 seconds
        const heartbeatInterval = setInterval(() => {
            const sessionId = localStorage.getItem('current_session_id');
            if (sessionId) {
                updateSessionHeartbeat(sessionId);
            }
        }, 30000); // Update every 30 seconds for more accurate tracking

        // Initial heartbeat
        const sessionId = localStorage.getItem('current_session_id');
        if (sessionId) {
            updateSessionHeartbeat(sessionId);
        }

        // Track visibility changes (tab switch, minimize, etc.)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const timeSpent = Math.round((Date.now() - pageOpenTime.current) / 1000);
                trackEvent('tab_hidden', null, { seconds_active: timeSpent });
            } else {
                pageOpenTime.current = Date.now();
                trackEvent('tab_visible');
                // Also do a heartbeat when they come back
                const sid = localStorage.getItem('current_session_id');
                if (sid) updateSessionHeartbeat(sid);
            }
        };

        // Track when user leaves the page
        const handleBeforeUnload = () => {
            const timeSpent = Math.round((Date.now() - pageOpenTime.current) / 1000);
            // Use sendBeacon for reliable delivery on page close
            const sessionId = localStorage.getItem('current_session_id');
            if (sessionId) {
                updateSessionHeartbeat(sessionId);
            }
            trackEvent('page_close', null, { seconds_active: timeSpent });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(heartbeatInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
};
