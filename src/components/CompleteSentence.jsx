import { useState } from 'react';
import { motion } from 'framer-motion';

// Complete the sentence prompts - for couples to finish together
const prompts = [
    "I knew I loved you when...",
    "The thing I miss most when we're apart is...",
    "My favorite thing about your smile is...",
    "If I could spend forever with you, I would...",
    "The first thing I think about when I wake up is...",
    "You make me feel like...",
    "My dream date with you would be...",
    "The moment I realized you were special was...",
    "I love it when you...",
    "Our love story is like...",
    "In 5 years, I see us...",
    "The cutest thing you do is...",
];

export default function CompleteSentence() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [showAnswers, setShowAnswers] = useState(false);

    const currentPrompt = prompts[currentIndex];

    const handleSubmit = () => {
        if (!answer.trim()) return;

        setAnswers([...answers, { prompt: currentPrompt, answer: answer.trim() }]);
        setAnswer('');

        if (currentIndex < prompts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowAnswers(true);
        }
    };

    const handleSkip = () => {
        if (currentIndex < prompts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (showAnswers) {
        return (
            <div className="space-y-4">
                <div className="text-center mb-6">
                    <span className="text-4xl block mb-2">📝</span>
                    <h3 className="text-white font-semibold">Your Love Story</h3>
                    <p className="text-white/50 text-sm">Look at all these beautiful thoughts! 💕</p>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {answers.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4"
                        >
                            <p className="text-rose-400 text-sm font-medium">{item.prompt}</p>
                            <p className="text-white mt-1">...{item.answer}</p>
                        </motion.div>
                    ))}
                </div>

                <button
                    onClick={() => {
                        setCurrentIndex(0);
                        setAnswers([]);
                        setShowAnswers(false);
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Complete the Sentence 📝</h3>
                <p className="text-white/50 text-sm">
                    Finish these thoughts about our love...
                </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentIndex / prompts.length) * 100}%` }}
                    />
                </div>
                <span className="text-white/50 text-xs">{currentIndex + 1}/{prompts.length}</span>
            </div>

            {/* Prompt Card */}
            <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 rounded-2xl p-6"
            >
                <p className="text-white text-lg font-medium mb-4">
                    {currentPrompt}
                </p>

                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="...write your answer here"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 resize-none focus:outline-none focus:border-rose-500/50"
                    rows={3}
                />
            </motion.div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleSkip}
                    className="py-3 rounded-xl bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                    Skip
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
