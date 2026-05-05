"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlannerStore } from "@/store/planner-store";

export function NutritionSummary() {
  const targets = usePlannerStore((state) => state.nutritionTargets);
  const totals = usePlannerStore((state) => state.weeklyPlan.totals);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition targets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Metric label="Daily calorie target" value={`${targets.dailyCalories} kcal`} />
        <Metric label="Daily protein target" value={`${targets.dailyProtein} g`} />
        <div className="sm:col-span-2">
          <Button variant="ghost" className="h-8 w-full justify-between border border-dashed border-border" onClick={() => setShowDetails((current) => !current)}>
            {showDetails ? "Hide planned averages" : "Show planned averages"}
            <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </Button>
        </div>
        {showDetails ? (
          <>
            <Metric label="Planned avg calories" value={`${totals.avgKcal} kcal`} />
            <Metric label="Planned avg protein" value={`${totals.avgProtein} g`} />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-inset rounded-xl p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
