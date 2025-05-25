// アプリケーション全体で使用する型定義

// 問題の型定義
export interface Question {
  sound: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  questionText: string;
}

// 画像コレクションの型定義
export interface ImageCollection {
  id: string;
  word: string; // イタリア語のテキスト
  imageUrl: string;
  audioUrl: string;
  category?: string; // カテゴリー（任意）
}
