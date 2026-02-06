import { motion } from 'framer-motion';

export default function DayCard({ dayData }) {
  if (!dayData) return null;

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 overflow-hidden relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

      {/* Icon */}
      <div className="text-center mb-4">
        <span className="text-5xl block mb-2">{dayData.icon}</span>
        <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg shadow-rose-500/20">
          Feb {dayData.date} • {dayData.name}
        </span>
      </div>

      {/* Title */}
      <h2 className="font-script text-2xl sm:text-3xl text-center bg-gradient-to-r from-rose-200 to-red-300 bg-clip-text text-transparent mb-4 drop-shadow-sm">
        {dayData.title}
      </h2>

      {/* Message */}
      <p className="text-white/90 text-sm leading-relaxed text-center mb-4 font-light whitespace-pre-wrap">
        {dayData.message}
      </p>

      {/* Quote */}
      <div className="bg-rose-500/10 rounded-xl p-4 border-l-2 border-rose-500 relative overflow-hidden">
        <div className="absolute -right-2 -top-2 text-4xl text-rose-500/10 font-serif">"</div>
        <p className="text-white/80 text-sm italic leading-relaxed relative z-10 whitespace-pre-wrap">
          {dayData.quote}
        </p>
      </div>

      {/* Signature */}
      <p className="font-script text-rose-300 text-lg text-center mt-4">
        {dayData.signature}
      </p>
    </motion.div>
  );
}
