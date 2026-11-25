import "server-only";

import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import { mockRoomAnalysis } from "./mock";
import { roomAnalysisSchema, type RoomAnalysisParsed } from "./schemas";
import type { RoomType } from "@/lib/types";

import { useMockAi } from "@/lib/config";

export async function analyzeRoomImage(
  imagePath: string,
  roomType: RoomType,
): Promise<RoomAnalysisParsed> {
  if (useMockAi()) {
    return mockRoomAnalysis(roomType);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const buffer = await readFile(imagePath);
  const base64 = buffer.toString("base64");
  const mime = imagePath.endsWith(".png") ? "image/png" : "image/jpeg";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You analyze interior room photos for a furniture store. Respond with JSON only. Use keys: colorPalette (hex strings), interiorStyle, detectedFurniture, freeSpaceEstimate (small|medium|large), confidence (low|medium|high), userFacingSummary, measurementDisclaimer (boolean, always true). Never claim exact measurements.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Room type: ${roomType}. Analyze this room for furniture shopping.`,
          },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${base64}` },
          },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = roomAnalysisSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return { ...mockRoomAnalysis(roomType), confidence: "low" };
  }
  return { ...parsed.data, measurementDisclaimer: true };
}