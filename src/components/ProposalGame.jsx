import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// The romantic conversation flow
const conversations = [
    {
        question: "Tumhe padhne ka shouk hai?",
        yesResponse: "Mere saath nikaah padh lo...",
    },
    {
        question: "Tumhe likhne ka shouk hai?",
        yesResponse: "Apne naam ke saath mera naam likh lo...",
    },
    {
        question: "Tumhe dekhne ka shouk hai?",
        yesResponse: "Mere saath jawaani se budhapa dekh lo...",
    },
    {
        question: "Tumhe samajhne ka shouk hai?",
        yesResponse: "Mujhse behtar nahi milega, samajh lo...",
    },
];

export default function ProposalGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showResponse, setShowResponse] = useState(false);
    const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
    const [noAttempts, setNoAttempts] = useState(0);
    const [completed, setCompleted] = useState(false);

    const currentConvo = conversations[currentIndex];

    const handleYes = () => {
        setShowResponse(true);
        setNoAttempts(0);
        setNoButtonPosition({ x: 0, y: 0 });
    };

    const handleNext = () => {
        if (currentIndex < conversations.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowResponse(false);
        } else {
            setCompleted(true);
        }
    };

    const handleNo = () => {
        // Move the No button to random position
        const randomX = (Math.random() - 0.5) * 200;
        const randomY = (Math.random() - 0.5) * 100;
        setNoButtonPosition({ x: randomX, y: randomY });
        setNoAttempts(prev => prev + 1);
    };

    const getNoMessage = () => {
        const messages = [
            "Arre, galat button! 😤",
            "Yeh wala nahi, woh wala! 👉",
            "Naa matlab haan hi samjho! 😏",
            "Try again... choose wisely! 💕",
            "Haan bol do na please! 🥺",
            "Main nahi manunga! 😤❤️",
            "Itna bhi kya sochna! 💭",
        ];
        return messages[noAttempts % messages.length];
    };

    if (completed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl mb-6"
                >
                    💍❤️
                </motion.div>
                <h3 className="text-white font-script text-3xl mb-4">You Said Yes!</h3>
                <p className="text-white/70 leading-relaxed mb-4">
                    Ab toh pakka wala promise hai... <br />
                    Hamesha saath rahenge! 💕
                </p>
                <motion.p
                    className="text-rose-400 font-script text-xl"
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
                        setNoAttempts(0);
                        setNoButtonPosition({ x: 0, y: 0 });
                    }}
                    className="mt-8 px-6 py-3 rounded-xl bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                    Play Again
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Answer Me... 💕</h3>
                <p className="text-white/50 text-sm">
                    {currentIndex + 1} of {conversations.length}
                </p>
            </div>

            {/* Progress */}
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-red-500"
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
                            {/* Question */}
                            <div className="mb-6">
                                <p className="text-white text-lg">{currentConvo.question}</p>
                            </div>

                            {/* No attempts message */}
                            {noAttempts > 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-rose-400 text-sm text-center mb-4"
                                >
                                    {getNoMessage()}
                                </motion.p>
                            )}

                            {/* Choice buttons */}
                            <div className="flex items-center justify-center gap-6 min-h-[100px] relative">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleYes}
                                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg"
                                >
                                    Haan 💕
                                </motion.button>

                                <motion.button
                                    animate={{ x: noButtonPosition.x, y: noButtonPosition.y }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={handleNo}
                                    className="px-8 py-4 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                                >
                                    Naa 😅
                                </motion.button>
                            </div>
                        </>
                    ) : (
                        /* She said yes, show his HIGHLIGHTED response */
                        <div className="space-y-4">
                            {/* She replied */}
                            <div className="text-center mb-2">
                                <p className="text-white/70">Haan... 💕</p>
                            </div>

                            {/* HIS ROMANTIC RESPONSE - HIGHLIGHTED & PROMINENT */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="relative"
                            >
                                {/* Glowing background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/30 to-red-500/30 rounded-2xl blur-xl" />

                                {/* Main response card */}
                                <div className="relative bg-gradient-to-br from-rose-500/40 to-red-600/40 border-2 border-rose-400/50 rounded-2xl p-6 text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-3xl mb-3"
                                    >
                                        💍
                                    </motion.div>
                                    <p className="text-white text-xl font-semibold leading-relaxed">
                                        "{currentConvo.yesResponse}"
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

                            {/* NEXT BUTTON - SHE CLICKS MANUALLY */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                onClick={handleNext}
                                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-rose-500/25 transition-shadow"
                            >
                                {currentIndex < conversations.length - 1 ? "Next Question →" : "See Final Message 💕"}
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
