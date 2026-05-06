"use client";

import Link from "next/link";
import { GroceryList } from "@/components/planner/grocery-list";
import { NutritionSummary } from "@/components/planner/nutrition-summary";
import { PantryManager } from "@/components/planner/pantry-manager";
import { ProfileForm } from "@/components/planner/profile-form";
import { WeeklyPlanSection } from "@/components/planner/weekly-plan";
import { RenderingModeToggle } from "@/components/rendering-mode-toggle";

export function PlannerShell() {
  return (
    <div className="liquid-canvas min-h-screen pb-8 sm:pb-10">
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-[22px] px-4 py-3 sm:px-5">
          <Link href="/" className="rounded-lg px-1 py-0.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h1 className="font-serif text-xl">zoop</h1>
            <p className="text-sm text-muted-foreground">Weekly Indian plan + grocery list for one person</p>
          </Link>
          <RenderingModeToggle />
        </div>
      </header>

      <main className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto grid max-w-6xl gap-3 sm:gap-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
          <section className="space-y-3 sm:space-y-4 lg:sticky lg:top-24 lg:h-fit">
            <ProfileForm />
            <PantryManager />
          </section>

          <section className="space-y-3 sm:space-y-4">
            <NutritionSummary />
            <WeeklyPlanSection />
            <GroceryList />
          </section>
        </div>
      </main>
    </div>
  );
}
