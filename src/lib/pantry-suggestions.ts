export type PantrySuggestion = {
  name: string;
  sampleSize: number;
  recommendedPack: string;
};

type PantrySuggestionResponse = {
  source: string;
  generatedAt: string;
  suggestions: PantrySuggestion[];
};

export async function fetchPantrySuggestions() {
  const response = await fetch("/api/pantry-suggestions", { method: "GET" });
  if (!response.ok) {
    throw new Error("Failed to load pantry suggestions");
  }
  return (await response.json()) as PantrySuggestionResponse;
}
