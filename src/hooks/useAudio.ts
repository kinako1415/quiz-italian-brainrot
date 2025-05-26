import { useEffect, useState, useCallback } from "react";
import AudioManager from "@/utils/audioManager";

/**
 * 音声ファイルを再生・管理するためのカスタムフック
 * @param src 音声ファイルのパス
 * @param autoPlay 自動再生するかどうか
 * @param loop ループ再生するかどうか
 * @param isBGM BGMかどうか
 * @returns 音声の制御関数を含むオブジェクト
 */
const useAudio = (
  src: string,
  autoPlay: boolean = false,
  loop: boolean = false,
  isBGM: boolean = false
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioManager = AudioManager.getInstance();

  useEffect(() => {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    // 自動再生が設定されていれば再生を開始
    if (autoPlay) {
      let hasTriedAutoplay = false;

      // ユーザーインタラクション後に実行するための遅延
      const tryAutoplay = () => {
        // 重複実行を防ぐ
        if (hasTriedAutoplay) return;
        hasTriedAutoplay = true;

        if (isBGM) {
          audioManager
            .playBGM(src, 0.3, loop)
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log(
                "BGM自動再生できませんでした（ユーザーインタラクションが必要）:",
                err.message
              );
              setIsPlaying(false);
              hasTriedAutoplay = false; // エラー時はリトライ可能にする
            });
        } else {
          audioManager
            .playSoundEffect(src, 1.0)
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.log(
                "効果音自動再生できませんでした（ユーザーインタラクションが必要）:",
                err.message
              );
              setIsPlaying(false);
              hasTriedAutoplay = false; // エラー時はリトライ可能にする
            });
        }
      };

      // ユーザーインタラクション後に試行（即座の試行は削除）
      const events = ["click", "touchstart", "keydown"];
      const retryAutoplay = () => {
        tryAutoplay();
        events.forEach((event) => {
          document.removeEventListener(event, retryAutoplay);
        });
      };

      events.forEach((event) => {
        document.addEventListener(event, retryAutoplay, { once: true });
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, retryAutoplay);
        });
      };
    }

    // クリーンアップ関数
    return () => {
      if (isBGM) {
        audioManager.stopBGM();
      }
      setIsPlaying(false);
    };
  }, [src, loop, autoPlay, isBGM, audioManager]);

  // 音声を再生する関数
  const play = useCallback(async () => {
    try {
      if (isBGM) {
        await audioManager.playBGM(src, 0.3, loop);
      } else {
        await audioManager.playSoundEffect(src, 1.0);
      }
      setIsPlaying(true);
    } catch (error) {
      console.error("音声の再生中にエラーが発生しました:", error);
      setIsPlaying(false);
    }
  }, [src, isBGM, loop, audioManager]);

  // 音声を一時停止する関数
  const pause = useCallback(() => {
    if (isBGM) {
      audioManager.toggleBGM();
      setIsPlaying(audioManager.isBGMPlaying());
    } else {
      audioManager.stopAll();
      setIsPlaying(false);
    }
  }, [isBGM, audioManager]);

  // 音声を停止する関数（再生位置も0にリセット）
  const stop = useCallback(() => {
    if (isBGM) {
      audioManager.stopBGM();
    } else {
      audioManager.stopAll();
    }
    setIsPlaying(false);
  }, [isBGM, audioManager]);

  // 再生と停止を切り替える関数
  const toggle = useCallback(() => {
    if (isBGM) {
      audioManager.toggleBGM();
      setIsPlaying(audioManager.isBGMPlaying());
    } else {
      if (isPlaying) {
        stop();
      } else {
        play();
      }
    }
  }, [isBGM, isPlaying, play, stop, audioManager]);

  // BGMの音量調整とトグルイベントリスナーを設定
  useEffect(() => {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    const handleVolumeAdjust = (e: CustomEvent) => {
      if (isBGM) {
        audioManager.adjustBGMVolume(e.detail.volume);
      }
    };

    const handleToggleBgm = () => {
      if (isBGM) {
        toggle();
      }
    };

    window.addEventListener(
      "adjust-bgm-volume",
      handleVolumeAdjust as EventListener
    );
    window.addEventListener("toggle-bgm", handleToggleBgm);

    return () => {
      window.removeEventListener(
        "adjust-bgm-volume",
        handleVolumeAdjust as EventListener
      );
      window.removeEventListener("toggle-bgm", handleToggleBgm);
    };
  }, [toggle, isBGM, audioManager]);

  return { play, pause, stop, toggle, isPlaying, audioRef: null };
};

export default useAudio;
