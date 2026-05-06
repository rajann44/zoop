import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { GroceryByCategory, WeeklyPlan, NutritionTargets } from "@/types/planner";
import { toTitleCase } from "@/lib/utils";

type ExportWeeklyPlanPdfInput = {
  plan: WeeklyPlan;
  targets: NutritionTargets;
  groceryByCategory: GroceryByCategory;
};

function formatDate(value: Date) {
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
}

function buildFileName(now: Date) {
  const datePart = now.toISOString().slice(0, 10);
  return `zoop-weekly-plan-${datePart}.pdf`;
}

function addPageNumbers(doc: jsPDF) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(9);
    doc.setTextColor(114, 129, 148);
    doc.text(`Page ${page} of ${pages}`, doc.internal.pageSize.getWidth() - 44, doc.internal.pageSize.getHeight() - 20, {
      align: "right",
    });
  }
}

export function exportWeeklyPlanPdf({ plan, targets, groceryByCategory }: ExportWeeklyPlanPdfInput) {
  const now = new Date();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(18, 36, 58);
  doc.text("zoop weekly meal plan", 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(85, 107, 132);
  doc.text(`Generated ${formatDate(now)}`, 40, 66);

  autoTable(doc, {
    startY: 84,
    head: [["Profile snapshot", "Value"]],
    body: [
      ["State", plan.profile.state],
      ["Diet", toTitleCase(plan.profile.dietType)],
      ["Protein focus", toTitleCase(plan.profile.proteinFocus)],
      ["Meal style", toTitleCase(plan.profile.mealStyle)],
      ["Goal", toTitleCase(plan.profile.goal)],
      ["Activity", toTitleCase(plan.profile.activityLevel)],
      ["Body details", `${plan.profile.age}y • ${plan.profile.heightCm} cm • ${plan.profile.weightKg} kg • ${toTitleCase(plan.profile.sex)}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [225, 236, 251], textColor: [18, 36, 58], fontStyle: "bold" },
    bodyStyles: { textColor: [33, 51, 73] },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    tableWidth: contentWidth,
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 150 },
      1: { cellWidth: contentWidth - 150 },
    },
    margin: { left: marginX, right: marginX },
  });

  const nutritionRows = [
    ["Calories", `${targets.dailyCalories} kcal`, `${plan.totals.avgKcal} kcal`, `${plan.totals.avgKcal - targets.dailyCalories >= 0 ? "+" : ""}${plan.totals.avgKcal - targets.dailyCalories} kcal`],
    ["Protein", `${targets.dailyProtein} g`, `${plan.totals.avgProtein} g`, `${plan.totals.avgProtein - targets.dailyProtein >= 0 ? "+" : ""}${plan.totals.avgProtein - targets.dailyProtein} g`],
  ];

  const lastYAfterProfile = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 120;
  autoTable(doc, {
    startY: lastYAfterProfile + 14,
    head: [["Nutrition", "Daily target", "Planned average", "Delta"]],
    body: nutritionRows,
    theme: "grid",
    headStyles: { fillColor: [225, 236, 251], textColor: [18, 36, 58], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    tableWidth: contentWidth,
    columnStyles: {
      0: { cellWidth: 140, fontStyle: "bold" },
      1: { cellWidth: 120 },
      2: { cellWidth: 130 },
      3: { cellWidth: contentWidth - 390, halign: "right" },
    },
    margin: { left: marginX, right: marginX },
  });

  let cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 180;

  plan.days.forEach((day) => {
    autoTable(doc, {
      startY: cursorY + 16,
      head: [[`${day.day}`, "Meal", "kcal", "Protein", "Carbs", "Fat", "Prep"]],
      body: [
        ["Breakfast", day.breakfast.name, `${day.breakfast.kcal}`, `${day.breakfast.protein}g`, `${day.breakfast.carbs}g`, `${day.breakfast.fat}g`, `${day.breakfast.prepTimeMin}m`],
        ["Lunch", day.lunch.name, `${day.lunch.kcal}`, `${day.lunch.protein}g`, `${day.lunch.carbs}g`, `${day.lunch.fat}g`, `${day.lunch.prepTimeMin}m`],
        ["Dinner", day.dinner.name, `${day.dinner.kcal}`, `${day.dinner.protein}g`, `${day.dinner.carbs}g`, `${day.dinner.fat}g`, `${day.dinner.prepTimeMin}m`],
        ["Snack", day.snack.name, `${day.snack.kcal}`, `${day.snack.protein}g`, `${day.snack.carbs}g`, `${day.snack.fat}g`, `${day.snack.prepTimeMin}m`],
      ],
      theme: "grid",
      headStyles: { fillColor: [236, 243, 253], textColor: [18, 36, 58], fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 6, lineColor: [224, 233, 245], lineWidth: 0.5 },
      tableWidth: contentWidth,
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 72 },
        1: { cellWidth: 185 },
        2: { halign: "right", cellWidth: 52 },
        3: { halign: "right", cellWidth: 56 },
        4: { halign: "right", cellWidth: 52 },
        5: { halign: "right", cellWidth: 45 },
        6: { halign: "right", cellWidth: contentWidth - 462 },
      },
      margin: { left: marginX, right: marginX },
    });
    cursorY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
  });

  const groceryRows = Object.entries(groceryByCategory)
    .flatMap(([category, items]) =>
      items.map((item) => [category, item.name, `${formatQuantity(item.quantity)} ${item.unit}`]),
    )
    .sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

  autoTable(doc, {
    startY: cursorY + 18,
    head: [["Grocery category", "Item", "Quantity"]],
    body: groceryRows.length ? groceryRows : [["-", "No grocery items", "-"]],
    theme: "grid",
    headStyles: { fillColor: [225, 236, 251], textColor: [18, 36, 58], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    tableWidth: contentWidth,
    columnStyles: {
      0: { cellWidth: 145, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 245 },
      2: { cellWidth: 100, halign: "right" },
    },
    margin: { left: marginX, right: marginX, bottom: 34 },
  });

  addPageNumbers(doc);
  doc.save(buildFileName(now));
}
