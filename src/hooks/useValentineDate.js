import { useState, useEffect } from 'react';
import { valentinesDays, RELATIONSHIP_START, VALENTINE_WEEK_START, VALENTINE_DAY } from '../data/valentinesDays';

export function useValentineDate() {
    const [currentState, setCurrentState] = useState({
        phase: 'countdown', // 'countdown' | 'day' | 'after'
        dayData: null,
        daysTogether: 0,
        countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 }
    });

    useEffect(() => {
        const updateState = () => {
            const now = new Date();
            const currentDate = now.getDate();
            const currentMonth = now.getMonth();

            // Calculate days together
            const diffTime = Math.abs(now - RELATIONSHIP_START);
            const daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Determine current phase
            let phase = 'countdown';
            let dayData = null;

            // Before Valentine's Week (Before Feb 7)
            if (currentMonth < 1 || (currentMonth === 1 && currentDate < 7)) {
                phase = 'countdown';
            }
            // After Valentine's Day (After Feb 14)
            else if (currentMonth > 1 || (currentMonth === 1 && currentDate > 14)) {
                phase = 'after';
            }
            // During Valentine's Week (Feb 7-14)
            else {
                phase = 'day';
                dayData = valentinesDays.find(day => day.date === currentDate);
            }

            // Calculate countdown
            const diff = VALENTINE_WEEK_START - now;
            const countdown = {
                days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
                hours: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
                minutes: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))),
                seconds: Math.max(0, Math.floor((diff % (1000 * 60)) / 1000))
            };

            setCurrentState({ phase, dayData, daysTogether, countdown });
        };

        updateState();
        const interval = setInterval(updateState, 1000);
        return () => clearInterval(interval);
    }, []);

    return currentState;
}

// Dev mode preview hook
export function usePreviewDay(dateNum) {
    const dayData = valentinesDays.find(day => day.date === dateNum);
    return {
        phase: 'day',
        dayData,
        daysTogether: 24,
        countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 }
    };
}
