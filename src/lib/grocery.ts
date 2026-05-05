import type { GroceryByCategory, GroceryItem, Ingredient, UserProfile } from "@/types/planner";
import { INGREDIENT_CATEGORIES } from "@/types/planner";
import { PANTRY_BASELINE_PURCHASES } from "@/data/pantry";

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

export function isPantryCovered(itemName: string, pantrySelected: string[]): boolean {
  const normalizedName = normalize(itemName);
  return pantrySelected.some((staple) => (PANTRY_ALIASES[staple] ?? [staple]).some((alias) => normalizedName.includes(normalize(alias))));
}

export function summarizeGroceryCoverage(ingredients: Ingredient[], pantrySelected: string[]) {
  const merged = toMap(ingredients);
  let covered = 0;
  let toBuy = 0;

  Array.from(merged.values()).forEach((item) => {
    if (isPantryCovered(item.name, pantrySelected)) {
      covered += 1;
      return;
    }
    toBuy += 1;
  });

  return {
    total: covered + toBuy,
    covered,
    toBuy,
  };
}

function createEmptyGroups() {
  return Object.fromEntries(INGREDIENT_CATEGORIES.map((category) => [category, [] as GroceryItem[]])) as GroceryByCategory;
}

function sortGroupsForProfile(groups: GroceryByCategory, profile: UserProfile) {
  if (profile.state === "Haryana" && groups["Dairy"].length > 0) {
    groups["Dairy"] = groups["Dairy"].sort((a, b) => (a.name === "Curd" ? -1 : b.name === "Curd" ? 1 : a.name.localeCompare(b.name)));
  }
}

export function buildGroceryBreakdown(ingredients: Ingredient[], pantrySelected: string[], profile: UserProfile) {
  const merged = toMap(ingredients);
  const toBuyByCategory = createEmptyGroups();
  const coveredByCategory = createEmptyGroups();
  const normalizedPantry = new Set(pantrySelected.map((item) => normalize(item)));

  Array.from(merged.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((item) => {
      if (isPantryCovered(item.name, pantrySelected)) {
        coveredByCategory[item.category].push(item);
        return;
      }
      toBuyByCategory[item.category].push(item);
    });

  Object.entries(PANTRY_BASELINE_PURCHASES).forEach(([stapleName, baseline]) => {
    if (normalizedPantry.has(normalize(stapleName))) return;
    const key = `${normalize(stapleName)}::${normalize(baseline.unit)}`;
    const existsInToBuy = toBuyByCategory[baseline.category].some((item) => item.key === key);
    if (existsInToBuy) return;

    toBuyByCategory[baseline.category].push({
      key,
      name: stapleName,
      quantity: baseline.quantity,
      unit: baseline.unit,
      category: baseline.category,
    });
  });

  INGREDIENT_CATEGORIES.forEach((category) => {
    toBuyByCategory[category] = toBuyByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  sortGroupsForProfile(toBuyByCategory, profile);
  sortGroupsForProfile(coveredByCategory, profile);

  return {
    toBuyByCategory,
    coveredByCategory,
    summary: summarizeGroceryCoverage(ingredients, pantrySelected),
  };
}

export function buildGroceryList(ingredients: Ingredient[], pantrySelected: string[], profile: UserProfile): GroceryByCategory {
  return buildGroceryBreakdown(ingredients, pantrySelected, profile).toBuyByCategory;
}
