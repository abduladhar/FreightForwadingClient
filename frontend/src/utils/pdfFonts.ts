import { Font } from "@react-pdf/renderer";

const fontFamilies = {
  latin: "FreightPdfLatin",
  arabic: "FreightPdfArabic",
  devanagari: "FreightPdfDevanagari",
  chinese: "FreightPdfChinese"
} as const;

let registered = false;

export function ensurePdfFontsRegistered() {
  if (registered) return;

  Font.register({
    family: fontFamilies.latin,
    fonts: [
      { src: "/fonts/SegoeUI.ttf", fontWeight: 400 },
      { src: "/fonts/SegoeUI-Bold.ttf", fontWeight: 600 },
      { src: "/fonts/SegoeUI-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/SegoeUI-Bold.ttf", fontWeight: "bold" }
    ]
  });
  Font.register({
    family: fontFamilies.arabic,
    fonts: [
      { src: "/fonts/Dubai-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Dubai-Bold.ttf", fontWeight: 600 },
      { src: "/fonts/Dubai-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Dubai-Bold.ttf", fontWeight: "bold" }
    ]
  });
  Font.register({
    family: fontFamilies.devanagari,
    fonts: [
      { src: "/fonts/NirmalaUI.ttf", fontWeight: 400 },
      { src: "/fonts/NirmalaUI-Bold.ttf", fontWeight: 600 },
      { src: "/fonts/NirmalaUI-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/NirmalaUI-Bold.ttf", fontWeight: "bold" }
    ]
  });
  Font.register({
    family: fontFamilies.chinese,
    fonts: [
      { src: "/fonts/MicrosoftYaHei.ttf", fontWeight: 400 },
      { src: "/fonts/MicrosoftYaHei-Bold.ttf", fontWeight: 600 },
      { src: "/fonts/MicrosoftYaHei-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/MicrosoftYaHei-Bold.ttf", fontWeight: "bold" }
    ]
  });
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

export function getPdfFontFamily(cultureCode?: string) {
  ensurePdfFontsRegistered();
  const culture = (cultureCode || currentCultureCode()).toLowerCase();
  if (culture.startsWith("zh")) return fontFamilies.chinese;
  if (culture.startsWith("hi") || culture.startsWith("mr") || culture.startsWith("ne")) return fontFamilies.devanagari;
  if (culture.startsWith("ar") || culture.startsWith("fa") || culture.startsWith("ur")) return fontFamilies.arabic;
  return fontFamilies.latin;
}

function currentCultureCode() {
  if (typeof window === "undefined") return "en-US";
  const workspaceRaw = window.localStorage.getItem("ff.workspace.preferences");
  if (workspaceRaw) {
    try {
      const parsed = JSON.parse(workspaceRaw) as { cultureCode?: string };
      if (parsed.cultureCode) return parsed.cultureCode;
    } catch {
      // Ignore malformed preferences and fall through.
    }
  }
  const languageRaw = window.localStorage.getItem("ff.language.preference");
  if (languageRaw) {
    try {
      const parsed = JSON.parse(languageRaw) as { cultureCode?: string };
      if (parsed.cultureCode) return parsed.cultureCode;
    } catch {
      // Ignore malformed preferences and use English fallback.
    }
  }
  return "en-US";
}
