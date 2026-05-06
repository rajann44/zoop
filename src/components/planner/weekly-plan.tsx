"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Eye, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealDetailDialog } from "@/components/planner/meal-detail-dialog";
import { exportWeeklyPlanPdf } from "@/lib/export-weekly-plan-pdf";
import type { Meal } from "@/types/planner";
import { usePlannerStore } from "@/store/planner-store";
import { toTitleCase } from "@/lib/utils";
import { t } from "@/locales";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

export function WeeklyPlanSection() {
  const plan = usePlannerStore((state) => state.weeklyPlan);
  const isGenerating = usePlannerStore((state) => state.isGenerating);
  const nutritionTargets = usePlannerStore((state) => state.nutritionTargets);
  const groceryByCategory = usePlannerStore((state) => state.groceryByCategory);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [open, setOpen] = useState(false);
  const dayTrackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hasSyncedDayRef = useRef(false);

  const empty = useMemo(() => !plan.days.length, [plan.days.length]);
  const todayIndex = useMemo(() => (new Date().getDay() + 6) % 7, []);
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);

  useEffect(() => {
    const track = dayTrackRef.current;
    const maxIndex = Math.max(plan.days.length - 1, 0);
    const clampedIndex = Math.min(activeDayIndex, maxIndex);
    const slide = slideRefs.current[clampedIndex];
    if (!track || !slide) return;
    const left = slide.offsetLeft - track.offsetLeft;
    track.scrollTo({ left, behavior: hasSyncedDayRef.current ? "smooth" : "auto" });
    hasSyncedDayRef.current = true;
  }, [activeDayIndex, plan.days.length]);

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
          <CardTitle>{t.planner.weeklyPlan.noPlanTitle}</CardTitle>
          <CardDescription>{t.planner.weeklyPlan.noPlanDescription}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">{t.planner.weeklyPlan.sectionTitle}</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 w-full rounded-xl sm:w-auto"
              onClick={() => exportWeeklyPlanPdf({ plan, targets: nutritionTargets, groceryByCategory })}
            >
              <FileDown className="mr-1.5 h-4 w-4" />
              {t.planner.weeklyPlan.exportPdf}
            </Button>
          </div>

          <div className="sidebar-scroll surface-inset flex gap-1 overflow-x-auto rounded-xl p-1">
            {plan.days.map((day, index) => {
              const selected = index === activeDayIndex;
              const isToday = index === todayIndex;
              return (
                <button
                  key={`day-tab-${day.day}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveDayIndex(index)}
                  className={`min-w-[74px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${selected ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {isToday ? t.planner.weeklyPlan.todayPrefix : day.day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div ref={dayTrackRef} className="sidebar-scroll flex snap-x snap-mandatory overflow-x-auto">
            {plan.days.map((day, index) => {
              const isToday = index === todayIndex;
              return (
                <div
                  key={day.day}
                  ref={(element) => {
                    slideRefs.current[index] = element;
                  }}
                  className="min-w-full snap-start pr-0"
                >
                  <div className="surface-inset overflow-hidden rounded-xl">
                    <div className="border-b border-border/70 px-4 py-3">
                      <h3 className="text-base font-semibold">{isToday ? `${t.planner.weeklyPlan.todayPrefix} (${day.day})` : day.day}</h3>
                      <p className="text-sm text-muted-foreground">{plan.profile.state} preference • {t.planner.weeklyPlan.soloPortions} • {t.planner.weeklyPlan.focusView}</p>
                    </div>
                    <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
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
                              {t.planner.weeklyPlan.viewDetail}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <MealDetailDialog meal={selectedMeal} goal={plan.profile.goal} open={open} onOpenChange={setOpen} />
    </>
  );
}
