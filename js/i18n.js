// Language support. Chinese (Simplified) is the default; the choice is remembered per browser.
// Add a language by adding a block to STRINGS and a code to LANGS.
window.HVI18n = (() => {
  const LANGS = ["zh", "en"];
  const DEFAULT = "zh";
  const HTML_LANG = { zh: "zh-CN", en: "en" };
  const STORE_KEY = "hv-lang";

  const STRINGS = {
    zh: {
      siteName: "欢乐小镇桌游",
      tagline: "找桌游、学规则、看教学视频。",
      searchPlaceholder: "搜索桌游，例如：策略、派对、卡牌……",
      searchLabel: "搜索桌游",
      tagFilterLabel: "按标签筛选",
      all: "全部",
      loading: "正在加载桌游……",
      noMatch: "没有找到符合条件的桌游。",
      loadError: "无法加载桌游列表",
      fileProtocol: "请通过网页服务器打开本网站（见 README），不要直接双击 index.html。",
      close: "关闭",
      video: "视频",
      openIn: "在 {site} 中打开",
      players: "{v} 人",
      playtime: "{v} 分钟/人",
      age: "{v} 岁以上",
      footer: "欢乐小镇桌游 · 活动与报名功能即将推出",
      toggle: "EN",
      toggleLabel: "Switch to English",
    },
    en: {
      siteName: "Happy Village Board Games",
      tagline: "Find a game, learn the rules, watch how it's played.",
      searchPlaceholder: "Search games, e.g. strategy, party, cards…",
      searchLabel: "Search games",
      tagFilterLabel: "Filter by tag",
      all: "All",
      loading: "Loading games…",
      noMatch: "No games match your search.",
      loadError: "Could not load games",
      fileProtocol: "Open this site through a web server (see README), not by double-clicking index.html.",
      close: "Close",
      video: "Video",
      openIn: "open in {site}",
      players: "{v} players",
      playtime: "{v} min/player",
      age: "Ages {v}+",
      footer: "Happy Village Board Game Club · Events & registration coming soon",
      toggle: "中文",
      toggleLabel: "切换到中文",
    },
  };

  function readStored() {
    try {
      return localStorage.getItem(STORE_KEY);
    } catch {
      return null;
    }
  }

  // ?lang=en in the URL wins, so links can be shared in a specific language.
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let lang = [fromUrl, readStored()].find((l) => LANGS.includes(l)) || DEFAULT;
  const listeners = [];

  function t(key, vars = {}) {
    const s = STRINGS[lang][key] ?? STRINGS[DEFAULT][key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  }

  // Content fields may be a plain string or { zh: "...", en: "..." }.
  function loc(value) {
    if (value == null || typeof value !== "object") return value ?? "";
    return value[lang] || value[DEFAULT] || Object.values(value).find(Boolean) || "";
  }

  // Fills elements marked with data-i18n / data-i18n-placeholder / data-i18n-aria.
  function apply(root = document) {
    document.documentElement.lang = HTML_LANG[lang];
    root.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  }

  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch {}
    apply();
    listeners.forEach((fn) => fn(lang));
  }

  return {
    t,
    loc,
    apply,
    setLang,
    toggle: () => setLang(lang === "zh" ? "en" : "zh"),
    onChange: (fn) => listeners.push(fn),
    get lang() {
      return lang;
    },
  };
})();
