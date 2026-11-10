// The events banner at the top of the home page: the next 1–2 events, with a big link to sign up.
// With no upcoming event it shrinks to a single line linking to events.html. Data: HVLoans.upcomingEvents.
(() => {
  const box = document.getElementById("home-events");
  if (!box || !window.HVLoans || !HVLoans.enabled) return;
  const STR = {
    zh: {
      title: "📅 近期活动",
      all: "全部活动 →",
      join: "去报名 →",
      today: "今天",
      tomorrow: "明天",
      inDays: "{n} 天后",
      tables: "已开 {n} 桌 · {p} 人报名",
      noTables: "还没有人开桌，快来开第一桌！",
      lead: "负责人：{name}",
      none: "📅 活动报名：暂时没有新活动，看看往期活动 →",
    },
    en: {
      title: "📅 Upcoming events",
      all: "All events →",
      join: "Sign up →",
      today: "Today",
      tomorrow: "Tomorrow",
      inDays: "In {n} days",
      tables: "{n} tables · {p} signed up",
      noTables: "No tables yet. Open the first one!",
      lead: "Organizer: {name}",
      none: "📅 Events: nothing coming up yet. See past events →",
    },
  };
  const tr = (k, vars = {}) => (STR[HVI18n.lang][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const today = ymd(new Date());
  const locale = () => (HVI18n.lang === "zh" ? "zh-CN" : "en-GB");
  let events = null;

  function card(e) {
    const d = parse(e.event_date);
    const n = Math.round((d - parse(today)) / 864e5);
    const rel = n === 0 ? tr("today") : n === 1 ? tr("tomorrow") : tr("inDays", { n });
    const tables = e.event_tables || [];
    const people = tables.reduce((s, t) => s + (t.event_players || []).length, 0);
    // 负责人1 (or, if that person was deleted, the first one left).
    const lead = (e.event_staff || []).filter((x) => x.staff).sort((a, b) => b.is_lead - a.is_lead || a.sort - b.sort)[0];
    const when = new Intl.DateTimeFormat(locale(), { month: HVI18n.lang === "zh" ? "long" : "short", day: "numeric", weekday: "short" }).format(d);
    return `<a class="he-card" href="events.html?id=${e.id}">
      <span class="he-cal" aria-hidden="true"><small>${esc(new Intl.DateTimeFormat(locale(), { month: "short" }).format(d))}</small><b>${d.getDate()}</b></span>
      <span class="he-body">
        <span class="he-name">${esc(e.title)}</span>
        <span class="he-when">${esc(when)}${e.start_time ? ` · ${esc(e.start_time.slice(0, 5))}${e.end_time ? "–" + esc(e.end_time.slice(0, 5)) : ""}` : ""} <span class="he-rel${n <= 1 ? " is-now" : ""}">${esc(rel)}</span></span>
        ${e.location ? `<span class="he-meta">📍 ${esc(e.location)}</span>` : ""}
        <span class="he-meta">${esc(tables.length ? tr("tables", { n: tables.length, p: people }) : tr("noTables"))}</span>
        ${lead ? `<span class="he-meta">${esc(tr("lead", { name: lead.staff.name }))}</span>` : ""}
      </span>
      <span class="he-go">${esc(tr("join"))}</span>
    </a>`;
  }
  function render() {
    if (!events) return;
    box.hidden = false;
    if (!events.length) {
      box.className = "home-events is-empty";
      box.innerHTML = `<a class="he-none" id="home-events-title" href="events.html">${esc(tr("none"))}</a>`;
      return;
    }
    box.className = "home-events";
    box.innerHTML = `<div class="he-head"><h2 id="home-events-title">${esc(tr("title"))}</h2><a href="events.html">${esc(tr("all"))}</a></div>
      <div class="he-list">${events.map(card).join("")}</div>`;
  }
  HVI18n.onChange(render);
  HVLoans.upcomingEvents(today, 2).then(
    (rows) => {
      events = rows;
      render();
    },
    () => {} // no banner when events can't load; the header button still leads to events.html
  );
})();
