import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { loveQuizQuestions } from '../data/gameData';
import { cn } from '../lib/utils';
import { saveGameResponse } from '../lib/tracking';
import GameReviewSection from './GameReviewSection';

export default function LoveQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [savedResponses, setSavedResponses] = useState([]);
  const { showRomanticToast } = useLoveContext();

  const question = loveQuizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / loveQuizQuestions.length) * 100;
  const loveMeterFill = (score / loveQuizQuestions.length) * 100;

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    
    const isCorrect = index === question.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      showRomanticToast('celebrate');
    }

    // Save to database
    const saved = await saveGameResponse({
      gameType: 'love_quiz',
      questionText: question.question,
      responseText: question.options[index],
      responseData: {
        selectedIndex: index,
        correctIndex: question.correctAnswer,
        isCorrect,
        questionId: question.id
      }
    });

    if (saved) {
      setSavedResponses(prev => [...prev, {
        id: saved.id,
        question: question.question,
        answer: question.options[index],
        extra: isCorrect ? '✅ Correct!' : `❌ Correct answer: ${question.options[question.correctAnswer]}`,
        responseData: { selectedIndex: index, correctIndex: question.correctAnswer, isCorrect, questionId: question.id },
      }]);
    }

    setTimeout(() => {
      setShowResult(true);
      setTimeout(() => setShowLoveMessage(true), 400);
    }, 300);
  };

  const nextQuestion = () => {
    if (currentQuestion < loveQuizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowLoveMessage(false);
    } else {
      setGameComplete(true);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowLoveMessage(false);
    setScore(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((score / loveQuizQuestions.length) * 100);
    return (
      <motion.div 
        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Love Meter Final - circular */}
        <motion.div 
          className="relative w-28 h-28 mx-auto mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle 
              cx="50" cy="50" r="42" fill="none" 
              stroke="url(#loveMeterGrad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (percentage / 100) * 264 }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="loveMeterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
            <span className="text-2xl mb-0.5">
              {percentage >= 80 ? '🏆' : percentage >= 50 ? '💕' : '💪'}
            </span>
            <span className="text-white font-bold text-sm">{percentage}%</span>
          </div>
        </motion.div>

        <h3 className="font-script text-3xl text-pink-400 mb-2">
          {percentage >= 80 ? 'You Know Me So Well!' : percentage >= 50 ? 'Not Bad, My Love!' : "Let's Learn More!"}
        </h3>
        
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
          <p className="text-white/70 text-lg mb-1">
            <strong className="text-pink-400">{score}</strong> / {loveQuizQuestions.length} correct
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            {percentage >= 80 
              ? "You remember everything about us! My heart is melting! 🥰" 
              : percentage >= 50 
                ? "Pretty good! But there's more to discover about our love 💕"
                : "Aww, let me remind you of our beautiful story again! 💝"}
          </p>
        </div>
        
        <button
          onClick={restart}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-pink-500/25"
        >
          Play Again 💕
        </button>

        {/* Review Section */}
        {savedResponses.length > 0 && (
          <div className="mt-6 text-left">
            <GameReviewSection
              responses={savedResponses}
              title="Your Answers"
              icon="📝"
              accentColor="blue"
              onResponseUpdated={(idx, newAnswer) => {
                setSavedResponses(prev => prev.map((r, i) => i === idx ? { ...r, answer: newAnswer } : r));
              }}
            />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      {/* Love Meter + Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">
            Question {currentQuestion + 1}/{loveQuizQuestions.length}
          </span>
          <div className="flex items-center gap-2">
            <motion.span 
              className="text-sm"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              ❤️
            </motion.span>
            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                animate={{ width: `${Math.max(loveMeterFill, 2)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-pink-400 font-medium">{score}</span>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-500 to-pink-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Story Hint */}
      {question.storyHint && (
        <motion.p 
          className="text-white/25 text-xs italic text-center mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={currentQuestion}
        >
          "{question.storyHint}"
        </motion.p>
      )}

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="bg-gradient-to-br from-white/8 to-white/[0.03] rounded-xl p-4 mb-4 border border-white/10">
            <p className="text-white text-sm leading-relaxed font-medium">{question.question}</p>
          </div>

          {/* Answers with heartbeat hover */}
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctAnswer;
              const isSelected = selectedAnswer === index;
              const isWrong = isSelected && !isCorrect;
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  className={cn(
                    "w-full p-3.5 rounded-xl text-left text-sm transition-all duration-300 border relative overflow-hidden group",
                    selectedAnswer === null 
                      ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-pink-500/30 active:scale-[0.98]"
                      : isCorrect
                        ? "bg-green-500/20 border-green-500/50"
                        : isWrong
                          ? "bg-red-500/20 border-red-500/50 animate-shake"
                          : "bg-white/5 border-white/10 opacity-40"
                  )}
                >
                  {/* Heartbeat pulse on correct */}
                  {showResult && isCorrect && (
                    <motion.div 
                      className="absolute inset-0 bg-green-400/10 rounded-xl"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all",
                      selectedAnswer === null
                        ? "border-white/20 text-white/50 group-hover:border-pink-400/50 group-hover:text-pink-400"
                        : isCorrect
                          ? "border-green-400 bg-green-500/30 text-green-300"
                          : isWrong
                            ? "border-red-400 bg-red-500/30 text-red-300"
                            : "border-white/10 text-white/30"
                    )}>
                      {showResult && isCorrect ? '✓' : showResult && isWrong ? '✗' : String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white/90">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Wrong Answer Cute Message */}
          <AnimatePresence>
            {showResult && selectedAnswer !== question.correctAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
              >
                <p className="text-rose-300 text-xs leading-relaxed">
                  😤 Arre! You forgot? Let me remind you... The answer was "<strong>{question.options[question.correctAnswer]}</strong>"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Love Message Reveal */}
          <AnimatePresence>
            {showLoveMessage && question.loveMessage && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl blur-lg" />
                <div className="relative bg-gradient-to-br from-pink-500/15 to-purple-500/15 border border-pink-400/30 rounded-xl p-4 text-center">
                  <motion.span 
                    className="text-lg block mb-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    💕
                  </motion.span>
                  <p className="text-pink-200 font-script text-lg leading-relaxed">
                    {question.loveMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next Button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={nextQuestion}
              className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-pink-500/20"
            >
              {currentQuestion < loveQuizQuestions.length - 1 ? 'Next Question →' : 'See Results 💕'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Shake animation style */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
