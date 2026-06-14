import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranchOptions } from "@/api/branchApi";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useBranch() {
  const workspace = useWorkspace();
  const query = useQuery({
    queryKey: ["branch", "options", workspace.tenantCode],
    queryFn: getBranchOptions
  });

  const options = query.data ?? [];

  useEffect(() => {
    if (!options.length || !workspace.branchId) return;
    const current = options.find((item) => item.id === workspace.branchId);
    if (current) return;
    workspace.setBranch(options[0].id, options[0].name);
  }, [options, workspace.branchId, workspace.setBranch]);

  function setBranch(branchId: string) {
    const selected = options.find((option) => option.id === branchId);
    if (!selected) return;
    workspace.setBranch(selected.id, selected.name);
  }

  return {
    selectedBranchId: workspace.branchId,
    options,
    setBranch,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch
  };
}
