import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { INGREDIENT_CATEGORIES, type GroceryByCategory } from "@/types/planner";
import { t } from "@/locales";

type ExportGroceryListPdfInput = {
  state: string;
  toBuyByCategory: GroceryByCategory;
  coveredByCategory: GroceryByCategory;
  summary: {
    total: number;
    toBuy: number;
    covered: number;
  };
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
  return `zoop-grocery-list-${now.toISOString().slice(0, 10)}.pdf`;
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

export function exportGroceryListPdf({ state, toBuyByCategory, coveredByCategory, summary }: ExportGroceryListPdfInput) {
  const now = new Date();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(18, 36, 58);
  doc.text(t.planner.grocery.pdfTitle, marginX, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(85, 107, 132);
  doc.text(`${state} • ${t.planner.grocery.generatedOn} ${formatDate(now)}`, marginX, 66);

  autoTable(doc, {
    startY: 84,
    head: [[t.planner.grocery.summaryTitle, t.planner.grocery.value]],
    body: [
      [t.planner.grocery.totalIngredientsLabel, `${summary.total}`],
      [t.planner.grocery.toBuyLabel, `${summary.toBuy}`],
      [t.planner.grocery.coveredLabel, `${summary.covered}`],
    ],
    theme: "grid",
    tableWidth: contentWidth,
    headStyles: { fillColor: [225, 236, 251], textColor: [18, 36, 58], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    columnStyles: { 0: { cellWidth: 220, fontStyle: "bold" }, 1: { cellWidth: contentWidth - 220, halign: "right" } },
    margin: { left: marginX, right: marginX },
  });

  const toBuyRows = INGREDIENT_CATEGORIES.flatMap((category) =>
    toBuyByCategory[category].map((item) => [category, item.name, `${formatQuantity(item.quantity)} ${item.unit}`]),
  );

  const coveredRows = INGREDIENT_CATEGORIES.flatMap((category) =>
    coveredByCategory[category].map((item) => [category, item.name, `${formatQuantity(item.quantity)} ${item.unit}`]),
  );

  const afterSummaryY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 140;
  autoTable(doc, {
    startY: afterSummaryY + 16,
    head: [[t.planner.grocery.toBuySection, t.planner.grocery.item, t.planner.grocery.quantity]],
    body: toBuyRows.length ? toBuyRows : [["-", t.planner.grocery.noItems, "-"]],
    theme: "grid",
    tableWidth: contentWidth,
    headStyles: { fillColor: [225, 236, 251], textColor: [18, 36, 58], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    columnStyles: {
      0: { cellWidth: 150, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 250 },
      2: { cellWidth: 100, halign: "right" },
    },
    margin: { left: marginX, right: marginX },
  });

  const afterToBuyY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 220;
  autoTable(doc, {
    startY: afterToBuyY + 18,
    head: [[t.planner.grocery.coveredSection, t.planner.grocery.item, t.planner.grocery.quantity]],
    body: coveredRows.length ? coveredRows : [["-", t.planner.grocery.noItems, "-"]],
    theme: "grid",
    tableWidth: contentWidth,
    headStyles: { fillColor: [236, 243, 253], textColor: [18, 36, 58], fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 230, 243], lineWidth: 0.6 },
    columnStyles: {
      0: { cellWidth: 150, fontStyle: "bold" },
      1: { cellWidth: contentWidth - 250 },
      2: { cellWidth: 100, halign: "right" },
    },
    margin: { left: marginX, right: marginX, bottom: 34 },
  });

  addPageNumbers(doc);
  doc.save(buildFileName(now));
}
