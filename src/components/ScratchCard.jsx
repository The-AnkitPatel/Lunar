import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { scratchMessages } from '../data/gameData';

export default function ScratchCard() {
  const { showRomanticToast } = useLoveContext();
  const [currentCard, setCurrentCard] = useState(0);
  const [isScratched, setIsScratched] = useState(false);
  const canvasRef = useRef(null);

  const card = scratchMessages[currentCard];

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#C21E56');
    gradient.addColorStop(0.5, '#E63946');
    gradient.addColorStop(1, '#FF69B4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 15 + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch Here ✨', canvas.width / 2, canvas.height / 2);

    setIsScratched(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => initCanvas(), 100);
    return () => clearTimeout(timer);
  }, [currentCard, initCanvas]);

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

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) transparent++;
    }
    const percent = (transparent / (imageData.data.length / 4)) * 100;

    if (percent > 50 && !isScratched) {
      setIsScratched(true);
      showRomanticToast('scratch');
    }
  };

  const nextCard = () => setCurrentCard((prev) => (prev + 1) % scratchMessages.length);
  const prevCard = () => setCurrentCard((prev) => (prev - 1 + scratchMessages.length) % scratchMessages.length);

  return (
    <motion.div
      className="bg-white/5 rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">🎴 Scratch Cards</span>
        <p className="text-white/50 text-xs">Scratch to reveal a sweet message!</p>
      </div>

      <div className="relative mx-auto w-64 h-40 rounded-xl overflow-hidden shadow-lg">
        {/* Hidden Message */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex flex-col items-center justify-center p-4">
          <span className="text-3xl mb-2">{card.icon}</span>
          <p className="text-white text-sm text-center leading-relaxed">{card.message}</p>
        </div>

        {/* Scratch Surface */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          onMouseMove={(e) => e.buttons === 1 && scratch(e)}
          onTouchMove={scratch}
          onMouseDown={scratch}
          onTouchStart={scratch}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 active:scale-95 transition-transform"
          onClick={prevCard}
        >
          ←
        </button>
        <span className="text-xs text-white/50">
          {currentCard + 1} / {scratchMessages.length}
        </span>
        <button
          className="w-10 h-10 rounded-full bg-white/10 text-white/70 active:scale-95 transition-transform"
          onClick={nextCard}
        >
          →
        </button>
      </div>
    </motion.div>
  );
}
