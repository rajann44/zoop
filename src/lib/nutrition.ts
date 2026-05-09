import type { ActivityLevel, Goal, NutritionTargets, ProteinFocus, Sex, UserProfile } from "@/types/planner";
import { roundTo } from "@/lib/utils";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  "very active": 1.9,
};

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  "fat loss": -350,
  maintenance: 0,
  "muscle gain": 250,
};

const GOAL_PROTEIN_MULTIPLIER: Record<Goal, number> = {
  "fat loss": 1.6,
  maintenance: 1.2,
  "muscle gain": 1.8,
};

const PROTEIN_FOCUS_ADJUSTMENT: Record<ProteinFocus, number> = {
  low: -0.2,
  moderate: 0,
  high: 0.3,
};

export function calculateBMR(age: number, sex: Sex, weightKg: number, heightCm: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateDailyCalories(profile: UserProfile): number {
  const bmr = calculateBMR(profile.age, profile.sex, profile.weightKg, profile.heightCm);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  const adjusted = tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal];
  return Math.max(1200, roundTo(adjusted));
}

export function calculateProteinTarget(weightKg: number, goal: Goal, focus: ProteinFocus): number {
  const gPerKg = GOAL_PROTEIN_MULTIPLIER[goal] + PROTEIN_FOCUS_ADJUSTMENT[focus];
  const bounded = Math.min(2.4, Math.max(0.9, gPerKg));
  return roundTo(weightKg * bounded);
}

export function calculateNutritionTargets(profile: UserProfile): NutritionTargets {
  return {
    dailyCalories: calculateDailyCalories(profile),
    dailyProtein: calculateProteinTarget(profile.weightKg, profile.goal, profile.proteinFocus),
  };
}
