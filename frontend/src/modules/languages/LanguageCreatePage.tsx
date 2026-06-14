import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createLanguage } from "@/api/languageApi";
import { LanguageForm, type LanguageFormValues } from "@/modules/languages/LanguageForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function LanguageCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: createLanguage, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["languages"] }); navigate("/languages"); } });
  async function onSubmit(v: LanguageFormValues) { await mutation.mutateAsync(v); }
  return <div className="space-y-4"><PageHeader title="Create Language" description="Create language and localization formats." /><Card><CardContent className="pt-6"><LanguageForm onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card></div>;
}
