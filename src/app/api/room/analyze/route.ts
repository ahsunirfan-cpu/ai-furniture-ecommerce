import { NextResponse } from "next/server";
import { z } from "zod";
import { sql, sqlOne } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { saveRoomImage } from "@/lib/upload";
import { analyzeRoomImage } from "@/lib/ai/analyze";
import { recommendProducts } from "@/lib/ai/recommend";
import type { RoomAnalysisResult, RoomType } from "@/lib/types";

const roomSchema = z.enum(["bedroom", "living_room", "dining_room", "office", "kitchen"]);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const form = await request.formData();
  const file = form.get("image");
  const roomType = roomSchema.safeParse(form.get("roomType"));

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Please upload a room photo." }, { status: 400 });
  }
  if (!roomType.success) {
    return NextResponse.json({ error: "Please select a valid room type." }, { status: 400 });
  }

  let stored;
  try {
    stored = await saveRoomImage(file);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const analysisRow = await sqlOne<{ id: string }>(
    `insert into room_analyses (user_id, room_type, image_path, status)
     values ($1, $2, $3, 'PENDING') returning id`,
    [user?.id ?? null, roomType.data, stored.publicPath],
  );

  try {
    const parsed = await analyzeRoomImage(stored.diskPath, roomType.data as RoomType);
    const analysis: RoomAnalysisResult = {
      ...parsed,
      measurementDisclaimer: true,
    };

    await sql(
      `update room_analyses set status = 'COMPLETE', analysis_json = $1 where id = $2`,
      [JSON.stringify(analysis), analysisRow!.id],
    );

    const session = await sqlOne<{ id: string }>(
      `insert into recommendation_sessions (room_analysis_id) values ($1) returning id`,
      [analysisRow!.id],
    );

    const recommendations = await recommendProducts(
      roomType.data as RoomType,
      analysis,
      {},
    );

    for (const item of recommendations) {
      await sql(
        `insert into recommendation_items (session_id, product_id, score, explanation)
         values ($1, $2, $3, $4)`,
        [session!.id, item.id, item.score, item.explanation],
      );
    }

    return NextResponse.json({
      analysisId: analysisRow!.id,
      sessionId: session!.id,
      imagePath: stored.publicPath,
      analysis,
      recommendations,
      lowConfidence: analysis.confidence === "low",
    });
  } catch (e) {
    await sql(
      `update room_analyses set status = 'FAILED', error_message = $1 where id = $2`,
      [(e as Error).message, analysisRow!.id],
    );
    return NextResponse.json({ error: "Room analysis failed. Try another photo." }, { status: 500 });
  }
}