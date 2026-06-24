import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { lt } from "@/modules/operationsLocalization";

export interface CustomsExcelColumn<T extends Record<string, unknown>> {
  key: keyof T;
  header: string;
  width?: number;
  type?: "text" | "number" | "currency";
}

export interface CustomsItemsExcelOptions<T extends Record<string, unknown>> {
  fileName: string;
  title: string;
  reference: string;
  tenantName: string;
  branchName: string;
  branchAddress: string;
  logoUrl?: string;
  columns: CustomsExcelColumn<T>[];
  rows: T[];
  totals?: Partial<Record<keyof T, number>>;
}

export async function exportCustomsItemsExcel<T extends Record<string, unknown>>(options: CustomsItemsExcelOptions<T>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Freight ERP";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(lt(options.title).slice(0, 31));
  const lastColumnLetter = sheet.getColumn(options.columns.length).letter;

  sheet.mergeCells(`A1:B4`);
  sheet.mergeCells(`C1:${lastColumnLetter}1`);
  sheet.mergeCells(`C2:${lastColumnLetter}2`);
  sheet.mergeCells(`C3:${lastColumnLetter}3`);
  sheet.mergeCells(`C4:${lastColumnLetter}4`);

  sheet.getCell("C1").value = lt(options.title);
  sheet.getCell("C1").font = { size: 16, bold: true };
  sheet.getCell("C1").alignment = { horizontal: "center" };
  sheet.getCell("C2").value = options.reference;
  sheet.getCell("C2").font = { bold: true, color: { argb: "FF475569" } };
  sheet.getCell("C2").alignment = { horizontal: "center" };
  sheet.getCell("C3").value = `${lt("Branch")}: ${options.branchName}`;
  sheet.getCell("C4").value = options.branchAddress;
  sheet.getCell("C3").alignment = { horizontal: "right" };
  sheet.getCell("C4").alignment = { horizontal: "right", wrapText: true };

  if (options.logoUrl) {
    const image = await loadWorkbookImage(options.logoUrl);
    if (image) {
      const imageId = workbook.addImage(image);
      sheet.addImage(imageId, { tl: { col: 0.15, row: 0.2 }, ext: { width: 95, height: 80 } });
    } else {
      sheet.getCell("A1").value = options.tenantName;
      sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      sheet.getCell("A1").font = { bold: true };
    }
  }

  sheet.columns = options.columns.map((column) => ({
    key: String(column.key),
    width: column.width ?? Math.max(14, lt(column.header).length + 4)
  }));

  const headerRowIndex = 6;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = options.columns.map((column) => lt(column.header));
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
  headerRow.alignment = { vertical: "middle", wrapText: true };

  for (const row of options.rows) {
    const rowData: Record<string, unknown> = {};
    for (const column of options.columns) {
      rowData[String(column.key)] = row[column.key] ?? "";
    }
    sheet.addRow(rowData);
  }

  for (let rowIndex = headerRowIndex; rowIndex <= sheet.rowCount; rowIndex++) {
    const row = sheet.getRow(rowIndex);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } }
      };
      cell.alignment = { vertical: "top", wrapText: true };
    });
  }

  for (let rowIndex = 0; rowIndex < options.rows.length; rowIndex++) {
    const row = sheet.getRow(headerRowIndex + 1 + rowIndex);
    for (const [index, column] of options.columns.entries()) {
      const cell = row.getCell(index + 1);
      if (column.type === "number") cell.numFmt = "#,##0.000";
      if (column.type === "currency") cell.numFmt = "#,##0.00";
    }
  }

  if (options.totals) {
    const totalsRow = sheet.addRow({});
    totalsRow.getCell(1).value = lt("Total");
    totalsRow.font = { bold: true };
    for (const [columnKey, total] of Object.entries(options.totals)) {
      const columnIndex = options.columns.findIndex((column) => String(column.key) === columnKey);
      if (columnIndex >= 0 && typeof total === "number") {
        totalsRow.getCell(columnIndex + 1).value = total;
        totalsRow.getCell(columnIndex + 1).numFmt = "#,##0.000";
      }
    }
  }

  sheet.views = [{ state: "frozen", ySplit: headerRowIndex }];
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), options.fileName.endsWith(".xlsx") ? options.fileName : `${options.fileName}.xlsx`);
}

async function loadWorkbookImage(logoUrl: string): Promise<{ base64: string; extension: "png" | "jpeg" | "gif" } | null> {
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const extension = imageExtension(blob.type);
    if (!extension) return null;
    const base64 = await blobToDataUrl(blob);
    return { base64, extension };
  } catch {
    return null;
  }
}

function imageExtension(mimeType: string): "png" | "jpeg" | "gif" | null {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpeg";
  if (mimeType.includes("gif")) return "gif";
  return null;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
