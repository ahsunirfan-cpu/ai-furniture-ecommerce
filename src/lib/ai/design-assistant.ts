/** Phase 2 stub — conversational interior design assistant. */
export type DesignAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function askDesignAssistant(
  _messages: DesignAssistantMessage[],
  _context: { roomAnalysisId?: string },
): Promise<string> {
  return "The AI interior design assistant will arrive in Phase 2. For now, use room analysis and catalogue filters to explore coordinated pieces.";
}