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
      difficulty: "{band} {v}",
      catFilterLabel: "按类型筛选",
      cat_euro: "德式游戏",
      cat_american: "美式游戏",
      cat_party: "聚会游戏",
      cat_euro_hint: "重策略和规划，运气成分少，玩家之间较少直接冲突。",
      cat_american_hint: "重主题和剧情，常有直接对抗、骰子和合作冒险。",
      cat_party_hint: "规则简单、节奏快，适合人多的时候一起玩。",
      cat_card: "卡牌游戏",
      cat_abstract: "抽象游戏",
      cat_family: "亲子游戏",
      cat_puzzle: "解谜游戏",
      cat_war: "战棋游戏",
      cat_roleplay: "角色扮演",
      cat_card_hint: "以卡牌为核心，包括组牌、出牌和合作卡牌游戏。",
      cat_abstract_hint: "主题较轻，重在图案、拼放和空间规划。",
      cat_family_hint: "适合大人和小朋友一起玩。",
      cat_puzzle_hint: "靠逻辑推理来解开谜题。",
      cat_war_hint: "指挥军队、正面交锋的对抗游戏。",
      cat_roleplay_hint: "扮演角色、推进剧情，例如剧本杀。",
      cat_other: "其他",
      cat_other_hint: "尚未分类的桌游。",
      band_light: "入门",
      "band_medium-light": "轻中度",
      "band_medium-heavy": "中重度",
      band_heavy: "重度",
      bandRange: "BGG 难度 {v}",
      count: "{n} 款",
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
      difficulty: "{band} {v}",
      catFilterLabel: "Filter by type",
      cat_euro: "Euro games",
      cat_american: "American-style games",
      cat_party: "Party games",
      cat_euro_hint: "Strategy and planning first, low luck, little direct conflict.",
      cat_american_hint: "Theme and story first, with direct conflict, dice and co-op adventures.",
      cat_party_hint: "Simple rules and quick turns, great for big groups.",
      cat_card: "Card games",
      cat_abstract: "Abstract games",
      cat_family: "Family & kids",
      cat_puzzle: "Puzzle games",
      cat_war: "War games",
      cat_roleplay: "Role-play",
      cat_card_hint: "Built around cards: deck building, hand play and co-op card games.",
      cat_abstract_hint: "Light on theme, focused on patterns, placement and spatial planning.",
      cat_family_hint: "Great for adults and children playing together.",
      cat_puzzle_hint: "Solve the puzzle with logic and deduction.",
      cat_war_hint: "Command armies in head-to-head battles.",
      cat_roleplay_hint: "Play a character and drive a story, like murder-mystery scripts.",
      cat_other: "Other",
      cat_other_hint: "Games not yet categorised.",
      band_light: "Light",
      "band_medium-light": "Medium-light",
      "band_medium-heavy": "Medium-heavy",
      band_heavy: "Heavy",
      bandRange: "BGG weight {v}",
      count: "{n} games",
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
