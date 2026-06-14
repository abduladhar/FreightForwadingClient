import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const defaultChecklist = [
  "Commercial Invoice",
  "Packing List",
  "Transport Document (B/L, AWB, CMR)",
  "Customs Declaration",
  "POD"
];

export function MandatoryDocumentChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return <div className="space-y-4"><PageHeader title="Mandatory Document Checklist" description="Track required documents before customs and delivery completion." /><Card><CardContent className="pt-6 space-y-2">{defaultChecklist.map((x) => <label key={x} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(checked[x])} onChange={(e) => setChecked({ ...checked, [x]: e.target.checked })} /> {x}</label>)}</CardContent></Card></div>;
}
