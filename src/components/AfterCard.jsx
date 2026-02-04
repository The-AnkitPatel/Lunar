import { motion } from 'framer-motion';
import './AfterCard.css';

export default function AfterCard() {
    return (
        <motion.section
            className="after-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            <div className="after-card">
                <motion.div
                    className="after-hearts"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    💕
                </motion.div>
                <h2 className="after-title">Our Love Story Continues...</h2>
                <p className="after-text">
                    Valentine's Week may be over, but my love for you grows stronger every single day.
                </p>
                <p className="after-signature">Forever Yours ❤️</p>
            </div>
        </motion.section>
    );
}
