import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Truth or Love questions - intimate and fun
const truthQuestions = [
    "What's the first thing you noticed about me?",
    "What's your favorite memory of us so far?",
    "If you could describe our love in 3 words, what would they be?",
    "What's one thing about me that makes you smile?",
    "What's the cutest thing I do without realizing it?",
    "What song reminds you of us?",
    "What's something you've never told me but always wanted to?",
    "If we could go anywhere together, where would it be?",
    "What's your favorite thing I say to you?",
    "What moment made you realize you loved me?",
];

const loveActions = [
    "Send me your cutest selfie right now 📸",
    "Tell me 3 things you love about me",
    "Send me a voice note saying 'I love you'",
    "Share your favorite photo of us (or one you wish we had)",
    "Write me a 2-line poem about our love",
    "Tell me what you're thinking about right now",
    "Describe your perfect day with me",
    "Send me the emoji that describes how you feel about me",
    "Tell me a secret you've been keeping",
    "Say something that'll make me blush",
];

export default function TruthOrLove() {
    const [mode, setMode] = useState(null); // 'truth' or 'love'
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [revealedCount, setRevealedCount] = useState(0);

    const pickRandom = (array) => {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    };

    const handlePick = (type) => {
        setMode(type);
        if (type === 'truth') {
            setCurrentQuestion(pickRandom(truthQuestions));
        } else {
            setCurrentQuestion(pickRandom(loveActions));
        }
        setRevealedCount(prev => prev + 1);
    };

    const handleNext = () => {
        if (mode === 'truth') {
            setCurrentQuestion(pickRandom(truthQuestions));
        } else {
            setCurrentQuestion(pickRandom(loveActions));
        }
        setRevealedCount(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Truth or Love? 💕</h3>
                <p className="text-white/50 text-sm">
                    Pick one and answer honestly... no hiding!
                </p>
            </div>

            {/* Choice Buttons */}
            {!currentQuestion ? (
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePick('truth')}
                        className="py-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold shadow-lg"
                    >
                        <span className="text-3xl block mb-2">🤔</span>
                        Truth
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePick('love')}
                        className="py-6 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-semibold shadow-lg"
                    >
                        <span className="text-3xl block mb-2">💕</span>
                        Love
                    </motion.button>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Question Card */}
                        <div className={`p-6 rounded-2xl border ${mode === 'truth'
                                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-purple-500/30'
                                : 'bg-gradient-to-br from-rose-500/20 to-red-500/20 border-rose-500/30'
                            }`}>
                            <div className="text-center mb-4">
                                <span className="text-4xl">{mode === 'truth' ? '🤔' : '💕'}</span>
                            </div>
                            <p className="text-white text-lg text-center leading-relaxed font-medium">
                                {currentQuestion}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => {
                                    setCurrentQuestion(null);
                                    setMode(null);
                                }}
                                className="py-3 rounded-xl bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                                Pick Again
                            </button>
                            <button
                                onClick={handleNext}
                                className={`py-3 rounded-xl text-white font-medium ${mode === 'truth'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                                    }`}
                            >
                                Next {mode === 'truth' ? 'Truth' : 'Love'}
                            </button>
                        </div>

                        {/* Counter */}
                        <p className="text-center text-white/40 text-xs">
                            Questions revealed: {revealedCount} 💫
                        </p>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
