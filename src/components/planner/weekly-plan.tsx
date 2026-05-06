"use client";

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronDown, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MealDetailDialog } from "@/components/planner/meal-detail-dialog";
import type { Meal } from "@/types/planner";
import { usePlannerStore } from "@/store/planner-store";
import { toTitleCase } from "@/lib/utils";
import img1 from "../../../images/img1.jpg";
import img2 from "../../../images/img2.jpg";
import img3 from "../../../images/img3.jpg";
import img4 from "../../../images/img4.jpg";

const slots = ["breakfast", "lunch", "dinner", "snack"] as const;

const slotMedia: Record<(typeof slots)[number], { src: StaticImageData; tint: string }> = {
  breakfast: { src: img1, tint: "from-amber-100/45 via-orange-100/15 to-transparent" },
  lunch: { src: img2, tint: "from-sky-100/40 via-cyan-100/14 to-transparent" },
  dinner: { src: img3, tint: "from-indigo-100/45 via-violet-100/15 to-transparent" },
  snack: { src: img4, tint: "from-lime-100/40 via-emerald-100/14 to-transparent" },
};

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
                const media = slotMedia[slot];
                return (
                  <div key={`${day.day}-${slot}`} className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/55 bg-gradient-to-b from-white/45 to-white/18 p-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.85),0_10px_24px_rgb(16_44_88_/_0.1)] backdrop-blur-xl">
                    <div className="relative mb-3 overflow-hidden rounded-xl border border-white/55 bg-white/25">
                      <Image src={media.src} alt={`${toTitleCase(slot)} preview`} className="h-28 w-full object-cover" sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 95vw" />
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${media.tint}`} />
                    </div>
                    <div className="pointer-events-none absolute inset-x-3 top-[7.55rem] h-9 rounded-full bg-gradient-to-r from-white/45 via-white/15 to-transparent" />
                    <div className="relative mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full border-white/65 bg-white/35 px-2.5 py-1">
                        {toTitleCase(slot)}
                      </Badge>
                      <span className="rounded-full border border-white/60 bg-white/30 px-2 py-0.5 text-xs text-muted-foreground">{meal.prepTimeMin}m</span>
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
                      className="mt-3 h-9 w-full whitespace-nowrap rounded-xl border border-white/55 bg-white/35"
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
