"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, FileDown, Search, X } from "lucide-react";
import { PANTRY_STAPLES } from "@/data/pantry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { exportGroceryListPdf } from "@/lib/export-grocery-list-pdf";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import { INGREDIENT_CATEGORIES } from "@/types/planner";
import { buildGroceryBreakdown } from "@/lib/grocery";
import { t } from "@/locales";

const CORE_STAPLES = ["Rice", "Wheat atta", "Cooking oil", "Salt", "Turmeric powder", "Red chili powder"];

export function GroceryList() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);
  const setPantryItem = usePlannerStore((state) => state.setPantryItem);
  const setPantrySelected = usePlannerStore((state) => state.setPantrySelected);
  const [showPantryChecklist, setShowPantryChecklist] = useState(false);
  const [search, setSearch] = useState("");

  const simpleEnabled = CORE_STAPLES.every((item) => pantrySelected.includes(item));
  const effectivePantrySelected = useMemo(
    () => (simpleEnabled ? pantrySelected : pantrySelected.filter((item) => !CORE_STAPLES.includes(item))),
    [pantrySelected, simpleEnabled],
  );
  const selectedCore = simpleEnabled ? CORE_STAPLES : [];

  const allIngredients = plan.days.flatMap((day) => [day.breakfast, day.lunch, day.dinner, day.snack]).flatMap((meal) => meal.ingredients);
  const breakdown = buildGroceryBreakdown(allIngredients, effectivePantrySelected, plan.profile);

  const filteredPantry = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = PANTRY_STAPLES.filter((item) => !CORE_STAPLES.includes(item));
    if (!query) return base;
    return base.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const activePantryItems = useMemo(() => {
    const known = PANTRY_STAPLES.filter((item) => effectivePantrySelected.includes(item));
    const custom = effectivePantrySelected.filter((item) => !PANTRY_STAPLES.includes(item as (typeof PANTRY_STAPLES)[number])).sort((a, b) => a.localeCompare(b));
    return [...known, ...custom];
  }, [effectivePantrySelected]);

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
      <CardContent className="space-y-2.5">
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

        <Button
          variant="ghost"
          className="glass-soft h-9 w-full justify-between border border-dashed border-border"
          onClick={() => setShowPantryChecklist((current) => !current)}
          type="button"
        >
          {showPantryChecklist ? t.planner.pantry.hideChecklist : t.planner.pantry.showChecklist}
          <ChevronDown className={`h-4 w-4 transition-transform ${showPantryChecklist ? "rotate-180" : ""}`} />
        </Button>

        {showPantryChecklist ? (
          <div className="space-y-2">
            <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.planner.pantry.searchPlaceholder}
                className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              {search ? (
                <button type="button" aria-label={t.planner.pantry.clearSearchAria} onClick={() => setSearch("")}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : null}
            </div>

            {filteredPantry.map((item) => {
              const enabled = pantrySelected.includes(item);
              const id = `pantry-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return (
                <div key={item} className={cn("flex items-center justify-between rounded-xl px-3 py-2.5", enabled ? "glass-soft" : "surface-inset")}>
                  <Label htmlFor={id} className="text-sm">
                    {item}
                  </Label>
                  <Switch id={id} checked={enabled} onCheckedChange={(checked) => setPantryItem(item, checked)} />
                </div>
              );
            })}

            {!filteredPantry.length ? <p className="py-1 text-sm text-muted-foreground">{t.planner.pantry.noMatches}</p> : null}
          </div>
        ) : null}

        <div className="surface-inset flex items-center justify-between rounded-xl px-3 py-2 text-sm">
          <span className="text-muted-foreground">{breakdown.summary.total} {t.planner.grocery.totalIngredientsSuffix}</span>
          <span className="text-right font-medium text-foreground">{breakdown.summary.toBuy} {t.planner.grocery.toBuy} • {breakdown.summary.covered} {t.planner.grocery.covered}</span>
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
                  <p className="py-1 text-sm text-muted-foreground">{t.planner.grocery.emptyCategory}</p>
                )}
              </div>
            </details>
          );
        })}

        <details className="surface-inset group rounded-xl">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium">
            {t.planner.grocery.pantrySection}
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border px-3 py-2">
            {activePantryItems.length ? (
              <ul className="space-y-1.5 text-sm">
                {activePantryItems.map((item) => (
                  <li key={item} className="glass-soft flex items-center justify-between rounded-lg px-3 py-2 opacity-90">
                    <span>{item}</span>
                    <span className="text-xs text-muted-foreground">selected</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-1 text-sm text-muted-foreground">{t.planner.grocery.noCovered}</p>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
