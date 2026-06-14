import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type VisibilityState
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Eye, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SearchFilterBar } from "@/components/common/SearchFilterBar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMasterDataI18n } from "@/modules/masterDataI18n";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  sorting?: SortingState;
  isLoading?: boolean;
  isError?: boolean;
  search?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  onSearchChange?: (value: string) => void;
  onPaginationChange: (pageNumber: number, pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onRetry?: () => void;
  rowActions?: (row: TData) => ReactNode;
}

export function DataTable<TData>({
  data,
  columns,
  totalCount,
  pageNumber,
  pageSize,
  sorting = [],
  isLoading,
  isError,
  search = "",
  searchPlaceholder,
  filters,
  onSearchChange,
  onPaginationChange,
  onSortingChange,
  onRetry,
  rowActions
}: DataTableProps<TData>) {
  const m = useMasterDataI18n("Common");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const tableColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!rowActions) return columns;
    return [
      ...columns,
      {
        id: "_actions",
        header: m("Actions"),
        cell: ({ row }) => <div className="flex justify-end">{rowActions(row.original)}</div>,
        enableSorting: false
      }
    ];
  }, [columns, m, rowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
      pagination: { pageIndex: Math.max(0, pageNumber - 1), pageSize } satisfies PaginationState,
      columnVisibility
    },
    onSortingChange: (updater) => {
      if (!onSortingChange) return;
      const nextValue = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(nextValue);
    },
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(totalCount / pageSize))
  });

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(totalCount, pageNumber * pageSize);

  if (isError) return <ErrorState onRetry={onRetry} />;

  return (
    <div className="space-y-3">
      <SearchFilterBar
        search={search}
        onSearchChange={(value) => onSearchChange?.(value)}
        placeholder={searchPlaceholder}
        filters={
          <div className="flex flex-wrap gap-2">
            {onSortingChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sorting[0]?.desc ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />} {m("Sort")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                  {table.getAllColumns().filter((column) => column.getCanSort()).map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onSelect={() => {
                        const current = sorting[0];
                        onSortingChange([{ id: column.id, desc: current?.id === column.id ? !current.desc : false }]);
                      }}
                    >
                      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                        {sorting[0]?.id === column.id ? (sorting[0].desc ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />) : null}
                      </span>
                      {columnLabel(table, column.id)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" /> {m("Fields")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onSelect={(event) => {
                        event.preventDefault();
                        column.toggleVisibility();
                      }}
                    >
                      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
                        {column.getIsVisible() ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                      </span>
                      {columnLabel(table, column.id)}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
        rightActions={filters}
      />

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:hidden">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`card-skeleton-${index}`} className="min-h-52 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-4 h-5 w-2/3 rounded bg-gray-100 dark:bg-gray-800" />
                <div className="space-y-3">
                  <div className="h-4 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-5/6 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-9 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900">
                    {table.getVisibleFlatColumns().map((column) => (
                      <TableHead key={column.id}>{columnLabel(table, column.id)}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, rowIndex) => (
                    <TableRow key={`table-skeleton-${rowIndex}`}>
                      {table.getVisibleFlatColumns().map((column) => (
                        <TableCell key={`${rowIndex}-${column.id}`}>
                          <div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : table.getRowModel().rows.length ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:hidden">
            {table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells();
              const actionCell = cells.find((cell) => cell.column.id === "_actions");
              const contentCells = cells.filter((cell) => cell.column.id !== "_actions");
              const titleCell = contentCells[0];
              const detailCells = contentCells.slice(1);

              return (
                <article key={row.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                  {titleCell ? (
                    <div className="min-w-0 border-b border-gray-100 pb-3 dark:border-gray-800">
                      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{columnLabel(table, titleCell.column.id)}</div>
                      <div className="mt-1 break-words text-base font-semibold text-gray-900 dark:text-gray-100">
                        {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
                      </div>
                    </div>
                  ) : null}

                  <dl className="flex flex-1 flex-col">
                    {detailCells.map((cell) => (
                      <div key={cell.id} className="flex min-w-0 flex-col gap-1 border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-800">
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{columnLabel(table, cell.column.id)}</dt>
                        <dd className="break-words text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {actionCell ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 [&_a]:inline-flex [&_a]:min-h-10 [&_a]:items-center [&_a]:justify-center [&_a]:rounded-lg [&_a]:border [&_a]:border-gray-300 [&_a]:px-3 [&_a]:py-2 [&_a]:text-sm [&_a]:font-medium [&_a]:transition [&_a]:hover:bg-gray-50 dark:[&_a]:border-gray-700 dark:[&_a]:hover:bg-gray-800 [&_button]:min-h-10 [&_button]:rounded-lg [&_button]:border [&_button]:border-gray-300 [&_button]:px-3 [&_button]:py-2 [&_button]:text-sm [&_button]:font-medium [&_button]:transition [&_button]:hover:bg-gray-50 dark:[&_button]:border-gray-700 dark:[&_button]:hover:bg-gray-800">
                      {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={header.column.id === "_actions" ? "text-right" : undefined}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cell.column.id === "_actions" ? "text-right" : undefined}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"><EmptyState /></div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:flex-row lg:items-center">
        <div className="text-sm text-muted-foreground">
          {m("Showing")} {startItem} {m("to")} {endItem} {m("of")} {totalCount}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <span className="text-sm text-muted-foreground">{m("Rows")}:</span>
          <Input
            className="h-8 w-20"
            type="number"
            min={5}
            max={200}
            value={pageSize}
            onChange={(event) => onPaginationChange(1, Number(event.target.value) || pageSize)}
          />
          <Button variant="outline" size="sm" onClick={() => onPaginationChange(Math.max(1, pageNumber - 1), pageSize)} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="whitespace-nowrap text-sm">{m("Page")} {pageNumber} / {pageCount}</span>
          <Button variant="outline" size="sm" onClick={() => onPaginationChange(Math.min(pageCount, pageNumber + 1), pageSize)} disabled={pageNumber >= pageCount}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPaginationChange(1, pageSize)}>{m("First page")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPaginationChange(pageCount, pageSize)}>{m("Last page")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function columnLabel<TData>(table: ReturnType<typeof useReactTable<TData>>, columnId: string) {
  const header = table.getFlatHeaders().find((item) => item.column.id === columnId);
  if (!header) return humanize(columnId);
  const definition = header.column.columnDef.header;
  if (typeof definition === "string") return definition;
  if (definition == null) return humanize(columnId);
  return flexRender(definition, header.getContext());
}

function humanize(value: string) {
  return value
    .replace(/^_/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
