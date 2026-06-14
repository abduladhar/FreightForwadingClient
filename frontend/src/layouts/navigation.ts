import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  BookOpenText,
  Boxes,
  Building2,
  Calculator,
  ClipboardList,
  FileText,
  Files,
  Globe,
  LayoutDashboard,
  PackageCheck,
  Plane,
  Receipt,
  Route,
  Scale,
  Settings,
  ShieldCheck,
  ShipWheel,
  Truck,
  Users,
  Wallet,
  Warehouse
} from "lucide-react";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";

export const masterDataItems: NavigationItem[] = [
  item("currencies", "Currencies", "/currencies", BadgeDollarSign, "Currency.Read", "Currency setup, rates, and revaluation."),
  item("languages", "Languages", "/languages", Globe, "Language.Read", "Language setup, tenant preference, and translations."),
  item("customers", "Customers", "/customers", Users, "Customer.Read", "Customer master records and credit profile."),
  item("vendors", "Vendors", "/vendors", Building2, "Vendor.Read", "Vendor setup with currency and billing profile."),
  item("agents", "Agents", "/agents", Globe, "Agent.Read", "Destination and commission agent setup."),
  item("carriers", "Carriers", "/carriers", Plane, "Carrier.Read", "Airline, line, road, and courier carrier setup."),
  item("countries", "Countries", "/countries", Globe, "Country.Read", "Country codes, ISO codes, and mobile dialing codes."),
  item("package-types", "Package Types", "/package-types", Boxes, ["PackageType.Read", "User.Read"], "Package code and package name master setup."),
  item("shipping-ports", "Shipping Ports", "/shipping-ports", ShipWheel, ["ShippingPort.Read", "User.Read"], "Shipping port master setup for origin/destination planning."),
  item("job-types", "Job Types", "/job-types", ClipboardList, "JobType.Read", "Job type short codes used for job numbering."),
  item("warehouses", "Warehouses", "/warehouses", Warehouse, "Warehouse.Read", "Warehouse master, locations, and stock visibility."),
  item("charge-heads", "Charge Heads", "/charge-heads", Calculator, "Accounting.Read", "Charge head to ledger account mappings."),
  item("taxes", "Tax Setup", "/taxes", Scale, "Accounting.Read", "GST/VAT tax rules and ledger integration.")
];

export const accountingItems: NavigationItem[] = [
  item("account-groups", "Account Groups", "/accounting/account-groups", Calculator, "Accounting.Read", "Configure default account groups."),
  item("chart-of-accounts", "Chart of Accounts", "/chart-of-accounts", Calculator, "Accounting.Read", "Account groups, ledgers, and mappings."),
  item("ledger-accounts", "Ledger Accounts", "/accounting/ledger-accounts", Calculator, "Accounting.Read", "Ledger account setup and maintenance."),
  item("financial-years", "Financial Years", "/accounting/financial-years", Calculator, "Accounting.Read", "Financial year setup and closure."),
  item("opening-balances", "Opening Balances", "/accounting/opening-balances", Calculator, "Accounting.Read", "Opening balance entry and approval."),
  item("account-mappings", "Account Mappings", "/accounting/account-mappings", Calculator, "Accounting.Read", "Business module to ledger mappings."),
  item("journal-vouchers", "Journal Vouchers", "/accounting/journal-vouchers", BadgeDollarSign, "Accounting.Read", "Manual double-entry journal vouchers."),
  item("payment-voucher", "Payment Voucher", "/accounting/payment-voucher", Wallet, "Accounting.Create", "Payment voucher entry with balancing."),
  item("receipt-voucher", "Receipt Voucher", "/accounting/receipt-voucher", Wallet, "Accounting.Create", "Receipt voucher entry with balancing."),
  item("contra-voucher", "Contra Voucher", "/accounting/contra-voucher", Wallet, "Accounting.Create", "Contra transfer voucher entry."),
  item("ledger-entry-view", "Ledger Entries", "/accounting/ledger-entries", BadgeDollarSign, "Accounting.Read", "Posted ledger entry view."),
  item("reconciliation", "Reconciliation", "/reconciliation", Scale, "Reconciliation.Read", "Receivable and payable reconciliation."),
  item("salary", "Salary", "/salary", Wallet, "Accounting.Read", "Salary, incentive, and payslip finance support.")
];

export const navigationGroups: NavigationGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      item("dashboard", "Dashboard", "/", LayoutDashboard, "Dashboard.Read", "Executive overview across operations, finance, and compliance.")
    ]
  },
  {
    id: "masters",
    label: "Masters",
    items: [
      item("master-data", "Master Data", "/master-data", Boxes, masterDataItems.flatMap((entry) => Array.isArray(entry.permission) ? entry.permission : entry.permission ? [entry.permission] : []), "Open all master setup screens from one workspace."),
      item("customers", "Customers", "/customers", Users, "Customer.Read", "Customer master records and credit profile."),
      item("vendors", "Vendors", "/vendors", Building2, "Vendor.Read", "Vendor setup with currency and billing profile."),
      item("carriers", "Carriers", "/carriers", Plane, "Carrier.Read", "Airline, line, road, and courier carrier setup."),
      item("agents", "Agents", "/agents", Globe, "Agent.Read", "Destination and commission agent setup.")
    ]
  },
  {
    id: "rate-quotation",
    label: "Rate & Quotation",
    items: [
      item("rate-master", "Rate Master", "/rate-masters", ClipboardList, "RateMaster.Read", "Rate cards, slabs, and surcharge setup."),
      item("quotations", "Quotations", "/quotations", BookOpenText, "Quotation.Read", "Quotation pipeline, approvals, and conversions.")
    ]
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      item("pickup", "Pickup", "/pickup", Truck, "Pickup.Read", "Pickup planning, assignment, and status tracking."),
      item("goods-receipt", "Goods Receipt", "/goods-receipt", Boxes, "GoodsReceipt.Read", "GRN operations, labels, and availability.")
    ]
  },
  {
    id: "shipments",
    label: "Shipments",
    items: [
      item("house-shipments", "House Shipments", "/house-shipments", ShipWheel, "HouseShipment.Read", "House shipment planning and loading."),
      item("master-shipments", "Master Shipments", "/master-shipments", ShipWheel, "MasterShipment.Read", "Consolidation and cost allocation."),
      item("direct-shipments", "Direct Shipments", "/direct-shipments", ShipWheel, "DirectShipment.Read", "Direct shipment workflow and billing linkage."),
      item("customs", "Customs Clearance", "/customs", ClipboardList, "CustomsClearance.Read", "Customs declaration, duty/tax calculations, and status management."),
      item("customs-jobs", "Jobs", "/customs/jobs", FileText, "Job.Read", "Customs clearance job records with generated job numbers.")
    ]
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      item("finance", "Finance Workbench", "/finance", Receipt, "Accounting.Read", "Invoices, bills, receipts, and payments."),
      item("invoices", "Invoices", "/invoices", Files, "Invoice.Read", "Customer invoice lifecycle and aging."),
      item("credit-debit-notes", "Credit / Debit Notes", "/credit-debit-notes", Files, "CreditDebitNote.Read", "Customer and vendor credit/debit note lifecycle."),
      item("vendor-bills", "Vendor Bills", "/vendor-bills", Files, "VendorBill.Read", "Vendor bill review, allocation, and approvals."),
      item("receipts", "Customer Receipts", "/receipts", Receipt, "Receipt.Read", "Receive customer payments and allocate them to invoices."),
      item("payments", "Vendor Payments", "/payments", Wallet, "Payment.Read", "Pay vendors and allocate payments to vendor bills."),
      item("commissions", "Agent Commissions", "/commissions", BadgeDollarSign, "Accounting.Read", "Commission calculation drafts and statement.")
    ]
  },
  {
    id: "accounting",
    label: "Accounting",
    items: [
      item("accounting-workspace", "Accounting", "/accounting", Calculator, accountingItems.flatMap((entry) => Array.isArray(entry.permission) ? entry.permission : entry.permission ? [entry.permission] : []), "Open accounting setup, vouchers, reconciliation, and payroll support from one workspace.")
    ]
  },
  {
    id: "reports",
    label: "Reports",
    items: [
      item("reports-ledger", "Ledger Report", "/reports/accounting/ledger", BarChart3, "Reports.Read", "Ledger transactions with debit, credit, and balance."),
      item("reports-general-ledger", "General Ledger", "/reports/accounting/general-ledger", BarChart3, "Reports.Read", "General ledger entries by account and period."),
      item("reports-customer-ledger", "Customer Ledger", "/reports/accounting/customer-ledger", BarChart3, "Reports.Read", "Customer-wise receivable ledger report."),
      item("reports-vendor-ledger", "Vendor Ledger", "/reports/accounting/vendor-ledger", BarChart3, "Reports.Read", "Vendor-wise payable ledger report."),
      item("reports-bank-book", "Bank Book", "/reports/accounting/bank-book", BarChart3, "Reports.Read", "Bank transactions and running balances."),
      item("reports-cash-book", "Cash Book", "/reports/accounting/cash-book", BarChart3, "Reports.Read", "Cash transactions and balances."),
      item("reports-trial-balance", "Trial Balance", "/reports/accounting/trial-balance", BarChart3, "Reports.Read", "Opening, period, and closing debit/credit balances."),
      item("reports-balance-sheet", "Balance Sheet", "/reports/accounting/balance-sheet", BarChart3, "Reports.Read", "Assets, liabilities, and capital positions."),
      item("reports-profit-loss", "Profit & Loss", "/reports/accounting/profit-and-loss", BarChart3, "Reports.Read", "Income and expense statement."),
      item("reports-trading-profit-loss", "Trading P&L", "/reports/accounting/trading-profit-and-loss", BarChart3, "Reports.Read", "Trading income/cost and net profit breakdown."),
      item("reports-tax-report", "Tax Report", "/reports/accounting/tax-report", BarChart3, "Reports.Read", "Input/output tax and net tax summary."),
      item("reports-customer-outstanding", "Customer Outstanding", "/reports/accounting/customer-outstanding", BarChart3, "Reports.Read", "Outstanding invoices by customer."),
      item("reports-vendor-outstanding", "Vendor Outstanding", "/reports/accounting/vendor-outstanding", BarChart3, "Reports.Read", "Outstanding bills by vendor."),
      item("reports-soa", "Statement of Account", "/reports/accounting/statement-of-account", BarChart3, "Reports.Read", "Opening, transactions, closing, and ageing."),
      item("reports-currency-gain-loss", "Currency Gain/Loss", "/reports/accounting/currency-gain-loss", BarChart3, "Reports.Read", "Exchange gain/loss movement report."),
      item("reports-currency-revaluation", "Currency Revaluation", "/reports/accounting/currency-revaluation", BarChart3, "Reports.Read", "Revaluation impact across currencies."),
      item("reports-op-quotation", "Quotation Report", "/reports/operations/quotation", BarChart3, "Reports.Read", "Operational quotation pipeline report."),
      item("reports-op-goods-receipt", "Goods Receipt Report", "/reports/operations/goods-receipt", BarChart3, "Reports.Read", "Goods receipt movement report."),
      item("reports-op-warehouse-stock", "Warehouse Stock Report", "/reports/operations/warehouse-stock", BarChart3, "Reports.Read", "Warehouse stock by goods/location."),
      item("reports-op-pickup", "Pickup Report", "/reports/operations/pickup", BarChart3, "Reports.Read", "Pickup assignment and status report."),
      item("reports-op-house", "House Shipment Report", "/reports/operations/house-shipment", BarChart3, "Reports.Read", "House shipment execution report."),
      item("reports-op-master", "Master Shipment Report", "/reports/operations/master-shipment", BarChart3, "Reports.Read", "Master shipment consolidation report."),
      item("reports-op-direct", "Direct Shipment Report", "/reports/operations/direct-shipment", BarChart3, "Reports.Read", "Direct shipment operations report."),
      item("reports-op-air", "Air Freight Report", "/reports/operations/air-freight", BarChart3, "Reports.Read", "Air movement and MAWB/HAWB report."),
      item("reports-op-sea", "Sea Freight Report", "/reports/operations/sea-freight", BarChart3, "Reports.Read", "Sea movement and container report."),
      item("reports-op-road", "Road Freight Report", "/reports/operations/road-freight", BarChart3, "Reports.Read", "Road trip, route, and POD report."),
      item("reports-op-courier", "Courier Report", "/reports/operations/courier", BarChart3, "Reports.Read", "Courier piece and delivery report."),
      item("reports-op-customs", "Customs Report", "/reports/operations/customs-clearance", BarChart3, "Reports.Read", "Customs clearance and duty report."),
      item("reports-op-container", "Container Report", "/reports/operations/container", BarChart3, "Reports.Read", "Container status and utilization report."),
      item("reports-op-unbilled", "Unbilled Shipment", "/reports/operations/unbilled-shipment", BarChart3, "Reports.Read", "Pending billing shipment report."),
      item("reports-op-pending-bill", "Pending Bill Report", "/reports/operations/pending-bill", BarChart3, "Reports.Read", "Pending vendor bill operational report."),
      item("reports-op-pending-pod", "Pending POD Report", "/reports/operations/pending-pod", BarChart3, "Reports.Read", "Pending POD follow-up report."),
      item("reports-op-pending-doc", "Pending Document Report", "/reports/operations/pending-document", BarChart3, "Reports.Read", "Pending document compliance report."),
      item("reports-op-ageing", "Shipment Ageing", "/reports/operations/shipment-ageing", BarChart3, "Reports.Read", "Shipment ageing and turnaround report."),
      item("reports-profit-shipment", "Shipment Profit", "/reports/operations/shipment-profit", BarChart3, "Profit.Read", "Shipment-wise profitability report."),
      item("reports-profit-customer", "Customer Profit", "/reports/operations/customer-wise-profit", BarChart3, "Profit.Read", "Customer-wise profitability report."),
      item("reports-profit-salesman", "Salesman Profit", "/reports/operations/salesman-wise-profit", BarChart3, "Profit.Read", "Salesman-wise profitability report."),
      item("reports-profit-agent", "Agent Profit", "/reports/operations/agent-wise-profit", BarChart3, "Profit.Read", "Agent-wise profitability report."),
      item("reports-profit-branch", "Branch Profit", "/reports/operations/branch-wise-profit", BarChart3, "Profit.Read", "Branch-wise profitability report."),
      item("reports-profit-route", "Route Profit", "/reports/operations/route-wise-profit", BarChart3, "Profit.Read", "Route-wise profitability report."),
      item("reports-profit-destination", "Destination Profit", "/reports/operations/destination-wise-profit", BarChart3, "Profit.Read", "Destination-wise profitability report.")
    ]
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      item("document-management", "Document Management", "/documents", Files, "DocumentManagement.Read", "Shipment and finance documents with controls.")
    ]
  },
  {
    id: "portals",
    label: "Portals",
    items: [
      item("customer-portal", "Customer Portal", "/customer-portal", Globe, "CustomerPortal.Read", "Customer-facing quotations, tracking, and statements."),
      item("agent-portal", "Agent Portal", "/agent-portal", Globe, "AgentPortal.Read", "Agent shipments, POD, and commission views.")
    ]
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      item("users", "Users", "/users", ShieldCheck, "User.Read", "User management, lock status, and role assignment."),
      item("employees", "Employees", "/employees", Users, "Employee.Read", "Employee master, designations, Salesman eligibility, targets, and incentives."),
      item("roles", "Roles", "/roles", ShieldCheck, "Role.Read", "Role definitions and role lifecycle management."),
      item("permission-matrix", "Permission Matrix", "/permissions/matrix", ShieldCheck, "Permission.Read", "Role-permission assignment matrix."),
      item("notification-templates", "Notification Templates", "/notifications/templates", Bell, "Notification.Read", "Template CRUD for event/channel/language combinations."),
      item("notification-history", "Notification History", "/notifications/history", Bell, "Notification.Read", "Delivery status, retries, and queue monitoring."),
      item("my-notifications", "My Notifications", "/notifications/me", Bell, "Notification.Read", "Current user in-app notifications.")
    ]
  },
  {
    id: "audit-logs",
    label: "Audit Logs",
    items: [
      item("audit", "Audit Log Search", "/audit", PackageCheck, "AuditLog.Read", "Audit events with deep filtering and detail view."),
      item("audit-user-activity", "User Activity", "/audit/user-activity", PackageCheck, "AuditLog.Read", "User activity timeline and access traces."),
      item("audit-login-history", "Login History", "/audit/login-history", PackageCheck, "AuditLog.Read", "Successful and failed login/logout events."),
      item("audit-entity-changes", "Entity Changes", "/audit/entity-changes", PackageCheck, "AuditLog.Read", "Old/new value change tracking by entity."),
      item("audit-financial", "Financial Audit", "/audit/financial", PackageCheck, "AuditLog.Read", "Financial transaction audit logs."),
      item("audit-report-access", "Report Access", "/audit/reports", PackageCheck, "AuditLog.Read", "Report access trail."),
      item("audit-export-logs", "Export Logs", "/audit/exports", PackageCheck, "AuditLog.Read", "CSV/Excel/PDF export trail."),
      item("audit-print-logs", "Print Logs", "/audit/prints", PackageCheck, "AuditLog.Read", "Print action logs."),
      item("audit-email-logs", "Email Logs", "/audit/emails", PackageCheck, "AuditLog.Read", "Email send trail and outcomes."),
      item("audit-file-logs", "File Access Logs", "/audit/files", PackageCheck, "AuditLog.Read", "File access and download/upload logs."),
      item("audit-api-request-logs", "API Request Logs", "/audit/api-requests", PackageCheck, "AuditLog.Read", "API request-level audit traces.")
    ]
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      item("tenant-settings", "Tenant Settings", "/tenants", Settings, "Tenant.Read", "Tenant and branch level ERP settings."),
      item("branch-settings", "Branch Settings", "/branches", Settings, "Branch.Read", "Branch setup and branch-specific configuration."),
      item("currency-setup", "Tenant Currencies", "/currencies/tenant-setup", Settings, "Currency.Update", "Enable currencies and set base currency."),
      item("language-setup", "Tenant Languages", "/languages/tenant-setup", Settings, "Language.Update", "Enable languages and default language."),
      item("translations", "Translations", "/translations", Settings, "Language.Read", "Translation lookup, editor, and missing report."),
      item("warehouse-stock", "Warehouse Stock", "/warehouses/stock", Settings, "Warehouse.Read", "Available, reserved, damaged, and returned stock."),
      item("warehouse-transfer", "Stock Transfer", "/warehouses/stock-transfer", Settings, "Warehouse.Update", "Transfer stock between active warehouse locations."),
      item("warehouse-transactions", "Stock Transactions", "/warehouses/transactions", Settings, "Warehouse.Read", "Warehouse stock movement history."),
      item("warehouse-available-goods", "Available Goods", "/warehouses/available-goods", Settings, "Warehouse.Read", "Goods receipt item lookup by availability."),
      item("warehouse-damaged-goods", "Damaged Goods", "/warehouses/damaged-goods", Settings, "Warehouse.Update", "Record and track damaged goods."),
      item("warehouse-returned-goods", "Returned Goods", "/warehouses/returned-goods", Settings, "Warehouse.Update", "Record and track returned goods."),
      item("numbering-settings", "Numbering Settings", "/settings/numbering", Settings, "Tenant.Read", "Document numbering formats by module and branch."),
      item("print-templates", "Print Templates", "/settings/print-templates", Settings, "Tenant.Read", "Print template list and designer."),
      item("label-templates", "Label Templates", "/settings/label-templates", Settings, "Tenant.Read", "Destination-aware shipment label templates."),
      item("approval-workflows", "Approval Workflows", "/settings/approval-workflows", Settings, "Tenant.Read", "Single/multi-level approval workflow designer.")
    ]
  }
];

export const primaryNavigation: NavigationItem[] = navigationGroups.flatMap((group) => group.items);

function item(
  id: string,
  label: string,
  path: string,
  icon: NavigationItem["icon"],
  permission: NavigationItem["permission"],
  description: string
): NavigationItem {
  return { id, label, path, icon, permission, description };
}
