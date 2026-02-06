import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { wheelMessages, wheelCategories } from '../data/gameData';

const segmentColors = [
  '#ec4899', '#a855f7', '#f472b6', '#8b5cf6',
  '#ec4899', '#a855f7', '#f472b6', '#8b5cf6'
];

export default function SpinWheel() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [spinCount, setSpinCount] = useState(() => {
    return parseInt(localStorage.getItem('spinCount') || '0');
  });

  // Load history from localStorage so user sees past results even after refresh
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('spinHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Ensure history is shown by default if limit passed
  const [showHistory, setShowHistory] = useState(() => {
    const count = parseInt(localStorage.getItem('spinCount') || '0');
    return count >= 3;
  });

  const { showRomanticToast, unlockAchievement, incrementStat } = useLoveContext();

  const filteredMessages = selectedCategory === 'all'
    ? wheelMessages
    : wheelMessages.filter(m => m.category === selectedCategory);

  const activeMessages = filteredMessages.length >= 4 ? filteredMessages : wheelMessages;

  const spinWheel = () => {
    if (spinning || spinCount >= 3) return;
    setSpinning(true);
    setResult(null);

    const segmentCount = activeMessages.length;
    let winningIndex;

    // Ensure we don't pick the same result twice in a row if possible
    let attempts = 0;
    do {
      winningIndex = Math.floor(Math.random() * segmentCount);
      attempts++;
    } while (
      attempts < 10 &&
      history.length > 0 &&
      activeMessages[winningIndex].text === history[0].text
    );

    const segmentAngle = 360 / segmentCount;
    const randomOffset = segmentAngle * 0.1 + Math.random() * (segmentAngle * 0.8);
    const targetAngleOnWheel = (winningIndex * segmentAngle) + randomOffset;
    const targetRotationMod = (360 - targetAngleOnWheel) % 360;
    const currentRotationMod = rotation % 360;

    let diff = targetRotationMod - currentRotationMod;
    if (diff < 0) diff += 360;

    const extraSpins = 5 * 360;
    const totalRotation = rotation + diff + extraSpins;

    setRotation(totalRotation);

    setTimeout(() => {
      const won = activeMessages[winningIndex];
      setResult(won);

      const newHistory = [won, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('spinHistory', JSON.stringify(newHistory));

      setSpinning(false);

      const newCount = spinCount + 1;
      setSpinCount(newCount);
      localStorage.setItem('spinCount', newCount.toString());

      if (newCount >= 3) {
        setShowHistory(true);
      }

      showRomanticToast('celebrate');
      incrementStat('gamesPlayed');
      unlockAchievement('first_spin');
    }, 4000);
  };

  const segmentCount = activeMessages.length;
  const segmentAngle = 360 / segmentCount;

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">🎡 Love Spinner</span>
        <p className="text-white/50 text-sm">Whatever comes, you <strong className="text-pink-400">have</strong> to do it! 😈</p>
      </div>

      {/* Category Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {wheelCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => !spinning && setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.id
              ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
              : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto w-60 h-60 mb-4">
        {/* Pointer - gem style */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-6 h-8 flex flex-col items-center">
            <div className="w-4 h-4 bg-gradient-to-b from-pink-400 to-rose-600 rotate-45 transform shadow-lg shadow-pink-500/50 border border-pink-300/50" />
            <div className="w-0.5 h-2 bg-pink-400/50" />
          </div>
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-white/20 relative overflow-hidden shadow-2xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            background: `conic-gradient(from 0deg, ${activeMessages.map((_, i) => {
              const color = segmentColors[i % segmentColors.length];
              const start = i * segmentAngle;
              const end = (i + 1) * segmentAngle;
              return `${color} ${start}deg ${end}deg`;
            }).join(', ')
              })`
          }}
        >
          {/* Segment labels */}
          {activeMessages.map((msg, i) => {
            const angle = i * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className="text-lg absolute"
                  style={{
                    transform: `translateY(-${60}px) rotate(0deg)`,
                  }}
                >
                  {msg.icon}
                </span>
              </div>
            );
          })}

          {/* Center button */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-white/30 z-10">
            <motion.span
              className="text-2xl"
              animate={spinning ? { rotate: 360 } : { scale: [1, 1.1, 1] }}
              transition={spinning ? { duration: 0.5, repeat: Infinity, ease: "linear" } : { duration: 2, repeat: Infinity }}
            >
              💕
            </motion.span>
          </div>
        </motion.div>

        {/* Tick marks around wheel */}
        {activeMessages.map((_, i) => {
          const angle = i * segmentAngle;
          return (
            <div
              key={i}
              className="absolute inset-0 flex items-start justify-center"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="w-0.5 h-3 bg-white/30 rounded-full" />
            </div>
          );
        })}
      </div>

      <button
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/20"
        onClick={spinWheel}
        disabled={spinning || spinCount >= 3}
      >
        {spinning ? (
          <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
            🎡 Spinning...
          </motion.span>
        ) : spinCount >= 3 ? (
          '🛑 Limit Reached! Complete your task now! 💕'
        ) : (
          `🎲 Spin Now! (${3 - spinCount} left)`
        )}
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-4 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl text-center border border-pink-400/30 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-3xl block mb-2 relative z-10">{result.icon}</span>
            <h3 className="text-pink-400 font-semibold mb-1 relative z-10">Your Challenge!</h3>
            <p className="text-white/80 text-sm relative z-10">{result.text}</p>
            <p className="text-white/40 text-xs mt-2 relative z-10">⏰ You have 30 minutes to complete this!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-white/40 hover:text-white/60 transition-colors w-full text-center"
          >
            {showHistory ? 'Hide' : 'Show'} history ({history.length}) {showHistory ? '▲' : '▼'}
          </button>
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 mt-2">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg text-xs">
                      <span>{item.icon}</span>
                      <span className="text-white/60 truncate">{item.text}</span>
                      {i === 0 && <span className="text-pink-400 text-[10px] ml-auto flex-shrink-0">Latest</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
