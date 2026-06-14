export type PermissionSet = string[];

export function hasPermission(permissions: PermissionSet, required?: string | string[]) {
  if (!required) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((permission) => permissions.includes(permission));
}

export function hasAllPermissions(permissions: PermissionSet, required: string[]) {
  return required.every((permission) => permissions.includes(permission));
}

export function filterByPermission<T extends { permission?: string | string[] }>(items: T[], permissions: PermissionSet) {
  return items.filter((item) => hasPermission(permissions, item.permission));
}

export function canOverrideExchangeRate(permissions: PermissionSet) {
  return hasPermission(permissions, "Currency.Override");
}
