export interface DashboardAmountPoint {
  key: string;
  label: string;
  amount: number;
}

export interface DashboardCountPoint {
  key: string;
  label: string;
  count: number;
}

export interface DashboardDto {
  totalQuotations: number;
  pendingQuotations: number;
  approvedQuotations: number;
  goodsReceived: number;
  warehouseStock: number;
  shipmentsInTransit: number;
  deliveredShipments: number;
  pendingCustomerInvoices: number;
  pendingVendorBills: number;
  customerOutstanding: number;
  vendorOutstanding: number;
  pendingApprovals: number;
  pendingPod: number;
  pendingDocuments: number;
  monthlyRevenue: DashboardAmountPoint[];
  monthlyCost: DashboardAmountPoint[];
  monthlyProfit: DashboardAmountPoint[];
  currencyWiseReceivables: DashboardAmountPoint[];
  currencyWisePayables: DashboardAmountPoint[];
  shipmentStatusChart: DashboardCountPoint[];
  topCustomers: DashboardAmountPoint[];
  topDestinations: DashboardCountPoint[];
  salesmanPerformance: DashboardAmountPoint[];
}

export interface DashboardEnvelope {
  reportName: string;
  tenantId: string;
  branchId: string;
  fromDate?: string | null;
  toDate?: string | null;
  data: DashboardDto;
}

export interface DashboardRequest {
  pageNumber?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
  customerId?: string;
  vendorId?: string;
  agentId?: string;
  salesmanId?: string;
  shipmentType?: string;
  shipmentStatus?: string;
  modeOfTransport?: string;
  currencyId?: string;
  origin?: string;
  destination?: string;
  route?: string;
  carrierId?: string;
  containerNumber?: string;
  userId?: string;
}
