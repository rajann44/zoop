import { getMealCatalogCached } from "@/lib/meal-catalog/cache";
import { toPlannerMeals } from "@/lib/meal-catalog/map";
import { fetchDynamicMealCatalog } from "@/lib/meal-catalog/providers";

export async function getPlannerMealsFromCatalog() {
  const dynamic = await fetchDynamicMealCatalog();
  if (dynamic?.meals.length) return toPlannerMeals(dynamic);

  const fallback = await getMealCatalogCached();
  return toPlannerMeals(fallback);
}
