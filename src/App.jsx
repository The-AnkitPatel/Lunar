import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoveProvider } from './context/LoveContext';
import { useLoveContext } from './hooks/useLoveContext';
import { cn } from './lib/utils';
import DayCard from './components/DayCard';
import LoveQuiz from './components/LoveQuiz';
import MemoryGame from './components/MemoryGame';
import SpinWheel from './components/SpinWheel';
import LoveLetter from './components/LoveLetter';
import RomanticToast from './components/RomanticToast';
import LoveCoupons from './components/LoveCoupons';
import PromiseJar from './components/PromiseJar';
import ScratchCard from './components/ScratchCard';
import SecretGarden from './components/SecretGarden';
import TruthOrLove from './components/TruthOrLove';
import WouldYouRather from './components/WouldYouRather';
import CompleteSentence from './components/CompleteSentence';
import ProposalGame from './components/ProposalGame';
import { valentinesDays } from './data/valentinesDays';

// All features unlocked - Each day has a unique game to bring you closer
const dayFeatures = [
  { day: 7, id: 'rose', name: 'Rose Day', icon: '🌹', component: 'truth', description: 'Truth or Love' },
  { day: 8, id: 'propose', name: 'Propose Day', icon: '💍', component: 'proposal', description: 'Say Haan!' },
  { day: 9, id: 'chocolate', name: 'Chocolate Day', icon: '🍫', component: 'rather', description: 'Would you rather' },
  { day: 10, id: 'teddy', name: 'Teddy Day', icon: '🧸', component: 'spin', description: 'Spinner Game' },
  { day: 11, id: 'promise', name: 'Promise Day', icon: '🤞', component: 'promises', description: 'Promise jar' },
  { day: 12, id: 'hug', name: 'Hug Day', icon: '🤗', component: 'coupons', description: 'Love coupons' },
  { day: 13, id: 'kiss', name: 'Kiss Day', icon: '😘', component: 'scratch', description: 'Scratch cards' },
  { day: 14, id: 'valentine', name: "Valentine's", icon: '❤️', component: 'letter', description: 'Love letter' }
];

function AppContent() {
  const { userName } = useLoveContext();
  const [activeFeature, setActiveFeature] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);
  const currentDayData = valentinesDays[selectedDayIndex];

  // Unlock secret after Feb 14th
  useEffect(() => {
    const now = new Date();
    const unlockDate = new Date(now.getFullYear(), 1, 15); // Feb 15
    // For testing, uncomment: setShowSecret(true);
    if (now >= unlockDate) {
      setShowSecret(true);
    }
  }, []);

  const renderFeatureContent = () => {
    if (!activeFeature) return null;

    switch (activeFeature.component) {
      case 'truth': return <TruthOrLove />;
      case 'proposal': return <ProposalGame />;
      case 'quiz': return <LoveQuiz />;
      case 'rather': return <WouldYouRather />;
      case 'complete': return <CompleteSentence />;
      case 'memory': return <MemoryGame />;
      case 'spin': return <SpinWheel />;
      case 'promises': return <PromiseJar />;
      case 'coupons': return <LoveCoupons />;
      case 'scratch': return <ScratchCard />;
      case 'letter': return <LoveLetter />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Toast */}
      <RomanticToast />

      {/* Main Content */}
      <main className="relative z-10 px-4 py-6 max-w-lg mx-auto pb-24">
        {/* Header */}
        <motion.header
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-script text-3xl sm:text-4xl bg-gradient-to-r from-rose-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
            💕 Happy Valentine's Week
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Welcome, {userName} ✨
          </p>
        </motion.header>

        {/* Day Navigation - Horizontal Scroll */}
        <motion.nav
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {dayFeatures.map((feature, index) => (
              <motion.button
                key={feature.id}
                onClick={() => {
                  setActiveFeature(feature);
                  setSelectedDayIndex(index);
                }}
                className={cn(
                  "flex-shrink-0 snap-start flex flex-col items-center gap-1 p-3 min-w-[72px] rounded-xl border transition-all duration-200 active:scale-95",
                  activeFeature?.id === feature.id
                    ? "bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 shadow-lg shadow-rose-500/25"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-[10px] text-white/50 font-medium">Feb {feature.day}</span>
                <span className="text-[9px] text-white/70 whitespace-nowrap">{feature.name}</span>
              </motion.button>
            ))}

            {/* SECRET GIFT ROW - Only visible after Valentine's Day */}
            {showSecret && (
              <motion.button
                onClick={() => setSecretOpen(true)}
                className={cn(
                  "flex-shrink-0 snap-start flex flex-col items-center gap-1 p-3 min-w-[72px] rounded-xl border transition-all duration-200 active:scale-95",
                  "bg-gradient-to-br from-rose-900/50 to-purple-900/50 border-rose-500/30 hover:border-rose-400"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-2xl">🤫</span>
                <span className="text-[10px] text-rose-300 font-medium">Secret</span>
                <span className="text-[9px] text-white/70 whitespace-nowrap">For You</span>
              </motion.button>
            )}
          </div>
        </motion.nav>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeFeature ? (
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ALWAYS SHOW THE MESSAGE CARD FIRST */}
              <DayCard dayData={currentDayData} />

              {/* Layout for Games/Interactive Content (Rendered BELOW the card) */}
              {activeFeature.component !== 'day' && (
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-2xl">{activeFeature.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-white font-semibold">{activeFeature.name} Activity</h2>
                      <p className="text-white/50 text-xs">{activeFeature.description}</p>
                    </div>
                  </div>

                  {renderFeatureContent()}
                </section>
              )}
            </motion.div>
          ) : (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Welcome Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center mb-4">
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  💕
                </motion.div>
                <h2 className="text-white text-lg font-semibold mb-2">Choose a Day</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  Each day of Valentine's week has something special.
                  Tap above to explore!
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <span className="text-2xl block mb-1">📅</span>
                  <span className="text-xl font-bold text-rose-400">{dayFeatures.length}</span>
                  <span className="text-white/50 text-xs block">Days</span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <span className="text-2xl block mb-1">💝</span>
                  <span className="text-xl font-bold text-rose-400">∞</span>
                  <span className="text-white/50 text-xs block">Love</span>
                </div>
              </div>

              {/* SECRET BUTTON - Only visible after Valentine's */}
              {showSecret && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSecretOpen(true)}
                  className="w-full mt-6 bg-gradient-to-r from-rose-900/50 to-red-900/50 border border-rose-500/30 p-4 rounded-xl flex items-center gap-4 group"
                >
                  <div className="bg-rose-500/20 p-3 rounded-full group-hover:bg-rose-500/30 transition-colors">
                    🤫
                  </div>
                  <div className="text-left">
                    <h3 className="text-rose-200 font-script text-xl">A Secret For You</h3>
                    <p className="text-white/40 text-xs">Tap to open...</p>
                  </div>
                </motion.button>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* SECRET GARDEN OVERLAY */}
        <AnimatePresence>
          {secretOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 overflow-y-auto"
            >
              <SecretGarden onClose={() => setSecretOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="font-handwriting text-white/70 text-2xl sm:text-3xl leading-relaxed tracking-wide">
            And if I were able to write my own destiny, I would simply write your name and break the pen.
          </p>
          <p className="text-rose-400/60 text-xs mt-2">— Forever Yours 💕</p>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <LoveProvider>
      <AppContent />
    </LoveProvider>
  );
}

export default App;
