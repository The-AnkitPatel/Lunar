import { motion } from 'framer-motion';
import './OurStoryCard.css';

export default function OurStoryCard({ daysTogether }) {
    return (
        <motion.section
            className="our-story"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="story-card">
                <div className="story-glow" />
                <span className="story-label">Our Love Story</span>
                <h2 className="story-date">January 12, 2026</h2>
                <p className="story-subtitle">The Day You Said Yes 💕</p>
                <p className="story-text">
                    After 2 years of waiting, hoping, and never giving up...
                    <br />You made me the <span className="highlight">happiest person</span> in the world.
                </p>
                <div className="days-counter">
                    <motion.span
                        className="counter-number"
                        key={daysTogether}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {daysTogether}
                    </motion.span>
                    <span className="counter-label">Beautiful Days Together</span>
                </div>
            </div>
        </motion.section>
    );
}
