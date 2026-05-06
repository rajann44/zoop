"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { usePlannerStore } from "@/store/planner-store";
import { INGREDIENT_CATEGORIES } from "@/types/planner";
import { buildGroceryBreakdown } from "@/lib/grocery";

export function GroceryList() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);

  const allIngredients = plan.days.flatMap((day) => [day.breakfast, day.lunch, day.dinner, day.snack]).flatMap((meal) => meal.ingredients);
  const breakdown = buildGroceryBreakdown(allIngredients, pantrySelected, plan.profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly grocery list</CardTitle>
        <CardDescription>This is what you need to buy this week. Items already in your pantry are separated below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        <div className="surface-inset flex items-center justify-between rounded-xl px-3 py-2 text-sm">
          <span className="text-muted-foreground">{breakdown.summary.total} total ingredients planned</span>
          <span className="font-medium text-foreground">{breakdown.summary.toBuy} to buy • {breakdown.summary.covered} covered</span>
        </div>

        {INGREDIENT_CATEGORIES.map((category) => {
          const items = breakdown.toBuyByCategory[category];
          return (
            <details key={category} className="surface-inset group rounded-xl" open={category === "Vegetables"}>
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
                {category}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-3 py-2">
                {items.length ? (
                  <ul className="space-y-2 text-sm">
                    {items.map((item) => (
                      <li key={item.key} className="glass-soft flex items-center justify-between rounded-lg px-3 py-2">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {Math.round(item.quantity * 10) / 10} {item.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-1 text-sm text-muted-foreground">Nothing to buy in this category.</p>
                )}
              </div>
            </details>
          );
        })}

        <details className="surface-inset group rounded-xl">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
            Already at home (pantry)
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-3 py-2">
            {breakdown.summary.covered ? (
              <div className="space-y-2">
                {INGREDIENT_CATEGORIES.map((category) => {
                  const coveredItems = breakdown.coveredByCategory[category];
                  if (!coveredItems.length) return null;
                  return (
                    <div key={category} className="space-y-1.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</p>
                      <ul className="space-y-1.5 text-sm">
                        {coveredItems.map((item) => (
                          <li key={item.key} className="glass-soft flex items-center justify-between rounded-lg px-3 py-2 opacity-80">
                            <span>{item.name}</span>
                            <span className="text-muted-foreground">
                              {Math.round(item.quantity * 10) / 10} {item.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-1 text-sm text-muted-foreground">No ingredient is currently marked as pantry-covered.</p>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
