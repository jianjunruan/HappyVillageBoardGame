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
      tables: "已开 {n} 桌 · {p} 人参加",
      people: "{p} 人参加",
      noTables: "还没有人开桌，快来开第一桌！",
      lead: "负责人：{name}",
      none: "📅 活动报名：暂时没有新活动，看看往期活动 →",
      cancelled: "已取消",
      view: "查看 →",
    },
    en: {
      title: "📅 Upcoming events",
      all: "All events →",
      join: "Sign up →",
      today: "Today",
      tomorrow: "Tomorrow",
      inDays: "In {n} days",
      tables: "{n} tables · {p} people coming",
      people: "{p} people coming",
      noTables: "No tables yet. Open the first one!",
      lead: "Organizer: {name}",
      none: "📅 Events: nothing coming up yet. See past events →",
      cancelled: "Cancelled",
      view: "View →",
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
    const people = HVLoans.headcount(e); // different people, organizers included
    // 负责人1 (or, if that person was deleted, the first one left).
    const lead = (e.event_staff || []).filter((x) => x.staff).sort((a, b) => b.is_lead - a.is_lead || a.sort - b.sort)[0];
    const when = new Intl.DateTimeFormat(locale(), { month: HVI18n.lang === "zh" ? "long" : "short", day: "numeric", weekday: "short" }).format(d);
    return `<a class="he-card${e.cancelled ? " is-cancelled" : ""}" href="events.html?id=${e.id}">
      <span class="he-cal" aria-hidden="true"><small>${esc(new Intl.DateTimeFormat(locale(), { month: "short" }).format(d))}</small><b>${d.getDate()}</b></span>
      <span class="he-body">
        <span class="he-name">${e.cancelled ? `<span class="he-cancel">${esc(tr("cancelled"))}</span> ` : ""}${esc(e.title)}</span>
        <span class="he-when">${esc(when)}${e.start_time ? ` · ${esc(e.start_time.slice(0, 5))}${e.end_time ? "–" + esc(e.end_time.slice(0, 5)) : ""}` : ""} <span class="he-rel${n <= 1 ? " is-now" : ""}">${esc(rel)}</span></span>
        ${e.location ? `<span class="he-meta">📍 ${esc(e.location)}</span>` : ""}
        <span class="he-meta">${esc(tables.length ? tr("tables", { n: tables.length, p: people }) : people ? `${tr("people", { p: people })} · ${tr("noTables")}` : tr("noTables"))}</span>
        ${lead ? `<span class="he-meta">${esc(tr("lead", { name: lead.staff.name }))}</span>` : ""}
      </span>
      <span class="he-go">${esc(tr(e.cancelled ? "view" : "join"))}</span>
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
      soon: "🚀 即将上线，敬请期待",
      watching: "👀 关注中",
      watchingTip: "管理员已经注意到了，还在观望，还没确定是否采纳。",
      adminNote: "📝 {note}",
      by: "{name} 提议",
      byAnon: "匿名提议",
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
      soon: "🚀 Coming soon. Stay tuned!",
      watching: "👀 Watching",
      watchingTip: "The admins have seen this and are thinking about it; not decided yet.",
      adminNote: "📝 {note}",
      by: "by {name}",
      byAnon: "anonymous",
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
          const badge = w.status === "adopted" ? ` <span class="hw-badge">${esc(tr("adopted"))}</span>`
            : w.status === "watching" ? ` <span class="hw-badge is-watch" title="${esc(tr("watchingTip"))}">${esc(tr("watching"))}</span>` : "";
          return `<li class="hw-item${w.status === "adopted" ? " is-adopted" : w.status === "watching" ? " is-watching" : ""}">
          <a href="events.html#wishes"><span class="hw-title"><b>${esc(w.title)}</b>${badge}</span>
          ${w.status === "adopted" ? `<span class="wish-soon">${esc(tr("soon"))}</span>` : ""}
          ${w.admin_note ? `<span class="wish-admin-note">${esc(tr("adminNote", { note: w.admin_note }))}</span>` : ""}
          ${w.description ? `<span class="hw-desc">${esc(w.description)}</span>` : ""}
          <small>${esc(w.name ? tr("by", { name: w.name }) : tr("byAnon"))}</small></a>
          <div class="hw-vote"><button type="button" class="hw-vote-btn${on ? " is-on" : ""}" data-vote="${w.id}" aria-pressed="${on}" aria-label="${esc(tr("voteLabel", { title: w.title }))}">${esc(tr(on ? "voted" : "vote"))}</button><small>${esc(tr("votes", { n: w.votes || 0 }))}</small></div>
        </li>`;
        })
        .join("")}</ul>
      <p class="hw-note">${esc(tr("note"))}</p>`;
  }
  box.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-vote]");
    if (!b || busy) return;
    if (!HVLoans.userId) return void (location.href = "account.html?next=" + encodeURIComponent("events.html#wishes")); // players only
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

// Game wishes (想玩桌游) under the event wishes: the most-wanted games still open (declined and bought ones left out),
// each with its photo, a "我也想玩 +1" button and the admins' note; links to wishgames.html.
(() => {
  const box = document.getElementById("home-gamewishes");
  if (!box || !window.HVLoans || !HVLoans.enabled) return;
  const SHOW = 4;
  const STR = {
    zh: {
      title: "🎲 想玩桌游",
      add: "我想玩… →",
      all: "全部 {n} 个 →",
      history: "已购买 →",
      buying: "🛒 购买中",
      watching: "👀 关注中",
      by: "{name} 提议",
      byAnon: "匿名提议",
      none: "🎲 想玩什么桌游？告诉我们 →",
      note: "我们会根据大家的投票和情况决定是否采购，提交不代表一定会买。",
      adminNote: "📝 {note}",
      vote: "🙋 +1",
      voted: "✓ 想玩",
      votes: "{n} 人想玩",
      voteLabel: "我也想玩「{title}」",
    },
    en: {
      title: "🎲 Games we'd like",
      add: "Suggest one →",
      all: "All {n} →",
      history: "Bought →",
      buying: "🛒 Buying",
      watching: "👀 Watching",
      by: "by {name}",
      byAnon: "anonymous",
      none: "🎲 Which game would you like to play? Tell us →",
      note: "We decide what to buy from the votes and other things; suggesting a game doesn't mean we'll buy it.",
      adminNote: "📝 {note}",
      vote: "🙋 +1",
      voted: "✓ Want it",
      votes: "{n} want to play",
      voteLabel: "I want to play \"{title}\" too",
    },
  };
  const tr = (k, vars = {}) => (STR[HVI18n.lang][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
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
    // 购买中 first, then by votes (the server's order).
    const live = [...wishes.filter((w) => w.status === "buying"), ...wishes.filter((w) => w.status === "open" || w.status === "watching")];
    const hasBought = wishes.some((w) => w.status === "bought");
    if (!live.length) {
      box.className = "home-wishes is-empty";
      box.innerHTML = `<a class="hw-none" id="home-gamewishes-title" href="wishgames.html">${esc(tr("none"))}</a>`;
      return;
    }
    box.className = "home-wishes";
    const shown = live.slice(0, SHOW);
    box.innerHTML = `<div class="hw-head"><h2 id="home-gamewishes-title">${esc(tr("title"))}</h2>
        <span class="hw-links">${live.length > SHOW ? `<a href="wishgames.html">${esc(tr("all", { n: live.length }))}</a>` : ""}${hasBought ? `<a href="wishgames.html#bought">${esc(tr("history"))}</a>` : ""}<a href="wishgames.html">${esc(tr("add"))}</a></span></div>
      <ul class="hw-list">${shown
        .map((w) => {
          const on = voted.has(w.id);
          const badge = w.status === "buying" ? ` <span class="hw-badge">${esc(tr("buying"))}</span>`
            : w.status === "watching" ? ` <span class="hw-badge is-watch">${esc(tr("watching"))}</span>` : "";
          return `<li class="hw-item${w.status === "buying" ? " is-adopted" : w.status === "watching" ? " is-watching" : ""}">
          <a href="wishgames.html">${w.photo ? `<img class="hw-photo" src="${esc(HVLoans.wishPhotoUrl(w.photo))}" alt="" loading="lazy">` : ""}<span class="hw-title"><b>${esc(w.title)}</b>${badge}</span>
          ${w.admin_note ? `<span class="wish-admin-note">${esc(tr("adminNote", { note: w.admin_note }))}</span>` : ""}
          ${w.description ? `<span class="hw-desc">${esc(w.description)}</span>` : ""}
          <small>${esc(w.name ? tr("by", { name: w.name }) : tr("byAnon"))}</small></a>
          <div class="hw-vote"><button type="button" class="hw-vote-btn${on ? " is-on" : ""}" data-vote="${w.id}" aria-pressed="${on}" aria-label="${esc(tr("voteLabel", { title: w.title }))}">${esc(tr(on ? "voted" : "vote"))}</button><small>${esc(tr("votes", { n: w.votes || 0 }))}</small></div>
        </li>`;
        })
        .join("")}</ul>
      <p class="hw-note">${esc(tr("note"))}</p>`;
  }
  box.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-vote]");
    if (!b || busy) return;
    if (!HVLoans.userId) return void (location.href = "account.html?next=" + encodeURIComponent("wishgames.html")); // players only
    busy = true;
    b.disabled = true;
    const id = Number(b.dataset.vote);
    try {
      const r = await HVLoans.toggleGameWishVote(id, token());
      const w = wishes.find((x) => x.id === id);
      if (w) w.votes = r.votes;
      r.voted ? voted.add(id) : voted.delete(id);
    } catch {}
    busy = false;
    render();
  });
  HVI18n.onChange(render);
  Promise.all([HVLoans.gameWishes(60), HVLoans.gameWishState(token()).catch(() => null)]).then(
    ([rows, st]) => {
      wishes = rows;
      voted = new Set(((st && st.voted) || []).map(Number));
      render();
    },
    () => {} // not set up yet: no section
  );
})();
