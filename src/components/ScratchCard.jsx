import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { scratchMessages } from '../data/gameData';

export default function ScratchCard() {
  const { showRomanticToast } = useLoveContext();
  const [currentCard, setCurrentCard] = useState(0);
  const [isScratched, setIsScratched] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const canvasRef = useRef(null);
  const sparkleIdRef = useRef(0);

  const card = scratchMessages[currentCard];
  const isGolden = card.rarity === 'golden';
  const isRare = card.rarity === 'rare';

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Different gradient for different rarities
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    if (isGolden) {
      gradient.addColorStop(0, '#D4AF37');
      gradient.addColorStop(0.5, '#FFD700');
      gradient.addColorStop(1, '#DAA520');
    } else if (isRare) {
      gradient.addColorStop(0, '#7C3AED');
      gradient.addColorStop(0.5, '#A855F7');
      gradient.addColorStop(1, '#9333EA');
    } else {
      gradient.addColorStop(0, '#C21E56');
      gradient.addColorStop(0.5, '#E63946');
      gradient.addColorStop(1, '#FF69B4');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars for golden/rare
    if (isGolden || isRare) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        ctx.font = '12px sans-serif';
        ctx.fillText('✨', x, y);
      }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isGolden ? '🌟 GOLDEN CARD 🌟' : isRare ? '💎 RARE CARD 💎' : '✨ Scratch Here ✨', 
      rect.width / 2, 
      rect.height / 2
    );

    setIsScratched(false);
    setSparkles([]);
  }, [isGolden, isRare]);

  useEffect(() => {
    const timer = setTimeout(() => initCanvas(), 100);
    return () => clearTimeout(timer);
  }, [currentCard, initCanvas]);

  const addSparkle = (x, y) => {
    const id = sparkleIdRef.current++;
    const newSparkle = {
      id,
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 30,
      size: 4 + Math.random() * 8,
      emoji: ['✨', '💕', '⭐', '💫'][Math.floor(Math.random() * 4)]
    };
    setSparkles(prev => [...prev.slice(-15), newSparkle]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => s.id !== id));
    }, 800);
  };

  const scratch = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || isScratched) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.type.includes('touch')) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Add sparkle particle
    addSparkle(x, y);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * 2, y * 2, 50, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    const percent = (transparent / (imageData.data.length / 4)) * 100;

    if (percent > 60 && !isScratched) {
      // Dissolve remaining
      setIsScratched(true);
      
      // Fade out remaining canvas
      let opacity = 1;
      const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        if (canvas) canvas.style.opacity = Math.max(0, opacity);
        if (opacity <= 0) {
          clearInterval(fadeInterval);
        }
      }, 30);

      showRomanticToast(isGolden ? 'achievement' : 'scratch');
    }
  };

  const nextCard = () => {
    if (canvasRef.current) canvasRef.current.style.opacity = 1;
    setCurrentCard((prev) => (prev + 1) % scratchMessages.length);
  };
  const prevCard = () => {
    if (canvasRef.current) canvasRef.current.style.opacity = 1;
    setCurrentCard((prev) => (prev - 1 + scratchMessages.length) % scratchMessages.length);
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">🎴 Scratch Cards</span>
        <p className="text-white/50 text-xs">Scratch to reveal a sweet message!</p>
        {(isGolden || isRare) && (
          <motion.p 
            className={`text-xs mt-1 font-medium ${isGolden ? 'text-amber-400' : 'text-purple-400'}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {isGolden ? '🌟 You found a GOLDEN card!' : '💎 This is a RARE card!'}
          </motion.p>
        )}
      </div>

      <div className={`relative mx-auto w-full max-w-[280px] aspect-[16/10] rounded-xl overflow-hidden shadow-lg ${
        isGolden ? 'ring-2 ring-amber-400/50 shadow-amber-500/20' : 
        isRare ? 'ring-2 ring-purple-400/50 shadow-purple-500/20' : ''
      }`}>
        {/* Hidden Message */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-5 ${
          isGolden 
            ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20' 
            : isRare
              ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20'
              : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20'
        }`}>
          <motion.span 
            className="text-3xl mb-2"
            animate={isScratched ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {card.icon}
          </motion.span>
          <p className="text-white text-sm text-center leading-relaxed">{card.message}</p>
        </div>

        {/* Sparkle Particles */}
        {sparkles.map(sparkle => (
          <motion.span
            key={sparkle.id}
            className="absolute pointer-events-none z-20"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0, y: -30 }}
            transition={{ duration: 0.8 }}
            style={{ left: sparkle.x, top: sparkle.y, fontSize: sparkle.size }}
          >
            {sparkle.emoji}
          </motion.span>
        ))}

        {/* Scratch Surface */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10 transition-opacity"
          onMouseMove={(e) => e.buttons === 1 && scratch(e)}
          onTouchMove={scratch}
          onMouseDown={scratch}
          onTouchStart={scratch}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 active:scale-95 transition-transform hover:bg-white/15"
          onClick={prevCard}
        >
          ←
        </button>
        <div className="flex items-center gap-1.5">
          {scratchMessages.map((msg, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentCard 
                  ? msg.rarity === 'golden' ? 'bg-amber-400 w-4' : msg.rarity === 'rare' ? 'bg-purple-400 w-4' : 'bg-pink-400 w-4'
                  : msg.rarity === 'golden' ? 'bg-amber-400/30' : msg.rarity === 'rare' ? 'bg-purple-400/30' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <button
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 active:scale-95 transition-transform hover:bg-white/15"
          onClick={nextCard}
        >
          →
        </button>
      </div>
    </motion.div>
  );
}
