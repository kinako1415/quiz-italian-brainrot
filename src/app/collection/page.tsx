"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ImageCollection } from "@/types";
import Link from "next/link";
import useAudio from "@/hooks/useAudio";

export default function Collection() {
  const [collection, setCollection] = useState<ImageCollection[]>([]);
  const [filteredCollection, setFilteredCollection] = useState<
    ImageCollection[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("すべて");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);

  // BGMを設定
  const { toggle: toggleBgm } = useAudio("/bgm/bgm1.mp3", false, true);

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

  // 音声再生ロジック
  const playAudio = (item: ImageCollection) => {
    try {
      // 現在再生中の音声があれば停止
      if (currentAudioId) {
        const currentAudio = document.getElementById(
          `audio-${currentAudioId}`
        ) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      const audio = document.getElementById(
        `audio-${item.id}`
      ) as HTMLAudioElement;
      if (audio) {
        audio.play().catch((error) => {
          console.error("音声再生エラー:", error);
        });
        setCurrentAudioId(item.id);

        // BGMの音量を下げる
        const event = new CustomEvent("adjust-bgm-volume", {
          detail: { volume: 0.2 },
        });
        window.dispatchEvent(event);

        // 音声再生完了後の処理
        audio.onended = () => {
          setCurrentAudioId(null);
          // BGMの音量を戻す
          const event = new CustomEvent("adjust-bgm-volume", {
            detail: { volume: 1.0 },
          });
          window.dispatchEvent(event);
        };
      }
    } catch (error) {
      console.error("音声再生エラー:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <div className="flex flex-col items-center">
          <div className="loader mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-white text-lg font-semibold animate-pulse">
            読み込み中...
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
    <div className="flex flex-col items-center h-screen gap-4 p-4 bg-gradient-to-br from-gray-900 via-purple-900 to-black rounded-lg shadow-xl fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md overflow-y-auto sm:p-6 md:p-8">
      {/* BGMコントロールボタン - 左上に固定配置 */}
      <button
        onClick={toggleBgm}
        className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
        aria-label="BGM再生/停止"
      >
        🔊
      </button>

      {/* ホームに戻るリンク */}
      <Link
        href="/"
        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105 z-50"
      >
        🏠
      </Link>

      <div className="w-full max-w-7xl mx-auto mt-12">
        <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 drop-shadow-lg mb-6">
          Italian Brainrot Gallery
        </h1>

        <div className="flex flex-col items-center justify-center gap-1 mb-4">
          <p className="text-white text-lg font-semibold text-center sm:text-xl md:text-2xl">
            音声付き画像コレクション
          </p>
          {/* ステータス表示 */}
          <div className="text-white text-xs font-light animate-pulse">
            🔊 画像をタップすると音声が再生されます
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-full shadow-lg border-2 border-purple-400 bg-white bg-opacity-10 backdrop-blur-md text-white placeholder-gray-300 focus:border-pink-400 focus:outline-none transition-colors duration-300"
            />
          </div>

          <div className="w-full md:w-1/3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-full shadow-lg border-2 border-purple-400 bg-white bg-opacity-10 backdrop-blur-md text-white focus:border-pink-400 focus:outline-none transition-colors duration-300"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-purple-900"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 画像コレクショングリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 pb-24 auto-rows-fr">
          {filteredCollection.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 group ${
                currentAudioId === item.id
                  ? "ring-4 ring-green-500 shadow-lg shadow-green-500/50"
                  : "ring-4 ring-gray-700 hover:ring-blue-400 active:scale-95"
              }`}
            >
              <div className="flex flex-col h-full">
                <button
                  onClick={() => playAudio(item)}
                  className="w-full h-[170px] flex-grow"
                  title={`${item.word}の音声を再生`}
                >
                  <div className="relative w-full h-full bg-black bg-opacity-30">
                    <Image
                      src={item.imageUrl}
                      alt={item.word}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-3xl">🔊</span>
                    </div>
                  </div>
                  <audio
                    id={`audio-${item.id}`}
                    src={item.audioUrl}
                    preload="none"
                  />
                </button>

                <div className="p-3 flex flex-col flex-none bg-black bg-opacity-60 backdrop-blur-sm">
                  <h2 className="text-lg font-bold text-white truncate">
                    {item.word}
                  </h2>
                  <div className="flex justify-between items-center mt-1">
                    <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-xs text-white px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCollection.length === 0 && (
          <div className="text-center text-white text-xl mt-10">
            該当する画像が見つかりませんでした。
          </div>
        )}

        <div className="text-center mt-10 mb-6">
          <Link
            href="/"
            className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 text-lg transform hover:scale-105"
          >
            クイズに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
