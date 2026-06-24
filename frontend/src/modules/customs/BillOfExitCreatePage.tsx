import { createBillOfExit } from "@/api/billOfExitApi";
import { BillOfExitForm } from "@/modules/customs/BillOfExitForm";

export function BillOfExitCreatePage() {
  return (
    <BillOfExitForm
      title="New Bill of Exit"
      description="Create an outbound declaration by selecting available Bill of Entry inventory lines."
      onSubmit={createBillOfExit}
    />
  );
}
