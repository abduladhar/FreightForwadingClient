import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/api/employeeApi";
import { lt } from "@/modules/operationsLocalization";

export function SalesmanSelect({
  value,
  onChange,
  disabled,
  allowEmpty = true,
  emptyLabel
}: {
  value?: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) {
  const query = useQuery({ queryKey: ["salesmen"], queryFn: () => getEmployees(true, true) });
  return (
    <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={value ?? ""} disabled={disabled || query.isLoading} onChange={(event) => onChange(event.target.value || null)}>
      {allowEmpty ? <option value="">{emptyLabel ?? lt("No salesman")}</option> : null}
      {(query.data ?? []).map((employee) => (
        <option key={employee.id} value={employee.id}>{employee.employeeCode} - {employee.fullName}</option>
      ))}
    </select>
  );
}
