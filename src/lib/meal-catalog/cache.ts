import { unstable_cache } from "next/cache";
import { MEALS } from "@/data/meals";
import { plannerMealsToCatalog } from "@/lib/meal-catalog/map";
import type { MealCatalog } from "@/types/meal-catalog";

const CACHE_TAG = "meal-catalog";

export const getMealCatalogCached = unstable_cache(
  async (): Promise<MealCatalog> => {
    const catalog = plannerMealsToCatalog(MEALS, "local-seed-fallback");
    return catalog;
  },
  [CACHE_TAG],
  {
    revalidate: 60 * 60 * 6,
    tags: [CACHE_TAG],
  },
);
