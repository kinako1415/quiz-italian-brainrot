"use client";

import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { questionsAtom, gameStatusAtom } from "@/atoms";
import QuestionArea from "@/components/QuestionArea";
import AnswerButton from "@/components/AnswerButton";
import ResultArea from "@/components/ResultArea";
import Timer from "@/components/Timer";

export default function Home() {
  const [, setQuestions] = useAtom(questionsAtom);
  const [gameStatus, setGameStatus] = useAtom(gameStatusAtom);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/data/questions.json");
        const data = await response.json();
        setQuestions(data);
        setGameStatus("ready");
      } catch (error) {
        console.error("Failed to load questions:", error);
        setGameStatus("error");
      }
    };
    loadQuestions();
  }, [setQuestions, setGameStatus]);

  if (gameStatus === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-red-500">
          <h1 className="text-4xl font-bold mb-4">エラー</h1>
          <p className="text-lg">
            問題の読み込みに失敗しました。もう一度お試しください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Sound & Image Quiz
        </h1>
        {gameStatus === "ready" && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-white/90 text-lg mb-6">
              音声を聴いて、それが何の音かを画像で答えてください。
            </p>
            <button
              onClick={() => setGameStatus("playing")}
              className="bg-green-500/20 text-green-400 hover:bg-green-500/30
                                     border border-green-500/30 px-8 py-3 rounded-full shadow-lg
                                     transition-all duration-300"
            >
              スタート
            </button>
          </motion.div>
        )}
        {gameStatus === "playing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Timer />
            <QuestionArea />
            <AnswerButton />
          </motion.div>
        )}
        {gameStatus === "finished" && <ResultArea />}
      </div>
    </div>
  );
}
