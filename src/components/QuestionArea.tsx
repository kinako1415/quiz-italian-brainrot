import React, { useRef, useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  currentQuestionIndexAtom,
  questionsAtom,
  selectedAnswerAtom,
  isTimerRunningAtom,
  timerStartTimeAtom,
  elapsedTimeAtom,
} from "@/atoms";

const QuestionArea = () => {
  const [currentQuestionIndex] = useAtom(currentQuestionIndexAtom);
  const [questions] = useAtom(questionsAtom);
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [, setIsTimerRunning] = useAtom(isTimerRunningAtom);
  const [, setTimerStartTime] = useAtom(timerStartTimeAtom);
  const [, setElapsedTime] = useAtom(elapsedTimeAtom);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const currentQuestion = questions[currentQuestionIndex];

  const shuffleAnswers = useCallback(
    (correctAnswer: string, incorrectAnswers: string[]) => {
      const answers = [correctAnswer, ...incorrectAnswers];
      return [...answers].sort(() => Math.random() - 0.5);
    },
    []
  );

  useEffect(() => {
    if (currentQuestion) {
      setShuffledAnswers(
        shuffleAnswers(
          currentQuestion.correctAnswer,
          currentQuestion.incorrectAnswers
        )
      );
    }
  }, [currentQuestion, shuffleAnswers]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error("Failed to play sound:", err);
      });
      setIsTimerRunning(true);
      setTimerStartTime(Date.now());
      setElapsedTime(0);
    }
  };

  if (!currentQuestion) {
    return <div className="text-center text-white/60">問題を読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={playSound}
            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300
                                 border border-blue-500/30 px-6 py-3 rounded-full shadow-lg 
                                 transition-all duration-300"
          >
            ▶️ 音声を再生する
          </button>
          <audio
            ref={audioRef}
            src={`/sounds/${currentQuestion.sound}`}
            preload="none"
          />
          {currentQuestion.questionText && (
            <p className="text-lg text-white/90">
              {currentQuestion.questionText}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {shuffledAnswers.map((answer, index) => {
            const isCorrect = answer === currentQuestion.correctAnswer;
            return (
              <motion.div
                key={answer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <button
                  onClick={() => setSelectedAnswer(answer)}
                  className={`w-full p-4 rounded-xl transition-all duration-300
                                              ${
                                                selectedAnswer === null
                                                  ? "bg-white/5 hover:bg-white/10 border border-white/10"
                                                  : selectedAnswer === answer
                                                  ? isCorrect
                                                    ? "bg-green-500/20 border-green-500/50"
                                                    : "bg-red-500/20 border-red-500/50"
                                                  : "opacity-50 pointer-events-none bg-white/5 border-white/10"
                                              }`}
                  disabled={selectedAnswer !== null}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={`/images/${answer}`}
                      alt={`選択肢 ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionArea;
