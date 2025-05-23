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

  // 再生中の音声を管理するための ref を追加
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null); // タイマーを管理

  // カスタムイベントを使ってBGMの音量を調整するための関数
  const adjustBgmVolume = React.useCallback((volume: number) => {
    // BGMの音量を調整するカスタムイベントを発行
    const event = new CustomEvent("adjust-bgm-volume", { detail: { volume } });
    window.dispatchEvent(event);
  }, []);

  // 問題データの読み込み
  useEffect(() => {
    // 他の場所で再生されているかもしれないBGMを停止するための空のAudio要素
    const bgmElements = document.querySelectorAll("audio");
    bgmElements.forEach((element) => {
      if (element !== audioRef.current) {
        element.pause();
        element.currentTime = 0;
      }
    });

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

  const playAudio = React.useCallback(() => {
    if (!current) return; // current が null の場合は何もしない
    if (gameStatus === "finished") return; // ゲーム終了時は音を再生しない

    // 再生中の音声を停止
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // BGMの音量を下げる
    adjustBgmVolume(0.2); // BGMの音量を20%に下げる

    try {
      // 新しい音声を再生
      const soundPath = `/sound/${current.sound}`;
      console.log("再生する音声ファイル:", soundPath);

      // HTMLAudioElementを作成
      const audioElement = document.createElement("audio");

      // イベントリスナー設定を先に行う
      audioElement.addEventListener("ended", () => {
        console.log("音声再生完了");
        adjustBgmVolume(1.0); // BGMの音量を100%に戻す
      });

      audioElement.addEventListener("canplaythrough", () => {
        console.log("音声データの読み込みが完了し、再生の準備ができました");
      });

      audioElement.addEventListener("error", (e) => {
        console.error("音声読み込みエラー:", e);
        adjustBgmVolume(1.0); // エラー時にBGM音量を戻す
      });

      // ソース設定
      audioElement.src = soundPath;
      audioElement.preload = "auto";
      audioRef.current = audioElement;

      // 再生開始
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("音声再生開始成功"))
          .catch((error) => {
            console.error("音声の再生中にエラーが発生しました:", error);
            // 自動再生がブロックされた可能性がある場合はコンソールに出力
            if (error.name === "NotAllowedError") {
              console.log(
                "自動再生がブラウザにブロックされました。ユーザーインタラクションが必要です。"
              );
            }
            // エラー発生時もBGM音量を元に戻す
            adjustBgmVolume(1.0);
          });
      }
    } catch (err) {
      console.error("予期せぬエラーが発生しました:", err);
      adjustBgmVolume(1.0); // 例外発生時もBGM音量を元に戻す
    }
  }, [current, gameStatus, adjustBgmVolume]);

  // 問題が変わるたびに自動で音声を再生する（複数回試行する戦略）
  React.useEffect(() => {
    if (current) {
      // 即時実行
      playAudio();

      // ブラウザの自動再生ポリシーに対応するため、異なる遅延時間で複数回再生を試みる
      const retryTimes = [100, 300, 600]; // ミリ秒単位での遅延時間

      const timeoutIds: NodeJS.Timeout[] = [];

      retryTimes.forEach((delay) => {
        const timeoutId = setTimeout(() => {
          // 既に再生中でなければ再度再生を試みる
          if (audioRef.current && audioRef.current.paused) {
            console.log(`${delay}ms遅延後に再生を再試行します`);
            playAudio();
          }
        }, delay);

        timeoutIds.push(timeoutId);
      });

      // クリーンアップ関数
      return () => {
        timeoutIds.forEach((id) => clearTimeout(id));
      };
    }
  }, [current, playAudio]);

  React.useEffect(() => {
    if (gameStatus === "finished" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [gameStatus]);

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
    <div className="flex flex-col items-center justify-center h-screen gap-4 p-4 bg-gradient-to-b rounded-lg shadow-xl fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md sm:p-6 md:p-8">
      {/* BGMコントロールボタン - 左上に固定配置 */}
      <button
        onClick={() => {
          // ここでBGMのトグルイベントを発行
          const event = new CustomEvent("toggle-bgm");
          window.dispatchEvent(event);
        }}
        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
        aria-label="BGM再生/停止"
      >
        🔊
      </button>

      {selectedAnswer && (
        <div className="text-white mt-2 text-lg font-bold text-center fixed sm:text-xl z-50 top-[10%] transform -translate-y-1/2 md:text-2xl">
          {selectedAnswer === current.correctAnswer ? "正解！" : "不正解..."}
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-1">
        <p className="text-white text-lg font-semibold text-center sm:text-xl md:text-2xl">
          kore wa nani no oto desu ka?
        </p>
        {/* 音声自動再生の状態を表示 */}
        <div className="text-white text-xs font-light animate-pulse">
          🔊 現在の問題数は29個
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-white text-sm font-medium sm:gap-4 md:gap-6">
        <span className="bg-gray-700 text-green-400 px-3 py-1 rounded-full shadow-md sm:px-4 sm:py-2 md:px-5 md:py-3">
          ⏱️ {(elapsedTime / 1000).toFixed(2)} 秒
        </span>
        <button
          onClick={playAudio}
          disabled={false}
          className="bg-gray-600 text-white px-3 py-1 rounded-full shadow-md hover:bg-gray-500 transition-all duration-300 sm:px-4 sm:py-2 md:px-5 md:py-3 flex items-center gap-1"
          title="音声をもう一度聞く"
          aria-label="音声をもう一度再生"
        >
          <span role="img" aria-hidden="true">
            🔊
          </span>{" "}
          <span className="text-xs sm:text-sm">もう一度聞く</span>
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
              className="object-cover w-[150px] h-[150px]"
            />
          </button>
        ))}
      </div>
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
