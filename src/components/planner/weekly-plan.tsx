"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealDetailDialog } from "@/components/planner/meal-detail-dialog";
import { getPortionHint } from "@/lib/portion";
import type { Meal } from "@/types/planner";
import { usePlannerStore } from "@/store/planner-store";
import { toTitleCase } from "@/lib/utils";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

export function WeeklyPlanSection() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const isGenerating = usePlannerStore((state) => state.isGenerating);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [open, setOpen] = useState(false);
  const [showFullWeek, setShowFullWeek] = useState(false);

  const empty = useMemo(() => !plan.days.length, [plan.days.length]);
  const todayIndex = useMemo(() => (new Date().getDay() + 6) % 7, []);
  const visibleDays = showFullWeek ? plan.days : plan.days[todayIndex] ? [plan.days[todayIndex]] : plan.days.slice(0, 1);

  if (isGenerating) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((__, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (empty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No weekly plan yet</CardTitle>
          <CardDescription>Fill your preferences and generate your first 7-day plan.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {visibleDays.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle>{showFullWeek ? day.day : `Today (${day.day})`}</CardTitle>
              <CardDescription>{plan.profile.state} preference • solo portions • {showFullWeek ? "full-week view" : "focus view"}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {slots.map((slot) => {
                const meal = day[slot];
                const portionHint = getPortionHint(meal, plan.profile.goal);
                return (
                  <div key={`${day.day}-${slot}`} className="surface-inset rounded-xl p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline">{toTitleCase(slot)}</Badge>
                      <span className="text-xs text-muted-foreground">{meal.prepTimeMin}m</span>
                    </div>
                    <p className="text-sm font-medium">{meal.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {meal.kcal} kcal • {meal.protein}g protein
                    </p>
                    {portionHint ? <p className="mt-1 text-xs text-accent">Suggested portion: {portionHint}</p> : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 w-full"
                      onClick={() => {
                        setSelectedMeal(meal);
                        setOpen(true);
                      }}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View detail
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" className="h-9 w-full justify-between border border-dashed border-border" onClick={() => setShowFullWeek((current) => !current)}>
          {showFullWeek ? "Show only today" : "View full week"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFullWeek ? "rotate-180" : ""}`} />
        </Button>
      </div>
      <MealDetailDialog meal={selectedMeal} goal={plan.profile.goal} open={open} onOpenChange={setOpen} />
    </>
  );
}
