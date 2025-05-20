"use client";

import React, { useState } from "react";
import Image from "next/image";
import QuizApp from "@/components/QuizApp";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8 relative overflow-hidden">
      {!started ? (
        <div className="flex flex-col items-center gap-8 z-10">
          <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-lg">
            Sound & Image Quiz
          </h1>
          <p className="text-lg text-white/90 text-center max-w-md leading-relaxed">
            音声を聴いて、それが何の音かを画像で答えてください。
            <br />
            全問正解を目指そう！
          </p>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-blue-500 hover:to-green-400 px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg transform hover:scale-105"
          >
            スタート
          </button>
        </div>
      ) : (
        <QuizApp />
      )}
    </div>
  );
}
