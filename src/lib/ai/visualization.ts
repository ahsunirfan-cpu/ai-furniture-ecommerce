/** Phase 2 stub — room furniture visualization. */
export type VisualizationRequest = {
  roomImageUrl: string;
  productSlugs: string[];
};

export type VisualizationResult = {
  status: "not_implemented";
  message: string;
};

export async function previewFurnitureInRoom(
  _req: VisualizationRequest,
): Promise<VisualizationResult> {
  return {
    status: "not_implemented",
    message:
      "AI room visualization is planned for Phase 2. Preview will show selected catalogue items composited into your uploaded photo.",
  };
}