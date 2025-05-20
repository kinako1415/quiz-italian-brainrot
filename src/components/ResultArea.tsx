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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResetIcon,
  RocketIcon,
  CrossCircledIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

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

  let message = "";
  if (Number(accuracy) === 100) {
    message = "完璧な結果です！";
  } else if (Number(accuracy) >= 80) {
    message = "素晴らしい結果です！";
  } else if (Number(accuracy) >= 60) {
    message = "よく頑張りました！";
  } else {
    message = "次は頑張りましょう！";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <RocketIcon className="w-8 h-8 text-purple-400 mx-auto" />
            <h2 className="text-3xl font-bold text-white">クイズ結果</h2>
            <p className="text-white/60">{message}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="text-sm text-white/60">総問題数</p>
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckIcon className="w-4 h-4 text-green-400" />
                <p className="text-sm text-white/60">正解</p>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {correctAnswers}
              </p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <CrossCircledIcon className="w-4 h-4 text-red-400" />
                <p className="text-sm text-white/60">不正解</p>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {incorrectAnswers}
              </p>
            </div>
          </div>

          <div className="relative pt-4">
            <div className="text-center mb-2">
              <p className="text-sm text-white/60">正答率</p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {accuracy}%
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              variant="success"
              size="lg"
              onClick={resetGame}
              className="group"
            >
              <ResetIcon className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              もう一度チャレンジ
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ResultArea;
