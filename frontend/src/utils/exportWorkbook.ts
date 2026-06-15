import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { lt } from "@/modules/operationsLocalization";

export async function exportRowsToWorkbook<T extends Record<string, unknown>>(fileName: string, sheetName: string, rows: T[], translate: (value: string) => string = lt) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(translate(sheetName));
  const keys = Object.keys(rows[0] ?? {});
  sheet.columns = keys.map((key) => ({ header: translate(key), key, width: Math.max(16, translate(key).length + 4) }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
}
