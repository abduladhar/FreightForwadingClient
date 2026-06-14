import type { ColumnDef } from "@tanstack/react-table";
import { DataTable as CommonDataTable } from "@/components/common/DataTable";

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = "No records found for the selected filters."
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyMessage?: string;
}) {
  return (
    <CommonDataTable
      data={data}
      columns={columns}
      totalCount={data.length}
      pageNumber={1}
      pageSize={Math.max(10, data.length || 10)}
      onPaginationChange={() => undefined}
      searchPlaceholder={emptyMessage}
    />
  );
}
