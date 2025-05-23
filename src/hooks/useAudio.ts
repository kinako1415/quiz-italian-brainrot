import { useRef, useEffect, useState, useCallback } from "react";

/**
 * 音声ファイルを再生・管理するためのカスタムフック
 * @param src 音声ファイルのパス
 * @param autoPlay 自動再生するかどうか
 * @param loop ループ再生するかどうか
 * @returns 音声の制御関数を含むオブジェクト
 */
const useAudio = (
  src: string,
  autoPlay: boolean = false,
  loop: boolean = false
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    // コンポーネントがマウントされたときに新しいAudioインスタンスを作成
    const audio = new Audio(src);
    audio.loop = loop;
    audioRef.current = audio;

    // 自動再生が設定されていれば再生を開始
    if (autoPlay) {
      // ブラウザのポリシーによっては自動再生が失敗する可能性がある
      audio.play().catch((err) => {
        console.log("自動再生できませんでした:", err);
        setIsPlaying(false);
      });
    }

    // クリーンアップ関数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, [src, loop, autoPlay]);

  // 音声を再生する関数
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        if (error.name !== "AbortError") {
          console.error("音声の再生中にエラーが発生しました:", error);
        }
      });
      setIsPlaying(true);
    }
  }, []);

  // 音声を一時停止する関数
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // 音声を停止する関数（再生位置も0にリセット）
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // 再生と停止を切り替える関数
  const toggle = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        play();
      } else {
        pause();
      }
    }
  }, [play, pause]);

  // BGMの音量調整とトグルイベントリスナーを設定
  useEffect(() => {
    const handleVolumeAdjust = (e: CustomEvent) => {
      if (audioRef.current) {
        audioRef.current.volume = e.detail.volume;
      }
    };

    const handleToggleBgm = () => {
      toggle();
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
  }, [toggle]);

  return { play, pause, stop, toggle, isPlaying, audioRef };
};

export default useAudio;
