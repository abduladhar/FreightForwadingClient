import { Loader2 } from "lucide-react";

export function LoadingScreen({ title = "Loading...", message = "Please wait while we prepare your data." }: { title?: string; message?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border bg-white text-center">
      <Loader2 className="mb-3 h-7 w-7 animate-spin text-blue-600" />
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
