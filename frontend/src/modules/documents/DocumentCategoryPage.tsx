import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export function DocumentCategoryPage() {
  const categories = ["Commercial Invoice", "Packing List", "Bill of Lading / AWB", "Customs Declaration", "POD", "Insurance", "Other"];
  return <div className="space-y-4"><PageHeader title="Document Categories" description="Maintain document category conventions for operations and compliance." /><Card><CardContent className="pt-6"><ul className="list-disc pl-5 text-sm space-y-1">{categories.map((c) => <li key={c}>{c}</li>)}</ul></CardContent></Card></div>;
}
