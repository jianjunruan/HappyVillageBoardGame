// announcements.html: every announcement (滚动通告) showing today, each with its dates, for anyone to read in full.
// The scrolling bar itself is js/announce.js; admins manage announcements from there (the button here opens it too).
(() => {
  const STR = {
    zh: {
      title: "通告",
      back: "← 桌游目录",
      heading: "📢 进行中的通告",
      empty: "现在没有进行中的通告。",
      loading: "加载中…",
      failed: "加载失败：{msg}",
      retry: "重试",
      until: "{from} – {to}",
      untilToday: "今天是最后一天",
      manage: "⚙️ 管理通告",
      noBackend: "这个功能还没有启用（需要设置 Supabase）。",
    },
    en: {
      title: "Announcements",
      back: "← Games",
      heading: "📢 Current announcements",
      empty: "No announcements right now.",
      loading: "Loading…",
      failed: "Couldn't load: {msg}",
      retry: "Try again",
      until: "{from} – {to}",
      untilToday: "Last day today",
      manage: "⚙️ Manage",
      noBackend: "This isn't switched on yet (Supabase isn't set up).",
    },
  };
  const lang = () => HVI18n.lang;
  const tr = (k, vars = {}) => (STR[lang()][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const fmt = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-GB", { month: "short", day: "numeric", weekday: "short" }).format(new Date(y, m - 1, d));
  };
  const main = $("an-main");
  let rows = null;
  let err = null;
  let isAdmin = false;

  function render() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    document.title = `${tr("title")} · ${HVI18n.t("siteName")}`;
    $("an-title").textContent = tr("title");
    $("an-back").textContent = tr("back");
    $("lang-toggle").textContent = HVI18n.t("toggle");
    $("lang-toggle").setAttribute("aria-label", HVI18n.t("toggleLabel"));
    if (!HVLoans.enabled) return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("noBackend"))}</p>`);
    if (err) return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("failed", { msg: err.message }))}</p><button class="btn" type="button" data-retry>${esc(tr("retry"))}</button>`);
    if (!rows) return void (main.innerHTML = `<p class="ev-msg">${esc(tr("loading"))}</p>`);
    const t = today();
    main.innerHTML = `<div class="ev-head"><h2>${esc(tr("heading"))}</h2>${isAdmin && window.HVAnnounce ? `<button class="btn" type="button" data-manage>${esc(tr("manage"))}</button>` : ""}</div>
      ${rows.length
        ? `<ol class="an-list">${rows
            .map((a) => `<li class="an-item"><p class="an-body">${esc(a.body)}</p>
              <p class="ev-hint">📅 ${esc(tr("until", { from: fmt(a.starts_on), to: fmt(a.ends_on) }))}${a.ends_on === t ? ` · <b>${esc(tr("untilToday"))}</b>` : ""}</p></li>`)
            .join("")}</ol>`
        : `<p class="ev-empty">${esc(tr("empty"))}</p>`}`;
  }
  async function load() {
    err = null;
    try {
      rows = await HVLoans.announcements(today());
    } catch (e) {
      err = e;
    }
    render();
  }
  main.addEventListener("click", (e) => {
    if (e.target.closest("[data-manage]")) return window.HVAnnounce.manage();
    if (e.target.closest("[data-retry]")) {
      rows = null;
      render();
      load();
    }
  });
  $("lang-toggle").addEventListener("click", () => HVI18n.toggle());
  HVI18n.onChange(render);
  render();
  if (!HVLoans.enabled) return;
  load();
  if (window.HVAnnounce) HVAnnounce.onChange(load);
  if (HVLoans.user)
    HVLoans.isAdmin().then(
      (yes) => {
        isAdmin = yes;
        render();
      },
      () => {}
    );
})();
