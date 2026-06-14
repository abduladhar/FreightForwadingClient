import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getLanguages, updateLanguage } from "@/api/languageApi";
import { LanguageForm, type LanguageFormValues } from "@/modules/languages/LanguageForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function LanguageEditPage() {
  const { languageId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const current = (query.data ?? []).find((x) => x.id === languageId);
  const mutation = useMutation({
    mutationFn: (v: Omit<LanguageFormValues, "languageCode">) => updateLanguage(languageId!, v),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["languages"] });
      navigate("/languages");
    }
  });
  if (!languageId) return <Navigate to="/languages" replace />;
  return <div className="space-y-4"><PageHeader title="Edit Language" description="Update localization profile." /><Card><CardContent className="pt-6">{current ? <LanguageForm initialValue={current} disableCode onSubmit={async (v) => { const { languageCode: _code, ...rest } = v; await mutation.mutateAsync(rest); }} isSubmitting={mutation.isPending} /> : <p className="text-sm text-muted-foreground">Loading...</p>}</CardContent></Card></div>;
}
