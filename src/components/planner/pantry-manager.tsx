"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { PANTRY_STAPLES } from "@/data/pantry";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";
import { t } from "@/locales";

const CORE_STAPLES = ["Rice", "Wheat atta", "Cooking oil", "Salt", "Turmeric powder", "Red chili powder"];

export function PantryManager() {
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);
  const setPantryItem = usePlannerStore((state) => state.setPantryItem);
  const setPantrySelected = usePlannerStore((state) => state.setPantrySelected);
  const [showCustom, setShowCustom] = useState(false);
  const [search, setSearch] = useState("");

  const simpleEnabled = CORE_STAPLES.every((item) => pantrySelected.includes(item));
  const selectedCount = pantrySelected.length;

  const filteredPantry = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return PANTRY_STAPLES;
    return PANTRY_STAPLES.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const selectedCore = CORE_STAPLES.filter((item) => pantrySelected.includes(item));

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
        <CardTitle>{t.planner.pantry.title}</CardTitle>
        <CardDescription>{t.planner.pantry.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
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

        <div className="surface-inset flex items-center justify-between rounded-xl px-3 py-2 text-sm">
          <span className="text-muted-foreground">{t.planner.pantry.countLabel}</span>
          <span className="font-semibold text-foreground">{selectedCount}</span>
        </div>

        <Button
          variant="ghost"
          className="glass-soft h-9 w-full justify-between border border-dashed border-border"
          onClick={() => setShowCustom((current) => !current)}
          type="button"
        >
          {showCustom ? t.planner.pantry.hideChecklist : t.planner.pantry.showChecklist}
          <ChevronDown className={`h-4 w-4 transition-transform ${showCustom ? "rotate-180" : ""}`} />
        </Button>

        {showCustom ? (
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
      </CardContent>
    </Card>
  );
}
