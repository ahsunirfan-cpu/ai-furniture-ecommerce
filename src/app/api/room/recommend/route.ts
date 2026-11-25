import { NextResponse } from "next/server";
import { z } from "zod";
import { sqlOne, sql } from "@/lib/db";
import { recommendProducts, type RecommendFilters } from "@/lib/ai/recommend";
import type { RoomAnalysisResult, RoomType } from "@/lib/types";

const schema = z.object({
  analysisId: z.string().uuid(),
  category: z.string().optional(),
  minPriceCents: z.number().optional(),
  maxPriceCents: z.number().optional(),
  color: z.string().optional(),
  style: z.string().optional(),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
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

  const filters: RecommendFilters = {
    category: body.data.category as RecommendFilters["category"],
    minPriceCents: body.data.minPriceCents,
    maxPriceCents: body.data.maxPriceCents,
    color: body.data.color,
    style: body.data.style,
  };

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