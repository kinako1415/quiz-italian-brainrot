"use client";

import React, { useState, useEffect } from "react";
import QuizApp from "@/components/QuizApp";
import useAudio from "@/hooks/useAudio";

export default function Home() {
  const [started, setStarted] = useState(false);
  const { stop, toggle, isPlaying } = useAudio("/bgm/bgm1.mp3", true, true);

  useEffect(() => {
    // クイズが始まったらBGMを停止
    if (started) {
      stop();
    }
  }, [started, stop]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8 relative overflow-hidden">
      {/* BGMコントロールボタン - 左上に固定配置 */}
      <button
        onClick={toggle}
        className="absolute top-4 left-4 bg-gradient-to-r from-purple-800 to-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/30 hover:shadow-xl z-50 backdrop-blur-md border border-purple-600/30"
        aria-label={isPlaying ? "BGMを停止" : "BGMを再生"}
      >
        <span
          className={isPlaying ? "animate-pulse inline-block" : "inline-block"}
        >
          {isPlaying ? "🔊" : "🔇"}
        </span>
      </button>

      {!started ? (
        <div className="flex flex-col items-center gap-8 z-10 max-w-7xl w-full px-4">
          {/* 背景効果付きのヘッダー */}
          <div className="relative mb-10 mt-12">
            {/* メインタイトル */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-purple-400 drop-shadow-lg mb-3 tracking-tight">
              Italian Brainrot Pro
            </h1>
          </div>

          <div className="flex flex-col items-center gap-6 mt-6 w-full">
            <button
              onClick={() => setStarted(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full shadow-lg transition-all duration-300 text-lg md:text-xl font-bold transform hover:scale-105 hover:shadow-xl"
            >
              クイズをスタート
            </button>
            <a
              href="/collection"
              className="bg-gradient-to-r from-purple-700 to-purple-800 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 border border-purple-500/30 backdrop-blur-sm hover:shadow-purple-500/20 hover:shadow-lg"
            >
              画像コレクションを見る
            </a>
          </div>
        </div>
      ) : (
        <QuizApp setStarted={setStarted} />
      )}
    </div>
  );
}
