import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from '../lib/auth';

export default function AuthPage({ onAuthSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await signIn(`${username.trim()}@lunar.love`, password);
            if (data?.user) {
                onAuthSuccess(data.user);
            }
        } catch (err) {
            setError(err.message || 'Wrong credentials, try again 💔');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-950 via-slate-950 to-rose-950 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background floating hearts */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]" />
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-rose-500/20"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            fontSize: `${12 + Math.random() * 24}px`,
                        }}
                        animate={{
                            y: [-20, -100 - Math.random() * 200],
                            opacity: [0.3, 0],
                            scale: [1, 0.5],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 6,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: 'easeOut',
                        }}
                    >
                        ❤️
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="w-full max-w-sm relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Logo / Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className="text-6xl mb-3"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        💕
                    </motion.div>
                    <h1 className="font-script text-3xl sm:text-4xl bg-gradient-to-r from-rose-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
                        Lunar Valentine
                    </h1>
                    <p className="text-white/40 text-sm mt-2">
                        Sign in to your special space ✨
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-rose-500/5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="text-white/50 text-xs font-medium mb-1.5 block">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                    💌
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="your username"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-white/50 text-xs font-medium mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                    🔒
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors text-sm"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -5, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-3 rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                        >
                            {loading ? (
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="inline-block"
                                >
                                    💫
                                </motion.span>
                            ) : (
                                'Enter Our World 💕'
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Footer */}
                <motion.p
                    className="text-center text-white/20 text-xs mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Made with ❤️ for us
                </motion.p>
            </motion.div>
        </div>
    );
}
