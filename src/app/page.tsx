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
        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
        aria-label={isPlaying ? "BGMを停止" : "BGMを再生"}
      >
        {isPlaying ? "🔊" : "🔇"}
      </button>

      {!started ? (
        <div className="flex flex-col items-center gap-8 z-10">
          <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
            Italian Brainrot pro
          </h1>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setStarted(true)}
              className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg transform hover:scale-105"
            >
              スタート
            </button>
          </div>
        </div>
      ) : (
        <QuizApp setStarted={setStarted} />
      )}
    </div>
  );
}
