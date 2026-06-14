import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/app/i18n";
import { searchCustomers, deleteCustomer, type CustomerDto } from "@/api/customerApi";
import { useAuth } from "@/auth/useAuth";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { customerButtonClass, customerPanelClass, customerPanelContentClass } from "@/modules/customers/customerUi";

export function CustomerListPage() {
  const { t } = useI18n();
  const { hasPermission } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const query = useQuery({ queryKey: ["customers", pageNumber, pageSize, search], queryFn: () => searchCustomers({ pageNumber, pageSize, search }) });
  const queryClient = useQueryClient();
  const remove = useMutation({ mutationFn: deleteCustomer, onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["customers"] }) });
  const columns: ColumnDef<CustomerDto>[] = [
    { accessorKey: "customerCode", header: t("Customer.Code", "Code") },
    { accessorKey: "customerName", header: t("Customer.Name", "Name") },
    { accessorKey: "email", header: t("Customer.Email", "Email") },
    { accessorKey: "creditLimit", header: t("Customer.CreditLimit", "Credit Limit") },
    { accessorKey: "paymentTerms", header: t("Customer.PaymentTerms", "Payment Terms") },
    { id: "status", header: t("Common.Status", "Status"), cell: ({ row }) => <StatusBadge status={row.original.isActive ? "Active" : "Inactive"} /> }
  ];
  return <div className="space-y-4"><PageHeader title={t("Page.Title.Customers", "Customers")} description={t("Page.Description.CustomerMasterWithCreditControlsAndPortalAccess", "Customer master with credit controls and portal access.")} actions={<><AuditTrailButton /><PermissionButton asChild permission="Customer.Create" className={customerButtonClass}><Link to="/customers/new"><Plus className="h-4 w-4" /> {t("Customer.NewCustomer", "New Customer")}</Link></PermissionButton></>} /><Card className={customerPanelClass}><CardContent className={customerPanelContentClass}><DataTable data={query.data?.items ?? []} columns={columns} totalCount={query.data?.totalCount ?? 0} pageNumber={query.data?.pageNumber ?? pageNumber} pageSize={query.data?.pageSize ?? pageSize} search={search} onSearchChange={setSearch} onPaginationChange={(pn, ps) => { setPageNumber(pn); setPageSize(ps); }} isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} rowActions={(row) => <CustomerActions row={row} hasPermission={hasPermission} onDelete={() => remove.mutateAsync(row.id)} />} /></CardContent></Card></div>;
}

function CustomerActions({ row, hasPermission, onDelete }: { row: CustomerDto; hasPermission: (permission?: string | string[]) => boolean; onDelete: () => Promise<void> }) {
  const { t } = useI18n();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-10 min-h-10 gap-2 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">{t("Common.Actions", "Actions")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasPermission("Customer.Read") ? <DropdownMenuItem asChild><Link to={`/customers/${row.id}`}><Eye className="mr-2 h-4 w-4" /> {t("Customer.ViewCustomer", "View Customer")}</Link></DropdownMenuItem> : null}
        {hasPermission("Customer.Update") ? <DropdownMenuItem asChild><Link to={`/customers/${row.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> {t("Customer.EditCustomer", "Edit Customer")}</Link></DropdownMenuItem> : null}
        {hasPermission("Customer.Delete") ? (
          <ConfirmDialog title={t("Customer.DeleteCustomerQuestion", "Delete customer?")} description={row.customerName} confirmText={t("Common.Delete", "Delete")} variant="danger" onConfirm={onDelete}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4 text-red-600" /> {t("Customer.DeleteCustomer", "Delete Customer")}
            </DropdownMenuItem>
          </ConfirmDialog>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
