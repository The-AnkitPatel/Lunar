import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const dreams = [
    {
        id: 1,
        icon: "🏠",
        title: "Our Cozy Home",
        text: "A little house with warm lights, bookshelves everywhere, your coffee mug next to mine every morning... and maybe a fluffy dog waiting at the door when we come home.",
        color: "from-amber-500/20 to-orange-500/20",
        border: "border-amber-500/20"
    },
    {
        id: 2,
        icon: "✈️",
        title: "Travel Together",
        text: "Exploring the world hand in hand — Bhandardara, Dras Ladakh, Māwsynrām, Dudhsagar Waterfalls, Coastal Sri Lanka, Coorg. Every new place becomes special because you're there with me.",
        color: "from-blue-500/20 to-cyan-500/20",
        border: "border-blue-500/20"
    },
    {
        id: 3,
        icon: "🌅",
        title: "Morning Routine",
        text: "Waking up next to you, making chai together, arguing about who makes it better, sitting on the balcony watching the sunrise... these simple mornings are all I want.",
        color: "from-rose-500/20 to-pink-500/20",
        border: "border-rose-500/20"
    },
    {
        id: 4,
        icon: "🎵",
        title: "Music & Memories",
        text: "Building a vinyl collection together, slow dancing in the kitchen at midnight and in the rain, you singing off-key and me loving every note of it.",
        color: "from-purple-500/20 to-violet-500/20",
        border: "border-purple-500/20"
    },
    {
        id: 5,
        icon: "📚",
        title: "Growing Together",
        text: "Learning new things together, supporting each other's dreams, being each other's biggest fan. We don't just love each other — we grow together.",
        color: "from-green-500/20 to-emerald-500/20",
        border: "border-green-500/20"
    },
    {
        id: 6,
        icon: "💑",
        title: "No More Distance",
        text: "The day we finally close the distance — when goodnight texts become goodnight kisses. When the screen between us disappears forever. That day is coming.",
        color: "from-love-500/20 to-red-500/20",
        border: "border-love-500/20"
    },
];

// Hidden rose easter egg
const ROSE_CLICKS = 7;

export default function SecretGarden({ onClose }) {
    const [expandedId, setExpandedId] = useState(null);
    const [roseClicks, setRoseClicks] = useState(0);
    const [showRose, setShowRose] = useState(false);
    const [revealedDreams, setRevealedDreams] = useState([]);

    // Slowly reveal dreams one by one
    useEffect(() => {
        dreams.forEach((dream, i) => {
            setTimeout(() => {
                setRevealedDreams(prev => [...prev, dream.id]);
            }, (i + 1) * 600);
        });
    }, []);

    const handleRoseClick = () => {
        const newCount = roseClicks + 1;
        setRoseClicks(newCount);
        if (newCount >= ROSE_CLICKS) {
            setShowRose(true);
        }
    };

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Secret Garden 🌿</h3>
                <p className="text-white/40 text-xs">Our dreams, growing like flowers in a garden</p>
            </div>

            {/* Dreams Grid */}
            <div className="space-y-3">
                {dreams.map((dream) => {
                    const isRevealed = revealedDreams.includes(dream.id);
                    const isExpanded = expandedId === dream.id;

                    return (
                        <AnimatePresence key={dream.id}>
                            {isRevealed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                >
                                    <motion.button
                                        layout
                                        onClick={() => setExpandedId(isExpanded ? null : dream.id)}
                                        className={`w-full p-4 rounded-2xl border text-left transition-all bg-gradient-to-br ${dream.color} ${dream.border}`}
                                    >
                                        <motion.div layout="position" className="flex items-center gap-3 mb-1">
                                            <span className="text-2xl">{dream.icon}</span>
                                            <h4 className="text-white font-medium text-sm">{dream.title}</h4>
                                            <motion.span
                                                className="ml-auto text-white/30 text-xs"
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                            >
                                                ▼
                                            </motion.span>
                                        </motion.div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <WordByWordReveal text={dream.text} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    );
                })}
            </div>

            {/* Hidden Rose Easter Egg - subtle tap area */}
            <div className="text-center pt-2">
                <button
                    onClick={handleRoseClick}
                    className="text-white/10 text-xs hover:text-white/20 transition-colors"
                >
                    {roseClicks > 0 && roseClicks < ROSE_CLICKS
                        ? '🌱'.repeat(Math.min(roseClicks, 6))
                        : '·  ·  ·'
                    }
                </button>
            </div>

            {/* Rose Easter Egg Modal */}
            <AnimatePresence>
                {showRose && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6"
                        onClick={() => setShowRose(false)}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                            className="text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-8xl mb-6"
                            >
                                🌹
                            </motion.div>
                            <h3 className="text-white text-xl font-bold mb-2">You Found the Secret Rose! 🌹</h3>
                            <p className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto mb-2">
                                Just like this hidden rose, my love for you is always there — even when you can't see it.
                            </p>
                            <p className="text-love-300 text-sm font-medium mt-4">
                                I love you, always and forever 💕
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {onClose && (
                <button onClick={onClose} className="w-full py-3 rounded-xl bg-white/5 text-white/40 text-sm hover:text-white/60 transition-colors">
                    Close Garden
                </button>
            )}
        </div>
    );
}

// Word-by-word reveal component
function WordByWordReveal({ text }) {
    const [visibleWords, setVisibleWords] = useState(0);
    const words = text.split(' ');

    useEffect(() => {
        let i = 0;
        setVisibleWords(0);
        const timer = setInterval(() => {
            i++;
            if (i >= words.length) {
                clearInterval(timer);
                setVisibleWords(words.length);
            } else {
                setVisibleWords(i);
            }
        }, 80);
        return () => clearInterval(timer);
    }, [text, words.length]);

    return (
        <p className="text-white/70 text-sm leading-relaxed mt-3 pl-9">
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={i < visibleWords ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block mr-1"
                >
                    {word}
                </motion.span>
            ))}
        </p>
    );
}
