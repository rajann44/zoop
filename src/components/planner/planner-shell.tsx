"use client";

import { useEffect } from "react";
import { GroceryList } from "@/components/planner/grocery-list";
import { BodyMetricsSummary } from "@/components/planner/body-metrics-summary";
import { InsightsWidgets } from "@/components/planner/insights-widgets";
import { NutritionSummary } from "@/components/planner/nutrition-summary";
import { PantryManager } from "@/components/planner/pantry-manager";
import { ProfileForm } from "@/components/planner/profile-form";
import { WeeklyPlanSection } from "@/components/planner/weekly-plan";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransitionLink } from "@/components/ui/transition-link";
import { usePlannerStore } from "@/store/planner-store";
import { popPendingHomeBodyProfile } from "@/lib/home-profile";
import { popPendingHomeSampleProfile } from "@/lib/home-sample-profile";
import { t } from "@/locales";

export function PlannerShell() {
  const refreshMealCatalog = usePlannerStore((state) => state.refreshMealCatalog);
  const profile = usePlannerStore((state) => state.profile);
  const setProfile = usePlannerStore((state) => state.setProfile);
  const loadSampleProfile = usePlannerStore((state) => state.loadSampleProfile);

  useEffect(() => {
    void refreshMealCatalog();
  }, [refreshMealCatalog]);

  useEffect(() => {
    const pending = popPendingHomeBodyProfile();
    if (!pending) return;
    setProfile({ ...profile, ...pending });
  }, [profile, setProfile]);

  useEffect(() => {
    const pendingSampleId = popPendingHomeSampleProfile();
    if (!pendingSampleId) return;
    loadSampleProfile(pendingSampleId);
  }, [loadSampleProfile]);

  return (
    <div className="liquid-canvas min-h-screen pb-8 sm:pb-10">
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass-header mx-auto flex max-w-6xl items-center justify-between rounded-[22px] px-4 py-3 sm:px-5">
          <TransitionLink href="/" className="rounded-lg px-1 py-0.5 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <h1 className="font-serif text-xl">{t.common.appName}</h1>
            <p className="text-sm text-muted-foreground">{t.common.appTagline}</p>
          </TransitionLink>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto grid max-w-6xl gap-3 sm:gap-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
          <section className="lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:min-h-0">
            <div className="h-full min-h-0">
              <ProfileForm />
            </div>
          </section>

          <section className="space-y-3 sm:space-y-4">
            <BodyMetricsSummary />
            <NutritionSummary />
            <InsightsWidgets />
            <WeeklyPlanSection />
            <PantryManager />
            <GroceryList />
          </section>
        </div>
      </main>
    </div>
  );
}
