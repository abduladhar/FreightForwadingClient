import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportRowsToWorkbook<T extends Record<string, unknown>>(fileName: string, sheetName: string, rows: T[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const keys = Object.keys(rows[0] ?? {});
  sheet.columns = keys.map((key) => ({ header: key, key, width: Math.max(16, key.length + 4) }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
}
