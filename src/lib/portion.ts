import type { Goal, Meal } from "@/types/planner";

const GOAL_DELTA: Record<Goal, number> = {
  "fat loss": -1,
  maintenance: 0,
  "muscle gain": 1,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function attaBasedCount(meal: Meal) {
  const atta = meal.ingredients.find((ingredient) => ingredient.name.toLowerCase() === "wheat atta");
  if (!atta) return null;

  const lowerName = meal.name.toLowerCase();
  if (lowerName.includes("paratha") || lowerName.includes("thepla")) {
    return clamp(Math.round(atta.quantity / 80), 1, 3);
  }

  if (lowerName.includes("roti") || lowerName.includes("phulka")) {
    return clamp(Math.round(atta.quantity / 35), 1, 5);
  }

  return null;
}

export function getPortionHint(meal: Meal, goal: Goal) {
  const lowerName = meal.name.toLowerCase();
  const baseCount = attaBasedCount(meal);

  if (baseCount && (lowerName.includes("roti") || lowerName.includes("phulka"))) {
    const count = clamp(baseCount + GOAL_DELTA[goal], 1, 5);
    return `${count} ${count === 1 ? "roti/phulka" : "roti/phulkas"}`;
  }

  if (baseCount && (lowerName.includes("paratha") || lowerName.includes("thepla"))) {
    const count = clamp(baseCount + (goal === "muscle gain" ? 1 : 0), 1, 3);
    return `${count} ${count === 1 ? "piece" : "pieces"}`;
  }

  return null;
}
