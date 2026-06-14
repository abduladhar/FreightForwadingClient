import type { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PortalLayout } from "@/layouts/PortalLayout";
import { LoginPage } from "@/auth/LoginPage";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { PermissionGuard } from "@/auth/PermissionGuard";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { OperationsConsolePage } from "@/modules/operations/OperationsConsolePage";
import { FinanceWorkbenchPage } from "@/modules/finance/FinanceWorkbenchPage";
import { ModuleWorkbenchPage } from "@/modules/workbench/ModuleWorkbenchPage";
import { MasterDataPage } from "@/modules/masters/MasterDataPage";
import { TenantListPage } from "@/modules/tenants/TenantListPage";
import { TenantCreatePage } from "@/modules/tenants/TenantCreatePage";
import { TenantEditPage } from "@/modules/tenants/TenantEditPage";
import { TenantViewPage } from "@/modules/tenants/TenantViewPage";
import { TenantSettingsPage } from "@/modules/tenants/TenantSettingsPage";
import { BranchListPage } from "@/modules/branches/BranchListPage";
import { BranchCreatePage } from "@/modules/branches/BranchCreatePage";
import { BranchEditPage } from "@/modules/branches/BranchEditPage";
import { BranchViewPage } from "@/modules/branches/BranchViewPage";
import { BranchSettingsPage } from "@/modules/branches/BranchSettingsPage";
import { UserListPage } from "@/modules/users/UserListPage";
import { UserCreatePage } from "@/modules/users/UserCreatePage";
import { UserEditPage } from "@/modules/users/UserEditPage";
import { UserViewPage } from "@/modules/users/UserViewPage";
import { RoleListPage } from "@/modules/roles/RoleListPage";
import { RoleCreatePage } from "@/modules/roles/RoleCreatePage";
import { RoleEditPage } from "@/modules/roles/RoleEditPage";
import { PermissionMatrixPage } from "@/modules/permissions/PermissionMatrixPage";
import { CurrencyListPage } from "@/modules/currencies/CurrencyListPage";
import { CurrencyCreatePage } from "@/modules/currencies/CurrencyCreatePage";
import { CurrencyEditPage } from "@/modules/currencies/CurrencyEditPage";
import { TenantCurrencySetupPage } from "@/modules/currencies/TenantCurrencySetupPage";
import { ExchangeRateListPage } from "@/modules/currencies/ExchangeRateListPage";
import { ExchangeRateCreatePage } from "@/modules/currencies/ExchangeRateCreatePage";
import { CurrencyConversionPage } from "@/modules/currencies/CurrencyConversionPage";
import { CurrencyRevaluationPage } from "@/modules/currencies/CurrencyRevaluationPage";
import { LanguageListPage } from "@/modules/languages/LanguageListPage";
import { LanguageCreatePage } from "@/modules/languages/LanguageCreatePage";
import { LanguageEditPage } from "@/modules/languages/LanguageEditPage";
import { TenantLanguageSetupPage } from "@/modules/languages/TenantLanguageSetupPage";
import { TranslationListPage } from "@/modules/languages/TranslationListPage";
import { TranslationEditorPage } from "@/modules/languages/TranslationEditorPage";
import { MissingTranslationReportPage } from "@/modules/languages/MissingTranslationReportPage";
import { CustomerListPage } from "@/modules/customers/CustomerListPage";
import { CustomerCreatePage } from "@/modules/customers/CustomerCreatePage";
import { CustomerEditPage } from "@/modules/customers/CustomerEditPage";
import { CustomerViewPage } from "@/modules/customers/CustomerViewPage";
import { VendorListPage } from "@/modules/vendors/VendorListPage";
import { VendorCreatePage } from "@/modules/vendors/VendorCreatePage";
import { VendorEditPage } from "@/modules/vendors/VendorEditPage";
import { VendorViewPage } from "@/modules/vendors/VendorViewPage";
import { AgentListPage } from "@/modules/agents/AgentListPage";
import { AgentCreatePage } from "@/modules/agents/AgentCreatePage";
import { AgentEditPage } from "@/modules/agents/AgentEditPage";
import { AgentViewPage } from "@/modules/agents/AgentViewPage";
import { AgentCommissionSettingsPage } from "@/modules/agents/AgentCommissionSettingsPage";
import { CarrierListPage } from "@/modules/carriers/CarrierListPage";
import { CarrierCreatePage } from "@/modules/carriers/CarrierCreatePage";
import { CarrierEditPage } from "@/modules/carriers/CarrierEditPage";
import { CountryListPage } from "@/modules/countries/CountryListPage";
import { CountryCreatePage } from "@/modules/countries/CountryCreatePage";
import { CountryEditPage } from "@/modules/countries/CountryEditPage";
import { PackageTypeListPage } from "@/modules/packageTypes/PackageTypeListPage";
import { PackageTypeCreatePage } from "@/modules/packageTypes/PackageTypeCreatePage";
import { PackageTypeEditPage } from "@/modules/packageTypes/PackageTypeEditPage";
import { ShippingPortListPage } from "@/modules/shippingPorts/ShippingPortListPage";
import { ShippingPortCreatePage } from "@/modules/shippingPorts/ShippingPortCreatePage";
import { ShippingPortEditPage } from "@/modules/shippingPorts/ShippingPortEditPage";
import { JobTypeListPage } from "@/modules/jobTypes/JobTypeListPage";
import { JobTypeCreatePage } from "@/modules/jobTypes/JobTypeCreatePage";
import { JobTypeEditPage } from "@/modules/jobTypes/JobTypeEditPage";
import { JobListPage } from "@/modules/jobs/JobListPage";
import { JobCreatePage } from "@/modules/jobs/JobCreatePage";
import { JobEditPage } from "@/modules/jobs/JobEditPage";
import { JobInvoicesPage } from "@/modules/jobs/JobInvoicesPage";
import { JobVendorBillsPage } from "@/modules/jobs/JobVendorBillsPage";
import { EmployeeListPage } from "@/modules/employees/EmployeeListPage";
import { EmployeeCreatePage } from "@/modules/employees/EmployeeCreatePage";
import { EmployeeEditPage } from "@/modules/employees/EmployeeEditPage";
import { EmployeeViewPage } from "@/modules/employees/EmployeeViewPage";
import { SalesmanTargetPage } from "@/modules/employees/SalesmanTargetPage";
import { IncentiveRulePage } from "@/modules/employees/IncentiveRulePage";
import { EmployeeIncentiveTreeReportPage } from "@/modules/employees/EmployeeIncentiveTreeReportPage";
import { DesignationListPage } from "@/modules/employees/DesignationListPage";
import { WarehouseListPage } from "@/modules/warehouses/WarehouseListPage";
import { WarehouseCreatePage } from "@/modules/warehouses/WarehouseCreatePage";
import { WarehouseEditPage } from "@/modules/warehouses/WarehouseEditPage";
import { WarehouseLocationPage } from "@/modules/warehouses/WarehouseLocationPage";
import { WarehouseStockPage } from "@/modules/warehouse/WarehouseStockPage";
import { WarehouseStockTransferPage } from "@/modules/warehouse/WarehouseStockTransferPage";
import { WarehouseStockTransactionPage } from "@/modules/warehouse/WarehouseStockTransactionPage";
import { AvailableGoodsLookupPage } from "@/modules/warehouse/AvailableGoodsLookupPage";
import { DamagedGoodsPage } from "@/modules/warehouse/DamagedGoodsPage";
import { ReturnedGoodsPage } from "@/modules/warehouse/ReturnedGoodsPage";
import { ChargeHeadListPage } from "@/modules/chargeHeads/ChargeHeadListPage";
import { ChargeHeadCreatePage } from "@/modules/chargeHeads/ChargeHeadCreatePage";
import { ChargeHeadEditPage } from "@/modules/chargeHeads/ChargeHeadEditPage";
import { TaxSetupPage } from "@/modules/taxes/TaxSetupPage";
import { RateMasterListPage } from "@/modules/rateMasters/RateMasterListPage";
import { RateMasterCreatePage } from "@/modules/rateMasters/RateMasterCreatePage";
import { RateMasterEditPage } from "@/modules/rateMasters/RateMasterEditPage";
import { RateMasterViewPage } from "@/modules/rateMasters/RateMasterViewPage";
import { RateCalculatorPreviewPage } from "@/modules/rateMasters/RateCalculatorPreviewPage";
import { QuotationListPage } from "@/modules/quotations/QuotationListPage";
import { QuotationCreatePage } from "@/modules/quotations/QuotationCreatePage";
import { QuotationEditPage } from "@/modules/quotations/QuotationEditPage";
import { QuotationViewPage } from "@/modules/quotations/QuotationViewPage";
import { QuotationApprovalPage } from "@/modules/quotations/QuotationApprovalPage";
import { QuotationCalculationPreviewPage } from "@/modules/quotations/QuotationCalculationPreviewPage";
import { QuotationPrintPreviewPage } from "@/modules/quotations/QuotationPrintPreviewPage";
import { PickupListPage } from "@/modules/pickups/PickupListPage";
import { PickupCreatePage } from "@/modules/pickups/PickupCreatePage";
import { PickupEditPage } from "@/modules/pickups/PickupEditPage";
import { PickupViewPage } from "@/modules/pickups/PickupViewPage";
import { PickupAssignPage } from "@/modules/pickups/PickupAssignPage";
import { PickupStatusUpdatePage } from "@/modules/pickups/PickupStatusUpdatePage";
import { PickupReceiptPrintPage } from "@/modules/pickups/PickupReceiptPrintPage";
import { PickupInvoicesPage } from "@/modules/pickups/PickupInvoicesPage";
import { PickupVendorBillsPage } from "@/modules/pickups/PickupVendorBillsPage";
import { GoodsReceiptListPage } from "@/modules/goodsReceipts/GoodsReceiptListPage";
import { GoodsReceiptCreatePage } from "@/modules/goodsReceipts/GoodsReceiptCreatePage";
import { GoodsReceiptEditPage } from "@/modules/goodsReceipts/GoodsReceiptEditPage";
import { GoodsReceiptViewPage } from "@/modules/goodsReceipts/GoodsReceiptViewPage";
import { GoodsReceiptNotePrintPage } from "@/modules/goodsReceipts/GoodsReceiptNotePrintPage";
import { GoodsLabelPrintPage } from "@/modules/goodsReceipts/GoodsLabelPrintPage";
import { GoodsReceiptInvoicesPage } from "@/modules/goodsReceipts/GoodsReceiptInvoicesPage";
import { GoodsReceiptVendorBillsPage } from "@/modules/goodsReceipts/GoodsReceiptVendorBillsPage";
import { HouseShipmentListPage } from "@/modules/shipments/house/HouseShipmentListPage";
import { HouseShipmentCreatePage } from "@/modules/shipments/house/HouseShipmentCreatePage";
import { HouseShipmentEditPage } from "@/modules/shipments/house/HouseShipmentEditPage";
import { HouseShipmentViewPage } from "@/modules/shipments/house/HouseShipmentViewPage";
import { HouseShipmentStatusPage } from "@/modules/shipments/house/HouseShipmentStatusPage";
import { HouseShipmentLabelPrintPage } from "@/modules/shipments/house/HouseShipmentLabelPrintPage";
import { HouseShipmentNotePrintPage } from "@/modules/shipments/house/HouseShipmentNotePrintPage";
import { HouseShipmentDocumentsPage } from "@/modules/shipments/house/HouseShipmentDocumentsPage";
import { HouseShipmentInvoicesPage } from "@/modules/shipments/house/HouseShipmentInvoicesPage";
import { HouseShipmentVendorBillsPage } from "@/modules/shipments/house/HouseShipmentVendorBillsPage";
import { HouseShipmentProfitPreviewPage } from "@/modules/shipments/house/HouseShipmentProfitPreviewPage";
import { MasterShipmentListPage } from "@/modules/shipments/master/MasterShipmentListPage";
import { MasterShipmentCreatePage } from "@/modules/shipments/master/MasterShipmentCreatePage";
import { MasterShipmentEditPage } from "@/modules/shipments/master/MasterShipmentEditPage";
import { MasterShipmentViewPage } from "@/modules/shipments/master/MasterShipmentViewPage";
import { MasterShipmentManifestPrintPage } from "@/modules/shipments/master/MasterShipmentManifestPrintPage";
import { ConsolidationPage } from "@/modules/shipments/master/ConsolidationPage";
import { MasterShipmentCostAllocationPage } from "@/modules/shipments/master/MasterShipmentCostAllocationPage";
import { MasterShipmentProfitLossReportPage } from "@/modules/shipments/master/MasterShipmentProfitLossReportPage";
import { MasterShipmentInvoicesPage } from "@/modules/shipments/master/MasterShipmentInvoicesPage";
import { MasterShipmentVendorBillsPage } from "@/modules/shipments/master/MasterShipmentVendorBillsPage";
import { DirectShipmentListPage } from "@/modules/shipments/direct/DirectShipmentListPage";
import { DirectShipmentCreatePage } from "@/modules/shipments/direct/DirectShipmentCreatePage";
import { DirectShipmentEditPage } from "@/modules/shipments/direct/DirectShipmentEditPage";
import { DirectShipmentViewPage } from "@/modules/shipments/direct/DirectShipmentViewPage";
import { DirectShipmentNotePrintPage } from "@/modules/shipments/direct/DirectShipmentNotePrintPage";
import { DirectShipmentLabelPrintPage } from "@/modules/shipments/direct/DirectShipmentLabelPrintPage";
import { DirectShipmentInvoicesPage } from "@/modules/shipments/direct/DirectShipmentInvoicesPage";
import { DirectShipmentVendorBillsPage } from "@/modules/shipments/direct/DirectShipmentVendorBillsPage";
import { DirectShipmentProfitPreviewPage } from "@/modules/shipments/direct/DirectShipmentProfitPreviewPage";
import { AirShipmentDetailsPage } from "@/modules/shipments/air/AirShipmentDetailsPage";
import { SeaShipmentDetailsPage } from "@/modules/shipments/sea/SeaShipmentDetailsPage";
import { RoadShipmentDetailsPage } from "@/modules/shipments/road/RoadShipmentDetailsPage";
import { CourierShipmentDetailsPage } from "@/modules/shipments/courier/CourierShipmentDetailsPage";
import { CourierPieceTrackingPage } from "@/modules/shipments/courier/CourierPieceTrackingPage";
import { CourierBaggingPage } from "@/modules/shipments/courier/CourierBaggingPage";
import { CourierManifestPage } from "@/modules/shipments/courier/CourierManifestPage";
import { ContainerListPage } from "@/modules/shipments/containers/ContainerListPage";
import { ContainerCreatePage } from "@/modules/shipments/containers/ContainerCreatePage";
import { ContainerEditPage } from "@/modules/shipments/containers/ContainerEditPage";
import { ContainerViewPage } from "@/modules/shipments/containers/ContainerViewPage";
import { CustomsClearanceListPage } from "@/modules/customs/CustomsClearanceListPage";
import { CustomsClearanceCreatePage } from "@/modules/customs/CustomsClearanceCreatePage";
import { CustomsClearanceEditPage } from "@/modules/customs/CustomsClearanceEditPage";
import { CustomsClearanceViewPage } from "@/modules/customs/CustomsClearanceViewPage";
import { CustomsStatusUpdatePage } from "@/modules/customs/CustomsStatusUpdatePage";
import { CustomsDocumentPage } from "@/modules/customs/CustomsDocumentPage";
import { CustomsInvoicesPage } from "@/modules/customs/CustomsInvoicesPage";
import { CustomsVendorBillsPage } from "@/modules/customs/CustomsVendorBillsPage";
import { DutyCalculationPage } from "@/modules/customs/DutyCalculationPage";
import { TransportationListPage } from "@/modules/transportation/TransportationListPage";
import { TransportationCreatePage } from "@/modules/transportation/TransportationCreatePage";
import { TransportationEditPage } from "@/modules/transportation/TransportationEditPage";
import { TransportationStatusPage } from "@/modules/transportation/TransportationStatusPage";
import { DocumentListPage } from "@/modules/documents/DocumentListPage";
import { DocumentUploadPage } from "@/modules/documents/DocumentUploadPage";
import { DocumentPreviewPage } from "@/modules/documents/DocumentPreviewPage";
import { DocumentCategoryPage } from "@/modules/documents/DocumentCategoryPage";
import { MandatoryDocumentChecklistPage } from "@/modules/documents/MandatoryDocumentChecklistPage";
import { ShipmentTrackingPage } from "@/modules/tracking/ShipmentTrackingPage";
import { ShipmentTrackingTimelinePage } from "@/modules/tracking/ShipmentTrackingTimelinePage";
import { PublicTrackingPage } from "@/modules/tracking/PublicTrackingPage";
import { TrackingStatusUpdatePage } from "@/modules/tracking/TrackingStatusUpdatePage";
import { InvoiceListPage } from "@/modules/invoices/InvoiceListPage";
import { InvoiceCreatePage } from "@/modules/invoices/InvoiceCreatePage";
import { InvoiceEditPage } from "@/modules/invoices/InvoiceEditPage";
import { InvoiceViewPage } from "@/modules/invoices/InvoiceViewPage";
import { InvoiceApprovalPage } from "@/modules/invoices/InvoiceApprovalPage";
import { InvoicePrintPreviewPage } from "@/modules/invoices/InvoicePrintPreviewPage";
import { InvoiceEmailPage } from "@/modules/invoices/InvoiceEmailPage";
import { CreditDebitNoteListPage } from "@/modules/creditDebitNotes/CreditDebitNoteListPage";
import { CreditDebitNoteCreatePage } from "@/modules/creditDebitNotes/CreditDebitNoteCreatePage";
import { CreditDebitNoteEditPage } from "@/modules/creditDebitNotes/CreditDebitNoteEditPage";
import { CreditDebitNoteViewPage } from "@/modules/creditDebitNotes/CreditDebitNoteViewPage";
import { VendorBillListPage } from "@/modules/vendorBills/VendorBillListPage";
import { VendorBillCreatePage } from "@/modules/vendorBills/VendorBillCreatePage";
import { VendorBillEditPage } from "@/modules/vendorBills/VendorBillEditPage";
import { VendorBillViewPage } from "@/modules/vendorBills/VendorBillViewPage";
import { VendorBillApprovalPage } from "@/modules/vendorBills/VendorBillApprovalPage";
import { ExpectedCostComparisonPage } from "@/modules/vendorBills/ExpectedCostComparisonPage";
import { VendorBillCostAllocationPage } from "@/modules/vendorBills/VendorBillCostAllocationPage";
import { CustomerReceiptListPage } from "@/modules/receipts/CustomerReceiptListPage";
import { CustomerReceiptCreatePage } from "@/modules/receipts/CustomerReceiptCreatePage";
import { CustomerReceiptEditPage } from "@/modules/receipts/CustomerReceiptEditPage";
import { CustomerReceiptViewPage } from "@/modules/receipts/CustomerReceiptViewPage";
import { CustomerReceiptPrintPage } from "@/modules/receipts/CustomerReceiptPrintPage";
import { ReceiptAllocationPage } from "@/modules/receipts/ReceiptAllocationPage";
import { VendorPaymentListPage } from "@/modules/payments/VendorPaymentListPage";
import { VendorPaymentCreatePage } from "@/modules/payments/VendorPaymentCreatePage";
import { VendorPaymentEditPage } from "@/modules/payments/VendorPaymentEditPage";
import { VendorPaymentViewPage } from "@/modules/payments/VendorPaymentViewPage";
import { PaymentAllocationPage } from "@/modules/payments/PaymentAllocationPage";
import { PayMultipleVouchersPage } from "@/modules/payments/PayMultipleVouchersPage";
import { ReconciliationDashboardPage } from "@/modules/reconciliation/ReconciliationDashboardPage";
import { InvoiceReceiptReconciliationPage } from "@/modules/reconciliation/InvoiceReceiptReconciliationPage";
import { BillPaymentReconciliationPage } from "@/modules/reconciliation/BillPaymentReconciliationPage";
import { ShipmentProfitReconciliationPage } from "@/modules/reconciliation/ShipmentProfitReconciliationPage";
import { ExchangeGainLossReconciliationPage } from "@/modules/reconciliation/ExchangeGainLossReconciliationPage";
import { AgentCommissionListPage } from "@/modules/commissions/AgentCommissionListPage";
import { AgentCommissionCreatePage } from "@/modules/commissions/AgentCommissionCreatePage";
import { AgentCommissionStatementPage } from "@/modules/commissions/AgentCommissionStatementPage";
import { SalaryListPage } from "@/modules/salary/SalaryListPage";
import { SalaryCreatePage } from "@/modules/salary/SalaryCreatePage";
import { SalaryViewPage } from "@/modules/salary/SalaryViewPage";
import { IncentiveCalculationPage } from "@/modules/salary/IncentiveCalculationPage";
import { PayslipPage } from "@/modules/salary/PayslipPage";
import { AccountingWorkspacePage } from "@/modules/accounting/AccountingWorkspacePage";
import { AccountGroupListPage } from "@/modules/accounting/AccountGroupListPage";
import { ChartOfAccountsPage } from "@/modules/accounting/ChartOfAccountsPage";
import { LedgerAccountListPage } from "@/modules/accounting/LedgerAccountListPage";
import { LedgerAccountCreatePage } from "@/modules/accounting/LedgerAccountCreatePage";
import { LedgerAccountEditPage } from "@/modules/accounting/LedgerAccountEditPage";
import { FinancialYearPage } from "@/modules/accounting/FinancialYearPage";
import { OpeningBalancePage } from "@/modules/accounting/OpeningBalancePage";
import { AccountMappingPage } from "@/modules/accounting/AccountMappingPage";
import { JournalVoucherListPage } from "@/modules/accounting/JournalVoucherListPage";
import { JournalVoucherCreatePage } from "@/modules/accounting/JournalVoucherCreatePage";
import { JournalVoucherEditPage } from "@/modules/accounting/JournalVoucherEditPage";
import { PaymentVoucherPage } from "@/modules/accounting/PaymentVoucherPage";
import { ReceiptVoucherPage } from "@/modules/accounting/ReceiptVoucherPage";
import { ContraVoucherPage } from "@/modules/accounting/ContraVoucherPage";
import { LedgerEntryViewPage } from "@/modules/accounting/LedgerEntryViewPage";
import { LedgerReportPage } from "@/modules/reports/accounting/LedgerReportPage";
import { GeneralLedgerPage } from "@/modules/reports/accounting/GeneralLedgerPage";
import { CustomerLedgerPage } from "@/modules/reports/accounting/CustomerLedgerPage";
import { VendorLedgerPage } from "@/modules/reports/accounting/VendorLedgerPage";
import { BankBookPage } from "@/modules/reports/accounting/BankBookPage";
import { CashBookPage } from "@/modules/reports/accounting/CashBookPage";
import { TrialBalancePage } from "@/modules/reports/accounting/TrialBalancePage";
import { BalanceSheetPage } from "@/modules/reports/accounting/BalanceSheetPage";
import { ProfitAndLossPage } from "@/modules/reports/accounting/ProfitAndLossPage";
import { TradingProfitAndLossPage } from "@/modules/reports/accounting/TradingProfitAndLossPage";
import { TaxReportPage } from "@/modules/reports/accounting/TaxReportPage";
import { CustomerOutstandingPage } from "@/modules/reports/accounting/CustomerOutstandingPage";
import { VendorOutstandingPage } from "@/modules/reports/accounting/VendorOutstandingPage";
import { StatementOfAccountPage } from "@/modules/reports/accounting/StatementOfAccountPage";
import { CurrencyGainLossReportPage } from "@/modules/reports/accounting/CurrencyGainLossReportPage";
import { CurrencyRevaluationReportPage } from "@/modules/reports/accounting/CurrencyRevaluationReportPage";
import { CustomerPortalDashboardPage } from "@/modules/portals/customer/CustomerPortalDashboardPage";
import { CustomerPortalQuotationsPage } from "@/modules/portals/customer/CustomerPortalQuotationsPage";
import { CustomerPortalQuotationViewPage } from "@/modules/portals/customer/CustomerPortalQuotationViewPage";
import { CustomerPortalShipmentRequestPage } from "@/modules/portals/customer/CustomerPortalShipmentRequestPage";
import { CustomerPortalPickupRequestPage } from "@/modules/portals/customer/CustomerPortalPickupRequestPage";
import { CustomerPortalTrackingPage } from "@/modules/portals/customer/CustomerPortalTrackingPage";
import { CustomerPortalDocumentsPage } from "@/modules/portals/customer/CustomerPortalDocumentsPage";
import { CustomerPortalInvoicesPage } from "@/modules/portals/customer/CustomerPortalInvoicesPage";
import { CustomerPortalStatementOfAccountPage } from "@/modules/portals/customer/CustomerPortalStatementOfAccountPage";
import { CustomerPortalOutstandingPage } from "@/modules/portals/customer/CustomerPortalOutstandingPage";
import { CustomerPortalPaymentHistoryPage } from "@/modules/portals/customer/CustomerPortalPaymentHistoryPage";
import { AgentPortalDashboardPage } from "@/modules/portals/agent/AgentPortalDashboardPage";
import { AgentAssignedShipmentsPage } from "@/modules/portals/agent/AgentAssignedShipmentsPage";
import { AgentShipmentStatusUpdatePage } from "@/modules/portals/agent/AgentShipmentStatusUpdatePage";
import { AgentPODUploadPage } from "@/modules/portals/agent/AgentPODUploadPage";
import { AgentDestinationChargesPage } from "@/modules/portals/agent/AgentDestinationChargesPage";
import { AgentCommissionStatementPage as AgentPortalCommissionStatementPage } from "@/modules/portals/agent/AgentCommissionStatementPage";
import { AgentDocumentsPage } from "@/modules/portals/agent/AgentDocumentsPage";
import { QuotationReportPage } from "@/modules/reports/operations/QuotationReportPage";
import { GoodsReceiptReportPage } from "@/modules/reports/operations/GoodsReceiptReportPage";
import { WarehouseStockReportPage } from "@/modules/reports/operations/WarehouseStockReportPage";
import { PickupReportPage } from "@/modules/reports/operations/PickupReportPage";
import { HouseShipmentReportPage } from "@/modules/reports/operations/HouseShipmentReportPage";
import { MasterShipmentReportPage } from "@/modules/reports/operations/MasterShipmentReportPage";
import { DirectShipmentReportPage } from "@/modules/reports/operations/DirectShipmentReportPage";
import { AirFreightReportPage } from "@/modules/reports/operations/AirFreightReportPage";
import { SeaFreightReportPage } from "@/modules/reports/operations/SeaFreightReportPage";
import { RoadFreightReportPage } from "@/modules/reports/operations/RoadFreightReportPage";
import { CourierReportPage } from "@/modules/reports/operations/CourierReportPage";
import { CustomsClearanceReportPage } from "@/modules/reports/operations/CustomsClearanceReportPage";
import { ContainerReportPage } from "@/modules/reports/operations/ContainerReportPage";
import { UnbilledShipmentReportPage } from "@/modules/reports/operations/UnbilledShipmentReportPage";
import { PendingBillReportPage } from "@/modules/reports/operations/PendingBillReportPage";
import { PendingPODReportPage } from "@/modules/reports/operations/PendingPODReportPage";
import { PendingDocumentReportPage } from "@/modules/reports/operations/PendingDocumentReportPage";
import { ShipmentAgeingReportPage } from "@/modules/reports/operations/ShipmentAgeingReportPage";
import { ShipmentProfitReportPage } from "@/modules/reports/operations/ShipmentProfitReportPage";
import { CustomerWiseProfitReportPage } from "@/modules/reports/operations/CustomerWiseProfitReportPage";
import { SalesmanWiseProfitReportPage } from "@/modules/reports/operations/SalesmanWiseProfitReportPage";
import { AgentWiseProfitReportPage } from "@/modules/reports/operations/AgentWiseProfitReportPage";
import { BranchWiseProfitReportPage } from "@/modules/reports/operations/BranchWiseProfitReportPage";
import { RouteWiseProfitReportPage } from "@/modules/reports/operations/RouteWiseProfitReportPage";
import { DestinationWiseProfitReportPage } from "@/modules/reports/operations/DestinationWiseProfitReportPage";
import { AuditLogListPage } from "@/modules/audit/AuditLogListPage";
import { UserActivityLogPage } from "@/modules/audit/UserActivityLogPage";
import { LoginHistoryPage } from "@/modules/audit/LoginHistoryPage";
import { EntityChangeLogPage } from "@/modules/audit/EntityChangeLogPage";
import { FinancialAuditLogPage } from "@/modules/audit/FinancialAuditLogPage";
import { ReportAccessLogPage } from "@/modules/audit/ReportAccessLogPage";
import { ExportLogPage } from "@/modules/audit/ExportLogPage";
import { PrintLogPage } from "@/modules/audit/PrintLogPage";
import { EmailLogPage } from "@/modules/audit/EmailLogPage";
import { FileAccessLogPage } from "@/modules/audit/FileAccessLogPage";
import { ApiRequestLogPage } from "@/modules/audit/ApiRequestLogPage";
import { AuditLogDetailPage } from "@/modules/audit/AuditLogDetailPage";
import { NotificationTemplateListPage } from "@/modules/notifications/NotificationTemplateListPage";
import { NotificationTemplateCreatePage } from "@/modules/notifications/NotificationTemplateCreatePage";
import { NotificationTemplateEditPage } from "@/modules/notifications/NotificationTemplateEditPage";
import { NotificationHistoryPage } from "@/modules/notifications/NotificationHistoryPage";
import { UserNotificationPage } from "@/modules/notifications/UserNotificationPage";
import { NumberingSettingsPage } from "@/modules/settings/NumberingSettingsPage";
import { PrintTemplateListPage } from "@/modules/settings/PrintTemplateListPage";
import { PrintTemplateDesignerPage } from "@/modules/settings/PrintTemplateDesignerPage";
import { LabelTemplateListPage } from "@/modules/settings/LabelTemplateListPage";
import { LabelTemplateDesignerPage } from "@/modules/settings/LabelTemplateDesignerPage";
import { ApprovalWorkflowListPage } from "@/modules/settings/ApprovalWorkflowListPage";
import { ApprovalWorkflowDesignerPage } from "@/modules/settings/ApprovalWorkflowDesignerPage";
function RequirePermission({ permission, children }: { permission: string | string[]; children: ReactNode }) {
  return <PermissionGuard permission={permission} fallback="redirect">{children}</PermissionGuard>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    )
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RequirePermission permission="Dashboard.Read"><DashboardPage /></RequirePermission> },
      { path: "tenants", element: <RequirePermission permission="Tenant.Read"><TenantListPage /></RequirePermission> },
      { path: "tenants/new", element: <RequirePermission permission="Tenant.Create"><TenantCreatePage /></RequirePermission> },
      { path: "tenants/:tenantId", element: <RequirePermission permission="Tenant.Read"><TenantViewPage /></RequirePermission> },
      { path: "tenants/:tenantId/edit", element: <RequirePermission permission="Tenant.Update"><TenantEditPage /></RequirePermission> },
      { path: "tenants/:tenantId/settings", element: <RequirePermission permission="Tenant.Update"><TenantSettingsPage /></RequirePermission> },
      { path: "branches", element: <RequirePermission permission="Branch.Read"><BranchListPage /></RequirePermission> },
      { path: "branches/new", element: <RequirePermission permission="Branch.Create"><BranchCreatePage /></RequirePermission> },
      { path: "branches/:branchId", element: <RequirePermission permission="Branch.Read"><BranchViewPage /></RequirePermission> },
      { path: "branches/:branchId/edit", element: <RequirePermission permission="Branch.Update"><BranchEditPage /></RequirePermission> },
      { path: "branches/:branchId/settings", element: <RequirePermission permission="Branch.Update"><BranchSettingsPage /></RequirePermission> },
      { path: "users", element: <RequirePermission permission="User.Read"><UserListPage /></RequirePermission> },
      { path: "users/new", element: <RequirePermission permission="User.Create"><UserCreatePage /></RequirePermission> },
      { path: "users/:userId", element: <RequirePermission permission="User.Read"><UserViewPage /></RequirePermission> },
      { path: "users/:userId/edit", element: <RequirePermission permission="User.Update"><UserEditPage /></RequirePermission> },
      { path: "roles", element: <RequirePermission permission="Role.Read"><RoleListPage /></RequirePermission> },
      { path: "roles/new", element: <RequirePermission permission="Role.Create"><RoleCreatePage /></RequirePermission> },
      { path: "roles/:roleId/edit", element: <RequirePermission permission="Role.Update"><RoleEditPage /></RequirePermission> },
      { path: "permissions/matrix", element: <RequirePermission permission="Permission.Read"><PermissionMatrixPage /></RequirePermission> },
      { path: "master-data", element: <MasterDataPage /> },
      { path: "currencies", element: <RequirePermission permission="Currency.Read"><CurrencyListPage /></RequirePermission> },
      { path: "currencies/new", element: <RequirePermission permission="Currency.Create"><CurrencyCreatePage /></RequirePermission> },
      { path: "currencies/:currencyId/edit", element: <RequirePermission permission="Currency.Update"><CurrencyEditPage /></RequirePermission> },
      { path: "currencies/tenant-setup", element: <RequirePermission permission="Currency.Update"><TenantCurrencySetupPage /></RequirePermission> },
      { path: "exchange-rates", element: <RequirePermission permission="Currency.Read"><ExchangeRateListPage /></RequirePermission> },
      { path: "exchange-rates/new", element: <RequirePermission permission="Currency.Override"><ExchangeRateCreatePage /></RequirePermission> },
      { path: "currencies/convert", element: <RequirePermission permission="Currency.Read"><CurrencyConversionPage /></RequirePermission> },
      { path: "currencies/revaluation", element: <RequirePermission permission="Currency.Approve"><CurrencyRevaluationPage /></RequirePermission> },
      { path: "languages", element: <RequirePermission permission="Language.Read"><LanguageListPage /></RequirePermission> },
      { path: "languages/new", element: <RequirePermission permission="Language.Create"><LanguageCreatePage /></RequirePermission> },
      { path: "languages/:languageId/edit", element: <RequirePermission permission="Language.Update"><LanguageEditPage /></RequirePermission> },
      { path: "languages/tenant-setup", element: <RequirePermission permission="Language.Update"><TenantLanguageSetupPage /></RequirePermission> },
      { path: "translations", element: <RequirePermission permission="Language.Read"><TranslationListPage /></RequirePermission> },
      { path: "translations/editor", element: <RequirePermission permission="Language.Update"><TranslationEditorPage /></RequirePermission> },
      { path: "translations/missing", element: <RequirePermission permission="Language.Read"><MissingTranslationReportPage /></RequirePermission> },
      { path: "customers", element: <RequirePermission permission="Customer.Read"><CustomerListPage /></RequirePermission> },
      { path: "customers/new", element: <RequirePermission permission="Customer.Create"><CustomerCreatePage /></RequirePermission> },
      { path: "customers/:customerId", element: <RequirePermission permission="Customer.Read"><CustomerViewPage /></RequirePermission> },
      { path: "customers/:customerId/edit", element: <RequirePermission permission="Customer.Update"><CustomerEditPage /></RequirePermission> },
      { path: "vendors", element: <RequirePermission permission="Vendor.Read"><VendorListPage /></RequirePermission> },
      { path: "vendors/new", element: <RequirePermission permission="Vendor.Create"><VendorCreatePage /></RequirePermission> },
      { path: "vendors/:vendorId", element: <RequirePermission permission="Vendor.Read"><VendorViewPage /></RequirePermission> },
      { path: "vendors/:vendorId/edit", element: <RequirePermission permission="Vendor.Update"><VendorEditPage /></RequirePermission> },
      { path: "agents", element: <RequirePermission permission="Agent.Read"><AgentListPage /></RequirePermission> },
      { path: "agents/new", element: <RequirePermission permission="Agent.Create"><AgentCreatePage /></RequirePermission> },
      { path: "agents/:agentId", element: <RequirePermission permission="Agent.Read"><AgentViewPage /></RequirePermission> },
      { path: "agents/:agentId/edit", element: <RequirePermission permission="Agent.Update"><AgentEditPage /></RequirePermission> },
      { path: "agents/:agentId/commission-settings", element: <RequirePermission permission="Agent.Update"><AgentCommissionSettingsPage /></RequirePermission> },
      { path: "carriers", element: <RequirePermission permission="Carrier.Read"><CarrierListPage /></RequirePermission> },
      { path: "carriers/new", element: <RequirePermission permission="Carrier.Create"><CarrierCreatePage /></RequirePermission> },
      { path: "carriers/:carrierId/edit", element: <RequirePermission permission="Carrier.Update"><CarrierEditPage /></RequirePermission> },
      { path: "countries", element: <RequirePermission permission="Country.Read"><CountryListPage /></RequirePermission> },
      { path: "countries/new", element: <RequirePermission permission="Country.Create"><CountryCreatePage /></RequirePermission> },
      { path: "countries/:id/edit", element: <RequirePermission permission="Country.Update"><CountryEditPage /></RequirePermission> },
      { path: "package-types", element: <RequirePermission permission={["PackageType.Read", "User.Read"]}><PackageTypeListPage /></RequirePermission> },
      { path: "package-types/new", element: <RequirePermission permission="PackageType.Create"><PackageTypeCreatePage /></RequirePermission> },
      { path: "package-types/:id/edit", element: <RequirePermission permission="PackageType.Update"><PackageTypeEditPage /></RequirePermission> },
      { path: "shipping-ports", element: <RequirePermission permission={["ShippingPort.Read", "User.Read"]}><ShippingPortListPage /></RequirePermission> },
      { path: "shipping-ports/new", element: <RequirePermission permission="ShippingPort.Create"><ShippingPortCreatePage /></RequirePermission> },
      { path: "shipping-ports/:id/edit", element: <RequirePermission permission="ShippingPort.Update"><ShippingPortEditPage /></RequirePermission> },
      { path: "job-types", element: <RequirePermission permission="JobType.Read"><JobTypeListPage /></RequirePermission> },
      { path: "job-types/new", element: <RequirePermission permission="JobType.Create"><JobTypeCreatePage /></RequirePermission> },
      { path: "job-types/:id/edit", element: <RequirePermission permission="JobType.Update"><JobTypeEditPage /></RequirePermission> },
      { path: "jobs", element: <RequirePermission permission="Job.Read"><JobListPage /></RequirePermission> },
      { path: "jobs/new", element: <RequirePermission permission="Job.Create"><JobCreatePage /></RequirePermission> },
      { path: "jobs/:id/invoices", element: <RequirePermission permission="Invoice.Read"><JobInvoicesPage /></RequirePermission> },
      { path: "jobs/:id/bills", element: <RequirePermission permission="VendorBill.Read"><JobVendorBillsPage /></RequirePermission> },
      { path: "jobs/:id/edit", element: <RequirePermission permission="Job.Update"><JobEditPage /></RequirePermission> },
      { path: "employees", element: <RequirePermission permission="Employee.Read"><EmployeeListPage /></RequirePermission> },
      { path: "employees/new", element: <RequirePermission permission="Employee.Create"><EmployeeCreatePage /></RequirePermission> },
      { path: "employees/:employeeId", element: <RequirePermission permission="Employee.Read"><EmployeeViewPage /></RequirePermission> },
      { path: "employees/:employeeId/edit", element: <RequirePermission permission="Employee.Update"><EmployeeEditPage /></RequirePermission> },
      { path: "designations", element: <RequirePermission permission="Designation.Read"><DesignationListPage /></RequirePermission> },
      { path: "employees/salesman-targets", element: <RequirePermission permission="SalesPerformance.Read"><SalesmanTargetPage /></RequirePermission> },
      { path: "employees/incentive-rules", element: <RequirePermission permission="SalesPerformance.Read"><IncentiveRulePage /></RequirePermission> },
      { path: "employees/incentive-tree-report", element: <RequirePermission permission="SalesPerformance.Read"><EmployeeIncentiveTreeReportPage /></RequirePermission> },
      { path: "warehouses", element: <RequirePermission permission="Warehouse.Read"><WarehouseListPage /></RequirePermission> },
      { path: "warehouses/new", element: <RequirePermission permission="Warehouse.Create"><WarehouseCreatePage /></RequirePermission> },
      { path: "warehouses/:warehouseId/edit", element: <RequirePermission permission="Warehouse.Update"><WarehouseEditPage /></RequirePermission> },
      { path: "warehouses/:warehouseId/locations", element: <RequirePermission permission="Warehouse.Read"><WarehouseLocationPage /></RequirePermission> },
      { path: "warehouses/stock", element: <RequirePermission permission="Warehouse.Read"><WarehouseStockPage /></RequirePermission> },
      { path: "warehouses/stock-transfer", element: <RequirePermission permission="Warehouse.Update"><WarehouseStockTransferPage /></RequirePermission> },
      { path: "warehouses/transactions", element: <RequirePermission permission="Warehouse.Read"><WarehouseStockTransactionPage /></RequirePermission> },
      { path: "warehouses/available-goods", element: <RequirePermission permission="Warehouse.Read"><AvailableGoodsLookupPage /></RequirePermission> },
      { path: "warehouses/damaged-goods", element: <RequirePermission permission="Warehouse.Update"><DamagedGoodsPage /></RequirePermission> },
      { path: "warehouses/returned-goods", element: <RequirePermission permission="Warehouse.Update"><ReturnedGoodsPage /></RequirePermission> },
      { path: "charge-heads", element: <RequirePermission permission="Accounting.Read"><ChargeHeadListPage /></RequirePermission> },
      { path: "charge-heads/new", element: <RequirePermission permission="Accounting.Update"><ChargeHeadCreatePage /></RequirePermission> },
      { path: "charge-heads/:chargeHeadId/edit", element: <RequirePermission permission="Accounting.Update"><ChargeHeadEditPage /></RequirePermission> },
      { path: "taxes", element: <RequirePermission permission="Accounting.Read"><TaxSetupPage /></RequirePermission> },
      { path: "rate-masters", element: <RequirePermission permission="RateMaster.Read"><RateMasterListPage /></RequirePermission> },
      { path: "rate-masters/new", element: <RequirePermission permission="RateMaster.Create"><RateMasterCreatePage /></RequirePermission> },
      { path: "rate-masters/:rateMasterId", element: <RequirePermission permission="RateMaster.Read"><RateMasterViewPage /></RequirePermission> },
      { path: "rate-masters/:rateMasterId/edit", element: <RequirePermission permission="RateMaster.Update"><RateMasterEditPage /></RequirePermission> },
      { path: "rate-masters/:rateMasterId/calculator", element: <RequirePermission permission="RateMaster.Read"><RateCalculatorPreviewPage /></RequirePermission> },
      { path: "quotations", element: <RequirePermission permission="Quotation.Read"><QuotationListPage /></RequirePermission> },
      { path: "quotations/new", element: <RequirePermission permission="Quotation.Create"><QuotationCreatePage /></RequirePermission> },
      { path: "quotations/:quotationId", element: <RequirePermission permission="Quotation.Read"><QuotationViewPage /></RequirePermission> },
      { path: "quotations/:quotationId/edit", element: <RequirePermission permission="Quotation.Update"><QuotationEditPage /></RequirePermission> },
      { path: "quotations/:quotationId/approval", element: <RequirePermission permission="Quotation.Approve"><QuotationApprovalPage /></RequirePermission> },
      { path: "quotations/:quotationId/calculation", element: <RequirePermission permission="Quotation.Read"><QuotationCalculationPreviewPage /></RequirePermission> },
      { path: "quotations/:quotationId/print", element: <RequirePermission permission="Quotation.Print"><QuotationPrintPreviewPage /></RequirePermission> },
      { path: "pickup", element: <RequirePermission permission="Pickup.Read"><PickupListPage /></RequirePermission> },
      { path: "pickups", element: <RequirePermission permission="Pickup.Read"><PickupListPage /></RequirePermission> },
      { path: "pickups/new", element: <RequirePermission permission="Pickup.Create"><PickupCreatePage /></RequirePermission> },
      { path: "pickups/:pickupId", element: <RequirePermission permission="Pickup.Read"><PickupViewPage /></RequirePermission> },
      { path: "pickups/:pickupId/edit", element: <RequirePermission permission="Pickup.Update"><PickupEditPage /></RequirePermission> },
      { path: "pickups/:pickupId/assign", element: <RequirePermission permission="Pickup.Update"><PickupAssignPage /></RequirePermission> },
      { path: "pickups/:pickupId/status", element: <RequirePermission permission="Pickup.Update"><PickupStatusUpdatePage /></RequirePermission> },
      { path: "pickups/:pickupId/receipt", element: <RequirePermission permission="Pickup.Print"><PickupReceiptPrintPage /></RequirePermission> },
      { path: "pickups/:pickupId/invoices", element: <RequirePermission permission="Invoice.Read"><PickupInvoicesPage /></RequirePermission> },
      { path: "pickups/:pickupId/bills", element: <RequirePermission permission="VendorBill.Read"><PickupVendorBillsPage /></RequirePermission> },
      { path: "goods-receipt", element: <RequirePermission permission="GoodsReceipt.Read"><GoodsReceiptListPage /></RequirePermission> },
      { path: "goods-receipts", element: <RequirePermission permission="GoodsReceipt.Read"><GoodsReceiptListPage /></RequirePermission> },
      { path: "goods-receipts/new", element: <RequirePermission permission="GoodsReceipt.Create"><GoodsReceiptCreatePage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId", element: <RequirePermission permission="GoodsReceipt.Read"><GoodsReceiptViewPage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId/edit", element: <RequirePermission permission="GoodsReceipt.Update"><GoodsReceiptEditPage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId/note", element: <RequirePermission permission="GoodsReceipt.Print"><GoodsReceiptNotePrintPage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId/labels", element: <RequirePermission permission="GoodsReceipt.Print"><GoodsLabelPrintPage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId/invoices", element: <RequirePermission permission="Invoice.Read"><GoodsReceiptInvoicesPage /></RequirePermission> },
      { path: "goods-receipts/:goodsReceiptId/bills", element: <RequirePermission permission="VendorBill.Read"><GoodsReceiptVendorBillsPage /></RequirePermission> },
      { path: "house-shipments", element: <RequirePermission permission="HouseShipment.Read"><HouseShipmentListPage /></RequirePermission> },
      { path: "house-shipments/new", element: <RequirePermission permission="HouseShipment.Create"><HouseShipmentCreatePage /></RequirePermission> },
      { path: "house-shipments/:shipmentId", element: <RequirePermission permission="HouseShipment.Read"><HouseShipmentViewPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/edit", element: <RequirePermission permission="HouseShipment.Update"><HouseShipmentEditPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/status", element: <RequirePermission permission="HouseShipment.Update"><HouseShipmentStatusPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/label", element: <RequirePermission permission="HouseShipment.Print"><HouseShipmentLabelPrintPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/note", element: <RequirePermission permission="HouseShipment.Print"><HouseShipmentNotePrintPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/invoices", element: <RequirePermission permission="Invoice.Read"><HouseShipmentInvoicesPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/bills", element: <RequirePermission permission="VendorBill.Read"><HouseShipmentVendorBillsPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/documents", element: <RequirePermission permission="HouseShipment.Update"><HouseShipmentDocumentsPage /></RequirePermission> },
      { path: "house-shipments/:shipmentId/profit", element: <RequirePermission permission="HouseShipment.Read"><HouseShipmentProfitPreviewPage /></RequirePermission> },
      { path: "master-shipments", element: <RequirePermission permission="MasterShipment.Read"><MasterShipmentListPage /></RequirePermission> },
      { path: "master-shipments/new", element: <RequirePermission permission="MasterShipment.Create"><MasterShipmentCreatePage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId", element: <RequirePermission permission="MasterShipment.Read"><MasterShipmentViewPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/edit", element: <RequirePermission permission="MasterShipment.Update"><MasterShipmentEditPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/manifest", element: <RequirePermission permission="MasterShipment.Print"><MasterShipmentManifestPrintPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/invoices", element: <RequirePermission permission="Invoice.Read"><MasterShipmentInvoicesPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/bills", element: <RequirePermission permission="VendorBill.Read"><MasterShipmentVendorBillsPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/consolidation", element: <RequirePermission permission="MasterShipment.Export"><ConsolidationPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/cost-allocation", element: <RequirePermission permission="MasterShipment.Read"><MasterShipmentCostAllocationPage /></RequirePermission> },
      { path: "master-shipments/:masterShipmentId/profit-loss", element: <RequirePermission permission="Profit.Read"><MasterShipmentProfitLossReportPage /></RequirePermission> },
      { path: "direct-shipments", element: <RequirePermission permission="DirectShipment.Read"><DirectShipmentListPage /></RequirePermission> },
      { path: "direct-shipments/new", element: <RequirePermission permission="DirectShipment.Create"><DirectShipmentCreatePage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId", element: <RequirePermission permission="DirectShipment.Read"><DirectShipmentViewPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/edit", element: <RequirePermission permission="DirectShipment.Update"><DirectShipmentEditPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/note", element: <RequirePermission permission="DirectShipment.Print"><DirectShipmentNotePrintPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/label", element: <RequirePermission permission="DirectShipment.Print"><DirectShipmentLabelPrintPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/invoices", element: <RequirePermission permission="Invoice.Read"><DirectShipmentInvoicesPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/bills", element: <RequirePermission permission="VendorBill.Read"><DirectShipmentVendorBillsPage /></RequirePermission> },
      { path: "direct-shipments/:directShipmentId/profit", element: <RequirePermission permission="DirectShipment.Read"><DirectShipmentProfitPreviewPage /></RequirePermission> },
      { path: "air-freight", element: <RequirePermission permission="AirFreight.Read"><AirShipmentDetailsPage /></RequirePermission> },
      { path: "sea-freight", element: <RequirePermission permission="SeaFreight.Read"><SeaShipmentDetailsPage /></RequirePermission> },
      { path: "road-freight", element: <RequirePermission permission="RoadFreight.Read"><RoadShipmentDetailsPage /></RequirePermission> },
      { path: "courier", element: <RequirePermission permission="Courier.Read"><CourierShipmentDetailsPage /></RequirePermission> },
      { path: "courier/piece-tracking", element: <RequirePermission permission="Courier.Read"><CourierPieceTrackingPage /></RequirePermission> },
      { path: "courier/bagging", element: <RequirePermission permission="Courier.Read"><CourierBaggingPage /></RequirePermission> },
      { path: "courier/manifest", element: <RequirePermission permission="Courier.Read"><CourierManifestPage /></RequirePermission> },
      { path: "containers", element: <RequirePermission permission="SeaFreight.Read"><ContainerListPage /></RequirePermission> },
      { path: "containers/new", element: <RequirePermission permission="SeaFreight.Create"><ContainerCreatePage /></RequirePermission> },
      { path: "containers/:containerId", element: <RequirePermission permission="SeaFreight.Read"><ContainerViewPage /></RequirePermission> },
      { path: "containers/:containerId/edit", element: <RequirePermission permission="SeaFreight.Update"><ContainerEditPage /></RequirePermission> },
      { path: "customs", element: <RequirePermission permission="CustomsClearance.Read"><CustomsClearanceListPage /></RequirePermission> },
      { path: "customs/new", element: <RequirePermission permission="CustomsClearance.Create"><CustomsClearanceCreatePage /></RequirePermission> },
      { path: "customs/jobs", element: <RequirePermission permission="Job.Read"><JobListPage /></RequirePermission> },
      { path: "customs/jobs/new", element: <RequirePermission permission="Job.Create"><JobCreatePage /></RequirePermission> },
      { path: "customs/jobs/:id/invoices", element: <RequirePermission permission="Invoice.Read"><JobInvoicesPage /></RequirePermission> },
      { path: "customs/jobs/:id/bills", element: <RequirePermission permission="VendorBill.Read"><JobVendorBillsPage /></RequirePermission> },
      { path: "customs/jobs/:id/edit", element: <RequirePermission permission="Job.Update"><JobEditPage /></RequirePermission> },
      { path: "customs/:customsId", element: <RequirePermission permission="CustomsClearance.Read"><CustomsClearanceViewPage /></RequirePermission> },
      { path: "customs/:customsId/edit", element: <RequirePermission permission="CustomsClearance.Update"><CustomsClearanceEditPage /></RequirePermission> },
      { path: "customs/:customsId/status", element: <RequirePermission permission="CustomsClearance.Update"><CustomsStatusUpdatePage /></RequirePermission> },
      { path: "customs/:customsId/documents", element: <RequirePermission permission="CustomsClearance.Update"><CustomsDocumentPage /></RequirePermission> },
      { path: "customs/:customsId/invoices", element: <RequirePermission permission="Invoice.Read"><CustomsInvoicesPage /></RequirePermission> },
      { path: "customs/:customsId/bills", element: <RequirePermission permission="VendorBill.Read"><CustomsVendorBillsPage /></RequirePermission> },
      { path: "customs/:customsId/duty", element: <RequirePermission permission="CustomsClearance.Update"><DutyCalculationPage /></RequirePermission> },
      { path: "transportation", element: <RequirePermission permission={["Pickup.Read", "DirectShipment.Read", "HouseShipment.Read"]}><TransportationListPage /></RequirePermission> },
      { path: "transportation/new", element: <RequirePermission permission="Pickup.Create"><TransportationCreatePage /></RequirePermission> },
      { path: "transportation/:type/:id/edit", element: <RequirePermission permission={["Pickup.Update", "HouseShipment.Update", "DirectShipment.Update"]}><TransportationEditPage /></RequirePermission> },
      { path: "transportation/:type/:id/status", element: <RequirePermission permission={["Pickup.Update", "HouseShipment.Update", "DirectShipment.Update"]}><TransportationStatusPage /></RequirePermission> },
      { path: "documents", element: <RequirePermission permission="DocumentManagement.Read"><DocumentListPage /></RequirePermission> },
      { path: "documents/upload", element: <RequirePermission permission="DocumentManagement.Create"><DocumentUploadPage /></RequirePermission> },
      { path: "documents/preview", element: <RequirePermission permission="DocumentManagement.Read"><DocumentPreviewPage /></RequirePermission> },
      { path: "documents/categories", element: <RequirePermission permission="DocumentManagement.Read"><DocumentCategoryPage /></RequirePermission> },
      { path: "documents/mandatory-checklist", element: <RequirePermission permission="DocumentManagement.Read"><MandatoryDocumentChecklistPage /></RequirePermission> },
      { path: "tracking", element: <RequirePermission permission={["HouseShipment.Read", "DirectShipment.Read", "MasterShipment.Read"]}><ShipmentTrackingPage /></RequirePermission> },
      { path: "tracking/timeline", element: <RequirePermission permission={["HouseShipment.Read", "DirectShipment.Read", "MasterShipment.Read"]}><ShipmentTrackingTimelinePage /></RequirePermission> },
      { path: "tracking/public", element: <PublicTrackingPage /> },
      { path: "tracking/status", element: <RequirePermission permission={["HouseShipment.Update", "DirectShipment.Update", "MasterShipment.Update"]}><TrackingStatusUpdatePage /></RequirePermission> },
      { path: "invoices", element: <RequirePermission permission="Invoice.Read"><InvoiceListPage /></RequirePermission> },
      { path: "invoices/new", element: <RequirePermission permission="Invoice.Create"><InvoiceCreatePage /></RequirePermission> },
      { path: "invoices/:invoiceId", element: <RequirePermission permission="Invoice.Read"><InvoiceViewPage /></RequirePermission> },
      { path: "invoices/:invoiceId/edit", element: <RequirePermission permission="Invoice.Update"><InvoiceEditPage /></RequirePermission> },
      { path: "invoices/:invoiceId/approval", element: <RequirePermission permission="Invoice.Approve"><InvoiceApprovalPage /></RequirePermission> },
      { path: "invoices/:invoiceId/print", element: <RequirePermission permission="Invoice.Print"><InvoicePrintPreviewPage /></RequirePermission> },
      { path: "invoices/:invoiceId/email", element: <RequirePermission permission="Invoice.Export"><InvoiceEmailPage /></RequirePermission> },
      { path: "credit-debit-notes", element: <RequirePermission permission="CreditDebitNote.Read"><CreditDebitNoteListPage /></RequirePermission> },
      { path: "credit-debit-notes/new", element: <RequirePermission permission="CreditDebitNote.Create"><CreditDebitNoteCreatePage /></RequirePermission> },
      { path: "credit-debit-notes/:noteId", element: <RequirePermission permission="CreditDebitNote.Read"><CreditDebitNoteViewPage /></RequirePermission> },
      { path: "credit-debit-notes/:noteId/edit", element: <RequirePermission permission="CreditDebitNote.Update"><CreditDebitNoteEditPage /></RequirePermission> },
      { path: "vendor-bills", element: <RequirePermission permission="VendorBill.Read"><VendorBillListPage /></RequirePermission> },
      { path: "vendor-bills/new", element: <RequirePermission permission="VendorBill.Create"><VendorBillCreatePage /></RequirePermission> },
      { path: "vendor-bills/:vendorBillId", element: <RequirePermission permission="VendorBill.Read"><VendorBillViewPage /></RequirePermission> },
      { path: "vendor-bills/:vendorBillId/edit", element: <RequirePermission permission="VendorBill.Update"><VendorBillEditPage /></RequirePermission> },
      { path: "vendor-bills/:vendorBillId/approval", element: <RequirePermission permission="VendorBill.Approve"><VendorBillApprovalPage /></RequirePermission> },
      { path: "vendor-bills/:vendorBillId/expected-cost", element: <RequirePermission permission="VendorBill.Read"><ExpectedCostComparisonPage /></RequirePermission> },
      { path: "vendor-bills/:vendorBillId/cost-allocation", element: <RequirePermission permission="VendorBill.Update"><VendorBillCostAllocationPage /></RequirePermission> },
      { path: "receipts", element: <RequirePermission permission="Receipt.Read"><CustomerReceiptListPage /></RequirePermission> },
      { path: "receipts/new", element: <RequirePermission permission="Receipt.Create"><CustomerReceiptCreatePage /></RequirePermission> },
      { path: "receipts/:receiptId", element: <RequirePermission permission="Receipt.Read"><CustomerReceiptViewPage /></RequirePermission> },
      { path: "receipts/:receiptId/edit", element: <RequirePermission permission="Receipt.Update"><CustomerReceiptEditPage /></RequirePermission> },
      { path: "receipts/:receiptId/allocation", element: <RequirePermission permission="Receipt.Update"><ReceiptAllocationPage /></RequirePermission> },
      { path: "receipts/:receiptId/print", element: <RequirePermission permission="Receipt.Print"><CustomerReceiptPrintPage /></RequirePermission> },
      { path: "payments", element: <RequirePermission permission="Payment.Read"><VendorPaymentListPage /></RequirePermission> },
      { path: "payments/new", element: <RequirePermission permission="Payment.Create"><VendorPaymentCreatePage /></RequirePermission> },
      { path: "payments/bulk", element: <RequirePermission permission="Payment.Create"><PayMultipleVouchersPage /></RequirePermission> },
      { path: "payments/:paymentId", element: <RequirePermission permission="Payment.Read"><VendorPaymentViewPage /></RequirePermission> },
      { path: "payments/:paymentId/edit", element: <RequirePermission permission="Payment.Update"><VendorPaymentEditPage /></RequirePermission> },
      { path: "payments/:paymentId/allocation", element: <RequirePermission permission="Payment.Update"><PaymentAllocationPage /></RequirePermission> },
      { path: "reconciliation", element: <RequirePermission permission="Reconciliation.Read"><ReconciliationDashboardPage /></RequirePermission> },
      { path: "reconciliation/invoice-receipt", element: <RequirePermission permission="Reconciliation.Read"><InvoiceReceiptReconciliationPage /></RequirePermission> },
      { path: "reconciliation/bill-payment", element: <RequirePermission permission="Reconciliation.Read"><BillPaymentReconciliationPage /></RequirePermission> },
      { path: "reconciliation/shipment-profit", element: <RequirePermission permission="Reconciliation.Read"><ShipmentProfitReconciliationPage /></RequirePermission> },
      { path: "reconciliation/exchange-gain-loss", element: <RequirePermission permission="Reconciliation.Read"><ExchangeGainLossReconciliationPage /></RequirePermission> },
      { path: "commissions", element: <RequirePermission permission={["AgentPortal.Read", "Accounting.Read"]}><AgentCommissionListPage /></RequirePermission> },
      { path: "commissions/new", element: <RequirePermission permission="Accounting.Create"><AgentCommissionCreatePage /></RequirePermission> },
      { path: "commissions/statement", element: <RequirePermission permission="AgentPortal.Read"><AgentCommissionStatementPage /></RequirePermission> },
      { path: "salary", element: <RequirePermission permission="Accounting.Read"><SalaryListPage /></RequirePermission> },
      { path: "salary/new", element: <RequirePermission permission="Accounting.Create"><SalaryCreatePage /></RequirePermission> },
      { path: "salary/:salaryId", element: <RequirePermission permission="Accounting.Read"><SalaryViewPage /></RequirePermission> },
      { path: "salary/:salaryId/payslip", element: <RequirePermission permission="Accounting.Print"><PayslipPage /></RequirePermission> },
      { path: "salary/incentive-calc", element: <RequirePermission permission="Accounting.Read"><IncentiveCalculationPage /></RequirePermission> },
      { path: "accounting", element: <AccountingWorkspacePage /> },
      { path: "accounting/account-groups", element: <RequirePermission permission="Accounting.Read"><AccountGroupListPage /></RequirePermission> },
      { path: "chart-of-accounts", element: <RequirePermission permission="Accounting.Read"><ChartOfAccountsPage /></RequirePermission> },
      { path: "accounting/ledger-accounts", element: <RequirePermission permission="Accounting.Read"><LedgerAccountListPage /></RequirePermission> },
      { path: "accounting/ledger-accounts/new", element: <RequirePermission permission="Accounting.Create"><LedgerAccountCreatePage /></RequirePermission> },
      { path: "accounting/ledger-accounts/:ledgerId/edit", element: <RequirePermission permission="Accounting.Update"><LedgerAccountEditPage /></RequirePermission> },
      { path: "accounting/financial-years", element: <RequirePermission permission="Accounting.Read"><FinancialYearPage /></RequirePermission> },
      { path: "accounting/opening-balances", element: <RequirePermission permission="Accounting.Read"><OpeningBalancePage /></RequirePermission> },
      { path: "accounting/account-mappings", element: <RequirePermission permission="Accounting.Read"><AccountMappingPage /></RequirePermission> },
      { path: "accounting/journal-vouchers", element: <RequirePermission permission="Accounting.Read"><JournalVoucherListPage /></RequirePermission> },
      { path: "accounting/journal-vouchers/new", element: <RequirePermission permission="Accounting.Create"><JournalVoucherCreatePage /></RequirePermission> },
      { path: "accounting/journal-vouchers/:voucherId/edit", element: <RequirePermission permission="Accounting.Update"><JournalVoucherEditPage /></RequirePermission> },
      { path: "accounting/payment-voucher", element: <RequirePermission permission="Accounting.Create"><PaymentVoucherPage /></RequirePermission> },
      { path: "accounting/receipt-voucher", element: <RequirePermission permission="Accounting.Create"><ReceiptVoucherPage /></RequirePermission> },
      { path: "accounting/contra-voucher", element: <RequirePermission permission="Accounting.Create"><ContraVoucherPage /></RequirePermission> },
      { path: "accounting/ledger-entries", element: <RequirePermission permission="Accounting.Read"><LedgerEntryViewPage /></RequirePermission> },
      { path: "reports/accounting/ledger", element: <RequirePermission permission="Reports.Read"><LedgerReportPage /></RequirePermission> },
      { path: "reports/accounting/general-ledger", element: <RequirePermission permission="Reports.Read"><GeneralLedgerPage /></RequirePermission> },
      { path: "reports/accounting/customer-ledger", element: <RequirePermission permission="Reports.Read"><CustomerLedgerPage /></RequirePermission> },
      { path: "reports/accounting/vendor-ledger", element: <RequirePermission permission="Reports.Read"><VendorLedgerPage /></RequirePermission> },
      { path: "reports/accounting/bank-book", element: <RequirePermission permission="Reports.Read"><BankBookPage /></RequirePermission> },
      { path: "reports/accounting/cash-book", element: <RequirePermission permission="Reports.Read"><CashBookPage /></RequirePermission> },
      { path: "reports/accounting/trial-balance", element: <RequirePermission permission="Reports.Read"><TrialBalancePage /></RequirePermission> },
      { path: "reports/accounting/balance-sheet", element: <RequirePermission permission="Reports.Read"><BalanceSheetPage /></RequirePermission> },
      { path: "reports/accounting/profit-and-loss", element: <RequirePermission permission="Reports.Read"><ProfitAndLossPage /></RequirePermission> },
      { path: "reports/accounting/trading-profit-and-loss", element: <RequirePermission permission="Reports.Read"><TradingProfitAndLossPage /></RequirePermission> },
      { path: "reports/accounting/tax-report", element: <RequirePermission permission="Reports.Read"><TaxReportPage /></RequirePermission> },
      { path: "reports/accounting/customer-outstanding", element: <RequirePermission permission="Reports.Read"><CustomerOutstandingPage /></RequirePermission> },
      { path: "reports/accounting/vendor-outstanding", element: <RequirePermission permission="Reports.Read"><VendorOutstandingPage /></RequirePermission> },
      { path: "reports/accounting/statement-of-account", element: <RequirePermission permission="Reports.Read"><StatementOfAccountPage /></RequirePermission> },
      { path: "reports/accounting/currency-gain-loss", element: <RequirePermission permission="Reports.Read"><CurrencyGainLossReportPage /></RequirePermission> },
      { path: "reports/accounting/currency-revaluation", element: <RequirePermission permission="Reports.Read"><CurrencyRevaluationReportPage /></RequirePermission> },
      { path: "reports/operations/quotation", element: <RequirePermission permission="Reports.Read"><QuotationReportPage /></RequirePermission> },
      { path: "reports/operations/goods-receipt", element: <RequirePermission permission="Reports.Read"><GoodsReceiptReportPage /></RequirePermission> },
      { path: "reports/operations/warehouse-stock", element: <RequirePermission permission="Reports.Read"><WarehouseStockReportPage /></RequirePermission> },
      { path: "reports/operations/pickup", element: <RequirePermission permission="Reports.Read"><PickupReportPage /></RequirePermission> },
      { path: "reports/operations/house-shipment", element: <RequirePermission permission="Reports.Read"><HouseShipmentReportPage /></RequirePermission> },
      { path: "reports/operations/master-shipment", element: <RequirePermission permission="Reports.Read"><MasterShipmentReportPage /></RequirePermission> },
      { path: "reports/operations/direct-shipment", element: <RequirePermission permission="Reports.Read"><DirectShipmentReportPage /></RequirePermission> },
      { path: "reports/operations/air-freight", element: <RequirePermission permission="Reports.Read"><AirFreightReportPage /></RequirePermission> },
      { path: "reports/operations/sea-freight", element: <RequirePermission permission="Reports.Read"><SeaFreightReportPage /></RequirePermission> },
      { path: "reports/operations/road-freight", element: <RequirePermission permission="Reports.Read"><RoadFreightReportPage /></RequirePermission> },
      { path: "reports/operations/courier", element: <RequirePermission permission="Reports.Read"><CourierReportPage /></RequirePermission> },
      { path: "reports/operations/customs-clearance", element: <RequirePermission permission="Reports.Read"><CustomsClearanceReportPage /></RequirePermission> },
      { path: "reports/operations/container", element: <RequirePermission permission="Reports.Read"><ContainerReportPage /></RequirePermission> },
      { path: "reports/operations/unbilled-shipment", element: <RequirePermission permission="Reports.Read"><UnbilledShipmentReportPage /></RequirePermission> },
      { path: "reports/operations/pending-bill", element: <RequirePermission permission="Reports.Read"><PendingBillReportPage /></RequirePermission> },
      { path: "reports/operations/pending-pod", element: <RequirePermission permission="Reports.Read"><PendingPODReportPage /></RequirePermission> },
      { path: "reports/operations/pending-document", element: <RequirePermission permission="Reports.Read"><PendingDocumentReportPage /></RequirePermission> },
      { path: "reports/operations/shipment-ageing", element: <RequirePermission permission="Reports.Read"><ShipmentAgeingReportPage /></RequirePermission> },
      { path: "reports/operations/shipment-profit", element: <RequirePermission permission="Profit.Read"><ShipmentProfitReportPage /></RequirePermission> },
      { path: "reports/operations/customer-wise-profit", element: <RequirePermission permission="Profit.Read"><CustomerWiseProfitReportPage /></RequirePermission> },
      { path: "reports/operations/salesman-wise-profit", element: <RequirePermission permission="Profit.Read"><SalesmanWiseProfitReportPage /></RequirePermission> },
      { path: "reports/operations/agent-wise-profit", element: <RequirePermission permission="Profit.Read"><AgentWiseProfitReportPage /></RequirePermission> },
      { path: "reports/operations/branch-wise-profit", element: <RequirePermission permission="Profit.Read"><BranchWiseProfitReportPage /></RequirePermission> },
      { path: "reports/operations/route-wise-profit", element: <RequirePermission permission="Profit.Read"><RouteWiseProfitReportPage /></RequirePermission> },
      { path: "reports/operations/destination-wise-profit", element: <RequirePermission permission="Profit.Read"><DestinationWiseProfitReportPage /></RequirePermission> },
      { path: "audit", element: <RequirePermission permission="AuditLog.Read"><AuditLogListPage /></RequirePermission> },
      { path: "audit/:auditId", element: <RequirePermission permission="AuditLog.Read"><AuditLogDetailPage /></RequirePermission> },
      { path: "audit/user-activity", element: <RequirePermission permission="AuditLog.Read"><UserActivityLogPage /></RequirePermission> },
      { path: "audit/login-history", element: <RequirePermission permission="AuditLog.Read"><LoginHistoryPage /></RequirePermission> },
      { path: "audit/entity-changes", element: <RequirePermission permission="AuditLog.Read"><EntityChangeLogPage /></RequirePermission> },
      { path: "audit/financial", element: <RequirePermission permission="AuditLog.Read"><FinancialAuditLogPage /></RequirePermission> },
      { path: "audit/reports", element: <RequirePermission permission="AuditLog.Read"><ReportAccessLogPage /></RequirePermission> },
      { path: "audit/exports", element: <RequirePermission permission="AuditLog.Read"><ExportLogPage /></RequirePermission> },
      { path: "audit/prints", element: <RequirePermission permission="AuditLog.Read"><PrintLogPage /></RequirePermission> },
      { path: "audit/emails", element: <RequirePermission permission="AuditLog.Read"><EmailLogPage /></RequirePermission> },
      { path: "audit/files", element: <RequirePermission permission="AuditLog.Read"><FileAccessLogPage /></RequirePermission> },
      { path: "audit/api-requests", element: <RequirePermission permission="AuditLog.Read"><ApiRequestLogPage /></RequirePermission> },
      { path: "notifications", element: <RequirePermission permission="Notification.Read"><NotificationTemplateListPage /></RequirePermission> },
      { path: "notifications/templates", element: <RequirePermission permission="Notification.Read"><NotificationTemplateListPage /></RequirePermission> },
      { path: "notifications/templates/new", element: <RequirePermission permission="Notification.Create"><NotificationTemplateCreatePage /></RequirePermission> },
      { path: "notifications/templates/:templateId/edit", element: <RequirePermission permission="Notification.Update"><NotificationTemplateEditPage /></RequirePermission> },
      { path: "notifications/history", element: <RequirePermission permission="Notification.Read"><NotificationHistoryPage /></RequirePermission> },
      { path: "notifications/me", element: <RequirePermission permission="Notification.Read"><UserNotificationPage /></RequirePermission> },
      { path: "settings/numbering", element: <RequirePermission permission="Tenant.Read"><NumberingSettingsPage /></RequirePermission> },
      { path: "settings/print-templates", element: <RequirePermission permission="Tenant.Read"><PrintTemplateListPage /></RequirePermission> },
      { path: "settings/print-templates/designer", element: <RequirePermission permission="Tenant.Update"><PrintTemplateDesignerPage /></RequirePermission> },
      { path: "settings/label-templates", element: <RequirePermission permission="Tenant.Read"><LabelTemplateListPage /></RequirePermission> },
      { path: "settings/label-templates/designer", element: <RequirePermission permission="Tenant.Update"><LabelTemplateDesignerPage /></RequirePermission> },
      { path: "settings/approval-workflows", element: <RequirePermission permission="Tenant.Read"><ApprovalWorkflowListPage /></RequirePermission> },
      { path: "settings/approval-workflows/designer", element: <RequirePermission permission="Tenant.Update"><ApprovalWorkflowDesignerPage /></RequirePermission> },
      { path: "operations", element: <RequirePermission permission={["HouseShipment.Read", "DirectShipment.Read", "MasterShipment.Read"]}><OperationsConsolePage /></RequirePermission> },
      { path: "finance", element: <RequirePermission permission="Accounting.Read"><FinanceWorkbenchPage /></RequirePermission> },
      { path: ":moduleId", element: <ModuleWorkbenchPage /> }
    ]
  },
  {
    path: "/customer-portal",
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalDashboardPage /></RequirePermission> },
      { path: "quotations", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalQuotationsPage /></RequirePermission> },
      { path: "quotations/:quotationId", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalQuotationViewPage /></RequirePermission> },
      { path: "shipment-request", element: <RequirePermission permission="CustomerPortal.Create"><CustomerPortalShipmentRequestPage /></RequirePermission> },
      { path: "pickup-request", element: <RequirePermission permission="CustomerPortal.Create"><CustomerPortalPickupRequestPage /></RequirePermission> },
      { path: "tracking", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalTrackingPage /></RequirePermission> },
      { path: "documents", element: <RequirePermission permission="CustomerPortal.Create"><CustomerPortalDocumentsPage /></RequirePermission> },
      { path: "invoices", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalInvoicesPage /></RequirePermission> },
      { path: "statement-of-account", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalStatementOfAccountPage /></RequirePermission> },
      { path: "outstanding", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalOutstandingPage /></RequirePermission> },
      { path: "payment-history", element: <RequirePermission permission="CustomerPortal.Read"><CustomerPortalPaymentHistoryPage /></RequirePermission> }
    ]
  },
  {
    path: "/agent-portal",
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RequirePermission permission="AgentPortal.Read"><AgentPortalDashboardPage /></RequirePermission> },
      { path: "assigned-shipments", element: <RequirePermission permission="AgentPortal.Read"><AgentAssignedShipmentsPage /></RequirePermission> },
      { path: "shipments/status", element: <RequirePermission permission="AgentPortal.Update"><AgentShipmentStatusUpdatePage /></RequirePermission> },
      { path: "shipments/pod", element: <RequirePermission permission="AgentPortal.Create"><AgentPODUploadPage /></RequirePermission> },
      { path: "destination-charges", element: <RequirePermission permission="AgentPortal.Create"><AgentDestinationChargesPage /></RequirePermission> },
      { path: "commission-statement", element: <RequirePermission permission="AgentPortal.Read"><AgentPortalCommissionStatementPage /></RequirePermission> },
      { path: "documents", element: <RequirePermission permission="AgentPortal.Read"><AgentDocumentsPage /></RequirePermission> }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
