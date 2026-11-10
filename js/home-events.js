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

// Event wishes (期望活动) under the events banner: the most-wanted suggestions (declined ones left out), each with
// a "我也想参加 +1" button, the note, and a link to suggest one. Hidden when wishes can't be loaded.
(() => {
  const box = document.getElementById("home-wishes");
  if (!box || !window.HVLoans || !HVLoans.enabled) return;
  const SHOW = 4;
  const STR = {
    zh: {
      title: "💡 期望活动",
      add: "提议活动 →",
      all: "全部 {n} 个 →",
      adopted: "✓ 已采纳",
      by: "{name} 提议",
      none: "💡 想参加什么活动？提议一个期望活动 →",
      note: "我们会根据情况决定是否采纳举办，提交期望活动不代表一定会举办。",
      vote: "🙋 +1",
      voted: "✓ 想参加",
      votes: "{n} 人想参加",
      voteLabel: "我也想参加「{title}」",
    },
    en: {
      title: "💡 Event wishes",
      add: "Suggest one →",
      all: "All {n} →",
      adopted: "✓ Adopted",
      by: "by {name}",
      none: "💡 What event would you like? Suggest one →",
      note: "We decide case by case whether to hold a suggested event; suggesting one doesn't mean it will happen.",
      vote: "🙋 +1",
      voted: "✓ Joining",
      votes: "{n} want to join",
      voteLabel: "I'd join \"{title}\" too",
    },
  };
  const tr = (k, vars = {}) => (STR[HVI18n.lang][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  // The same browser secret as events.html (localStorage "hv-event-token", stored as JSON).
  function token() {
    let tk = "";
    try {
      tk = JSON.parse(localStorage.getItem("hv-event-token") || '""');
    } catch {}
    if (typeof tk !== "string" || tk.length < 16) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      tk = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      try {
        localStorage.setItem("hv-event-token", JSON.stringify(tk));
      } catch {}
    }
    return tk;
  }
  let wishes = null;
  let voted = new Set();
  let busy = false;
  function render() {
    if (!wishes) return;
    box.hidden = false;
    const live = wishes.filter((w) => w.status !== "rejected"); // already most votes first
    if (!live.length) {
      box.className = "home-wishes is-empty";
      box.innerHTML = `<a class="hw-none" id="home-wishes-title" href="events.html#wishes">${esc(tr("none"))}</a>`;
      return;
    }
    box.className = "home-wishes";
    const shown = live.slice(0, SHOW);
    box.innerHTML = `<div class="hw-head"><h2 id="home-wishes-title">${esc(tr("title"))}</h2>
        <span class="hw-links">${live.length > SHOW ? `<a href="events.html#wishes">${esc(tr("all", { n: live.length }))}</a>` : ""}<a href="events.html#wishes">${esc(tr("add"))}</a></span></div>
      <ul class="hw-list">${shown
        .map((w) => {
          const on = voted.has(w.id);
          return `<li class="hw-item${w.status === "adopted" ? " is-adopted" : ""}">
          <a href="events.html#wishes"><span class="hw-title"><b>${esc(w.title)}</b>${w.status === "adopted" ? ` <span class="hw-badge">${esc(tr("adopted"))}</span>` : ""}</span>
          ${w.description ? `<span class="hw-desc">${esc(w.description)}</span>` : ""}
          <small>${esc(tr("by", { name: w.name }))}</small></a>
          <div class="hw-vote"><button type="button" class="hw-vote-btn${on ? " is-on" : ""}" data-vote="${w.id}" aria-pressed="${on}" aria-label="${esc(tr("voteLabel", { title: w.title }))}">${esc(tr(on ? "voted" : "vote"))}</button><small>${esc(tr("votes", { n: w.votes || 0 }))}</small></div>
        </li>`;
        })
        .join("")}</ul>
      <p class="hw-note">${esc(tr("note"))}</p>`;
  }
  box.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-vote]");
    if (!b || busy) return;
    busy = true;
    b.disabled = true;
    const id = Number(b.dataset.vote);
    try {
      const r = await HVLoans.toggleWishVote(id, token());
      const w = wishes.find((x) => x.id === id);
      if (w) w.votes = r.votes;
      r.voted ? voted.add(id) : voted.delete(id);
    } catch {
      // e.g. declined meanwhile: the events page explains; here just show the current state
    }
    busy = false;
    render();
  });
  HVI18n.onChange(render);
  Promise.all([HVLoans.wishes(50), HVLoans.wishState(token()).catch(() => null)]).then(
    ([rows, st]) => {
      wishes = rows;
      voted = new Set(((st && st.voted) || []).map(Number));
      render();
    },
    () => {}
  );
})();
