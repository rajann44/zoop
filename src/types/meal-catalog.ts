import type { DietType, Ingredient, Meal, MealStyle, MealType, ProteinLevel } from "@/types/planner";

export type NutritionSnapshot = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NormalizedMeal = {
  id: string;
  name: string;
  mealType: MealType;
  dietType: DietType;
  mealStyleTags: MealStyle[];
  proteinLevel: ProteinLevel;
  prepTimeMin: number;
  ingredients: Ingredient[];
  stateTags: Meal["stateTags"];
  seasonalTags: string[];
  nutrition: NutritionSnapshot;
  source: {
    provider: "edamam" | "usda" | "fatsecret" | "internal";
    externalId: string;
    fetchedAt: string;
  };
};

export type MealCatalog = {
  generatedAt: string;
  source: string;
  meals: NormalizedMeal[];
};
