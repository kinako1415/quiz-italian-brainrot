"use client";

import React, { useState } from "react";
import QuizApp from "@/components/QuizApp";

export default function Home() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8 relative overflow-hidden">
      {!started ? (
        <div className="flex flex-col items-center gap-8 z-10">
          <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
            Italian Brainrot pro
          </h1>
          <button
            onClick={() => setStarted(true)}
            className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg transform hover:scale-105"
          >
            スタート
          </button>
        </div>
      ) : (
        <QuizApp setStarted={setStarted} />
      )}
    </div>
  );
}
