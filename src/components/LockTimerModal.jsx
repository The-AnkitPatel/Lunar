import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LockTimerModal({ unlockDate, onClose, dayName, message }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(unlockDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(unlockDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [unlockDate]);

    function calculateTimeLeft(targetDate) {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900/90 border border-rose-500/30 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl relative"
            >
                {/* Close Button — Large touch target */}
                <button
                    onClick={onClose}
                    className="absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-white/20 text-white/70 hover:text-white hover:bg-slate-700 active:scale-90 transition-all shadow-lg text-lg z-10"
                    aria-label="Close"
                >
                    ✕
                </button>

                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-4"
                >
                    🔒
                </motion.div>

                <h2 className="text-2xl font-script text-rose-300 mb-2">
                    Intzaar nhi ho rha? 😉
                </h2>

                <p className="text-white/70 text-sm mb-6">
                    {message || "Sabar ka fal meetha (aur romantic) hota hai!"}
                    <br />
                    <span className="text-rose-200 mt-2 block text-xs tracking-wider uppercase opacity-70">
                        {dayName} Unlock Time
                    </span>
                </p>

                <div className="grid grid-cols-4 gap-2 mb-6">
                    <TimeUnit value={timeLeft.days || 0} label="Days" />
                    <TimeUnit value={timeLeft.hours || 0} label="Hrs" />
                    <TimeUnit value={timeLeft.minutes || 0} label="Mins" />
                    <TimeUnit value={timeLeft.seconds || 0} label="Secs" />
                </div>

                <p className="text-xs text-white/40 italic">
                    "Good things come to those who wait... for me." ❤️
                </p>
            </motion.div>
        </div>
    );
}

function TimeUnit({ value, label }) {
    return (
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
            <div className="text-xl font-bold text-rose-400 font-mono">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">
                {label}
            </div>
        </div>
    );
}
