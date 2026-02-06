import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { saveGameResponse } from '../lib/tracking';
import { memoryCards } from '../data/gameData';
import { cn } from '../lib/utils';

function shuffleCards() {
  const duplicated = [...memoryCards, ...memoryCards.map(c => ({ ...c, id: c.id + 100 }))];
  return duplicated.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState(() => shuffleCards());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showMemory, setShowMemory] = useState(null);
  const [showComboEffect, setShowComboEffect] = useState(false);
  const { showRomanticToast, unlockAchievement, incrementStat } = useLoveContext();

  const [comboParticles] = useState(() =>
    Array.from({ length: 8 }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
    })));

  const initializeGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
    setCombo(0);
    setShowMemory(null);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].emoji)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].emoji === cards[second].emoji) {
        const newMatched = [...matched, cards[first].emoji];
        setMatched(newMatched);
        setFlipped([]);
        
        // Show memory tooltip
        const matchedCard = memoryCards.find(c => c.emoji === cards[first].emoji);
        if (matchedCard) {
          setShowMemory(matchedCard.memory);
          setTimeout(() => setShowMemory(null), 2500);
        }

        saveGameResponse({
            gameType: 'memory_game',
            questionText: `Matched pair: ${cards[first].emoji}`,
            responseText: matchedCard?.memory || 'Match found',
            responseData: { emoji: cards[first].emoji, matchNumber: newMatched.length, moves, combo: combo + 1 }
        });
        
        // Combo system
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        if (newCombo >= 2) {
          setShowComboEffect(true);
          setTimeout(() => setShowComboEffect(false), 1000);
          showRomanticToast('celebrate');
        } else {
          showRomanticToast('celebrate');
        }
        
        if (newMatched.length === memoryCards.length) {
          setTimeout(() => {
            setGameWon(true);
            incrementStat('gamesPlayed');
            unlockAchievement('memory_master');
            showRomanticToast('romantic');

            saveGameResponse({
                gameType: 'memory_game',
                questionText: 'Game completed!',
                responseText: `Completed in ${moves + 1} moves`,
                responseData: { totalMoves: moves + 1, totalPairs: memoryCards.length }
            });
          }, 500);
        }
      } else {
        setCombo(0);
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // Star rating based on moves
  const getStars = () => {
    const totalPairs = memoryCards.length;
    if (moves <= totalPairs + 2) return 3;
    if (moves <= totalPairs * 2) return 2;
    return 1;
  };

  if (gameWon) {
    const stars = getStars();
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Heart shape made of matched emojis */}
        <div className="mb-4">
          <motion.div 
            className="flex flex-wrap justify-center gap-2 max-w-[200px] mx-auto mb-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            {memoryCards.map((card, i) => (
              <motion.span 
                key={i} 
                className="text-2xl"
                variants={{
                  hidden: { opacity: 0, scale: 0, y: 20 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
              >
                {card.emoji}
              </motion.span>
            ))}
          </motion.div>
          
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3].map(star => (
              <motion.span 
                key={star}
                className={cn("text-2xl", star <= stars ? "" : "opacity-20")}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: star <= stars ? 1 : 0.2, scale: 1 }}
                transition={{ delay: 0.5 + star * 0.2 }}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </div>
        
        <h2 className="font-script text-2xl text-pink-400 mb-2">You Found All Our Memories!</h2>
        <p className="text-white/70 mb-1">Completed in <strong className="text-pink-400">{moves}</strong> moves</p>
        <p className="text-white/50 text-sm mb-4 leading-relaxed">
          Just like finding each other across all that distance — 
          our hearts always knew where to look. 💖
        </p>
        <button 
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-pink-500/25"
          onClick={initializeGame}
        >
          Play Again 🔄
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Combo hearts effect */}
      <AnimatePresence>
        {showComboEffect && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {comboParticles.map((p, i) => (
              <motion.span
                key={i}
                className="absolute text-xl"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  x: p.x,
                  y: p.y,
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
              >
                💕
              </motion.span>
            ))}
            <motion.div
              className="text-pink-400 font-bold text-lg bg-pink-500/20 px-4 py-1 rounded-full border border-pink-500/30 backdrop-blur-sm z-10"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              exit={{ scale: 0 }}
            >
              🔥 Combo x{combo}!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full">🧠 Memory Match</span>
        <div className="flex gap-3 text-xs text-white/60">
          <span>Moves: <strong className="text-pink-400">{moves}</strong></span>
          <span>Found: <strong className="text-pink-400">{matched.length}/{memoryCards.length}</strong></span>
          {combo >= 2 && (
            <motion.span 
              className="text-amber-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🔥 x{combo}
            </motion.span>
          )}
        </div>
      </div>

      {/* Memory reveal tooltip */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-400/30 text-center"
          >
            <p className="text-pink-200 text-xs italic">✨ {showMemory}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.emoji);
          const isMatched = matched.includes(card.emoji);
          return (
            <motion.div
              key={index}
              className="aspect-square cursor-pointer"
              onClick={() => handleCardClick(index)}
              whileTap={{ scale: 0.95 }}
            >
              <div className={cn(
                "w-full h-full relative transition-all duration-500",
                isFlipped && "[transform:rotateY(180deg)]"
              )}
              style={{ transformStyle: 'preserve-3d' }}>
                {/* Front (face down) - breathing glow */}
                <div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-2xl overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="relative z-10">💕</span>
                </div>
                {/* Back (face up) */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-xl border flex items-center justify-center text-2xl [transform:rotateY(180deg)]",
                    isMatched 
                      ? "bg-green-500/15 border-green-400/30" 
                      : "bg-white/10 border-pink-400/30"
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <motion.span
                    animate={isMatched ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {card.emoji}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button 
        className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 active:scale-[0.98] transition-transform hover:bg-white/10"
        onClick={initializeGame}
      >
        Shuffle & Restart 🔀
      </button>
    </motion.div>
  );
}
