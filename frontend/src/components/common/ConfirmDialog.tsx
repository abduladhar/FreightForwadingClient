import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps extends PropsWithChildren {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  children,
  title,
  description,
  confirmText,
  cancelText,
  variant = "default",
  onConfirm
}: ConfirmDialogProps) {
  const resolvedConfirmText = confirmText ?? lt("Confirm");
  const resolvedCancelText = cancelText ?? lt("Cancel");
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-white shadow-xl">
          <div className="flex items-start justify-between border-b border-border/70 p-4 sm:p-5">
            <div className="inline-flex items-center gap-2">
              <AlertTriangle className={cn("h-5 w-5", variant === "danger" ? "text-red-600" : "text-amber-600")} />
              <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label={lt("Close")}>
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="p-4 sm:p-5">
            {description ? <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description> : null}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border/70 p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
            <Dialog.Close asChild>
              <Button variant="outline" className="w-full sm:w-auto">{resolvedCancelText}</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button className="w-full sm:w-auto" variant={variant === "danger" ? "destructive" : "default"} onClick={() => void onConfirm()}>{resolvedConfirmText}</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
