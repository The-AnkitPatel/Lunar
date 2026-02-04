import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoveContext } from '../hooks/useLoveContext';
import { loveQuizQuestions } from '../data/gameData';
import { cn } from '../lib/utils';

export default function LoveQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { showRomanticToast } = useLoveContext();

  const question = loveQuizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / loveQuizQuestions.length) * 100;

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    
    const isCorrect = index === question.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      showRomanticToast('celebrate');
    }

    setTimeout(() => setShowResult(true), 300);
  };

  const nextQuestion = () => {
    if (currentQuestion < loveQuizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameComplete(true);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
  };

  if (gameComplete) {
    const percentage = Math.round((score / loveQuizQuestions.length) * 100);
    return (
      <motion.div 
        className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-5xl block mb-3">
          {percentage >= 80 ? '🏆' : percentage >= 50 ? '💕' : '💪'}
        </span>
        <h3 className="font-script text-2xl text-pink-400 mb-2">
          {percentage >= 80 ? 'Amazing!' : percentage >= 50 ? 'Great job!' : 'Keep trying!'}
        </h3>
        <p className="text-white/70 text-lg mb-1">{score} / {loveQuizQuestions.length}</p>
        <p className="text-white/50 text-sm mb-4">{percentage}% correct</p>
        <button
          onClick={restart}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full text-sm font-semibold active:scale-95 transition-transform"
        >
          Play Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Question {currentQuestion + 1}/{loveQuizQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-500 to-pink-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <p className="text-white text-sm leading-relaxed">{question.question}</p>
          </div>

          {/* Answers */}
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={cn(
                  "w-full p-3 rounded-xl text-left text-sm transition-all duration-200 border",
                  selectedAnswer === null 
                    ? "bg-white/5 border-white/10 hover:bg-white/10 active:scale-[0.98]"
                    : index === question.correctAnswer
                      ? "bg-green-500/20 border-green-500/50"
                      : selectedAnswer === index
                        ? "bg-red-500/20 border-red-500/50"
                        : "bg-white/5 border-white/10 opacity-50"
                )}
              >
                <span className="text-white/90">{option}</span>
              </button>
            ))}
          </div>

          {/* Next Button */}
          {showResult && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={nextQuestion}
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {currentQuestion < loveQuizQuestions.length - 1 ? 'Next Question' : 'See Results'}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
