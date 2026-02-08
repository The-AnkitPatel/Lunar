import { useState, useEffect, useCallback } from 'react';
import { LoveContext } from './context';
import { useAuth } from '../hooks/useAuth';

// Helper: get a user-scoped localStorage key — NEVER falls back to old unscoped keys
function userKey(userId, key) {
    return `${userId || '_nouser'}_${key}`;
}

// Helper: read JSON from user-scoped localStorage
function readUserStorage(userId, key, fallback) {
    if (!userId) return fallback;
    try {
        const raw = localStorage.getItem(userKey(userId, key));
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

// Helper: write JSON to user-scoped localStorage
function writeUserStorage(userId, key, value) {
    if (!userId) return;
    localStorage.setItem(userKey(userId, key), JSON.stringify(value));
}

// One-time cleanup: remove old SHARED (unscoped) localStorage keys
// so they never bleed into the wrong user's session
const OLD_SHARED_KEYS = [
    'userName', 'achievements', 'loveStats', 'redeemedCoupons',
    'claimedPromises', 'completedBucketItems', 'valentineUnlocked',
    'fulfilledPromises', 'spinCount', 'spinHistory', 'readLetters',
    'couplesPlaylist', 'lunar_proposal_response'
];
const CLEANUP_VERSION = '2'; // Bump this to force re-cleanup
function cleanupOldSharedKeys() {
    if (localStorage.getItem('_lunar_shared_keys_cleaned') === CLEANUP_VERSION) return;
    OLD_SHARED_KEYS.forEach(key => localStorage.removeItem(key));
    // Also nuke any leftover proposal keys that might be stale
    // (covers old user-scoped keys written before DB was cleaned)
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.endsWith('_lunar_proposal_response')) {
            localStorage.removeItem(k);
        }
    }
    localStorage.setItem('_lunar_shared_keys_cleaned', CLEANUP_VERSION);
    console.log('[LoveContext] Cleaned up old shared localStorage keys (v' + CLEANUP_VERSION + ')');
}

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
    const { session } = useAuth();
    const userId = session?.user?.id || null;

    // Clean up old shared keys once (migrates from shared -> per-user storage)
    useEffect(() => { cleanupOldSharedKeys(); }, []);

    // Skip login - direct access
    const [isUnlocked, setIsUnlocked] = useState(true);

    const [userName, setUserName] = useState(() => {
        return userId ? (localStorage.getItem(userKey(userId, 'userName')) || 'My Love') : 'My Love';
    });

    const [toast, setToast] = useState(null);

    const defaultAchievements = {
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

    const defaultStats = {
        totalSpins: 0,
        quizzesTaken: 0,
        memoryGamesWon: 0,
        couponsRedeemed: 0,
        challengesCompleted: 0,
        promisesClaimed: 0,
        sectionsVisited: [],
        lastVisit: null
    };

    const [achievements, setAchievements] = useState(() => readUserStorage(userId, 'achievements', defaultAchievements));
    const [stats, setStats] = useState(() => readUserStorage(userId, 'loveStats', defaultStats));
    const [redeemedCoupons, setRedeemedCoupons] = useState(() => readUserStorage(userId, 'redeemedCoupons', []));
    const [claimedPromises, setClaimedPromises] = useState(() => readUserStorage(userId, 'claimedPromises', []));
    const [completedBucketItems, setCompletedBucketItems] = useState(() => readUserStorage(userId, 'completedBucketItems', []));

    // Reload all state when user changes (login/logout/switch)
    useEffect(() => {
        if (!userId) return;
        setUserName(localStorage.getItem(userKey(userId, 'userName')) || 'My Love');
        setAchievements(readUserStorage(userId, 'achievements', defaultAchievements));
        setStats(readUserStorage(userId, 'loveStats', defaultStats));
        setRedeemedCoupons(readUserStorage(userId, 'redeemedCoupons', []));
        setClaimedPromises(readUserStorage(userId, 'claimedPromises', []));
        setCompletedBucketItems(readUserStorage(userId, 'completedBucketItems', []));
    }, [userId]);

    // Save to user-scoped localStorage
    useEffect(() => {
        if (userId) writeUserStorage(userId, 'valentineUnlocked', isUnlocked);
    }, [isUnlocked, userId]);

    useEffect(() => {
        if (userId) localStorage.setItem(userKey(userId, 'userName'), userName);
    }, [userName, userId]);

    useEffect(() => {
        if (userId) writeUserStorage(userId, 'achievements', achievements);
    }, [achievements, userId]);

    useEffect(() => {
        if (userId) writeUserStorage(userId, 'loveStats', stats);
    }, [stats, userId]);

    useEffect(() => {
        if (userId) writeUserStorage(userId, 'redeemedCoupons', redeemedCoupons);
    }, [redeemedCoupons, userId]);

    useEffect(() => {
        if (userId) writeUserStorage(userId, 'claimedPromises', claimedPromises);
    }, [claimedPromises, userId]);

    useEffect(() => {
        if (userId) writeUserStorage(userId, 'completedBucketItems', completedBucketItems);
    }, [completedBucketItems, userId]);

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
