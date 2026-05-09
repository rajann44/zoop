export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Himachal Pradesh",
  "Haryana",
  "Jharkhand",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "Punjab",
  "Delhi",
  "Rajasthan",
  "Gujarat",
  "Maharashtra",
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "West Bengal",
] as const;

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export const DIET_TYPES = ["vegan", "vegetarian", "eggetarian", "non-vegetarian"] as const;
export const PROTEIN_FOCUS = ["low", "moderate", "high"] as const;
export const MEAL_STYLES = [
  "homely",
  "budget",
  "high-protein",
  "quick-cook",
  "traditional",
] as const;
export const PROTEIN_LEVELS = ["low", "moderate", "high"] as const;
export const GOALS = ["fat loss", "maintenance", "muscle gain"] as const;
export const SEX_TYPES = ["male", "female"] as const;
export const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very active"] as const;

export const INGREDIENT_CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Eggs / Meat",
  "Grains & Atta",
  "Pulses & Beans",
  "Spices & Condiments",
  "Oils & Essentials",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];
export type DietType = (typeof DIET_TYPES)[number];
export type MealType = (typeof MEAL_TYPES)[number];
export type ProteinFocus = (typeof PROTEIN_FOCUS)[number];
export type MealStyle = (typeof MEAL_STYLES)[number];
export type ProteinLevel = (typeof PROTEIN_LEVELS)[number];
export type Goal = (typeof GOALS)[number];
export type Sex = (typeof SEX_TYPES)[number];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
};

export type Meal = {
  id: string;
  name: string;
  stateTags: IndianState[];
  dietType: DietType;
  mealType: MealType;
  mealStyleTags: MealStyle[];
  proteinLevel: ProteinLevel;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  seasonalTags: string[];
  prepTimeMin: number;
};

export type PlannedMeal = Meal & {
  cardArtUrl?: string;
};

export type UserProfile = {
  state: IndianState;
  dietType: DietType;
  proteinFocus: ProteinFocus;
  mealStyle: MealStyle;
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: Goal;
};

export type DayPlan = {
  day: string;
  breakfast: PlannedMeal;
  lunch: PlannedMeal;
  dinner: PlannedMeal;
  snack: PlannedMeal;
};

export type WeeklyPlan = {
  seed: number;
  profile: UserProfile;
  days: DayPlan[];
  totals: {
    avgKcal: number;
    avgProtein: number;
  };
};

export type GroceryItem = Ingredient & {
  key: string;
};

export type GroceryByCategory = Record<IngredientCategory, GroceryItem[]>;

export type NutritionTargets = {
  dailyCalories: number;
  dailyProtein: number;
};

export type SampleProfile = {
  id: string;
  label: string;
  profile: UserProfile;
};
