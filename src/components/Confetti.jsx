import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Confetti.css';

const colors = ['#E63946', '#FFB6C1', '#C21E56', '#FF69B4', '#D4AF37', '#FF6B6B'];

function ConfettiPiece({ id, onComplete }) {
    const randomLeft = Math.random() * 100;
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomSize = 5 + Math.random() * 10;
    const isCircle = Math.random() > 0.5;
    const randomDuration = 2 + Math.random() * 2;

    useEffect(() => {
        const timer = setTimeout(() => onComplete(id), randomDuration * 1000);
        return () => clearTimeout(timer);
    }, [id, onComplete, randomDuration]);

    return (
        <motion.div
            className="confetti"
            initial={{ y: -100, rotate: 0, opacity: 1 }}
            animate={{ y: '100vh', rotate: 720, opacity: 0 }}
            transition={{ duration: randomDuration, ease: 'easeOut' }}
            style={{
                left: `${randomLeft}%`,
                backgroundColor: randomColor,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                borderRadius: isCircle ? '50%' : '0'
            }}
        />
    );
}

export default function Confetti({ isActive }) {
    const [pieces, setPieces] = useState([]);
    const [nextId, setNextId] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        // Initial burst
        const initialPieces = [...Array(50)].map((_, i) => ({
            id: i,
            delay: i * 100
        }));

        initialPieces.forEach(piece => {
            setTimeout(() => {
                setPieces(prev => [...prev, { id: nextId + piece.id }]);
            }, piece.delay);
        });
        setNextId(prev => prev + 50);

        // Repeat every 10 seconds
        const interval = setInterval(() => {
            const newPieces = [...Array(30)].map((_, i) => ({
                id: nextId + i,
                delay: i * 50
            }));

            newPieces.forEach(piece => {
                setTimeout(() => {
                    setPieces(prev => [...prev, { id: piece.id }]);
                }, piece.delay);
            });
            setNextId(prev => prev + 30);
        }, 10000);

        return () => clearInterval(interval);
    }, [isActive]);

    const handleComplete = (id) => {
        setPieces(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="confetti-container">
            <AnimatePresence>
                {pieces.map(piece => (
                    <ConfettiPiece
                        key={piece.id}
                        id={piece.id}
                        onComplete={handleComplete}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
