import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse } from '../lib/tracking';
import { loveLanguageQuestions, loveLanguageResults } from '../data/gameData';

export default function LoveLanguageTest() {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const question = loveLanguageQuestions[currentQ];
    const totalQ = loveLanguageQuestions.length;

    const result = useMemo(() => {
        if (!showResult) return null;
        const counts = {};
        answers.forEach(type => {
            counts[type] = (counts[type] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const primaryType = sorted[0]?.[0];
        const secondaryType = sorted[1]?.[0];
        return {
            primary: loveLanguageResults[primaryType],
            secondary: secondaryType ? loveLanguageResults[secondaryType] : null,
            counts,
            total: answers.length,
        };
    }, [showResult, answers]);

    const handleSelect = (type) => {
        setSelectedOption(type);
        setTimeout(() => {
            const newAnswers = [...answers, type];
            setAnswers(newAnswers);
            setSelectedOption(null);

            saveGameResponse({
                gameType: 'love_language_test',
                questionText: question.question,
                responseText: question.options.find(o => o.type === type)?.text || type,
                responseData: { questionIndex: currentQ, selectedType: type, questionNumber: currentQ + 1 }
            });

            if (currentQ < totalQ - 1) {
                setCurrentQ(prev => prev + 1);
            } else {
                // Track the final result
                const counts = {};
                newAnswers.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
                const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                const primaryType = sorted[0]?.[0];
                saveGameResponse({
                    gameType: 'love_language_test',
                    questionText: 'Test completed - Result',
                    responseText: loveLanguageResults[primaryType]?.title || primaryType,
                    responseData: { primaryType, counts, totalAnswers: newAnswers.length }
                });
                setShowResult(true);
            }
        }, 400);
    };

    const resetTest = () => {
        setCurrentQ(0);
        setAnswers([]);
        setShowResult(false);
        setSelectedOption(null);
    };

    if (showResult && result) {
        const barTypes = ['words', 'quality', 'gifts', 'acts', 'touch'];
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
            >
                <div className="text-center">
                    <h3 className="text-white font-semibold mb-1">Your Love Language 💕</h3>
                    <p className="text-white/40 text-xs">Based on {result.total} answers</p>
                </div>

                {/* Primary Result */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-love-500/20 to-purple-500/20 border border-love-500/20 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="text-5xl mb-3"
                    >
                        {result.primary.emoji}
                    </motion.div>
                    <h4 className="text-white text-xl font-bold mb-2">{result.primary.title}</h4>
                    <p className="text-white/70 text-sm leading-relaxed">{result.primary.description}</p>
                    <div className="mt-4 p-3 rounded-xl bg-love-500/10 border border-love-500/20">
                        <p className="text-love-200/80 text-xs italic">💡 {result.primary.tip}</p>
                    </div>
                </div>

                {/* Secondary */}
                {result.secondary && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                        <p className="text-white/40 text-xs mb-1">Secondary Language</p>
                        <p className="text-white font-medium text-sm">
                            {result.secondary.emoji} {result.secondary.title}
                        </p>
                    </motion.div>
                )}

                {/* Breakdown Bars */}
                <div className="space-y-2">
                    <p className="text-white/30 text-xs text-center">Full Breakdown</p>
                    {barTypes.map((type, i) => {
                        const count = result.counts[type] || 0;
                        const percent = Math.round((count / result.total) * 100);
                        const info = loveLanguageResults[type];
                        return (
                            <motion.div
                                key={type}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center gap-2"
                            >
                                <span className="text-sm w-5 text-center">{info.emoji}</span>
                                <div className="flex-1 h-5 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                                        className="h-full rounded-full bg-gradient-to-r from-love-500 to-purple-500"
                                    />
                                </div>
                                <span className="text-white/40 text-xs w-8 text-right">{percent}%</span>
                            </motion.div>
                        );
                    })}
                </div>

                <button onClick={resetTest} className="w-full py-3 rounded-xl bg-white/10 text-white/60 text-sm hover:text-white transition-colors">
                    Take Again
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Love Language Test 💕</h3>
                <p className="text-white/40 text-xs">{currentQ + 1} of {totalQ}</p>
            </div>

            {/* Progress */}
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-love-400 to-purple-500"
                    animate={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="space-y-3"
                >
                    {/* Question */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-love-500/10 to-purple-500/10 border border-love-500/20">
                        <p className="text-white text-base leading-relaxed text-center">
                            {question.question}
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        {question.options.map((option, i) => (
                            <motion.button
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelect(option.type)}
                                disabled={selectedOption !== null}
                                className={`w-full p-4 rounded-xl text-left border transition-all text-sm ${
                                    selectedOption === option.type
                                        ? 'bg-love-500/20 border-love-400/40 text-white'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                                }`}
                            >
                                {option.text}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
