import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sql, sqlOne } from "@/lib/db";
import { useSessionStore } from "@/lib/config";
import { requireUser } from "@/lib/auth/session";
import { demoBumpRoomUsage } from "@/lib/demo/session-store";
import { saveRoomImage } from "@/lib/upload";
import { analyzeRoomImage } from "@/lib/ai/analyze";
import { recommendProducts } from "@/lib/ai/recommend";
import type { RoomAnalysisResult, RoomType } from "@/lib/types";

const roomSchema = z.enum(["bedroom", "living_room", "dining_room", "office", "kitchen"]);

export async function POST(request: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Sign in to analyze your room." }, { status: 401 });
  }

  if (useSessionStore()) {
    try {
      await demoBumpRoomUsage();
    } catch (e) {
      if ((e as Error).message === "RATE_LIMIT") {
        return NextResponse.json(
          { error: "Daily room analysis limit reached. Try again tomorrow." },
          { status: 429 },
        );
      }
      throw e;
    }
  }

  const form = await request.formData();
  const file = form.get("image");
  const roomType = roomSchema.safeParse(form.get("roomType"));

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Please upload a room photo." }, { status: 400 });
  }
  if (!roomType.success) {
    return NextResponse.json({ error: "Please select a valid room type." }, { status: 400 });
  }

  const demoMode = useSessionStore();
  let diskPath: string;
  let publicPath: string;

  if (demoMode) {
    const ext = file.type === "image/png" ? "png" : "jpg";
    const dir = path.join("/tmp", "roomcraft-uploads");
    await mkdir(dir, { recursive: true });
    diskPath = path.join(dir, `${randomUUID()}.${ext}`);
    await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));
    publicPath = "/sample-room.jpg";
  } else {
    try {
      const stored = await saveRoomImage(file);
      diskPath = stored.diskPath;
      publicPath = stored.publicPath;
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
  }

  const analysisId = randomUUID();

  if (demoMode) {
    try {
      const parsed = await analyzeRoomImage(diskPath, roomType.data as RoomType);
      const analysis: RoomAnalysisResult = { ...parsed, measurementDisclaimer: true };
      const recommendations = await recommendProducts(roomType.data as RoomType, analysis, {});
      return NextResponse.json({
        analysisId,
        sessionId: randomUUID(),
        imagePath: publicPath,
        analysis,
        recommendations,
        lowConfidence: analysis.confidence === "low",
        demo: true,
      });
    } catch {
      return NextResponse.json({ error: "Room analysis failed. Try another photo." }, { status: 500 });
    }
  }

  const analysisRow = await sqlOne<{ id: string }>(
    `insert into room_analyses (user_id, room_type, image_path, status)
     values ($1, $2, $3, 'PENDING') returning id`,
    [user.id, roomType.data, publicPath],
  );

  try {
    const parsed = await analyzeRoomImage(diskPath, roomType.data as RoomType);
    const analysis: RoomAnalysisResult = { ...parsed, measurementDisclaimer: true };

    await sql(
      `update room_analyses set status = 'COMPLETE', analysis_json = $1 where id = $2`,
      [JSON.stringify(analysis), analysisRow!.id],
    );

    const session = await sqlOne<{ id: string }>(
      `insert into recommendation_sessions (room_analysis_id) values ($1) returning id`,
      [analysisRow!.id],
    );

    const recommendations = await recommendProducts(roomType.data as RoomType, analysis, {});

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
      imagePath: publicPath,
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