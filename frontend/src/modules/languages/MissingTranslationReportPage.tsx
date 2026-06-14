import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { getMissingTranslations } from "@/api/languageApi";
import type { MissingTranslation } from "@/types/language";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/common/DataTable";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";

export function MissingTranslationReportPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useQuery({ queryKey: ["missing-translations"], queryFn: getMissingTranslations });
  const rows = useMemo(() => (query.data ?? []).filter((x) => [x.resourceGroupName, x.resourceKey, x.requestedLanguageCode].join(" ").toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  const paged = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const columns: ColumnDef<MissingTranslation>[] = [
    { accessorKey: "resourceGroupName", header: "Group" },
    { accessorKey: "resourceKey", header: "Key" },
    { accessorKey: "requestedLanguageCode", header: "Language" },
    { accessorKey: "userId", header: "User" },
    { accessorKey: "requestedAt", header: "Requested At" }
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Missing Translation Report" description="Track untranslated resource requests." actions={<AuditTrailButton />} />
      <Card><CardContent className="pt-6"><DataTable data={paged} columns={columns} totalCount={rows.length} pageNumber={pageNumber} pageSize={pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} /></CardContent></Card>
    </div>
  );
}
