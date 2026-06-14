import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ReactNode } from "react";
import { notificationChannels, notificationEvents, type NotificationTemplateDto, type NotificationTemplateRequest } from "@/api/notificationApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Language } from "@/types/language";
import { lt } from "@/modules/operationsLocalization";

const schema = z.object({
  templateCode: z.string().trim().min(2).max(96),
  eventName: z.string().trim().min(2).max(128),
  channel: z.string().trim().min(2).max(16),
  languageId: z.string().uuid().optional().or(z.literal("")),
  cultureCode: z.string().trim().max(32).optional().or(z.literal("")),
  subjectTemplate: z.string().trim().max(512),
  bodyTemplate: z.string().trim().min(1).max(4096),
  isActive: z.boolean(),
  isDefault: z.boolean()
});

export type NotificationTemplateFormValues = z.infer<typeof schema>;

export function NotificationTemplateForm({
  initialValue,
  languages,
  disableCode,
  isSubmitting,
  onSubmit
}: {
  initialValue?: NotificationTemplateDto | null;
  languages: Language[];
  disableCode?: boolean;
  isSubmitting?: boolean;
  onSubmit: (value: NotificationTemplateRequest) => Promise<void>;
}) {
  const form = useForm<NotificationTemplateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      templateCode: initialValue?.templateCode ?? "",
      eventName: initialValue?.eventName ?? notificationEvents[0],
      channel: initialValue?.channel ?? notificationChannels[0],
      languageId: initialValue?.languageId ?? "",
      cultureCode: initialValue?.cultureCode ?? "",
      subjectTemplate: initialValue?.subjectTemplate ?? "",
      bodyTemplate: initialValue?.bodyTemplate ?? "",
      isActive: initialValue?.isActive ?? true,
      isDefault: initialValue?.isDefault ?? false
    }
  });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          templateCode: values.templateCode.trim(),
          eventName: values.eventName.trim(),
          channel: values.channel.trim(),
          languageId: values.languageId || null,
          cultureCode: values.cultureCode || null,
          subjectTemplate: values.subjectTemplate.trim(),
          bodyTemplate: values.bodyTemplate.trim(),
          isActive: values.isActive,
          isDefault: values.isDefault
        });
      })}
    >
      <Field label={lt("Template Code")} error={form.formState.errors.templateCode?.message}>
        <Input {...form.register("templateCode")} disabled={disableCode} />
      </Field>
      <Field label={lt("Event")} error={form.formState.errors.eventName?.message}>
        <select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("eventName")}>
          {notificationEvents.map((eventName) => (
            <option key={eventName} value={eventName}>
              {lt(eventName)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={lt("Channel")} error={form.formState.errors.channel?.message}>
        <select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("channel")}>
          {notificationChannels.map((channel) => (
            <option key={channel} value={channel}>
              {lt(channel)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={lt("Language")}>
        <select className="h-10 w-full rounded-md border px-3 text-sm" {...form.register("languageId")}>
          <option value="">{lt("Any enabled language")}</option>
          {languages.map((language) => (
            <option key={language.id} value={language.id}>
              {language.languageCode} - {language.displayName}
            </option>
          ))}
        </select>
      </Field>
      <Field label={lt("Culture Code")}>
        <Input {...form.register("cultureCode")} placeholder={lt("en-US")} />
      </Field>
      <Field label={lt("Subject Template")}>
        <Input {...form.register("subjectTemplate")} placeholder={lt("Shipment {{shipmentNumber}} departed")} />
      </Field>
      <Field label={lt("Body Template")} className="md:col-span-2" error={form.formState.errors.bodyTemplate?.message}>
        <textarea
          className="min-h-[180px] w-full rounded-md border px-3 py-2 text-sm"
          {...form.register("bodyTemplate")}
          placeholder={lt("Hello {{customerName}}, your shipment {{shipmentNumber}} status is {{status}}.")}
        />
      </Field>
      <div className="md:col-span-2 rounded-md border bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-medium">{lt("Placeholder Guide")}</p>
        <p className="mt-1 text-xs text-slate-600">
          {lt("Use")} <code>{"{{placeholderName}}"}</code> {lt("format. Example:")}
          {" "}
          <code>{"{{customerName}}"}</code>, <code>{"{{shipmentNumber}}"}</code>, <code>{"{{invoiceNumber}}"}</code>, <code>{"{{amount}}"}</code>.
        </p>
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isActive")} /> {lt("Active")}
      </label>
      <label className="md:col-span-2 flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isDefault")} /> {lt("Default template for selected event/channel/language")}
      </label>
      <div className="md:col-span-2">
        <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
          {isSubmitting || form.formState.isSubmitting ? lt("Saving...") : lt("Save Template")}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className ?? "space-y-1"}>
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
