import type { RoomAnalysisParsed } from "./schemas";
import type { RoomType } from "@/lib/types";

export function mockRoomAnalysis(roomType: RoomType): RoomAnalysisParsed {
  const styleByRoom: Record<RoomType, string> = {
    bedroom: "minimalist",
    living_room: "modern",
    dining_room: "classic",
    office: "modern",
    kitchen: "scandinavian",
  };
  return {
    colorPalette: ["#E8E2D9", "#5C5A57", "#B8A99A"],
    interiorStyle: styleByRoom[roomType],
    detectedFurniture: roomType === "bedroom" ? ["bed", "lamp"] : ["sofa", "rug"],
    freeSpaceEstimate: "medium",
    confidence: "medium",
    userFacingSummary:
      "Your room reads as calm and uncluttered, with neutral walls and warm wood tones—ideal for clean-lined, space-aware pieces.",
    measurementDisclaimer: true,
  };
}