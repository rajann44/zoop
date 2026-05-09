import type { IngredientCategory } from "@/types/planner";

export const PANTRY_STAPLES = [
  "Rice",
  "Wheat atta",
  "Cooking oil",
  "Salt",
  "Turmeric powder",
  "Red chili powder",
  "Cumin seeds",
  "Mustard seeds",
  "Garam masala",
  "Black pepper",
] as const;

export const PANTRY_BASELINE_PURCHASES: Record<(typeof PANTRY_STAPLES)[number], { quantity: number; unit: string; category: IngredientCategory }> = {
  Rice: { quantity: 1, unit: "kg", category: "Grains & Atta" },
  "Wheat atta": { quantity: 1, unit: "kg", category: "Grains & Atta" },
  "Cooking oil": { quantity: 1, unit: "l", category: "Oils & Essentials" },
  Salt: { quantity: 1, unit: "kg", category: "Oils & Essentials" },
  "Turmeric powder": { quantity: 200, unit: "g", category: "Spices & Condiments" },
  "Red chili powder": { quantity: 200, unit: "g", category: "Spices & Condiments" },
  "Cumin seeds": { quantity: 100, unit: "g", category: "Spices & Condiments" },
  "Mustard seeds": { quantity: 100, unit: "g", category: "Spices & Condiments" },
  "Garam masala": { quantity: 100, unit: "g", category: "Spices & Condiments" },
  "Black pepper": { quantity: 100, unit: "g", category: "Spices & Condiments" },
};
