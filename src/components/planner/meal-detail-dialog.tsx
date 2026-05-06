"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPortionHint } from "@/lib/portion";
import type { Goal, Meal } from "@/types/planner";
import { toTitleCase } from "@/lib/utils";
import { t } from "@/locales";

type MealDetailDialogProps = {
  meal: Meal | null;
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MealDetailDialog({ meal, goal, open, onOpenChange }: MealDetailDialogProps) {
  if (!meal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.planner.mealDetail.title}</DialogTitle>
            <DialogDescription>{t.planner.mealDetail.noMeal}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const portionHint = getPortionHint(meal, goal);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${meal.name} recipe`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="max-w-[92%] text-xl leading-tight">{meal.name}</DialogTitle>
          <DialogDescription>
            {toTitleCase(meal.mealType)} • {meal.prepTimeMin} {t.planner.mealDetail.prepSuffix}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 text-sm sm:grid-cols-4 sm:gap-3">
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">{t.planner.mealDetail.kcal}</div>
            <div className="font-semibold">{meal.kcal}</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">{t.planner.nutrition.protein}</div>
            <div className="font-semibold">{meal.protein} g</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">{t.planner.mealDetail.carbs}</div>
            <div className="font-semibold">{meal.carbs} g</div>
          </div>
          <div className="glass-soft rounded-xl p-3">
            <div className="text-xs text-muted-foreground">{t.planner.mealDetail.fat}</div>
            <div className="font-semibold">{meal.fat} g</div>
          </div>
        </div>

        {portionHint ? (
          <div className="glass-soft rounded-xl p-3 text-sm">
            <span className="text-muted-foreground">{t.planner.mealDetail.suggestedServing} </span>
            <span className="font-medium text-foreground">{portionHint}</span>
          </div>
        ) : null}

        <div className="surface-inset overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-border/70 px-3 py-2.5">
            <h4 className="text-sm font-semibold">{t.planner.mealDetail.ingredients}</h4>
            <span className="text-xs text-muted-foreground">{meal.ingredients.length} {t.planner.mealDetail.itemSuffix}</span>
          </div>
          <ul className="divide-y divide-border/55">
            {meal.ingredients.map((ingredient) => (
              <li key={`${meal.id}-${ingredient.name}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="text-foreground/90">{ingredient.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-inset rounded-xl p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.planner.mealDetail.mealTags}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{toTitleCase(meal.dietType)}</Badge>
            <Badge variant="neutral">{t.planner.mealDetail.proteinPrefix} {toTitleCase(meal.proteinLevel)}</Badge>
            {meal.mealStyleTags.map((tag) => (
              <Badge key={`${meal.id}-${tag}`} variant="outline">
                {toTitleCase(tag)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="control-surface flex items-center justify-between rounded-xl px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{t.planner.mealDetail.walkthroughPrompt}</p>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button size="sm" variant="ghost" className="h-8 px-3 text-xs">
                {t.planner.mealDetail.close}
              </Button>
            </DialogClose>
            <Button asChild size="sm" variant="secondary" className="h-8 px-3 text-xs">
              <a href={youtubeUrl} target="_blank" rel="noreferrer noopener">
                {t.planner.mealDetail.watchYoutube}
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
