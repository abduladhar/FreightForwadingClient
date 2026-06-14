import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/app/i18n";
import { getActiveCountriesForDropdown } from "@/api/countryApi";
import { Input } from "@/components/ui/input";

export function CountrySelect({
  value,
  onChange,
  placeholder,
  noResultsText,
  className
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  noResultsText?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const translatedPlaceholder = placeholder ?? t("Currency.SearchCountry", "Search country");
  const translatedNoResultsText = noResultsText ?? t("Currency.NoCountriesFound", "No countries found");
  const countries = useQuery({
    queryKey: ["country-dropdown"],
    queryFn: () => getActiveCountriesForDropdown()
  });
  const options = (countries.data ?? []).map((country) => ({
    value: country.name,
    label: `${country.countryCode} - ${country.name}`
  }));

  if (value && !options.some((option) => option.value === value)) {
    options.unshift({ value, label: value });
  }

  const selected = options.find((option) => option.value === value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(selected?.label ?? value);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setText(selected?.label ?? value);
  }, [selected?.label, value]);

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
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <Input
        value={text}
        placeholder={countries.isLoading ? t("Common.Loading", "Loading...") : translatedPlaceholder}
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
            setText(options.find((option) => option.value === value)?.label ?? value);
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
              )) : <div className="px-3 py-2 text-sm text-slate-500">{translatedNoResultsText}</div>}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
