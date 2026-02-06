import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const prompts = [
    { start: "The moment I knew I loved you was when...", hint: "Think about that one moment 💭" },
    { start: "When I miss you late at night, I...", hint: "LDR nights hit different 🌙" },
    { start: "If I could teleport to you right now, the first thing I'd do is...", hint: "Close your eyes and imagine 💕" },
    { start: "My favorite thing about your voice is...", hint: "Those late night calls... 📞" },
    { start: "You make me feel safe because...", hint: "That warm feeling 🤗" },
    { start: "The hardest part about distance is...", hint: "Be honest, it's okay 🥺" },
    { start: "When we finally close the distance, I want us to...", hint: "Dream together 🏡" },
    { start: "One thing I'll never forget about us is...", hint: "That special memory ✨" },
    { start: "If our love story was a movie, the title would be...", hint: "Make it creative! 🎬" },
    { start: "The song that reminds me of you is...", hint: "What's our song? 🎵" },
    { start: "I knew you were special when...", hint: "That first spark ⚡" },
    { start: "My promise to you for this year is...", hint: "From the heart 💖" },
];

export default function CompleteSentence() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState([]);
    const [showReview, setShowReview] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [typingIndex, setTypingIndex] = useState(0);
    const inputRef = useRef(null);

    const prompt = prompts[currentIndex];

    // Typewriter effect for prompt text
    useEffect(() => {
        const text = prompt.start;
        let cancelled = false;
        let i = 0;
        setTypingIndex(0);
        const timer = setInterval(() => {
            if (cancelled) return;
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                setTypingIndex(text.length);
            } else {
                setTypingIndex(i);
            }
        }, 30);
        return () => { cancelled = true; clearInterval(timer); };
    }, [currentIndex, prompt.start]);

    // Auto-focus input after typing
    useEffect(() => {
        if (typingIndex >= prompt.start.length && inputRef.current) {
            inputRef.current.focus();
        }
    }, [typingIndex, prompt.start.length]);

    const handleSubmit = () => {
        if (!answer.trim()) return;
        
        const newAnswers = [...answers, { prompt: prompt.start, answer: answer.trim() }];
        setAnswers(newAnswers);
        setAnswer('');
        
        if (currentIndex < prompts.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setShowReview(true);
            setReviewIndex(0);
        }
    };

    const handleSkip = () => {
        if (currentIndex < prompts.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setAnswer('');
        }
    };

    // Review slideshow auto-advance
    useEffect(() => {
        if (!showReview || answers.length === 0) return;
        const timer = setInterval(() => {
            setReviewIndex(prev => (prev + 1) % answers.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [showReview, answers.length]);

    if (showReview && answers.length > 0) {
        const item = answers[reviewIndex];
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h3 className="text-white font-semibold mb-1">Our Love Story 💝</h3>
                    <p className="text-white/40 text-xs">Your beautiful words</p>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={reviewIndex}
                        initial={{ opacity: 0, y: 30, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -30, rotateX: -20 }}
                        transition={{ duration: 0.6 }}
                        className="p-8 rounded-2xl bg-gradient-to-br from-love-500/10 to-purple-500/10 border border-love-500/20 text-center"
                    >
                        <p className="text-white/60 text-sm mb-4 italic">{item.prompt}</p>
                        <p className="text-white text-xl font-handwriting leading-relaxed">
                            {item.answer}
                        </p>
                        <div className="mt-6 text-white/30 text-xs">
                            {reviewIndex + 1} of {answers.length}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-1.5">
                    {answers.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setReviewIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                i === reviewIndex ? 'bg-love-400 w-6' : 'bg-white/20'
                            }`}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => { setReviewIndex(prev => (prev - 1 + answers.length) % answers.length); }}
                        className="py-3 rounded-xl bg-white/10 text-white/70 text-sm"
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={() => { setReviewIndex(prev => (prev + 1) % answers.length); }}
                        className="py-3 rounded-xl bg-white/10 text-white/70 text-sm"
                    >
                        Next →
                    </button>
                </div>

                <button
                    onClick={() => { setShowReview(false); setCurrentIndex(0); setAnswers([]); }}
                    className="w-full py-3 rounded-xl bg-white/5 text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Complete The Sentence ✍️</h3>
                <p className="text-white/40 text-xs">{currentIndex + 1} of {prompts.length}</p>
            </div>

            {/* Progress */}
            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-love-400 to-purple-500"
                    animate={{ width: `${((currentIndex + 1) / prompts.length) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="space-y-4"
                >
                    {/* Prompt Card with typewriter */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-love-500/10 to-purple-500/10 border border-love-500/20">
                        <p className="text-white text-lg leading-relaxed min-h-[56px]">
                            {prompt.start.slice(0, typingIndex)}
                            {typingIndex < prompt.start.length && (
                                <motion.span 
                                    animate={{ opacity: [1, 0] }} 
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="text-love-400"
                                >|</motion.span>
                            )}
                        </p>
                        
                        {typingIndex >= prompt.start.length && (
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-white/30 text-xs mt-3 italic"
                            >
                                💡 {prompt.hint}
                            </motion.p>
                        )}
                    </div>

                    {/* Answer Input with handwriting font */}
                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Write from your heart..."
                            className="w-full bg-black/20 text-white font-handwriting text-lg border border-white/10 rounded-xl p-4 min-h-[100px] focus:outline-none focus:border-love-500/50 placeholder:text-white/15 placeholder:font-sans placeholder:text-sm resize-none transition-colors"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                        />
                        {answer.length > 0 && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute bottom-3 right-3 text-white/20 text-xs"
                            >
                                {answer.length} chars
                            </motion.span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleSkip}
                            className="py-3 rounded-xl bg-white/5 text-white/40 hover:text-white/60 transition-colors text-sm border border-white/5"
                        >
                            Skip →
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!answer.trim()}
                            className={`py-3 rounded-xl text-white font-medium text-sm transition-all ${
                                !answer.trim()
                                    ? 'opacity-40 cursor-not-allowed bg-gray-600'
                                    : 'bg-gradient-to-r from-love-500 to-purple-600 shadow-lg shadow-love-500/20 active:scale-95'
                            }`}
                        >
                            Submit 💕
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
