"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, Eye, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealDetailDialog } from "@/components/planner/meal-detail-dialog";
import { exportWeeklyPlanPdf } from "@/lib/export-weekly-plan-pdf";
import type { Meal } from "@/types/planner";
import { usePlannerStore } from "@/store/planner-store";
import { toTitleCase } from "@/lib/utils";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

export function WeeklyPlanSection() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const isGenerating = usePlannerStore((state) => state.isGenerating);
  const nutritionTargets = usePlannerStore((state) => state.nutritionTargets);
  const groceryByCategory = usePlannerStore((state) => state.groceryByCategory);
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Weekly meals</p>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 rounded-xl"
            onClick={() => exportWeeklyPlanPdf({ plan, targets: nutritionTargets, groceryByCategory })}
          >
            <FileDown className="mr-1.5 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {visibleDays.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle>{showFullWeek ? day.day : `Today (${day.day})`}</CardTitle>
              <CardDescription>{plan.profile.state} preference • solo portions • {showFullWeek ? "full-week view" : "focus view"}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {slots.map((slot) => {
                const meal = day[slot];
                return (
                  <div key={`${day.day}-${slot}`} className="surface-inset relative flex h-full flex-col overflow-hidden rounded-2xl p-3">
                    <div className="relative mb-3 overflow-hidden rounded-xl border border-[color:var(--border-glass)] bg-[color:var(--surface-control)]">
                      {meal.cardArtUrl ? (
                        <Image
                          src={meal.cardArtUrl}
                          alt={`${toTitleCase(slot)} preview`}
                          className="h-28 w-full object-cover"
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 95vw"
                          width={400}
                          height={288}
                          unoptimized
                        />
                      ) : (
                        <div className="h-28 w-full bg-[color:var(--accent-primary-muted)]" />
                      )}
                    </div>
                    <div className="relative mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full px-2.5 py-1">
                        {toTitleCase(slot)}
                      </Badge>
                      <span className="status-chip rounded-full px-2 py-0.5 text-xs">{meal.prepTimeMin}m</span>
                    </div>
                    <div className="relative flex grow flex-col">
                      <p className="text-[1.03rem] font-semibold leading-snug text-foreground">{meal.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {meal.kcal} kcal • {meal.protein}g protein
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 h-9 w-full whitespace-nowrap rounded-xl"
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

        <Button variant="secondary" className="h-9 w-full justify-between" onClick={() => setShowFullWeek((current) => !current)}>
          {showFullWeek ? "Show only today" : "View full week"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFullWeek ? "rotate-180" : ""}`} />
        </Button>
      </div>
      <MealDetailDialog meal={selectedMeal} goal={plan.profile.goal} open={open} onOpenChange={setOpen} />
    </>
  );
}
