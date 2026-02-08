import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse, trackEvent, getGameResponses } from '../lib/tracking';
import { useAuth } from '../hooks/useAuth';

// Get user-scoped proposal key
function getProposalKey(userId) {
    return `${userId || '_nouser'}_lunar_proposal_response`;
}

// Sync localStorage proposal response to Supabase on load
async function syncProposalToSupabase(proposalKey) {
    try {
        const stored = localStorage.getItem(proposalKey);
        if (!stored) return;
        const data = JSON.parse(stored);
        if (data.synced) return; // Already synced

        const result = await saveGameResponse({
            gameType: 'proposal_forever',
            questionText: 'Toh madam ji, proposal accepted forever? 💍',
            responseText: data.response,
            responseData: {
                accepted: data.accepted,
                respondedAt: data.respondedAt,
                noAttempts: data.noAttempts || 0,
            }
        });

        if (result) {
            // Mark as synced in localStorage
            data.synced = true;
            localStorage.setItem(proposalKey, JSON.stringify(data));
            console.log('[ProposalResponse] ✅ Synced to Supabase!');
        }
    } catch (e) {
        console.error('[ProposalResponse] Sync error:', e);
    }
}

/**
 * Fetch proposal response from Supabase (cross-device support).
 * If localStorage is empty but Supabase has a record, populate localStorage.
 */
async function fetchProposalFromSupabase(proposalKey) {
    try {
        const responses = await getGameResponses('proposal_forever');
        if (responses && responses.length > 0) {
            // Find the accepted response (most recent)
            const accepted = responses.find(r =>
                r.response_data?.accepted || r.responseData?.accepted
            );
            if (accepted) {
                const rd = accepted.response_data || accepted.responseData || {};
                const data = {
                    accepted: true,
                    response: accepted.response_text || accepted.answer || 'Haan! Proposal Accepted Forever! 💍❤️',
                    respondedAt: rd.respondedAt || accepted.created_at,
                    noAttempts: rd.noAttempts || 0,
                    synced: true, // It came FROM the DB, so it's synced
                    fetchedFromDb: true,
                };
                // Save to this device's localStorage so it works offline too
                localStorage.setItem(proposalKey, JSON.stringify(data));
                console.log('[ProposalResponse] ✅ Fetched from Supabase & saved to localStorage');
                return data;
            }
        }
    } catch (e) {
        console.error('[ProposalResponse] Fetch from Supabase error:', e);
    }
    return null;
}

export default function ProposalResponse() {
    const { session } = useAuth();
    const userId = session?.user?.id || '';
    const proposalKey = getProposalKey(userId);

    // Initialize state from localStorage synchronously
    const storedData = (() => {
        try {
            const stored = localStorage.getItem(proposalKey);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return null;
    })();

    const [hasResponded, setHasResponded] = useState(!!storedData?.accepted);
    const [accepted, setAccepted] = useState(!!storedData?.accepted);
    const [responseData, setResponseData] = useState(storedData);
    const [loading, setLoading] = useState(!storedData); // Loading if no local data
    const [noAttempts, setNoAttempts] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);
    const [noMessage, setNoMessage] = useState('');

    const [confettiParticles] = useState(() =>
        Array.from({ length: 20 }, (_, i) => ({
            left: Math.random() * 100,
            x: (Math.random() - 0.5) * 200,
            duration: 2 + Math.random() * 2,
            color: ['#ec4899', '#a855f7', '#ef4444', '#f59e0b', '#10b981'][i % 5],
        })));

    // Re-initialize when user/proposalKey changes (handles user switching)
    // DB is ALWAYS the source of truth — localStorage is just a cache
    useEffect(() => {
        let cancelled = false;

        // Reset UI to loading while we check DB
        setLoading(true);
        setHasResponded(false);
        setAccepted(false);
        setResponseData(null);
        setNoAttempts(0);
        setNoMessage('');
        setShowCelebration(false);

        // Always verify against DB first
        fetchProposalFromSupabase(proposalKey).then((dbData) => {
            if (cancelled) return;

            if (dbData) {
                // DB has a record → this user genuinely accepted
                setResponseData(dbData);
                setHasResponded(true);
                setAccepted(true);
                trackEvent('proposal_response_loaded_from_db', 'proposal_forever', {
                    respondedAt: dbData.respondedAt,
                });
            } else {
                // DB has NO record → clear any stale localStorage and show fresh
                localStorage.removeItem(proposalKey);
                // Also clear any old unscoped key that might exist
                localStorage.removeItem('lunar_proposal_response');
                setHasResponded(false);
                setAccepted(false);
                setResponseData(null);
            }
            setLoading(false);
        }).catch(() => {
            if (cancelled) return;
            // On network error, fall back to localStorage as last resort
            let localData = null;
            try {
                const stored = localStorage.getItem(proposalKey);
                if (stored) localData = JSON.parse(stored);
            } catch { /* ignore */ }

            if (localData?.accepted) {
                setResponseData(localData);
                setHasResponded(true);
                setAccepted(true);
            }
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [proposalKey]);

    const noMessages = [
        "Arre arre... yeh galat button hai madam ji! 😤",
        "Nahi nahi, sochiye phir se... dil se sochiye! 🥺",
        "Madam ji, yeh answer mujhe accept nahi hai! 😏",
        "Aapko pata hai na... mujhe sirf ek hi jawaab chahiye! 💕",
        "Itna bhi mat satao yaar... bol do haan! 🥺❤️",
        "Main toh maanunga nahi... haan bolo please! 😘",
        "Dekho, No ka option toh hai hi nahi actually... 😌",
        "Chalo chalo, mazak hua bahut... ab haan bol do! 💍",
    ];

    const handleAccept = () => {
        const data = {
            accepted: true,
            response: 'Haan! Proposal Accepted Forever! 💍❤️',
            respondedAt: new Date().toISOString(),
            noAttempts: noAttempts,
            synced: false,
        };

        // Save to localStorage FIRST
        localStorage.setItem(proposalKey, JSON.stringify(data));
        setResponseData(data);
        setAccepted(true);
        setHasResponded(true);
        setShowCelebration(true);

        // Save to Supabase
        saveGameResponse({
            gameType: 'proposal_forever',
            questionText: 'Toh madam ji, proposal accepted forever? 💍',
            responseText: data.response,
            responseData: {
                accepted: true,
                respondedAt: data.respondedAt,
                noAttempts: noAttempts,
            }
        }).then((result) => {
            if (result) {
                data.synced = true;
                localStorage.setItem(proposalKey, JSON.stringify(data));
            }
        });

        trackEvent('proposal_accepted_forever', 'proposal_forever', { noAttempts });
    };

    const handleNo = () => {
        const newAttempts = noAttempts + 1;
        setNoAttempts(newAttempts);
        setNoMessage(noMessages[(newAttempts - 1) % noMessages.length]);

        trackEvent('proposal_no_attempt', 'proposal_forever', { attempt: newAttempts });

        // After 3 "No" attempts, auto-show the polite acceptance message
        if (newAttempts >= 3) {
            setNoMessage("Bas bas... ab toh maan jao na madam ji! Sirf haan ka option hai ab! 💕😘");
        }
    };

    // Loading state while checking Supabase
    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center py-6"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-6 h-6 border-2 border-pink-500/30 border-t-pink-500 rounded-full mb-2"
                />
                <p className="text-white/40 text-xs">Loading proposal status...</p>
            </motion.div>
        );
    }

    // Already accepted - show what she accepted
    if (hasResponded && accepted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
            >
                <div className="bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-red-500/20 rounded-2xl p-5 border border-rose-500/30 relative overflow-hidden">
                    {/* Sparkle background */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-lg"
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                }}
                                animate={{
                                    opacity: [0.2, 0.8, 0.2],
                                    scale: [0.8, 1.2, 0.8],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                }}
                            >
                                ✨
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10 text-center">
                        <motion.div
                            className="text-5xl mb-3"
                            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            💍❤️
                        </motion.div>

                        <h3 className="font-script text-2xl sm:text-3xl text-rose-200 mb-2">
                            Proposal Accepted Forever!
                        </h3>

                        <p className="text-white/80 text-sm mb-3 leading-relaxed">
                            Tumne haan keh diya, aur meri duniya roshan ho gayi! ✨
                            <br />
                            Ab yeh waada hai — hamesha saath, har pal, har lamha. 💕
                        </p>

                        <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
                            <p className="text-rose-300 text-xs italic">
                                "{responseData?.response}"
                            </p>
                            <p className="text-white/40 text-[10px] mt-1">
                                Accepted on {responseData?.respondedAt
                                    ? new Date(responseData.respondedAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })
                                    : 'Forever ago'}
                            </p>
                        </div>

                        <motion.p
                            className="text-rose-400 font-script text-xl"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            I Love You Forever ❤️
                        </motion.p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Celebration animation after accepting
    if (showCelebration) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center"
            >
                <div className="bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-red-500/20 rounded-2xl p-6 border border-rose-500/30 relative overflow-hidden">
                    {/* Confetti */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {confettiParticles.map((p, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${p.left}%`,
                                    backgroundColor: p.color,
                                }}
                                initial={{ y: -20, opacity: 1 }}
                                animate={{ y: 400, opacity: 0, rotate: 720, x: p.x }}
                                transition={{ duration: p.duration, delay: i * 0.08, repeat: 2 }}
                            />
                        ))}
                    </div>

                    <motion.div
                        className="text-6xl mb-4"
                        animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        💍🎉
                    </motion.div>

                    <h3 className="font-script text-3xl text-rose-200 mb-3">
                        Yaaay! You Said Yes! 🥳
                    </h3>

                    <p className="text-white/80 text-sm leading-relaxed mb-4">
                        Madam ji ne proposal accept kar liya! 😍
                        <br />
                        Ab toh pukka waala forever hai! 💕
                        <br /><br />
                        Tumhara yeh "Haan" mere liye duniya ki
                        <br />
                        sabse khoobsurat awaaz hai! ❤️
                    </p>

                    <motion.p
                        className="text-rose-400 font-script text-2xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        I Love You Forever & Always 💕
                    </motion.p>
                </div>
            </motion.div>
        );
    }

    // Proposal box - with Yes/No options
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
        >
            <div className="bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-red-500/15 rounded-2xl p-5 border border-rose-500/25 relative overflow-hidden">
                {/* Floating hearts background */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-rose-500/20 text-2xl"
                            style={{ left: `${20 + i * 20}%`, top: `${10 + i * 20}%` }}
                            animate={{
                                y: [-5, 5, -5],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        >
                            💕
                        </motion.div>
                    ))}
                </div>

                <div className="relative z-10">
                    <div className="text-center mb-4">
                        <motion.div
                            className="text-4xl mb-2"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            💍
                        </motion.div>
                        <h3 className="font-script text-xl sm:text-2xl text-rose-200 mb-1">
                            Toh Madam Ji...
                        </h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Proposal accepted forever? 💕
                            <br />
                            <span className="text-white/50 text-xs">
                                (Ek baar bol do, phir toh hamesha ka hai!)
                            </span>
                        </p>
                    </div>

                    {/* No attempt message */}
                    <AnimatePresence>
                        {noMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center mb-3"
                            >
                                <p className="text-rose-400 text-sm font-medium bg-rose-500/10 rounded-lg p-2 inline-block">
                                    {noMessage}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Buttons */}
                    <div className="flex flex-col items-center gap-3">
                        {/* Main Accept Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={noAttempts >= 3 ? {
                                scale: [1, 1.05, 1],
                                boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 20px rgba(244,63,94,0.5)', '0 0 0px rgba(244,63,94,0)']
                            } : {}}
                            transition={noAttempts >= 3 ? { duration: 1.5, repeat: Infinity } : {}}
                            onClick={handleAccept}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold text-lg shadow-lg shadow-rose-500/30 active:scale-[0.98] transition-transform"
                        >
                            💍 Haan, Proposal Accepted Forever! 💕
                        </motion.button>

                        {/* No button - only show if less than 3 attempts */}
                        {noAttempts < 3 && (
                            <motion.button
                                whileHover={{ scale: 0.95 }}
                                onClick={handleNo}
                                className="px-6 py-2.5 rounded-xl bg-white/5 text-white/40 hover:text-white/60 text-sm border border-white/10 transition-all"
                                animate={{
                                    opacity: Math.max(0.3, 1 - noAttempts * 0.25),
                                    scale: Math.max(0.7, 1 - noAttempts * 0.1),
                                }}
                            >
                                Sochna hai... 🤔
                            </motion.button>
                        )}

                        {/* After 3 no attempts - only accept option with polite message */}
                        {noAttempts >= 3 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-rose-300/70 text-xs text-center italic"
                            >
                                Ab toh bas ek hi option hai madam ji... ☝️💕
                            </motion.p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
