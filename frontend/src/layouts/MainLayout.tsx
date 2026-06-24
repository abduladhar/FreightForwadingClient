import { Bell, ChevronDown, ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useI18n } from "@/app/i18n";
import { useAuth } from "@/auth/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BranchSelector } from "@/components/common/BranchSelector";
import { CurrencySelector } from "@/components/common/CurrencySelector";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { TenantSelector } from "@/components/common/TenantSelector";
import { useBranch } from "@/hooks/useBranch";
import { useCurrency } from "@/hooks/useCurrency";
import { useLanguage } from "@/hooks/useLanguage";
import { useTenant } from "@/hooks/useTenant";
import { useWorkspace } from "@/hooks/useWorkspace";
import { navigationGroups, primaryNavigation } from "@/layouts/navigation";
import { lt } from "@/modules/operationsLocalization";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";
import { cn } from "@/utils/cn";

export function MainLayout() {
  const { session, hasPermission, signOut } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const workspace = useWorkspace();
  const tenant = useTenant();
  const branch = useBranch();
  const language = useLanguage();
  const currency = useCurrency();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    masters: true,
    operations: true,
    shipments: true
  });
  const tenantOptions = (tenant.options.length
    ? tenant.options
    : [{ id: workspace.tenantCode, code: workspace.tenantCode, name: workspace.tenantCode }]
  ).map((item) => ({ code: item.code, label: `${item.code} - ${item.name}` }));
  const branchOptions = (branch.options.length
    ? branch.options
    : [{ id: workspace.branchId ?? "default", code: workspace.branchName, name: workspace.branchName }]
  ).map((item) => ({ id: item.id, label: `${item.code} - ${item.name}` }));
  const languageOptions = (language.options.length
    ? language.options
    : [{ code: workspace.languageCode, cultureCode: workspace.cultureCode, name: workspace.languageCode, direction: "LTR" }]
  ).map((item) => ({ code: item.code, culture: item.cultureCode, label: item.name }));
  const currencyOptions = currency.options.length ? currency.options.map((item) => item.code) : [workspace.baseCurrency];
  const currentItem = findBestNavigationItem(primaryNavigation, location.pathname);
  const currentGroup = navigationGroups.find((group) => getGroupItems(group).some((item) => item.id === currentItem?.id));

  function clearMenuSearchDomValue() {
    if (!searchInputRef.current) return;
    searchInputRef.current.value = "";
  }

  useEffect(() => {
    setSearch("");
    clearMenuSearchDomValue();
    const timers = [50, 250, 750].map((delay) => window.setTimeout(clearMenuSearchDomValue, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [location.pathname]);

  useEffect(() => {
    if (search === "") clearMenuSearchDomValue();
  }, [search]);

  useEffect(() => {
    if (!currentGroup) return;
    setExpandedGroups((prev) => (prev[currentGroup.id] ? prev : { ...prev, [currentGroup.id]: true }));
  }, [currentGroup]);

  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    return navigationGroups
      .map((group) => {
        const items = (group.items ?? []).filter((item) => {
          if (!hasPermission(item.permission)) return false;
          if (!query) return true;
          const label = lt(t(`Navigation.${group.id}.Item.${item.id}.Label`, item.label));
          const description = lt(t(`Navigation.${group.id}.Item.${item.id}.Description`, item.description));
          return label.toLowerCase().includes(query) || description.toLowerCase().includes(query);
        });
        const sections = (group.sections ?? [])
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => {
              if (!hasPermission(item.permission)) return false;
              if (!query) return true;
              const label = lt(t(`Navigation.${group.id}.Item.${item.id}.Label`, item.label));
              const description = lt(t(`Navigation.${group.id}.Item.${item.id}.Description`, item.description));
              return label.toLowerCase().includes(query) || description.toLowerCase().includes(query);
            })
          }))
          .filter((section) => section.items.length > 0);
        return { ...group, items, sections };
      })
      .filter((group) => (group.items?.length ?? 0) > 0 || (group.sections?.length ?? 0) > 0);
  }, [hasPermission, search, t]);

  const searching = search.trim().length > 0;

  function applyBranch(branchId: string) {
    branch.setBranch(branchId);
  }

  function applyLanguage(languageCode: string) {
    language.setLanguage(languageCode);
  }

  function handleMenuClick(event: MouseEvent<HTMLAnchorElement>, path: string) {
    setIsMobileMenuOpen(false);
    setSearch("");
    const refreshEvents: Record<string, string> = {
      "/invoices": "invoices:refresh",
      "/vendor-bills": "vendor-bills:refresh",
      "/receipts": "customer-receipts:refresh",
      "/payments": "vendor-payments:refresh"
    };
    const refreshEvent = refreshEvents[path];
    if (refreshEvent && location.pathname === path) {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(refreshEvent));
      return;
    }
    if (path === "/master-shipments") {
      if (location.pathname.startsWith("/master-shipments")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("master-shipments:refresh"));
      }
      return;
    }
    if (path === "/house-shipments") {
      if (location.pathname.startsWith("/house-shipments")) {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("house-shipments:refresh"));
      }
      return;
    }
    if (path !== "/house-shipments") {
      return;
    }
  }

  return (
    <div className="app-shell flex min-h-screen max-w-full overflow-x-hidden bg-slate-100 text-slate-900">
      <aside
        className={cn(
          "app-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-slate-950 text-slate-100 transition-transform rtl:left-auto rtl:right-0 rtl:border-l rtl:border-r-0 lg:relative lg:inset-auto lg:min-h-screen lg:translate-x-0 lg:rtl:border-l-0 lg:rtl:border-r",
          isCollapsed && "lg:w-20",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 font-bold">FF</div>
            {!isCollapsed ? (
              <div>
                <p className="text-sm font-semibold">{t("Layout.FreightErp", "Freight ERP")}</p>
                <p className="text-xs text-slate-400">{t("Layout.ForwardingSuite", "Forwarding Suite")}</p>
              </div>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("border-b border-white/10 p-3", isCollapsed && "lg:hidden")}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 rtl:left-auto rtl:right-3" />
            <Input
              ref={searchInputRef}
              type="search"
              value={search}
              id="ff-nav-query"
              onChange={(event) => {
                const nextValue = event.target.value;
                if (search === "" && nextValue === "admin" && !event.nativeEvent.isTrusted) {
                  clearMenuSearchDomValue();
                  return;
                }
                setSearch(nextValue);
              }}
              onFocus={() => {
                if (search === "") window.setTimeout(clearMenuSearchDomValue, 0);
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              name="ff-nav-query"
              inputMode="search"
              className="border-white/15 bg-slate-900 pl-9 text-sm text-slate-100 placeholder:text-slate-400 rtl:pl-3 rtl:pr-9"
              placeholder={`${t("Layout.MenuSearchPlaceholder", "Search menu")}...`}
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-visible px-2 py-4">
          {visibleGroups.map((group) => (
            <div key={group.id} className="mb-4">
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-start text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                >
                  <span>{lt(t(`Navigation.${group.id}.Label`, group.label))}</span>
                  <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", (searching || expandedGroups[group.id]) && "rotate-90")} />
                </button>
              ) : null}
              {(isCollapsed || searching || expandedGroups[group.id]) ? (
                <div className="mt-1 space-y-1">
                  {(group.items ?? []).map((item) => renderNavigationItem(item, group.id, isCollapsed, location.pathname, handleMenuClick, t))}
                  {(group.sections ?? []).map((section) => (
                    <div key={section.id} className={cn("space-y-1", !isCollapsed && "pt-2")}>
                      {!isCollapsed ? (
                        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                          {lt(t(`Navigation.${group.id}.Section.${section.id}.Label`, section.label))}
                        </p>
                      ) : null}
                      {section.items.map((item) => renderNavigationItem(item, group.id, isCollapsed, location.pathname, handleMenuClick, t))}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 text-xs text-slate-400">
          <p>{workspace.tenantCode} / {workspace.branchName}</p>
          {!isCollapsed ? <p>{workspace.financialYear} / {workspace.baseCurrency} / {workspace.languageCode}</p> : null}
        </div>
      </aside>

      {isMobileMenuOpen ? <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hidden lg:inline-flex" onClick={() => setIsCollapsed((value) => !value)}>
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
            <div className="hidden min-w-0 flex-1 items-center gap-2 xl:flex">
              <TenantSelector value={workspace.tenantCode} options={tenantOptions} onChange={tenant.setTenant} />
              <BranchSelector value={workspace.branchId} options={branchOptions} onChange={applyBranch} />
              <LanguageSelector value={workspace.languageCode} options={languageOptions} onChange={applyLanguage} />
              <CurrencySelector value={workspace.baseCurrency} options={currencyOptions} onChange={currency.setCurrency} />
            </div>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="hidden h-8 md:block" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar>
                      <AvatarFallback>{initials(session?.displayName ?? "ERP User")}</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-start md:block">
                      <span className="block text-sm font-semibold">{session?.displayName}</span>
                      <span className="block text-xs text-muted-foreground">{session?.roleName}</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>{t("Layout.Profile", "Profile")}</DropdownMenuItem>
                  <DropdownMenuItem>{t("Layout.Notifications", "Notifications")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut()}>{t("Layout.Logout", "Logout")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 xl:hidden">
            <TenantSelector value={workspace.tenantCode} options={tenantOptions} onChange={tenant.setTenant} />
            <BranchSelector value={workspace.branchId} options={branchOptions} onChange={applyBranch} />
            <LanguageSelector value={workspace.languageCode} options={languageOptions} onChange={applyLanguage} />
            <CurrencySelector value={workspace.baseCurrency} options={currencyOptions} onChange={currency.setCurrency} />
          </div>
        </header>
        <main className="app-page min-w-0 flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-1">
            <Breadcrumbs />
          </div>
          {currentItem ? (
            <p className="text-sm text-slate-600">
              {lt(t(`Navigation.${currentGroup?.id ?? "unknown"}.Item.${currentItem.id}.Label`, currentItem.label))}
            </p>
          ) : null}
          <div className="app-route-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGroupItems(group: NavigationGroup) {
  return [
    ...(group.items ?? []),
    ...(group.sections ?? []).flatMap((section) => section.items)
  ];
}

function findBestNavigationItem(items: NavigationItem[], pathname: string) {
  return items
    .filter((item) => isNavigationItemActive(item.path, pathname))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

function isNavigationItemActive(itemPath: string, pathname: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function renderNavigationItem(
  item: NavigationItem,
  groupId: string,
  isCollapsed: boolean,
  pathname: string,
  handleMenuClick: (event: MouseEvent<HTMLAnchorElement>, path: string) => void,
  t: (key: string, fallback?: string) => string
) {
  const isCurrent = findBestNavigationItem(primaryNavigation, pathname)?.id === item.id;
  return (
    <NavLink
      key={item.id}
      to={item.path}
      end
      onClick={(event) => handleMenuClick(event, item.path)}
      className={() =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white",
          isCurrent && "bg-blue-500 text-white",
          isCollapsed && "justify-center px-0"
        )
      }
      title={lt(t(`Navigation.${groupId}.Item.${item.id}.Label`, item.label))}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!isCollapsed ? <span className="truncate">{lt(t(`Navigation.${groupId}.Item.${item.id}.Label`, item.label))}</span> : null}
    </NavLink>
  );
}
