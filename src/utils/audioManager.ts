// グローバル音声管理システム
class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private userInteracted: boolean = false;
  private isPlayingSoundEffect: boolean = false; // 効果音再生中フラグ
  private currentSoundEffectSrc: string | null = null; // 現在再生中の効果音のsrc

  private constructor() {
    // クライアントサイドでのみ初期化
    if (typeof window !== "undefined") {
      this.initializeUserInteractionListener();
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // ユーザーインタラクションの監視
  private initializeUserInteractionListener(): void {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    const events = ["click", "touchstart", "keydown"];

    const handleUserInteraction = () => {
      this.userInteracted = true;
      // イベントリスナーを削除（一度だけ実行）
      events.forEach((event) => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };

    events.forEach((event) => {
      document.addEventListener(event, handleUserInteraction);
    });
  }

  // ユーザーがインタラクションしたかチェック
  private hasUserInteracted(): boolean {
    return this.userInteracted;
  }

  // すべての音声を停止
  stopAll(): void {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // フラグをリセット
    this.isPlayingSoundEffect = false;
    this.currentSoundEffectSrc = null;

    // ページ内のすべての音声要素を停止
    const allAudioElements = document.querySelectorAll("audio");
    allAudioElements.forEach((audio) => {
      if (audio !== this.bgmAudio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  // 効果音を再生（前の効果音は停止）
  async playSoundEffect(src: string, volume: number = 1.0): Promise<void> {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    try {
      // 同じ音声が既に再生中の場合はスキップ
      if (this.isPlayingSoundEffect && this.currentSoundEffectSrc === src) {
        console.log("同じ効果音が既に再生中のため、スキップします:", src);
        return;
      }

      // ユーザーインタラクションがない場合は警告を出して処理を停止
      if (!this.hasUserInteracted()) {
        console.warn(
          "ユーザーインタラクションが検出されていないため、音声再生をスキップします"
        );
        return;
      }

      // 前の効果音を停止
      this.stopAll();

      const audio = new Audio(src);
      audio.volume = volume;
      this.currentAudio = audio;
      this.isPlayingSoundEffect = true;
      this.currentSoundEffectSrc = src;

      await audio.play();

      // 再生完了時にクリーンアップ
      const cleanupAudio = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isPlayingSoundEffect = false;
          this.currentSoundEffectSrc = null;
        }
      };

      audio.addEventListener("ended", cleanupAudio);
      audio.addEventListener("error", cleanupAudio);
    } catch (error) {
      this.isPlayingSoundEffect = false;
      this.currentSoundEffectSrc = null;
      console.error("効果音の再生に失敗しました:", error);
      throw error;
    }
  }

  // BGMを再生/停止
  async playBGM(
    src: string,
    volume: number = 0.3,
    loop: boolean = true
  ): Promise<void> {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    try {
      // ユーザーインタラクションがない場合は警告を出して処理を停止
      if (!this.hasUserInteracted()) {
        console.warn(
          "ユーザーインタラクションが検出されていないため、BGM再生をスキップします"
        );
        return;
      }

      // 既存のBGMを停止
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      }

      const audio = new Audio(src);
      audio.volume = volume;
      audio.loop = loop;
      this.bgmAudio = audio;

      await audio.play();
    } catch (error) {
      console.error("BGMの再生に失敗しました:", error);
    }
  }

  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = null;
    }
  }

  adjustBGMVolume(volume: number): void {
    if (this.bgmAudio) {
      this.bgmAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  toggleBGM(): void {
    if (this.bgmAudio) {
      if (this.bgmAudio.paused) {
        // ユーザーインタラクションがない場合は警告
        if (!this.hasUserInteracted()) {
          console.warn(
            "ユーザーインタラクションが検出されていないため、BGM再生をスキップします"
          );
          return;
        }
        this.bgmAudio.play().catch(console.error);
      } else {
        this.bgmAudio.pause();
      }
    }
  }

  isBGMPlaying(): boolean {
    return this.bgmAudio ? !this.bgmAudio.paused : false;
  }

  // 効果音の再生状態を確認
  isSoundEffectPlaying(): boolean {
    return this.isPlayingSoundEffect;
  }

  // 現在再生中の効果音のソースを取得
  getCurrentSoundEffectSrc(): string | null {
    return this.currentSoundEffectSrc;
  }
}

export default AudioManager;
