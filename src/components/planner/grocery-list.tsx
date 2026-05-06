"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportGroceryListPdf } from "@/lib/export-grocery-list-pdf";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import { INGREDIENT_CATEGORIES, type IngredientCategory } from "@/types/planner";
import { buildGroceryBreakdown } from "@/lib/grocery";
import { t } from "@/locales";

export function GroceryList() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const [activeCategory, setActiveCategory] = useState<IngredientCategory>("Vegetables");

  const allIngredients = plan.days.flatMap((day) => [day.breakfast, day.lunch, day.dinner, day.snack]).flatMap((meal) => meal.ingredients);
  const breakdown = buildGroceryBreakdown(allIngredients, [], plan.profile);
  const categoriesWithItems = useMemo(() => INGREDIENT_CATEGORIES.filter((category) => breakdown.toBuyByCategory[category].length > 0), [breakdown.toBuyByCategory]);
  const visibleCategories = categoriesWithItems.length ? categoriesWithItems : INGREDIENT_CATEGORIES;
  const resolvedActiveCategory = visibleCategories.includes(activeCategory) ? activeCategory : visibleCategories[0];

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
