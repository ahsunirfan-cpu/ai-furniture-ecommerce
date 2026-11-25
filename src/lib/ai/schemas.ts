import { z } from "zod";

export const roomAnalysisSchema = z.object({
  colorPalette: z.array(z.string()),
  interiorStyle: z.string(),
  detectedFurniture: z.array(z.string()),
  freeSpaceEstimate: z.enum(["small", "medium", "large"]),
  confidence: z.enum(["low", "medium", "high"]),
  userFacingSummary: z.string(),
  measurementDisclaimer: z.boolean(),
});

export type RoomAnalysisParsed = z.infer<typeof roomAnalysisSchema>;