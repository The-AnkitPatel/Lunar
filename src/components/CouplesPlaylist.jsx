import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveGameResponse } from '../lib/tracking';
import { playlistSuggestions } from '../data/gameData';

const moods = [
    { key: 'all', label: 'All', icon: '🎵' },
    { key: 'romantic', label: 'Romantic', icon: '💕' },
    { key: 'bollywood', label: 'Bollywood', icon: '🎬' },
    { key: 'classic', label: 'Classic', icon: '🎼' },
    { key: 'modern', label: 'Modern', icon: '✨' },
];

export default function CouplesPlaylist() {
    const [activeMood, setActiveMood] = useState('all');
    const [playlist, setPlaylist] = useState(() => {
        const saved = localStorage.getItem('couplesPlaylist');
        return saved ? JSON.parse(saved) : [];
    });
    const [showCustom, setShowCustom] = useState(false);
    const [customTitle, setCustomTitle] = useState('');
    const [customArtist, setCustomArtist] = useState('');
    const [addedAnimation, setAddedAnimation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(null);

    const [visualizerBars] = useState(() =>
        Array.from({ length: 5 }, () => ({
            height: 20 + Math.random() * 12,
            duration: 0.5 + Math.random() * 0.3,
        })));

    useEffect(() => {
        localStorage.setItem('couplesPlaylist', JSON.stringify(playlist));
    }, [playlist]);

    const filtered = useMemo(() => {
        if (activeMood === 'all') return playlistSuggestions;
        return playlistSuggestions.filter(s => s.mood === activeMood);
    }, [activeMood]);

    const addToPlaylist = (song) => {
        const key = `${song.title}-${song.artist}`;
        if (playlist.some(s => `${s.title}-${s.artist}` === key)) return;
        setPlaylist(prev => [...prev, { ...song, addedAt: Date.now() }]);

        saveGameResponse({
            gameType: 'couples_playlist',
            questionText: 'Added song to playlist',
            responseText: `${song.title} - ${song.artist}`,
            responseData: { title: song.title, artist: song.artist, mood: song.mood, source: 'suggestion' }
        });

        setAddedAnimation(key);
        setTimeout(() => setAddedAnimation(null), 1200);
    };

    const removeFromPlaylist = (index) => {
        setPlaylist(prev => prev.filter((_, i) => i !== index));
    };

    const addCustomSong = () => {
        if (!customTitle.trim()) return;
        const song = {
            title: customTitle.trim(),
            artist: customArtist.trim() || 'Unknown',
            emoji: '🎤',
            mood: 'custom',
            addedAt: Date.now()
        };
        setPlaylist(prev => [...prev, song]);

        saveGameResponse({
            gameType: 'couples_playlist',
            questionText: 'Added custom song',
            responseText: `${song.title} - ${song.artist}`,
            responseData: { title: song.title, artist: song.artist, mood: 'custom', source: 'custom' }
        });

        setCustomTitle('');
        setCustomArtist('');
        setShowCustom(false);
    };

    const isInPlaylist = (song) => playlist.some(s => s.title === song.title && s.artist === song.artist);

    return (
        <div className="space-y-5">
            <div className="text-center">
                <h3 className="text-white font-semibold mb-1">Our Playlist 🎵</h3>
                <p className="text-white/40 text-xs">
                    {playlist.length} song{playlist.length !== 1 ? 's' : ''} in our collection
                </p>
            </div>

            {/* Our Playlist Section */}
            {playlist.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-love-500/10 to-purple-500/10 border border-love-500/20">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white text-sm font-medium">💿 Our Playlist</h4>
                        <span className="text-white/30 text-xs">{playlist.length} songs</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {playlist.map((song, i) => (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-black/20 group"
                            >
                                <button
                                    onClick={() => setIsPlaying(isPlaying === i ? null : i)}
                                    className="text-lg w-7 h-7 flex items-center justify-center"
                                >
                                    {isPlaying === i ? (
                                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                            🎶
                                        </motion.span>
                                    ) : (
                                        <span>{song.emoji}</span>
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{song.title}</p>
                                    <p className="text-white/30 text-[10px] truncate">{song.artist}</p>
                                </div>
                                <button
                                    onClick={() => removeFromPlaylist(i)}
                                    className="text-white/20 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all px-1"
                                >
                                    ✕
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Now Playing Visualizer */}
            <AnimatePresence>
                {isPlaying !== null && playlist[isPlaying] && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-love-500/20 border border-purple-500/20 text-center"
                    >
                        <div className="flex justify-center gap-1 mb-3">
                            {visualizerBars.map((bar, i) => (
                                <motion.div
                                    key={i}
                                    className="w-1 bg-love-400 rounded-full"
                                    animate={{ height: [8, bar.height, 8] }}
                                    transition={{ duration: bar.duration, repeat: Infinity, delay: i * 0.1 }}
                                />
                            ))}
                        </div>
                        <p className="text-white text-sm font-medium">{playlist[isPlaying].title}</p>
                        <p className="text-white/40 text-xs">{playlist[isPlaying].artist}</p>
                        <p className="text-love-300/50 text-xs mt-2 italic">Imagine us slow dancing to this... 💃</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Browse Suggestions */}
            <div>
                <h4 className="text-white/60 text-xs font-medium mb-2">Browse Suggestions</h4>
                {/* Mood Filter */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-3">
                    {moods.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setActiveMood(m.key)}
                            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all ${
                                activeMood === m.key
                                    ? 'bg-love-500/20 text-love-300 border-love-500/30'
                                    : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                            }`}
                        >
                            {m.icon} {m.label}
                        </button>
                    ))}
                </div>

                {/* Song List */}
                <div className="grid grid-cols-1 gap-2">
                    {filtered.map((song, i) => {
                        const added = isInPlaylist(song);
                        const animating = addedAnimation === `${song.title}-${song.artist}`;
                        return (
                            <motion.div
                                key={`${song.title}-${song.artist}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                    added
                                        ? 'bg-love-500/5 border-love-500/10'
                                        : 'bg-white/5 border-white/5 hover:bg-white/8'
                                }`}
                            >
                                <span className="text-xl">{song.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                                    <p className="text-white/40 text-xs truncate">{song.artist}</p>
                                </div>
                                <button
                                    onClick={() => addToPlaylist(song)}
                                    disabled={added}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                                        added
                                            ? 'bg-green-500/10 text-green-400/60 border-green-500/10 cursor-default'
                                            : 'bg-love-500/20 text-love-300 border-love-500/20 hover:bg-love-500/30 active:scale-90'
                                    }`}
                                >
                                    {animating ? '✓ Added!' : added ? '✓ In Playlist' : '+ Add'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Add Custom Song */}
            <div>
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:text-white/70 transition-colors"
                >
                    {showCustom ? 'Cancel' : '+ Add Our Own Song'}
                </button>

                <AnimatePresence>
                    {showCustom && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-2 overflow-hidden"
                        >
                            <input
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="Song title..."
                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-love-500/50 placeholder:text-white/20"
                            />
                            <input
                                value={customArtist}
                                onChange={(e) => setCustomArtist(e.target.value)}
                                placeholder="Artist name (optional)..."
                                className="w-full bg-black/20 text-white border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-love-500/50 placeholder:text-white/20"
                            />
                            <button
                                onClick={addCustomSong}
                                disabled={!customTitle.trim()}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-love-500 to-purple-600 text-white font-medium text-sm shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
                            >
                                Add to Our Playlist 🎵
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
