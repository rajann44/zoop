import type { DietType, Ingredient, MealStyle, MealType, ProteinLevel } from "@/types/planner";
import type { Meal } from "@/types/planner";
import type { MealCatalog, NormalizedMeal } from "@/types/meal-catalog";

export type EdamamRecipeHit = {
  recipe: {
    uri: string;
    label: string;
    ingredientLines: string[];
    ingredients: Array<{ text: string; food: string; quantity: number; measure?: string; weight: number }>;
    totalNutrients: {
      ENERC_KCAL?: { quantity: number };
      PROCNT?: { quantity: number };
      CHOCDF?: { quantity: number };
      FAT?: { quantity: number };
    };
    dietLabels?: string[];
    healthLabels?: string[];
    totalTime?: number;
  };
};

export type FdcFoodNutrient = { nutrientName?: string; value?: number; unitName?: string };
export type FdcFood = { description?: string; foodNutrients?: FdcFoodNutrient[] };

type MapContext = {
  mealType: MealType;
  stateTags: NormalizedMeal["stateTags"];
  mealStyleTags: MealStyle[];
  seasonalTags?: string[];
};

export function mapEdamamToNormalized(hit: EdamamRecipeHit, context: MapContext): NormalizedMeal {
  const calories = Math.round(hit.recipe.totalNutrients.ENERC_KCAL?.quantity ?? 0);
  const protein = Math.round(hit.recipe.totalNutrients.PROCNT?.quantity ?? 0);
  const carbs = Math.round(hit.recipe.totalNutrients.CHOCDF?.quantity ?? 0);
  const fat = Math.round(hit.recipe.totalNutrients.FAT?.quantity ?? 0);

  const dietType: DietType = resolveDietType(hit.recipe.healthLabels ?? []);
  const proteinLevel: ProteinLevel = protein >= 24 ? "high" : protein >= 14 ? "moderate" : "low";

  const ingredients = hit.recipe.ingredients.slice(0, 16).map((ing) => ({
    name: ing.food || ing.text,
    quantity: Number.isFinite(ing.quantity) && ing.quantity > 0 ? Math.round(ing.quantity * 10) / 10 : Math.max(1, Math.round((ing.weight || 0) / 30)),
    unit: ing.measure || (ing.weight ? "g" : "piece"),
    category: inferCategory(ing.food || ing.text),
  })) as Ingredient[];

  return {
    id: normalizeId(hit.recipe.uri || hit.recipe.label),
    name: hit.recipe.label,
    mealType: context.mealType,
    dietType,
    mealStyleTags: context.mealStyleTags,
    proteinLevel,
    prepTimeMin: hit.recipe.totalTime && hit.recipe.totalTime > 0 ? Math.round(hit.recipe.totalTime) : 25,
    ingredients,
    stateTags: context.stateTags,
    seasonalTags: context.seasonalTags ?? ["all-season"],
    nutrition: { kcal: calories, protein, carbs, fat },
    source: {
      provider: "edamam",
      externalId: hit.recipe.uri,
      fetchedAt: new Date().toISOString(),
    },
  };
}

export function enrichWithUsda(baseMeal: NormalizedMeal, fdcFood: FdcFood | null): NormalizedMeal {
  if (!fdcFood?.foodNutrients?.length) return baseMeal;
  const nutrient = (name: string) => fdcFood.foodNutrients?.find((n) => n.nutrientName?.toLowerCase() === name.toLowerCase())?.value;
  const kcal = nutrient("Energy") ?? baseMeal.nutrition.kcal;
  const protein = nutrient("Protein") ?? baseMeal.nutrition.protein;
  const carbs = nutrient("Carbohydrate, by difference") ?? baseMeal.nutrition.carbs;
  const fat = nutrient("Total lipid (fat)") ?? baseMeal.nutrition.fat;

  return {
    ...baseMeal,
    nutrition: {
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
    source: {
      ...baseMeal.source,
      provider: "usda",
      externalId: fdcFood.description || baseMeal.source.externalId,
      fetchedAt: new Date().toISOString(),
    },
  };
}

export function toPlannerMeals(catalog: MealCatalog) {
  return catalog.meals.map((meal) => ({
    id: meal.id,
    name: meal.name,
    stateTags: meal.stateTags,
    dietType: meal.dietType,
    mealType: meal.mealType,
    mealStyleTags: meal.mealStyleTags,
    proteinLevel: meal.proteinLevel,
    kcal: meal.nutrition.kcal,
    protein: meal.nutrition.protein,
    carbs: meal.nutrition.carbs,
    fat: meal.nutrition.fat,
    ingredients: meal.ingredients,
    seasonalTags: meal.seasonalTags,
    prepTimeMin: meal.prepTimeMin,
  }));
}

export function plannerMealsToCatalog(meals: Meal[], source = "local-seed"): MealCatalog {
  return {
    generatedAt: new Date().toISOString(),
    source,
    meals: meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      mealType: meal.mealType,
      dietType: meal.dietType,
      mealStyleTags: meal.mealStyleTags,
      proteinLevel: meal.proteinLevel,
      prepTimeMin: meal.prepTimeMin,
      ingredients: meal.ingredients,
      stateTags: meal.stateTags,
      seasonalTags: meal.seasonalTags,
      nutrition: {
        kcal: meal.kcal,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      },
      source: {
        provider: "internal",
        externalId: meal.id,
        fetchedAt: new Date().toISOString(),
      },
    })),
  };
}

function resolveDietType(labels: string[]): DietType {
  const normalized = labels.map((label) => label.toLowerCase());
  if (normalized.includes("vegan")) return "vegan";
  if (normalized.includes("vegetarian")) return "vegetarian";
  if (normalized.includes("pescatarian") || normalized.includes("egg-free")) return "eggetarian";
  return "non-vegetarian";
}

function inferCategory(name: string): Ingredient["category"] {
  const key = name.toLowerCase();
  if (/(milk|curd|paneer|yogurt|cheese|dahi)/.test(key)) return "Dairy";
  if (/(egg|chicken|fish|mutton|beef|pork|tuna)/.test(key)) return "Eggs / Meat";
  if (/(rice|atta|wheat|bread|oats|rava|poha|millet|quinoa|corn)/.test(key)) return "Grains & Atta";
  if (/(dal|bean|chana|lentil|peas|rajma|sprout|soy)/.test(key)) return "Pulses & Beans";
  if (/(apple|banana|orange|lemon|fruit|mango|berry|pomegranate)/.test(key)) return "Fruits";
  if (/(oil|ghee|butter|jaggery|salt)/.test(key)) return "Oils & Essentials";
  if (/(masala|cumin|pepper|chili|turmeric|ginger|garlic|spice)/.test(key)) return "Spices & Condiments";
  return "Vegetables";
}

function normalizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
