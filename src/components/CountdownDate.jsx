import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { countdownEvents } from '../data/gameData';

function getTimeLeft(targetDate) {
    const now = new Date();
    const target = new Date(targetDate + 'T00:00:00');
    const diff = target - now;
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        passed: false
    };
}

function TimeUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <motion.div
                key={value}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
                <span className="text-white text-xl font-bold tabular-nums">{String(value).padStart(2, '0')}</span>
            </motion.div>
            <span className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">{label}</span>
        </div>
    );
}

export default function CountdownDate() {
    const [now, setNow] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Tick every second
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Find next upcoming event
    const nextEvent = useMemo(() => {
        const upcoming = countdownEvents.find(e => {
            const target = new Date(e.date + 'T00:00:00');
            return target > now;
        });
        return upcoming || countdownEvents[countdownEvents.length - 1];
    }, [now]);

    const active = selectedEvent || nextEvent;
    const timeLeft = active ? getTimeLeft(active.date) : null;

    // Days since she proposed (Jan 12, 2026)
    const proposalDate = new Date('2026-01-12T00:00:00');
    const daysTogether = Math.max(0, Math.floor((now - proposalDate) / (1000 * 60 * 60 * 24)));

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Countdown ⏰</h3>
                <p className="text-white/40 text-xs">Every second closer to our moments</p>
            </div>

            {/* Days Together Counter */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-love-500/10 to-purple-500/10 border border-love-500/20 text-center">
                <p className="text-white/50 text-xs mb-1">Days Since She Said Yes 💍</p>
                <div className="flex items-center justify-center gap-2">
                    <motion.span
                        key={daysTogether}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-bold text-white tabular-nums"
                    >
                        {daysTogether >= 0 ? daysTogether : '—'}
                    </motion.span>
                    <span className="text-white/40 text-sm">days</span>
                </div>
                <p className="text-love-300/60 text-xs mt-1">January 12, 2026 💕</p>
            </div>

            {/* Main Countdown */}
            {active && timeLeft && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                    <div className="text-center mb-4">
                        <span className="text-3xl">{active.icon}</span>
                        <h4 className="text-white font-bold mt-1">{active.name}</h4>
                        <p className="text-white/40 text-xs">{active.date}</p>
                    </div>

                    {timeLeft.passed ? (
                        <div className="text-center py-3">
                            <motion.p
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-love-300 text-lg font-medium"
                            >
                                🎉 It's here! 🎉
                            </motion.p>
                        </div>
                    ) : (
                        <div className="flex justify-center gap-3">
                            <TimeUnit value={timeLeft.days} label="Days" />
                            <div className="flex items-center text-white/20 text-lg pt-[-8px]">:</div>
                            <TimeUnit value={timeLeft.hours} label="Hours" />
                            <div className="flex items-center text-white/20 text-lg pt-[-8px]">:</div>
                            <TimeUnit value={timeLeft.minutes} label="Min" />
                            <div className="flex items-center text-white/20 text-lg pt-[-8px]">:</div>
                            <TimeUnit value={timeLeft.seconds} label="Sec" />
                        </div>
                    )}
                </div>
            )}

            {/* All Events */}
            <div className="space-y-2">
                <p className="text-white/30 text-xs text-center">Valentine's Week 2026</p>
                {countdownEvents.map((event) => {
                    const tl = getTimeLeft(event.date);
                    const isActive = active && active.id === event.id;
                    return (
                        <motion.button
                            key={event.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isActive
                                    ? 'bg-love-500/15 border-love-500/30'
                                    : tl.passed
                                        ? 'bg-white/3 border-white/5'
                                        : 'bg-white/5 border-white/10 hover:bg-white/8'
                            }`}
                        >
                            <span className="text-xl">{event.icon}</span>
                            <div className="flex-1 text-left">
                                <p className={`text-sm font-medium ${tl.passed ? 'text-white/40' : 'text-white'}`}>
                                    {event.name}
                                </p>
                                <p className="text-white/30 text-[10px]">{event.date}</p>
                            </div>
                            <div className="text-right">
                                {tl.passed ? (
                                    <span className="text-green-400/60 text-xs">✓ Passed</span>
                                ) : (
                                    <span className="text-love-300/60 text-xs tabular-nums">
                                        {tl.days > 0 ? `${tl.days}d ` : ''}{tl.hours}h {tl.minutes}m
                                    </span>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Cute message */}
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-center"
            >
                <p className="text-white/20 text-xs italic">
                    Every second brings us closer to each other 💕
                </p>
            </motion.div>
        </div>
    );
}
