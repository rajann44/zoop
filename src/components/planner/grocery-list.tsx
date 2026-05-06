"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { exportGroceryListPdf } from "@/lib/export-grocery-list-pdf";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import { INGREDIENT_CATEGORIES, type IngredientCategory } from "@/types/planner";
import { buildGroceryBreakdown } from "@/lib/grocery";
import { t } from "@/locales";

const CORE_STAPLES = ["Rice", "Wheat atta", "Cooking oil", "Salt", "Turmeric powder", "Red chili powder"];

export function GroceryList() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);
  const setPantrySelected = usePlannerStore((state) => state.setPantrySelected);
  const [activeCategory, setActiveCategory] = useState<IngredientCategory>("Vegetables");

  const simpleEnabled = CORE_STAPLES.every((item) => pantrySelected.includes(item));
  const effectivePantrySelected = useMemo(
    () => (simpleEnabled ? pantrySelected : pantrySelected.filter((item) => !CORE_STAPLES.includes(item))),
    [pantrySelected, simpleEnabled],
  );
  const selectedCore = simpleEnabled ? CORE_STAPLES : [];

  const allIngredients = plan.days.flatMap((day) => [day.breakfast, day.lunch, day.dinner, day.snack]).flatMap((meal) => meal.ingredients);
  const breakdown = buildGroceryBreakdown(allIngredients, effectivePantrySelected, plan.profile);

  const categoriesWithItems = useMemo(
    () => INGREDIENT_CATEGORIES.filter((category) => breakdown.toBuyByCategory[category].length > 0),
    [breakdown.toBuyByCategory],
  );
  const visibleCategories = categoriesWithItems.length ? categoriesWithItems : INGREDIENT_CATEGORIES;
  const resolvedActiveCategory = visibleCategories.includes(activeCategory) ? activeCategory : visibleCategories[0];

  const onSimpleToggle = (enabled: boolean) => {
    if (enabled) {
      setPantrySelected(Array.from(new Set([...pantrySelected, ...CORE_STAPLES])));
      return;
    }
    setPantrySelected(pantrySelected.filter((item) => !CORE_STAPLES.includes(item)));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div>
            <CardTitle>{t.planner.grocery.title}</CardTitle>
            <CardDescription>{t.planner.grocery.description}</CardDescription>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 w-full rounded-xl sm:w-auto sm:shrink-0"
            onClick={() =>
              exportGroceryListPdf({
                state: plan.profile.state,
                toBuyByCategory: breakdown.toBuyByCategory,
                coveredByCategory: breakdown.coveredByCategory,
                summary: breakdown.summary,
              })
            }
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            {t.planner.grocery.exportPdf}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 sm:space-y-3">
        <div className="surface-inset rounded-2xl p-3">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <StatPill label={t.planner.grocery.totalIngredientsSuffix} value={breakdown.summary.total} />
            <StatPill label={t.planner.grocery.toBuy} value={breakdown.summary.toBuy} strong />
            <StatPill label={t.planner.grocery.covered} value={breakdown.summary.covered} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categoriesWithItems.length ? (
              categoriesWithItems.map((category) => (
                <span key={category} className="status-chip rounded-full px-2 py-0.5 text-[11px]">
                  {category} ({breakdown.toBuyByCategory[category].length})
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{t.planner.grocery.emptyCategory}</span>
            )}
          </div>
        </div>

        <div className="surface-inset rounded-xl px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label htmlFor="simple-staples">{t.planner.pantry.simpleToggle}</Label>
            <Switch id="simple-staples" checked={simpleEnabled} onCheckedChange={onSimpleToggle} />
          </div>
          <p className="text-xs text-muted-foreground">{t.planner.pantry.coreListText}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedCore.length ? (
              selectedCore.map((item) => (
                <Badge key={item} variant="neutral">
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{t.planner.pantry.noCoreSelected}</span>
            )}
          </div>
        </div>

        <div className="surface-inset rounded-xl p-2">
          <div className="sidebar-scroll flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 touch-pan-x">
            {visibleCategories.map((category) => {
              const selected = category === resolvedActiveCategory;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "min-h-8 snap-start whitespace-nowrap rounded-lg px-2.5 py-1 text-xs transition-colors",
                    selected ? "bg-accent text-accent-foreground" : "control-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {category} ({breakdown.toBuyByCategory[category].length})
                </button>
              );
            })}
          </div>
          <div className="mt-1 border-t border-border/70 px-1 pt-2">
            {breakdown.toBuyByCategory[resolvedActiveCategory].length ? (
              <ul className="space-y-1.5 text-sm">
                {breakdown.toBuyByCategory[resolvedActiveCategory].map((item) => (
                  <li key={item.key} className="glass-soft flex min-h-10 items-center justify-between rounded-lg px-2.5 py-2">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent-primary)]/75" />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                      {Math.round(item.quantity * 10) / 10} {item.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-1 text-sm text-muted-foreground">{t.planner.grocery.emptyCategory}</p>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}

function StatPill({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl px-2 py-2 sm:px-2.5", strong ? "bg-[color:var(--accent-primary-muted)]" : "control-surface")}>
      <p className="truncate text-[9px] uppercase tracking-wide text-muted-foreground sm:text-[10px]">{label}</p>
      <p className="text-base font-semibold leading-tight text-foreground sm:text-lg">{value}</p>
    </div>
  );
}
