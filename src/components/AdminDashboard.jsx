import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'live', label: 'Live', icon: '🔴' },
    { id: 'visits', label: 'Visits', icon: '👀' },
    { id: 'responses', label: 'Messages', icon: '💌' },
    { id: 'devices', label: 'Devices', icon: '📱' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
];

// Admin user ID — used to EXCLUDE admin from GF activity feeds
const ADMIN_USER_ID = '9b9ebf95-6e32-455e-977a-ec907a89b19d';

const GAME_LABELS = {
    truth_or_love: '🔥 Truth or Love',
    would_you_rather: '💭 Would You Rather',
    complete_sentence: '✍️ Complete Sentence',
    love_quiz: '🧠 Love Quiz',
    proposal: '💍 Proposal',
    dream_date: '🌹 Dream Date',
    dream_date_comment: '🌹 Dream Date Comment',
    spin_wheel: '🎡 Spin Wheel',
    promise_jar: '🤞 Promise Jar',
    love_coupons: '🎟️ Love Coupons',
    scratch_card: '🎴 Scratch Card',
    love_letter: '💌 Love Letter',
    memory_game: '🧩 Memory Game',
    secret_garden: '🌿 Secret Garden',
    love_map: '🗺️ Love Map',
    love_language_test: '💕 Love Language',
    couples_playlist: '🎵 Couples Playlist',
    review_edit: '✏️ Review Edit',
};

// Helper: returns true if this row belongs to the admin
function isAdminRow(row) {
    if (row.profiles?.role === 'admin') return true;
    if (row.user_id === ADMIN_USER_ID) return true;
    return false;
}

export default function AdminDashboard({ onClose }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [sessions, setSessions] = useState([]);
    const [gameResponses, setGameResponses] = useState([]);
    const [visitEvents, setVisitEvents] = useState([]);
    const [deviceLogs, setDeviceLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [responseFilter, setResponseFilter] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [liveNotifications, setLiveNotifications] = useState([]);
    const [liveActivity, setLiveActivity] = useState([]); // Real-time activity feed
    const notifIdRef = useRef(0);

    // Add a live notification (auto-dismiss after 10s)
    const addLiveNotification = useCallback((type, message, details = {}) => {
        const id = ++notifIdRef.current;
        const notif = { id, type, message, details, timestamp: new Date().toISOString() };
        setLiveNotifications(prev => [notif, ...prev].slice(0, 20));
        setLiveActivity(prev => [notif, ...prev].slice(0, 100));
        // Auto-dismiss toast after 10s
        setTimeout(() => {
            setLiveNotifications(prev => prev.filter(n => n.id !== id));
        }, 10000);
    }, []);

    const fetchAllData = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const [sessionsRes, responsesRes, eventsRes, devicesRes] = await Promise.all([
                supabase
                    .from('auth_sessions')
                    .select(`*, device_logs(*), profiles:user_id(display_name, role)`)
                    .order('login_at', { ascending: false })
                    .limit(10000),
                supabase
                    .from('game_responses')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('created_at', { ascending: false })
                    .limit(10000),
                supabase
                    .from('visit_events')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('created_at', { ascending: false })
                    .limit(10000),
                supabase
                    .from('device_logs')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('logged_in_at', { ascending: false })
                    .limit(10000),
            ]);

            if (sessionsRes.data) setSessions(sessionsRes.data);
            if (responsesRes.data) setGameResponses(responsesRes.data);
            if (eventsRes.data) setVisitEvents(eventsRes.data);
            if (devicesRes.data) setDeviceLogs(devicesRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // NO POLLING — Realtime subscriptions handle instant updates via WebSocket.
    // Manual refresh button available for on-demand data reload.
    // Realtime is ms-level instant (WebSocket push, not polling).

    // ── Comprehensive Real-time subscriptions ──
    // Listen to ALL tracking tables for instant updates
    useEffect(() => {
        const channel = supabase
            .channel('admin-realtime-all')
            // ── DEVICE LOGS: New device login detected ──
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'device_logs' }, (payload) => {
                const log = payload.new;
                // Skip admin's own device logs
                if (log.user_id === ADMIN_USER_ID) return;
                setDeviceLogs(prev => [log, ...prev]);
                addLiveNotification(
                    'login',
                    `📱 New device logged in!`,
                    {
                        device: log.device_type || 'unknown',
                        browser: log.browser || 'unknown',
                        os: log.os || 'unknown',
                        ip: log.ip_address || 'unknown',
                        fingerprint: log.fingerprint,
                        screen: log.screen_resolution,
                    }
                );
            })
            // ── AUTH SESSIONS: New session created or updated ──
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'auth_sessions' }, (payload) => {
                const sess = payload.new;
                if (sess.user_id === ADMIN_USER_ID) { setSessions(prev => [sess, ...prev]); return; }
                setSessions(prev => [sess, ...prev]);
                addLiveNotification(
                    'session',
                    `🟢 She just opened the site! New session started!`,
                    { sessionId: sess.id, userId: sess.user_id }
                );
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auth_sessions' }, (payload) => {
                const sess = payload.new;
                setSessions(prev => prev.map(s => s.id === sess.id ? { ...s, ...sess } : s));
                // Skip admin sessions for notifications
                if (sess.user_id === ADMIN_USER_ID) return;
                // If session became inactive (logout)
                if (sess.is_active === false && payload.old?.is_active === true) {
                    addLiveNotification(
                        'logout',
                        `🔴 She left the site! Session ended`,
                        { sessionId: sess.id }
                    );
                }
            })
            // ── GAME RESPONSES: New or updated game answers ──
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_responses' }, (payload) => {
                const resp = payload.new;
                setGameResponses(prev => [resp, ...prev]);
                // Skip notifications for admin's own responses
                if (resp.user_id === ADMIN_USER_ID) return;
                addLiveNotification(
                    'game_response',
                    `💌 She responded in ${GAME_LABELS[resp.game_type] || resp.game_type}!`,
                    {
                        gameType: resp.game_type,
                        question: resp.question_text,
                        answer: resp.response_text,
                    }
                );
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_responses' }, (payload) => {
                setGameResponses(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
                if (payload.new.user_id === ADMIN_USER_ID) return;
                if (payload.new.is_edited) {
                    addLiveNotification(
                        'game_edit',
                        `✏️ She edited her answer in ${GAME_LABELS[payload.new.game_type] || payload.new.game_type}`,
                        { answer: payload.new.response_text }
                    );
                }
            })
            // ── VISIT EVENTS: Page views, feature opens/closes ──
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visit_events' }, (payload) => {
                const event = payload.new;
                setVisitEvents(prev => [event, ...prev]);
                // Skip admin's own events (we only want GF notifications)
                if (event.user_id === ADMIN_USER_ID) return;
                // Notify for ALL her events
                if (event.event_type === 'page_view') {
                    addLiveNotification('page_view', `🏠 She opened the site!`, {});
                } else if (event.event_type === 'feature_open') {
                    addLiveNotification('feature_open', `▶️ She opened: ${event.feature_name}`, { feature: event.feature_name });
                } else if (event.event_type === 'feature_close') {
                    addLiveNotification('feature_close', `⏹️ She closed: ${event.feature_name}`, { feature: event.feature_name });
                } else if (event.event_type === 'page_close') {
                    addLiveNotification('page_close', `🚪 She left the site!`, {});
                } else if (event.event_type === 'tab_hidden') {
                    addLiveNotification('tab_hidden', `👻 She switched away from tab`, {});
                } else if (event.event_type === 'tab_visible') {
                    addLiveNotification('tab_visible', `👁️ She came back to the tab!`, {});
                } else if (event.event_type === 'locked_day_tap') {
                    addLiveNotification('locked_day_tap', `🔒 She tried to open a locked day: ${event.feature_name}`, { feature: event.feature_name });
                } else {
                    // Catch-all for any new event types
                    addLiveNotification(event.event_type, `📡 ${event.event_type}: ${event.feature_name || ''}`, { feature: event.feature_name });
                }
            })
            .subscribe((status) => {
                console.log('Admin realtime subscription status:', status);
            });

        return () => { supabase.removeChannel(channel); };
    }, [addLiveNotification]);

    // ── Derived Stats ──
    // STRATEGY: Exclude admin rows → everything else is GF activity
    // This catches ALL her activity even when profiles join is missing (realtime)
    const gfSessions = sessions.filter(s => !isAdminRow(s));
    const gfResponses = gameResponses.filter(r => !isAdminRow(r));
    const gfEvents = visitEvents.filter(e => !isAdminRow(e));

    // Debug logging
    console.log('[AdminDashboard] Total gameResponses:', gameResponses.length, '| GF:', gfResponses.length);
    console.log('[AdminDashboard] Total visitEvents:', visitEvents.length, '| GF:', gfEvents.length);
    console.log('[AdminDashboard] Total sessions:', sessions.length, '| GF:', gfSessions.length);
    if (gameResponses.length > 0) console.log('[AdminDashboard] Sample response:', gameResponses[0]);
    if (gfResponses.length > 0) console.log('[AdminDashboard] Sample GF response:', gfResponses[0]);

    const lastSeen = gfSessions.length > 0
        ? formatDate(gfSessions[0].last_active_at || gfSessions[0].login_at)
        : 'Never';

    const isOnlineNow = gfSessions.some(s => {
        if (!s.is_active) return false;
        const lastActive = new Date(s.last_active_at || s.login_at);
        return (Date.now() - lastActive.getTime()) < 120000; // active within 2 min
    });

    const uniqueDevices = new Set(gfSessions.map(s => s.device_logs?.fingerprint).filter(Boolean)).size;

    const totalTimeMs = gfSessions.reduce((sum, s) => {
        const end = s.last_active_at || s.logout_at;
        if (s.login_at && end) sum += new Date(end) - new Date(s.login_at);
        return sum;
    }, 0);

    const todayVisits = gfSessions.filter(s => {
        const d = new Date(s.login_at);
        const now = new Date();
        return d.toDateString() === now.toDateString();
    }).length;

    const gameTypeCounts = {};
    gfResponses.forEach(r => {
        gameTypeCounts[r.game_type] = (gameTypeCounts[r.game_type] || 0) + 1;
    });

    const featureUsage = {};
    visitEvents.filter(e => e.event_type === 'feature_open').forEach(e => {
        featureUsage[e.feature_name] = (featureUsage[e.feature_name] || 0) + 1;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 bg-slate-950 overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-2">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-rose-400">💕 Love Monitor</h2>
                        {isOnlineNow && (
                            <span className="flex items-center gap-1.5 text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full border border-green-500/30 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                Online Now
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`text-xs px-2 py-1 rounded-lg transition-colors ${autoRefresh ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/40'}`}
                            title="Realtime is always active via WebSocket"
                        >
                            {autoRefresh ? '📡 Realtime' : '📡 Realtime'}
                        </button>
                        <button
                            onClick={() => fetchAllData(true)}
                            disabled={refreshing}
                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {refreshing ? '...' : '↻ Refresh'}
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="text-white/40 text-sm">Loading dashboard data...</div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4 mt-3"
                        >
                            {activeTab === 'overview' && (
                                <OverviewTab
                                    gfSessions={gfSessions}
                                    gfResponses={gfResponses}
                                    lastSeen={lastSeen}
                                    isOnlineNow={isOnlineNow}
                                    uniqueDevices={uniqueDevices}
                                    totalTimeMs={totalTimeMs}
                                    todayVisits={todayVisits}
                                    gameTypeCounts={gameTypeCounts}
                                    featureUsage={featureUsage}
                                    visitEvents={visitEvents}
                                />
                            )}
                            {activeTab === 'live' && (
                                <LiveTab
                                    liveActivity={liveActivity}
                                    liveNotifications={liveNotifications}
                                    isOnlineNow={isOnlineNow}
                                    visitEvents={visitEvents}
                                    deviceLogs={deviceLogs}
                                    sessions={sessions}
                                />
                            )}
                            {activeTab === 'visits' && (
                                <VisitsTab sessions={gfSessions} />
                            )}
                            {activeTab === 'responses' && (
                                <ResponsesTab
                                    responses={gfResponses}
                                    filter={responseFilter}
                                    setFilter={setResponseFilter}
                                    selectedResponse={selectedResponse}
                                    setSelectedResponse={setSelectedResponse}
                                />
                            )}
                            {activeTab === 'devices' && (
                                <DevicesTab deviceLogs={deviceLogs} />
                            )}
                            {activeTab === 'activity' && (
                                <ActivityTab events={visitEvents} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* ── Floating Live Notification Toasts ── */}
            <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
                <AnimatePresence>
                    {liveNotifications.slice(0, 5).map((notif) => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-2xl border backdrop-blur-md ${getNotifStyle(notif.type)}`}
                        >
                            <div className="flex items-start gap-2">
                                <span className="text-base flex-shrink-0">{getNotifIcon(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{notif.message}</p>
                                    {notif.details?.device && (
                                        <p className="text-[10px] text-white/50 mt-0.5">
                                            {notif.details.device} • {notif.details.browser} • {notif.details.os}
                                            {notif.details.ip !== 'unknown' && ` • IP: ${notif.details.ip}`}
                                        </p>
                                    )}
                                    {notif.details?.answer && (
                                        <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1">
                                            "{notif.details.answer}"
                                        </p>
                                    )}
                                    <p className="text-[9px] text-white/30 mt-1">
                                        {new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setLiveNotifications(prev => prev.filter(n => n.id !== notif.id))}
                                    className="text-white/30 hover:text-white/60 text-xs flex-shrink-0"
                                >
                                    ×
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════
// LIVE TAB — Real-time Activity Feed
// ═══════════════════════════════════════
function LiveTab({ liveActivity, liveNotifications, isOnlineNow, visitEvents, deviceLogs, sessions }) {
    // Determine what she's currently doing based on recent visit events
    const recentFeatureEvents = visitEvents
        .filter(e => e.event_type === 'feature_open' || e.event_type === 'feature_close')
        .slice(0, 20);

    // Find the currently open feature (last feature_open without a matching feature_close after it)
    let currentlyViewing = null;
    const openFeatures = new Set();
    for (const event of recentFeatureEvents) {
        if (event.event_type === 'feature_open') {
            openFeatures.add(event.feature_name);
            break; // Most recent open is what they're viewing
        } else if (event.event_type === 'feature_close') {
            openFeatures.delete(event.feature_name);
        }
    }
    if (openFeatures.size > 0) {
        currentlyViewing = [...openFeatures][0];
    }

    // Is she on the tab right now?
    const lastTabEvent = visitEvents.find(e => e.event_type === 'tab_hidden' || e.event_type === 'tab_visible' || e.event_type === 'page_close');
    const isTabActive = lastTabEvent?.event_type === 'tab_visible' || lastTabEvent?.event_type === 'page_view';

    // Latest device used
    const latestDevice = deviceLogs[0];

    // Latest session
    const latestSession = sessions.find(s => s.is_active);

    return (
        <div className="space-y-4">
            {/* Live Status */}
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${isOnlineNow
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/20'
                }`}>
                <div className="relative">
                    <span className="text-3xl">{isOnlineNow ? '💚' : '💤'}</span>
                    {isOnlineNow && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                    )}
                </div>
                <div>
                    <p className={`font-medium text-sm ${isOnlineNow ? 'text-green-300' : 'text-red-300'}`}>
                        {isOnlineNow ? "She's LIVE on the site!" : 'Currently offline'}
                    </p>
                    <p className={`text-xs ${isOnlineNow ? 'text-green-300/60' : 'text-red-300/40'}`}>
                        {isOnlineNow
                            ? (currentlyViewing ? `Currently viewing: ${currentlyViewing}` : (isTabActive ? 'Browsing the site' : 'Tab may be in background'))
                            : 'Waiting for her to visit...'
                        }
                    </p>
                </div>
            </div>

            {/* Currently Doing */}
            {isOnlineNow && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white/80 text-xs uppercase tracking-wider mb-3 font-medium">🎯 Current Activity</h3>
                    <div className="space-y-2">
                        {currentlyViewing && (
                            <div className="flex items-center gap-2 p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                <span className="text-sm">▶️</span>
                                <span className="text-rose-300 text-sm font-medium">Viewing: {currentlyViewing}</span>
                            </div>
                        )}
                        {isTabActive !== undefined && (
                            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                <span className="text-sm">{isTabActive ? '👁️' : '👻'}</span>
                                <span className="text-white/60 text-sm">
                                    Tab is {isTabActive ? 'active (focused)' : 'in background'}
                                </span>
                            </div>
                        )}
                        {latestDevice && (
                            <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                <span className="text-sm">{latestDevice.device_type === 'mobile' ? '📱' : '💻'}</span>
                                <span className="text-white/60 text-sm">
                                    Using: {latestDevice.browser} on {latestDevice.os}
                                    {latestDevice.ip_address && latestDevice.ip_address !== 'unavailable' && ` (IP: ${latestDevice.ip_address})`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Live Feed */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white/80 text-xs uppercase tracking-wider font-medium">📡 Live Feed</h3>
                    <span className="flex items-center gap-1.5 text-[10px] text-green-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Listening
                    </span>
                </div>
                {liveActivity.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-3xl block mb-2">📡</span>
                        <p className="text-white/30 text-xs">Waiting for activity...</p>
                        <p className="text-white/20 text-[10px] mt-1">Events will appear here in real-time when she uses the site</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {liveActivity.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${getLiveEventStyle(event.type)}`}
                            >
                                <span className="text-sm flex-shrink-0 mt-0.5">{getNotifIcon(event.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/80 text-xs font-medium">{event.message}</p>
                                    {event.details?.device && (
                                        <p className="text-white/40 text-[10px] mt-0.5">
                                            {event.details.device} • {event.details.browser} • {event.details.os}
                                            {event.details.screen && ` • ${event.details.screen}`}
                                        </p>
                                    )}
                                    {event.details?.answer && (
                                        <p className="text-white/40 text-[10px] mt-0.5 italic line-clamp-2">"{event.details.answer}"</p>
                                    )}
                                    {event.details?.question && (
                                        <p className="text-white/30 text-[10px] mt-0.5">Q: {event.details.question}</p>
                                    )}
                                </div>
                                <span className="text-white/20 text-[10px] flex-shrink-0">
                                    {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════
function OverviewTab({ gfSessions, gfResponses, lastSeen, isOnlineNow, uniqueDevices, totalTimeMs, todayVisits, gameTypeCounts, featureUsage, visitEvents }) {
    const hours = Math.floor(totalTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalTimeMs % (1000 * 60 * 60)) / (1000 * 60));

    // Recent activity timeline — exclude admin
    const recentActivity = visitEvents
        .filter(e => !isAdminRow(e))
        .slice(0, 15);

    return (
        <div className="space-y-4">
            {/* Status Banner */}
            {isOnlineNow && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center gap-3">
                    <span className="text-2xl">💚</span>
                    <div>
                        <p className="text-green-300 font-medium text-sm">She's on the site right now!</p>
                        <p className="text-green-300/60 text-xs">Browsing your love site at this moment ✨</p>
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard label="Total Visits" value={gfSessions.length} icon="👀" />
                <StatCard label="Last Seen" value={lastSeen} icon="🕒" small />
                <StatCard label="Today's Visits" value={todayVisits} icon="📅" />
                <StatCard label="Total Time" value={`${hours}h ${minutes}m`} icon="⏳" />
                <StatCard label="Unique Devices" value={uniqueDevices} icon="📱" />
                <StatCard label="Total Messages" value={gfResponses.length} icon="💌" />
            </div>

            {/* Game Response Summary */}
            {Object.keys(gameTypeCounts).length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white/80 text-xs uppercase tracking-wider mb-3 font-medium">Game Responses</h3>
                    <div className="space-y-2">
                        {Object.entries(gameTypeCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <span className="text-white/60 text-sm">{GAME_LABELS[type] || type}</span>
                                    <span className="text-rose-300 font-mono text-sm font-medium">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Feature Usage */}
            {Object.keys(featureUsage).length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white/80 text-xs uppercase tracking-wider mb-3 font-medium">Most Visited Features</h3>
                    <div className="space-y-2">
                        {Object.entries(featureUsage)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 8)
                            .map(([name, count]) => (
                                <div key={name} className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full"
                                            style={{ width: `${Math.min((count / Math.max(...Object.values(featureUsage))) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-white/50 text-xs w-20 text-right">{name}</span>
                                    <span className="text-white/70 text-xs font-mono w-6 text-right">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Recent Activity Timeline */}
            {recentActivity.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-white/80 text-xs uppercase tracking-wider mb-3 font-medium">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentActivity.map((event, i) => (
                            <div key={event.id || i} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/70 text-xs">
                                        {formatEventLabel(event.event_type, event.feature_name)}
                                    </p>
                                    <p className="text-white/30 text-[10px]">{formatDate(event.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// VISITS TAB — Date-wise Grouped View
// ═══════════════════════════════════════
function VisitsTab({ sessions }) {
    if (sessions.length === 0) {
        return <EmptyState icon="👀" message="No visits yet. She hasn't opened the site." />;
    }

    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
        const dateKey = new Date(session.login_at).toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
        if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
        sessionsByDate[dateKey].push(session);
    });

    return (
        <div className="space-y-4">
            {Object.entries(sessionsByDate).map(([date, daySessions]) => {
                // Calculate total time for the day
                const dayTotalMs = daySessions.reduce((sum, s) => {
                    const end = s.last_active_at || s.logout_at;
                    if (s.login_at && end) sum += new Date(end) - new Date(s.login_at);
                    return sum;
                }, 0);
                const dayHours = Math.floor(dayTotalMs / (1000 * 60 * 60));
                const dayMinutes = Math.floor((dayTotalMs % (1000 * 60 * 60)) / 60000);
                const daySeconds = Math.floor((dayTotalMs % 60000) / 1000);

                return (
                    <div key={date} className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
                        {/* Date Header */}
                        <div className="px-4 py-3 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-base">📅</span>
                                <span className="text-white font-semibold text-sm">{date}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-white/40 text-[10px] uppercase tracking-wider">
                                    {daySessions.length} visit{daySessions.length > 1 ? 's' : ''}
                                </span>
                                <span className="text-rose-300 font-mono text-xs font-medium">
                                    {dayHours > 0 ? `${dayHours}h ` : ''}{dayMinutes}m {daySeconds}s total
                                </span>
                            </div>
                        </div>

                        {/* Individual Visits */}
                        <div className="divide-y divide-white/5">
                            {daySessions.map((session, idx) => {
                                const loginTime = new Date(session.login_at).toLocaleTimeString('en-IN', {
                                    hour: '2-digit', minute: '2-digit', hour12: true
                                });
                                const endTime = session.last_active_at || session.logout_at;
                                const endTimeStr = endTime
                                    ? new Date(endTime).toLocaleTimeString('en-IN', {
                                        hour: '2-digit', minute: '2-digit', hour12: true
                                    })
                                    : 'still active';

                                const durationMs = endTime ? new Date(endTime) - new Date(session.login_at) : 0;
                                const durMin = Math.floor(durationMs / 60000);
                                const durSec = Math.floor((durationMs % 60000) / 1000);
                                const durHr = Math.floor(durMin / 60);
                                const durMinRem = durMin % 60;

                                let durationStr;
                                if (!endTime) durationStr = '⏳ Active now';
                                else if (durHr > 0) durationStr = `${durHr}h ${durMinRem}m`;
                                else if (durMin > 0) durationStr = `${durMin}m ${durSec}s`;
                                else durationStr = `${durSec}s`;

                                return (
                                    <div key={session.id} className="px-4 py-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs">{session.is_active ? '🟢' : '⚪'}</span>
                                                <span className="text-white/70 text-xs font-medium">
                                                    Visit #{daySessions.length - idx}
                                                </span>
                                            </div>
                                            <span className={`font-mono text-xs font-medium ${session.is_active ? 'text-green-400' : 'text-rose-300'
                                                }`}>
                                                {durationStr}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1">
                                                <span className="text-white/40 text-[10px]">IN</span>
                                                <span className="text-white/70 font-mono text-xs">{loginTime}</span>
                                            </div>
                                            <span className="text-white/20">→</span>
                                            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1">
                                                <span className="text-white/40 text-[10px]">OUT</span>
                                                <span className={`font-mono text-xs ${session.is_active ? 'text-green-400' : 'text-white/70'
                                                    }`}>{endTimeStr}</span>
                                            </div>
                                        </div>

                                        {/* Device info row */}
                                        {session.device_logs && (
                                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-white/30">
                                                <span>{session.device_logs.device_type === 'mobile' ? '📱' : '💻'} {session.device_logs.os} • {session.device_logs.browser}</span>
                                                <span>IP: <span className="font-mono">{session.device_logs.ip_address}</span></span>
                                                {session.device_logs.fingerprint && (
                                                    <span>FP: <span className="font-mono">{session.device_logs.fingerprint.substring(0, 10)}..</span></span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ═══════════════════════════════════════
// RESPONSES TAB (Game Messages)
// ═══════════════════════════════════════
function ResponsesTab({ responses, filter, setFilter, selectedResponse, setSelectedResponse }) {
    const gameTypes = [...new Set(responses.map(r => r.game_type))];
    const filtered = filter === 'all' ? responses : responses.filter(r => r.game_type === filter);

    // Group by date
    const groupedByDate = {};
    filtered.forEach(resp => {
        const date = new Date(resp.created_at).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        if (!groupedByDate[date]) groupedByDate[date] = [];
        groupedByDate[date].push(resp);
    });
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(groupedByDate[b][0].created_at) - new Date(groupedByDate[a][0].created_at));

    return (
        <div className="space-y-3">
            {/* Filter Bar */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
                {gameTypes.map(type => (
                    <FilterChip
                        key={type}
                        active={filter === type}
                        onClick={() => setFilter(type)}
                        label={GAME_LABELS[type] || type}
                    />
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="💌" message="No game messages yet. She hasn't played any games." />
            ) : (
                <div className="space-y-4">
                    {sortedDates.map(date => (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-white/60 text-xs font-medium">{date}</span>
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-white/30 text-[10px]">{groupedByDate[date].length} responses</span>
                            </div>
                            <div className="space-y-2">
                                {groupedByDate[date].map((resp) => (
                                    <motion.div
                                        key={resp.id}
                                        layout
                                        className="bg-white/5 rounded-xl p-4 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-colors"
                                        onClick={() => setSelectedResponse(selectedResponse?.id === resp.id ? null : resp)}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-rose-300/80 font-medium">
                                                    {GAME_LABELS[resp.game_type] || resp.game_type}
                                                </span>
                                                {resp.is_edited && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                                        edited
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-white/30 text-[10px]">
                                                {new Date(resp.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {resp.question_text && (
                                            <p className="text-white/40 text-xs italic mb-1 line-clamp-1">
                                                Q: {resp.question_text}
                                            </p>
                                        )}

                                        <p className={`text-white text-sm leading-relaxed ${selectedResponse?.id === resp.id ? '' : 'line-clamp-2'}`}>
                                            {resp.response_text
                                                ? (<>&#8220;{resp.response_text}&#8221;</>)
                                                : '(No text response)'}
                                        </p>

                                        {/* Show response_data summary for richer context */}
                                        {resp.response_data && Object.keys(resp.response_data).length > 0 && selectedResponse?.id !== resp.id && (
                                            <p className="text-white/25 text-[10px] mt-1 line-clamp-1">
                                                data: {Object.entries(resp.response_data).map(([k,v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(', ')}
                                            </p>
                                        )}

                                        {/* Expanded details */}
                                        <AnimatePresence>
                                            {selectedResponse?.id === resp.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-3 pt-3 border-t border-white/10 space-y-3"
                                                >
                                                    {/* Original response if edited */}
                                                    {resp.is_edited && resp.original_response_text && (
                                                        <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10">
                                                            <p className="text-amber-300/60 text-[10px] uppercase tracking-wider mb-1">Original Answer</p>
                                                            <p className="text-white/50 text-xs italic">{resp.original_response_text}</p>
                                                            {resp.edited_at && (
                                                                <p className="text-white/20 text-[10px] mt-1">Edited {formatDate(resp.edited_at)}</p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {resp.response_data && Object.keys(resp.response_data).length > 0 && (
                                                        <div>
                                                            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Response Data</p>
                                                            <pre className="text-white/50 text-[11px] bg-black/30 rounded-lg p-3 overflow-x-auto font-mono">
                                                                {JSON.stringify(resp.response_data, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════
// DEVICES TAB
// ═══════════════════════════════════════
function DevicesTab({ deviceLogs }) {
    if (deviceLogs.length === 0) {
        return <EmptyState icon="📱" message="No device logs recorded yet." />;
    }

    return (
        <div className="space-y-3">
            {deviceLogs.map((log) => (
                <div key={log.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">
                                {log.device_type === 'mobile' ? '📱' : log.device_type === 'tablet' ? '📟' : '💻'}
                            </span>
                            <div>
                                <p className="text-white text-sm font-medium">{log.profiles?.display_name || 'Unknown'}</p>
                                <p className="text-white/30 text-[10px]">{formatDate(log.logged_in_at)}</p>
                            </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${log.device_type === 'mobile'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                            }`}>
                            {log.device_type}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                        <DeviceInfoRow label="Browser" value={`${log.browser} ${log.browser_version}`} />
                        <DeviceInfoRow label="OS" value={log.os} />
                        <DeviceInfoRow label="IP" value={log.ip_address} mono />
                        <DeviceInfoRow label="Screen" value={log.screen_resolution} />
                        <DeviceInfoRow label="Timezone" value={log.timezone} />
                        <DeviceInfoRow label="Language" value={log.language} />
                        <DeviceInfoRow label="Connection" value={log.connection_type} />
                        <DeviceInfoRow label="Touch" value={log.is_touch_device ? 'Yes' : 'No'} />
                        <DeviceInfoRow label="Memory" value={log.device_memory ? `${log.device_memory}GB` : '-'} />
                        <DeviceInfoRow label="CPU Cores" value={log.hardware_concurrency || '-'} />
                        <DeviceInfoRow label="GPU" value={log.webgl_renderer?.substring(0, 30)} />
                        <DeviceInfoRow label="Referrer" value={log.referrer || 'direct'} />
                    </div>

                    {log.fingerprint && (
                        <div className="mt-3 pt-2 border-t border-white/5">
                            <p className="text-white/30 text-[10px]">Fingerprint</p>
                            <p className="text-white/50 font-mono text-[10px] break-all">{log.fingerprint}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════
// ACTIVITY TAB
// ═══════════════════════════════════════
function ActivityTab({ events }) {
    const gfEvents = events.filter(e => !isAdminRow(e));

    if (gfEvents.length === 0) {
        return <EmptyState icon="⚡" message="No activity events tracked yet." />;
    }

    // Group events by day
    const eventsByDay = {};
    gfEvents.forEach(event => {
        const day = new Date(event.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(event);
    });

    return (
        <div className="space-y-4">
            {Object.entries(eventsByDay).map(([day, dayEvents]) => (
                <div key={day}>
                    <p className="text-white/40 text-xs font-medium mb-2 sticky top-0 bg-slate-950 py-1">{day}</p>
                    <div className="space-y-1">
                        {dayEvents.map((event, i) => (
                            <div key={event.id || i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                                <span className="text-xs">{getEventIcon(event.event_type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white/70 text-xs truncate">
                                        {formatEventLabel(event.event_type, event.feature_name)}
                                    </p>
                                </div>
                                <span className="text-white/30 text-[10px] flex-shrink-0">
                                    {new Date(event.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════
function StatCard({ label, value, icon, small }) {
    return (
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`font-bold text-white mb-1 ${small ? 'text-sm' : 'text-2xl'}`}>{value}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
        </div>
    );
}

function FilterChip({ active, onClick, label }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${active
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/10'
                }`}
        >
            {label}
        </button>
    );
}

function EmptyState({ icon, message }) {
    return (
        <div className="text-center py-16">
            <span className="text-4xl block mb-3">{icon}</span>
            <p className="text-white/40 text-sm">{message}</p>
        </div>
    );
}

function DeviceInfoRow({ label, value, mono }) {
    return (
        <div className="overflow-hidden">
            <span className="text-white/30">{label}: </span>
            <span className={`text-white/60 ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
        </div>
    );
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function _formatDuration(start, end) {
    if (!start || !end) return 'Active';
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function formatEventLabel(type, feature) {
    switch (type) {
        case 'page_view': return '🏠 Opened the site';
        case 'feature_open': return `▶️ Opened ${feature || 'a feature'}`;
        case 'feature_close': return `⏹️ Closed ${feature || 'a feature'}`;
        case 'tab_hidden': return '👻 Switched away from tab';
        case 'tab_visible': return '👁️ Came back to the tab';
        case 'page_close': return '🚪 Left the site';
        case 'locked_day_tap': return `🔒 Tried locked day: ${feature || 'unknown'}`;
        case 'scroll': return '📜 Scrolled the page';
        case 'heartbeat': return '💓 Still on the site';
        default: return `📡 ${type}${feature ? ': ' + feature : ''}`;
    }
}

function getEventIcon(type) {
    switch (type) {
        case 'page_view': return '🏠';
        case 'feature_open': return '▶️';
        case 'feature_close': return '⏹️';
        case 'tab_hidden': return '👻';
        case 'tab_visible': return '👁️';
        case 'page_close': return '🚪';
        case 'locked_day_tap': return '🔒';
        case 'scroll': return '📜';
        case 'heartbeat': return '💓';
        default: return '📌';
    }
}

// ── Notification helpers ──
function getNotifIcon(type) {
    switch (type) {
        case 'login': return '📱';
        case 'session': return '🟢';
        case 'logout': return '🔴';
        case 'game_response': return '💌';
        case 'game_edit': return '✏️';
        case 'page_view': return '🏠';
        case 'feature_open': return '▶️';
        case 'feature_close': return '⏹️';
        case 'page_close': return '🚪';
        case 'tab_hidden': return '👻';
        case 'tab_visible': return '👁️';
        case 'locked_day_tap': return '🔒';
        case 'heartbeat': return '💓';
        default: return '📡';
    }
}

function getNotifStyle(type) {
    switch (type) {
        case 'login':
        case 'session':
            return 'bg-green-500/20 border-green-500/30';
        case 'logout':
        case 'page_close':
            return 'bg-red-500/20 border-red-500/30';
        case 'game_response':
        case 'game_edit':
            return 'bg-rose-500/20 border-rose-500/30';
        case 'feature_open':
            return 'bg-blue-500/20 border-blue-500/30';
        case 'locked_day_tap':
            return 'bg-amber-500/20 border-amber-500/30';
        default:
            return 'bg-white/10 border-white/20';
    }
}

function getLiveEventStyle(type) {
    switch (type) {
        case 'login':
        case 'session':
            return 'bg-green-500/10 border-green-500/20';
        case 'logout':
        case 'page_close':
            return 'bg-red-500/10 border-red-500/20';
        case 'game_response':
        case 'game_edit':
            return 'bg-rose-500/10 border-rose-500/20';
        case 'feature_open':
            return 'bg-blue-500/10 border-blue-500/20';
        case 'feature_close':
            return 'bg-orange-500/10 border-orange-500/20';
        case 'tab_hidden':
            return 'bg-gray-500/10 border-gray-500/20';
        case 'tab_visible':
        case 'page_view':
            return 'bg-emerald-500/10 border-emerald-500/20';
        case 'locked_day_tap':
            return 'bg-amber-500/10 border-amber-500/20';
        default:
            return 'bg-white/5 border-white/10';
    }
}
