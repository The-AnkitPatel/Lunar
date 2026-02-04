import { useState } from 'react';
import { motion } from 'framer-motion';

// Raw feelings - no filters, just pure love (English only)
const loveNotes = [
    "If dreaming is the only way to be with you, I never want to wake up.",
    "Not born from the same blood, yet chosen by the heart for a lifetime.",
    "I wish you'd just hold me tight and say 'Why are you scared? I'm yours, you fool.'",
    "The day we started talking, I wonder if the stars looked down and thought 'Finally, they met.'",
    "To my hardworking girl — stay safe every day. I love you. ❤️",
    "I don't know where life is taking us, but as long as you're with me, I don't care.",
    "Your laugh is the most beautiful sound in my entire world.",
    "Every love song I hear, every romantic scene I watch... it's always your face I see.",
    "Sometimes I love you so much that tears just come to my eyes.",
    "You are both my weakness and my strength.",
];

// Dreams - moments I'm dying to live with you
const futureMemories = [
    { text: "The moment I finally hold your hand ✨", icon: "🤝" },
    { text: "Hugging you so tight you can't breathe", icon: "🤗" },
    { text: "Sitting under the stars at night, saying nothing, just being together", icon: "🌙" },
    { text: "Hearing your laugh in person for the first time... my heart is racing just thinking about it", icon: "😊" },
    { text: "Watching the sunset with you, holding hands", icon: "🌅" },
    { text: "The moment I realize 'wow, you're actually in front of me' — I might cry", icon: "💓" },
    { text: "Our first photo together — I'll frame it and keep it forever", icon: "📸" },
    { text: "Not saying anything, just looking at you and thanking God", icon: "💕" },
];

export default function SecretGarden({ onClose }) {
    const [activeTab, setActiveTab] = useState('letter');

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 py-8 px-4">
            <div className="max-w-md mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="text-6xl mb-4"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        🌹
                    </motion.div>
                    <h1 className="font-script text-4xl text-rose-300 mb-2">What's In My Heart</h1>
                    <p className="text-white/50 text-sm italic">
                        "Things I've never told anyone..."
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl">
                    {[
                        { id: 'letter', label: '💌 Love Letter' },
                        { id: 'notes', label: '📝 Feelings' },
                        { id: 'gallery', label: '✨ Dreams' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 px-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg'
                                    : 'text-white/60 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >

                    {/* LOVE LETTER TAB */}
                    {activeTab === 'letter' && (
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-4xl opacity-20">💕</div>

                            <p className="font-script text-rose-400 text-2xl mb-6">My Dearest Love,</p>

                            <div className="space-y-4 text-white/85 leading-relaxed">
                                <p>
                                    I've written and erased this letter so many times... but today I'm finally writing it.
                                </p>
                                <p>
                                    You came into my life when I wasn't even looking. And now that you're here, I wonder — how did I even live before? I smile at my phone like an idiot reading your messages, my heart races when I see your name pop up. I've gone completely crazy in love with you.
                                </p>
                                <p>
                                    I'm not perfect. I forget things, I get awkward, and sometimes I can't find the right words. But what I feel for you? That's real. Completely real.
                                </p>
                                <p>
                                    You're not just my girlfriend. You're my best friend, my safe space, my 2 AM thought, and the first person I want to share everything with.
                                </p>
                                <p>
                                    Your laugh... nothing is more precious to me. I just want to hear it forever. And I want to be the reason behind that laugh.
                                </p>
                                <p>
                                    I love you. I love you so much that sometimes it makes me cry. There are no words that can explain it... it's just you. Always you.
                                </p>
                            </div>

                            <div className="mt-8 text-right">
                                <p className="font-script text-rose-300 text-xl">Forever & Always,</p>
                                <p className="font-script text-rose-400 text-2xl mt-2">Only Yours ❤️</p>
                            </div>
                        </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <p className="text-white/40 text-sm text-center mb-6 italic">
                                The words my heart never said out loud...
                            </p>
                            {loveNotes.map((note, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl relative overflow-hidden group hover:bg-white/10 transition-colors"
                                >
                                    <div className="absolute -right-2 -top-2 text-5xl text-rose-500/5 group-hover:text-rose-500/10 transition-colors font-serif">
                                        "
                                    </div>
                                    <p className="text-white/90 leading-relaxed font-light relative z-10">
                                        {note}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* DREAMS TAB */}
                    {activeTab === 'gallery' && (
                        <div className="space-y-4">
                            <p className="text-white/40 text-sm text-center mb-6 italic">
                                Moments I'm dying to live with you... 💭
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {futureMemories.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="aspect-square rounded-xl bg-gradient-to-br from-rose-500/10 to-purple-500/10 border border-white/10 flex flex-col items-center justify-center p-4 text-center hover:bg-white/10 transition-colors"
                                    >
                                        <span className="text-3xl mb-2">{item.icon}</span>
                                        <p className="text-white/70 text-xs leading-relaxed">{item.text}</p>
                                    </motion.div>
                                ))}
                            </div>
                            <p className="text-white/30 text-xs text-center mt-6 italic">
                                Soon, my love... soon. And then everything will come true. 💕
                            </p>
                        </div>
                    )}

                </motion.div>

                {/* Close Button */}
                {onClose && (
                    <motion.button
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="w-full mt-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        ← Go Back
                    </motion.button>
                )}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-white/30 text-xs">
                        This garden will always grow... just like my love for you.
                    </p>
                    <div className="text-2xl mt-4 animate-bounce">❤️</div>
                </div>

            </div>
        </div>
    );
}
