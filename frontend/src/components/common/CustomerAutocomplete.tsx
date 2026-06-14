import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getCustomer, searchCustomerLookup, type CustomerSearchDto } from "@/api/customerApi";
import { Input } from "@/components/ui/input";

export function CustomerAutocomplete({
  value,
  onChange,
  placeholder = "Search by name, code, or phone",
  minimumCharactersText = "Enter at least 3 characters.",
  searchingText = "Searching customers...",
  emptyText = "No customers found.",
  noPhoneText = "No phone"
}: {
  value: string;
  onChange: (customer: CustomerSearchDto | null) => void;
  placeholder?: string;
  minimumCharactersText?: string;
  searchingText?: string;
  emptyText?: string;
  noPhoneText?: string;
}) {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [open, setOpen] = useState(false);
  const selectedCustomer = useQuery({
    queryKey: ["selected-customer-lookup", value],
    queryFn: () => getCustomer(value),
    enabled: Boolean(value),
    staleTime: 5 * 60 * 1000
  });
  const selectedLabel = selectedCustomer.data ? customerLabel(selectedCustomer.data) : "";

  useEffect(() => {
    if (value && selectedLabel) setText(selectedLabel);
  }, [value, selectedLabel]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedText(text.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [text]);

  const search = useQuery({
    queryKey: ["customer-lookup", debouncedText],
    queryFn: () => searchCustomerLookup(debouncedText, 20),
    enabled: open && debouncedText.length >= 3 && (!value || debouncedText !== selectedLabel),
    staleTime: 60 * 1000
  });

  return (
    <div className="relative">
      <Input
        value={text}
        placeholder={placeholder}
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
          {text.trim().length < 3 ? <div className="px-3 py-2 text-sm text-muted-foreground">{minimumCharactersText}</div> : null}
          {text.trim().length >= 3 && (search.isFetching || text.trim() !== debouncedText) ? <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> {searchingText}</div> : null}
          {text.trim().length >= 3 && !search.isFetching && text.trim() === debouncedText && search.data?.length === 0 ? <div className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</div> : null}
          {text.trim() === debouncedText ? (search.data ?? []).map((customer) => (
            <button
              key={customer.id}
              type="button"
              className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setText(customerLabel(customer));
                setOpen(false);
                onChange(customer);
              }}
            >
              <span className="block text-sm font-medium text-slate-900">{customer.customerCode} - {customer.customerName}</span>
              <span className="block text-xs text-muted-foreground">{customer.phone || noPhoneText}{customer.email ? ` | ${customer.email}` : ""}</span>
            </button>
          )) : null}
        </div>
      ) : null}
    </div>
  );
}

function customerLabel(customer: Pick<CustomerSearchDto, "customerCode" | "customerName" | "phone">) {
  return `${customer.customerCode} - ${customer.customerName}${customer.phone ? ` - ${customer.phone}` : ""}`;
}
