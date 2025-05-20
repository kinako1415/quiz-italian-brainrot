import React from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { CheckIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import {
  currentQuestionIndexAtom,
  questionsAtom,
  selectedAnswerAtom,
  gameStatusAtom,
  isTimerRunningAtom,
  timerStartTimeAtom,
  elapsedTimeAtom,
  correctAnswersAtom,
  incorrectAnswersAtom,
} from "@/atoms";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types";

const AnswerButton = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useAtom(
    currentQuestionIndexAtom
  );
  const [questions] = useAtom(questionsAtom);
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [, setGameStatus] = useAtom(gameStatusAtom);
  const [, setIsTimerRunning] = useAtom(isTimerRunningAtom);
  const [, setTimerStartTime] = useAtom(timerStartTimeAtom);
  const [elapsedTime, setElapsedTime] = useAtom(elapsedTimeAtom);
  const [correctAnswers, setCorrectAnswers] = useAtom(correctAnswersAtom);
  const [incorrectAnswers, setIncorrectAnswers] = useAtom(incorrectAnswersAtom);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    setIsTimerRunning(false);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }

    // アニメーションの時間を確保するため、次の問題への遷移を遅延させる
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimerStartTime(null);
        setElapsedTime(0);
      } else {
        setGameStatus("finished");
      }
    }, 1500);
  };

  if (!selectedAnswer) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <CheckIcon className="w-6 h-6 text-green-400" />
        ) : (
          <CrossCircledIcon className="w-6 h-6 text-red-400" />
        )}
        <p className="text-lg font-medium text-white">
          {isCorrect ? "正解！" : "不正解..."}
        </p>
      </div>
      <Button
        variant={isCorrect ? "success" : "danger"}
        size="lg"
        onClick={handleAnswer}
        className="min-w-[200px]"
      >
        {currentQuestionIndex < questions.length - 1
          ? "次の問題へ"
          : "結果を見る"}
      </Button>
    </motion.div>
  );
};

export default AnswerButton;
