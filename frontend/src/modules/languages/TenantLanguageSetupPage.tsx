import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTenantLanguages, setTenantLanguage, setUserLanguagePreference } from "@/api/languageApi";
import { useLanguage } from "@/hooks/useLanguage";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";

export function TenantLanguageSetupPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["tenant-languages"], queryFn: getTenantLanguages });
  const language = useLanguage();
  const mutation = useMutation({
    mutationFn: ({ languageId, isEnabled, isDefault }: { languageId: string; isEnabled: boolean; isDefault: boolean }) => setTenantLanguage(languageId, isEnabled, isDefault),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ["tenant-languages"] })
  });
  const preferenceMutation = useMutation({ mutationFn: setUserLanguagePreference, onSuccess: async () => { await language.refetch(); } });
  return (
    <div className="space-y-4">
      <PageHeader title="Tenant Language Setup" description="Enable tenant languages, default language, and user preference." actions={<AuditTrailButton />} />
      <Card><CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">My Language Preference:</label>
          <select className="h-9 rounded-md border px-3 text-sm" value={query.data?.find((x) => x.languageCode === language.selectedLanguageCode)?.languageId ?? ""} onChange={(e) => void preferenceMutation.mutate(e.target.value)}>
            <option value="">Select</option>
            {(query.data ?? []).filter((x) => x.isEnabled).map((x) => <option key={x.languageId} value={x.languageId}>{x.displayName}</option>)}
          </select>
        </div>
        <table className="min-w-full text-sm">
          <thead><tr className="border-b"><th className="px-3 py-2 text-left">Language</th><th className="px-3 py-2">Enabled</th><th className="px-3 py-2">Default</th></tr></thead>
          <tbody>
            {(query.data ?? []).map((row) => (
              <tr key={row.languageId} className="border-b">
                <td className="px-3 py-2">{row.languageCode} - {row.displayName}</td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={row.isEnabled} onChange={(e) => void mutation.mutateAsync({ languageId: row.languageId, isEnabled: e.target.checked, isDefault: row.isDefault })} /></td>
                <td className="px-3 py-2 text-center"><input type="radio" name="defaultLanguage" checked={row.isDefault} onChange={() => void mutation.mutateAsync({ languageId: row.languageId, isEnabled: true, isDefault: true })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
