import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';

export default function RomanticToast() {
  const { toast } = useLoveContext();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="relative px-5 py-3 bg-gradient-to-r from-pink-500/90 to-purple-500/90 rounded-full backdrop-blur-md shadow-xl border border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {toast.type === 'achievement' ? '🏆' : '💕'}
              </span>
              <p className="text-white text-sm font-medium">{toast.message}</p>
            </div>
            
            {/* Floating hearts */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={i}
                  className="text-xs"
                  animate={{
                    y: [-10, -40],
                    x: [0, (i - 2) * 10],
                    opacity: [1, 0],
                    scale: [1, 0.5]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                >
                  💗
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
