"use client";

import { useMemo } from "react";
import { CheckCircle2, TriangleAlert, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toTitleCase } from "@/lib/utils";
import { buildGroceryBreakdown } from "@/lib/grocery";
import { INGREDIENT_CATEGORIES } from "@/types/planner";
import { usePlannerStore } from "@/store/planner-store";
import { t } from "@/locales";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;
type ReadinessState = "easy" | "manageable" | "heavy";
const COMPLEXITY_CATEGORIES = new Set(["Spices & Condiments", "Oils & Essentials", "Eggs / Meat"]);

export function InsightsWidgets() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const targets = usePlannerStore((state) => state.nutritionTargets);

  const metrics = useMemo(() => {
    const daily = plan.days.map((day) => {
      const meals = slots.map((slot) => day[slot]);
      return {
        day: day.day.slice(0, 3),
        kcal: meals.reduce((sum, meal) => sum + meal.kcal, 0),
        protein: meals.reduce((sum, meal) => sum + meal.protein, 0),
        carbs: meals.reduce((sum, meal) => sum + meal.carbs, 0),
        fat: meals.reduce((sum, meal) => sum + meal.fat, 0),
        prepMin: meals.reduce((sum, meal) => sum + meal.prepTimeMin, 0),
        ids: meals.map((meal) => meal.id),
      };
    });

    const allIngredients = plan.days
      .flatMap((day) => slots.map((slot) => day[slot]))
      .flatMap((meal) => meal.ingredients);
    const grocery = buildGroceryBreakdown(allIngredients, [], plan.profile);
    const activeToBuyCategories = Object.entries(grocery.toBuyByCategory)
      .filter(([, items]) => items.length > 0)
      .map(([category]) => category);
    const toBuyCategories = activeToBuyCategories.length;

    const complianceDays = daily.filter((entry) => {
      const kcalGap = Math.abs(entry.kcal - targets.dailyCalories) / Math.max(targets.dailyCalories, 1);
      const proteinGap = Math.abs(entry.protein - targets.dailyProtein) / Math.max(targets.dailyProtein, 1);
      return kcalGap <= 0.12 && proteinGap <= 0.15;
    }).length;

    const uniqueMeals = new Set(daily.flatMap((entry) => entry.ids)).size;
    const totalMeals = Math.max(plan.days.length * 4, 1);
    const varietyScore = Math.round((uniqueMeals / totalMeals) * 100);

    const avgPrepPerDay = Math.round(daily.reduce((sum, entry) => sum + entry.prepMin, 0) / Math.max(daily.length, 1));
    const avgPrepPerMeal = Math.round(avgPrepPerDay / 4);

    const totalCarbs = daily.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalProtein = daily.reduce((sum, entry) => sum + entry.protein, 0);
    const totalFat = daily.reduce((sum, entry) => sum + entry.fat, 0);
    const macroKcal = totalCarbs * 4 + totalProtein * 4 + totalFat * 9;

    const macroMix = {
      carbs: Math.round((totalCarbs * 4 * 100) / Math.max(macroKcal, 1)),
      protein: Math.round((totalProtein * 4 * 100) / Math.max(macroKcal, 1)),
      fat: Math.round((totalFat * 9 * 100) / Math.max(macroKcal, 1)),
    };

    const macroTargets =
      plan.profile.goal === "fat loss"
        ? { carbs: 40, protein: 30, fat: 30 }
        : plan.profile.goal === "muscle gain"
          ? { carbs: 50, protein: 25, fat: 25 }
          : { carbs: 45, protein: 25, fat: 30 };

    const shoppingVolume = Math.round(Math.max(0, Math.min(100, grocery.summary.toBuy * 1.7)));
    const categorySpread = (toBuyCategories / Math.max(INGREDIENT_CATEGORIES.length, 1)) * 100;
    const complexityCategoryCount = activeToBuyCategories.filter((category) => COMPLEXITY_CATEGORIES.has(category)).length;
    const complexityRatio = complexityCategoryCount / Math.max(COMPLEXITY_CATEGORIES.size, 1);
    const shoppingBurden = Math.round(Math.max(0, Math.min(100, shoppingVolume * 0.46 + categorySpread * 0.34 + complexityRatio * 100 * 0.2)));
    const prepBurden = Math.round(Math.max(0, Math.min(100, Math.max(0, avgPrepPerDay - 45) * 1.6)));
    const readinessScore = Math.round(Math.max(0, 100 - (shoppingBurden * 0.56 + prepBurden * 0.44)));

    const readinessState: ReadinessState = readinessScore >= 75 ? "easy" : readinessScore >= 55 ? "manageable" : "heavy";
    const readinessCopy = t.planner.insights.readinessCopy[readinessState];

    return {
      daily,
      grocerySummary: grocery.summary,
      toBuyCategories,
      complianceScore: Math.round((complianceDays / Math.max(daily.length, 1)) * 100),
      complianceDays,
      varietyScore,
      avgPrepPerDay,
      avgPrepPerMeal,
      macroMix,
      macroTargets,
      readinessScore,
      readinessState,
      readinessCopy,
      shoppingBurden,
      prepBurden,
    };
  }, [plan, targets.dailyCalories, targets.dailyProtein]);

  const readinessTone =
    metrics.readinessState === "easy"
      ? "status-chip-strong"
      : metrics.readinessState === "manageable"
        ? "status-chip"
        : "border border-[color:var(--border-glass)] bg-[color:var(--surface-control)] text-[color:var(--text-secondary)]";
  const ReadinessIcon =
    metrics.readinessState === "easy" ? CheckCircle2 : metrics.readinessState === "manageable" ? TriangleAlert : TrendingUp;

  return (
    <section className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>{t.planner.insights.nutritionBalanceTitle}</CardTitle>
          <CardDescription>{t.planner.insights.nutritionBalanceDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <div className="surface-inset rounded-xl p-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <CompactStat label={t.planner.insights.onTarget} value={`${metrics.complianceDays}/${metrics.daily.length}`} helper={`${metrics.complianceScore}% ${t.planner.insights.weekSuffix}`} />
              <CompactStat label={t.planner.nutrition.calories} value={`${plan.totals.avgKcal} kcal`} helper={`${formatDelta(plan.totals.avgKcal - targets.dailyCalories)} ${t.planner.nutrition.vsTarget}`} />
              <CompactStat label={t.planner.nutrition.protein} value={`${plan.totals.avgProtein}g`} helper={`${formatDelta(plan.totals.avgProtein - targets.dailyProtein)}g ${t.planner.nutrition.vsTarget}`} />
            </div>
          </div>

          <SharedTrendRows
            daily={metrics.daily.map((entry) => ({ day: entry.day, calories: entry.kcal, protein: entry.protein }))}
            calorieTarget={targets.dailyCalories}
            proteinTarget={targets.dailyProtein}
          />

          <div className="surface-inset rounded-xl p-3">
            <p className="mb-1.5 text-[11px] text-muted-foreground">{t.planner.insights.macroVsTarget} ({toTitleCase(plan.profile.goal)})</p>
            <MacroFlatRow macroMix={metrics.macroMix} macroTargets={metrics.macroTargets} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.planner.insights.planReadinessTitle}</CardTitle>
          <CardDescription>{t.planner.insights.planReadinessDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="surface-inset rounded-xl p-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.planner.insights.readinessScore}</p>
                <p className="mt-0.5 text-2xl font-semibold text-foreground">{metrics.readinessScore}%</p>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium capitalize ${readinessTone}`}>
                <ReadinessIcon className="h-3 w-3" />
                {t.planner.insights.readinessStates[metrics.readinessState]}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{metrics.readinessCopy}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t.planner.insights.readinessExplain}</p>
            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--accent-primary-muted)]">
              <div
                className="h-full rounded-full bg-[color:var(--accent-progress)]"
                style={{
                  width: `${metrics.readinessScore}%`,
                }}
              />
            </div>
          </div>

          <div className="surface-inset rounded-xl p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.planner.insights.scoreBreakdown}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <SimpleMetric label={t.planner.insights.shoppingLoad} value={`${metrics.shoppingBurden}%`} helper={`${metrics.grocerySummary.toBuy} ${t.planner.insights.items} • ${metrics.toBuyCategories} ${t.planner.insights.categoriesToVisit}`} />
              <SimpleMetric label={t.planner.insights.cookingLoad} value={`${metrics.prepBurden}%`} helper={`${metrics.avgPrepPerDay}${t.planner.insights.minDay} • ${metrics.avgPrepPerMeal}${t.planner.insights.minMeal}`} />
            </div>
          </div>

          <div className="surface-inset rounded-xl p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.planner.insights.heavyDrivers}</p>
            <div className="space-y-2.5">
              <DriverRow label={t.planner.insights.shoppingLoad} value={metrics.shoppingBurden} />
              <DriverRow label={t.planner.insights.cookingLoad} value={metrics.prepBurden} />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function SharedTrendRows({
  daily,
  calorieTarget,
  proteinTarget,
}: {
  daily: Array<{ day: string; calories: number; protein: number }>;
  calorieTarget: number;
  proteinTarget: number;
}) {
  return (
    <div className="surface-inset rounded-xl p-3 sm:p-4">
      <p className="mb-1.5 text-[11px] text-muted-foreground">{t.planner.insights.weeklyTrends}</p>
      <TrendStrip
        label={t.planner.nutrition.calories}
        unit="kcal"
        values={daily.map((day) => ({ day: day.day, value: day.calories }))}
        target={calorieTarget}
        tolerance={0.12}
      />
      <TrendStrip
        label={t.planner.nutrition.protein}
        unit="g"
        values={daily.map((day) => ({ day: day.day, value: day.protein }))}
        target={proteinTarget}
        tolerance={0.15}
      />
    </div>
  );
}

function TrendStrip({
  label,
  unit,
  values,
  target,
  tolerance,
}: {
  label: string;
  unit: string;
  values: Array<{ day: string; value: number }>;
  target: number;
  tolerance: number;
}) {
  const maxValue = Math.max(target * 1.18, ...values.map((item) => item.value), 1);
  const targetRatio = Math.min(target / maxValue, 1);
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{target} {unit}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {values.map((item) => {
          const height = Math.max((item.value / maxValue) * 34, 6);
          const state = classifyTarget(item.value, target, tolerance);
          return (
            <div key={`${label}-${item.day}`} className="space-y-1">
              <div className="relative flex h-10 items-end justify-center rounded-md bg-[color:var(--accent-primary-muted)]/35 px-1">
                <div className="pointer-events-none absolute left-1 right-1 border-t border-dashed border-foreground/25" style={{ bottom: `${targetRatio * 100}%` }} />
                <div className={barTone(state)} style={{ height }} title={`${item.day}: ${item.value} ${unit}`} />
              </div>
              <p className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">{item.day}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MacroFlatRow({
  macroMix,
  macroTargets,
}: {
  macroMix: { carbs: number; protein: number; fat: number };
  macroTargets: { carbs: number; protein: number; fat: number };
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <MacroMini label="Carbs" actual={macroMix.carbs} target={macroTargets.carbs} />
      <MacroMini label="Protein" actual={macroMix.protein} target={macroTargets.protein} />
      <MacroMini label="Fat" actual={macroMix.fat} target={macroTargets.fat} />
    </div>
  );
}

function MacroMini({ label, actual, target }: { label: string; actual: number; target: number }) {
  const marker = Math.max(0, Math.min(target, 100));
  return (
    <div className="px-1">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{actual}%</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-[color:var(--accent-primary-muted)]/70">
        <div className="h-full rounded-full bg-[color:var(--accent-progress)]" style={{ width: `${Math.min(actual, 100)}%` }} />
        <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-foreground/45" style={{ left: `${marker}%` }} />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{t.planner.insights.targetShort} {target}%</p>
    </div>
  );
}

function CompactStat({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="control-surface rounded-lg px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{helper}</p>
    </div>
  );
}

function SimpleMetric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="control-surface rounded-xl px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}

function DriverRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--accent-primary-muted)]/55">
        <div className="h-full rounded-full bg-foreground/55" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function classifyTarget(value: number, target: number, tolerance: number) {
  const ratio = (value - target) / Math.max(target, 1);
  if (ratio < -tolerance) return "below" as const;
  if (ratio > tolerance) return "above" as const;
  return "on" as const;
}

function barTone(state: "on" | "below" | "above") {
  if (state === "on") return "w-full rounded-sm bg-[color:var(--accent-primary)]";
  if (state === "below") return "w-full rounded-sm bg-amber-500/75 dark:bg-amber-400/70";
  return "w-full rounded-sm bg-rose-500/75 dark:bg-rose-400/70";
}

function formatDelta(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}
