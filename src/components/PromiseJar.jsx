import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { promiseSlips } from '../data/gameData';

export default function PromiseJar() {
  const { claimedPromises, claimPromise, showRomanticToast } = useLoveContext();
  const [currentPromise, setCurrentPromise] = useState(null);
  const [isPicking, setIsPicking] = useState(false);

  const pickPromise = () => {
    if (isPicking) return;

    const available = promiseSlips.filter(p => !claimedPromises.includes(p.id));
    
    if (available.length === 0) {
      showRomanticToast('love');
      return;
    }

    setIsPicking(true);
    setCurrentPromise(null);

    setTimeout(() => {
      const random = available[Math.floor(Math.random() * available.length)];
      setCurrentPromise(random);
      showRomanticToast('promisePick');
      setIsPicking(false);
    }, 1500);
  };

  const handleClaim = () => {
    if (currentPromise) {
      claimPromise(currentPromise.id);
      setTimeout(() => setCurrentPromise(null), 500);
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">📜 Promise Jar</span>
        <p className="text-white/50 text-xs mb-1">Pick a promise from our special jar!</p>
        <span className="text-xs text-pink-400/60">Claimed: {claimedPromises.length} / {promiseSlips.length}</span>
      </div>

      {/* Jar */}
      <div 
        className="relative mx-auto w-40 cursor-pointer"
        onClick={pickPromise}
      >
        {/* Lid */}
        <div className="w-24 h-6 mx-auto bg-gradient-to-r from-pink-600 to-pink-500 rounded-t-lg border-2 border-pink-400/50" />
        
        {/* Jar Body */}
        <div className="relative w-full h-44 bg-white/10 rounded-b-3xl border-2 border-white/20 overflow-hidden">
          {/* Label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/20 px-3 py-1 rounded text-xs text-white/80">
            Promises 💕
          </div>
          
          {/* Papers */}
          <div className="absolute inset-0 top-10">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-4 bg-gradient-to-r from-pink-200 to-pink-100 rounded-sm shadow-sm"
                style={{
                  left: `${20 + (i % 3) * 25}%`,
                  top: `${20 + Math.floor(i / 3) * 35}%`,
                }}
                animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>

          {/* Picking animation */}
          {isPicking && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center text-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🤚✨
            </motion.div>
          )}
        </div>
        
        <p className="text-center text-xs text-white/40 mt-2 animate-pulse">
          {isPicking ? 'Picking...' : 'Tap to pick!'}
        </p>
      </div>

      {/* Picked Promise */}
      <AnimatePresence>
        {currentPromise && (
          <motion.div
            className="mt-4 p-4 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-400/30 text-center"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span className="text-3xl block mb-2">{currentPromise.icon}</span>
            <h3 className="text-pink-400 font-semibold text-sm mb-1">{currentPromise.title}</h3>
            <p className="text-white/70 text-xs mb-3">{currentPromise.promise}</p>
            <button
              className="px-5 py-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-xs font-semibold active:scale-95 transition-transform"
              onClick={handleClaim}
            >
              Claim Promise 💕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
