"use client";

import { create } from "zustand";
import { MEALS } from "@/data/meals";
import { toPlannerMeals } from "@/lib/meal-catalog/map";
import { PANTRY_STAPLES } from "@/data/pantry";
import { SAMPLE_PROFILES } from "@/data/sample-profiles";
import { buildGroceryList } from "@/lib/grocery";
import { calculateNutritionTargets } from "@/lib/nutrition";
import { generateWeeklyPlan } from "@/lib/planner-engine";
import type { GroceryByCategory, Meal, NutritionTargets, UserProfile, WeeklyPlan } from "@/types/planner";
import type { MealCatalog } from "@/types/meal-catalog";

const DEFAULT_PROFILE: UserProfile = SAMPLE_PROFILES[0].profile;

function collectIngredients(plan: WeeklyPlan) {
  const allMeals: Meal[] = [];
  plan.days.forEach((day) => {
    allMeals.push(day.breakfast, day.lunch, day.dinner, day.snack);
  });
  return allMeals.flatMap((meal) => meal.ingredients);
}

type PlannerState = {
  profile: UserProfile;
  pantrySelected: string[];
  weeklyPlan: WeeklyPlan;
  nutritionTargets: NutritionTargets;
  groceryByCategory: GroceryByCategory;
  isGenerating: boolean;
  setProfile: (next: UserProfile) => void;
  setPantryItem: (name: string, enabled: boolean) => void;
  setPantrySelected: (items: string[]) => void;
  regenerate: () => void;
  loadSampleProfile: (sampleId: string) => void;
  refreshMealCatalog: () => Promise<void>;
};

let mealCatalogCache: Meal[] = MEALS;
let mealCatalogPromise: Promise<Meal[]> | null = null;

async function loadMealCatalog(): Promise<Meal[]> {
  if (mealCatalogPromise) return mealCatalogPromise;

  mealCatalogPromise = fetch("/api/meals/catalog", { method: "GET" })
    .then(async (response) => {
      if (!response.ok) return mealCatalogCache;
      const catalog = (await response.json()) as MealCatalog;
      const mapped = toPlannerMeals(catalog);
      if (mapped.length) {
        mealCatalogCache = mapped;
      }
      return mealCatalogCache;
    })
    .catch(() => mealCatalogCache)
    .finally(() => {
      mealCatalogPromise = null;
    });

  return mealCatalogPromise;
}

function createSnapshot(profile: UserProfile, pantrySelected: string[], seed?: number, meals: Meal[] = mealCatalogCache) {
  const plan = generateWeeklyPlan(profile, meals, seed);
  const targets = calculateNutritionTargets(profile);
  const ingredients = collectIngredients(plan);
  const grocery = buildGroceryList(ingredients, pantrySelected, profile);

  return {
    weeklyPlan: plan,
    nutritionTargets: targets,
    groceryByCategory: grocery,
  };
}

const initialPantry = [PANTRY_STAPLES[0], PANTRY_STAPLES[1], PANTRY_STAPLES[2], PANTRY_STAPLES[3]];
const initialSnapshot = createSnapshot(DEFAULT_PROFILE, initialPantry, 42021);

export const usePlannerStore = create<PlannerState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  pantrySelected: initialPantry,
  weeklyPlan: initialSnapshot.weeklyPlan,
  nutritionTargets: initialSnapshot.nutritionTargets,
  groceryByCategory: initialSnapshot.groceryByCategory,
  isGenerating: false,
  setProfile: (next) => {
    const snapshot = createSnapshot(next, get().pantrySelected, get().weeklyPlan.seed);
    set({ profile: next, ...snapshot });
  },
  setPantryItem: (name, enabled) => {
    const selected = enabled
      ? Array.from(new Set([...get().pantrySelected, name]))
      : get().pantrySelected.filter((item) => item !== name);
    const snapshot = createSnapshot(get().profile, selected, get().weeklyPlan.seed);
    set({ pantrySelected: selected, ...snapshot });
  },
  setPantrySelected: (items) => {
    const selected = Array.from(new Set(items));
    const snapshot = createSnapshot(get().profile, selected, get().weeklyPlan.seed);
    set({ pantrySelected: selected, ...snapshot });
  },
  regenerate: () => {
    set({ isGenerating: true });
    const seed = Math.floor(Date.now() % 1_000_000_000);
    const snapshot = createSnapshot(get().profile, get().pantrySelected, seed);
    set({ ...snapshot, isGenerating: false });
  },
  loadSampleProfile: (sampleId) => {
    const sample = SAMPLE_PROFILES.find((entry) => entry.id === sampleId);
    if (!sample) return;
    const snapshot = createSnapshot(sample.profile, get().pantrySelected);
    set({ profile: sample.profile, ...snapshot });
  },
  refreshMealCatalog: async () => {
    set({ isGenerating: true });
    const meals = await loadMealCatalog();
    const snapshot = createSnapshot(get().profile, get().pantrySelected, get().weeklyPlan.seed, meals);
    set({ ...snapshot, isGenerating: false });
  },
}));
