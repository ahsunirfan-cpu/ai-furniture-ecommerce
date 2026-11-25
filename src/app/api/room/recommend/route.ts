import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sqlOne, sql } from "@/lib/db";
import { useSessionStore } from "@/lib/config";
import { requireUser } from "@/lib/auth/session";
import { roomAnalysisSchema } from "@/lib/ai/schemas";
import { recommendProducts, type RecommendFilters } from "@/lib/ai/recommend";
import type { RoomAnalysisResult, RoomType } from "@/lib/types";

const roomSchema = z.enum(["bedroom", "living_room", "dining_room", "office", "kitchen"]);

const schema = z.object({
  analysisId: z.string().uuid(),
  roomType: roomSchema.optional(),
  analysis: roomAnalysisSchema.optional(),
  category: z.string().optional(),
  minPriceCents: z.number().optional(),
  maxPriceCents: z.number().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const filters: RecommendFilters = {
    category: body.data.category as RecommendFilters["category"],
    minPriceCents: body.data.minPriceCents,
    maxPriceCents: body.data.maxPriceCents,
    color: body.data.color,
    style: body.data.style,
  };

  if (useSessionStore()) {
    if (!body.data.roomType || !body.data.analysis) {
      return NextResponse.json({ error: "Re-run room analysis before refining." }, { status: 400 });
    }
    const recommendations = await recommendProducts(
      body.data.roomType as RoomType,
      body.data.analysis as RoomAnalysisResult,
      filters,
    );
    return NextResponse.json({ sessionId: randomUUID(), recommendations });
  }

  const analysis = await sqlOne<{
    room_type: RoomType;
    analysis_json: RoomAnalysisResult;
  }>(
    "select room_type, analysis_json from room_analyses where id = $1 and status = 'COMPLETE'",
    [body.data.analysisId],
  );
  if (!analysis?.analysis_json) {
    return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
  }

  const recommendations = await recommendProducts(
    analysis.room_type,
    analysis.analysis_json,
    filters,
  );

  const session = await sqlOne<{ id: string }>(
    `insert into recommendation_sessions (room_analysis_id, filter_json) values ($1, $2) returning id`,
    [body.data.analysisId, JSON.stringify(filters)],
  );

  for (const item of recommendations) {
    await sql(
      `insert into recommendation_items (session_id, product_id, score, explanation)
       values ($1, $2, $3, $4)`,
      [session!.id, item.id, item.score, item.explanation],
    );
  }

  return NextResponse.json({ sessionId: session!.id, recommendations });
}