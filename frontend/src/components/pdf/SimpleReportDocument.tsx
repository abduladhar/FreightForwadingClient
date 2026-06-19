import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { lt } from "@/modules/operationsLocalization";
import { ensurePdfFontsRegistered, getPdfFontFamily } from "@/utils/pdfFonts";

export function SimpleReportDocument({ title, rows }: { title: string; rows: Array<Record<string, string | number>> }) {
  ensurePdfFontsRegistered();
  const styles = createStyles();
  const columns = Object.keys(rows[0] ?? {});
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{lt(title)}</Text>
        <View style={styles.row}>
          {columns.map((column) => (
            <Text key={column} style={styles.cell}>{lt(column)}</Text>
          ))}
        </View>
        {rows.map((row, index) => (
          <View key={index} style={styles.row}>
            {columns.map((column) => (
              <Text key={column} style={styles.cell}>{String(row[column])}</Text>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

function createStyles() {
  return StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: getPdfFontFamily(), color: "#0f172a" },
    title: { fontSize: 18, marginBottom: 12, fontWeight: 700 },
    row: { flexDirection: "row", borderBottom: "1px solid #e2e8f0", paddingVertical: 6 },
    cell: { flex: 1 }
  });
}
