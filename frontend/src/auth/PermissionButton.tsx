import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";

export function PermissionButton({ permission, ...props }: ComponentProps<typeof Button> & { permission?: string | string[] }) {
  const { hasPermission } = useAuth();
  if (!hasPermission(permission)) return null;
  return <Button {...props} />;
}
