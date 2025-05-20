import React, { useRef, useEffect, useState, useCallback } from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayIcon, SpeakerLoudIcon } from "@radix-ui/react-icons";
import {
  currentQuestionIndexAtom,
  questionsAtom,
  selectedAnswerAtom,
  isTimerRunningAtom,
  timerStartTimeAtom,
  elapsedTimeAtom,
} from "@/atoms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const QuestionArea = () => {
  const [currentQuestionIndex] = useAtom(currentQuestionIndexAtom);
  const [questions] = useAtom(questionsAtom);
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [, setIsTimerRunning] = useAtom(isTimerRunningAtom);
  const [, setTimerStartTime] = useAtom(timerStartTimeAtom);
  const [, setElapsedTime] = useAtom(elapsedTimeAtom);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsTimerRunning(true);
          setTimerStartTime(Date.now());
          setElapsedTime(0);
        })
        .catch((err) => {
          console.error("Failed to play sound:", err);
        });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("ended", () => setIsPlaying(false));
      return () =>
        audio.removeEventListener("ended", () => setIsPlaying(false));
    }
  }, []);

  if (!currentQuestion) {
    return <div className="text-center text-white/60">問題を読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={playSound}
                  className="mt-4 group"
                  disabled={isPlaying}
                >
                  {isPlaying ? (
                    <SpeakerLoudIcon className="w-6 h-6 mr-2 animate-pulse" />
                  ) : (
                    <PlayIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
                  )}
                  {isPlaying ? "再生中..." : "音声を再生する"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>クリックして音声を再生</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="wait">
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
                  className={`w-full overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                            ${
                              selectedAnswer === null
                                ? "bg-white/5 hover:bg-white/10 border border-white/10"
                                : selectedAnswer === answer
                                ? isCorrect
                                  ? "bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30"
                                  : "bg-red-500/20 border-red-500/50 ring-2 ring-red-500/30"
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
