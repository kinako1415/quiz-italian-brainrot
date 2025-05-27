// グローバル音声管理システム
class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private userInteracted: boolean = false;
  private isPlayingSoundEffect: boolean = false; // 効果音再生中フラグ
  private currentSoundEffectSrc: string | null = null; // 現在再生中の効果音のsrc
  private playPromise: Promise<void> | null = null; // 再生中のPromiseを追跡
  private isStoppingAll: boolean = false; // stopAll実行中フラグ

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
  } // ユーザーインタラクションの監視
  private initializeUserInteractionListener(): void {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    const events = [
      "click",
      "touchstart",
      "keydown",
      "mousedown",
      "pointerdown",
      "touchend",
      "mouseup",
    ];

    const handleUserInteraction = (event: Event) => {
      if (!this.userInteracted) {
        this.userInteracted = true;
        console.log(
          "ユーザーインタラクションが検出されました:",
          event.type,
          event.target
        );

        // AudioContextの初期化も行う
        this.initializeAudioContext();

        // より確実にAudioContextを resume する
        this.resumeAudioContext();

        // イベントリスナーを削除（一度だけ実行）
        events.forEach((eventType) => {
          document.removeEventListener(eventType, handleUserInteraction, {
            capture: true,
          });
          document.removeEventListener(eventType, handleUserInteraction, {
            capture: false,
          });
        });
      }
    };

    // キャプチャフェーズとバブリングフェーズの両方でリスンしてより確実にキャッチ
    events.forEach((eventType) => {
      document.addEventListener(eventType, handleUserInteraction, {
        passive: true,
        capture: true,
      });
      document.addEventListener(eventType, handleUserInteraction, {
        passive: true,
        capture: false,
      });
    });
  }

  // 手動でユーザーインタラクションを設定（音声ボタンクリック時に呼び出し）
  public setUserInteracted(): void {
    if (!this.userInteracted) {
      this.userInteracted = true;
      console.log("ユーザーインタラクションを手動で設定しました");
      this.initializeAudioContext();
      this.resumeAudioContext();
    } else {
      // 既にインタラクションが設定されていても、AudioContextのresumeを試行
      this.resumeAudioContext();
    }
  }

  // AudioContextの初期化
  private initializeAudioContext(): void {
    try {
      // @ts-expect-error -- SafariのwebkitAudioContextとの互換性のため
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (AudioContext) {
        const audioCtx = new AudioContext();
        // サイレント音源を再生してAudioContextを開始
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
        console.log("AudioContext初期化完了");
      }
    } catch (e) {
      console.log("AudioContext初期化エラー:", e);
    }
  }

  // AudioContextをresumeする（suspended状態からの復帰）
  private resumeAudioContext(): void {
    try {
      // @ts-expect-error -- SafariのwebkitAudioContextとの互換性のため
      const AudioContext = window.AudioContext || window.webkitAudioContext;

      if (AudioContext) {
        // グローバルなAudioContextがあれば resume を試行
        const contexts = (window as any).__audioContexts || [];
        contexts.forEach((ctx: AudioContext) => {
          if (ctx.state === "suspended") {
            ctx
              .resume()
              .then(() => {
                console.log("AudioContext resumed successfully");
              })
              .catch((e) => {
                console.log("Failed to resume AudioContext:", e);
              });
          }
        });
      }
    } catch (e) {
      console.log("AudioContext resume エラー:", e);
    }
  }

  // ユーザーがインタラクションしたかチェック
  public hasUserInteracted(): boolean {
    return this.userInteracted;
  }

  // すべての音声を停止
  async stopAll(): Promise<void> {
    // サーバーサイドでは何もしない
    if (typeof window === "undefined") return;

    // 既にstopAll実行中の場合は重複実行を防ぐ
    if (this.isStoppingAll) return;
    this.isStoppingAll = true;

    try {
      // 現在のplay()処理が完了するまで待つ
      if (this.playPromise) {
        try {
          await this.playPromise;
        } catch (error) {
          // play()が失敗した場合も処理を続行
          console.log("Play promise rejected during stopAll:", error);
        }
      }

      if (this.currentAudio) {
        // pause()を呼ぶ前に音声が再生中かチェック
        if (!this.currentAudio.paused) {
          this.currentAudio.pause();
        }
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      }

      // フラグをリセット
      this.isPlayingSoundEffect = false;
      this.currentSoundEffectSrc = null;
      this.playPromise = null;

      // ページ内のすべての音声要素を停止
      const allAudioElements = document.querySelectorAll("audio");
      allAudioElements.forEach((audio) => {
        if (audio !== this.bgmAudio) {
          try {
            if (!audio.paused) {
              audio.pause();
            }
            audio.currentTime = 0;
          } catch (error) {
            console.log("Error stopping audio element:", error);
          }
        }
      });
    } finally {
      this.isStoppingAll = false;
    }
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

      // 前の効果音を停止（awaitで完了を待つ）
      await this.stopAll();

      // stopAll実行中は新しい再生を開始しない
      if (this.isStoppingAll) {
        console.log("stopAll実行中のため音声再生をスキップします");
        return;
      }

      // 少し待機してから新しい音声を開始（音声ファイルの切り替えを確実にする）
      await new Promise((resolve) => setTimeout(resolve, 50));

      const audio = new Audio(src);
      audio.volume = volume;

      // 音声の準備完了を待つ
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => resolve(), {
          once: true,
        });
        audio.addEventListener("error", reject, { once: true });
        audio.load(); // 音声ファイルを明示的にロード
      });

      this.currentAudio = audio;
      this.isPlayingSoundEffect = true;
      this.currentSoundEffectSrc = src;

      // play()のPromiseを追跡（エラーハンドリングを追加）
      this.playPromise = audio
        .play()
        .then(() => {
          // 再生が正常に開始された場合
          console.log("音声再生開始:", src);
        })
        .catch((error) => {
          // 再生が中断された場合の処理
          if (error.name === "AbortError") {
            console.log("音声再生が中断されました（正常な動作）:", src);
          } else if (
            error.message.includes("user didn't interact") ||
            error.message.includes("autoplay") ||
            error.message.includes("NotAllowedError") ||
            error.name === "NotAllowedError"
          ) {
            // autoplay policy エラーの場合の詳細なログ
            console.error("Autoplay policy error:", error.message);
            console.log("ユーザーインタラクション状態:", this.userInteracted);
            console.log("音声ファイル:", src);
            console.log("エラーの詳細:", error);
            // ユーザーに分かりやすいエラーメッセージを throw
            throw new Error(
              "ブラウザのautoplayポリシーにより音声再生が制限されました。🔊ボタンを直接クリックしてください。"
            );
          } else {
            console.error("音声再生エラー:", error);
            throw error;
          }
        });

      await this.playPromise;

      // 再生完了時にクリーンアップ
      const cleanupAudio = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isPlayingSoundEffect = false;
          this.currentSoundEffectSrc = null;
          this.playPromise = null;
        }
      };

      audio.addEventListener("ended", cleanupAudio, { once: true });
      audio.addEventListener("error", cleanupAudio, { once: true });
    } catch (error) {
      // エラー時のクリーンアップ
      this.isPlayingSoundEffect = false;
      this.currentSoundEffectSrc = null;
      this.playPromise = null;

      // AbortErrorは正常な中断なので、エラーとして再スローしない
      if (error instanceof Error && error.name === "AbortError") {
        console.log("音声再生が正常に中断されました");
        return;
      }

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
