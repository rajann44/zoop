"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { usePlannerStore } from "@/store/planner-store";
import { INGREDIENT_CATEGORIES } from "@/types/planner";

export function GroceryList() {
  const grocery = usePlannerStore((state) => state.groceryByCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly grocery list</CardTitle>
        <CardDescription>Clean grouped list for one person. Open only categories you need while shopping.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {INGREDIENT_CATEGORIES.map((category) => {
          const items = grocery[category];
          return (
            <details key={category} className="group rounded-md border border-border bg-background" open={category === "Vegetables"}>
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
                {category}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-3 py-2">
                {items.length ? (
                  <ul className="space-y-2 text-sm">
                    {items.map((item) => (
                      <li key={item.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
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
      </CardContent>
    </Card>
  );
}
