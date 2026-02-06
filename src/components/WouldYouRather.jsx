import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse } from '../lib/tracking';
import GameReviewSection from './GameReviewSection';

const scenarios = [

    { a: "Go on a surprise trip with me", b: "Have me plan a perfect date for you", category: "Adventure" },
    { a: "Always know what I'm thinking", b: "Always know how I'm feeling", category: "Connection" },
    { a: "Live together in a cozy village house with a puppy", b: "Live in a big city apartment with a view", category: "Future Dreams" },

    { a: "Relive our first conversation", b: "Fast-forward to the day we finally meet again", category: "Memories vs Future" },
    { a: "Have me cook your favorite meal (but I'm terrible at cooking)", b: "Order expensive food but eat alone", category: "Effort vs Luxury" },
    { a: "Be my alarm clock voice every morning", b: "Be the last voice I hear before sleep", category: "Daily Rituals" },



    { a: "Have a perfect memory of every moment together", b: "Always feel butterflies like it's the first time", category: "Deep" },
    { a: "Be stuck in an elevator with me for 24 hours", b: "Be stranded on a beautiful island with me for a week", category: "Adventure" },
    { a: "Have me always make you laugh when you're sad", b: "Have me always hold you tight when you cry", category: "Comfort" },

];

const personalityTraits = {
    'Touch vs Communication': { a: 'physical', b: 'verbal' },
    'Adventure': { a: 'spontaneous', b: 'planner' },
    'Connection': { a: 'logical', b: 'emotional' },
    'Future Dreams': { a: 'cozy', b: 'ambitious' },
    'LDR Life': { a: 'traditional-romantic', b: 'spontaneous-romantic' },
    'Memories vs Future': { a: 'nostalgic', b: 'forward-looking' },
    'Effort vs Luxury': { a: 'sentimental', b: 'practical' },
    'Daily Rituals': { a: 'morning-person', b: 'night-owl' },
    'Grand Gestures': { a: 'creative', b: 'symbolic' },
    'LDR Decisions': { a: 'present-focused', b: 'future-focused' },
    'Vulnerability': { a: 'curious', b: 'builder' },
    'Deep': { a: 'memory-keeper', b: 'thrill-seeker' },
    'Comfort': { a: 'joy-bringer', b: 'protector' },
    'Romance Style': { a: 'frequent-lover', b: 'grand-gesture' },
};

const personalitySummaries = {
    emotional: "You love through feelings — every word, every silence matters to you 🥹",
    spontaneous: "You live for surprises and unplanned magical moments ✨",
    'future-focused': "You dream big about our forever together 🏡",
    sentimental: "Every little effort means the world to you 💌",
    protector: "You'd do anything to keep the ones you love safe and warm 🤗",
    'nostalgic': "You treasure every memory like a precious gem 💎",
    'night-owl': "Late night calls and sleepy goodbyes are your love language 🌙",
};

export default function WouldYouRather() {
    const [current, setCurrent] = useState(0);
    const [choices, setChoices] = useState([]);
    const [selectedSide, setSelectedSide] = useState(null);
    const [explanation, setExplanation] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [savedResponses, setSavedResponses] = useState([]);

    const scenario = scenarios[current];

    const handleChoice = (side) => {
        if (animating) return;
        setAnimating(true);
        setSelectedSide(side);

        const newChoices = [...choices, { index: current, side, category: scenario.category }];
        setChoices(newChoices);

        // Show explanation prompt after a beat
        setTimeout(() => {
            setShowExplanation(true);
            setAnimating(false);
        }, 800);
    };

    const handleNext = async () => {
        // Save the choice to database
        const saved = await saveGameResponse({
            gameType: 'would_you_rather',
            questionText: `${scenario.a} vs ${scenario.b}`,
            responseText: selectedSide === 'a' ? scenario.a : scenario.b,
            responseData: {
                side: selectedSide,
                category: scenario.category,
                explanation: explanation || null,
                questionIndex: current
            }
        });

        if (saved) {
            setSavedResponses(prev => [...prev, {
                id: saved.id,
                question: `${scenario.a}  OR  ${scenario.b}`,
                answer: selectedSide === 'a' ? scenario.a : scenario.b,
                extra: explanation || null,
                responseData: { side: selectedSide, category: scenario.category, explanation: explanation || null, questionIndex: current },
            }]);
        }

        setSelectedSide(null);
        setShowExplanation(false);
        setExplanation('');

        if (current < scenarios.length - 1) {
            setCurrent(prev => prev + 1);
        } else {
            setCompleted(true);
        }
    };

    const getPersonality = () => {
        const traits = {};
        choices.forEach(c => {
            const t = personalityTraits[c.category];
            if (t) {
                const trait = t[c.side];
                traits[trait] = (traits[trait] || 0) + 1;
            }
        });
        const sorted = Object.entries(traits).sort((a, b) => b[1] - a[1]);
        return sorted.slice(0, 3).map(([t]) => t);
    };

    const resetGame = () => {
        setCurrent(0);
        setChoices([]);
        setSelectedSide(null);
        setExplanation('');
        setShowExplanation(false);
        setCompleted(false);
    };

    if (completed) {
        const topTraits = getPersonality();
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <div className="p-8 rounded-2xl bg-gradient-to-br from-love-500/20 to-purple-500/20 border border-love-500/20 text-center">
                    <div className="text-5xl mb-4">💝</div>
                    <h3 className="text-white text-xl font-bold mb-2">Your Love Personality</h3>
                    <p className="text-white/60 text-sm mb-6">Based on {choices.length} choices</p>

                    <div className="space-y-3 mb-6">
                        {topTraits.map((trait, i) => (
                            <motion.div
                                key={trait}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.2 }}
                                className="p-3 rounded-xl bg-white/5 border border-white/10"
                            >
                                <div className="text-white font-medium capitalize text-sm">{trait.replace('-', ' ')}</div>
                                <div className="text-white/50 text-xs mt-1">
                                    {personalitySummaries[trait] || `You have a strong ${trait} side 💕`}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20 mb-6">
                        <p className="text-pink-200/80 text-sm italic">
                            "No matter what you choose, the fact that you're playing this means you're already the perfect partner 💗"
                        </p>
                    </div>

                    {/* Review Section */}
                    {savedResponses.length > 0 && (
                        <div className="mb-6 text-left">
                            <GameReviewSection
                                responses={savedResponses}
                                title="Your Choices"
                                icon="💭"
                                accentColor="purple"
                                onResponseUpdated={(idx, newAnswer) => {
                                    setSavedResponses(prev => prev.map((r, i) => i === idx ? { ...r, answer: newAnswer } : r));
                                }}
                            />
                        </div>
                    )}

                    <button onClick={resetGame} className="w-full py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                        Play Again
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Would You Rather? 💭</h3>
                <p className="text-white/40 text-xs">{current + 1} of {scenarios.length} • {scenario.category}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-love-400 to-purple-500"
                    animate={{ width: `${((current + 1) / scenarios.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                >
                    {/* Option A */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleChoice('a')}
                        disabled={selectedSide !== null}
                        className={`w-full p-5 rounded-2xl text-left transition-all duration-500 border relative overflow-hidden ${selectedSide === 'a'
                                ? 'bg-gradient-to-r from-blue-500/30 to-blue-600/30 border-blue-400/40 shadow-lg shadow-blue-500/10'
                                : selectedSide === 'b'
                                    ? 'bg-white/3 border-white/5 opacity-40'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        {selectedSide === 'a' && (
                            <motion.div
                                className="absolute inset-0 bg-blue-400/5"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                style={{ transformOrigin: 'left' }}
                            />
                        )}
                        <div className="relative flex items-start gap-3">
                            <span className="text-blue-400 text-xl mt-0.5">A</span>
                            <p className="text-white text-sm leading-relaxed">{scenario.a}</p>
                        </div>
                        {selectedSide === 'a' && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 text-lg">✓</motion.span>
                        )}
                    </motion.button>

                    {/* VS Divider */}
                    <div className="flex items-center justify-center">
                        <motion.div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-love-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                            animate={selectedSide ? { scale: [1, 1.3, 0.8, 1], rotate: [0, 180, 360] } : {}}
                            transition={{ duration: 0.6 }}
                        >
                            VS
                        </motion.div>
                    </div>

                    {/* Option B */}
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleChoice('b')}
                        disabled={selectedSide !== null}
                        className={`w-full p-5 rounded-2xl text-left transition-all duration-500 border relative overflow-hidden ${selectedSide === 'b'
                                ? 'bg-gradient-to-r from-rose-500/30 to-red-600/30 border-rose-400/40 shadow-lg shadow-rose-500/10'
                                : selectedSide === 'a'
                                    ? 'bg-white/3 border-white/5 opacity-40'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        {selectedSide === 'b' && (
                            <motion.div
                                className="absolute inset-0 bg-rose-400/5"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                style={{ transformOrigin: 'left' }}
                            />
                        )}
                        <div className="relative flex items-start gap-3">
                            <span className="text-rose-400 text-xl mt-0.5">B</span>
                            <p className="text-white text-sm leading-relaxed">{scenario.b}</p>
                        </div>
                        {selectedSide === 'b' && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 text-lg">✓</motion.span>
                        )}
                    </motion.button>
                </motion.div>
            </AnimatePresence>

            {/* Explanation Prompt */}
            <AnimatePresence>
                {showExplanation && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <p className="text-white/50 text-xs text-center">Why did you choose this? 👀</p>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Tell me why... (optional)"
                            className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-3 min-h-[60px] focus:outline-none focus:border-pink-500/50 placeholder:text-white/20 resize-none text-sm"
                        />
                        <button
                            onClick={handleNext}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-love-500 to-purple-600 text-white font-medium shadow-lg shadow-love-500/20 active:scale-95 transition-transform text-sm"
                        >
                            {current < scenarios.length - 1 ? 'Next Question →' : 'See My Personality 💝'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
