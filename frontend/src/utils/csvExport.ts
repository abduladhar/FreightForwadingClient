import { downloadText } from "@/utils/downloadFile";

export interface CsvExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  fileName?: string;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], options?: CsvExportOptions) {
  const delimiter = options?.delimiter ?? ",";
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  const lines: string[] = [];

  if (options?.includeHeaders !== false) {
    lines.push(headers.map((header) => escapeCsvValue(header, delimiter)).join(delimiter));
  }

  for (const row of rows) {
    const line = headers.map((header) => escapeCsvValue(row[header], delimiter)).join(delimiter);
    lines.push(line);
  }

  return lines.join("\n");
}

export function exportFilteredCsv<T extends Record<string, unknown>>(rows: T[], fileName = "filtered-report.csv", options?: CsvExportOptions) {
  const csv = toCsv(rows, options);
  downloadText(csv, fileName, "text/csv;charset=utf-8;");
}

export function exportFullCsv<T extends Record<string, unknown>>(rows: T[], fileName = "full-report.csv", options?: CsvExportOptions) {
  const csv = toCsv(rows, options);
  downloadText(csv, fileName, "text/csv;charset=utf-8;");
}

function escapeCsvValue(value: unknown, delimiter: string) {
  if (value === null || value === undefined) return "";
  const normalized = String(value).replace(/\r?\n/g, " ");
  if (normalized.includes("\"") || normalized.includes(delimiter) || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }
  return normalized;
}
