import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loveCoupons } from '../data/gameData';
import { saveGameResponse } from '../lib/tracking';
import { useLoveContext } from '../hooks/useLoveContext';

const categories = [
    { key: 'all', label: 'All', icon: '🎟️' },
    { key: 'romantic', label: 'Romantic', icon: '💕' },
    { key: 'food', label: 'Food', icon: '🍕' },
    { key: 'fun', label: 'Fun', icon: '🎉' },
    { key: 'pampering', label: 'Pampering', icon: '👑' },
];

export default function LoveCoupons() {
    const { redeemedCoupons, redeemCoupon } = useLoveContext();
    const [activeCategory, setActiveCategory] = useState('all');
    const [tearingId, setTearingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(null);

    const secretUnlocked = redeemedCoupons.length >= 10;

    const filtered = loveCoupons.filter(c => {
        if (c.isSecret && !secretUnlocked) return false;
        if (activeCategory === 'all') return true;
        return c.category === activeCategory;
    });

    const handleRedeem = useCallback((coupon) => {
        if (redeemedCoupons.includes(coupon.id)) return;
        if (redeemedCoupons.length >= 10) {
            alert("You can only redeem 10 coupons! 💕");
            return;
        }
        setShowConfirm(coupon);
    }, [redeemedCoupons]);

    const confirmRedeem = useCallback(() => {
        if (!showConfirm) return;
        setTearingId(showConfirm.id);
        setTimeout(() => {
            redeemCoupon(showConfirm.id);

            saveGameResponse({
                gameType: 'love_coupons',
                questionText: showConfirm.title,
                responseText: `Redeemed: ${showConfirm.description}`,
                responseData: { couponId: showConfirm.id, category: showConfirm.category, isSecret: showConfirm.isSecret || false }
            });

            setTearingId(null);
            setShowConfirm(null);
        }, 800);
    }, [showConfirm, redeemCoupon]);

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Love Coupons 🎟️</h3>
                <p className="text-white/40 text-xs">
                    {redeemedCoupons.length} of {loveCoupons.length - 1} redeemed
                    {!secretUnlocked && <span className="ml-2 text-amber-400/60">• Redeem 10 to unlock a secret 🤫</span>}
                </p>
            </div>

            {/* Redemption progress bar */}
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-love-400 to-amber-400"
                    animate={{ width: `${(redeemedCoupons.length / (loveCoupons.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${activeCategory === cat.key
                            ? 'bg-love-500/20 text-love-300 border-love-500/30'
                            : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                            }`}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Coupons Grid */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filtered.map((coupon, i) => {
                        const isRedeemed = redeemedCoupons.includes(coupon.id);
                        const isTearing = tearingId === coupon.id;
                        const isSecret = coupon.isSecret;

                        return (
                            <motion.div
                                key={coupon.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: isTearing ? 0 : 1,
                                    y: 0,
                                    scale: isTearing ? 0.8 : 1,
                                    rotate: isTearing ? 5 : 0,
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: isTearing ? 0.8 : 0.3, delay: isTearing ? 0 : i * 0.05 }}
                                className={`relative rounded-2xl overflow-hidden border ${isSecret
                                    ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-amber-400/30'
                                    : isRedeemed
                                        ? 'bg-white/3 border-white/5'
                                        : 'bg-gradient-to-r from-love-500/10 to-purple-500/10 border-love-500/20'
                                    }`}
                            >
                                {/* Perforated edge */}
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 flex flex-col justify-around py-2">
                                    {Array.from({ length: 8 }).map((_, k) => (
                                        <div key={k} className="w-1.5 h-1.5 rounded-full bg-black/60 -ml-0.5" />
                                    ))}
                                </div>

                                <div className="pl-4 pr-4 py-4 flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isSecret ? 'bg-amber-400/20' : isRedeemed ? 'bg-white/5' : 'bg-love-500/10'
                                        }`}>
                                        {coupon.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className={`font-semibold text-sm ${isRedeemed ? 'text-white/40 line-through' : isSecret ? 'text-amber-300' : 'text-white'}`}>
                                                {coupon.title}
                                            </h4>
                                            {isSecret && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-400/20 text-amber-400 border border-amber-400/20">
                                                    SECRET
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs leading-relaxed ${isRedeemed ? 'text-white/20' : 'text-white/50'}`}>
                                            {coupon.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`text-[10px] ${isRedeemed ? 'text-white/15' : 'text-white/30'}`}>
                                                ⏰ Expires: {coupon.expiry}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Redeem button */}
                                    <div className="flex-shrink-0">
                                        {isRedeemed ? (
                                            <div className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400/60 text-[10px] font-medium border border-green-500/10">
                                                ✓ Used
                                            </div>
                                        ) : (
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleRedeem(coupon)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${isSecret
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                                                    : 'bg-love-500/20 text-love-300 border-love-500/30 hover:bg-love-500/30'
                                                    }`}
                                            >
                                                Redeem
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* Redeemed overlay */}
                                {isRedeemed && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-green-400/10 text-6xl font-bold rotate-[-15deg]">
                                            REDEEMED
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Secret coupon teaser */}
            {!secretUnlocked && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center"
                >
                    <p className="text-amber-400/50 text-xs">
                        🔒 A secret coupon awaits... Redeem {10 - redeemedCoupons.length} more to unlock!
                    </p>
                </motion.div>
            )}

            {/* Confirm Modal */}
            {createPortal(
                <AnimatePresence>
                    {showConfirm && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
                            onClick={() => setShowConfirm(null)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl p-6 border border-love-500/20 w-full max-w-sm"
                            >
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-3">{showConfirm.icon}</div>
                                    <h4 className="text-white font-bold text-lg">{showConfirm.title}</h4>
                                    <p className="text-white/50 text-sm mt-2">{showConfirm.description}</p>
                                </div>
                                <p className="text-amber-400/80 text-xs text-center mb-4">
                                    ⚠️ Once redeemed, this coupon can't be un-redeemed!
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setShowConfirm(null)} className="py-3 rounded-xl bg-white/10 text-white/70 text-sm">
                                        Keep It
                                    </button>
                                    <button onClick={confirmRedeem} className="py-3 rounded-xl bg-gradient-to-r from-love-500 to-purple-600 text-white font-medium text-sm shadow-lg">
                                        Redeem! 🎉
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
