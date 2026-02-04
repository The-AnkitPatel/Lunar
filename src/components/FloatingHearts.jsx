import { useMemo } from 'react';

const hearts = ['💕', '💖', '💗', '💝', '❤️'];

const generateHearts = (count) => {
  return [...Array(count)].map((_, i) => ({
    id: i,
    emoji: hearts[i % hearts.length],
    left: Math.random() * 100,
    duration: 12 + Math.random() * 10,
    delay: i * 0.8,
    size: 14 + Math.random() * 10
  }));
};

export default function FloatingHearts() {
  const heartData = useMemo(() => generateHearts(8), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {heartData.map((heart) => (
        <span
          key={heart.id}
          className="absolute animate-float-up"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            bottom: '-20px',
            opacity: 0.6
          }}
        >
          {heart.emoji}
        </span>
      ))}
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up linear infinite;
        }
      `}</style>
    </div>
  );
}
