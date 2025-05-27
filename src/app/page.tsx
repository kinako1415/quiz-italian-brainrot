"use client";

import React, { useState, useEffect } from "react";
import QuizApp from "@/components/QuizApp";
import useAudio from "@/hooks/useAudio";

export default function Home() {
  const [started, setStarted] = useState(false);
  const { stop, toggle, isPlaying } = useAudio(
    "/bgm/bgm1.mp3",
    true,
    true,
    true
  );

  useEffect(() => {
    // クイズが始まったらBGMを停止
    if (started) {
      stop();
    }
  }, [started, stop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* BGMコントロールボタン - 左上に固定配置 */}
      <button
        onClick={toggle}
        className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/30 z-50 border border-white/30"
        aria-label={isPlaying ? "BGMを停止" : "BGMを再生"}
      >
        <span className="text-xl">{isPlaying ? "🔊" : "🔇"}</span>
      </button>

      {!started ? (
        <div className="w-full max-w-lg mx-auto">
          {/* メインコンテナ */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-3">
                Italian Brainrot
              </h1>
              <p className="text-white/80 text-lg">
                イタリアンサウンドでクイズに挑戦！
              </p>
            </div>

            {/* ボタンエリア */}
            <div className="space-y-4">
              <button
                onClick={() => setStarted(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-5 px-6 rounded-2xl font-bold text-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95"
              >
                クイズを開始
              </button>

              <a
                href="/collection"
                className="block w-full bg-white/20 backdrop-blur-md text-white py-5 px-6 rounded-2xl font-bold text-xl text-center shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-white/30 active:scale-95 border border-white/30"
              >
                ギャラリーを見る
              </a>
            </div>

            {/* フッター情報 */}
            <div className="mt-8 text-center">
              <p className="text-white/70 text-sm mb-2">
                音声から正しい画像を選んでください
              </p>
              <p className="text-white/50 text-xs">
                🔊 スピーカーボタンをクリックして音声を有効にしてください
              </p>
            </div>
          </div>
        </div>
      ) : (
        <QuizApp setStarted={setStarted} />
      )}
    </div>
  );
}
