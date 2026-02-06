import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse } from '../lib/tracking';
import GameReviewSection from './GameReviewSection';

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

const difficulties = { 0: 'Easy', 1: 'Medium', 2: 'Deep', 3: 'Easy', 4: 'Deep' };
const difficultyColors = { 'Easy': 'text-green-400 bg-green-400/10 border-green-400/20', 'Medium': 'text-amber-400 bg-amber-400/10 border-amber-400/20', 'Deep': 'text-purple-400 bg-purple-400/10 border-purple-400/20' };

export default function TruthOrLove() {
    const [mode, setMode] = useState(null);
    const [truthIndex, setTruthIndex] = useState(0);
    const [loveIndex, setLoveIndex] = useState(0);
    const [response, setResponse] = useState('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isFlipping, setIsFlipping] = useState(false);
    const [cardRevealed, setCardRevealed] = useState(false);
    const [savedResponses, setSavedResponses] = useState([]);


    const currentItem = mode === 'truth' ? truthQuestions[truthIndex] : loveActions[loveIndex];
    const currentQuestion = typeof currentItem === 'string' ? currentItem : currentItem.text;
    const currentSubtext = typeof currentItem === 'object' ? currentItem.subtext : null;
    const currentIndex = mode === 'truth' ? truthIndex : loveIndex;
    const totalCount = mode === 'truth' ? truthQuestions.length : loveActions.length;
    const difficulty = mode === 'truth' ? (difficulties[truthIndex] || 'Easy') : 'Fun';



    const handlePick = (type) => {
        setIsFlipping(true);
        setTimeout(() => {
            setMode(type);
            setResponse('');
            setIsCompleted(false);
            setCardRevealed(false);
            // Card flip reveal
            setTimeout(() => {
                setCardRevealed(true);
                setIsFlipping(false);
            }, 300);
        }, 300);
    };

    const handleNext = async () => {
        // Save the response to database
        if (response.trim()) {
            const saved = await saveGameResponse({
                gameType: 'truth_or_love',
                questionText: currentQuestion,
                responseText: response.trim(),
                responseData: { mode, questionIndex: currentIndex }
            });
            if (saved) {
                setSavedResponses(prev => [...prev, {
                    id: saved.id,
                    question: currentQuestion,
                    answer: response.trim(),
                    responseData: { mode, questionIndex: currentIndex },
                }]);
            }
        }

        setCardRevealed(false);

        setTimeout(() => {
            if (currentIndex < totalCount - 1) {
                if (mode === 'truth') setTruthIndex(prev => prev + 1);
                else setLoveIndex(prev => prev + 1);
                setResponse('');
                setTimeout(() => setCardRevealed(true), 300);
            } else {
                setIsCompleted(true);
            }
        }, 200);
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            if (mode === 'truth') setTruthIndex(prev => prev - 1);
            else setLoveIndex(prev => prev - 1);
            setResponse('');
            setCardRevealed(true);
        } else {
            setMode(null);
            setResponse('');
            setIsCompleted(false);
            setCardRevealed(false);
        }
    };

    const handleRandom = () => {
        setCardRevealed(false);
        setTimeout(() => {
            const max = mode === 'truth' ? truthQuestions.length : loveActions.length;
            let newIdx;
            do { newIdx = Math.floor(Math.random() * max); } while (newIdx === currentIndex && max > 1);
            if (mode === 'truth') setTruthIndex(newIdx);
            else setLoveIndex(newIdx);
            setResponse('');
            setTimeout(() => setCardRevealed(true), 300);
        }, 200);
    };

    const handleSwitchToLove = () => {
        setMode('love');
        setIsCompleted(false);
        setResponse('');
        setCardRevealed(true);
    };

    const handleSwitchToTruth = () => {
        setMode('truth');
        setIsCompleted(false);
        setResponse('');
        setCardRevealed(true);
    };

    return (
        <div className="space-y-6 relative">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Truth or Love? 💕</h3>
                <p className="text-white/50 text-sm">Pick one and answer honestly... no hiding!</p>
            </div>

            {!mode ? (
                <motion.div
                    className="grid grid-cols-2 gap-4"
                    animate={isFlipping ? { rotateY: 90, opacity: 0 } : { rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePick('truth')}
                        className="py-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 border border-purple-400/30"
                    >
                        <span className="text-3xl block mb-2">🤔</span>
                        Truth
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePick('love')}
                        className="py-6 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-500/20 border border-rose-400/30"
                    >
                        <span className="text-3xl block mb-2">💕</span>
                        Love
                    </motion.button>
                </motion.div>
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
                                        ? "You've been so honest! Now... isn't it time to show some Love? 💕"
                                        : "You've shared so much love! You truly make me the happiest person alive. 🥰"}
                                </p>

                                {/* Review Section */}
                                {savedResponses.filter(r => r.responseData?.mode === mode).length > 0 && (
                                    <div className="mb-6 text-left">
                                        <GameReviewSection
                                            responses={savedResponses.filter(r => r.responseData?.mode === mode)}
                                            title={mode === 'truth' ? "Your Truths" : "Your Love Actions"}
                                            icon={mode === 'truth' ? '🤔' : '💕'}
                                            accentColor={mode === 'truth' ? 'purple' : 'rose'}
                                            onResponseUpdated={(idx, newAnswer) => {
                                                const modeResponses = savedResponses.filter(r => r.responseData?.mode === mode);
                                                const globalIdx = savedResponses.indexOf(modeResponses[idx]);
                                                setSavedResponses(prev => prev.map((r, i) => i === globalIdx ? { ...r, answer: newAnswer } : r));
                                            }}
                                        />
                                    </div>
                                )}

                                {mode === 'truth' ? (
                                    <button onClick={handleSwitchToLove} className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-transform">
                                        Play Love Mode Now! 💖
                                    </button>
                                ) : (
                                    <button onClick={handleSwitchToTruth} className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
                                        Play Truth Mode Now! 🤔
                                    </button>
                                )}
                                <button onClick={() => { setMode(null); setIsCompleted(false); setTruthIndex(0); setLoveIndex(0); }} className="w-full mt-3 py-4 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                                    Back to Menu
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Question Card with flip */}
                                <motion.div
                                    className={`p-6 rounded-2xl border ${mode === 'truth'
                                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-purple-500/30'
                                        : 'bg-gradient-to-br from-rose-500/20 to-red-500/20 border-rose-500/30'
                                        }`}
                                    initial={{ rotateY: 90 }}
                                    animate={{ rotateY: cardRevealed ? 0 : 90 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{mode === 'truth' ? '🤔' : '💕'}</span>
                                            {/* Difficulty Badge */}
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColors[difficulty] || 'text-pink-400 bg-pink-400/10 border-pink-400/20'}`}>
                                                {difficulty}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs border border-white/5">
                                                {currentIndex + 1}/{totalCount}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center mb-6">
                                        <p className="text-white text-lg leading-relaxed font-medium">{currentQuestion}</p>
                                        {currentSubtext === 'Send on WhatsApp' && (
                                            <div className="mt-4 flex justify-center">
                                                <div className="bg-green-400/10 text-green-400 px-4 py-2 rounded-full border border-green-400/20 flex items-center gap-2 text-sm font-medium">
                                                    {currentSubtext}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Response Input */}
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder={currentSubtext === 'Send on WhatsApp' ? "Write 'Done' if sent..." : "Write your answer here..."}
                                        className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-4 min-h-[80px] focus:outline-none focus:border-pink-500/50 placeholder:text-white/20 resize-none text-sm transition-colors"
                                    />

                                </motion.div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={handleBack} className="py-3 rounded-xl bg-white/10 text-white/70 hover:text-white transition-colors text-sm">
                                        ← Back
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!response.trim()}
                                        className={`py-3 rounded-xl text-white font-medium text-sm transition-all ${!response.trim()
                                            ? 'opacity-50 cursor-not-allowed bg-gray-600'
                                            : mode === 'truth'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-purple-500/20'
                                                : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/20'
                                            }`}
                                    >
                                        {currentIndex < totalCount - 1 ? 'Next →' : 'Finish'}
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
