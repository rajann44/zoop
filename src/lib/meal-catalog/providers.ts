import type { MealStyle, MealType } from "@/types/planner";
import type { MealCatalog, NormalizedMeal } from "@/types/meal-catalog";
import { enrichWithUsda, mapEdamamToNormalized, type EdamamRecipeHit, type FdcFood } from "@/lib/meal-catalog/map";

const EDAMAM_BASE = "https://api.edamam.com/api/recipes/v2";
const USDA_BASE = "https://api.nal.usda.gov/fdc/v1/foods/search";

const QUERY_PLAN: Array<{
  query: string;
  mealType: MealType;
  mealStyleTags: MealStyle[];
  stateTags: NormalizedMeal["stateTags"];
}> = [
  { query: "indian breakfast", mealType: "breakfast", mealStyleTags: ["homely", "quick-cook"], stateTags: ["Delhi", "Haryana"] },
  { query: "indian lunch", mealType: "lunch", mealStyleTags: ["homely", "traditional"], stateTags: ["Delhi", "Punjab"] },
  { query: "indian dinner", mealType: "dinner", mealStyleTags: ["homely", "traditional"], stateTags: ["Haryana", "Delhi"] },
  { query: "healthy indian snack", mealType: "snack", mealStyleTags: ["quick-cook", "budget"], stateTags: ["Delhi", "Karnataka"] },
];

export async function fetchDynamicMealCatalog(): Promise<MealCatalog | null> {
  const fromEdamam = await fetchFromEdamam();
  if (fromEdamam?.meals.length) return fromEdamam;

  const fromFatSecret = await fetchFromFatSecret();
  if (fromFatSecret?.meals.length) return fromFatSecret;

  return null;
}

async function fetchFromEdamam(): Promise<MealCatalog | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;
  if (!appId || !appKey) return null;

  const usdaApiKey = process.env.USDA_API_KEY;
  const allMeals: NormalizedMeal[] = [];

  for (const plan of QUERY_PLAN) {
    const url = new URL(EDAMAM_BASE);
    url.searchParams.set("type", "public");
    url.searchParams.set("q", plan.query);
    url.searchParams.set("app_id", appId);
    url.searchParams.set("app_key", appKey);
    url.searchParams.set("random", "false");

    const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    if (!response.ok) continue;
    const payload = (await response.json()) as { hits?: EdamamRecipeHit[] };
    const hits = payload.hits?.slice(0, 16) ?? [];

    for (const hit of hits) {
      const mapped = mapEdamamToNormalized(hit, {
        mealType: plan.mealType,
        mealStyleTags: plan.mealStyleTags,
        stateTags: plan.stateTags,
      });
      if (usdaApiKey) {
        const usda = await fetchUsdaFood(mapped.name, usdaApiKey);
        allMeals.push(enrichWithUsda(mapped, usda));
      } else {
        allMeals.push(mapped);
      }
    }
  }

  const deduped = Array.from(new Map(allMeals.map((meal) => [meal.id, meal])).values());
  if (!deduped.length) return null;

  return {
    generatedAt: new Date().toISOString(),
    source: "edamam+usda",
    meals: deduped,
  };
}

async function fetchUsdaFood(query: string, apiKey: string): Promise<FdcFood | null> {
  const url = new URL(USDA_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("pageSize", "1");

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;
  const payload = (await response.json()) as { foods?: FdcFood[] };
  return payload.foods?.[0] ?? null;
}

async function fetchFromFatSecret(): Promise<MealCatalog | null> {
  // Optional integration point.
  // FatSecret typically needs OAuth flow and token management; plug-in here when configured.
  return null;
}
