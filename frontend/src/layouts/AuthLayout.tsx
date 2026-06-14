import type { PropsWithChildren } from "react";
import { Boxes, ShieldCheck } from "lucide-react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden bg-[linear-gradient(125deg,#0f172a_0%,#1e3a8a_48%,#0891b2_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white/15 p-2 ring-1 ring-white/30">
            <Boxes className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-100">Freight ERP</p>
            <h1 className="text-2xl font-semibold">Forwarding Operations Platform</h1>
          </div>
        </div>
        <div className="max-w-xl space-y-4">
          <p className="text-4xl font-semibold leading-tight">Secure control across tenant setup, shipments, finance, and audit.</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/20">
              <ShieldCheck className="mb-2 h-5 w-5 text-cyan-100" />
              Tenant and branch scoped access
            </div>
            <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/20">
              <ShieldCheck className="mb-2 h-5 w-5 text-cyan-100" />
              Role and permission controlled actions
            </div>
          </div>
        </div>
      </section>
      <section className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
