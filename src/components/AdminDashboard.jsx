import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'visits', label: 'Visits', icon: '👀' },
    { id: 'responses', label: 'Messages', icon: '💌' },
    { id: 'devices', label: 'Devices', icon: '📱' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
];

const GAME_LABELS = {
    truth_or_love: '🔥 Truth or Love',
    would_you_rather: '💭 Would You Rather',
    complete_sentence: '✍️ Complete Sentence',
    love_quiz: '🧠 Love Quiz',
    proposal: '💍 Proposal',
    dream_date: '🌹 Dream Date',
    spin_wheel: '🎡 Spin Wheel',
    promise_jar: '🤞 Promise Jar',
    love_coupons: '🎟️ Love Coupons',
};

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

    const fetchAllData = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            else setLoading(true);

            const [sessionsRes, responsesRes, eventsRes, devicesRes] = await Promise.all([
                supabase
                    .from('auth_sessions')
                    .select(`*, device_logs(*), profiles:user_id(display_name, role)`)
                    .order('login_at', { ascending: false })
                    .limit(100),
                supabase
                    .from('game_responses')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('created_at', { ascending: false })
                    .limit(200),
                supabase
                    .from('visit_events')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('created_at', { ascending: false })
                    .limit(200),
                supabase
                    .from('device_logs')
                    .select(`*, profiles:user_id(display_name, role)`)
                    .order('logged_in_at', { ascending: false })
                    .limit(50),
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

    // Auto-refresh every 30s
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => fetchAllData(true), 30000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchAllData]);

    // Real-time subscription for new game responses
    useEffect(() => {
        const channel = supabase
            .channel('admin-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_responses' }, (payload) => {
                setGameResponses(prev => [payload.new, ...prev]);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_responses' }, (payload) => {
                setGameResponses(prev => prev.map(r => r.id === payload.new.id ? { ...r, ...payload.new } : r));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visit_events' }, (payload) => {
                setVisitEvents(prev => [payload.new, ...prev]);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auth_sessions' }, () => {
                fetchAllData(true);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchAllData]);

    // ── Derived Stats ──
    const gfSessions = sessions.filter(s => s.profiles?.role === 'gf');
    const gfResponses = gameResponses.filter(r => r.profiles?.role === 'gf' || !r.profiles);

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
                            title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                        >
                            {autoRefresh ? '🔄 Live' : '⏸ Paused'}
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
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                                activeTab === tab.id
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
        </motion.div>
    );
}

// ═══════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════
function OverviewTab({ gfSessions, gfResponses, lastSeen, isOnlineNow, uniqueDevices, totalTimeMs, todayVisits, gameTypeCounts, featureUsage, visitEvents }) {
    const hours = Math.floor(totalTimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalTimeMs % (1000 * 60 * 60)) / (1000 * 60));

    // Recent activity timeline
    const recentActivity = visitEvents
        .filter(e => e.profiles?.role === 'gf' || !e.profiles)
        .slice(0, 8);

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
                                            <span className={`font-mono text-xs font-medium ${
                                                session.is_active ? 'text-green-400' : 'text-rose-300'
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
                                                <span className={`font-mono text-xs ${
                                                    session.is_active ? 'text-green-400' : 'text-white/70'
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
                                            {resp.response_text || '(No text response)'}
                                        </p>

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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            log.device_type === 'mobile'
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
    const gfEvents = events.filter(e => e.profiles?.role === 'gf' || !e.profiles);

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
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                active
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
        default: return `${type} ${feature || ''}`;
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
        default: return '📌';
    }
}
