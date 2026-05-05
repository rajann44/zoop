import type { GroceryByCategory, GroceryItem, Ingredient, UserProfile } from "@/types/planner";
import { INGREDIENT_CATEGORIES } from "@/types/planner";

const normalize = (value: string) => value.trim().toLowerCase();

const PANTRY_ALIASES: Record<string, string[]> = {
  Rice: ["rice", "red rice"],
  "Wheat atta": ["wheat atta", "atta"],
  "Cooking oil": ["cooking oil", "mustard oil", "coconut oil"],
  Salt: ["salt"],
  "Turmeric powder": ["turmeric powder"],
  "Red chili powder": ["red chili powder"],
  "Cumin seeds": ["cumin seeds", "roasted cumin powder"],
  "Mustard seeds": ["mustard seeds"],
  "Garam masala": ["garam masala"],
  "Black pepper": ["black pepper"],
};

function toMap(ingredients: Ingredient[]): Map<string, GroceryItem> {
  const mapped = new Map<string, GroceryItem>();

  ingredients.forEach((item) => {
    const key = `${normalize(item.name)}::${normalize(item.unit)}`;
    const existing = mapped.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }
    mapped.set(key, { ...item, key });
  });

  return mapped;
}

function isPantryCovered(itemName: string, pantrySelected: string[]): boolean {
  const normalizedName = normalize(itemName);
  return pantrySelected.some((staple) => (PANTRY_ALIASES[staple] ?? [staple]).some((alias) => normalizedName.includes(normalize(alias))));
}

export function buildGroceryList(ingredients: Ingredient[], pantrySelected: string[], profile: UserProfile): GroceryByCategory {
  const merged = toMap(ingredients);

  const grouped = Object.fromEntries(INGREDIENT_CATEGORIES.map((category) => [category, [] as GroceryItem[]])) as GroceryByCategory;

  Array.from(merged.values())
    .filter((item) => !isPantryCovered(item.name, pantrySelected))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => grouped[item.category].push(item));

  if (profile.state === "Haryana" && grouped["Dairy"].length > 0) {
    grouped["Dairy"] = grouped["Dairy"].sort((a, b) => (a.name === "Curd" ? -1 : b.name === "Curd" ? 1 : a.name.localeCompare(b.name)));
  }

  return grouped;
}
