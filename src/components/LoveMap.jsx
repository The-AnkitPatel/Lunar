import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loveMapLocations } from '../data/gameData';

export default function LoveMap() {
    const [selectedPin, setSelectedPin] = useState(null);

    // Arrange pins in a flowing path pattern
    const pinPositions = [
        { x: 20, y: 20 },   // Where it started
        { x: 75, y: 15 },   // Where she lives
        { x: 25, y: 50 },   // Where I live
        { x: 70, y: 45 },   // Where she proposed
        { x: 50, y: 75 },   // Where we'll meet
        { x: 50, y: 35 },   // Under the same moon
    ];

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Love Map 🗺️</h3>
                <p className="text-white/40 text-xs">The places that tell our story</p>
            </div>

            {/* Map Container */}
            <div className="relative rounded-2xl bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-love-900/20 border border-white/10 overflow-hidden" style={{ height: '320px' }}>
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                {/* Connection lines between pins */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                    {pinPositions.slice(0, -1).map((pos, i) => {
                        const next = pinPositions[i + 1];
                        if (i === pinPositions.length - 2) return null; // Skip last connection
                        return (
                            <motion.line
                                key={i}
                                x1={`${pos.x}%`} y1={`${pos.y}%`}
                                x2={`${next.x}%`} y2={`${next.y}%`}
                                stroke="rgba(244,114,182,0.15)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: i * 0.3 }}
                            />
                        );
                    })}
                    {/* Heart line from "me" to "her" */}
                    <motion.line
                        x1={`${pinPositions[2].x}%`} y1={`${pinPositions[2].y}%`}
                        x2={`${pinPositions[1].x}%`} y2={`${pinPositions[1].y}%`}
                        stroke="rgba(239,68,68,0.3)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                    />
                </svg>

                {/* Pins */}
                {loveMapLocations.map((loc, i) => {
                    const pos = pinPositions[i];
                    const isSelected = selectedPin?.id === loc.id;
                    return (
                        <motion.button
                            key={loc.id}
                            initial={{ scale: 0, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', delay: i * 0.2, damping: 12 }}
                            onClick={() => setSelectedPin(isSelected ? null : loc)}
                            className="absolute z-10"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {/* Pulse ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{ backgroundColor: loc.color + '30' }}
                                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                            />
                            {/* Pin */}
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                animate={isSelected ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                                className="relative w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2"
                                style={{ 
                                    backgroundColor: loc.color + '20',
                                    borderColor: loc.color + '60',
                                    boxShadow: `0 0 20px ${loc.color}30`
                                }}
                            >
                                {loc.icon}
                            </motion.div>
                            {/* Label */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                                <span className="text-white/40 text-[9px]">{loc.title}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected Pin Detail */}
            <AnimatePresence>
                {selectedPin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-5 rounded-2xl border text-center"
                        style={{
                            background: `linear-gradient(135deg, ${selectedPin.color}15, ${selectedPin.color}05)`,
                            borderColor: selectedPin.color + '30',
                        }}
                    >
                        <span className="text-3xl">{selectedPin.icon}</span>
                        <h4 className="text-white font-bold mt-2 mb-1">{selectedPin.title}</h4>
                        <p className="text-white/60 text-sm leading-relaxed">{selectedPin.description}</p>
                        {selectedPin.tag === 'proposal' && (
                            <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-amber-300/80 text-xs">💍 January 12, 2026 — The day everything changed</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2">
                {loveMapLocations.slice(0, 6).map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => setSelectedPin(loc)}
                        className={`p-2 rounded-lg border text-center transition-all ${
                            selectedPin?.id === loc.id
                                ? 'bg-white/10 border-white/20'
                                : 'bg-white/3 border-white/5 hover:bg-white/8'
                        }`}
                    >
                        <span className="text-sm">{loc.icon}</span>
                        <p className="text-white/40 text-[9px] mt-0.5 truncate">{loc.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
