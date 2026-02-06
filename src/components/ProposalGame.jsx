import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse } from '../lib/tracking';

const conversations = [
    { question: "Tumhe padhne ka shouk hai?", yesResponse: "Mere saath nikaah padh lo..." },
    { question: "Tumhe likhne ka shouk hai?", yesResponse: "Apne naam ke saath mera naam likh lo..." },
    { question: "Tumhe dekhne ka shouk hai?", yesResponse: "Mere saath jawaani se budhapa dekh lo..." },
    { question: "Tumhe samajhne ka shouk hai?", yesResponse: "Mujhse behtar nahi milega, samajh lo..." },
    { question: "Tumhe sunne ka shouk hai?", yesResponse: "Meri dhadkan sun lo, tumhara naam leti hai..." },
    { question: "Tumhe jeene ka shouk hai?", yesResponse: "Mere saath jee lo, jannat ban jayegi..." },
    { question: "Tumhe chahne ka shouk hai?", yesResponse: "Mujhe chaho, main tumhe poori duniya dunga..." },
];

function TypewriterText({ text, onComplete }) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
                setDone(true);
                onCompleteRef.current?.();
            }
        }, 50);
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span>
            {displayed}
            {!done && <motion.span animate={{ opacity: [0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}
        </span>
    );
}

export default function ProposalGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResponse, setShowResponse] = useState(false);
    const [noAttempts, setNoAttempts] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [yesScale, setYesScale] = useState(1);
    const [noScale, setNoScale] = useState(1);
    const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
    const [shakeScreen, setShakeScreen] = useState(false);
    const [typingDone, setTypingDone] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const [confettiParticles] = useState(() =>
        Array.from({ length: 30 }, () => ({
            left: Math.random() * 100,
            x: (Math.random() - 0.5) * 200,
            duration: 2 + Math.random() * 2,
        })));

    const currentConvo = conversations[currentIndex];

    const resetScales = () => {
        setYesScale(1);
        setNoScale(1);
        setNoAttempts(0);
        setNoButtonPosition({ x: 0, y: 0 });
        setTypingDone(false);
    };

    const handleYes = () => {
        // Save the "Yes" response
        saveGameResponse({
            gameType: 'proposal',
            questionText: currentConvo.question,
            responseText: 'Haan! 💕',
            responseData: { answer: 'yes', questionIndex: currentIndex, noAttempts }
        });
        setShowResponse(true);
    };

    const handleNext = () => {
        if (currentIndex < conversations.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowResponse(false);
            resetScales();
        } else {
            setCompleted(true);
            setShowConfetti(true);
        }
    };

    const handleNo = () => {
        // Screen shake
        setShakeScreen(true);
        setTimeout(() => setShakeScreen(false), 500);

        setYesScale(prev => Math.min(prev + 0.2, 3));
        setNoScale(prev => Math.max(prev - 0.1, 0.4));

        const randomX = (Math.random() - 0.5) * 180;
        const randomY = (Math.random() - 0.5) * 120;
        setNoButtonPosition({ x: randomX, y: randomY });

        setNoAttempts(prev => prev + 1);
    };

    const getNoMessage = () => {
        const messages = [
            "Arre, galat button! 😤",
            "Yeh wala nahi, woh wala! 👈",
            "Naa matlab haan hi samjho! 😏",
            "Try again... choose wisely! 💕",
            "Haan bol do na please! 🥺",
            "Main nahi manunga! 😤❤️",
            "Itna bhi kya sochna! 💭",
            "Dil tod dogi kya? 💔",
            "Ruk jao, aankhen band karo, ab Haan bolo! 😌",
        ];
        return messages[noAttempts % messages.length];
    };

    if (completed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 relative"
            >
                {/* Confetti */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {confettiParticles.map((p, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${p.left}%`,
                                    backgroundColor: ['#ec4899', '#a855f7', '#ef4444', '#f59e0b', '#10b981'][i % 5],
                                }}
                                initial={{ y: -20, opacity: 1, rotate: 0 }}
                                animate={{
                                    y: 500,
                                    opacity: 0,
                                    rotate: 720,
                                    x: p.x
                                }}
                                transition={{
                                    duration: p.duration,
                                    delay: i * 0.05,
                                    repeat: 2,
                                    repeatDelay: 1
                                }}
                            />
                        ))}
                    </div>
                )}

                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl mb-6"
                >
                    💍❤️
                </motion.div>
                <h3 className="text-white font-script text-4xl mb-4">You Said Yes!</h3>
                <p className="text-white/70 leading-relaxed mb-4">
                    Ab toh pakka wala promise hai... <br />
                    Hamesha saath rahenge! 💕
                </p>
                <motion.p
                    className="text-rose-400 font-script text-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    I Love You Forever ❤️
                </motion.p>



                <button
                    onClick={() => {
                        setCurrentIndex(0);
                        setShowResponse(false);
                        setCompleted(false);
                        setShowConfetti(false);
                        resetScales();
                    }}
                    className="mt-6 px-6 py-3 rounded-xl bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    Play Again
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-6"
            animate={shakeScreen ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Answer Me... 💕</h3>
                <p className="text-white/50 text-sm">
                    {currentIndex + 1} of {conversations.length}
                </p>
            </div>

            {/* Progress */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + (showResponse ? 1 : 0)) / conversations.length) * 100}%` }}
                />
            </div>

            {/* Conversation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex + (showResponse ? '-response' : '')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                    {!showResponse ? (
                        <>
                            <div className="mb-6">
                                <p className="text-white text-lg">{currentConvo.question}</p>
                            </div>

                            <div className="h-6 mb-4 flex items-center justify-center">
                                {noAttempts > 0 && (
                                    <motion.p
                                        key={noAttempts}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-rose-400 text-sm font-medium"
                                    >
                                        {getNoMessage()}
                                    </motion.p>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-6 min-h-[100px] relative">
                                <motion.button
                                    animate={{ scale: yesScale }}
                                    whileHover={{ scale: yesScale * 1.05 }}
                                    whileTap={{ scale: yesScale * 0.95 }}
                                    onClick={handleYes}
                                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-colors whitespace-nowrap"
                                >
                                    Haan 💕
                                </motion.button>

                                <motion.button
                                    animate={{
                                        scale: noScale,
                                        x: noButtonPosition.x,
                                        y: noButtonPosition.y
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    whileHover={{ scale: noScale * 0.95 }}
                                    onClick={handleNo}
                                    className="px-8 py-4 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors whitespace-nowrap"
                                >
                                    Naa 😅
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center mb-2">
                                <p className="text-white/70">Haan... 💕</p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-red-500/30 rounded-2xl blur-xl" />

                                <div className="relative bg-gradient-to-br from-rose-500/40 to-red-600/40 border-2 border-rose-400/50 rounded-2xl p-6 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-3xl mb-3"
                                    >
                                        💍
                                    </motion.div>
                                    <p className="text-white text-xl font-semibold leading-relaxed min-h-[3rem]">
                                        <TypewriterText
                                            text={currentConvo.yesResponse}
                                            onComplete={() => setTypingDone(true)}
                                        />
                                    </p>
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="mt-3 text-2xl"
                                    >
                                        ❤️
                                    </motion.div>
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {typingDone && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={handleNext}
                                        className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-500/25 active:scale-[0.98] transition-transform"
                                    >
                                        {currentIndex < conversations.length - 1 ? "Next Question →" : "See Final Message 💕"}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
