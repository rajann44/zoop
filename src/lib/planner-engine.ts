import { calculateNutritionTargets } from "@/lib/nutrition";
import { buildMealCardArtUrl } from "@/lib/meal-card-art";
import { roundTo } from "@/lib/utils";
import type { DayPlan, DietType, Meal, MealType, ProteinFocus, UserProfile, WeeklyPlan } from "@/types/planner";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPE_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const CALORIE_DISTRIBUTION: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.34,
  dinner: 0.31,
  snack: 0.1,
};

const DIET_RANK: Record<DietType, number> = {
  vegan: 0,
  vegetarian: 1,
  eggetarian: 2,
  "non-vegetarian": 3,
};

const PROTEIN_PREF_TARGET: Record<ProteinFocus, number> = {
  low: 1,
  moderate: 2,
  high: 3,
};

const PROTEIN_LEVEL_SCORE = {
  low: 1,
  moderate: 2,
  high: 3,
};

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isDietCompatible(userDiet: DietType, mealDiet: DietType): boolean {
  return DIET_RANK[mealDiet] <= DIET_RANK[userDiet];
}

function scoreMeal(args: {
  meal: Meal;
  profile: UserProfile;
  mealType: MealType;
  calorieTargetForMeal: number;
  ingredientUsage: Map<string, number>;
  mealUsage: Map<string, number>;
  dayMeals: Meal[];
}): number {
  const { meal, profile, mealType, calorieTargetForMeal, ingredientUsage, mealUsage, dayMeals } = args;

  if (!isDietCompatible(profile.dietType, meal.dietType)) return -10_000;
  if (meal.mealType !== mealType) return -10_000;

  let score = 0;

  if (meal.stateTags.includes(profile.state)) score += 34;
  if (meal.mealStyleTags.includes(profile.mealStyle)) score += 22;

  const proteinDistance = Math.abs(PROTEIN_LEVEL_SCORE[meal.proteinLevel] - PROTEIN_PREF_TARGET[profile.proteinFocus]);
  score += 18 - proteinDistance * 7;

  const calorieDifference = Math.abs(meal.kcal - calorieTargetForMeal);
  const calorieSuitability = Math.max(0, 24 - calorieDifference / 18);
  score += calorieSuitability;

  let reuseScore = 0;
  meal.ingredients.forEach((ingredient) => {
    reuseScore += ingredientUsage.get(ingredient.name.toLowerCase()) ?? 0;
  });
  // Ingredient reuse improves practical shopping and reduces waste for solo plans.
  score += Math.min(14, reuseScore * 1.6);

  const mealCount = mealUsage.get(meal.id) ?? 0;
  score -= mealCount * 20;

  if (dayMeals.some((dayMeal) => dayMeal.id === meal.id)) score -= 15;
  if (mealCount > 1) score -= mealCount * 10;

  return score;
}

function pickWeighted(candidates: Array<{ meal: Meal; score: number }>, rand: () => number): Meal {
  const safeCandidates = candidates.slice(0, Math.min(6, candidates.length));
  const min = Math.min(...safeCandidates.map((entry) => entry.score));
  const adjusted = safeCandidates.map((entry) => ({
    meal: entry.meal,
    weight: Math.max(1, entry.score - min + 1),
  }));

  const total = adjusted.reduce((acc, item) => acc + item.weight, 0);
  let roll = rand() * total;

  for (const item of adjusted) {
    roll -= item.weight;
    if (roll <= 0) return item.meal;
  }

  return adjusted[adjusted.length - 1].meal;
}

export function generateWeeklyPlan(profile: UserProfile, meals: Meal[], seed = Date.now()): WeeklyPlan {
  const rand = mulberry32(seed);
  const targets = calculateNutritionTargets(profile);

  const ingredientUsage = new Map<string, number>();
  const mealUsage = new Map<string, number>();
  const days: DayPlan[] = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const dayMeals: Partial<Record<MealType, Meal>> = {};
    const dayPicked: Meal[] = [];

    MEAL_TYPE_ORDER.forEach((mealType) => {
      const calorieTargetForMeal = targets.dailyCalories * CALORIE_DISTRIBUTION[mealType];

      const candidates = meals
        .filter((meal) => meal.mealType === mealType)
        .map((meal) => ({
          meal,
          score: scoreMeal({
            meal,
            profile,
            mealType,
            calorieTargetForMeal,
            ingredientUsage,
            mealUsage,
            dayMeals: dayPicked,
          }),
        }))
        .filter((entry) => entry.score > -1000)
        .sort((a, b) => b.score - a.score);

      const chosen = candidates.length > 0 ? pickWeighted(candidates, rand) : meals.find((meal) => meal.mealType === mealType)!;

      dayMeals[mealType] = chosen;
      dayPicked.push(chosen);

      mealUsage.set(chosen.id, (mealUsage.get(chosen.id) ?? 0) + 1);
      chosen.ingredients.forEach((ingredient) => {
        const key = ingredient.name.toLowerCase();
        ingredientUsage.set(key, (ingredientUsage.get(key) ?? 0) + 1);
      });
    });

    days.push({
      day: DAY_NAMES[dayIndex],
      breakfast: {
        ...dayMeals.breakfast!,
        cardArtUrl: buildMealCardArtUrl({ mealId: dayMeals.breakfast!.id, mealType: "breakfast", seed }),
      },
      lunch: {
        ...dayMeals.lunch!,
        cardArtUrl: buildMealCardArtUrl({ mealId: dayMeals.lunch!.id, mealType: "lunch", seed }),
      },
      dinner: {
        ...dayMeals.dinner!,
        cardArtUrl: buildMealCardArtUrl({ mealId: dayMeals.dinner!.id, mealType: "dinner", seed }),
      },
      snack: {
        ...dayMeals.snack!,
        cardArtUrl: buildMealCardArtUrl({ mealId: dayMeals.snack!.id, mealType: "snack", seed }),
      },
    });
  }

  const totals = days.reduce(
    (acc, day) => {
      const dayKcal = day.breakfast.kcal + day.lunch.kcal + day.dinner.kcal + day.snack.kcal;
      const dayProtein = day.breakfast.protein + day.lunch.protein + day.dinner.protein + day.snack.protein;
      return { kcal: acc.kcal + dayKcal, protein: acc.protein + dayProtein };
    },
    { kcal: 0, protein: 0 },
  );

  return {
    seed,
    profile,
    days,
    totals: {
      avgKcal: roundTo(totals.kcal / 7),
      avgProtein: roundTo(totals.protein / 7, 1),
    },
  };
}
