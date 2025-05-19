import React from "react";
import { useAtom } from "jotai";
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

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    setIsTimerRunning(false);
    const timeTaken = elapsedTime;

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimerStartTime(null);
        setElapsedTime(0);
      }, 1000);
    } else {
      setTimeout(() => {
        setGameStatus("finished");
      }, 1000);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={handleAnswer}
        disabled={selectedAnswer === null}
        className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30
                         border border-purple-500/30 px-8 py-3 rounded-full shadow-lg
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        回答する
      </button>
    </div>
  );
};

export default AnswerButton;
