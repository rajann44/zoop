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
import { fetchPantrySuggestions, type PantrySuggestion } from "@/lib/pantry-suggestions";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/store/planner-store";

const CORE_STAPLES = ["Rice", "Wheat atta", "Cooking oil", "Salt", "Turmeric powder", "Red chili powder"];

export function PantryManager() {
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);
  const setPantryItem = usePlannerStore((state) => state.setPantryItem);
  const setPantrySelected = usePlannerStore((state) => state.setPantrySelected);
  const [showCustom, setShowCustom] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<PantrySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

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

  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const data = await fetchPantrySuggestions();
      setSuggestions(data.suggestions);
    } catch {
      setSuggestionError("Could not fetch pack suggestions right now.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pantry</CardTitle>
        <CardDescription>Track what you already have. Grocery list auto-removes pantry-covered items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="surface-inset rounded-xl px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Label htmlFor="simple-staples">I already have basic staples</Label>
            <Switch id="simple-staples" checked={simpleEnabled} onCheckedChange={onSimpleToggle} />
          </div>
          <p className="text-xs text-muted-foreground">Rice, atta, oil, salt, turmeric, chili powder</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedCore.length ? (
              selectedCore.map((item) => (
                <Badge key={item} variant="neutral">
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No core staples selected</span>
            )}
          </div>
        </div>

        <div className="surface-inset flex items-center justify-between rounded-xl px-3 py-2 text-sm">
          <span className="text-muted-foreground">Pantry items selected</span>
          <span className="font-semibold text-foreground">{selectedCount}</span>
        </div>

        <div className="surface-inset rounded-xl px-3 py-2.5">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Dynamic pack suggestions</p>
            <Button type="button" size="sm" variant="ghost" className="h-7 px-2.5 text-xs" onClick={loadSuggestions} disabled={isLoadingSuggestions}>
              {isLoadingSuggestions ? "Refreshing..." : suggestions.length ? "Refresh" : "Fetch"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Fetches India product pack-size medians from Open Food Facts.</p>
          {suggestionError ? <p className="mt-2 text-xs text-rose-600">{suggestionError}</p> : null}
          {suggestions.length ? (
            <div className="mt-2 space-y-1.5">
              {suggestions.map((item) => (
                <div key={item.name} className="glass-soft flex items-center justify-between rounded-lg px-2.5 py-2 text-xs">
                  <span className="text-foreground/90">{item.name}</span>
                  <span className="text-muted-foreground">{item.recommendedPack} • {item.sampleSize} samples</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Button
          variant="ghost"
          className="glass-soft h-9 w-full justify-between border border-dashed border-border"
          onClick={() => setShowCustom((current) => !current)}
          type="button"
        >
          {showCustom ? "Hide custom pantry" : "Customize pantry items"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showCustom ? "rotate-180" : ""}`} />
        </Button>

        {showCustom ? (
          <div className="space-y-2">
            <div className="glass-soft flex items-center gap-2 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search pantry items"
                className="h-7 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              {search ? (
                <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
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
            {!filteredPantry.length ? <p className="py-1 text-sm text-muted-foreground">No pantry staple matches your search.</p> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
