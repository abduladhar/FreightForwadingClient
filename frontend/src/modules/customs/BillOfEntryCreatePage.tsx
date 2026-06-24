import { createBillOfEntry } from "@/api/billOfEntryApi";
import { BillOfEntryForm } from "@/modules/customs/BillOfEntryForm";

export function BillOfEntryCreatePage() {
  return (
    <BillOfEntryForm
      title="New Bill of Entry"
      description="Capture import declaration, warehouse, inventory, and duty details."
      onSubmit={createBillOfEntry}
    />
  );
}
