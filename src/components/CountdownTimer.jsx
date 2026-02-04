import { motion } from 'framer-motion';
import './CountdownTimer.css';

function TimeBlock({ value, label }) {
    return (
        <motion.div
            className="time-block"
            whileHover={{ scale: 1.05 }}
        >
            <motion.span
                className="time-value"
                key={value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {String(value).padStart(2, '0')}
            </motion.span>
            <span className="time-label">{label}</span>
        </motion.div>
    );
}

export default function CountdownTimer({ countdown }) {
    return (
        <motion.section
            className="countdown-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <div className="countdown-card">
                <h2 className="countdown-title">✨ Something Magical is Coming ✨</h2>
                <p className="countdown-subtitle">Valentine's Week Begins In</p>
                <div className="countdown-timer">
                    <TimeBlock value={countdown.days} label="Days" />
                    <span className="time-separator">:</span>
                    <TimeBlock value={countdown.hours} label="Hours" />
                    <span className="time-separator">:</span>
                    <TimeBlock value={countdown.minutes} label="Minutes" />
                    <span className="time-separator">:</span>
                    <TimeBlock value={countdown.seconds} label="Seconds" />
                </div>
                <p className="countdown-message">
                    Get ready for 8 days of love, surprises, and endless affection! 💝
                </p>
            </div>
        </motion.section>
    );
}
