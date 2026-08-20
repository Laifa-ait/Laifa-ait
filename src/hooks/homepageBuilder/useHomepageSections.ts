import { useState, useCallback } from "react";
import { HomepageSection } from "../../domains/home/homepage.types";
import { normalizeTimestamp } from "../../utils/date";

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [searchSecProduct, setSearchSecProduct] = useState("");
  const [modalSearchCategory, setModalSearchCategory] = useState("");

  // Form states for Section
  const [secName, setSecName] = useState("");
  const [secType, setSecType] = useState<HomepageSection["type"]>("top_picks");
  const [secLayout, setSecLayout] = useState<HomepageSection["layout"]>("standard");
  const [secBackgroundColor, setSecBackgroundColor] = useState("#ffffff");
  const [secLimit, setSecLimit] = useState(8);
  const [secStyle, setSecStyle] = useState("premium");
  const [secTheme, setSecTheme] = useState<HomepageSection["theme"]>("none");
  const [secThemeName, setSecThemeName] = useState("");
  const [secThemeImage, setSecThemeImage] = useState("");
  const [secTag, setSecTag] = useState("");
  const [secCategory, setSecCategory] = useState("");
  const [secManualProducts, setSecManualProducts] = useState("");
  const [secTitle, setSecTitle] = useState("");
  const [secSubtitle, setSecSubtitle] = useState("");
  const [secIsActive, setSecIsActive] = useState(true);
  const [secStartDate, setSecStartDate] = useState("");
  const [secEndDate, setSecEndDate] = useState("");
  const [secManualLinks, setSecManualLinks] = useState<string[]>(Array(18).fill(""));
  const [secTargetAudience, setSecTargetAudience] = useState<HomepageSection["targetAudience"]>("all");
  const [secTargetRegions, setSecTargetRegions] = useState<string[]>([]);

  const resetSectionForm = useCallback(() => {
    setSecName("");
    setSecType("top_picks");
    setSecLayout("standard");
    setSecBackgroundColor("#ffffff");
    setSecLimit(8);
    setSecStyle("premium");
    setSecTheme("none");
    setSecThemeName("");
    setSecThemeImage("");
    setSecTag("");
    setSecCategory("");
    setSecManualLinks(Array(18).fill(""));
    setSecManualProducts("");
    setSecTitle("");
    setSecSubtitle("");
    setSecIsActive(true);
    setSecStartDate("");
    setSecEndDate("");
    setSecTargetAudience("all");
    setSecTargetRegions([]);
  }, []);

  const populateSectionForm = useCallback((item: HomepageSection) => {
    setSecName(item.name || "");
    setSecType(item.type || "top_picks");
    setSecLayout(item.layout || "standard");
    setSecBackgroundColor(item.backgroundColor || "#ffffff");
    setSecLimit(item.limit || 8);
    setSecStyle(item.style || "premium");
    setSecTheme(item.theme || "none");
    setSecThemeName(item.themeName || "");
    setSecThemeImage(item.themeImage || "");
    setSecTag(item.tag || "");
    setSecCategory(item.category || "");
    const links = item.manualProducts || [];
    setSecManualLinks(Array.from({ length: 18 }, (_, i) => links[i] || ""));
    setSecManualProducts(links.join(", "));
    setSecTitle(item.title || "");
    setSecSubtitle(item.subtitle || "");
    setSecIsActive(item.isActive !== false);
    setSecStartDate(item.startDate ? (typeof item.startDate === "string" ? item.startDate : normalizeTimestamp(item.startDate).toDate().toISOString().slice(0, 10)) : "");
    setSecEndDate(item.endDate ? (typeof item.endDate === "string" ? item.endDate : normalizeTimestamp(item.endDate).toDate().toISOString().slice(0, 10)) : "");
    setSecTargetAudience(item.targetAudience || "all");
    setSecTargetRegions(item.targetRegions || []);
  }, []);

  return {
    sections,
    setSections,
    searchSecProduct,
    setSearchSecProduct,
    modalSearchCategory,
    setModalSearchCategory,
    secName,
    setSecName,
    secType,
    setSecType,
    secLayout,
    setSecLayout,
    secBackgroundColor,
    setSecBackgroundColor,
    secLimit,
    setSecLimit,
    secStyle,
    setSecStyle,
    secTheme,
    setSecTheme,
    secThemeName,
    setSecThemeName,
    secThemeImage,
    setSecThemeImage,
    secTag,
    setSecTag,
    secCategory,
    setSecCategory,
    secManualProducts,
    setSecManualProducts,
    secTitle,
    setSecTitle,
    secSubtitle,
    setSecSubtitle,
    secIsActive,
    setSecIsActive,
    secStartDate,
    setSecStartDate,
    secEndDate,
    setSecEndDate,
    secManualLinks,
    setSecManualLinks,
    secTargetAudience,
    setSecTargetAudience,
    secTargetRegions,
    setSecTargetRegions,
    resetSectionForm,
    populateSectionForm,
  };
}
