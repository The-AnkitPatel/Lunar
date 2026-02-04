import { motion } from 'framer-motion';
import './FallingPetals.css';

function Petal({ delay }) {
    const randomLeft = Math.random() * 100;
    const randomDuration = 8 + Math.random() * 4;
    const randomSize = 10 + Math.random() * 10;

    return (
        <motion.div
            className="petal"
            initial={{
                y: '-50px',
                x: 0,
                opacity: 0,
                rotate: 0
            }}
            animate={{
                y: '100vh',
                x: 100,
                opacity: [0, 0.7, 0.7, 0],
                rotate: 720
            }}
            transition={{
                duration: randomDuration,
                delay: delay,
                repeat: Infinity,
                ease: 'linear'
            }}
            style={{
                left: `${randomLeft}%`,
                width: `${randomSize}px`,
                height: `${randomSize}px`
            }}
        />
    );
}

export default function FallingPetals() {
    return (
        <div className="petals-container">
            {[...Array(10)].map((_, i) => (
                <Petal key={i} delay={i * 0.8} />
            ))}
        </div>
    );
}
