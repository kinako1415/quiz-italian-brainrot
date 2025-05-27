import React from "react";
import useAudio from "@/hooks/useAudio";

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
  // BGMを自動再生。toggle、isPlayingは使用しないので変数を省略
  useAudio("/bgm/bgm1.mp3", true, true, true);

  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const averageTime = (totalElapsedTime / 1000 / totalQuestions).toFixed(1);

  // 成績に応じたメッセージとアイコン
  const getPerformanceMessage = () => {
    if (accuracy >= 90)
      return {
        message: "素晴らしい！ 🏆",
        emoji: "🎉",
        color: "from-yellow-400 to-orange-500",
      };
    if (accuracy >= 70)
      return {
        message: "よくできました！ 🌟",
        emoji: "👏",
        color: "from-green-400 to-blue-500",
      };
    if (accuracy >= 50)
      return {
        message: "がんばりました！ 💪",
        emoji: "😊",
        color: "from-blue-400 to-purple-500",
      };
    return {
      message: "練習あるのみ！ 📚",
      emoji: "💪",
      color: "from-purple-400 to-pink-500",
    };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-3 overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        {/* メインリザルトカード */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/20 text-center">
          {/* ヘッダーアイコン */}
          <div className="text-4xl mb-3 animate-bounce">
            {performance.emoji}
          </div>

          {/* タイトル */}
          <h2
            className={`text-2xl font-bold mb-3 bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}
          >
            クイズ完了！
          </h2>

          {/* パフォーマンスメッセージ */}
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 mb-4">
            <p className="text-white text-lg font-semibold">
              {performance.message}
            </p>
          </div>

          {/* 統計情報をコンパクトにまとめる */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* 正解率 */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
              <div className="text-center">
                <span className="text-white/80 text-sm block">正解率</span>
                <span className="text-white text-xl font-bold">
                  {accuracy}%
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    accuracy >= 90
                      ? "from-green-400 to-emerald-500"
                      : accuracy >= 70
                      ? "from-blue-400 to-cyan-500"
                      : accuracy >= 50
                      ? "from-yellow-400 to-orange-500"
                      : "from-red-400 to-pink-500"
                  } transition-all duration-1000 ease-out`}
                  style={{ width: `${accuracy}%` }}
                ></div>
              </div>
            </div>

            {/* 正解数 */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
              <div className="text-center">
                <span className="text-white/80 text-sm block">正解数</span>
                <span className="text-white text-xl font-bold">
                  <span className="text-green-400">{correctAnswers}</span>
                  <span className="text-white/60">/{totalQuestions}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 時間情報 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* 総時間 */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
              <div className="text-center">
                <span className="text-white/80 text-sm block">総時間</span>
                <span className="text-white text-lg font-bold">
                  <span className="text-yellow-400">
                    {(totalElapsedTime / 1000).toFixed(1)}
                  </span>
                  <span className="text-white/60 text-sm">秒</span>
                </span>
              </div>
            </div>

            {/* 平均時間 */}
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3">
              <div className="text-center">
                <span className="text-white/80 text-sm block">平均時間</span>
                <span className="text-white text-lg font-bold">
                  <span className="text-purple-400">{averageTime}</span>
                  <span className="text-white/60 text-sm">秒</span>
                </span>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="space-y-2">
            <button
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-95"
              onClick={onRestart}
            >
              🏠 ホームに戻る
            </button>

            <button
              className="w-full py-2 px-6 bg-white/20 backdrop-blur-md text-white font-semibold text-sm rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-[1.02]"
              onClick={() => window.location.reload()}
            >
              🔄 もう一度プレイ
            </button>
          </div>

          {/* 追加メッセージ */}
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/60 text-xs">
              もっと探索したい？ギャラリーをチェックしてみてください！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
