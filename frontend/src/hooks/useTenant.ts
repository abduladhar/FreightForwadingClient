import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantOptions } from "@/api/tenantApi";
import { useAuth } from "@/auth/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useTenant() {
  const workspace = useWorkspace();
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["tenant", "options"],
    queryFn: getTenantOptions
  });

  const options = query.data ?? [];

  useEffect(() => {
    if (!options.length || !workspace.tenantCode) return;
    const selected = options.find((item) => item.code === workspace.tenantCode);
    if (!selected) return;
    if (session?.tenantId === selected.id) return;
    workspace.setTenant(selected.code, selected.id);
  }, [options, session?.tenantId, workspace.tenantCode, workspace.setTenant]);

  function setTenant(code: string) {
    const selected = options.find((item) => item.code === code);
    workspace.setTenant(code, selected?.id);
  }

  return {
    selectedTenantCode: workspace.tenantCode,
    options,
    setTenant,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
