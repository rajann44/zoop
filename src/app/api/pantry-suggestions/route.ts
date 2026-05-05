type OpenFoodFactsProduct = {
  product_name?: string;
  product_name_en?: string;
  quantity?: string;
};

type PantrySuggestion = {
  name: string;
  sampleSize: number;
  recommendedPack: string;
};

const STAPLE_QUERIES: Array<{ name: string; query: string }> = [
  { name: "Salt", query: "iodized salt" },
  { name: "Turmeric powder", query: "turmeric powder" },
  { name: "Red chili powder", query: "red chili powder" },
  { name: "Cumin seeds", query: "cumin seeds" },
  { name: "Mustard seeds", query: "mustard seeds" },
  { name: "Garam masala", query: "garam masala" },
  { name: "Black pepper", query: "black pepper" },
  { name: "Rice", query: "rice" },
  { name: "Wheat atta", query: "wheat atta" },
  { name: "Cooking oil", query: "mustard oil" },
];

const FALLBACK_PACKS: Record<string, string> = {
  Salt: "1 kg",
  "Turmeric powder": "200 g",
  "Red chili powder": "200 g",
  "Cumin seeds": "100 g",
  "Mustard seeds": "100 g",
  "Garam masala": "100 g",
  "Black pepper": "100 g",
  Rice: "1 kg",
  "Wheat atta": "1 kg",
  "Cooking oil": "1 l",
};

const UNIT_NORMALIZATION: Record<string, { unit: "g" | "ml"; multiplier: number }> = {
  g: { unit: "g", multiplier: 1 },
  kg: { unit: "g", multiplier: 1000 },
  ml: { unit: "ml", multiplier: 1 },
  l: { unit: "ml", multiplier: 1000 },
};

function parseQuantity(value: string) {
  const match = value.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof UNIT_NORMALIZATION;
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const normalized = UNIT_NORMALIZATION[unit];
  if (!normalized) return null;

  return {
    baseValue: amount * normalized.multiplier,
    baseUnit: normalized.unit,
  };
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatPack(value: number, unit: "g" | "ml") {
  if (value >= 1000) {
    const major = value / 1000;
    const majorUnit = unit === "g" ? "kg" : "l";
    return `${Number.isInteger(major) ? major : Number(major.toFixed(1))} ${majorUnit}`;
  }
  return `${Math.round(value)} ${unit}`;
}

async function fetchSuggestion(name: string, query: string): Promise<PantrySuggestion> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "40");
  url.searchParams.set("countries_tags_en", "india");
  url.searchParams.set("search_terms", query);

  const response = await fetch(url, {
    headers: { "user-agent": "zoop-meal-planner/1.0" },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    return {
      name,
      sampleSize: 0,
      recommendedPack: FALLBACK_PACKS[name],
    };
  }

  const data = (await response.json()) as { products?: OpenFoodFactsProduct[] };
  const products = data.products ?? [];
  const parsed = products.map((product) => parseQuantity(product.quantity ?? "")).filter((item) => item !== null);

  const grams = parsed.filter((item) => item.baseUnit === "g").map((item) => item.baseValue);
  const mills = parsed.filter((item) => item.baseUnit === "ml").map((item) => item.baseValue);
  const base = grams.length >= mills.length ? { values: grams, unit: "g" as const } : { values: mills, unit: "ml" as const };
  const med = median(base.values);

  return {
    name,
    sampleSize: parsed.length,
    recommendedPack: med ? formatPack(med, base.unit) : FALLBACK_PACKS[name],
  };
}

export async function GET() {
  const suggestions = await Promise.all(STAPLE_QUERIES.map((item) => fetchSuggestion(item.name, item.query)));
  return Response.json({
    source: "openfoodfacts",
    generatedAt: new Date().toISOString(),
    suggestions,
  });
}
