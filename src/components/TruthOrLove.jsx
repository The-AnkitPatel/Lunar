import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Truth or Love questions - intimate and fun
const truthQuestions = [
    "What's the first thing you noticed about me?",
    "What's your favorite memory of us so far?",
    "What moment made you realize you loved me?",
    "What's one thing about me that makes you smile?",
    "If you could describe our love in 3 words, what would they be?",
];

const loveActions = [
    { text: "Send me your cutest selfie right now 📸", subtext: "Send on WhatsApp" },
    { text: "Tell me 3 things you love about me" },
    { text: "Send me a voice note saying 'I love you'", subtext: "Send on WhatsApp" },
    { text: "It's been so long since we met... Describe the very first thing you want to do when we finally meet physically ❤️" },
    { text: "Send me the emoji that describes how you feel about me" },
];

export default function TruthOrLove() {
    const [mode, setMode] = useState(null); // 'truth' or 'love'
    const [truthIndex, setTruthIndex] = useState(0);
    const [loveIndex, setLoveIndex] = useState(0);
    const [response, setResponse] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);

    // Get current content
    const currentItem = mode === 'truth'
        ? truthQuestions[truthIndex]
        : loveActions[loveIndex];

    // Normalize content to object format
    const currentQuestion = typeof currentItem === 'string' ? currentItem : currentItem.text;
    const currentSubtext = typeof currentItem === 'object' ? currentItem.subtext : null;

    const currentIndex = mode === 'truth' ? truthIndex : loveIndex;
    const totalCount = mode === 'truth' ? truthQuestions.length : loveActions.length;

    const handlePick = (type) => {
        setMode(type);
        setResponse('');
        setIsCompleted(false);
    };

    const handleNext = () => {
        // Here you would save the response to Supabase or local storage
        console.log("Saving response:", response);

        if (currentIndex < totalCount - 1) {
            if (mode === 'truth') {
                setTruthIndex(prev => prev + 1);
            } else {
                setLoveIndex(prev => prev + 1);
            }
            setResponse('');
        } else {
            setIsCompleted(true);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            if (mode === 'truth') {
                setTruthIndex(prev => prev - 1);
            } else {
                setLoveIndex(prev => prev - 1);
            }
            setResponse(''); // Optional: could restore previous response if stored
        } else {
            setMode(null);
            setResponse('');
            setIsCompleted(false);
        }
    };

    const handleSwitchToLove = () => {
        setMode('love');
        setIsCompleted(false);
        setResponse('');
        // loveIndex is already 0
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
            {!mode ? (
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
                        key={isCompleted ? 'completed' : `${mode}-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {isCompleted ? (
                            <div className={`p-8 rounded-2xl border text-center ${mode === 'truth'
                                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-purple-500/30'
                                : 'bg-gradient-to-br from-rose-500/20 to-red-500/20 border-rose-500/30'
                                }`}>
                                <div className="text-5xl mb-6">{mode === 'truth' ? '🥰' : '❤️'}</div>
                                <h4 className="text-white text-xl font-bold mb-3">
                                    {mode === 'truth' ? "All Truths Revealed!" : "My Heart is Full!"}
                                </h4>
                                <p className="text-white/80 leading-relaxed mb-8">
                                    {mode === 'truth'
                                        ? "You've been so honest! Now... correct me if I'm wrong, but isn't it time to show some Love? 💕"
                                        : "You've shared so much love! You truly make me the happiest person alive. 🥰"}
                                </p>

                                {mode === 'truth' ? (
                                    <button
                                        onClick={handleSwitchToLove}
                                        className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform"
                                    >
                                        Play Love Mode Now! 💖
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setMode(null);
                                            setIsCompleted(false);
                                            // Optional: reset indices if you want them to restart
                                            setTruthIndex(0);
                                            setLoveIndex(0);
                                        }}
                                        className="w-full py-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    >
                                        Back to Menu
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Question Card */}
                                <div className={`p-6 rounded-2xl border ${mode === 'truth'
                                    ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-purple-500/30'
                                    : 'bg-gradient-to-br from-rose-500/20 to-red-500/20 border-rose-500/30'
                                    }`}>

                                    {/* Counter Badge */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-4xl">{mode === 'truth' ? '🤔' : '💕'}</span>
                                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs font-medium border border-white/5">
                                            {currentIndex + 1} / {totalCount}
                                        </span>
                                    </div>

                                    <div className="text-center mb-6">
                                        <p className="text-white text-lg leading-relaxed font-medium">
                                            {currentQuestion}
                                        </p>
                                        {currentSubtext === 'Send on WhatsApp' && (
                                            <div className="mt-4 flex justify-center">
                                                <div className="bg-green-400/10 text-green-400 px-4 py-2 rounded-full border border-green-400/20 flex items-center gap-2">
                                                    <span className="text-sm font-medium">{currentSubtext}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        {currentSubtext && currentSubtext !== 'Send on WhatsApp' && (
                                            <p className="text-green-400 text-sm mt-2 font-medium bg-green-400/10 inline-block px-3 py-1 rounded-full border border-green-400/20">
                                                {currentSubtext}
                                            </p>
                                        )}
                                    </div>

                                    {/* Response Input */}
                                    <div className="relative">
                                        <textarea
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            placeholder={currentSubtext === 'Send on WhatsApp' ? "Write 'Okay' if sent..." : "Write your answer here..."}
                                            className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-white/30 placeholder:text-white/20 resize-none text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleBack}
                                        className="py-3 rounded-xl bg-white/10 text-white/70 hover:text-white transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!response.trim()}
                                        className={`py-3 rounded-xl text-white font-medium transition-all ${!response.trim()
                                            ? 'opacity-50 cursor-not-allowed bg-gray-600'
                                            : mode === 'truth'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20'
                                                : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/20'
                                            }`}
                                    >
                                        {currentIndex < totalCount - 1 ? 'Next' : 'Finish'} {mode === 'truth' ? 'Truth' : 'Love'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}
