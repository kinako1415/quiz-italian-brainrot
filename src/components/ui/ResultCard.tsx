import React from "react";

interface ResultCardProps {
  correctAnswers: number;
  totalQuestions: number;
  totalElapsedTime: number;
  onRestart: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  correctAnswers,
  totalQuestions,
  totalElapsedTime,
  onRestart,
}) => {
  return (
    <div
      className="text-white text-center space-y-6 p-8 bg-gradient-to-br shadow-2xl transform scale-105 animate-fade-in"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(6.5px)",
        WebkitBackdropFilter: "blur(6.5px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.18)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg">
          結果発表
        </h2>
        <p className="text-1xl font-semibold">
          正解数: <span className="text-green-400">{correctAnswers}</span> /{" "}
          {totalQuestions}
        </p>
        <p className="text-1xl font-semibold">
          合計時間:{" "}
          <span className="text-yellow-400">
            {(totalElapsedTime / 1000).toFixed(2)} 秒
          </span>
        </p>
      </div>
      <button
        className="px-8 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-104"
        onClick={onRestart}
      >
        スタート画面に戻る
      </button>
    </div>
  );
};

export default ResultCard;
