import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { WeeklyPlan, NutritionTargets } from "@/types/planner";
import { toTitleCase } from "@/lib/utils";

type ExportWeeklyPlanPdfInput = {
  plan: WeeklyPlan;
  targets: NutritionTargets;
};

const COLORS = {
  ink: [24, 40, 61] as [number, number, number],
  muted: [96, 118, 145] as [number, number, number],
  hairline: [218, 228, 240] as [number, number, number],
  headerFill: [236, 242, 250] as [number, number, number],
  cardFill: [245, 249, 255] as [number, number, number],
};

const TWO_COL_LABEL_WIDTH = 190;
const NUTRITION_COL_WIDTHS = {
  metric: 140,
  target: 120,
  planAvg: 120,
};

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildFileName(now: Date) {
  return `zoop-weekly-plan-${now.toISOString().slice(0, 10)}.pdf`;
}

function formatDelta(value: number, unit: string) {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${rounded} ${unit}`;
}

function addPageNumbers(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Page ${page} of ${pages}`, doc.internal.pageSize.getWidth() - 42, doc.internal.pageSize.getHeight() - 18, { align: "right" });
  }
}

export function exportWeeklyPlanPdf({ plan, targets }: ExportWeeklyPlanPdfInput) {
  const now = new Date();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  doc.setFillColor(...COLORS.cardFill);
  doc.roundedRect(marginX, 30, contentWidth, 72, 14, 14, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...COLORS.ink);
  doc.text("zoop weekly meal plan", marginX + 14, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Generated ${formatDate(now)}`, marginX + 14, 74);
  doc.text(`${plan.profile.state} • ${toTitleCase(plan.profile.goal)} • ${toTitleCase(plan.profile.dietType)}`, marginX + 14, 89);

  autoTable(doc, {
    startY: 120,
    head: [["User info", "Value"]],
    body: [
      ["Sex", toTitleCase(plan.profile.sex)],
      ["Age", `${plan.profile.age} years`],
      ["Height", `${plan.profile.heightCm} cm`],
      ["Weight", `${plan.profile.weightKg} kg`],
      ["Activity", toTitleCase(plan.profile.activityLevel)],
      ["Protein focus", toTitleCase(plan.profile.proteinFocus)],
      ["Meal style", toTitleCase(plan.profile.mealStyle)],
    ],
    theme: "grid",
    tableWidth: contentWidth,
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.ink, fontStyle: "bold", lineColor: COLORS.hairline, lineWidth: 0.6 },
    bodyStyles: { textColor: COLORS.ink, lineColor: COLORS.hairline, lineWidth: 0.5 },
    styles: { fontSize: 10, cellPadding: 7 },
    columnStyles: {
      0: { cellWidth: TWO_COL_LABEL_WIDTH, fontStyle: "bold" },
      1: { cellWidth: contentWidth - TWO_COL_LABEL_WIDTH },
    },
  });

  const profileTableY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 220;
  autoTable(doc, {
    startY: profileTableY + 14,
    head: [["Nutrition", "Target", "Plan avg", "Delta"]],
    body: [
      [
        "Calories",
        `${targets.dailyCalories} kcal`,
        `${plan.totals.avgKcal} kcal`,
        formatDelta(plan.totals.avgKcal - targets.dailyCalories, "kcal"),
      ],
      [
        "Protein",
        `${targets.dailyProtein} g`,
        `${plan.totals.avgProtein} g`,
        formatDelta(plan.totals.avgProtein - targets.dailyProtein, "g"),
      ],
    ],
    theme: "grid",
    tableWidth: contentWidth,
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.ink, fontStyle: "bold", lineColor: COLORS.hairline, lineWidth: 0.6 },
    bodyStyles: { textColor: COLORS.ink, lineColor: COLORS.hairline, lineWidth: 0.5 },
    styles: { fontSize: 10, cellPadding: 7 },
    columnStyles: {
      0: { cellWidth: NUTRITION_COL_WIDTHS.metric, fontStyle: "bold" },
      1: { cellWidth: NUTRITION_COL_WIDTHS.target },
      2: { cellWidth: NUTRITION_COL_WIDTHS.planAvg },
      3: { cellWidth: contentWidth - NUTRITION_COL_WIDTHS.metric - NUTRITION_COL_WIDTHS.target - NUTRITION_COL_WIDTHS.planAvg, halign: "right" },
    },
  });

  let cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 300;

  plan.days.forEach((day) => {
    autoTable(doc, {
      startY: cursorY + 14,
      head: [[day.day, "Meal", "kcal", "Protein", "Prep"]],
      body: [
        ["Breakfast", day.breakfast.name, `${day.breakfast.kcal}`, `${day.breakfast.protein}g`, `${day.breakfast.prepTimeMin}m`],
        ["Lunch", day.lunch.name, `${day.lunch.kcal}`, `${day.lunch.protein}g`, `${day.lunch.prepTimeMin}m`],
        ["Dinner", day.dinner.name, `${day.dinner.kcal}`, `${day.dinner.protein}g`, `${day.dinner.prepTimeMin}m`],
        ["Snack", day.snack.name, `${day.snack.kcal}`, `${day.snack.protein}g`, `${day.snack.prepTimeMin}m`],
      ],
      theme: "grid",
      tableWidth: contentWidth,
      margin: { left: marginX, right: marginX, bottom: 34 },
      headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.ink, fontStyle: "bold", lineColor: COLORS.hairline, lineWidth: 0.6 },
      bodyStyles: { textColor: COLORS.ink, lineColor: COLORS.hairline, lineWidth: 0.5 },
      styles: { fontSize: 9.5, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 84, fontStyle: "bold" },
        1: { cellWidth: contentWidth - 244 },
        2: { cellWidth: 48, halign: "right" },
        3: { cellWidth: 60, halign: "right" },
        4: { cellWidth: 52, halign: "right" },
      },
    });
    cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
  });

  addPageNumbers(doc);
  doc.save(buildFileName(now));
}
