import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { lt } from "@/modules/operationsLocalization";
import { formatDate } from "@/utils/dateFormat";

export interface PdfColumn<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface PdfExportOptions<T extends Record<string, unknown>> {
  fileName: string;
  title: string;
  tenantName: string;
  branchName: string;
  branchAddress?: string;
  tenantLogoUrl?: string;
  documentNumber?: string;
  documentDate?: string | Date;
  footerText?: string;
  currencyCode?: string;
  cultureCode?: string;
  rtl?: boolean;
  signatureLabel?: string;
  columns: PdfColumn<T>[];
  rows: T[];
}

export async function exportPdfReport<T extends Record<string, unknown>>(options: PdfExportOptions<T>) {
  const doc = buildPdfDocument(options);
  const blob = await pdf(doc).toBlob();
  saveAs(blob, options.fileName.endsWith(".pdf") ? options.fileName : `${options.fileName}.pdf`);
}

function buildPdfDocument<T extends Record<string, unknown>>(options: PdfExportOptions<T>) {
  const styles = createStyles(Boolean(options.rtl));
  const tableColumnsWidth = options.columns.map((column) => column.width ?? `${(100 / options.columns.length).toFixed(2)}%`);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        options.tenantLogoUrl
          ? React.createElement(Image, {
              src: options.tenantLogoUrl,
              style: styles.logo
            })
          : null,
        React.createElement(
          View,
          { style: styles.headerContent },
          React.createElement(Text, { style: styles.title }, options.title),
          React.createElement(Text, { style: styles.subTitle }, options.tenantName),
          React.createElement(Text, { style: styles.subTitle }, options.branchName),
          options.branchAddress ? React.createElement(Text, { style: styles.subTitle }, options.branchAddress) : null
        )
      ),
      React.createElement(
        View,
        { style: styles.meta },
        options.documentNumber ? React.createElement(Text, null, `Document No: ${options.documentNumber}`) : null,
        options.documentDate ? React.createElement(Text, null, `Date: ${formatDate(options.documentDate, { cultureCode: options.cultureCode })}`) : null,
        options.currencyCode ? React.createElement(Text, null, `${lt("Currency")}: ${options.currencyCode}`) : null
      ),
      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableHeaderRow },
          ...options.columns.map((column, index) =>
            React.createElement(
              View,
              { key: `head-${String(column.key)}`, style: { ...styles.cell, width: tableColumnsWidth[index] } },
              React.createElement(Text, { style: styles.tableHeaderText }, column.label)
            )
          )
        ),
        ...options.rows.map((row, rowIndex) =>
          React.createElement(
            View,
            { key: `row-${rowIndex}`, style: styles.tableBodyRow },
            ...options.columns.map((column, columnIndex) =>
              React.createElement(
                View,
                { key: `${rowIndex}-${String(column.key)}`, style: { ...styles.cell, width: tableColumnsWidth[columnIndex] } },
                React.createElement(Text, { style: { ...styles.tableBodyText, textAlign: column.align ?? (options.rtl ? "right" : "left") } }, formatPdfValue(row[column.key], options.cultureCode))
              )
            )
          )
        )
      ),
      React.createElement(
        View,
        { style: styles.signatureSection },
        React.createElement(Text, null, options.signatureLabel ?? "Authorized Signature"),
        React.createElement(View, { style: styles.signatureLine })
      ),
      React.createElement(
        View,
        { style: styles.footer, fixed: true },
        options.footerText ? React.createElement(Text, null, options.footerText) : null,
        React.createElement(Text, { render: ({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}` })
      )
    )
  );
}

function createStyles(rtl: boolean) {
  return StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 30,
      paddingHorizontal: 24,
      fontSize: 10,
      direction: rtl ? "rtl" : "ltr"
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    },
    logo: {
      width: 48,
      height: 48,
      objectFit: "contain"
    },
    headerContent: {
      flex: 1
    },
    title: {
      fontSize: 16,
      fontWeight: "bold"
    },
    subTitle: {
      fontSize: 10,
      marginTop: 2
    },
    meta: {
      marginBottom: 10,
      gap: 2
    },
    table: {
      borderWidth: 1,
      borderColor: "#cbd5e1"
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#dbeafe"
    },
    tableBodyRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0"
    },
    cell: {
      padding: 6,
      borderRightWidth: 1,
      borderRightColor: "#e2e8f0"
    },
    tableHeaderText: {
      fontSize: 9,
      fontWeight: "bold"
    },
    tableBodyText: {
      fontSize: 9
    },
    signatureSection: {
      marginTop: 24,
      width: 200
    },
    signatureLine: {
      marginTop: 24,
      borderTopWidth: 1,
      borderTopColor: "#64748b"
    },
    footer: {
      position: "absolute",
      bottom: 12,
      left: 24,
      right: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: "#64748b"
    }
  });
}

function formatPdfValue(value: unknown, cultureCode = "en-US") {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    return new Intl.NumberFormat(cultureCode, { maximumFractionDigits: 2 }).format(value);
  }
  if (value instanceof Date) return formatDate(value, { cultureCode });
  return String(value);
}
