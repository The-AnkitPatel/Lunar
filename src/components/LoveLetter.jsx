import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loveFacts } from '../data/gameData';
import { saveGameResponse } from '../lib/tracking';

export default function LoveLetter() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isOpening, setIsOpening] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [readLetters, setReadLetters] = useState(() => {
        const saved = localStorage.getItem('readLetters');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('readLetters', JSON.stringify(readLetters));
    }, [readLetters]);

    const letter = loveFacts[currentIndex];

    const handleOpen = useCallback(() => {
        if (isOpen) return;
        setIsOpening(true);
        // Wax seal breaking animation
        setTimeout(() => {
            setIsOpen(true);
            setIsOpening(false);
            if (!readLetters.includes(currentIndex)) {
                setReadLetters(prev => [...prev, currentIndex]);
            }

            saveGameResponse({
                gameType: 'love_letter',
                questionText: letter.envelope,
                responseText: letter.text,
                responseData: { letterIndex: currentIndex, seal: letter.seal }
            });
        }, 1200);
    }, [currentIndex, isOpen, readLetters]);

    const handleNext = () => {
        setIsOpen(false);
        setIsOpening(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % loveFacts.length);
        }, 300);
    };

    const handlePrev = () => {
        setIsOpen(false);
        setIsOpening(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + loveFacts.length) % loveFacts.length);
        }, 300);
    };

    const selectLetter = (idx) => {
        if (idx === currentIndex) return;
        setIsOpen(false);
        setIsOpening(false);
        setTimeout(() => setCurrentIndex(idx), 200);
    };

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Open When... 💌</h3>
                <p className="text-white/40 text-xs">
                    {readLetters.length} of {loveFacts.length} letters read
                </p>
            </div>

            {/* Envelope Selection Row */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                {loveFacts.map((fact, idx) => {
                    const isRead = readLetters.includes(idx);
                    const isCurrent = idx === currentIndex;
                    return (
                        <button
                            key={idx}
                            onClick={() => selectLetter(idx)}
                            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all border ${
                                isCurrent
                                    ? 'bg-love-500/30 border-love-400/40 scale-110 shadow-lg shadow-love-500/20'
                                    : isRead
                                        ? 'bg-white/5 border-white/10 text-white/30'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400/60'
                            }`}
                        >
                            {isRead ? '📭' : '📬'}
                        </button>
                    );
                })}
            </div>

            {/* Current Envelope */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                >
                    {/* Envelope */}
                    <div className="relative" style={{ perspective: '1000px' }}>
                        {!isOpen ? (
                            // Closed envelope
                            <motion.button
                                onClick={handleOpen}
                                className="w-full p-8 rounded-2xl bg-gradient-to-br from-amber-800/40 to-amber-900/40 border-2 border-amber-600/30 text-center relative overflow-hidden"
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Envelope flap */}
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-amber-700/40 to-transparent"
                                    style={{ clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }}
                                    animate={isOpening ? { 
                                        rotateX: [-180],
                                        opacity: [1, 0]
                                    } : {}}
                                    transition={{ duration: 0.8 }}
                                />

                                {/* Wax Seal */}
                                <motion.div
                                    className="relative z-10 w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/50 border-2 border-red-500/30"
                                    animate={isOpening ? {
                                        scale: [1, 1.3, 0],
                                        rotate: [0, 15, -180],
                                        opacity: [1, 0.8, 0]
                                    } : {
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={isOpening ? { duration: 1 } : { duration: 2, repeat: Infinity }}
                                >
                                    <span className="text-2xl">{letter.seal}</span>
                                </motion.div>

                                <p className="text-amber-200/80 text-sm mt-4 font-medium">
                                    {letter.envelope}
                                </p>
                                <p className="text-amber-200/40 text-xs mt-2">
                                    {isOpening ? 'Breaking the seal...' : 'Tap to open 💌'}
                                </p>

                                {/* Crackle effect on opening */}
                                {isOpening && (
                                    <>
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
                                                style={{ top: '50%', left: '50%' }}
                                                animate={{
                                                    x: Math.cos(i * 45 * Math.PI / 180) * 60,
                                                    y: Math.sin(i * 45 * Math.PI / 180) * 60,
                                                    opacity: [1, 0],
                                                    scale: [1, 0]
                                                }}
                                                transition={{ duration: 0.8, delay: 0.3 }}
                                            />
                                        ))}
                                    </>
                                )}
                            </motion.button>
                        ) : (
                            // Open letter
                            <motion.div
                                initial={{ opacity: 0, y: 30, rotateX: -30 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="p-8 rounded-2xl bg-gradient-to-br from-love-500/10 to-purple-500/10 border border-love-500/20 text-center"
                            >
                                <div className="text-4xl mb-4">{letter.seal}</div>
                                
                                {/* Envelope label */}
                                <p className="text-love-300/60 text-xs mb-4 font-medium">
                                    {letter.envelope}
                                </p>

                                {/* Letter content with handwriting feel */}
                                <p className="text-white text-lg leading-relaxed font-handwriting">
                                    {letter.text}
                                </p>

                                {/* Read receipt */}
                                <div className="mt-6 flex items-center justify-center gap-2 text-white/20 text-[10px]">
                                    <span>✓✓</span>
                                    <span>Read at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handlePrev}
                            className="py-3 rounded-xl bg-white/10 text-white/60 text-sm hover:text-white transition-colors"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={handleNext}
                            className="py-3 rounded-xl bg-white/10 text-white/60 text-sm hover:text-white transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* All letters read celebration */}
            {readLetters.length === loveFacts.length && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-love-500/10 to-purple-500/10 border border-love-500/20 text-center"
                >
                    <p className="text-love-300 text-sm">
                        You've read all my letters! 💝 Every word was from my heart.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
