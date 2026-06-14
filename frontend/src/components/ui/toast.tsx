import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type ToastTone = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

type ToastInput = Omit<ToastMessage, "id" | "tone"> & { tone?: ToastTone };
type ToastListener = (toast: ToastMessage) => void;

const listeners = new Set<ToastListener>();

function emit(input: ToastInput) {
  const toast: ToastMessage = {
    id: crypto.randomUUID(),
    tone: input.tone ?? "info",
    title: input.title,
    description: input.description
  };
  listeners.forEach((listener) => listener(toast));
}

export const toast = {
  success(title: string, description?: string) {
    emit({ title, description, tone: "success" });
  },
  error(title: string, description?: string) {
    emit({ title, description, tone: "error" });
  },
  warning(title: string, description?: string) {
    emit({ title, description, tone: "warning" });
  },
  info(title: string, description?: string) {
    emit({ title, description, tone: "info" });
  }
};

const ToastContext = createContext<typeof toast | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: ToastListener = (nextToast) => {
      setItems((current) => [...current, nextToast].slice(-5));
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== nextToast.id));
      }, 5000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => toast, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className={cn("rounded-lg border bg-white p-4 shadow-panel", toneBorder[item.tone])}>
            <div className="flex gap-3">
              <ToastIcon tone={item.tone} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{item.title}</p>
                {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(item.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}

const toneBorder: Record<ToastTone, string> = {
  success: "border-emerald-200",
  error: "border-red-200",
  warning: "border-amber-200",
  info: "border-blue-200"
};

function ToastIcon({ tone }: { tone: ToastTone }) {
  const className = "mt-0.5 h-5 w-5";
  if (tone === "success") return <CheckCircle2 className={cn(className, "text-emerald-600")} />;
  if (tone === "error") return <XCircle className={cn(className, "text-red-600")} />;
  if (tone === "warning") return <TriangleAlert className={cn(className, "text-amber-600")} />;
  return <Info className={cn(className, "text-blue-600")} />;
}
