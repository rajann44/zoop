import { getMealCatalogCached } from "@/lib/meal-catalog/cache";
import { fetchDynamicMealCatalog } from "@/lib/meal-catalog/providers";

export async function GET() {
  const dynamic = await fetchDynamicMealCatalog();
  if (dynamic?.meals.length) {
    return Response.json(dynamic);
  }

  const fallback = await getMealCatalogCached();
  return Response.json(fallback);
}
