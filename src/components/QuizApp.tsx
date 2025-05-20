"use client";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import {
  currentQuestionIndexAtom,
  questionsAtom,
  selectedAnswerAtom,
  gameStatusAtom,
  correctAnswersAtom,
  incorrectAnswersAtom,
} from "@/atoms";
import Image from "next/image";

const QuizApp = ({ setStarted }: { setStarted: (value: boolean) => void }) => {
  const [questions, setQuestions] = useAtom(questionsAtom);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useAtom(
    currentQuestionIndexAtom
  );
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [gameStatus, setGameStatus] = useAtom(gameStatusAtom);
  const [correctAnswers, setCorrectAnswers] = useAtom(correctAnswersAtom);
  const [incorrectAnswers, setIncorrectAnswers] = useAtom(incorrectAnswersAtom);
  const [shuffled, setShuffled] = React.useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = React.useState(0); // 経過時間を管理

  // 再生中の音声を管理するための ref を追加
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // 問題データの読み込み
  useEffect(() => {
    const fetchFiles = async (path: string): Promise<string[]> => {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`Failed to fetch files from ${path}`);
      return res.json();
    };

    const loadQuestions = async () => {
      try {
        const soundFiles = await fetchFiles("/api/sounds");
        const imageFiles = await fetchFiles("/api/images");

        const questions = soundFiles
          .filter((sound) =>
            imageFiles.includes(sound.replace(".mp3", ".webp"))
          )
          .map((sound) => {
            const correctAnswer = sound.replace(".mp3", ".webp");
            const incorrectAnswers = imageFiles
              .filter((img) => img !== correctAnswer)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

            return {
              sound,
              correctAnswer,
              incorrectAnswers,
              questionText: "この音は何でしょう？",
            };
          });

        setQuestions(questions.sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    loadQuestions();
  }, [setQuestions]);

  useEffect(() => {
    if (!questions.length) {
      setShuffled([]);
      return;
    }

    const current = questions[currentQuestionIndex];

    // 正解の画像
    const correctImage = current.correctAnswer;

    // 不正解の画像をランダムに3つ選択
    const incorrectImages = current.incorrectAnswers
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // 正解と不正解を混ぜてシャッフル
    const allAnswers = [correctImage, ...incorrectImages].sort(
      () => Math.random() - 0.5
    );
    setShuffled(allAnswers);
  }, [questions, currentQuestionIndex]);

  const handleSelect = (img: string) => {
    // すでに回答が選択されている場合は何もしない
    if (selectedAnswer || !current?.sound) return; // 音声がない場合は何もしない

    // 回答を選択
    setSelectedAnswer(img);

    // 正解・不正解のカウントを更新
    if (img === current.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = React.useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setElapsedTime(0); // タイマーをリセット
    } else {
      setGameStatus("finished");
    }
  }, [
    currentQuestionIndex,
    questions.length,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setGameStatus,
  ]);

  React.useEffect(() => {
    const timer = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const current = questions[currentQuestionIndex] || null;

  const playAudio = React.useCallback(() => {
    if (!current) return; // current が null の場合は何もしない

    // 再生中の音声を停止
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 新しい音声を再生
    const audioElement = new Audio(`/sound/${current.sound}`);
    audioRef.current = audioElement;
    audioElement.play().catch((error) => {
      if (error.name !== "AbortError") {
        console.error("音声の再生中にエラーが発生しました:", error);
      }
    });
  }, [current]);

  React.useEffect(() => {
    playAudio();
  }, [current, playAudio]);

  if (gameStatus === "finished") {
    return (
      <div className="text-white text-center space-y-6 p-8 bg-gradient-to-br from-purple-800 to-gray-900 rounded-lg shadow-2xl transform scale-105 animate-fade-in">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
          結果発表
        </h2>
        <p className="text-2xl font-semibold">
          正解数: <span className="text-green-400">{correctAnswers}</span> /{" "}
          {questions.length}
        </p>
        <button
          className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-full shadow-lg hover:from-pink-500 hover:to-purple-400 transition-all duration-300 transform hover:scale-110"
          onClick={() => {
            setStarted(false);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setCorrectAnswers(0);
            setIncorrectAnswers(0);
            setGameStatus("ready");
          }}
        >
          スタート画面に戻る
        </button>
      </div>
    );
  }

  if (!current) {
    return <div className="text-white">問題を読み込んでいます...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 bg-gradient-to-b rounded-lg shadow-xl fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md sm:p-6 md:p-8">
      <p className="text-white text-lg font-semibold text-center sm:text-xl md:text-2xl">
        {current.questionText}
      </p>
      <div className="flex items-center justify-center gap-2 text-white text-sm font-medium sm:gap-4 md:gap-6">
        <span className="bg-gray-700 text-green-400 px-3 py-1 rounded-full shadow-md sm:px-4 sm:py-2 md:px-5 md:py-3">
          ⏱️ {elapsedTime} 秒
        </span>
        <button
          onClick={playAudio}
          disabled={false} // 再生ボタンを常に有効化
          className="bg-blue-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-blue-600 transition-all duration-300 sm:px-4 sm:py-2 md:px-5 md:py-3"
        >
          再生
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {shuffled.map((img) => (
          <button
            key={img}
            onClick={() => handleSelect(img)}
            disabled={!!selectedAnswer}
            className={`relative rounded-lg overflow-hidden border-4 transition-all duration-300 transform hover:scale-105 sm:border-2 md:border-4 ${
              selectedAnswer
                ? img === current.correctAnswer
                  ? "border-green-500 shadow-lg shadow-green-500/50"
                  : selectedAnswer === img
                  ? "border-red-500 shadow-lg shadow-red-500/50"
                  : "border-gray-700 opacity-70"
                : "border-gray-700 hover:border-blue-400 active:scale-95"
            }`}
          >
            <Image
              src={"/img/" + img}
              alt={"選択肢"}
              width={150}
              height={150}
              className={`object-cover w-full h-full rounded-lg ${
                selectedAnswer &&
                selectedAnswer !== img &&
                img !== current.correctAnswer
                  ? "opacity-50"
                  : ""
              }`}
            />
          </button>
        ))}
      </div>
      {selectedAnswer && (
        <div className="text-white mt-2 text-lg font-bold text-center sm:text-xl md:text-2xl">
          {selectedAnswer === current.correctAnswer ? "正解！" : "不正解..."}
        </div>
      )}
      <button
        onClick={handleNext}
        disabled={false} // 次へボタンを常に有効化
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 sm:px-6 sm:py-3 md:px-8 md:py-4"
      >
        次へ
      </button>
    </div>
  );
};

export default QuizApp;
