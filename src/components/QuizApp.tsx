"use client";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import {
  currentQuestionIndexAtom,
  questionsAtom,
  selectedAnswerAtom,
  gameStatusAtom,
  correctAnswersAtom,
} from "@/atoms";
import Image from "next/image";
import ResultCard from "./ui/ResultCard";
import AudioManager from "@/utils/audioManager";

const QuizApp = ({ setStarted }: { setStarted: (value: boolean) => void }) => {
  const [questions, setQuestions] = useAtom(questionsAtom);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useAtom(
    currentQuestionIndexAtom
  );
  const [selectedAnswer, setSelectedAnswer] = useAtom(selectedAnswerAtom);
  const [gameStatus, setGameStatus] = useAtom(gameStatusAtom);
  const [correctAnswers, setCorrectAnswers] = useAtom(correctAnswersAtom);
  const [shuffled, setShuffled] = React.useState<string[]>([]);
  const [elapsedTime, setElapsedTime] = React.useState(0); // 経過時間 (ms 単位)
  const [totalElapsedTime, setTotalElapsedTime] = React.useState(0); // 全体の合計時間 (ms 単位)

  // 音声管理システムとタイマーの ref を追加
  const audioManager = AudioManager.getInstance();
  const timerRef = React.useRef<NodeJS.Timeout | null>(null); // タイマーを管理

  // カスタムイベントを使ってBGMの音量を調整するための関数
  const adjustBgmVolume = React.useCallback(
    (volume: number) => {
      audioManager.adjustBGMVolume(volume);
    },
    [audioManager]
  );

  // 問題データの読み込み
  useEffect(() => {
    // 他の音声を停止し、BGMも停止（クイズ開始時）
    audioManager.stopAll();
    audioManager.stopBGM();

    // ブラウザのオーディオ再生ポリシー対応のため、ユーザーインタラクション時に一度オーディオコンテキストを開始する
    const setupAudioContext = () => {
      try {
        // AudioContextを作成して一時的に開始し、すぐに中断する（ブラウザの自動再生ポリシー対策）
        // ブラウザのオーディオAPIを適切に処理
        // @ts-expect-error -- SafariのwebkitAudioContextとの互換性のため
        const AudioContext = window.AudioContext || window.webkitAudioContext;

        if (AudioContext) {
          const audioCtx = new AudioContext();
          const silenceSource = audioCtx.createBufferSource();
          silenceSource.start();
          silenceSource.stop();
          console.log("AudioContext初期化完了");
        }
      } catch (e) {
        console.log("AudioContext初期化エラー:", e);
      }
    };

    // ページロード時にユーザーインタラクションを待たずに一度試みる
    setupAudioContext();

    // ユーザーインタラクションイベントでオーディオコンテキストを初期化
    const initAudioOnInteraction = () => {
      setupAudioContext();
      // イベントを一度処理したら削除
      ["click", "touchstart", "keydown"].forEach((event) => {
        window.removeEventListener(event, initAudioOnInteraction);
      });
    };

    // イベントリスナーを追加
    ["click", "touchstart", "keydown"].forEach((event) => {
      window.addEventListener(event, initAudioOnInteraction);
    });

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

        setQuestions(questions.sort(() => Math.random() - 0.5).slice(0, 10));
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    loadQuestions();

    // クリーンアップ関数
    return () => {
      ["click", "touchstart", "keydown"].forEach((event) => {
        window.removeEventListener(event, initAudioOnInteraction);
      });
    };
  }, [setQuestions, audioManager]);

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
    }
  };

  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 10); // 10ms ごとに更新
    }, 10); // 更新間隔を10msに設定

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleNext = React.useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setTotalElapsedTime((prev) => prev + elapsedTime); // 合計時間を更新
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setElapsedTime(0); // タイマーをリセット
    } else {
      setTotalElapsedTime((prev) => prev + elapsedTime); // 最後の問題の時間を加算
      setGameStatus("finished");
      if (timerRef.current) {
        clearInterval(timerRef.current); // タイマーを終了
      }
    }
  }, [
    currentQuestionIndex,
    questions.length,
    elapsedTime,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setGameStatus,
  ]);

  const current = questions[currentQuestionIndex] || null;

  const playAudio = React.useCallback(async () => {
    if (!current) return; // current が null の場合は何もしない
    if (gameStatus === "finished") return; // ゲーム終了時は音を再生しない

    // BGMの音量を下げる
    adjustBgmVolume(0.2); // BGMの音量を20%に下げる

    try {
      const soundPath = `/sound/${current.sound}`;
      console.log("再生する音声ファイル:", soundPath);

      // 新しい音声管理システムを使用して音声を再生
      await audioManager.playSoundEffect(soundPath, 1.0);
      console.log("音声再生開始成功");

      // 音声再生完了後にBGM音量を元に戻すため、setTimeout を使用
      setTimeout(() => {
        adjustBgmVolume(1.0);
      }, 3000); // 3秒後にBGM音量を戻す（音声の長さに応じて調整可能）
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log("音声の再生中にエラーが発生しました:", errorMessage);

      // 自動再生ポリシーエラーの場合は特別なメッセージ
      if (
        errorMessage.includes("user didn't interact") ||
        errorMessage.includes("autoplay")
      ) {
        console.log("ユーザーインタラクション後に音声が再生されます");
      }

      // エラー発生時もBGM音量を元に戻す
      adjustBgmVolume(1.0);
    }
  }, [current, gameStatus, adjustBgmVolume, audioManager]);

  // 問題が変わるたびに自動で音声を再生する
  React.useEffect(() => {
    if (current) {
      // 音声を1回だけ再生
      playAudio();
    }
  }, [current, playAudio]);

  // ゲームステータスに応じたBGM制御
  React.useEffect(() => {
    if (gameStatus === "playing") {
      // クイズ問題が開始されたらBGMを停止
      audioManager.stopBGM();
    } else if (gameStatus === "finished") {
      // ゲーム終了時もBGMを停止し、全ての音声効果を停止
      audioManager.stopAll();
      audioManager.stopBGM();
    }
  }, [gameStatus, audioManager]);

  if (gameStatus === "finished") {
    return (
      <ResultCard
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        totalElapsedTime={totalElapsedTime}
        onRestart={() => {
          setStarted(false);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setCorrectAnswers(0);
          setGameStatus("ready");
          setTotalElapsedTime(0); // 合計時間をリセット
        }}
      />
    );
  }

  if (!current) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b">
        <div className="flex flex-col items-center">
          <div className="loader mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-white text-lg font-semibold animate-pulse">
            ローディング中...
          </p>
        </div>
        <style jsx>{`
          .loader {
            display: flex;
            justify-content: space-around;
            width: 80px;
            height: 80px;
            position: relative;
          }
          .loader div {
            width: 16px;
            height: 16px;
            background-color: #ffffff;
            border-radius: 50%;
            animation: loader-animation 1.2s infinite ease-in-out;
          }
          .loader div:nth-child(1) {
            animation-delay: -0.24s;
          }
          .loader div:nth-child(2) {
            animation-delay: -0.12s;
          }
          .loader div:nth-child(3) {
            animation-delay: 0;
          }
          @keyframes loader-animation {
            0%,
            80%,
            100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      {/* BGMコントロールボタン - 左上に固定配置 */}
      <button
        onClick={() => {
          audioManager.toggleBGM();
        }}
        className="absolute top-6 left-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/30 z-50 border border-white/30"
        aria-label="BGM再生/停止"
      >
        <span className="text-xl">🔊</span>
      </button>

      {/* ホームに戻るボタン - 右上に固定配置 */}
      <button
        onClick={() => {
          // 現在再生中の音声があれば停止
          audioManager.stopAll();
          audioManager.stopBGM();

          // BGMの音量を戻す（次回のために）
          adjustBgmVolume(1.0);

          // クイズの状態をリセット
          setStarted(false);
          setCurrentQuestionIndex(0);
          setSelectedAnswer(null);
          setCorrectAnswers(0);
          setGameStatus("ready");
          setTotalElapsedTime(0);
          setElapsedTime(0);

          // タイマーを停止
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }}
        className="absolute top-6 right-6 bg-white/20 backdrop-blur-md text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/30 z-50 border border-white/30"
        title="ホームに戻る（ゲームをリセット）"
        aria-label="ホームに戻る"
      >
        <span className="text-xl">🏠</span>
      </button>

      <div className="w-full max-w-lg mx-auto">
        {/* メインコンテナ */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                <span className="text-white font-semibold text-sm">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              <button
                onClick={playAudio}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                title="音声をもう一度聞く"
                aria-label="音声をもう一度再生"
              >
                <span className="text-xl">🔊</span>
              </button>
            </div>

            <h2 className="text-white text-xl font-semibold mb-2">
              Which image matches the sound?
            </h2>

            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full inline-block">
              <span className="text-white text-sm">
                ⏱️ {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* 正解/不正解表示 */}
          {selectedAnswer && (
            <div className="text-center mb-4">
              <div
                className={`inline-block px-6 py-2 rounded-full font-semibold text-lg ${
                  selectedAnswer === current.correctAnswer
                    ? "bg-green-500/80 text-white"
                    : "bg-red-500/80 text-white"
                }`}
              >
                {selectedAnswer === current.correctAnswer
                  ? "Correct! ✓"
                  : "Wrong! ✗"}
              </div>
            </div>
          )}

          {/* 画像選択グリッド */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {shuffled.map((img) => (
              <button
                key={img}
                onClick={() => handleSelect(img)}
                disabled={!!selectedAnswer}
                className={`relative rounded-2xl overflow-hidden aspect-square transition-all duration-300 border-2 ${
                  selectedAnswer
                    ? img === current.correctAnswer
                      ? "border-green-500 bg-green-500/20 scale-105"
                      : selectedAnswer === img
                      ? "border-red-500 bg-red-500/20 scale-95"
                      : "border-white/30 opacity-60"
                    : "border-white/30 hover:border-white/60 hover:scale-105 active:scale-95"
                }`}
              >
                <Image
                  src={"/img/" + img}
                  alt={"選択肢"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* 選択インジケーター */}
                {selectedAnswer && img === current.correctAnswer && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">✓</span>
                  </div>
                )}

                {selectedAnswer &&
                  selectedAnswer === img &&
                  img !== current.correctAnswer && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">✗</span>
                    </div>
                  )}
              </button>
            ))}
          </div>

          {/* Next ボタン */}
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              selectedAnswer
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:scale-[1.02] active:scale-95"
                : "bg-white/20 text-white/50 cursor-not-allowed"
            }`}
          >
            {currentQuestionIndex < questions.length - 1
              ? "Next Question"
              : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
