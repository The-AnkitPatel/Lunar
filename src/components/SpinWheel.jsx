import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { wheelMessages } from '../data/gameData';

export default function SpinWheel() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const { showRomanticToast, unlockAchievement, incrementStat } = useLoveContext();

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);

    // 1. Pick a random winner index directly to ensure uniform distribution
    const segmentCount = wheelMessages.length;
    const winningIndex = Math.floor(Math.random() * segmentCount);

    // 2. Calculate the specific angle to land on this segment
    // Segment i is from [i*size, (i+1)*size]
    // We want the pointer (top, 0deg) to point to somewhere inside this segment.
    // Since wheel rotates clockwise, the angle at the top is (360 - rotation % 360).
    // So we want (360 - targetRotation) = angle in segment.

    const segmentAngle = 360 / segmentCount;
    // Add randomness within the segment (keep away from edges by 10%)
    const randomOffset = segmentAngle * 0.1 + Math.random() * (segmentAngle * 0.8);
    const targetAngleOnWheel = (winningIndex * segmentAngle) + randomOffset;

    // 3. Calculate rotation needed
    // We want: (rotation % 360) to be such that pointer is at targetAngleOnWheel
    // Pointer is static at 0. Wheel rotates R.
    // Point on wheel at Top is (360 - R % 360) % 360.
    // We want (360 - R % 360) % 360 = targetAngleOnWheel
    // => R % 360 = (360 - targetAngleOnWheel) % 360.

    const targetRotationMod = (360 - targetAngleOnWheel) % 360;
    const currentRotationMod = rotation % 360;

    let diff = targetRotationMod - currentRotationMod;
    if (diff < 0) diff += 360;

    // Add minimum 5 full spins (1800 degrees)
    const extraSpins = 5 * 360;
    const totalRotation = rotation + diff + extraSpins;

    setRotation(totalRotation);

    setTimeout(() => {
      setResult(wheelMessages[winningIndex]);
      setSpinning(false);

      showRomanticToast('celebrate');
      incrementStat('gamesPlayed');
      unlockAchievement('first_spin');
    }, 4000);
  };

  const segmentCount = wheelMessages.length;
  const segmentAngle = 360 / segmentCount;

  return (
    <motion.div
      className="bg-white/5 rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">🧸 Teddy Day Spinner</span>
        <p className="text-white/50 text-sm">Whatever comes, you have to do it! 😈</p>
      </div>

      <div className="relative mx-auto w-56 h-56 mb-4">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10 text-2xl text-pink-400 drop-shadow-lg">
          ▼
        </div>

        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-white/20 relative overflow-hidden shadow-xl"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            background: `conic-gradient(from 0deg, 
              #ec4899 0deg ${segmentAngle}deg, 
              #a855f7 ${segmentAngle}deg ${segmentAngle * 2}deg,
              #f472b6 ${segmentAngle * 2}deg ${segmentAngle * 3}deg,
              #8b5cf6 ${segmentAngle * 3}deg ${segmentAngle * 4}deg,
              #ec4899 ${segmentAngle * 4}deg ${segmentAngle * 5}deg,
              #a855f7 ${segmentAngle * 5}deg ${segmentAngle * 6}deg,
              #f472b6 ${segmentAngle * 6}deg ${segmentAngle * 7}deg,
              #8b5cf6 ${segmentAngle * 7}deg 360deg
            )`
          }}
        >
          {/* Center */}
          <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg border-2 border-white/30">
            💕
          </div>
        </motion.div>
      </div>

      <button
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-all"
        onClick={spinWheel}
        disabled={spinning}
      >
        {spinning ? '🎡 Spinning...' : '🎲 Spin Now!'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            className="mt-4 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl text-center border border-pink-400/30"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-3xl block mb-2">🎉</span>
            <h3 className="text-pink-400 font-semibold mb-1">You Won!</h3>
            <p className="text-white/80 text-sm">{result.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
