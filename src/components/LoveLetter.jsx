import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loveFacts } from '../data/gameData';

export default function LoveLetter() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFact, setCurrentFact] = useState(0);

  const openLetter = () => setIsOpen(true);
  const nextFact = () => setCurrentFact((prev) => (prev + 1) % loveFacts.length);

  return (
    <motion.div 
      className="bg-white/5 rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full">💌 Secret Love Letter</span>
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div 
            key="envelope"
            className="cursor-pointer"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={openLetter}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative w-48 h-32 mx-auto">
              {/* Envelope */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/40 to-purple-500/40 rounded-lg border border-white/20" />
              {/* Envelope flap */}
              <div 
                className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-pink-600/40 to-purple-600/40 rounded-t-lg border-b border-white/10"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
              {/* Seal */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-lg border-2 border-pink-300">
                💕
              </div>
            </div>
            <p className="text-white/50 text-xs text-center mt-4 animate-pulse">Tap to open your letter...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="letter"
            className="text-center"
            initial={{ opacity: 0, y: 30, rotateX: 90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10 mb-4">
              <span className="text-xs text-pink-400/80 block mb-3">✨ A Secret Just For You ✨</span>
              <motion.p 
                className="text-white/90 text-sm leading-relaxed"
                key={currentFact}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loveFacts[currentFact]}
              </motion.p>
              <div className="mt-4 text-xs text-pink-400/60 italic">
                ~ Your Forever Love 💕
              </div>
            </div>
            <button 
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-sm font-semibold active:scale-95 transition-transform"
              onClick={nextFact}
            >
              Reveal Another Secret 💫
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
