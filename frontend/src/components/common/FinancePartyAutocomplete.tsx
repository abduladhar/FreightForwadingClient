import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { getAgent, searchAgents } from "@/api/agentApi";
import { getCarrier, searchCarriers } from "@/api/carrierApi";
import { getCustomer, searchCustomerLookup } from "@/api/customerApi";
import { getVendor, searchVendors } from "@/api/vendorApi";
import { Input } from "@/components/ui/input";

export type FinancePartyType = "Customer" | "Vendor" | "Agent" | "Carrier";

export type FinancePartyLookup = {
  id: string;
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  defaultCurrencyId?: string | null;
};

export function FinancePartyAutocomplete({
  partyType,
  value,
  onChange,
  disabled,
  placeholder
}: {
  partyType: FinancePartyType;
  value: string;
  onChange: (party: FinancePartyLookup | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [open, setOpen] = useState(false);
  const selectedParty = useQuery({
    queryKey: ["selected-finance-party", partyType, value],
    queryFn: () => getParty(partyType, value),
    enabled: Boolean(value),
    staleTime: 5 * 60 * 1000
  });
  const selectedLabel = selectedParty.data ? partyLabel(selectedParty.data) : "";

  useEffect(() => {
    if (value && selectedLabel) setText(selectedLabel);
    if (!value) setText("");
  }, [value, selectedLabel, partyType]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedText(text.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [text]);

  const search = useQuery({
    queryKey: ["finance-party-lookup", partyType, debouncedText],
    queryFn: () => searchParties(partyType, debouncedText),
    enabled: !disabled && open && debouncedText.length >= 3 && (!value || debouncedText !== selectedLabel),
    staleTime: 60 * 1000
  });

  return (
    <div className="relative">
      <Input
        value={text}
        disabled={disabled}
        placeholder={placeholder ?? `Search ${partyType.toLowerCase()} by name, code, or phone`}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
      />
      {open && !disabled && (!value || text !== selectedLabel) ? (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-white shadow-lg">
          {text.trim().length < 3 ? <div className="px-3 py-2 text-sm text-muted-foreground">Enter at least 3 characters.</div> : null}
          {text.trim().length >= 3 && (search.isFetching || text.trim() !== debouncedText) ? <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Searching...</div> : null}
          {text.trim().length >= 3 && !search.isFetching && text.trim() === debouncedText && search.data?.length === 0 ? <div className="px-3 py-2 text-sm text-muted-foreground">No matching {partyType.toLowerCase()} found.</div> : null}
          {text.trim() === debouncedText ? (search.data ?? []).map((party) => (
            <button
              key={party.id}
              type="button"
              className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-slate-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setText(partyLabel(party));
                setOpen(false);
                onChange(party);
              }}
            >
              <span className="block text-sm font-medium text-slate-900">{party.code} - {party.name}</span>
              <span className="block text-xs text-muted-foreground">{party.phone || "No phone"}{party.email ? ` | ${party.email}` : ""}</span>
            </button>
          )) : null}
        </div>
      ) : null}
    </div>
  );
}

async function searchParties(partyType: FinancePartyType, term: string): Promise<FinancePartyLookup[]> {
  if (partyType === "Customer") {
    return (await searchCustomerLookup(term, 20)).map((x) => ({
      id: x.id, code: x.customerCode, name: x.customerName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId
    }));
  }
  if (partyType === "Vendor") {
    const result = await searchVendors({ pageNumber: 1, pageSize: 20, search: term, isActive: true });
    return result.items.map((x) => ({ id: x.id, code: x.vendorCode, name: x.vendorName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId }));
  }
  if (partyType === "Agent") {
    const result = await searchAgents({ pageNumber: 1, pageSize: 20, search: term, isActive: true });
    return result.items.map((x) => ({ id: x.id, code: x.agentCode, name: x.agentName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId }));
  }
  const result = await searchCarriers({ pageNumber: 1, pageSize: 20, search: term, isActive: true });
  return result.items.map((x) => ({ id: x.id, code: x.carrierCode, name: x.carrierName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId }));
}

async function getParty(partyType: FinancePartyType, id: string): Promise<FinancePartyLookup> {
  if (partyType === "Customer") {
    const x = await getCustomer(id);
    return { id: x.id, code: x.customerCode, name: x.customerName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId };
  }
  if (partyType === "Vendor") {
    const x = await getVendor(id);
    return { id: x.id, code: x.vendorCode, name: x.vendorName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId };
  }
  if (partyType === "Agent") {
    const x = await getAgent(id);
    return { id: x.id, code: x.agentCode, name: x.agentName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId };
  }
  const x = await getCarrier(id);
  return { id: x.id, code: x.carrierCode, name: x.carrierName, phone: x.phone, email: x.email, defaultCurrencyId: x.defaultCurrencyId };
}

function partyLabel(party: FinancePartyLookup) {
  return `${party.code} - ${party.name}${party.phone ? ` - ${party.phone}` : ""}`;
}
