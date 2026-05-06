import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { INGREDIENT_CATEGORIES, type GroceryByCategory, type UserProfile } from "@/types/planner";
import { toTitleCase } from "@/lib/utils";
import { t } from "@/locales";

type ExportGroceryListPdfInput = {
  profile: UserProfile;
  state: string;
  toBuyByCategory: GroceryByCategory;
  summary: {
    total: number;
    toBuy: number;
    covered: number;
  };
};

const COLORS = {
  ink: [24, 40, 61] as [number, number, number],
  muted: [96, 118, 145] as [number, number, number],
  hairline: [218, 228, 240] as [number, number, number],
  headerFill: [236, 242, 250] as [number, number, number],
  cardFill: [245, 249, 255] as [number, number, number],
};

const TWO_COL_LABEL_WIDTH = 190;

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
  return `zoop-grocery-list-${now.toISOString().slice(0, 10)}.pdf`;
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

export function exportGroceryListPdf({ profile, state, toBuyByCategory, summary }: ExportGroceryListPdfInput) {
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
  doc.text(t.planner.grocery.pdfTitle, marginX + 14, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${state} • ${t.planner.grocery.generatedOn} ${formatDate(now)}`, marginX + 14, 74);
  doc.text(`${toTitleCase(profile.goal)} • ${toTitleCase(profile.dietType)} • ${toTitleCase(profile.mealStyle)}`, marginX + 14, 89);

  autoTable(doc, {
    startY: 120,
    head: [["User info", "Value"]],
    body: [
      ["Sex", toTitleCase(profile.sex)],
      ["Age", `${profile.age} years`],
      ["Height", `${profile.heightCm} cm`],
      ["Weight", `${profile.weightKg} kg`],
      ["Activity", toTitleCase(profile.activityLevel)],
      ["Protein focus", toTitleCase(profile.proteinFocus)],
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

  const afterUserInfoY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 200;
  autoTable(doc, {
    startY: afterUserInfoY + 14,
    head: [[t.planner.grocery.summaryTitle, t.planner.grocery.value]],
    body: [
      [t.planner.grocery.totalIngredientsLabel, `${summary.total}`],
      [t.planner.grocery.toBuyLabel, `${summary.toBuy}`],
    ],
    theme: "grid",
    tableWidth: contentWidth,
    margin: { left: marginX, right: marginX },
    headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.ink, fontStyle: "bold", lineColor: COLORS.hairline, lineWidth: 0.6 },
    bodyStyles: { textColor: COLORS.ink, lineColor: COLORS.hairline, lineWidth: 0.5 },
    styles: { fontSize: 10, cellPadding: 7 },
    columnStyles: { 0: { cellWidth: TWO_COL_LABEL_WIDTH, fontStyle: "bold" }, 1: { cellWidth: contentWidth - TWO_COL_LABEL_WIDTH, halign: "right" } },
  });

  const toBuyRows = INGREDIENT_CATEGORIES.flatMap((category) =>
    toBuyByCategory[category].map((item) => [category, item.name, `${formatQuantity(item.quantity)} ${item.unit}`]),
  );

  const afterSummaryY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 280;
  autoTable(doc, {
    startY: afterSummaryY + 16,
    head: [[t.planner.grocery.toBuySection, t.planner.grocery.item, t.planner.grocery.quantity]],
    body: toBuyRows.length ? toBuyRows : [["-", t.planner.grocery.noItems, "-"]],
    theme: "grid",
    tableWidth: contentWidth,
    margin: { left: marginX, right: marginX, bottom: 34 },
    headStyles: { fillColor: COLORS.headerFill, textColor: COLORS.ink, fontStyle: "bold", lineColor: COLORS.hairline, lineWidth: 0.6 },
    bodyStyles: { textColor: COLORS.ink, lineColor: COLORS.hairline, lineWidth: 0.5 },
    styles: { fontSize: 10, cellPadding: 7 },
    columnStyles: {
      0: { cellWidth: 160, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 260 },
      2: { cellWidth: 100, halign: "right" },
    },
  });

  addPageNumbers(doc);
  doc.save(buildFileName(now));
}
