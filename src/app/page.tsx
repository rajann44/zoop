import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="liquid-canvas min-h-screen">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 py-4 sm:px-6 sm:py-6">
        <div className="glass mb-8 flex items-center justify-between rounded-[22px] px-4 py-3 sm:mb-12 sm:px-5">
          <p className="font-serif text-xl">Saada Meal Planner</p>
          <ThemeToggle />
        </div>

        <section className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_340px] md:items-start">
          <div className="glass rounded-[22px] p-5 sm:p-8">
            <div className="space-y-4 sm:space-y-5">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground sm:text-sm">Weekly planning for one person</p>
              <h1 className="max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
              Personalized Indian meal plans and a practical grocery list, in minutes.
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-lg">
              Built for real home cooking. Set your state, diet, protein preference, and body goals to generate a clean 7-day plan from curated meals.
              </p>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3 sm:pt-2">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/planner">
                    Start planning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/planner">View sample plan</Link>
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What you get</CardTitle>
              <CardDescription>Deterministic, pantry-aware meal planning with nutrition targets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>- Daily calories from Mifflin-St Jeor + activity multiplier</p>
              <p>- Goal-aligned protein target and practical meal combinations</p>
              <p>- Grocery list grouped by category with quantity merge</p>
              <p>- Haryana-forward dataset with 10 Indian state preferences</p>
            </CardContent>
          </Card>
        </section>

        <footer className="mt-auto px-1 pt-8 text-xs text-muted-foreground sm:pt-10">
          Designed for calm weekly meal prep. No accounts, no database, no noise.
        </footer>
      </main>
    </div>
  );
}
