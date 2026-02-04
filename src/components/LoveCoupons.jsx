import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { loveCoupons } from '../data/gameData';
import { cn } from '../lib/utils';

export default function LoveCoupons() {
  const { redeemedCoupons, redeemCoupon, showRomanticToast } = useLoveContext();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCouponClick = (coupon) => {
    if (redeemedCoupons.includes(coupon.id)) return;
    setSelectedCoupon(coupon);
    setShowConfirm(true);
  };

  const confirmRedeem = () => {
    if (selectedCoupon) {
      redeemCoupon(selectedCoupon.id);
      showRomanticToast('couponRedeem');
      setShowConfirm(false);
      setSelectedCoupon(null);
    }
  };

  return (
    <motion.div
      className="bg-white/5 rounded-2xl p-5 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-4">
        <span className="inline-block text-xs bg-pink-500/20 text-pink-400 px-2.5 py-1 rounded-full mb-2">🎟️ Love Coupons</span>
        <p className="text-white/50 text-xs mb-1">Redeem these special coupons anytime!</p>
        <span className="text-xs text-pink-400/60">Redeemed: {redeemedCoupons.length} / {loveCoupons.length}</span>
      </div>

      <div className="space-y-3">
        {loveCoupons.map((coupon, index) => {
          const isRedeemed = redeemedCoupons.includes(coupon.id);
          return (
            <motion.div
              key={coupon.id}
              className={cn(
                "relative p-4 rounded-xl border transition-all",
                isRedeemed 
                  ? "bg-white/5 border-white/5 opacity-60" 
                  : "bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-400/20 active:scale-[0.98]"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCouponClick(coupon)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{coupon.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm mb-0.5">{coupon.title}</h3>
                  <p className="text-white/50 text-xs">{coupon.description}</p>
                </div>
              </div>
              {isRedeemed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                  <span className="text-pink-400 font-bold text-xs px-3 py-1 border border-pink-400 rounded-full rotate-[-5deg]">
                    ✓ REDEEMED
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedCoupon && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 rounded-2xl border border-white/10 max-w-xs w-full text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <span className="text-4xl block mb-3">{selectedCoupon.icon}</span>
              <h3 className="text-pink-400 font-semibold text-lg mb-1">Redeem Coupon?</h3>
              <p className="text-white/70 text-sm mb-4">{selectedCoupon.title}</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 bg-white/10 rounded-xl text-sm text-white/70"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-sm font-semibold"
                  onClick={confirmRedeem}
                >
                  Redeem! 💕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
