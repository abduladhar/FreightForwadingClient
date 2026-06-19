import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/app/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import type { ShippingPortRequest } from "@/api/shippingPortApi";
import { useMasterDataI18n } from "@/modules/masterDataI18n";
import { masterDataButtonClass } from "@/modules/masterDataUi";

export function ShippingPortForm({
  initialValue,
  isSubmitting,
  onSubmit
}: {
  initialValue?: ShippingPortRequest | null;
  isSubmitting?: boolean;
  onSubmit: (value: ShippingPortRequest) => Promise<void>;
}) {
  const m = useMasterDataI18n("ShippingPort");
  const { t } = useI18n();
  const [value, setValue] = useState<ShippingPortRequest>(
    initialValue ?? {
      portCode: "",
      portName: "",
      countryGuid: "",
      countryName: "",
      portType: "Sea",
      isActive: true
    }
  );
  const countries = useQuery({
    queryKey: ["shipping-port-country-dropdown"],
    queryFn: () => getActiveCountriesForDropdown()
  });
  const countryOptions = (countries.data ?? []).map((country) => ({
    value: country.id,
    label: `${country.countryCode} - ${country.name}`,
    name: country.name
  }));

  if (value.countryGuid && !countryOptions.some((country) => country.value === value.countryGuid)) {
    countryOptions.unshift({
      value: value.countryGuid,
      label: value.countryName,
      name: value.countryName
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label={m("Port Code")}>
        <Input value={value.portCode} onChange={(event) => setValue({ ...value, portCode: event.target.value })} placeholder={m("INNSA")} />
      </Field>
      <Field label={m("Port Name")}>
        <Input value={value.portName} onChange={(event) => setValue({ ...value, portName: event.target.value })} placeholder={m("Nhava Sheva (JNPT)")} />
      </Field>
      <Field label={m("Country")}>
        <FilterableCountrySelect
          value={value.countryGuid}
          options={countryOptions}
          placeholder={countries.isLoading ? t("Common.Loading", "Loading...") : t("Currency.SearchCountry", "Search country")}
          noResultsText={t("Currency.NoCountriesFound", "No countries found")}
          onChange={(countryGuid) => {
            const selectedCountry = countryOptions.find((country) => country.value === countryGuid);
            setValue({
              ...value,
              countryGuid,
              countryName: selectedCountry?.name ?? ""
            });
          }}
        />
      </Field>
      <Field label={m("Port Type")}>
        <select
          className="h-10 w-full rounded-md border px-3 text-sm"
          value={value.portType}
          onChange={(event) => setValue({ ...value, portType: event.target.value })}
        >
          <option value="Sea">{m("Sea")}</option>
          <option value="Air">{m("Air")}</option>
          <option value="Road">{m("Road")}</option>
          <option value="Courier">{m("Courier")}</option>
          <option value="Inland">{m("Inland")}</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input type="checkbox" checked={value.isActive} onChange={(event) => setValue({ ...value, isActive: event.target.checked })} />
        {m("Active")}
      </label>
      <div className="md:col-span-2">
        <Button className={masterDataButtonClass} onClick={() => void onSubmit(value)} disabled={isSubmitting}>
          {isSubmitting ? m("Saving") : m("Save Shipping Port")}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function FilterableCountrySelect({
  value,
  onChange,
  options,
  placeholder,
  noResultsText
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; name: string }>;
  placeholder: string;
  noResultsText: string;
}) {
  const selected = options.find((option) => option.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? "");
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setText(selected?.label ?? "");
  }, [selected?.label]);

  function openMenu(resetSearch = false) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuStyle({
        position: "fixed",
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 1000
      });
    }
    if (resetSearch) setText("");
    setOpen(true);
  }

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(text.trim().toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={text}
        placeholder={placeholder}
        className="pr-9"
        onFocus={() => openMenu(true)}
        onChange={(event) => {
          setText(event.target.value);
          openMenu();
          if (!event.target.value.trim()) onChange("");
        }}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            setText(options.find((option) => option.value === value)?.label ?? "");
          }, 120);
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
        onMouseDown={(event) => {
          event.preventDefault();
          if (open) setOpen(false);
          else openMenu(true);
        }}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="max-h-64 overflow-auto rounded-md border bg-white shadow-lg" style={menuStyle}>
              {filtered.length ? filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-sky-50 ${option.value === value ? "bg-sky-100 text-sky-800" : ""}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(option.value);
                    setText(option.label);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              )) : <div className="px-3 py-2 text-sm text-slate-500">{noResultsText}</div>}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
