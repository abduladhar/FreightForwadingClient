import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Language } from "@/types/language";

const schema = z.object({
  languageCode: z.string().trim().min(2).max(10),
  cultureCode: z.string().trim().min(2).max(20),
  displayName: z.string().trim().min(2).max(100),
  nativeName: z.string().trim().min(2).max(100),
  textDirection: z.string().trim().min(3).max(3),
  dateFormat: z.string().trim().min(2).max(30),
  numberFormat: z.string().trim().min(2).max(30),
  isActive: z.boolean(),
  isDefault: z.boolean()
});
export type LanguageFormValues = z.infer<typeof schema>;

export function LanguageForm({
  initialValue,
  disableCode,
  isSubmitting,
  onSubmit
}: {
  initialValue?: Language | null;
  disableCode?: boolean;
  isSubmitting?: boolean;
  onSubmit: (value: LanguageFormValues) => Promise<void>;
}) {
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      languageCode: initialValue?.languageCode ?? "",
      cultureCode: initialValue?.cultureCode ?? "",
      displayName: initialValue?.displayName ?? "",
      nativeName: initialValue?.nativeName ?? "",
      textDirection: initialValue?.textDirection ?? "LTR",
      dateFormat: initialValue?.dateFormat ?? "yyyy-MM-dd",
      numberFormat: initialValue?.numberFormat ?? "en-US",
      isActive: initialValue?.isActive ?? true,
      isDefault: initialValue?.isDefault ?? false
    }
  });
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((v) => onSubmit(v))}>
      <Field label="Language Code" error={form.formState.errors.languageCode?.message}><Input {...form.register("languageCode")} disabled={disableCode} /></Field>
      <Field label="Culture Code" error={form.formState.errors.cultureCode?.message}><Input {...form.register("cultureCode")} /></Field>
      <Field label="Display Name" error={form.formState.errors.displayName?.message}><Input {...form.register("displayName")} /></Field>
      <Field label="Native Name" error={form.formState.errors.nativeName?.message}><Input {...form.register("nativeName")} /></Field>
      <Field label="Text Direction" error={form.formState.errors.textDirection?.message}><select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("textDirection")}><option value="LTR">LTR</option><option value="RTL">RTL</option></select></Field>
      <Field label="Date Format" error={form.formState.errors.dateFormat?.message}><Input {...form.register("dateFormat")} /></Field>
      <Field label="Number Format" error={form.formState.errors.numberFormat?.message}><Input {...form.register("numberFormat")} /></Field>
      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isActive")} /> Active</label>
      <label className="md:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("isDefault")} /> Default language</label>
      <div className="md:col-span-2"><Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>{isSubmitting || form.formState.isSubmitting ? "Saving..." : "Save Language"}</Button></div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}{error ? <p className="text-xs text-red-600">{error}</p> : null}</div>;
}
