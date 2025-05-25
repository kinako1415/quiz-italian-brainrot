import { readdirSync } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const imageDir = join(process.cwd(), "public/img");
    const files = readdirSync(imageDir).filter((file) =>
      file.endsWith(".webp") && !file.startsWith('.') && file !== '.DS_Store' && file !== '.keep'
    );
    res.status(200).json(files);
  } catch {
    res.status(500).json({ error: "Failed to read image files" });
  }
}
