import { useMutation, useQuery } from "@tanstack/react-query";
import { getLanguages, upsertTranslation } from "@/api/languageApi";
import { TranslationForm, type TranslationFormValues } from "@/modules/languages/TranslationForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";

export function TranslationEditorPage() {
  const languagesQuery = useQuery({ queryKey: ["languages"], queryFn: getLanguages });
  const mutation = useMutation({ mutationFn: upsertTranslation });
  async function onSubmit(v: TranslationFormValues) {
    await mutation.mutateAsync({
      ...v,
      defaultValue: v.defaultValue || null
    });
  }
  return (
    <div className="space-y-4">
      <PageHeader title="Translation Editor" description="Create and approve translations with RTL preview support." actions={<AuditTrailButton />} />
      <Card><CardContent className="pt-6"><TranslationForm languages={languagesQuery.data ?? []} onSubmit={onSubmit} isSubmitting={mutation.isPending} /></CardContent></Card>
    </div>
  );
}
