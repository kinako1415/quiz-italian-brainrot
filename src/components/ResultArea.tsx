import React from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import {
  questionsAtom,
  currentQuestionIndexAtom,
  gameStatusAtom,
  selectedAnswerAtom,
  timerStartTimeAtom,
  elapsedTimeAtom,
  correctAnswersAtom,
  incorrectAnswersAtom,
} from "@/atoms";

const ResultArea = () => {
  const [questions] = useAtom(questionsAtom);
  const [, setCurrentQuestionIndex] = useAtom(currentQuestionIndexAtom);
  const [gameStatus, setGameStatus] = useAtom(gameStatusAtom);
  const [, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [, setTimerStartTime] = useAtom(timerStartTimeAtom);
  const [, setElapsedTime] = useAtom(elapsedTimeAtom);
  const [correctAnswers, setCorrectAnswers] = useAtom(correctAnswersAtom);
  const [incorrectAnswers, setIncorrectAnswers] = useAtom(incorrectAnswersAtom);

  if (gameStatus !== "finished") {
    return null;
  }

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setGameStatus("ready");
    setSelectedAnswer(null);
    setTimerStartTime(null);
    setElapsedTime(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
  };

  const totalQuestions = questions.length;
  const accuracy =
    totalQuestions > 0
      ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-lg"
    >
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        クイズ結果
      </h2>
      <div className="space-y-4 text-lg">
        <p className="text-white/90">
          正解:{" "}
          <span className="text-green-400 font-bold">{correctAnswers}</span> /{" "}
          {totalQuestions}
        </p>
        <p className="text-white/90">
          不正解:{" "}
          <span className="text-red-400 font-bold">{incorrectAnswers}</span> /{" "}
          {totalQuestions}
        </p>
        <p className="text-white/90">
          正答率: <span className="text-blue-400 font-bold">{accuracy}%</span>
        </p>
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={resetGame}
          className="bg-green-500/20 text-green-400 hover:bg-green-500/30
                             border border-green-500/30 px-8 py-3 rounded-full shadow-lg
                             transition-all duration-300"
        >
          もう一度チャレンジする
        </button>
      </div>
    </motion.div>
  );
};

export default ResultArea;
