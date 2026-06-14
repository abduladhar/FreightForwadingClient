import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { BadgePercent, Eye, Network, Pencil, Plus, Target } from "lucide-react";
import { getEmployees, type EmployeeDto } from "@/api/employeeApi";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { lt } from "@/modules/operationsLocalization";

export function EmployeeListPage() {
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const query = useQuery({ queryKey: ["employees"], queryFn: () => getEmployees(false, false) });
  const rows = (query.data ?? []).filter((x) => [x.employeeCode, x.email, x.firstName, x.lastName, x.designationName].join(" ").toLowerCase().includes(search.toLowerCase()));
  const paged = rows.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const columns: ColumnDef<EmployeeDto>[] = [{ accessorKey: "employeeCode", header: lt("Employee Code") }, { accessorKey: "fullName", header: lt("Employee Name") }, { accessorKey: "designationName", header: lt("Designation") }, { id: "salesman", header: lt("Salesman"), cell: ({ row }) => <StatusBadge status={row.original.isSalesman ? "Active" : "Inactive"} /> }, { id: "user", header: lt("Login"), cell: ({ row }) => row.original.userName || "-" }, { id: "status", header: lt("Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }];
  return <div className="space-y-4"><PageHeader title={lt("Employees")} description={lt("Business employee master, independent from application users.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Designation.Read" variant="outline"><Link to="/designations">{lt("Designations")}</Link></PermissionButton><PermissionButton asChild permission="SalesPerformance.Read" variant="outline"><Link to="/employees/salesman-targets"><Target className="h-4 w-4" />{lt("Salesman Targets")}</Link></PermissionButton><PermissionButton asChild permission="SalesPerformance.Read" variant="outline"><Link to="/employees/incentive-rules"><BadgePercent className="h-4 w-4" />{lt("Incentive Rules")}</Link></PermissionButton><PermissionButton asChild permission="SalesPerformance.Read" variant="outline"><Link to="/employees/incentive-tree-report"><Network className="h-4 w-4" />{lt("Incentive Tree")}</Link></PermissionButton><PermissionButton asChild permission="Employee.Create"><Link to="/employees/new"><Plus className="h-4 w-4" />{lt("New Employee")}</Link></PermissionButton></>} /><Card><CardContent className="pt-6"><DataTable data={paged} columns={columns} totalCount={rows.length} pageNumber={pageNumber} pageSize={pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <div className="flex gap-1"><Button asChild size="sm" variant="ghost"><Link to={`/employees/${row.id}`}><Eye className="h-4 w-4" /></Link></Button><PermissionButton asChild permission="Employee.Update" size="sm" variant="ghost"><Link to={`/employees/${row.id}/edit`}><Pencil className="h-4 w-4" /></Link></PermissionButton></div>} /></CardContent></Card></div>;
}
