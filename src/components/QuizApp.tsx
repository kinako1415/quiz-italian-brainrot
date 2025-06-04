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

    // 音声ボタンがクリックされた時点でユーザーインタラクションを確実に設定
    audioManager.setUserInteracted();

    // 現在の問題の詳細をログ出力
    console.log("現在の問題:", current);
    console.log("音声ファイル名:", current.sound);
    console.log(
      "ユーザーインタラクション状態:",
      audioManager.hasUserInteracted()
    );

    // 既に同じ音声が再生中の場合はスキップ
    if (
      audioManager.isSoundEffectPlaying() &&
      audioManager.getCurrentSoundEffectSrc() === `/sound/${current.sound}`
    ) {
      console.log("同じ音声が既に再生中のため、スキップします");
      return;
    }

    // BGMの音量を下げる
    adjustBgmVolume(0.2); // BGMの音量を20%に下げる

    try {
      const soundPath = `/sound/${current.sound}`;
      console.log("再生する音声ファイル:", soundPath);

      // 音声ファイルが存在するかチェック
      const response = await fetch(soundPath, { method: "HEAD" });
      console.log(
        "音声ファイルの存在確認:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        throw new Error(
          `音声ファイルが見つかりません: ${soundPath} (${response.status})`
        );
      }

      // ユーザーインタラクションの再確認（音声再生直前）
      if (!audioManager.hasUserInteracted()) {
        console.warn(
          "ユーザーインタラクションが検出されていません。再設定を試行します。"
        );
        audioManager.setUserInteracted();
      }

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

      // AbortErrorは正常な中断なので、エラーメッセージを表示しない
      if (error instanceof Error && error.name === "AbortError") {
        console.log("音声再生が正常に中断されました");
      } else {
        console.error("音声の再生中にエラーが発生しました:", errorMessage);

        // autoplayポリシーエラーの場合は特別なメッセージ
        if (
          errorMessage.includes("autoplayポリシー") ||
          errorMessage.includes("user didn't interact") ||
          errorMessage.includes("autoplay") ||
          errorMessage.includes("NotAllowedError")
        ) {
          console.log("🎵 音声を聞くには、🔊ボタンを直接クリックしてください");
          alert(
            "🔊 音声を再生するには、ボタンを直接クリックしてください。\n\nブラウザの音声再生ポリシーにより、ユーザーの操作が必要です。"
          );
        } else {
          // その他のエラー（ファイルが見つからない等）
          alert(`音声再生エラー: ${errorMessage}`);
        }
      }

      // エラー発生時もBGM音量を元に戻す
      adjustBgmVolume(1.0);
    }
  }, [current, gameStatus, adjustBgmVolume, audioManager]);

  // 問題が変わった時の処理（BGMを停止して問題の音声を自動再生）
  React.useEffect(() => {
    if (current && gameStatus === "playing") {
      // 問題が表示されたらBGMを停止して音声を自動再生
      const playQuestionAudio = async () => {
        try {
          // BGMを停止
          audioManager.stopBGM();
          
          // 少し待ってから音声を再生（BGM停止の完了を待つ）
          setTimeout(async () => {
            try {
              const soundPath = `/sound/${current.sound}`;
              console.log("新しい問題の音声を自動再生:", soundPath);
              
              // 音声ファイルが存在するかチェック
              const response = await fetch(soundPath, { method: "HEAD" });
              if (response.ok) {
                // 音声を自動再生
                await audioManager.playSoundEffect(soundPath, 1.0);
                console.log("問題音声の自動再生開始成功");
              } else {
                console.warn("音声ファイルが見つかりません:", soundPath);
              }
            } catch (error) {
              // autoplayエラーの場合は静かに失敗し、ユーザーに🔊ボタンを促す
              if (error instanceof Error && 
                  (error.message.includes("autoplay") || 
                   error.message.includes("user didn't interact") ||
                   error.message.includes("NotAllowedError"))) {
                console.log("自動再生は制限されました。🔊ボタンをクリックして音声を聞いてください。");
              } else {
                console.error("音声の自動再生中にエラーが発生しました:", error);
              }
            }
          }, 300); // 300ms待機してからBGM停止後に音声再生
          
        } catch (error) {
          console.error("BGM停止中にエラーが発生しました:", error);
        }
      };

      playQuestionAudio();
    }
  }, [current, gameStatus, audioManager]);

  // ゲームステータスに応じたBGM制御
  React.useEffect(() => {
    const handleStatusChange = async () => {
      if (gameStatus === "playing") {
        // クイズ問題が開始されたらBGMを停止
        audioManager.stopBGM();
      } else if (gameStatus === "finished") {
        // ゲーム終了時もBGMを停止し、全ての音声効果を停止
        await audioManager.stopAll();
        audioManager.stopBGM();
      }
    };

    handleStatusChange();
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
      <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
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
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-3 overflow-hidden">
      {/* ホームに戻るボタン - 右上に固定配置 */}
      <button
        onClick={async () => {
          // 現在再生中の音声があれば停止（非同期で待機）
          await audioManager.stopAll();
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
        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/30 z-50 border border-white/30"
        title="ホームに戻る（ゲームをリセット）"
        aria-label="ホームに戻る"
      >
        <span className="text-lg">🏠</span>
      </button>

      <div className="w-full max-w-md mx-auto">
        {/* メインコンテナ */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/20">
          {/* ヘッダー */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                <span className="text-white font-semibold text-xs">
                  問題 {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              <button
                onClick={(e) => {
                  // イベントの伝播を止める
                  e.stopPropagation();

                  // より確実なユーザーインタラクション設定
                  audioManager.setUserInteracted();

                  // 音声再生を実行
                  playAudio();
                }}
                onMouseDown={(e) => {
                  // マウスダウンでもユーザーインタラクションを設定
                  e.stopPropagation();
                  audioManager.setUserInteracted();
                }}
                onTouchStart={(e) => {
                  // タッチ開始でもユーザーインタラクションを設定
                  e.stopPropagation();
                  audioManager.setUserInteracted();
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                title="音声をもう一度聞く"
                aria-label="音声をもう一度再生"
              >
                <span className="text-lg">🔊</span>
              </button>
            </div>

            <h2 className="text-white text-lg font-semibold mb-2">
              音声に合う画像を選んでください
            </h2>

            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full inline-block">
              <span className="text-white text-xs">
                ⏱️ {(elapsedTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          {/* 正解/不正解表示 - 固定高さを確保してコンテンツジャンプを防止 */}
          <div className="text-center mb-3 h-10 flex items-center justify-center">
            {selectedAnswer ? (
              <div
                className={`inline-block px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedAnswer === current.correctAnswer
                    ? "bg-green-500/80 text-white"
                    : "bg-red-500/80 text-white"
                }`}
              >
                {selectedAnswer === current.correctAnswer
                  ? "正解！ ✓"
                  : "不正解！ ✗"}
              </div>
            ) : (
              <div className="h-8 w-full"></div>
            )}
          </div>

          {/* 画像選択グリッド */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {shuffled.map((img) => (
              <button
                key={img}
                onClick={() => handleSelect(img)}
                disabled={!!selectedAnswer}
                className={`relative rounded-xl overflow-hidden aspect-square transition-all duration-300 border-2 ${
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
                    <span className="text-white text-xl font-bold">✓</span>
                  </div>
                )}

                {selectedAnswer &&
                  selectedAnswer === img &&
                  img !== current.correctAnswer && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">✗</span>
                    </div>
                  )}
              </button>
            ))}
          </div>

          {/* 次の問題ボタン - コンテンツ内に配置 */}
          <div className="mt-4">
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
                selectedAnswer
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-[1.02] active:scale-95 hover:shadow-pink-500/50"
                  : "bg-white/20 backdrop-blur-md text-white/50 cursor-not-allowed border border-white/30"
              }`}
            >
              {currentQuestionIndex < questions.length - 1
                ? "次の問題 →"
                : "結果を見る 🏆"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;
