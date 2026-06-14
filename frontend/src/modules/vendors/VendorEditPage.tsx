import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getVendor, updateVendor, type VendorRequest } from "@/api/vendorApi";
import { VendorForm } from "@/modules/vendors/VendorForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";

export function VendorEditPage() {
  const m = useMasterDataI18n("Vendor");
  const { vendorId } = useParams();
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["vendor", vendorId], queryFn: () => getVendor(vendorId!), enabled: Boolean(vendorId) });
  const mutation = useMutation({ mutationFn: (v: VendorRequest) => updateVendor(vendorId!, v), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["vendors"] }); navigate(`/vendors/${vendorId}`); } });
  if (!vendorId) return <Navigate to="/vendors" replace />;
  return <div className="space-y-4"><PageHeader title={m("Edit Vendor")} description={m("Update vendor profile.")} /><Card className={masterDataPanelClass}><CardContent className={masterDataPanelContentClass}>{query.data ? <VendorForm initialValue={query.data} onSubmit={async (v: VendorRequest) => { await mutation.mutateAsync(v); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">{m("Loading")}</p>}</CardContent></Card></div>;
}
