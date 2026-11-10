// Formatted text for event descriptions: a small editor (font, size, bold, italic, underline, strikethrough, colour,
// alignment, lists) and a cleaner that keeps only safe tags and a fixed set of styles. Descriptions are stored as
// that cleaned HTML; older plain-text descriptions are shown as before, with their line breaks.
// Everything shown on a page goes through clean(), so pasted or stored HTML can never run scripts.
window.HVRich = (() => {
  // Fonts most phones and computers have, with fallbacks (Mac / iPhone, Windows, Android).
  const FONTS = [
    { key: "", zh: "默认字体", en: "Default font", css: "" },
    { key: "sans", zh: "黑体", en: "Sans", css: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif' },
    { key: "serif", zh: "宋体", en: "Serif", css: '"Songti SC", SimSun, "Noto Serif SC", serif' },
    { key: "kai", zh: "楷体", en: "Kaiti", css: '"Kaiti SC", STKaiti, KaiTi, serif' },
    { key: "round", zh: "圆体", en: "Rounded", css: '"Yuanti SC", YouYuan, "Varela Round", sans-serif' },
    { key: "mono", zh: "等宽", en: "Monospace", css: 'ui-monospace, Consolas, "Courier New", monospace' },
  ];
  // execCommand("fontSize") levels → the CSS sizes the browser writes.
  const SIZES = [
    { level: "2", css: "small", zh: "小字", en: "Small" },
    { level: "3", css: "medium", zh: "正常", en: "Normal" },
    { level: "5", css: "x-large", zh: "大字", en: "Large" },
    { level: "6", css: "xx-large", zh: "特大", en: "Huge" },
  ];
  const SIZE_OK = { "x-small": "small", small: "small", medium: "medium", large: "large", "x-large": "x-large", "xx-large": "xx-large", "xxx-large": "xx-large" };
  const FONT_TAG_SIZE = { 1: "small", 2: "small", 3: "medium", 4: "large", 5: "x-large", 6: "xx-large", 7: "xx-large" };
  // Mid-tone colours that read on both light and dark backgrounds.
  const COLORS = [
    { css: "#d93025", zh: "红", en: "Red" },
    { css: "#e8710a", zh: "橙", en: "Orange" },
    { css: "#188038", zh: "绿", en: "Green" },
    { css: "#1a73e8", zh: "蓝", en: "Blue" },
    { css: "#9334e6", zh: "紫", en: "Purple" },
    { css: "#80868b", zh: "灰", en: "Grey" },
  ];
  const STR = {
    zh: { bold: "加粗", italic: "斜体", underline: "下划线", strike: "删除线", color: "文字颜色", left: "靠左", center: "居中",
      ul: "项目列表", ol: "编号列表", clear: "清除格式", font: "字体", size: "字号" },
    en: { bold: "Bold", italic: "Italic", underline: "Underline", strike: "Strikethrough", color: "Text colour", left: "Align left",
      center: "Centre", ul: "Bulleted list", ol: "Numbered list", clear: "Clear formatting", font: "Font", size: "Size" },
  };
  const lang = () => (window.HVI18n && HVI18n.lang === "en" ? "en" : "zh");
  const tr = (k) => STR[lang()][k];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- cleaning ----------
  const KEEP = { P: "p", DIV: "div", BR: "br", B: "b", STRONG: "b", I: "i", EM: "i", U: "u", S: "s", STRIKE: "s", DEL: "s",
    SPAN: "span", FONT: "span", UL: "ul", OL: "ol", LI: "li", H1: "h3", H2: "h3", H3: "h3", H4: "h3", BLOCKQUOTE: "blockquote" };
  const BLOCKS = new Set(["p", "div", "ul", "ol", "li", "h3", "blockquote"]);
  // Dropped with everything inside them.
  const DROP = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "TEMPLATE", "NOSCRIPT", "TITLE", "META", "LINK", "HEAD",
    "SVG", "MATH", "IMG", "VIDEO", "AUDIO", "CANVAS", "INPUT", "BUTTON", "SELECT", "TEXTAREA", "FORM", "XML"]);
  const firstFamily = (v) => String(v || "").split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
  function fontFor(value) {
    const f = firstFamily(value);
    if (!f) return null;
    const hit = FONTS.find((x) => x.css && x.css.split(",").some((n) => firstFamily(n) === f));
    return hit ? hit.css : null;
  }
  const colorOk = (v) => /^(#[0-9a-f]{3,8}|rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(,\s*[\d.]+\s*)?\))$/i.test(String(v || "").trim());
  // The allowed styles of one element, as a style attribute value ("" when none).
  function styleOf(el, tag) {
    const s = el.style;
    const out = [];
    const color = s.color || (el.tagName === "FONT" && el.getAttribute("color")) || "";
    if (color && colorOk(color)) out.push("color: " + color.trim());
    const font = fontFor(s.fontFamily || (el.tagName === "FONT" && el.getAttribute("face")) || "");
    if (font) out.push("font-family: " + font);
    const size = SIZE_OK[String(s.fontSize || "").trim()] || (el.tagName === "FONT" && FONT_TAG_SIZE[el.getAttribute("size")]) || "";
    if (size) out.push("font-size: " + size);
    if (/^(bold|[6-9]00)$/.test(s.fontWeight)) out.push("font-weight: bold");
    if (s.fontStyle === "italic") out.push("font-style: italic");
    const deco = [/underline/.test(s.textDecorationLine || s.textDecoration) && "underline",
      /line-through/.test(s.textDecorationLine || s.textDecoration) && "line-through"].filter(Boolean);
    if (deco.length) out.push("text-decoration: " + deco.join(" "));
    if (BLOCKS.has(tag) && /^(left|center|right)$/.test(s.textAlign)) out.push("text-align: " + s.textAlign);
    return out.join("; ");
  }
  function walk(src, dst) {
    for (const node of src.childNodes) {
      if (node.nodeType === 3) {
        dst.appendChild(document.createTextNode(node.nodeValue));
        continue;
      }
      if (node.nodeType !== 1 || DROP.has(node.tagName.toUpperCase())) continue;
      const tag = KEEP[node.tagName.toUpperCase()];
      if (!tag) {
        walk(node, dst); // unknown tag: keep its text
        continue;
      }
      const el = document.createElement(tag);
      if (tag !== "br") {
        const style = styleOf(node, tag);
        if (style) el.setAttribute("style", style);
        walk(node, el);
        if (tag === "span" && !style) {
          while (el.firstChild) dst.appendChild(el.firstChild); // a span with no style adds nothing
          continue;
        }
      }
      dst.appendChild(el);
    }
  }
  function clean(html) {
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${String(html || "")}`, "text/html");
    const out = document.createElement("div");
    walk(doc.body, out);
    return out.innerHTML;
  }
  const isHtml = (s) => /<\/?[a-z][^>]*>/i.test(String(s || ""));
  // HTML to show for a description: formatted ones cleaned, plain-text ones escaped with their line breaks.
  const html = (desc) => (isHtml(desc) ? clean(desc) : esc(desc).replace(/\r?\n/g, "<br>"));
  // The description as plain text (line breaks kept), e.g. for a short preview.
  function text(desc) {
    if (!isHtml(desc)) return String(desc || "");
    const marked = clean(desc).replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h3|blockquote)>/gi, "\n");
    const doc = new DOMParser().parseFromString(`<!doctype html><body>${marked}`, "text/html");
    return doc.body.textContent.replace(/\n{3,}/g, "\n\n").trim();
  }

  // ---------- the editor ----------
  // Markup for an editor holding `desc`. Call mount() on the returned element after it is on the page.
  function editorHtml(desc, placeholder) {
    const btn = (cmd, label, title, extra = "") =>
      `<button type="button" class="rt-btn" data-cmd="${cmd}"${extra} title="${esc(title)}" aria-label="${esc(title)}">${label}</button>`;
    const L = lang();
    return `<div class="rt" data-rich>
      <div class="rt-bar" role="toolbar">
        <select class="rt-sel" data-font aria-label="${esc(tr("font"))}" title="${esc(tr("font"))}">${FONTS.map((f) => `<option value="${f.key}">${esc(f[L])}</option>`).join("")}</select>
        <select class="rt-sel" data-size aria-label="${esc(tr("size"))}" title="${esc(tr("size"))}"><option value="">${esc(tr("size"))}</option>${SIZES.map((s) => `<option value="${s.level}">${esc(s[L])}</option>`).join("")}</select>
        ${btn("bold", "<b>B</b>", tr("bold"))}${btn("italic", "<i>I</i>", tr("italic"))}${btn("underline", "<u>U</u>", tr("underline"))}${btn("strikeThrough", "<s>S</s>", tr("strike"))}
        <span class="rt-colors" role="group" aria-label="${esc(tr("color"))}">${COLORS.map((c) => `<button type="button" class="rt-color" data-color="${c.css}" style="background:${c.css}" title="${esc(c[L])}" aria-label="${esc(tr("color"))}: ${esc(c[L])}"></button>`).join("")}</span>
        ${btn("justifyLeft", "⬅︎", tr("left"))}${btn("justifyCenter", "↔︎", tr("center"))}${btn("insertUnorderedList", "•≡", tr("ul"))}${btn("insertOrderedList", "1.≡", tr("ol"))}${btn("removeFormat", "⌫", tr("clear"))}
      </div>
      <div class="rt-edit rt-content" contenteditable="true" role="textbox" aria-multiline="true" data-ph="${esc(placeholder || "")}">${html(desc)}</div>
    </div>`;
  }
  function mount(root) {
    if (!root || root.dataset.mounted) return;
    root.dataset.mounted = "1";
    const ed = root.querySelector(".rt-edit");
    let range = null;
    const keep = () => {
      if (!root.isConnected) return void document.removeEventListener("selectionchange", keep); // the form was redrawn
      const sel = getSelection();
      if (sel.rangeCount && ed.contains(sel.getRangeAt(0).commonAncestorContainer)) range = sel.getRangeAt(0).cloneRange();
    };
    const restore = () => {
      ed.focus();
      if (!range) return;
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    const run = (cmd, value = null) => {
      restore();
      document.execCommand("styleWithCSS", false, true);
      document.execCommand(cmd, false, value);
      keep();
      tidy();
    };
    // An editor emptied by the user can keep a stray <br>; clear it so the placeholder shows.
    const tidy = () => {
      if (!ed.textContent.trim() && !ed.querySelector("li")) ed.innerHTML = "";
    };
    ed.addEventListener("keyup", keep);
    ed.addEventListener("mouseup", keep);
    ed.addEventListener("input", () => {
      keep();
      tidy();
    });
    document.addEventListener("selectionchange", keep);
    root.querySelector(".rt-bar").addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault(); // keep the text selected
    });
    root.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.cmd) run(b.dataset.cmd);
      else if (b.dataset.color) run("foreColor", b.dataset.color);
    });
    root.querySelector("[data-font]").addEventListener("change", (e) => {
      const f = FONTS.find((x) => x.key === e.target.value);
      run("fontName", f && f.css ? f.css : "inherit");
      e.target.value = "";
    });
    root.querySelector("[data-size]").addEventListener("change", (e) => {
      if (e.target.value) run("fontSize", e.target.value);
      e.target.value = "";
    });
    // Pasted text keeps simple formatting only.
    ed.addEventListener("paste", (e) => {
      const data = e.clipboardData;
      if (!data) return;
      e.preventDefault();
      const h = data.getData("text/html");
      const t = data.getData("text/plain");
      document.execCommand("insertHTML", false, h ? clean(h) : esc(t).replace(/\r?\n/g, "<br>"));
    });
  }
  // The cleaned description in an editor ("" when it has no text).
  function value(root) {
    const ed = root && root.querySelector(".rt-edit");
    if (!ed || !ed.textContent.trim()) return "";
    return clean(ed.innerHTML).trim();
  }
  return { clean, html, text, isHtml, editorHtml, mount, value };
})();
