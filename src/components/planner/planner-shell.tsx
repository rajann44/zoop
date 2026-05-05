"use client";

import { GroceryList } from "@/components/planner/grocery-list";
import { NutritionSummary } from "@/components/planner/nutrition-summary";
import { PantryManager } from "@/components/planner/pantry-manager";
import { ProfileForm } from "@/components/planner/profile-form";
import { WeeklyPlanSection } from "@/components/planner/weekly-plan";
import { RenderingModeToggle } from "@/components/rendering-mode-toggle";
import { ThemeToggle } from "@/components/theme-toggle";

export function PlannerShell() {
  return (
    <div className="liquid-canvas min-h-screen pb-8 sm:pb-10">
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-[22px] px-4 py-3 sm:px-6">
          <div>
            <h1 className="font-serif text-xl">Saada Meal Planner</h1>
            <p className="text-sm text-muted-foreground">Weekly Indian plan + grocery list for one person</p>
          </div>
          <div className="flex items-center gap-2">
            <RenderingModeToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-3 px-3 pt-3 sm:gap-4 sm:px-4 sm:pt-4 lg:grid-cols-[300px_minmax(0,1fr)_330px] lg:px-6">
        <section className="space-y-3 sm:space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <ProfileForm />
          <PantryManager />
        </section>

        <section className="space-y-3 sm:space-y-4">
          <NutritionSummary />
          <WeeklyPlanSection />
        </section>

        <section className="lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
          <GroceryList />
        </section>
      </main>
    </div>
  );
}
