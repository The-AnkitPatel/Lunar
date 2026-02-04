import { useState, useEffect, useCallback } from 'react';
import { LoveContext } from './context';

// Romantic toast messages for different interactions
const romanticMessages = {
    celebrate: [
        "Yay! You're amazing, baby! 🎉💕",
        "Woohoo! That's my girl! 🥳",
        "You did it! I'm so proud of you! 💖",
        "Amazing! You're literally the best! ✨"
    ],
    love: [
        "I love you more than words can say! 💕",
        "You make every moment magical! ✨",
        "Being with you is my favorite thing! 💖",
        "You're my everything, baby! 🥰",
        "My heart beats just for you! 💗"
    ],
    romantic: [
        "Every moment with you is a treasure! 💎",
        "You're the reason I believe in forever! ♾️",
        "My love for you grows every second! 📈💕",
        "You make my world complete! 🌍💖"
    ],
    welcome: [
        "Welcome back, my love! I missed you! 💕",
        "You're here! My heart is already racing! 💖",
        "The most beautiful person just arrived! 🥰"
    ],
    couponRedeem: [
        "Coupon activated! I'm so excited to do this for you! 🎟️",
        "Redeemed! Your wish is my command, my queen! 👑",
        "This is now a sacred promise I'll keep! 💕"
    ],
    promisePick: [
        "This promise is sealed with all my love! 💕",
        "I'll keep this promise forever! You have my word! 🤞",
        "Consider this done, my love! 💝"
    ],
    challenge: [
        "Ooh, this is going to be fun! Ready? 🃏",
        "Challenge accepted! Let's make it special! 💕",
        "I love doing challenges with you! 🎉"
    ],
    truthdare: [
        "Oooh, this is getting interesting! 🔥",
        "I love playing this with you! 💕",
        "Whatever happens stays between us! 😏"
    ],
    scratch: [
        "You revealed a hidden message! 🥰",
        "Surprise! My love is everywhere! 💕",
        "You found it, curious cutie! 😘"
    ],
    bucketlist: [
        "One more adventure completed together! 🎉",
        "Making memories that last forever! 📸",
        "Can't wait to check off more with you! 💕"
    ],
    achievement: [
        "Achievement unlocked! You're amazing! 🏆",
        "New badge earned! So proud of you! 💕",
        "You did it! Another reason to love you! 🌟"
    ]
};

// Get random message from category
const getRandomMessage = (category) => {
    const messages = romanticMessages[category] || romanticMessages.love;
    return messages[Math.floor(Math.random() * messages.length)];
};

export function LoveProvider({ children }) {
    // Skip login - direct access
    const [isUnlocked, setIsUnlocked] = useState(true);

    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('userName') || 'My Love';
    });

    const [toast, setToast] = useState(null);

    const [achievements, setAchievements] = useState(() => {
        const saved = localStorage.getItem('achievements');
        return saved ? JSON.parse(saved) : {
            firstVisit: false,
            quizMaster: false,
            memoryChamp: false,
            spinAddict: false,
            couponCollector: false,
            challengeAccepted: false,
            truthSeeker: false,
            promiseKeeper: false,
            bucketListStarter: false,
            secretFinder: false,
            loveExplorer: false,
            midnightLover: false,
            konamiMaster: false
        };
    });

    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('loveStats');
        return saved ? JSON.parse(saved) : {
            totalSpins: 0,
            quizzesTaken: 0,
            memoryGamesWon: 0,
            couponsRedeemed: 0,
            challengesCompleted: 0,
            promisesClaimed: 0,
            sectionsVisited: [],
            lastVisit: null
        };
    });

    const [redeemedCoupons, setRedeemedCoupons] = useState(() => {
        const saved = localStorage.getItem('redeemedCoupons');
        return saved ? JSON.parse(saved) : [];
    });

    const [claimedPromises, setClaimedPromises] = useState(() => {
        const saved = localStorage.getItem('claimedPromises');
        return saved ? JSON.parse(saved) : [];
    });

    const [completedBucketItems, setCompletedBucketItems] = useState(() => {
        const saved = localStorage.getItem('completedBucketItems');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('valentineUnlocked', isUnlocked);
    }, [isUnlocked]);

    useEffect(() => {
        localStorage.setItem('userName', userName);
    }, [userName]);

    useEffect(() => {
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }, [achievements]);

    useEffect(() => {
        localStorage.setItem('loveStats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('redeemedCoupons', JSON.stringify(redeemedCoupons));
    }, [redeemedCoupons]);

    useEffect(() => {
        localStorage.setItem('claimedPromises', JSON.stringify(claimedPromises));
    }, [claimedPromises]);

    useEffect(() => {
        localStorage.setItem('completedBucketItems', JSON.stringify(completedBucketItems));
    }, [completedBucketItems]);

    // Show toast notification
    const showToast = useCallback((message, type = 'love') => {
        setToast({ message, type, id: Date.now() });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // Show romantic toast from category
    const showRomanticToast = useCallback((category) => {
        showToast(getRandomMessage(category), 'love');
    }, [showToast]);

    // Unlock achievement
    const unlockAchievement = useCallback((achievementKey, name) => {
        setAchievements(prev => {
            if (!prev[achievementKey]) {
                setTimeout(() => showToast(`🏆 Achievement Unlocked: ${name || achievementKey}!`, 'achievement'), 500);
                return { ...prev, [achievementKey]: true };
            }
            return prev;
        });
    }, [showToast]);

    // Increment stat
    const incrementStat = useCallback((key) => {
        setStats(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    }, []);

    // Update stats
    const updateStats = useCallback((key, value) => {
        setStats(prev => ({ ...prev, [key]: value }));
    }, []);

    // Calculate progress
    const calculateProgress = () => {
        const totalSections = 12;
        const visited = stats.sectionsVisited.length;
        return Math.round((visited / totalSections) * 100);
    };

    // Redeem coupon
    const redeemCoupon = (couponId) => {
        if (!redeemedCoupons.includes(couponId)) {
            setRedeemedCoupons(prev => [...prev, couponId]);
            showRomanticToast('couponRedeem');
        }
    };

    // Claim promise
    const claimPromise = (promiseId) => {
        if (!claimedPromises.includes(promiseId)) {
            setClaimedPromises(prev => [...prev, promiseId]);
            showRomanticToast('promisePick');
        }
    };

    // Complete bucket list item
    const completeBucketItem = (itemId) => {
        if (!completedBucketItems.includes(itemId)) {
            setCompletedBucketItems(prev => [...prev, itemId]);
            showRomanticToast('bucketListCheck');
        }
    };

    const value = {
        isUnlocked,
        setIsUnlocked,
        userName,
        setUserName,
        toast,
        showToast,
        showRomanticToast,
        achievements,
        unlockAchievement,
        stats,
        updateStats,
        incrementStat,
        calculateProgress,
        redeemedCoupons,
        redeemCoupon,
        claimedPromises,
        claimPromise,
        completedBucketItems,
        completeBucketItem
    };

    return (
        <LoveContext.Provider value={value}>
            {children}
        </LoveContext.Provider>
    );
}
