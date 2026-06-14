import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/auth/useAuth";

export function PermissionGuard({
  permission,
  children,
  fallback = "message"
}: {
  permission?: string | string[];
  children: ReactNode;
  fallback?: "message" | "redirect" | "hidden";
}) {
  const { hasPermission } = useAuth();
  if (hasPermission(permission)) return children;
  if (fallback === "hidden") return null;
  if (fallback === "redirect") return <Navigate to="/" replace />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access restricted</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        You do not have permission to access this workspace. Contact your tenant administrator if access is required.
      </CardContent>
    </Card>
  );
}
