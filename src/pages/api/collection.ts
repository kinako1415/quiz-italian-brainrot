import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import fs from "fs";
import { ImageCollection } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageCollection[]>
) {
  try {
    // 画像と音声ファイル名を取得
    const imageDir = path.join(process.cwd(), "public", "img");
    const soundDir = path.join(process.cwd(), "public", "sound");

    // システムファイルや隠しファイルを除外
    const imageFiles = fs
      .readdirSync(imageDir)
      .filter(
        (file) =>
          file.endsWith(".webp") &&
          !file.startsWith(".") &&
          file !== ".DS_Store" &&
          file !== ".keep"
      );
    const soundFiles = fs
      .readdirSync(soundDir)
      .filter(
        (file) =>
          file.endsWith(".mp3") &&
          !file.startsWith(".") &&
          file !== ".DS_Store" &&
          file !== ".keep"
      );

    // 両方に存在するファイルのみマッピング
    const collection: ImageCollection[] = imageFiles
      .filter((imgFile) => {
        // .webp拡張子を.mp3に置き換えて、対応する音声ファイルがあるか確認
        const correspondingSoundFile = imgFile.replace(".webp", ".mp3");
        return soundFiles.includes(correspondingSoundFile);
      })
      .map((imgFile, index) => {
        const id = `${index + 1}`.padStart(3, "0");
        const word = imgFile.replace(".webp", ""); // ファイル名から拡張子を削除

        return {
          id,
          word,
          imageUrl: `/img/${imgFile}`,
          audioUrl: `/sound/${imgFile.replace(".webp", ".mp3")}`,
          category: getCategoryFromFileName(word), // ファイル名から適切なカテゴリを判定する関数
        };
      });

    res.status(200).json(collection);
  } catch (error) {
    console.error("画像コレクションの取得エラー:", error);
    res.status(500).json([]);
  }
}

// ファイル名から簡易的にカテゴリを判定する関数
function getCategoryFromFileName(fileName: string): string {
  const lowerFileName = fileName.toLowerCase();

  if (
    lowerFileName.includes("cat") ||
    lowerFileName.includes("gato") ||
    lowerFileName.includes("chimpa") ||
    lowerFileName.includes("elefant") ||
    lowerFileName.includes("girafa") ||
    lowerFileName.includes("orangutini")
  ) {
    return "動物";
  }

  if (
    lowerFileName.includes("cappuccin") ||
    lowerFileName.includes("frigo") ||
    lowerFileName.includes("frutti")
  ) {
    return "食べ物・飲み物";
  }

  if (lowerFileName.includes("saturn") || lowerFileName.includes("celestre")) {
    return "宇宙・天体";
  }

  if (
    lowerFileName.includes("brrr") ||
    lowerFileName.includes("tata") ||
    lowerFileName.includes("ding") ||
    lowerFileName.includes("trala")
  ) {
    return "擬音語";
  }

  // 判別できない場合はその他に分類
  return "その他";
}
