import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoveProvider } from './context/LoveContext';
import { AuthProvider } from './context/AuthProvider';
import { useLoveContext } from './hooks/useLoveContext';
import { useAuth } from './hooks/useAuth';
import { cn } from './lib/utils';
import AuthPage from './components/AuthPage';
import DayCard from './components/DayCard';
import RomanticToast from './components/RomanticToast';
import LockTimerModal from './components/LockTimerModal';
import { valentinesDays } from './data/valentinesDays';

// Lazy load game components for faster initial load
const LoveQuiz = lazy(() => import('./components/LoveQuiz'));
const MemoryGame = lazy(() => import('./components/MemoryGame'));
const SpinWheel = lazy(() => import('./components/SpinWheel'));
const LoveLetter = lazy(() => import('./components/LoveLetter'));
const LoveCoupons = lazy(() => import('./components/LoveCoupons'));
const PromiseJar = lazy(() => import('./components/PromiseJar'));
const ScratchCard = lazy(() => import('./components/ScratchCard'));
const SecretGarden = lazy(() => import('./components/SecretGarden'));
const TruthOrLove = lazy(() => import('./components/TruthOrLove'));
const WouldYouRather = lazy(() => import('./components/WouldYouRather'));
const CompleteSentence = lazy(() => import('./components/CompleteSentence'));
const ProposalGame = lazy(() => import('./components/ProposalGame'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const LoveMap = lazy(() => import('./components/LoveMap'));
const DreamDatePlanner = lazy(() => import('./components/DreamDatePlanner'));

// Loading spinner for lazy components
function GameLoader() {
    return (
        <div className="flex items-center justify-center py-12">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full"
            />
        </div>
    );
}

// All features unlocked - Each day has a unique game to bring you closer
const dayFeatures = [
  { day: 7, id: 'rose', name: 'Rose Day', icon: '🌹', component: 'truth', description: 'Truth or Love', lockedMessage: "Sabra ka fal gulab se bhi khubsurat hota hai... wait for it! 🌹" },
  { day: 8, id: 'propose', name: 'Propose Day', icon: '💍', component: 'proposal', description: 'Say Haan!', lockedMessage: "Dil ki baat bolne ke liye thoda intezaar toh banta hai... 😉" },
  { day: 9, id: 'chocolate', name: 'Chocolate Day', icon: '🍫', component: 'rather', description: 'Would you rather', lockedMessage: "Mithaas aane wali hai... bas thoda sabar aur! 🍫" },
  { day: 10, id: 'teddy', name: 'Teddy Day', icon: '🧸', component: 'spin', description: 'Spinner Game', lockedMessage: "Jhaphi (Hugs) ke liye thoda wait karo ji... 🧸" },
  { day: 11, id: 'promise', name: 'Promise Day', icon: '🤞', component: 'promises', description: 'Promise jar', lockedMessage: "Wada raha, yeh intezaar worth it hoga! 🤞" },
  { day: 12, id: 'hug', name: 'Hug Day', icon: '🤗', component: 'coupons', description: 'Love coupons', lockedMessage: "Baahon mein bharne ke liye bas kuch hi pal... 🤗" },
  { day: 13, id: 'kiss', name: 'Kiss Day', icon: '😘', component: 'scratch', description: 'Scratch cards', lockedMessage: "Pyaar ki mohar lagne wali hai... sabar rakho! 😘" },
  { day: 14, id: 'valentine', name: "Valentine's", icon: '❤️', component: 'letter', description: 'Love letter', lockedMessage: "Sabse khaas din ke liye sabse khaas intezaar... ❤️" }
];

// Bonus games available anytime
const bonusFeatures = [
  { id: 'quiz', name: 'Love Quiz', icon: '🧠', component: 'quiz', description: 'How well do you know me?' },
  { id: 'memory', name: 'Memory Game', icon: '🃏', component: 'memory', description: 'Match our memories' },
  { id: 'lovemap', name: 'Love Map', icon: '🗺️', component: 'lovemap', description: 'Our story on a map' },
  { id: 'dreamdate', name: 'Dream Date', icon: '🌹', component: 'dreamdate', description: 'Plan our perfect date' },
];

import { useVisitTracker } from './hooks/useVisitTracker';
import { trackFeatureOpen, trackFeatureClose } from './lib/tracking';

function AppContent() {
  useVisitTracker();
  const { userName } = useLoveContext();
  const { profile, isAdmin, isGf, signOut: handleSignOut } = useAuth();
  const [activeFeature, setActiveFeature] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [secretOpen, setSecretOpen] = useState(false);

  // Track feature opens/closes
  const handleSetActiveFeature = (feature) => {
    if (activeFeature && activeFeature.id !== feature?.id) {
      trackFeatureClose(activeFeature.component || activeFeature.id);
    }
    if (feature) {
      trackFeatureOpen(feature.component || feature.id);
    }
    setActiveFeature(feature);
  };

  // Lock Timer State
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedDayInfo, setLockedDayInfo] = useState({ name: '', unlockDate: new Date(), message: '' });

  // Admin Dashboard State
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const currentDayData = valentinesDays[selectedDayIndex];

  // Check if a day is unlocked for the current user
  // Admin: everything unlocked. GF: only if today's date >= that day's date
  const isDayUnlocked = (dayNum) => {
    if (isAdmin) return true;
    const now = new Date();
    const year = now.getFullYear();
    // dayNum is the Feb date (7-14)
    const unlockDate = new Date(year, 1, dayNum); // Feb = month 1
    unlockDate.setHours(0, 0, 0, 0);
    return now >= unlockDate;
  };

  // Unlock secret after Feb 14th or if Admin
  useEffect(() => {
    if (isAdmin) {
      setShowSecret(true);
      return;
    }
    const now = new Date();
    const unlockDate = new Date(now.getFullYear(), 1, 15); // Feb 15
    // For testing, uncomment: setShowSecret(true);
    if (now >= unlockDate) {
      setShowSecret(true);
    }
  }, [isAdmin]);

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
      case 'lovemap': return <LoveMap />;
      case 'dreamdate': return <DreamDatePlanner />;
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
            Welcome, {profile?.display_name || userName} ✨
          </p>
          {isAdmin && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <span className="inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                👑 Admin
              </span>
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors"
              >
                Open Dashboard 📊
              </button>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="block mx-auto mt-2 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            Sign Out
          </button>
        </motion.header>

        {/* Admin Dashboard */}
        <AnimatePresence>
          {showAdminDashboard && (
            <Suspense fallback={<GameLoader />}>
              <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
            </Suspense>
          )}
        </AnimatePresence>

        {/* Day Navigation - Horizontal Scroll */}
        <motion.nav
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {dayFeatures.map((feature, index) => {
              const unlocked = isDayUnlocked(feature.day);
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => {
                    if (!unlocked) {
                      const now = new Date();
                      const year = now.getFullYear();
                      const unlockDate = new Date(year, 1, feature.day); // Feb is month 1
                      unlockDate.setHours(0, 0, 0, 0);

                      setLockedDayInfo({
                        name: feature.name,
                        unlockDate: unlockDate,
                        message: feature.lockedMessage // Pass custom message
                      });
                      setShowLockModal(true);
                      return;
                    }
                    handleSetActiveFeature(feature);
                    setSelectedDayIndex(index);
                  }}
                  disabled={false} // Enable click for locked days
                  className={cn(
                    "flex-shrink-0 snap-start flex flex-col items-center gap-1 p-3 min-w-[72px] rounded-xl border transition-all duration-200",
                    !unlocked
                      ? "bg-white/[0.02] border-white/5 opacity-70" // Increased opacity
                      : activeFeature?.id === feature.id
                        ? "bg-gradient-to-br from-rose-500 to-red-600 border-rose-400 shadow-lg shadow-rose-500/25"
                        : "bg-white/5 border-white/10 hover:bg-white/10 active:scale-95"
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <span className="text-2xl">{unlocked ? feature.icon : '🔒'}</span>
                  <span className="text-[10px] text-white/50 font-medium">Feb {feature.day}</span>
                  <span className="text-[9px] text-white/70 whitespace-nowrap">
                    {unlocked ? feature.name : 'Locked'}
                  </span>
                </motion.button>
              );
            })}

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

        {/* Bonus Games Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/30 text-xs font-medium mb-2 px-1">✨ Bonus Games</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {bonusFeatures.map((feature, index) => (
              <motion.button
                key={feature.id}
                onClick={() => {
                  handleSetActiveFeature(feature);
                  setSelectedDayIndex(0);
                }}
                className={cn(
                  "flex-shrink-0 snap-start flex flex-col items-center gap-1 p-3 min-w-[72px] rounded-xl border transition-all duration-200 active:scale-95",
                  activeFeature?.id === feature.id
                    ? "bg-gradient-to-br from-purple-500 to-indigo-600 border-purple-400 shadow-lg shadow-purple-500/25"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.03 }}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-[9px] text-white/70 whitespace-nowrap">{feature.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

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
              {/* SHOW DAY CARD ONLY FOR VALENTINE WEEK FEATURES */}
              {dayFeatures.some(f => f.id === activeFeature.id) && (
                <DayCard dayData={currentDayData} />
              )}

              {/* Layout for Games/Interactive Content */}
              {activeFeature.component !== 'day' && (
                <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-2xl">{activeFeature.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-white font-semibold">{activeFeature.name} Activity</h2>
                      <p className="text-white/50 text-xs">{activeFeature.description}</p>
                    </div>
                  </div>

                  <Suspense fallback={<GameLoader />}>
                    {renderFeatureContent()}
                  </Suspense>
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
              className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 p-4 pt-8"
            >
              <SecretGarden onClose={() => setSecretOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lock Timer Modal */}
        <AnimatePresence>
            {showLockModal && (
                <LockTimerModal 
                    unlockDate={lockedDayInfo.unlockDate} 
                    dayName={lockedDayInfo.name}
                    message={lockedDayInfo.message}
                    onClose={() => setShowLockModal(false)} 
                />
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

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💕
          </motion.div>
          <p className="text-white/40 text-sm">Loading our love story...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => { }} />;
  }

  return (
    <LoveProvider>
      <AppContent />
    </LoveProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
