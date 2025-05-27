"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ImageCollection } from "@/types";
import Link from "next/link";
import useAudio from "@/hooks/useAudio";
import AudioManager from "@/utils/audioManager";

export default function Collection() {
  const [collection, setCollection] = useState<ImageCollection[]>([]);
  const [filteredCollection, setFilteredCollection] = useState<
    ImageCollection[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);

  // BGMを設定と音声管理システム
  const { toggle: toggleBgm } = useAudio("/bgm/bgm1.mp3", false, true, true);
  const audioManager = AudioManager.getInstance();

  // カテゴリーの一覧を取得（重複なし）
  const categories = [
    "すべて",
    ...new Set(collection.map((item) => item.category || "その他")),
  ];

  // データの取得
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch("/api/collection");
        if (!response.ok) throw new Error("データ取得に失敗しました");
        const data: ImageCollection[] = await response.json();
        setCollection(data);
        setFilteredCollection(data);
      } catch (error) {
        console.error("コレクションの取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  // 検索とフィルタリングのロジック
  useEffect(() => {
    let filtered = collection;

    // 検索語でフィルタリング
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.word.toLowerCase().includes(term)
      );
    }

    // カテゴリでフィルタリング
    if (selectedCategory && selectedCategory !== "すべて") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredCollection(filtered);
  }, [searchTerm, selectedCategory, collection]);

  // 音声再生・停止ロジック
  const toggleAudio = async (item: ImageCollection) => {
    try {
      // 現在再生中の音声があるか確認
      const isPlaying = currentAudioId === item.id;

      // BGMの音量を下げる
      audioManager.adjustBGMVolume(0.2);

      // 同じアイテムの音声を停止する場合
      if (isPlaying) {
        await audioManager.stopAll();
        audioManager.adjustBGMVolume(1.0);
        setCurrentAudioId(null);
        return;
      }

      // 他の音声を停止してから新しい音声を再生（awaitで完了を待つ）
      await audioManager.stopAll();

      // 新しい音声を再生
      try {
        await audioManager.playSoundEffect(item.audioUrl, 1.0);
        setCurrentAudioId(item.id);

        // 3秒後にBGM音量を戻す（音声の長さに応じて調整可能）
        setTimeout(() => {
          audioManager.adjustBGMVolume(1.0);
          setCurrentAudioId(null);
        }, 3000);
      } catch (playError) {
        const errorMessage =
          playError instanceof Error ? playError.message : String(playError);
        console.log("音声再生エラー:", errorMessage);

        // 自動再生ポリシーエラーの場合は特別なメッセージ
        if (
          errorMessage.includes("user didn't interact") ||
          errorMessage.includes("autoplay")
        ) {
          console.log("ユーザーインタラクション後に音声が再生されます");
        }

        // 再生に失敗した場合は状態をリセット
        setCurrentAudioId(null);
        audioManager.adjustBGMVolume(1.0);
      }
    } catch (error) {
      console.log("音声再生エラー:", error);
      // エラーが発生した場合は状態をリセット
      setCurrentAudioId(null);
      audioManager.adjustBGMVolume(1.0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border border-white/20 max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            </div>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">
            ギャラリーを読み込み中
          </h2>
          <p className="text-white/70 text-lg">
            画像コレクションを準備しています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 sm:p-6 md:p-8">
      {/* Control Buttons */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={toggleBgm}
          className="bg-white/15 backdrop-blur-xl text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
          aria-label="BGM再生/停止"
        >
          <span className="animate-pulse inline-block">🔊</span>
        </button>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <Link
          href="/"
          onClick={async () => {
            // 現在再生中の音声があれば停止
            await audioManager.stopAll();
            audioManager.adjustBGMVolume(1.0);
            setCurrentAudioId(null);
          }}
          className="bg-white/15 backdrop-blur-xl text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 border border-white/20"
          title="ホームに戻る（再生状態をリセット）"
        >
          🏠
        </Link>
      </div>

      {/* Main Gallery Container */}
      <div className="max-w-7xl mx-auto pt-20">
        {/* Main Gallery Card - Unified Design */}
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Gallery Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              🖼️ ギャラリー
            </h1>
            <p className="text-white/80 text-xl mb-6">
              画像をタップして音声を再生
            </p>

            {/* Search and Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 単語を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-xl text-white placeholder-white/60 border border-white/30 focus:border-white/50 focus:outline-none transition-all duration-300 text-lg"
                  />
                </div>
              </div>
              <div className="lg:w-1/3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-xl text-white border border-white/30 focus:border-white/50 focus:outline-none transition-all duration-300 text-lg"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-purple-900 text-white"
                    >
                      📂 {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {searchTerm && (
            <div className="text-center mb-6">
              <p className="text-white/70 text-lg">
                &ldquo;{searchTerm}&rdquo; で {filteredCollection.length}{" "}
                件の結果が見つかりました
              </p>
            </div>
          )}

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
            {filteredCollection.map((item) => (
              <div
                key={item.id}
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 ${
                  currentAudioId === item.id
                    ? "ring-4 ring-green-400 shadow-2xl shadow-green-400/50 scale-105"
                    : "hover:shadow-2xl"
                }`}
                onClick={() => toggleAudio(item)}
                title={`${item.word}の音声を${
                  currentAudioId === item.id ? "停止" : "再生"
                }`}
              >
                <div className="bg-white/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-white/30 h-full transition-all duration-300 group-hover:bg-white/25">
                  <div className="aspect-square relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.word}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      priority
                    />

                    {/* Play/Pause Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/30 backdrop-blur-xl rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <span className="text-2xl">
                          {currentAudioId === item.id ? "⏹️" : "▶️"}
                        </span>
                      </div>
                    </div>

                    {/* Playing Indicator */}
                    {currentAudioId === item.id && (
                      <div className="absolute top-3 right-3 bg-green-500 rounded-full p-2 animate-pulse shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-purple-600/80 backdrop-blur-xl rounded-full px-3 py-1">
                      <span className="text-white text-xs font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-white font-bold text-base text-center truncate mb-1">
                      {item.word}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      <p className="text-white/60 text-sm text-center">
                        音声利用可能
                      </p>
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredCollection.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-white text-2xl font-bold mb-2">
                一致する画像が見つかりません
              </h3>
              <p className="text-white/70 text-lg mb-6">
                検索条件やカテゴリフィルターを調整してみてください
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("すべて");
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
              >
                フィルターをクリア
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 border-t border-white/20">
            <div className="text-white/70 text-lg font-semibold">
              {filteredCollection.length} / {collection.length} アイテム
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl font-bold text-lg"
            >
              🏠 ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
