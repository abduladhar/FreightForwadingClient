import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getQuotation, searchQuotations, type QuotationDto } from "@/api/quotationApi";
import { Input } from "@/components/ui/input";
import { lt } from "@/modules/operationsLocalization";

export function QuotationAutocomplete({
  value,
  customerId,
  onChange,
  placeholder = "Search approved quotation number"
}: {
  value?: string | null;
  customerId?: string | null;
  onChange: (quotation: QuotationDto | null) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [open, setOpen] = useState(false);
  const selectedQuotation = useQuery({
    queryKey: ["selected-approved-quotation", value],
    queryFn: () => getQuotation(value!),
    enabled: Boolean(value),
    staleTime: 5 * 60 * 1000
  });
  const selectedLabel = selectedQuotation.data?.quotationNumber ?? "";

  useEffect(() => {
    if (value && selectedLabel) setText(selectedLabel);
    if (!value) setText("");
  }, [value, selectedLabel]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedText(text.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [text]);

  const search = useQuery({
    queryKey: ["approved-quotation-lookup", customerId, debouncedText],
    queryFn: () => searchQuotations({
      pageNumber: 1,
      pageSize: 20,
      search: debouncedText,
      status: "Approved",
      customerId: customerId || undefined
    }),
    enabled: Boolean(customerId) && open && debouncedText.length >= 3 && (!value || debouncedText !== selectedLabel),
    staleTime: 60 * 1000
  });

  return (
    <div className="relative">
      <Input
        value={text}
        placeholder={customerId ? placeholder : lt("Select customer before quotation")}
        disabled={!customerId}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
      />
      {open && (!value || text !== selectedLabel) ? (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {!customerId ? <div className="px-3 py-2 text-sm text-muted-foreground">{lt("Select a customer to search quotations.")}</div> : null}
          {customerId && text.trim().length < 3 ? <div className="px-3 py-2 text-sm text-muted-foreground">{lt("Enter at least 3 characters of the quotation number.")}</div> : null}
          {customerId && text.trim().length >= 3 && (search.isFetching || text.trim() !== debouncedText) ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {lt("Searching approved quotations...")}
            </div>
          ) : null}
          {customerId && text.trim().length >= 3 && !search.isFetching && text.trim() === debouncedText && search.data?.items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{lt("No approved quotations found.")}</div>
          ) : null}
          {text.trim() === debouncedText ? (search.data?.items ?? []).map((quotation) => (
            <button
              key={quotation.id}
              type="button"
              className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setText(quotation.quotationNumber);
                setOpen(false);
                onChange(quotation);
              }}
            >
              <span className="block text-sm font-medium text-slate-900">{quotation.quotationNumber}</span>
              <span className="block text-xs text-muted-foreground">{quotation.originPortName || quotation.origin} to {quotation.destinationPortName || quotation.destination}</span>
            </button>
          )) : null}
        </div>
      ) : null}
    </div>
  );
}
