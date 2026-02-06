import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateGameResponse } from '../lib/tracking';

/**
 * Reusable review section for game responses.
 * Shows Q&A list with inline editing support.
 * 
 * Props:
 *   responses: Array of { id, question, answer, extra?, responseData? }
 *   title: string (e.g. "Your Answers")
 *   icon: string emoji
 *   accentColor: 'rose' | 'purple' | 'blue' | 'green'
 *   gameType: string (e.g. 'truth_or_love')
 *   onResponseUpdated?: (index, newAnswer) => void  — optional callback after edit
 */
export default function GameReviewSection({ responses, title = "Your Answers", icon = "💌", accentColor = 'rose', onResponseUpdated }) {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');
    const [saving, setSaving] = useState(false);
    const [editedIds, setEditedIds] = useState(new Set());

    const colorMap = {
        rose: { bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/20', text: 'text-rose-300', btn: 'from-rose-500 to-pink-600' },
        purple: { bg: 'from-purple-500/10 to-blue-500/10', border: 'border-purple-500/20', text: 'text-purple-300', btn: 'from-purple-500 to-blue-600' },
        blue: { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-300', btn: 'from-blue-500 to-cyan-600' },
        green: { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-300', btn: 'from-green-500 to-emerald-600' },
    };
    const colors = colorMap[accentColor] || colorMap.rose;

    const handleStartEdit = (index) => {
        setEditingIndex(index);
        setEditText(responses[index].answer);
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditText('');
    };

    const handleSaveEdit = async (index) => {
        const resp = responses[index];
        if (!resp.id || !editText.trim() || editText.trim() === resp.answer) {
            handleCancelEdit();
            return;
        }

        setSaving(true);
        const updated = await updateGameResponse(resp.id, {
            responseText: editText.trim(),
            responseData: resp.responseData ? { ...resp.responseData, edited: true } : undefined,
        });

        if (updated) {
            setEditedIds(prev => new Set([...prev, resp.id]));
            if (onResponseUpdated) onResponseUpdated(index, editText.trim());
        }
        setSaving(false);
        handleCancelEdit();
    };

    if (!responses || responses.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{icon}</span>
                <h4 className="text-white/80 text-sm font-medium">{title}</h4>
                <span className="text-white/30 text-xs">({responses.length})</span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                {responses.map((resp, i) => (
                    <motion.div
                        key={resp.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-xl border bg-gradient-to-br ${colors.bg} ${colors.border} overflow-hidden`}
                    >
                        {/* Question */}
                        <div className="px-4 pt-3 pb-1">
                            <p className="text-white/40 text-xs leading-relaxed">
                                Q{i + 1}: {resp.question}
                            </p>
                        </div>

                        {/* Answer / Edit area */}
                        <div className="px-4 pb-3">
                            <AnimatePresence mode="wait">
                                {editingIndex === i ? (
                                    <motion.div
                                        key="editing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-2 mt-1"
                                    >
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-black/30 text-white border border-white/10 rounded-lg p-3 min-h-[60px] focus:outline-none focus:border-pink-500/50 placeholder:text-white/20 resize-none text-sm"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSaveEdit(i)}
                                                disabled={saving || !editText.trim()}
                                                className={`flex-1 py-2 rounded-lg bg-gradient-to-r ${colors.btn} text-white text-xs font-medium disabled:opacity-50 active:scale-95 transition-transform`}
                                            >
                                                {saving ? '...' : '💾 Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-start justify-between gap-2 mt-1"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm leading-relaxed">
                                                {resp.answer}
                                            </p>
                                            {resp.extra && (
                                                <p className="text-white/30 text-xs mt-1 italic">{resp.extra}</p>
                                            )}
                                            {(editedIds.has(resp.id) || resp.isEdited) && (
                                                <span className="text-white/20 text-[10px] italic">(edited)</span>
                                            )}
                                        </div>
                                        {resp.id && (
                                            <button
                                                onClick={() => handleStartEdit(i)}
                                                className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                                                title="Edit response"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
