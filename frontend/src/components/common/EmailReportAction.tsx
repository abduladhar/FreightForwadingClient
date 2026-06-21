import { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { saveEmailHtmlDraft } from "@/utils/emailHtmlDraft";
import { lt } from "@/modules/operationsLocalization";

const emailStyleProperties = [
  "background-color",
  "border",
  "border-bottom",
  "border-collapse",
  "border-color",
  "border-left",
  "border-radius",
  "border-right",
  "border-spacing",
  "border-top",
  "box-sizing",
  "color",
  "display",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-template-columns",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-width",
  "min-width",
  "object-fit",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "table-layout",
  "text-align",
  "text-decoration",
  "text-transform",
  "vertical-align",
  "white-space",
  "width"
] as const;

export function EmailReportAction({
  subject,
  reportName,
  module,
  getHtml,
  defaultEmail
}: {
  subject: string;
  reportName: string;
  module: string;
  getHtml: () => string;
  defaultEmail?: string | null;
}) {
  const [isPreparing, setIsPreparing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function openForm() {
    setIsPreparing(true);
    const htmlBody = inlineReportStyles(getHtml());
    if (!htmlBody.trim()) {
      setIsPreparing(false);
      toast.error(lt("Report unavailable"), lt("Report content is not ready to email."));
      return;
    }

    saveEmailHtmlDraft({
      emailTo: defaultEmail ?? "",
      subject,
      reportName,
      module,
      body: `Dear Sir/Madam,\n\nPlease find below ${reportName}.\n\nRegards,`,
      htmlBody
    });
    navigate("/reports/email-html");
    setIsPreparing(false);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => void openForm()} disabled={isPreparing}>
      <Mail className="h-4 w-4" />{isPreparing ? lt("Preparing...") : lt("Email HTML")}
    </Button>
  );
}

export function inlineReportStyles(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const root = template.content.firstElementChild;
  if (!root) return html;

  const sourceRoot = findMatchingLiveElement(root);
  if (sourceRoot) {
    copyComputedStyles(sourceRoot, root);
    makeEmailSafeLayout(root);
    normalizeEmailRoot(root, sourceRoot);
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;font-family:Arial,Helvetica,sans-serif;color:#172033;border-collapse:collapse;">
      <tr>
        <td style="padding:0;">
          ${template.innerHTML}
        </td>
      </tr>
    </table>
  `;
}

function findMatchingLiveElement(clonedRoot: Element) {
  if (clonedRoot.id) {
    return document.getElementById(clonedRoot.id);
  }

  const candidates = Array.from(document.querySelectorAll(clonedRoot.tagName.toLowerCase()));
  const exactMatch = candidates.find((candidate) => normalizeHtml(candidate.outerHTML) === normalizeHtml(clonedRoot.outerHTML));
  if (exactMatch) return exactMatch;

  const clonedText = normalizeText(clonedRoot.textContent);
  return candidates.find((candidate) => normalizeText(candidate.textContent) === clonedText) ?? null;
}

function copyComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const targetStyle = (target as HTMLElement | SVGElement).style;
  targetStyle.cssText = "";
  for (const property of emailStyleProperties) {
    const value = computed.getPropertyValue(property);
    if (value && isSafeEmailStyleValue(value)) {
      targetStyle.setProperty(property, value);
    }
  }

  if (target.tagName === "IMG") {
    const sourceImage = source as HTMLImageElement;
    const targetImage = target as HTMLImageElement;
    targetImage.src = absoluteUrl(sourceImage.src);
    const width = sourceImage.clientWidth || sourceImage.naturalWidth;
    const height = sourceImage.clientHeight || sourceImage.naturalHeight;
    if (width > 0) {
      targetImage.width = width;
      targetImage.style.width = `${width}px`;
      targetImage.style.maxWidth = "100%";
    }
    if (height > 0) {
      targetImage.height = height;
      targetImage.style.height = `${height}px`;
    }
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  for (let index = 0; index < targetChildren.length; index += 1) {
    const sourceChild = sourceChildren[index];
    const targetChild = targetChildren[index];
    if (sourceChild && targetChild) {
      copyComputedStyles(sourceChild, targetChild);
    }
  }
}

function isSafeEmailStyleValue(value: string) {
  return !/[<>{}]/.test(value);
}

function makeEmailSafeLayout(root: Element) {
  const elements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of elements) {
    if (!(element instanceof HTMLElement)) continue;
    normalizeEmailElementStyle(element);

    const display = element.style.display;
    if (display === "grid" || display === "inline-grid") {
      convertGridToEmailTable(element);
      continue;
    }

    if (display === "flex" || display === "inline-flex") {
      convertFlexToEmailBlock(element);
    }
  }
}

function normalizeEmailElementStyle(element: HTMLElement) {
  element.style.position = "static";
  element.style.transform = "";
  element.style.overflow = "visible";
  element.style.textOverflow = "";
  element.style.wordBreak = "normal";
  element.style.overflowWrap = "break-word";

  if (element.tagName !== "IMG") {
    element.style.height = "";
    element.style.minHeight = "";
    element.style.maxHeight = "";
  }

  if (element.tagName === "P") {
    element.style.display = "block";
    element.style.marginTop = "0";
    element.style.marginBottom = "6px";
    element.style.height = "";
    element.style.lineHeight = element.style.lineHeight || "1.45";
  }
}

function normalizeEmailRoot(root: Element, sourceRoot: Element) {
  if (!(root instanceof HTMLElement)) return;
  const width = emailReportWidth(sourceRoot);
  root.style.width = `${width}px`;
  root.style.maxWidth = "100%";
  root.style.margin = "0";
  root.style.marginLeft = "0";
  root.style.marginRight = "0";
  root.style.boxSizing = "border-box";
}

function convertGridToEmailTable(element: HTMLElement) {
  const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  if (!children.length) return;

  const columnCount = inferColumnCount(element, children);
  const columnWidths = inferColumnWidths(element, columnCount);
  const columnWidth = `${(100 / columnCount).toFixed(4)}%`;
  const tableWidth = inferTableWidth(element, children);
  const table = document.createElement("table");
  table.style.cssText = element.style.cssText;
  table.style.display = "table";
  table.style.width = `${tableWidth}px`;
  table.style.maxWidth = "none";
  table.style.marginLeft = "0";
  table.style.marginRight = "0";
  table.style.tableLayout = "fixed";
  table.style.borderCollapse = "collapse";
  table.style.borderSpacing = "0";
  table.style.gap = "";
  table.style.gridTemplateColumns = "";
  table.setAttribute("width", String(tableWidth));
  table.setAttribute("cellpadding", "0");
  table.setAttribute("cellspacing", "0");
  table.setAttribute("role", "presentation");

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  children.forEach((child, index) => {
    const rowIndex = Math.floor(index / columnCount);
    let row = tbody.children.item(rowIndex) as HTMLTableRowElement | null;
    if (!row) {
      row = document.createElement("tr");
      tbody.appendChild(row);
    }

    const cell = document.createElement("td");
    const width = columnWidths?.[index % columnCount] ?? columnWidth;
    cell.style.width = width;
    cell.style.verticalAlign = "top";
    cell.style.padding = "0";
    cell.style.boxSizing = "border-box";
    cell.style.height = "";
    cell.style.minHeight = "";
    cell.style.maxHeight = "";
    cell.style.overflow = "visible";
    cell.setAttribute("width", width);
    cell.setAttribute("valign", "top");
    cell.appendChild(child);
    row.appendChild(cell);
  });

  element.replaceWith(table);
}

function convertFlexToEmailBlock(element: HTMLElement) {
  const children = Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
  element.style.display = "block";
  element.style.width = element.style.width || "100%";
  children.forEach((child) => {
    child.style.display = child.tagName === "IMG" ? "inline-block" : "block";
    child.style.maxWidth = child.style.maxWidth || "100%";
  });
}

function inferColumnCount(element: HTMLElement, children: HTMLElement[]) {
  const templateColumns = element.style.gridTemplateColumns.trim();
  if (templateColumns && templateColumns !== "none") {
    const columns = templateColumns.match(/(?:minmax\([^)]+\)|[^\s]+)/g);
    if (columns?.length) return columns.length;
  }
  return children.length > 2 ? Math.min(children.length, 3) : Math.max(children.length, 1);
}

function inferColumnWidths(element: HTMLElement, columnCount: number) {
  const templateColumns = element.style.gridTemplateColumns.trim();
  if (!templateColumns || templateColumns === "none") return null;

  const columns = templateColumns.match(/(?:minmax\([^)]+\)|[^\s]+)/g);
  if (!columns || columns.length !== columnCount) return null;

  const pixelValues = columns.map((column) => Number.parseFloat(column.replace(/[^\d.]/g, "")));
  if (pixelValues.some((value) => !Number.isFinite(value) || value <= 0)) return null;
  const total = pixelValues.reduce((sum, value) => sum + value, 0);
  return pixelValues.map((value) => `${((value / total) * 100).toFixed(4)}%`);
}

function inferTableWidth(element: HTMLElement, children: HTMLElement[]) {
  const ownWidth = pixelValue(element.style.width);
  if (ownWidth && ownWidth > 0) return Math.min(760, Math.max(320, ownWidth));

  const childWidths = children
    .map((child) => pixelValue(child.style.width))
    .filter((value): value is number => Boolean(value && value > 0));
  if (childWidths.length) {
    return Math.min(760, Math.max(320, childWidths.reduce((sum, value) => sum + value, 0)));
  }

  return 720;
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
}

function pixelValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : null;
}

function emailReportWidth(sourceRoot: Element) {
  const width = sourceRoot instanceof HTMLElement ? sourceRoot.getBoundingClientRect().width : 720;
  if (!Number.isFinite(width) || width <= 0) return 720;
  return Math.min(760, Math.max(620, Math.round(width)));
}

function normalizeHtml(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeText(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}
