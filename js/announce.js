// Announcements (滚动通告): a scrolling bar at the very top of every page. Each current announcement scrolls across
// once, then the next one, round and round. Only those whose dates include today (the visitor's own day) show.
// Admins get a ⚙️ button on the bar (also when there is nothing to show) to add, change and remove announcements.
// Data: Supabase table announcements (supabase/schema.sql), through HVLoans. Works on pages without i18n.js too.
(() => {
  if (!window.HVLoans || !HVLoans.enabled) return;
  const STR = {
    zh: {
      region: "通告",
      none: "暂时没有通告",
      manage: "⚙️ 管理通告",
      title: "📢 管理滚动通告",
      hint: "每条通告只在选定的日期里滚动显示（开始和结束当天都算），过期后自动不显示。有多条时轮流滚动。",
      add: "＋ 新通告",
      body: "通告内容",
      bodyPh: "例如：本周六活动改到下午 2 点开始",
      start: "开始日期",
      end: "结束日期",
      save: "💾 保存",
      saving: "保存中…",
      cancel: "取消",
      close: "关闭",
      edit: "✏️ 修改",
      del: "🗑 删除",
      delConfirm: "删除这条通告？",
      empty: "还没有通告。",
      live: "滚动中",
      soon: "未开始",
      over: "已过期",
      needBody: "请填写通告内容。",
      needDates: "请选择开始和结束日期。",
      badDates: "结束日期不能早于开始日期。",
      loading: "加载中…",
      failed: "出错了：{msg}",
    },
    en: {
      region: "Announcements",
      none: "No announcements right now",
      manage: "⚙️ Manage",
      title: "📢 Scrolling announcements",
      hint: "Each announcement scrolls only on the days you pick (first and last day included) and disappears afterwards. Several take turns.",
      add: "+ New announcement",
      body: "Announcement",
      bodyPh: "e.g. This Saturday's event now starts at 2 pm",
      start: "From",
      end: "Until",
      save: "💾 Save",
      saving: "Saving…",
      cancel: "Cancel",
      close: "Close",
      edit: "✏️ Edit",
      del: "🗑 Delete",
      delConfirm: "Delete this announcement?",
      empty: "No announcements yet.",
      live: "Showing",
      soon: "Not started",
      over: "Ended",
      needBody: "Please write the announcement.",
      needDates: "Please pick both dates.",
      badDates: "The end can't be before the start.",
      loading: "Loading…",
      failed: "Something went wrong: {msg}",
    },
  };
  const lang = () => (window.HVI18n && HVI18n.lang === "en" ? "en" : "zh");
  const tr = (k, vars = {}) => (STR[lang()][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const plusDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return ymd(d);
  };
  const fmt = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-GB", { month: "short", day: "numeric" }).format(new Date(y, m - 1, d));
  };

  // Styles live here so the bar looks the same on every page (some pages have their own stylesheet).
  const css = document.createElement("style");
  css.textContent = `
    .hv-ann { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #fff4c2; color: #5a4300;
      border-bottom: 1px solid #f0d97a; font-size: 0.92rem; font-weight: 600; line-height: 1.4; }
    .hv-ann-icon { flex: none; }
    .hv-ann-view { flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; }
    .hv-ann-text { display: inline-block; will-change: transform; }
    .hv-ann.is-still .hv-ann-text { white-space: normal; }
    .hv-ann.is-still .hv-ann-view { white-space: normal; }
    .hv-ann-none { color: #8a7a3a; font-weight: 500; }
    .hv-ann-btn { flex: none; padding: 2px 8px; border: 1px solid #d9bd4f; border-radius: 999px; background: #fff; color: #5a4300;
      font: inherit; font-size: 0.8rem; cursor: pointer; }
    @media (prefers-color-scheme: dark) {
      .hv-ann { background: #3d3410; color: #ffe58a; border-bottom-color: #5c4d14; }
      .hv-ann-none { color: #c9b66a; }
      .hv-ann-btn { background: #2a240c; color: #ffe58a; border-color: #7a6620; }
    }
    dialog.hv-ann-dlg { width: min(560px, calc(100vw - 16px)); max-height: 90vh; padding: 16px; border: 0; border-radius: 16px;
      background: var(--surface, #fff); color: var(--text, #222); box-shadow: 0 10px 40px rgb(0 0 0 / 0.25); }
    dialog.hv-ann-dlg::backdrop { background: rgb(0 0 0 / 0.4); }
    .hv-ann-dlg h2 { margin: 0; font-size: 1.1rem; }
    .hv-ann-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
    .hv-ann-x { width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--bg, #f3f3f3); color: inherit; cursor: pointer; }
    .hv-ann-hint { margin: 0 0 10px; color: var(--muted, #666); font-size: 0.85rem; }
    .hv-ann-list { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 8px; }
    .hv-ann-item { padding: 8px 10px; border: 1px solid var(--border, #ddd); border-radius: 10px; }
    .hv-ann-item p { margin: 0 0 4px; overflow-wrap: anywhere; }
    .hv-ann-item small { color: var(--muted, #666); }
    .hv-ann-item.is-over { opacity: 0.6; }
    .hv-ann-tag { display: inline-block; margin-right: 6px; padding: 0 7px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; background: #e8e8e8; color: #444; }
    .hv-ann-tag.is-live { background: #2e7d4f; color: #fff; }
    .hv-ann-acts { display: flex; gap: 12px; margin-top: 4px; }
    .hv-ann-link { padding: 0; border: 0; background: none; color: var(--accent, #d2602f); font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .hv-ann-form { display: grid; gap: 10px; padding: 10px; border-radius: 10px; background: var(--bg, #f7f7f7); }
    .hv-ann-form label { display: grid; gap: 4px; font-size: 0.88rem; color: var(--muted, #666); }
    .hv-ann-form textarea, .hv-ann-form input { width: 100%; padding: 8px 10px; font: inherit; color: var(--text, #222); }
    .hv-ann-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .hv-ann-row label { flex: 1 1 140px; }
    .hv-ann-err { margin: 0; color: var(--danger, #c0392b); font-size: 0.88rem; }
    .hv-ann-btns { display: flex; justify-content: flex-end; gap: 8px; }
    .hv-ann-btns button { padding: 7px 14px; border-radius: 10px; border: 1px solid var(--accent, #d2602f); font: inherit; font-weight: 600; cursor: pointer;
      background: var(--accent, #d2602f); color: #fff; }
    .hv-ann-btns button.is-ghost { background: transparent; color: var(--accent, #d2602f); }
  `;
  document.head.append(css);

  const bar = document.createElement("div");
  bar.className = "hv-ann";
  bar.setAttribute("role", "region");
  bar.hidden = true;
  let items = []; // current announcements
  let isAdmin = false;
  let at = 0; // which one is showing
  let anim = null;
  let timer = null;
  const still = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function stop() {
    if (anim) anim.cancel();
    anim = null;
    clearTimeout(timer);
  }
  // Shows announcement number `at`: it scrolls in from the right and out to the left, then the next one starts.
  function play() {
    stop();
    const t = today();
    items = items.filter((a) => a.starts_on <= t && a.ends_on >= t); // one may end while the page stays open
    const text = bar.querySelector(".hv-ann-text");
    const view = bar.querySelector(".hv-ann-view");
    if (!text || !items.length) return paint();
    at %= items.length;
    text.textContent = items[at].body;
    const next = () => {
      at = (at + 1) % items.length;
      play();
    };
    if (still() || !text.animate) {
      bar.classList.add("is-still");
      if (items.length > 1) timer = setTimeout(next, 6000);
      return;
    }
    bar.classList.remove("is-still");
    const w = view.clientWidth;
    const tw = text.scrollWidth;
    const pxPerSec = 70;
    anim = text.animate([{ transform: `translateX(${w}px)` }, { transform: `translateX(${-tw}px)` }], {
      duration: ((w + tw) / pxPerSec) * 1000,
      easing: "linear",
    });
    anim.onfinish = next;
  }
  function paint() {
    stop();
    if (!items.length && !isAdmin) return void (bar.hidden = true);
    bar.hidden = false;
    bar.setAttribute("aria-label", tr("region"));
    bar.innerHTML = `<span class="hv-ann-icon" aria-hidden="true">📢</span>
      <div class="hv-ann-view">${items.length ? `<span class="hv-ann-text"></span>` : `<span class="hv-ann-none">${esc(tr("none"))}</span>`}</div>
      ${isAdmin ? `<button class="hv-ann-btn" type="button" data-ann-manage>${esc(tr("manage"))}</button>` : ""}`;
    if (items.length) play();
  }
  // Pause while the finger or mouse is on the text, so it can be read.
  bar.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && anim && anim.pause());
  bar.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && anim && anim.play());
  bar.addEventListener("click", (e) => {
    if (e.target.closest("[data-ann-manage]")) return void openManager();
    if (anim) anim.playState === "paused" ? anim.play() : anim.pause(); // a tap pauses / resumes on phones
  });

  // ---------- admins: add, change, remove ----------
  const dlg = document.createElement("dialog");
  dlg.className = "hv-ann-dlg";
  let all = null; // every announcement (admins)
  let form = null; // { id, body, starts_on, ends_on, err } while adding / editing
  let busy = false;
  let err = "";
  function status(a) {
    const t = today();
    return a.ends_on < t ? "over" : a.starts_on > t ? "soon" : "live";
  }
  function renderManager() {
    const list = all == null ? `<p class="hv-ann-hint">${esc(tr("loading"))}</p>`
      : all.length ? `<ul class="hv-ann-list">${all
          .map((a) => {
            const st = status(a);
            return `<li class="hv-ann-item is-${st}"><p>${esc(a.body)}</p>
              <small><span class="hv-ann-tag${st === "live" ? " is-live" : ""}">${esc(tr(st))}</span>${esc(fmt(a.starts_on))} – ${esc(fmt(a.ends_on))}</small>
              <div class="hv-ann-acts"><button class="hv-ann-link" type="button" data-edit="${a.id}">${esc(tr("edit"))}</button><button class="hv-ann-link" type="button" data-del="${a.id}">${esc(tr("del"))}</button></div></li>`;
          })
          .join("")}</ul>`
      : `<p class="hv-ann-hint">${esc(tr("empty"))}</p>`;
    const f = form
      ? `<form class="hv-ann-form" novalidate>
          <label><span>${esc(tr("body"))}</span><textarea name="body" rows="2" maxlength="200" placeholder="${esc(tr("bodyPh"))}" autofocus>${esc(form.body)}</textarea></label>
          <div class="hv-ann-row">
            <label><span>${esc(tr("start"))}</span><input name="start" type="date" value="${esc(form.starts_on)}"></label>
            <label><span>${esc(tr("end"))}</span><input name="end" type="date" value="${esc(form.ends_on)}"></label>
          </div>
          ${form.err ? `<p class="hv-ann-err" role="alert">${esc(form.err)}</p>` : ""}
          <div class="hv-ann-btns"><button class="is-ghost" type="button" data-cancel>${esc(tr("cancel"))}</button><button type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("save"))}</button></div>
        </form>`
      : `<div class="hv-ann-btns"><button type="button" data-add>${esc(tr("add"))}</button></div>`;
    dlg.innerHTML = `<div class="hv-ann-head"><h2>${esc(tr("title"))}</h2><button class="hv-ann-x" type="button" data-close aria-label="${esc(tr("close"))}">✕</button></div>
      <p class="hv-ann-hint">${esc(tr("hint"))}</p>
      ${err ? `<p class="hv-ann-err" role="alert">${esc(err)}</p>` : ""}
      ${list}${f}`;
    const first = dlg.querySelector("[autofocus]");
    if (first) first.focus();
  }
  async function loadAll() {
    try {
      all = await HVLoans.allAnnouncements();
      err = "";
    } catch (e) {
      all = [];
      err = tr("failed", { msg: e.message });
    }
  }
  async function openManager() {
    if (!document.body.contains(dlg)) document.body.append(dlg);
    all = null;
    form = null;
    err = "";
    renderManager();
    if (!dlg.open) dlg.showModal();
    await loadAll();
    renderManager();
  }
  function readForm() {
    const f = dlg.querySelector("form");
    if (!f || !form) return;
    form.body = f.elements.body.value;
    form.starts_on = f.elements.start.value;
    form.ends_on = f.elements.end.value;
  }
  // After a change: the list in the dialog and the bar itself.
  async function refresh() {
    await loadAll();
    renderManager();
    await loadCurrent();
  }
  dlg.addEventListener("click", async (e) => {
    if (e.target === dlg || e.target.closest("[data-close]")) return dlg.close();
    if (e.target.closest("[data-add]")) {
      form = { id: null, body: "", starts_on: today(), ends_on: plusDays(7), err: "" };
      return renderManager();
    }
    if (e.target.closest("[data-cancel]")) {
      form = null;
      return renderManager();
    }
    const ed = e.target.closest("[data-edit]");
    if (ed) {
      const a = all.find((x) => x.id === Number(ed.dataset.edit));
      if (a) form = { id: a.id, body: a.body, starts_on: a.starts_on, ends_on: a.ends_on, err: "" };
      return renderManager();
    }
    const del = e.target.closest("[data-del]");
    if (del && !busy) {
      if (!confirm(tr("delConfirm"))) return;
      busy = true;
      try {
        await HVLoans.deleteAnnouncement(Number(del.dataset.del));
      } catch (x) {
        err = tr("failed", { msg: x.message });
      }
      busy = false;
      await refresh();
    }
  });
  dlg.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy || !form) return;
    readForm();
    const body = form.body.trim().slice(0, 200);
    form.err = !body ? tr("needBody")
      : !/^\d{4}-\d{2}-\d{2}$/.test(form.starts_on) || !/^\d{4}-\d{2}-\d{2}$/.test(form.ends_on) ? tr("needDates")
      : form.ends_on < form.starts_on ? tr("badDates") : "";
    if (form.err) return renderManager();
    busy = true;
    renderManager();
    try {
      await HVLoans.saveAnnouncement({ body, starts_on: form.starts_on, ends_on: form.ends_on }, form.id);
      form = null;
    } catch (x) {
      if (form) form.err = tr("failed", { msg: x.message });
    }
    busy = false;
    await refresh();
  });

  async function loadCurrent() {
    try {
      items = await HVLoans.announcements(today());
    } catch {
      items = []; // not set up yet, or offline: no bar
    }
    at = 0;
    paint();
  }
  function start() {
    document.body.prepend(bar);
    loadCurrent();
    if (HVLoans.user)
      HVLoans.isAdmin().then(
        (yes) => {
          isAdmin = yes;
          paint();
        },
        () => {}
      );
    if (window.HVI18n && HVI18n.onChange)
      HVI18n.onChange(() => {
        paint();
        if (dlg.open) renderManager();
      });
    // The width changes when a phone turns: start the current one again so it fits.
    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => items.length && play(), 300);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
