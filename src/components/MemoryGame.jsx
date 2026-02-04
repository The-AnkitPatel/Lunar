import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { memoryCards } from '../data/gameData';
import { cn } from '../lib/utils';

// Generate initial shuffled cards
function shuffleCards() {
  const duplicated = [...memoryCards, ...memoryCards.map(c => ({ ...c, id: c.id + 10 }))];
  return duplicated.sort(() => Math.random() - 0.5);
}

export default function MemoryGame() {
  const [cards, setCards] = useState(() => shuffleCards());
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const { showRomanticToast, unlockAchievement, incrementStat } = useLoveContext();

  const initializeGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
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
        setMatched([...matched, cards[first].emoji]);
        setFlipped([]);
        showRomanticToast('celebrate');
        
        if (matched.length + 1 === memoryCards.length) {
          setTimeout(() => {
            setGameWon(true);
            incrementStat('gamesPlayed');
            unlockAchievement('memory_master');
            showRomanticToast('romantic');
          }, 500);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  if (gameWon) {
    return (
      <motion.div 
        className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div 
          className="text-4xl mb-3"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          🎉💕🎉
        </motion.div>
        <h2 className="font-script text-2xl text-pink-400 mb-2">You Found All Hearts!</h2>
        <p className="text-white/70 mb-2">Completed in <strong className="text-pink-400">{moves}</strong> moves</p>
        <p className="text-white/50 text-sm mb-4">
          Just like in life, we found each other among all the chaos! 💖
        </p>
        <button 
          className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-sm font-semibold active:scale-95 transition-transform"
          onClick={initializeGame}
        >
          Play Again 🔄
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white/5 rounded-2xl p-4 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full">🧠 Memory Match</span>
        <div className="flex gap-3 text-xs text-white/60">
          <span>Moves: <strong className="text-pink-400">{moves}</strong></span>
          <span>Matched: <strong className="text-pink-400">{matched.length}/{memoryCards.length}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.emoji);
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
                {/* Front */}
                <div 
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  💕
                </div>
                {/* Back */}
                <div 
                  className="absolute inset-0 rounded-xl bg-white/10 border border-pink-400/30 flex items-center justify-center text-2xl [transform:rotateY(180deg)]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {card.emoji}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button 
        className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 active:scale-[0.98] transition-transform"
        onClick={initializeGame}
      >
        Shuffle Cards 🔀
      </button>
    </motion.div>
  );
}
