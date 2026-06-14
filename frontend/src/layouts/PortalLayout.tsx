import { Outlet } from "react-router-dom";
import { Globe } from "lucide-react";

export function PortalLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <div className="rounded-md bg-blue-600 p-1.5 text-white">
            <Globe className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Freight ERP Portal</p>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-7xl overflow-x-hidden p-3 sm:p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
