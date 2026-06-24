import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { accountingItems, masterDataItems, navigationGroups, primaryNavigation } from "@/layouts/navigation";
import { lt } from "@/modules/operationsLocalization";
import type { NavigationGroup } from "@/types/navigation";

export function Breadcrumbs() {
  const location = useLocation();
  const { t } = useI18n();
  const segments = location.pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const nav = primaryNavigation.find((item) => item.path === path);
    const group = navigationGroups.find((entry) => getGroupItems(entry).some((item) => item.path === path));
    const masterItem = masterDataItems.find((item) => item.path === path);
    const accountingItem = accountingItems.find((item) => item.path === path);
    const quotationLabel = quotationBreadcrumbLabel(segments, index, t);
    const rateMasterLabel = rateMasterBreadcrumbLabel(segments, index, t);
    const pickupLabel = pickupBreadcrumbLabel(segments, index, t);
    const accountingLabel = accountingBreadcrumbLabel(segments, index, accountingItem);
    const reportLabel = reportBreadcrumbLabel(segments, index);
    const administrationLabel = administrationBreadcrumbLabel(segments, index);
    const auditLabel = auditBreadcrumbLabel(segments, index);
    const label = quotationLabel ?? rateMasterLabel ?? pickupLabel ?? accountingLabel ?? reportLabel ?? administrationLabel ?? auditLabel ?? (nav && group
      ? lt(t(`Navigation.${group.id}.Item.${nav.id}.Label`, nav.label))
      : masterItem
        ? lt(t(`MasterData.Item.${masterItem.id}.Label`, masterItem.label))
        : accountingItem
          ? lt(accountingItem.label)
          : lt(t(`Breadcrumb.${prettify(segment).replace(/\s+/g, "")}`, prettify(segment))));
    return { path, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-slate-500">
      <Link to="/" className="inline-flex items-center gap-1 rounded px-1.5 py-1 hover:bg-slate-100 hover:text-slate-700">
        <Home className="h-3.5 w-3.5" />
        {lt(t("Common.Home", "Home"))}
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to={crumb.path} className="rounded px-1.5 py-1 hover:bg-slate-100 hover:text-slate-700">
            {crumb.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function auditBreadcrumbLabel(segments: string[], index: number) {
  if (segments[0] !== "audit") return null;
  const segment = segments[index];
  if (index === 0) return lt("Audit Logs");
  const labels: Record<string, string> = {
    "user-activity": "User Activity",
    "login-history": "Login History",
    "entity-changes": "Entity Changes",
    financial: "Financial Audit Logs",
    reports: "Report Access Logs",
    exports: "Export Logs",
    prints: "Print Logs",
    emails: "Email Logs",
    files: "File Access Logs",
    "api-requests": "API Request Logs"
  };
  if (labels[segment]) return lt(labels[segment]);
  if (/^[0-9a-f-]{16,}$/i.test(segment)) return lt("Audit Log Detail");
  return lt(prettify(segment));
}

function administrationBreadcrumbLabel(segments: string[], index: number) {
  const root = segments[0];
  const segment = segments[index];
  const roots: Record<string, string> = {
    users: "Users",
    roles: "Roles",
    permissions: "Permission Matrix",
    employees: "Employees",
    designations: "Designations",
    "salesman-targets": "Salesman Targets",
    "incentive-rules": "Incentive Rules",
    "incentive-tree-report": "Parent-Child Incentive Report",
    notifications: "Notifications"
  };
  if (!roots[root]) return null;
  if (index === 0) return lt(roots[root]);
  if (segment === "new") return lt(`Create ${root === "users" ? "User" : root === "roles" ? "Role" : root === "employees" ? "Employee" : "Record"}`);
  if (segment === "edit") return lt(`Edit ${root === "users" ? "User" : root === "roles" ? "Role" : root === "employees" ? "Employee" : "Record"}`);
  if (root === "permissions" && segment === "matrix") return lt("Permission Matrix");
  if (root === "notifications") {
    if (segment === "templates") return lt("Notification Templates");
    if (segment === "history") return lt("Notification History");
    if (segment === "me") return lt("My Notifications");
  }
  if (/^[0-9a-f-]{16,}$/i.test(segment)) return lt(root === "users" ? "User" : root === "roles" ? "Role" : root === "employees" ? "Employee" : "Record");
  return lt(prettify(segment));
}

function reportBreadcrumbLabel(segments: string[], index: number) {
  if (segments[0] !== "reports") return null;
  if (index === 0) return lt("Reports");
  if (index === 1 && segments[index] === "accounting") return lt("Accounting Reports");
  if (index === 1 && segments[index] === "operations") return lt("Operational Reports");
  return null;
}

function accountingBreadcrumbLabel(
  segments: string[],
  index: number,
  accountingItem: (typeof accountingItems)[number] | undefined
) {
  if (segments[0] !== "accounting") return accountingItem ? lt(accountingItem.label) : null;
  const segment = segments[index];
  if (index === 0) return lt("Accounting");
  if (segment === "new") return lt("New");
  if (segment === "edit") return lt("Edit");
  if (accountingItem) return lt(accountingItem.label);
  if (/^[0-9a-f-]{16,}$/i.test(segment)) return lt("Record");
  return lt(prettify(segment));
}

function quotationBreadcrumbLabel(segments: string[], index: number, t: (key: string, fallback?: string) => string) {
  if (segments[0] !== "quotations") return null;
  const segment = segments[index];
  if (index === 0) return t("Quotation.Quotations", "Quotations");
  if (segment === "new") return t("Quotation.NewQuotation", "New Quotation");
  if (segment === "edit") return t("Quotation.Edit", "Edit");
  if (segment === "approval") return t("Quotation.Approval", "Approval");
  if (segment === "calculation") return t("Quotation.Calculation", "Calculation");
  if (segment === "print") return t("Quotation.Print", "Print");
  return t("Quotation.Quotation", "Quotation");
}

function rateMasterBreadcrumbLabel(segments: string[], index: number, t: (key: string, fallback?: string) => string) {
  if (segments[0] !== "rate-masters") return null;
  const segment = segments[index];
  if (index === 0) return t("RateMaster.RateMaster", "Rate Master");
  if (segment === "new") return t("RateMaster.CreateRateMaster", "Create Rate Master");
  if (segment === "edit") return t("RateMaster.Edit", "Edit");
  if (segment === "calculator") return t("RateMaster.Calculator", "Calculator");
  return t("RateMaster.RateMaster", "Rate Master");
}

function pickupBreadcrumbLabel(segments: string[], index: number, t: (key: string, fallback?: string) => string) {
  if (segments[0] !== "pickups") return null;
  const segment = segments[index];
  if (index === 0) return t("Pickup.Pickups", "Pickups");
  if (segment === "new") return t("Pickup.CreatePickup", "Create Pickup");
  if (segment === "edit") return t("Pickup.Edit", "Edit");
  if (segment === "assign") return t("Pickup.Assign", "Assign");
  if (segment === "status") return t("Pickup.Status", "Status");
  if (segment === "receipt") return t("Pickup.Receipt", "Receipt");
  if (segment === "invoices") return t("Pickup.Invoices", "Invoices");
  if (segment === "bills") return t("Pickup.Bills", "Bills");
  return t("Pickup.Pickup", "Pickup");
}

function prettify(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getGroupItems(group: NavigationGroup) {
  return [
    ...(group.items ?? []),
    ...(group.sections ?? []).flatMap((section) => section.items)
  ];
}
