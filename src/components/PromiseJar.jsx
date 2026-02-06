import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { promiseSlips } from '../data/gameData';
import { useLoveContext } from '../hooks/useLoveContext';

export default function PromiseJar() {
    const { claimedPromises, claimPromise } = useLoveContext();
    const [selectedPromise, setSelectedPromise] = useState(null);
    const [isShaking, setIsShaking] = useState(false);
    const [, setUnfoldingId] = useState(null);
    const [showFulfilled, setShowFulfilled] = useState(false);
    const [fulfilledPromises, setFulfilledPromises] = useState(() => {
        const saved = localStorage.getItem('fulfilledPromises');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('fulfilledPromises', JSON.stringify(fulfilledPromises));
    }, [fulfilledPromises]);

    const unclaimed = promiseSlips.filter(p => !claimedPromises.includes(p.id));
    const claimed = promiseSlips.filter(p => claimedPromises.includes(p.id));

    // Jar fill level
    const fillPercent = Math.max(0, ((promiseSlips.length - claimedPromises.length) / promiseSlips.length) * 100);

    const handleShake = () => {
        if (unclaimed.length === 0) return;
        setIsShaking(true);
        setTimeout(() => {
            const random = unclaimed[Math.floor(Math.random() * unclaimed.length)];
            setSelectedPromise(random);
            setIsShaking(false);
        }, 1000);
    };

    const handleClaim = () => {
        if (!selectedPromise) return;
        setUnfoldingId(selectedPromise.id);
        setTimeout(() => {
            claimPromise(selectedPromise.id);
            setUnfoldingId(null);
        }, 600);
    };

    const toggleFulfill = (id) => {
        setFulfilledPromises(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Promise Jar 🏺</h3>
                <p className="text-white/40 text-xs">
                    Shake to pick a promise! {unclaimed.length} left in the jar
                </p>
            </div>

            {/* Visual Jar */}
            <div className="flex justify-center">
                <motion.div 
                    className="relative w-40 h-48"
                    animate={isShaking ? { 
                        rotate: [0, -8, 8, -8, 8, -4, 4, 0],
                        x: [0, -5, 5, -5, 5, -2, 2, 0]
                    } : {}}
                    transition={{ duration: 0.8 }}
                >
                    {/* Jar body */}
                    <div className="absolute bottom-0 w-full h-40 rounded-b-3xl rounded-t-lg border-2 border-amber-400/30 bg-amber-900/10 overflow-hidden">
                        {/* Fill level */}
                        <motion.div 
                            className="absolute bottom-0 w-full bg-gradient-to-t from-love-500/30 to-love-400/10"
                            animate={{ height: `${fillPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                        
                        {/* Paper slips inside */}
                        {unclaimed.length > 0 && (
                            <div className="absolute inset-0 flex flex-wrap items-end justify-center gap-0.5 p-2">
                                {unclaimed.slice(0, 12).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-5 h-3 rounded-sm bg-amber-200/40"
                                        style={{ rotate: `${(i * 17) % 40 - 20}deg` }}
                                        animate={isShaking ? { 
                                            y: [0, -10, 5, -5, 0],
                                            rotate: [`${(i * 17) % 40 - 20}deg`, `${(i * 17) % 40 + 10}deg`, `${(i * 17) % 40 - 20}deg`]
                                        } : {}}
                                    />
                                ))}
                            </div>
                        )}

                        {unclaimed.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-white/20 text-xs">Empty!</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Jar lid */}
                    <div className="absolute top-0 w-full h-8 bg-amber-700/40 rounded-t-xl border-2 border-amber-400/30 flex items-center justify-center">
                        <div className="w-8 h-2 rounded-full bg-amber-400/30" />
                    </div>
                </motion.div>
            </div>

            {/* Shake Button */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShake}
                disabled={unclaimed.length === 0 || isShaking}
                className={`w-full py-4 rounded-xl text-white font-medium transition-all ${
                    unclaimed.length === 0
                        ? 'bg-gray-600/50 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-amber-500 to-love-500 shadow-lg shadow-love-500/20 active:scale-95'
                }`}
            >
                {isShaking ? '🫨 Shaking...' : unclaimed.length > 0 ? '🤞 Shake the Jar' : 'All Promises Claimed!'}
            </motion.button>

            {/* Selected Promise Card */}
            <AnimatePresence>
                {selectedPromise && !claimedPromises.includes(selectedPromise.id) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-love-500/20 border border-amber-400/30 text-center"
                    >
                        <div className="text-3xl mb-3">{selectedPromise.icon}</div>
                        <p className="text-white text-lg font-medium leading-relaxed mb-4">
                            {selectedPromise.promise}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedPromise(null)}
                                className="py-2.5 rounded-xl bg-white/10 text-white/60 text-sm"
                            >
                                Put Back
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClaim}
                                className="py-2.5 rounded-xl bg-gradient-to-r from-love-500 to-purple-600 text-white font-medium text-sm shadow-lg"
                            >
                                Claim This! 💕
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle View */}
            {claimed.length > 0 && (
                <button
                    onClick={() => setShowFulfilled(!showFulfilled)}
                    className="w-full py-2 rounded-lg text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                    {showFulfilled ? 'Hide' : 'Show'} Claimed Promises ({claimed.length})
                </button>
            )}

            {/* Claimed Promises with Fulfillment Tracker */}
            <AnimatePresence>
                {showFulfilled && claimed.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                    >
                        <p className="text-white/30 text-xs text-center mb-2">
                            Tap to mark as fulfilled ✓
                        </p>
                        {claimed.map(p => {
                            const isFulfilled = fulfilledPromises.includes(p.id);
                            return (
                                <motion.button
                                    key={p.id}
                                    layout
                                    onClick={() => toggleFulfill(p.id)}
                                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                                        isFulfilled
                                            ? 'bg-green-500/10 border-green-500/20'
                                            : 'bg-white/5 border-white/10 hover:bg-white/8'
                                    }`}
                                >
                                    <span className="text-xl">{p.icon}</span>
                                    <span className={`flex-1 text-xs leading-relaxed ${isFulfilled ? 'text-green-300/60 line-through' : 'text-white/60'}`}>
                                        {p.promise}
                                    </span>
                                    <span className={`text-sm ${isFulfilled ? 'text-green-400' : 'text-white/20'}`}>
                                        {isFulfilled ? '✓' : '○'}
                                    </span>
                                </motion.button>
                            );
                        })}

                        {/* Fulfillment Progress */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                            <p className="text-white/40 text-xs">
                                {fulfilledPromises.length} of {claimed.length} promises fulfilled 
                                {fulfilledPromises.length === claimed.length && claimed.length > 0 && ' — You keep every promise! 🥰'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
