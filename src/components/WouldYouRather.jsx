import { useState } from 'react';
import { motion } from 'framer-motion';

// Would You Rather questions for couples
const questions = [
    {
        optionA: "Spend a whole day cuddling at home",
        optionB: "Go on an adventurous date outside",
    },
    {
        optionA: "Get a long love letter from me",
        optionB: "Get a surprise visit from me",
    },
    {
        optionA: "Watch the sunrise together",
        optionB: "Watch the stars together at night",
    },
    {
        optionA: "Have me cook for you (even if I'm bad)",
        optionB: "Go to a fancy restaurant together",
    },
    {
        optionA: "Slow dance in the rain",
        optionB: "Kiss under the fireworks",
    },
    {
        optionA: "Have 100 photos of us",
        optionB: "Have 1 perfect video of us",
    },
    {
        optionA: "Know what I'm thinking always",
        optionB: "Feel what I'm feeling always",
    },
    {
        optionA: "Never argue but also never make up",
        optionB: "Argue sometimes but have amazing makeups",
    },
    {
        optionA: "Get a handwritten poem from me",
        optionB: "Get a song dedicated to you",
    },
    {
        optionA: "Be with me on every birthday",
        optionB: "Be with me on every New Year's Eve",
    },
    {
        optionA: "Travel the world together but never settle",
        optionB: "Build a cozy home together and stay",
    },
    {
        optionA: "Wake up to my 'good morning' text every day",
        optionB: "Fall asleep to my 'good night' call every night",
    },
];

export default function WouldYouRather() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [choices, setChoices] = useState([]);
    const [selected, setSelected] = useState(null);

    const currentQuestion = questions[currentIndex];

    const handleSelect = (option) => {
        setSelected(option);
        setChoices([...choices, option]);

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setSelected(null);
            }
        }, 1000);
    };

    const isComplete = currentIndex === questions.length - 1 && selected !== null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Would You Rather? 💭</h3>
                <p className="text-white/50 text-sm">
                    Learn what your partner really wants...
                </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + (selected ? 1 : 0)) / questions.length) * 100}%` }}
                    />
                </div>
                <span className="text-white/50 text-xs">{currentIndex + 1}/{questions.length}</span>
            </div>

            {!isComplete ? (
                <div className="space-y-4">
                    {/* Option A */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect('A')}
                        disabled={selected !== null}
                        className={`w-full p-5 rounded-xl border text-left transition-all ${selected === 'A'
                                ? 'bg-gradient-to-r from-rose-500 to-red-600 border-rose-400 text-white'
                                : selected === 'B'
                                    ? 'bg-white/5 border-white/10 text-white/40'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="text-rose-400 text-sm font-medium">Option A</span>
                        <p className="mt-1 font-medium">{currentQuestion.optionA}</p>
                    </motion.button>

                    {/* VS */}
                    <div className="text-center">
                        <span className="text-white/30 text-sm font-bold">— OR —</span>
                    </div>

                    {/* Option B */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect('B')}
                        disabled={selected !== null}
                        className={`w-full p-5 rounded-xl border text-left transition-all ${selected === 'B'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 border-purple-400 text-white'
                                : selected === 'A'
                                    ? 'bg-white/5 border-white/10 text-white/40'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                            }`}
                    >
                        <span className="text-purple-400 text-sm font-medium">Option B</span>
                        <p className="mt-1 font-medium">{currentQuestion.optionB}</p>
                    </motion.button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                >
                    <span className="text-5xl block mb-4">💕</span>
                    <h3 className="text-white font-semibold text-lg mb-2">All Done!</h3>
                    <p className="text-white/60 text-sm mb-4">
                        Now compare answers with your partner and see how well you match!
                    </p>
                    <button
                        onClick={() => {
                            setCurrentIndex(0);
                            setChoices([]);
                            setSelected(null);
                        }}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium"
                    >
                        Play Again
                    </button>
                </motion.div>
            )}
        </div>
    );
}
