"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PANTRY_STAPLES } from "@/data/pantry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePlannerStore } from "@/store/planner-store";

const CORE_STAPLES = ["Rice", "Wheat atta", "Cooking oil", "Salt", "Turmeric powder", "Red chili powder"];

export function PantryManager() {
  const pantrySelected = usePlannerStore((state) => state.pantrySelected);
  const setPantryItem = usePlannerStore((state) => state.setPantryItem);
  const setPantrySelected = usePlannerStore((state) => state.setPantrySelected);
  const [showCustom, setShowCustom] = useState(false);

  const simpleEnabled = CORE_STAPLES.every((item) => pantrySelected.includes(item));

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
        <CardTitle>Pantry</CardTitle>
        <CardDescription>Use a simple staples toggle, then customize only if needed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
          <div>
            <Label htmlFor="simple-staples">I already have basic staples</Label>
            <p className="text-xs text-muted-foreground">Rice, atta, oil, salt, turmeric, chili powder</p>
          </div>
          <Switch id="simple-staples" checked={simpleEnabled} onCheckedChange={onSimpleToggle} />
        </div>

        <Button
          variant="ghost"
          className="h-9 w-full justify-between border border-dashed border-border"
          onClick={() => setShowCustom((current) => !current)}
          type="button"
        >
          {showCustom ? "Hide custom pantry" : "Customize pantry items"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showCustom ? "rotate-180" : ""}`} />
        </Button>

        {showCustom ? (
          <div className="space-y-2">
            {PANTRY_STAPLES.map((item) => {
              const enabled = pantrySelected.includes(item);
              const id = `pantry-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return (
                <div key={item} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <Label htmlFor={id}>{item}</Label>
                  <Switch id={id} checked={enabled} onCheckedChange={(checked) => setPantryItem(item, checked)} />
                </div>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
