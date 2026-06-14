import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createVendor, type VendorRequest } from "@/api/vendorApi";
import { VendorForm } from "@/modules/vendors/VendorForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function VendorCreatePage() {
  const m = useMasterDataI18n("Vendor");
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createVendor, onSuccess: async (vendor) => { await queryClient.invalidateQueries({ queryKey: ["vendors"] }); navigate(`/vendors/${vendor.id}`); } });
  return <div className="space-y-4"><PageHeader title={m("Create Vendor")} description={m("Create vendor profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}><VendorForm onSubmit={async (v: VendorRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
