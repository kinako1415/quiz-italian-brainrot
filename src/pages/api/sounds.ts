import { readdirSync } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const soundDir = join(process.cwd(), "public/sound");
    const files = readdirSync(soundDir).filter((file) => 
      file.endsWith(".mp3") && !file.startsWith('.') && file !== '.DS_Store' && file !== '.keep'
    );
    res.status(200).json(files);
  } catch {
    res.status(500).json({ error: "Failed to read sound files" });
  }
}
