// Calendar date picker used for every date field on the site (loan date, due date, scoreboard date).
//
// Write a hidden input and call HVDatePicker.enhance(container):
//   <input type="hidden" name="loaned" value="2026-11-09" data-datepicker data-max="today">
// The input keeps the value as "YYYY-MM-DD" (or "" when empty), so forms read it as before.
// A button showing the date is added after it; tapping it opens the calendar in a dialog.
// When a date is picked, the input fires "input" and "change" events that bubble.
//
// Options (data attributes on the input):
//   data-min / data-max   "YYYY-MM-DD" or "today"
//   data-min-field        name of another date input in the same form whose value is the earliest allowed date
//   data-optional         the date can be cleared (shows a "no date" button and a placeholder)
//   data-placeholder      text shown when empty
//   data-quick            quick-pick buttons: any of today, yesterday, week, 2weeks, month (default: today, yesterday)
//   data-size="lg"        a larger button
//   data-labelledby       id of the field's label (when it isn't wrapped in a <label>)
(() => {
  const STR = {
    zh: {
      pick: "选择日期",
      prev: "上个月",
      next: "下个月",
      prevYear: "上一年",
      nextYear: "下一年",
      months: "选择月份",
      close: "关闭",
      clear: "不设日期",
      empty: "未设置",
      today: "今天",
      yesterday: "昨天",
      tomorrow: "明天",
      ago: "{n} 天前",
      later: "{n} 天后",
      week: "一周后",
      "2weeks": "两周后",
      month: "一个月后",
    },
    en: {
      pick: "Pick a date",
      prev: "Previous month",
      next: "Next month",
      prevYear: "Previous year",
      nextYear: "Next year",
      months: "Pick a month",
      close: "Close",
      clear: "No date",
      empty: "Not set",
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      ago: "{n} days ago",
      later: "in {n} days",
      week: "In 1 week",
      "2weeks": "In 2 weeks",
      month: "In 1 month",
    },
  };
  const lang = () => (window.HVI18n && HVI18n.lang === "en" ? "en" : "zh");
  const tr = (k, v = {}) => (STR[lang()][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => v[x] ?? "");
  const locale = () => (lang() === "zh" ? "zh-CN" : "en");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // ---------- dates as "YYYY-MM-DD" in local time ----------
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
  const parse = (s) => {
    const [y, m, d] = String(s).split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const fromDate = (dt) => ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const today = () => fromDate(new Date());
  const addDays = (s, n) => {
    const d = parse(s);
    d.setDate(d.getDate() + n);
    return fromDate(d);
  };
  const addMonths = (s, n) => {
    const d = parse(s), day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return fromDate(d);
  };
  const fmt = (s, o) => parse(s).toLocaleDateString(locale(), o);
  const relText = (s) => {
    const n = Math.round((parse(s) - parse(today())) / 864e5);
    if (n === 0) return tr("today");
    if (n === -1) return tr("yesterday");
    if (n === 1) return tr("tomorrow");
    return n < 0 ? tr("ago", { n: -n }) : tr("later", { n });
  };

  // ---------- limits of one input ----------
  const resolve = (v) => (v === "today" ? today() : isDay(v) ? v : "");
  function limits(input) {
    let min = resolve(input.dataset.min);
    const max = resolve(input.dataset.max);
    if (input.dataset.minField && input.form) {
      const other = input.form.elements[input.dataset.minField];
      if (other && isDay(other.value) && other.value > min) min = other.value;
    }
    return { min, max };
  }
  const allowed = (v, { min, max }) => isDay(v) && (!min || v >= min) && (!max || v <= max);

  // ---------- the button next to each input ----------
  let uid = 0;
  function buttonHtml(input) {
    const v = input.value;
    if (!isDay(v)) {
      return `<span class="dp-ico is-empty" aria-hidden="true"><small>&nbsp;</small><b>?</b></span>
        <span class="dp-txt"><b class="dp-ph">${esc(input.dataset.placeholder || tr("empty"))}</b></span><i aria-hidden="true">📅</i>`;
    }
    const d = parse(v);
    return `<span class="dp-ico" aria-hidden="true"><small>${esc(fmt(v, { month: "short" }))}</small><b>${d.getDate()}</b></span>
      <span class="dp-txt"><b>${esc(fmt(v, { ...(input.dataset.size === "lg" || d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}), month: "long", day: "numeric", weekday: "short" }))}</b><small>${esc(relText(v))}</small></span>
      <i aria-hidden="true">📅</i>`;
  }
  function refresh(input) {
    const btn = input._dpBtn;
    if (!btn) return;
    btn.innerHTML = buttonHtml(input);
    const txt = btn.querySelector(".dp-txt");
    txt.id = btn.id + "-t";
    if (input.dataset.labelledby) btn.setAttribute("aria-labelledby", `${input.dataset.labelledby} ${txt.id}`);
  }
  function enhance(root = document) {
    root.querySelectorAll("input[data-datepicker]").forEach((input) => {
      if (input._dpBtn && input._dpBtn.isConnected) return refresh(input);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dp-btn" + (input.dataset.size === "lg" ? " dp-lg" : "");
      btn.id = input.id ? `${input.id}-btn` : `dp-${++uid}`;
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", () => open(input));
      input.after(btn);
      input._dpBtn = btn;
      refresh(input);
    });
  }
  function setValue(input, v) {
    input.value = v;
    refresh(input);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // ---------- the calendar dialog (one for the whole page) ----------
  let dlg = null;
  let cur = null; // { input, y, m, focus, view: "days" | "months", dir, lim }
  function dialog() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "dp-dlg";
    dlg.setAttribute("aria-labelledby", "dp-title");
    document.body.appendChild(dlg);
    dlg.addEventListener("click", onClick);
    dlg.addEventListener("keydown", onKey);
    dlg.addEventListener("close", () => {
      if (dlg.open) return; // already reopened for another field
      const back = cur && cur.input._dpBtn;
      cur = null;
      if (back && back.isConnected) back.focus();
    });
    return dlg;
  }

  function open(input) {
    const lim = limits(input);
    let focus = isDay(input.value) ? input.value : today();
    if (lim.max && focus > lim.max) focus = lim.max;
    if (lim.min && focus < lim.min) focus = lim.min;
    const d = parse(focus);
    cur = { input, y: d.getFullYear(), m: d.getMonth(), focus, view: "days", dir: "", lim };
    dialog();
    render();
    dlg.showModal();
    focusCurrent();
  }
  const focusCurrent = () => {
    const b = dlg.querySelector(".dp-day[tabindex='0'], .dp-mon[tabindex='0']");
    if (b) b.focus();
  };
  const monthKey = (y, m) => y * 12 + m;
  const fullDay = (v) => fmt(v, { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  function quickList(input) {
    const want = (input.dataset.quick || "today,yesterday").split(",").map((s) => s.trim()).filter(Boolean);
    const t = today();
    const dates = { today: t, yesterday: addDays(t, -1), week: addDays(t, 7), "2weeks": addDays(t, 14), month: addMonths(t, 1) };
    return want.filter((k) => dates[k]).map((k) => [k, dates[k]]);
  }

  function render() {
    const { input, y, m, lim, view } = cur;
    const sel = isDay(input.value) ? input.value : "";
    const t = today();
    const hero = sel
      ? `<div class="dp-big">${esc(fmt(sel, { month: "long", day: "numeric" }))}</div>
         <div class="dp-sub">${esc(fmt(sel, { year: "numeric", weekday: "long" }))} · ${esc(relText(sel))}</div>`
      : `<div class="dp-big">${esc(input.dataset.placeholder || tr("empty"))}</div><div class="dp-sub">${esc(tr("pick"))}</div>`;
    const minK = lim.min ? monthKey(parse(lim.min).getFullYear(), parse(lim.min).getMonth()) : -Infinity;
    const maxK = lim.max ? monthKey(parse(lim.max).getFullYear(), parse(lim.max).getMonth()) : Infinity;
    let body;
    if (view === "months") {
      const months = [...Array(12)].map((_, i) => {
        const k = monthKey(y, i);
        const on = sel && parse(sel).getFullYear() === y && parse(sel).getMonth() === i;
        return `<button type="button" class="dp-mon${on ? " is-sel" : ""}" data-month="${i}" tabindex="${i === m ? 0 : -1}"${k < minK || k > maxK ? " disabled" : ""}>${esc(new Date(y, i, 1).toLocaleDateString(locale(), { month: "short" }))}</button>`;
      });
      body = `<div class="dp-nav">
          <button type="button" class="dp-arrow" data-year="-1" aria-label="${esc(tr("prevYear"))}"${monthKey(y - 1, 11) < minK ? " disabled" : ""}>‹</button>
          <button type="button" class="dp-title" id="dp-title" data-view="days" aria-live="polite">${y}</button>
          <button type="button" class="dp-arrow" data-year="1" aria-label="${esc(tr("nextYear"))}"${monthKey(y + 1, 0) > maxK ? " disabled" : ""}>›</button>
        </div>
        <div class="dp-months ${cur.dir}" role="group" aria-labelledby="dp-title">${months.join("")}</div>`;
    } else {
      const lead = (new Date(y, m, 1).getDay() + 6) % 7; // weeks start on Monday
      const days = new Date(y, m + 1, 0).getDate();
      const wk = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale(), { weekday: "narrow" }));
      let cells = "";
      for (let i = 0; i < lead; i++) cells += `<span></span>`;
      for (let d = 1; d <= days; d++) {
        const v = ymd(y, m, d);
        const wd = (lead + d - 1) % 7;
        const cls = ["dp-day", v === sel ? "is-sel" : "", v === t ? "is-today" : "", wd >= 5 ? "is-wkend" : ""].filter(Boolean).join(" ");
        cells += `<button type="button" class="${cls}" data-day="${v}" tabindex="${v === cur.focus ? 0 : -1}"${allowed(v, lim) ? "" : " disabled"} aria-label="${esc(fullDay(v))}"${v === sel ? ' aria-pressed="true"' : ""}>${d}</button>`;
      }
      body = `<div class="dp-nav">
          <button type="button" class="dp-arrow" data-mon="-1" aria-label="${esc(tr("prev"))}"${monthKey(y, m) <= minK ? " disabled" : ""}>‹</button>
          <button type="button" class="dp-title" id="dp-title" data-view="months" aria-label="${esc(tr("months"))}: ${esc(new Date(y, m, 1).toLocaleDateString(locale(), { year: "numeric", month: "long" }))}" aria-live="polite">${esc(new Date(y, m, 1).toLocaleDateString(locale(), { year: "numeric", month: "long" }))} <span aria-hidden="true">▾</span></button>
          <button type="button" class="dp-arrow" data-mon="1" aria-label="${esc(tr("next"))}"${monthKey(y, m) >= maxK ? " disabled" : ""}>›</button>
        </div>
        <div class="dp-wk" aria-hidden="true">${wk.map((w, i) => `<span${i >= 5 ? ' class="is-wkend"' : ""}>${esc(w)}</span>`).join("")}</div>
        <div class="dp-grid ${cur.dir}" role="group" aria-labelledby="dp-title">${cells}</div>`;
    }
    const quick = quickList(input)
      .map(([k, v]) => `<button type="button" class="dp-chip" data-day="${v}"${allowed(v, lim) ? "" : " disabled"}>${esc(tr(k))}</button>`)
      .join("");
    const clear = input.dataset.optional !== undefined ? `<button type="button" class="dp-chip is-clear" data-clear>${esc(tr("clear"))}</button>` : "";
    dlg.innerHTML = `
      <div class="dp-hero">${hero}<button type="button" class="dp-x" data-close aria-label="${esc(tr("close"))}">×</button></div>
      ${body}
      <div class="dp-quick">${quick}${clear}</div>`;
  }

  function goMonth(n, keepFocus) {
    const d = new Date(cur.y, cur.m + n, 1);
    cur.y = d.getFullYear();
    cur.m = d.getMonth();
    cur.dir = n < 0 ? "from-left" : "from-right";
    if (!keepFocus) {
      const last = new Date(cur.y, cur.m + 1, 0).getDate();
      let f = ymd(cur.y, cur.m, Math.min(parse(cur.focus).getDate(), last));
      if (cur.lim.max && f > cur.lim.max) f = cur.lim.max;
      if (cur.lim.min && f < cur.lim.min) f = cur.lim.min;
      cur.focus = f;
    }
    render();
  }
  function pick(v) {
    const input = cur.input;
    const b = dlg.querySelector(`.dp-grid [data-day="${v}"]`);
    setValue(input, v); // saved right away; the calendar closes after a short pop
    if (!b) return dlg.close();
    b.classList.add("is-pop");
    setTimeout(() => dlg.open && cur && cur.input === input && dlg.close(), 200);
  }

  function onClick(e) {
    if (!cur) return;
    if (e.target === dlg) return dlg.close(); // tap outside the calendar
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.hasAttribute("data-close")) return dlg.close();
    if (b.hasAttribute("data-clear")) {
      setValue(cur.input, "");
      return dlg.close();
    }
    if (b.dataset.mon) return goMonth(+b.dataset.mon);
    if (b.dataset.view) {
      cur.view = b.dataset.view;
      cur.dir = "";
      render();
      return focusCurrent();
    }
    if (b.dataset.year) {
      cur.y += +b.dataset.year;
      cur.dir = +b.dataset.year < 0 ? "from-left" : "from-right";
      return render();
    }
    if (b.dataset.month) {
      cur.m = +b.dataset.month;
      cur.view = "days";
      cur.dir = "";
      goMonth(0);
      return focusCurrent();
    }
    if (b.dataset.day) pick(b.dataset.day);
  }

  function onKey(e) {
    if (!cur || cur.view !== "days" || !e.target.closest(".dp-day")) return;
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      goMonth(e.key === "PageUp" ? -1 : 1);
      return focusCurrent();
    }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = addDays(cur.focus, step);
    if ((cur.lim.max && next > cur.lim.max) || (cur.lim.min && next < cur.lim.min)) return;
    cur.focus = next;
    const d = parse(next);
    if (d.getFullYear() !== cur.y || d.getMonth() !== cur.m) goMonth(monthKey(d.getFullYear(), d.getMonth()) < monthKey(cur.y, cur.m) ? -1 : 1, true);
    else dlg.querySelectorAll(".dp-day").forEach((x) => (x.tabIndex = x.dataset.day === next ? 0 : -1));
    focusCurrent();
  }

  window.HVDatePicker = { enhance, refresh, open, today };
})();
