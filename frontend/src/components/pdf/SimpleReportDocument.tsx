import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#0f172a" },
  title: { fontSize: 18, marginBottom: 12, fontWeight: 700 },
  row: { flexDirection: "row", borderBottom: "1px solid #e2e8f0", paddingVertical: 6 },
  cell: { flex: 1 }
});

export function SimpleReportDocument({ title, rows }: { title: string; rows: Array<Record<string, string | number>> }) {
  const columns = Object.keys(rows[0] ?? {});
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.row}>
          {columns.map((column) => (
            <Text key={column} style={styles.cell}>{column}</Text>
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
