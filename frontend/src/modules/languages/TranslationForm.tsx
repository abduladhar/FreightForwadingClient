import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Language } from "@/types/language";

const schema = z.object({
  groupName: z.string().trim().min(2).max(100),
  key: z.string().trim().min(1).max(150),
  defaultValue: z.string().trim().max(500).optional().or(z.literal("")),
  languageId: z.string().uuid(),
  value: z.string().trim().min(1).max(1000),
  isApproved: z.boolean()
});
export type TranslationFormValues = z.infer<typeof schema>;

export function TranslationForm({
  languages,
  isSubmitting,
  onSubmit
}: {
  languages: Language[];
  isSubmitting?: boolean;
  onSubmit: (value: TranslationFormValues) => Promise<void>;
}) {
  const form = useForm<TranslationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { groupName: "", key: "", defaultValue: "", languageId: "", value: "", isApproved: false }
  });
  const selectedLanguage = languages.find((l) => l.id === form.watch("languageId"));
  const rtl = (selectedLanguage?.textDirection ?? "LTR").toUpperCase() === "RTL";
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <div className="space-y-1"><Label>Group</Label><Input {...form.register("groupName")} /></div>
      <div className="space-y-1"><Label>Key</Label><Input {...form.register("key")} /></div>
      <div className="space-y-1"><Label>Language</Label><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("languageId")}><option value="">Select</option>{languages.map((l) => <option key={l.id} value={l.id}>{l.displayName} ({l.languageCode})</option>)}</select></div>
      <div className="space-y-1"><Label>Default Value</Label><Input {...form.register("defaultValue")} /></div>
      <div className="md:col-span-2 space-y-1"><Label>Translation Value</Label><textarea className="min-h-28 w-full rounded-md border px-3 py-2 text-sm" {...form.register("value")} /></div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isApproved")} /> Approved</label>
      <div className="md:col-span-2 rounded-md border bg-slate-50 p-3">
        <p className="mb-2 text-xs text-muted-foreground">RTL Preview</p>
        <div dir={rtl ? "rtl" : "ltr"} className="rounded border bg-white p-3 text-sm">{form.watch("value") || "Preview text"}</div>
      </div>
      <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? "Saving..." : "Save Translation"}</Button></div>
    </form>
  );
}
