import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lt } from "@/modules/operationsLocalization";

export function CreateCustomerButton() {
  return (
    <Button asChild type="button" variant="outline" size="icon" title={lt("Create Customer")} aria-label={lt("Create Customer")}>
      <Link to="/customers/new">
        <Plus className="h-4 w-4" />
      </Link>
    </Button>
  );
}
