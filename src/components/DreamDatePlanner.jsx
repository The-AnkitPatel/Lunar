import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dreamDateOptions, dreamDateResponses } from '../data/gameData';

const steps = ['location', 'activity', 'food', 'time'];
const stepLabels = {
    location: { title: 'Where?', subtitle: 'Pick our perfect spot', icon: '📍' },
    activity: { title: 'What?', subtitle: 'What should we do?', icon: '🎯' },
    food: { title: 'Eat?', subtitle: 'What sounds yummy?', icon: '🍽️' },
    time: { title: 'When?', subtitle: 'Pick the vibe', icon: '🕐' },
};

export default function DreamDatePlanner() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({});
    const [showResult, setShowResult] = useState(false);

    const step = steps[currentStep];
    const options = dreamDateOptions[step + 's'] || [];

    const handleSelect = (option) => {
        const newSelections = { ...selections, [step]: option };
        setSelections(newSelections);

        setTimeout(() => {
            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                setShowResult(true);
            }
        }, 300);
    };

    const [responseIdx] = useState(() => Math.floor(Math.random() * dreamDateResponses.length));
    const response = showResult ? dreamDateResponses[responseIdx] : '';

    const resetPlanner = () => {
        setCurrentStep(0);
        setSelections({});
        setShowResult(false);
    };

    if (showResult) {
        const loc = selections.location;
        const act = selections.activity;
        const food = selections.food;
        const time = selections.time;
        
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5"
            >
                <div className="text-center">
                    <h3 className="text-white font-semibold mb-1">Our Dream Date 💝</h3>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-love-500/15 to-purple-500/15 border border-love-500/20 text-center space-y-4">
                    {/* Date Summary Card */}
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                            <span className="text-2xl">{loc?.icon}</span>
                            <p className="text-white text-sm font-medium mt-1">{loc?.label}</p>
                            <p className="text-white/30 text-[10px]">{loc?.vibe}</p>
                        </motion.div>

                        <div className="grid grid-cols-3 gap-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-2 rounded-xl bg-white/5 border border-white/10"
                            >
                                <span className="text-lg">{act?.icon}</span>
                                <p className="text-white/60 text-[10px] mt-0.5">{act?.label}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="p-2 rounded-xl bg-white/5 border border-white/10"
                            >
                                <span className="text-lg">{food?.icon}</span>
                                <p className="text-white/60 text-[10px] mt-0.5">{food?.label}</p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="p-2 rounded-xl bg-white/5 border border-white/10"
                            >
                                <span className="text-lg">{time?.icon}</span>
                                <p className="text-white/60 text-[10px] mt-0.5">{time?.label}</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Generated Description */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 rounded-xl bg-love-500/10 border border-love-500/20"
                    >
                        <p className="text-white/80 leading-relaxed italic font-handwriting text-lg">
                            "Imagine us at the {loc?.label.toLowerCase()} during {time?.label.toLowerCase()}, 
                            spending our time {act?.label.toLowerCase()}, and enjoying {food?.label.toLowerCase()} together... 
                            That's my idea of paradise."
                        </p>
                    </motion.div>

                    {/* AI-like response */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-love-300 text-sm"
                    >
                        {response}
                    </motion.p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={resetPlanner}
                        className="py-3 rounded-xl bg-white/10 text-white/60 text-sm"
                    >
                        Plan Another
                    </button>
                    <button
                        onClick={() => {
                            const text = `Our Dream Date 💝\n📍 ${loc?.label}\n🎯 ${act?.label}\n🍽️ ${food?.label}\n🕐 ${time?.label}\n\nPlan this for us? 💕`;
                            navigator.clipboard?.writeText(text);
                        }}
                        className="py-3 rounded-xl bg-gradient-to-r from-love-500 to-purple-600 text-white text-sm font-medium shadow-lg"
                    >
                        Copy & Share 📋
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Dream Date Planner 🌹</h3>
                <p className="text-white/40 text-xs">Plan our perfect date together</p>
            </div>

            {/* Step Progress */}
            <div className="flex items-center justify-center gap-2">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <motion.div
                            animate={{
                                scale: i === currentStep ? 1.1 : 1,
                                backgroundColor: i < currentStep 
                                    ? 'rgba(244,114,182,0.3)' 
                                    : i === currentStep 
                                        ? 'rgba(244,114,182,0.2)' 
                                        : 'rgba(255,255,255,0.05)'
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10"
                        >
                            {i < currentStep ? '✓' : stepLabels[s].icon}
                        </motion.div>
                        {i < steps.length - 1 && <div className="w-4 h-px bg-white/10" />}
                    </div>
                ))}
            </div>

            {/* Selected so far */}
            {Object.keys(selections).length > 0 && (
                <div className="flex gap-2 justify-center">
                    {Object.entries(selections).map(([key, val]) => (
                        <div key={key} className="px-2 py-1 rounded-lg bg-love-500/10 border border-love-500/20 text-xs text-love-300/80">
                            {val.icon} {val.label}
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="space-y-3"
                >
                    {/* Step Title */}
                    <div className="text-center">
                        <p className="text-white text-lg font-medium">{stepLabels[step].icon} {stepLabels[step].title}</p>
                        <p className="text-white/40 text-xs">{stepLabels[step].subtitle}</p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {options.map((option, i) => (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSelect(option)}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-center"
                            >
                                <span className="text-2xl block mb-1">{option.icon}</span>
                                <p className="text-white text-sm font-medium">{option.label}</p>
                                <p className="text-white/30 text-[10px] mt-0.5">{option.vibe}</p>
                            </motion.button>
                        ))}
                    </div>

                    {/* Back button */}
                    {currentStep > 0 && (
                        <button
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="w-full py-2 rounded-xl bg-white/5 text-white/40 text-sm hover:text-white/60 transition-colors"
                        >
                            ← Go Back
                        </button>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
