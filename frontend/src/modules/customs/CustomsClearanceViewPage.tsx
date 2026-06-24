import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { FilePlus2, FileText, Pencil, Plus, RefreshCw, Send, Sigma } from "lucide-react";
import { getShipmentDocuments } from "@/api/documentApi";
import { getCustomsJob, searchCustomsConfigurations, submitCustomsDeclaration, type CustomsClearanceJobDto, type CustomsConfigurationDto } from "@/api/customsApi";
import { getTenantCurrencies } from "@/api/currencyApi";
import { getActivePackageTypesForDropdown } from "@/api/packageTypeApi";
import { PermissionButton } from "@/auth/PermissionButton";
import { AuditTrailButton } from "@/components/common/AuditTrailButton";
import { DocumentUploadPanel } from "@/components/common/DocumentUploadPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { CustomsChildCrudTab, type CustomsCrudField } from "@/modules/customs/CustomsChildCrudTab";
import { CustomsDocumentRowAttachmentPanel } from "@/modules/customs/CustomsDocumentChecklistAttachments";
import { CustomsPaymentsTab } from "@/modules/customs/CustomsPaymentsTab";
import { lt } from "@/modules/operationsLocalization";

const tabs = ["Overview", "Parties", "Invoices", "Items", "Packages", "Containers", "Documents", "Assessment", "Payments", "Inspection", "Queries", "History"];

export function CustomsClearanceViewPage() {
  const { customsId } = useParams();
  const location = useLocation();
  const toast = useToast();
  const [tab, setTab] = useState("Overview");
  const query = useQuery({ queryKey: ["customs-job", customsId], queryFn: () => getCustomsJob(customsId!), enabled: Boolean(customsId) });
  const documents = useQuery({ queryKey: ["documents", "CustomsClearance", customsId], queryFn: () => getShipmentDocuments("CustomsClearance", customsId!), enabled: Boolean(customsId) });
  const currencyQuery = useQuery({ queryKey: ["tenant-currencies", "customs"], queryFn: getTenantCurrencies });
  const packageTypeQuery = useQuery({ queryKey: ["package-types", "customs"], queryFn: () => getActivePackageTypesForDropdown() });
  const configurationQuery = useQuery({ queryKey: ["customs-configurations", "view"], queryFn: () => searchCustomsConfigurations({ pageNumber: 1, pageSize: 300 }) });
  const submitMutation = useMutation({ mutationFn: () => submitCustomsDeclaration(customsId!) });
  const totals = useMemo(() => {
    const x = query.data;
    return {
      invoice: x?.invoices.reduce((s, i) => s + i.assessableValue, 0) ?? 0,
      duty: x?.assessments.reduce((s, a) => s + a.dutyAmount, 0) ?? 0,
      tax: x?.assessments.reduce((s, a) => s + a.taxAmount, 0) ?? 0,
      payable: x?.assessments.reduce((s, a) => s + a.totalPayableAmount, 0) ?? 0,
      paid: x?.payments.reduce((s, p) => s + p.amount, 0) ?? 0
    };
  }, [query.data]);
  const isBillOfEntryRoute = location.pathname.startsWith("/bill-of-entry");
  const basePath = isBillOfEntryRoute ? "/bill-of-entry" : "/customs";
  if (!customsId) return <Navigate to={basePath} replace />;
  const x = query.data;
  return <div className="space-y-4">
    <PageHeader
      title={isBillOfEntryRoute ? (x?.declaration?.declarationNumber || x?.jobNumber || lt("Bill of Entry")) : (x?.jobNumber ?? lt("Customs Clearance"))}
      description={`${x?.shipmentReferenceNo ?? ""} ${x ? `| ${x.clearanceType} | ${x.modeOfTransport}` : ""}`}
      actions={
        <>
          <Button variant="outline" onClick={() => void query.refetch()}><RefreshCw className="h-4 w-4" />{lt("Refresh")}</Button>
          <AuditTrailButton />
          <PermissionButton asChild permission="CustomsClearance.Update"><Link to={`${basePath}/${customsId}/edit`}><Pencil className="h-4 w-4" />{lt("Edit")}</Link></PermissionButton>
          <PermissionButton asChild permission="CustomsClearance.Update"><Link to={`${basePath}/${customsId}/status`}><Sigma className="h-4 w-4" />{lt("Status")}</Link></PermissionButton>
          <PermissionButton asChild permission="CustomsClearance.Update"><Link to={`${basePath}/${customsId}/documents`}><FileText className="h-4 w-4" />{lt("Documents")}</Link></PermissionButton>
          <PermissionButton asChild permission="Invoice.Read"><Link to={`${basePath}/${customsId}/invoices`}><FileText className="h-4 w-4" />{lt("Invoices")}</Link></PermissionButton>
          <PermissionButton asChild permission="Invoice.Create"><Link to={`/invoices/new?${new URLSearchParams({ sourceType: "CustomsClearance", sourceId: customsId, sourceReferenceNo: x?.jobNumber ?? "", customerId: x?.customerId ?? "" }).toString()}`}><Plus className="h-4 w-4" />{lt("New Invoice")}</Link></PermissionButton>
          <PermissionButton asChild permission="VendorBill.Read"><Link to={`${basePath}/${customsId}/bills`}><FilePlus2 className="h-4 w-4" />{lt("Bills")}</Link></PermissionButton>
          <PermissionButton asChild permission="VendorBill.Create"><Link to={`/vendor-bills/new?${new URLSearchParams({ sourceType: "CustomsClearance", sourceId: customsId, sourceReferenceNo: x?.jobNumber ?? "", expectedCostAmount: String(totals.payable) }).toString()}`}><FilePlus2 className="h-4 w-4" />{lt("New Bill")}</Link></PermissionButton>
          <PermissionButton permission="CustomsClearance.Approve" onClick={() => void submitMutation.mutateAsync().then((r) => { toast.success(lt("Submitted"), `${lt("Reference")} ${r.submissionReference}`); void query.refetch(); })}><Send className="h-4 w-4" />{lt("Submit")}</PermissionButton>
        </>
      }
    />
    {x ? <>
      <div className="grid gap-3 md:grid-cols-5">
        <Kpi label={lt("Status")} value={<StatusBadge status={x.status} />} />
        <Kpi label={lt("Assessable")} value={totals.invoice.toFixed(2)} />
        <Kpi label={lt("Duty")} value={totals.duty.toFixed(2)} />
        <Kpi label={lt("Tax")} value={totals.tax.toFixed(2)} />
        <Kpi label={lt("Payable / Paid")} value={`${totals.payable.toFixed(2)} / ${totals.paid.toFixed(2)}`} />
      </div>
      <Card><CardContent className="pt-4"><div className="flex flex-wrap gap-2">{tabs.map((t) => <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>{lt(t)}</Button>)}</div></CardContent></Card>
      <DocumentUploadPanel moduleName="CustomsClearance" entityId={customsId} referenceNumber={x.jobNumber} defaultDocumentName={lt("Customs Clearance Document")} defaultDocumentCategory={lt("Customs Clearance")} emptyText={lt("No documents uploaded for this customs clearance.")} documents={documents.data ?? []} onRefresh={() => void documents.refetch()} />
      <CustomsTab
        job={x}
        tab={tab}
        onRefresh={() => void query.refetch()}
        currencyOptions={(currencyQuery.data ?? []).filter((currency) => currency.isEnabled).map((currency) => ({
          value: currency.currencyId,
          label: `${currency.currencyCode} - ${currency.currencyName}`
        }))}
        packageTypeOptions={(packageTypeQuery.data ?? []).map((packageType) => ({
          value: packageType.packageName,
          label: `${packageType.packageCode} - ${packageType.packageName}`
        }))}
        containerTypeOptions={configurationOptions(configurationQuery.data?.items, "ContainerType", ["20 GP", "40 GP", "40 HC", "45 HC", "Reefer", "Open Top", "Flat Rack", "Other"])}
        documentCategoryOptions={configurationOptions(configurationQuery.data?.items, "DocumentCategory", ["Commercial Invoice", "Packing List", "Bill of Lading", "Air Waybill", "Certificate of Origin", "Customs Declaration", "Duty Receipt", "Other"], true)}
        inspectionTypeOptions={configurationOptions(configurationQuery.data?.items, "InspectionType", ["Physical Inspection", "Documentary Inspection", "Scanner Inspection", "Sampling", "Quarantine Inspection", "Other"])}
      />
    </> : <Card><CardContent className="pt-6 text-sm text-muted-foreground">{lt("Loading customs clearance job...")}</CardContent></Card>}
  </div>;
}

function CustomsTab({
  job,
  tab,
  onRefresh,
  currencyOptions,
  packageTypeOptions
  ,
  containerTypeOptions,
  documentCategoryOptions,
  inspectionTypeOptions
}: {
  job: CustomsClearanceJobDto;
  tab: string;
  onRefresh: () => void;
  currencyOptions: Array<{ value: string; label: string }>;
  packageTypeOptions: Array<{ value: string; label: string }>;
  containerTypeOptions: Array<{ value: string; label: string }>;
  documentCategoryOptions: Array<{ value: string; label: string }>;
  inspectionTypeOptions: Array<{ value: string; label: string }>;
}) {
  const locked = ["Cleared", "Rejected", "Cancelled"].includes(job.status);
  const today = localDateTime();
  if (tab === "Overview") return <Card><CardContent className="grid gap-3 pt-6 md:grid-cols-4"><Field label={lt("Customer")}>{job.customerName || "-"}</Field><Field label={lt("Reference No")}>{job.shipmentReferenceNo || "-"}</Field><Field label={lt("Broker")}>{job.customsBrokerName || "-"}</Field><Field label={lt("Incoterms")}>{job.incoterms || "-"}</Field><Field label={lt("Origin Port")}>{job.originPort || "-"}</Field><Field label={lt("Destination Port")}>{job.destinationPort || "-"}</Field><Field label={lt("Expected Clearance")}>{format(job.expectedClearanceDate)}</Field><Field label={lt("Actual Clearance")}>{format(job.actualClearanceDate)}</Field><Field label={lt("Declaration No")}>{job.declaration?.declarationNumber || "-"}</Field><Field label={lt("HS Code")}>{job.declaration?.hsCode || "-"}</Field><Field label={lt("Customs Office")}>{job.declaration?.customsOffice || "-"}</Field><Field label={lt("Submission Ref")}>{job.declaration?.submissionReference || "-"}</Field></CardContent></Card>;
  if (tab === "Parties") return <CustomsChildCrudTab jobId={job.id} childType="parties" title={lt("Party")} rows={records(job.parties)} locked={locked} onRefresh={onRefresh}
    fields={[
      select("partyType", "Party Type", ["Importer", "Exporter", "Shipper", "Consignee", "Notify Party", "Customs Broker", "Buyer", "Seller"], true),
      text("partyName", "Party Name", true),
      text("taxNumber", "Tax Number"),
      text("contactName", "Contact Name"),
      text("phone", "Phone"),
      text("email", "Email"),
      textarea("address", "Address", 2)
    ]}
    columns={["partyType", "partyName", "taxNumber", "contactName", "phone", "email", "address"]}
    emptyValue={{ partyType: "Importer", partyId: null, partyName: "", taxNumber: "", contactName: "", phone: "", email: "", address: "" }}
  />;
  if (tab === "Invoices") return <CustomsChildCrudTab jobId={job.id} childType="invoices" title={lt("Customs Invoice")} rows={records(job.invoices)} locked={locked} onRefresh={onRefresh}
    fields={[
      text("invoiceNumber", "Invoice Number", true),
      dateTime("invoiceDate", "Invoice Date", true),
      { key: "currencyId", label: lt("Currency"), type: "select", required: true, options: currencyOptions },
      number("exchangeRate", "Exchange Rate", true, 0.000001),
      number("invoiceAmount", "Invoice Amount", true),
      number("freightAmount", "Freight Amount"),
      number("insuranceAmount", "Insurance Amount"),
      number("otherChargesAmount", "Other Charges")
    ]}
    columns={["invoiceNumber", "invoiceDate", "invoiceAmount", "freightAmount", "insuranceAmount", "otherChargesAmount", "assessableValue"]}
    emptyValue={{ invoiceNumber: "", invoiceDate: today, currencyId: defaultOption(currencyOptions), exchangeRate: 1, invoiceAmount: 0, freightAmount: 0, insuranceAmount: 0, otherChargesAmount: 0 }}
  />;
  if (tab === "Items") return <CustomsChildCrudTab jobId={job.id} childType="items" title={lt("Declaration Item")} rows={records(job.items)} locked={locked} onRefresh={onRefresh}
    fields={[
      text("lineNumber", "Line Number"),
      text("description", "Description", true, 2),
      text("hsCode", "HS Code", true),
      text("countryOfOrigin", "Country of Origin"),
      number("quantity", "Quantity", true),
      text("unit", "Unit"),
      number("grossWeight", "Gross Weight"),
      number("netWeight", "Net Weight"),
      number("itemValue", "Item Value"),
      number("dutyRate", "Duty Rate %"),
      number("taxRate", "Tax Rate %")
    ]}
    columns={["lineNumber", "description", "hsCode", "countryOfOrigin", "quantity", "unit", "grossWeight", "netWeight", "itemValue", "dutyAmount", "taxAmount"]}
    emptyValue={{ lineNumber: "", description: "", hsCode: "", countryOfOrigin: "", quantity: 0, unit: "", grossWeight: 0, netWeight: 0, itemValue: 0, dutyRate: 0, taxRate: 0 }}
  />;
  if (tab === "Packages") return <CustomsChildCrudTab jobId={job.id} childType="packages" title={lt("Package")} rows={records(job.packages)} locked={locked} onRefresh={onRefresh}
    fields={[
      { key: "packageType", label: lt("Package Type"), type: "select", required: true, options: packageTypeOptions },
      number("pieces", "No. of Packages", true),
      number("weight", "Gross Weight"),
      number("length", "Length"),
      number("width", "Width"),
      number("height", "Height"),
      text("marksAndNumbers", "Marks and Numbers", false, 2)
    ]}
    columns={["packageType", "pieces", "weight", "length", "width", "height", "volumeCbm", "marksAndNumbers"]}
    emptyValue={{ packageType: "", pieces: 0, weight: 0, length: 0, width: 0, height: 0, marksAndNumbers: "" }}
  />;
  if (tab === "Containers") return <CustomsChildCrudTab jobId={job.id} childType="containers" title={lt("Container")} rows={records(job.containers)} locked={locked} onRefresh={onRefresh}
    fields={[
      text("containerNumber", "Container Number", true),
      text("sealNumber", "Seal Number"),
      { key: "containerType", label: lt("Container Type"), type: "select", required: true, options: containerTypeOptions },
      number("grossWeight", "Gross Weight"),
      number("netWeight", "Net Weight"),
      number("volumeCbm", "Volume (CBM)")
    ]}
    columns={["containerNumber", "sealNumber", "containerType", "grossWeight", "netWeight", "volumeCbm"]}
    emptyValue={{ containerNumber: "", sealNumber: "", containerType: defaultOption(containerTypeOptions), grossWeight: 0, netWeight: 0, volumeCbm: 0 }}
  />;
  if (tab === "Documents") return <div className="space-y-4"><CustomsChildCrudTab jobId={job.id} childType="documents" title={lt("Document")} rows={records(job.documents)} locked={locked} onRefresh={onRefresh}
      fields={[
        { key: "documentCategory", label: lt("Document Category"), type: "select", required: true, options: documentCategoryOptions },
        text("documentName", "Document Name", true),
        checkbox("isRequired", "Required"),
        checkbox("isReceived", "Received"),
        textarea("remarks", "Remarks", 2)
      ]}
      columns={["documentCategory", "documentName", "isRequired", "isReceived", "uploadedDate", "remarks"]}
      emptyValue={{ documentCategory: defaultOption(documentCategoryOptions), documentName: "", fileName: "", filePath: "", isRequired: false, isReceived: false, remarks: "" }}
      rowExpansionLabel={lt("Attachments")}
      rowExpansion={(row) => <CustomsDocumentRowAttachmentPanel row={row as unknown as (typeof job.documents)[number]} />}
    />
  </div>;
  if (tab === "Assessment") return <CustomsChildCrudTab jobId={job.id} childType="assessments" title={lt("Assessment")} rows={records(job.assessments)} locked={locked} onRefresh={onRefresh}
    fields={[
      text("assessmentReference", "Assessment Reference"),
      dateTime("assessmentDate", "Assessment Date"),
      number("assessableValue", "Assessable Value", true),
      number("dutyAmount", "Duty Amount"),
      number("taxAmount", "Tax Amount"),
      number("penaltyAmount", "Penalty Amount"),
      number("otherChargesAmount", "Other Charges")
    ]}
    columns={["assessmentReference", "assessmentDate", "assessableValue", "dutyAmount", "taxAmount", "penaltyAmount", "otherChargesAmount", "totalPayableAmount"]}
    emptyValue={{ assessmentReference: "", assessmentDate: today, assessableValue: 0, dutyAmount: 0, taxAmount: 0, penaltyAmount: 0, otherChargesAmount: 0 }}
  />;
  if (tab === "Payments") return <CustomsPaymentsTab jobId={job.id} rows={job.payments} locked={locked} currencyOptions={currencyOptions} onRefresh={onRefresh} />;
  if (tab === "Inspection") return <CustomsChildCrudTab jobId={job.id} childType="inspections" title={lt("Inspection")} rows={records(job.inspections)} locked={locked} onRefresh={onRefresh}
    fields={[
      dateTime("inspectionDate", "Inspection Date", true),
      { key: "inspectionType", label: lt("Inspection Type"), type: "select", required: true, options: inspectionTypeOptions },
      text("officerName", "Officer Name"),
      select("result", "Result", ["Pending", "Passed", "Failed", "Hold", "Released"], true),
      textarea("remarks", "Remarks", 2)
    ]}
    columns={["inspectionDate", "inspectionType", "officerName", "result", "remarks"]}
    emptyValue={{ inspectionDate: today, inspectionType: defaultOption(inspectionTypeOptions), officerName: "", result: "Pending", remarks: "" }}
  />;
  if (tab === "Queries") return <CustomsChildCrudTab jobId={job.id} childType="queries" title={lt("Customs Query")} rows={records(job.queries)} locked={locked} onRefresh={onRefresh}
    fields={[
      text("queryNumber", "Query Number"),
      dateTime("queryDate", "Query Date", true),
      textarea("queryText", "Query", 2, true),
      textarea("responseText", "Response", 2),
      dateTime("responseDate", "Response Date"),
      select("status", "Status", ["Open", "Responded", "Closed"], true)
    ]}
    columns={["queryNumber", "queryDate", "queryText", "responseText", "responseDate", "status"]}
    emptyValue={{ queryNumber: "", queryDate: today, queryText: "", responseText: "", responseDate: "", status: "Open" }}
  />;
  return <SimpleTable rows={job.statusHistory} columns={["changedDate", "fromStatus", "toStatus", "reason", "remarks", "changedBy"]} />;
}

function SimpleTable<T extends object>({ rows, columns }: { rows: T[]; columns: string[] }) {
  return <Card><CardContent className="overflow-auto pt-6"><table className="min-w-full text-sm"><thead><tr>{columns.map((c) => <th key={c} className="border-b bg-slate-50 px-3 py-2 text-left font-semibold capitalize">{split(c)}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => {
    const record = row as Record<string, unknown>;
    return <tr key={String(record.id ?? i)}>{columns.map((c) => <td key={c} className="border-b px-3 py-2 align-top">{String(record[c] ?? "-")}</td>)}</tr>;
  }) : <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={columns.length}>{lt("No records yet.")}</td></tr>}</tbody></table></CardContent></Card>;
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) { return <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-lg font-semibold">{value}</div></CardContent></Card>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><p className="text-xs text-muted-foreground">{label}</p><div className="break-words font-medium">{children}</div></div>; }
function format(value?: string | null) { return value ? new Date(value).toLocaleString() : "-"; }
function split(value: string) { return value.replace(/([A-Z])/g, " $1").trim(); }
function records<T extends object>(rows: T[]) { return rows as Array<Record<string, unknown>>; }
function defaultOption(options: Array<{ value: string; label: string }>) { return options[0]?.value ?? ""; }
function configurationOptions(rows: CustomsConfigurationDto[] | undefined, type: string, fallback: string[], codeStyleFallback = false) {
  const configured = (rows ?? [])
    .filter((row) => row.isActive && normalizeConfigurationType(row.configurationType) === normalizeConfigurationType(type))
    .map((row) => ({ value: row.name, label: `${row.code} - ${row.name}` }));
  return configured.length ? configured : fallback.map((value) => {
    const code = value.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase();
    return { value: codeStyleFallback ? code : value, label: codeStyleFallback ? `${code} - ${value}` : value };
  });
}
function normalizeConfigurationType(value: string) { return value.replace(/[\s_-]/g, "").toLowerCase(); }
function localDateTime() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
function text(key: string, label: string, required = false, span: 1 | 2 | 4 = 1): CustomsCrudField { return { key, label, required, span }; }
function textarea(key: string, label: string, span: 1 | 2 | 4 = 1, required = false): CustomsCrudField { return { key, label, type: "textarea", required, span }; }
function number(key: string, label: string, required = false, step = 0.0001): CustomsCrudField { return { key, label, type: "number", required, min: 0, step }; }
function dateTime(key: string, label: string, required = false): CustomsCrudField { return { key, label, type: "datetime-local", required }; }
function checkbox(key: string, label: string): CustomsCrudField { return { key, label, type: "checkbox" }; }
function select(key: string, label: string, options: string[], required = false): CustomsCrudField {
  return { key, label, type: "select", required, options: options.map((value) => ({ value, label: value })) };
}
