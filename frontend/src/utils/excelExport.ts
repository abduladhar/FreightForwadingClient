import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { lt } from "@/modules/operationsLocalization";
import { formatDateRange } from "@/utils/dateFormat";

export interface ExcelSheetExport<T extends Record<string, unknown>> {
  sheetName: string;
  columns: Array<{
    key: keyof T;
    header: string;
    width?: number;
    type?: "text" | "number" | "currency";
    currencyCode?: string;
  }>;
  rows: T[];
  totals?: Partial<Record<keyof T, number>>;
}

export interface ExcelExportOptions<T extends Record<string, unknown>> {
  fileName: string;
  reportTitle: string;
  tenantName: string;
  branchName: string;
  dateFrom?: string | Date;
  dateTo?: string | Date;
  filtersSummary?: string;
  translate?: (value: string) => string;
  sheets: ExcelSheetExport<T>[];
}

export async function exportExcelReport<T extends Record<string, unknown>>(options: ExcelExportOptions<T>) {
  const t = options.translate ?? lt;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Freight ERP";
  workbook.created = new Date();

  for (const sheetConfig of options.sheets) {
    const sheet = workbook.addWorksheet(t(sheetConfig.sheetName));
    const titleRowsEnd = 6;

    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = t(options.reportTitle);
    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A2").value = `${t("Tenant")}: ${options.tenantName}`;
    sheet.getCell("A3").value = `${t("Branch")}: ${options.branchName}`;
    sheet.getCell("A4").value = `${t("Date Range")}: ${formatDateRange(options.dateFrom, options.dateTo)}`;
    sheet.getCell("A5").value = `${t("Filters")}: ${options.filtersSummary ? t(options.filtersSummary) : t("N/A")}`;

    sheet.columns = sheetConfig.columns.map((column) => ({
      key: String(column.key),
      header: t(column.header),
      width: column.width ?? Math.max(14, t(column.header).length + 4)
    }));

    const headerRow = sheet.getRow(titleRowsEnd);
    headerRow.values = sheetConfig.columns.map((column) => t(column.header));
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D4ED8" }
    };

    for (const row of sheetConfig.rows) {
      const rowData: Record<string, unknown> = {};
      for (const column of sheetConfig.columns) {
        rowData[String(column.key)] = row[column.key] ?? "";
      }
      sheet.addRow(rowData);
    }

    for (let rowIndex = 0; rowIndex < sheetConfig.rows.length; rowIndex++) {
      const row = sheet.getRow(titleRowsEnd + 1 + rowIndex);
      for (const [index, column] of sheetConfig.columns.entries()) {
        const cell = row.getCell(index + 1);
        if (column.type === "number") {
          cell.numFmt = "#,##0.00";
        } else if (column.type === "currency") {
          const code = column.currencyCode ?? "USD";
          cell.numFmt = `"${code}" #,##0.00`;
        }
      }
    }

    if (sheetConfig.totals) {
      const totalsRow = sheet.addRow({});
      totalsRow.getCell(1).value = t("Total");
      totalsRow.font = { bold: true };
      for (const [columnKey, total] of Object.entries(sheetConfig.totals)) {
        const columnIndex = sheetConfig.columns.findIndex((column) => String(column.key) === columnKey);
        if (columnIndex >= 0 && typeof total === "number") {
          totalsRow.getCell(columnIndex + 1).value = total;
        }
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), options.fileName.endsWith(".xlsx") ? options.fileName : `${options.fileName}.xlsx`);
}
