import { readFileSync, writeFileSync } from "node:fs";

const modules = {
  Vendor: [
    "frontend/src/modules/vendors/VendorListPage.tsx",
    "frontend/src/modules/vendors/VendorCreatePage.tsx",
    "frontend/src/modules/vendors/VendorEditPage.tsx",
    "frontend/src/modules/vendors/VendorViewPage.tsx",
    "frontend/src/modules/vendors/VendorForm.tsx"
  ],
  Agent: [
    "frontend/src/modules/agents/AgentListPage.tsx",
    "frontend/src/modules/agents/AgentCreatePage.tsx",
    "frontend/src/modules/agents/AgentEditPage.tsx",
    "frontend/src/modules/agents/AgentViewPage.tsx",
    "frontend/src/modules/agents/AgentForm.tsx",
    "frontend/src/modules/agents/AgentCommissionSettingsPage.tsx"
  ],
  Carrier: [
    "frontend/src/modules/carriers/CarrierListPage.tsx",
    "frontend/src/modules/carriers/CarrierCreatePage.tsx",
    "frontend/src/modules/carriers/CarrierEditPage.tsx",
    "frontend/src/modules/carriers/CarrierForm.tsx"
  ],
  Country: [
    "frontend/src/modules/countries/CountryListPage.tsx",
    "frontend/src/modules/countries/CountryCreatePage.tsx",
    "frontend/src/modules/countries/CountryEditPage.tsx",
    "frontend/src/modules/countries/CountryForm.tsx"
  ],
  PackageType: [
    "frontend/src/modules/packageTypes/PackageTypeListPage.tsx",
    "frontend/src/modules/packageTypes/PackageTypeCreatePage.tsx",
    "frontend/src/modules/packageTypes/PackageTypeEditPage.tsx",
    "frontend/src/modules/packageTypes/PackageTypeForm.tsx"
  ],
  ShippingPort: [
    "frontend/src/modules/shippingPorts/ShippingPortListPage.tsx",
    "frontend/src/modules/shippingPorts/ShippingPortCreatePage.tsx",
    "frontend/src/modules/shippingPorts/ShippingPortEditPage.tsx",
    "frontend/src/modules/shippingPorts/ShippingPortForm.tsx"
  ],
  JobType: [
    "frontend/src/modules/jobTypes/JobTypeListPage.tsx",
    "frontend/src/modules/jobTypes/JobTypeCreatePage.tsx",
    "frontend/src/modules/jobTypes/JobTypeEditPage.tsx",
    "frontend/src/modules/jobTypes/JobTypeForm.tsx"
  ],
  Warehouse: [
    "frontend/src/modules/warehouses/WarehouseListPage.tsx",
    "frontend/src/modules/warehouses/WarehouseCreatePage.tsx",
    "frontend/src/modules/warehouses/WarehouseEditPage.tsx",
    "frontend/src/modules/warehouses/WarehouseForm.tsx"
  ],
  ChargeHead: [
    "frontend/src/modules/chargeHeads/ChargeHeadListPage.tsx",
    "frontend/src/modules/chargeHeads/ChargeHeadCreatePage.tsx",
    "frontend/src/modules/chargeHeads/ChargeHeadEditPage.tsx",
    "frontend/src/modules/chargeHeads/ChargeHeadForm.tsx"
  ],
  TaxRule: [
    "frontend/src/modules/taxes/TaxRuleListPage.tsx",
    "frontend/src/modules/taxes/TaxRuleForm.tsx"
  ]
};

for (const [moduleName, files] of Object.entries(modules)) {
  for (const file of files) transform(file, moduleName);
}

function transform(file, moduleName) {
  let source = readFileSync(file, "utf8");
  if (!source.includes("@/modules/masterDataI18n")) {
    const importEnd = source.lastIndexOf("\nimport ");
    const lineEnd = source.indexOf("\n", importEnd + 1);
    source = `${source.slice(0, lineEnd + 1)}import { useMasterDataI18n } from "@/modules/masterDataI18n";\nimport { masterDataButtonClass, masterDataPanelClass, masterDataPanelContentClass } from "@/modules/masterDataUi";\n${source.slice(lineEnd + 1)}`;
  }

  if (!source.includes(`useMasterDataI18n("${moduleName}")`)) {
    const component = source.match(/export function \w+\(/);
    if (!component) throw new Error(`Component not found: ${file}`);
    const bodyStart = findFunctionBody(source, component.index);
    source = `${source.slice(0, bodyStart + 1)}\n  const m = useMasterDataI18n("${moduleName}");${source.slice(bodyStart + 1)}`;
  }

  source = source
    .replace(/<Field label="([^"]+)">/g, (_, label) => `<Field label={m("${escapeText(label)}")}>`)
    .replace(/header: "([^"]+)"/g, (_, label) => `header: m("${escapeText(label)}")`)
    .replace(/title="([^"]+)"/g, (_, label) => `title={m("${escapeText(label)}")}`)
    .replace(/description="([^"]+)"/g, (_, label) => `description={m("${escapeText(label)}")}`)
    .replace(/placeholder="([^"]+)"/g, (_, label) => `placeholder={m("${escapeText(label)}")}`)
    .replace(/confirmText="([^"]+)"/g, (_, label) => `confirmText={m("${escapeText(label)}")}`)
    .replace(/cancelText="([^"]+)"/g, (_, label) => `cancelText={m("${escapeText(label)}")}`)
    .replace(/>Saving\.\.\.<\/Button>/g, `>{m("Saving")}</Button>`)
    .replace(/\? "Saving\.\.\." : "([^"]+)"/g, (_, label) => `? m("Saving") : m("${escapeText(label)}")`)
    .replace(/> Active<\/label>/g, `> {m("Active")}</label>`)
    .replace(/>Select<\/option>/g, `>{m("Select")}</option>`)
    .replace(/>Select vendor type<\/option>/g, `>{m("Select Vendor Type")}</option>`)
    .replace(/>Select ledger<\/option>/g, `>{m("Select Ledger")}</option>`)
    .replace(/>Loading\.\.\.<\/p>/g, `>{m("Loading")}</p>`)
    .replace(/<Card>/g, `<Card className={masterDataPanelClass}>`)
    .replace(/<CardContent className="pt-6">/g, `<CardContent className={masterDataPanelContentClass}>`)
    .replace(/<CardContent className="space-y-4 pt-6">/g, `<CardContent className={\`\${masterDataPanelContentClass} space-y-4\`}>`)
    .replace(/<Button(?![^>]*className=)/g, `<Button className={masterDataButtonClass}`)
    .replace(/<PermissionButton(?![^>]*className=)/g, `<PermissionButton className={masterDataButtonClass}`);

  const literalReplacements = [
    [" /> New Vendor</Link>", ` /> {m("New Vendor")}</Link>`],
    [" /> New Agent</Link>", ` /> {m("New Agent")}</Link>`],
    [" /> New Carrier</Link>", ` /> {m("New Carrier")}</Link>`],
    [" /> New Country</Link>", ` /> {m("New Country")}</Link>`],
    [" /> New Package Type</Link>", ` /> {m("New Package Type")}</Link>`],
    [" /> New Shipping Port</Link>", ` /> {m("New Shipping Port")}</Link>`],
    [" /> New Job Type</Link>", ` /> {m("New Job Type")}</Link>`],
    [" /> New Warehouse</Link>", ` /> {m("New Warehouse")}</Link>`],
    [" /> New Charge Head</Link>", ` /> {m("New Charge Head")}</Link>`],
    [">Save Vendor</Button>", `>{m("Save Vendor")}</Button>`],
    [">Save Agent</Button>", `>{m("Save Agent")}</Button>`],
    [">Save Carrier</Button>", `>{m("Save Carrier")}</Button>`],
    [">Save Country</Button>", `>{m("Save Country")}</Button>`],
    [">Save Package Type</Button>", `>{m("Save Package Type")}</Button>`],
    [">Save Shipping Port</Button>", `>{m("Save Shipping Port")}</Button>`],
    [">Save Job Type</Button>", `>{m("Save Job Type")}</Button>`],
    [">Save Warehouse</Button>", `>{m("Save Warehouse")}</Button>`],
    [">Save Charge Head</Button>", `>{m("Save Charge Head")}</Button>`],
    [">Save Tax Rule</Button>", `>{m("Save Tax Rule")}</Button>`],
    [">Edit</Link>", `>{m("Edit")}</Link>`],
    [">Commission Settings</Link>", `>{m("Commission Settings")}</Link>`],
    [">Recoverable</label>", `>{m("Recoverable")}</label>`],
    [">Hide Form", `>{m("Hide Form")}`],
    [">New Tax Rule", `>{m("New Tax Rule")}`],
    [">Deactivate</Button>", `>{m("Deactivate")}</Button>`],
    [">Activate</Button>", `>{m("Activate")}</Button>`]
  ];
  for (const [from, to] of literalReplacements) source = source.replaceAll(from, to);

  writeFileSync(file, source, "utf8");
}

function findFunctionBody(source, start) {
  let parentheses = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === "(") parentheses += 1;
    else if (source[index] === ")") parentheses -= 1;
    else if (source[index] === "{" && parentheses === 0) return index;
  }
  throw new Error("Function body not found.");
}

function escapeText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}
