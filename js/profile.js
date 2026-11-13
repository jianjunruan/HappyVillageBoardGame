// A player's profile page: nickname, other names, bio, and a summary of their games.
//   profile.html          your own profile (sign-in needed; a new account first sets its nickname here)
//   profile.html?u=<id>   anyone's profile (public; never shows the email)
// Games come from the scoreboards (table game_scores): every record where one of the player's names played, matched
// without caring about upper/lower case. Each name belongs to one account only (checked by the database).
// Your own page also lists your event sign-ups made while signed in.
(() => {
  const STR = {
    zh: {
      title: "玩家主页",
      back: "← 桌游目录",
      events: "📅 活动报名",
      toggle: "EN",
      toggleLabel: "Switch to English",
      loading: "正在加载……",
      loadFailed: "无法加载：{msg}",
      retry: "重试",
      noBackend: "账号功能还没有启用（需要设置 Supabase）。",
      notFound: "找不到这位玩家。",
      setupTitle: "欢迎！先设置你的昵称",
      setupHint: "昵称是其他玩家看到的名字。",
      aka: "也叫：{names}",
      since: "{date} 加入",
      noBio: "还没有写个人简介。",
      edit: "✏️ 编辑资料",
      signOut: "退出登录",
      account: "账号设置",
      nickname: "昵称",
      aliases: "我在计分板上用过的其他名字（可不填）",
      aliasesHint: "用逗号或空格分开，最多 5 个。计分板上用昵称或这些名字记录的对局，都会算进你的主页。",
      bio: "个人简介（可不填）",
      bioPh: "喜欢的桌游、常来的时间、想找什么样的牌友……",
      save: "💾 保存",
      saving: "正在保存……",
      cancel: "取消",
      saved: "✓ 已保存",
      needName: "请填写昵称。",
      tooMany: "其他名字最多 5 个，每个不超过 30 个字。",
      nameTaken: "这个名字已经属于别的账号了：昵称和其他名字都不能和别人重复。",
      statPlays: "对局",
      statWins: "胜场",
      statGames: "玩过的桌游",
      summary: "🎲 桌游总结",
      colGame: "桌游",
      colPlays: "局数",
      colWins: "胜场",
      colBest: "最高分",
      colAvg: "平均分",
      colLast: "最近一次",
      recent: "📜 最近对局",
      prevPage: "‹ 上一页",
      shelfTitle: "🎲 玩过的桌游（{n}）",
      shelfTile: "查看玩过的桌游",
      spaceHint: "拖动旋转 · 滚轮或双指缩放 · 点封面查看这款桌游的总结",
      cardLabel: "{name}，玩过 {n} 局",
      modeLabel: "排列方式",
      mode_sphere: "球体",
      mode_helix: "螺旋",
      mode_ring: "环形",
      mode_plane: "平面",
      zoomIn: "放大",
      zoomOut: "缩小",
      playsN: "{n} 局",
      backToShelf: "‹ 返回",
      colFirst: "第一次",
      gameRecords: "📜 对局记录（{n}）",
      toScoreboard: "🧮 去计分板",
      close: "关闭",
      nextPage: "下一页 ›",
      pageOf: "第 {n} / {m} 页",
      rank: "第 {n} 名 / {m} 人",
      points: "{n} 分",
      won: "🏆 获胜",
      noGames: "还没有对局记录。在计分板保存对局时用你的昵称{aliases}，记录就会出现在这里。",
      noGamesAlias: "或其他名字",
      matchHint: "战绩按名字统计：计分板上名字为 {names} 的对局都算在这里。",
      signups: "📅 我的活动报名",
      signupsHint: "只有你自己能看到。登录后报名的活动才会出现在这里。",
      noSignups: "还没有报名记录。",
      upcoming: "即将参加",
      pastSignups: "以前参加的（{n}）",
      suCurrent: "即将参加",
      suHistory: "🕘 历史活动",
      suNoCurrent: "没有还没结束的活动报名。",
      suNoHistory: "还没有历史活动记录。",
      suLoading: "加载中…",
      suLoadFailed: "没能加载：{msg}",
      host: "开桌",
      startsAt: "🕒 {t} 开",
      failed: "出错了：{msg}",
      offline: "网络连接失败，请检查网络后再试。",
    },
    en: {
      title: "Player profile",
      back: "← Games",
      events: "📅 Events",
      toggle: "中文",
      toggleLabel: "切换到中文",
      loading: "Loading…",
      loadFailed: "Couldn't load: {msg}",
      retry: "Retry",
      noBackend: "Accounts aren't switched on yet (Supabase isn't set up).",
      notFound: "This player wasn't found.",
      setupTitle: "Welcome! First, choose your nickname",
      setupHint: "Your nickname is the name other players see.",
      aka: "Also known as: {names}",
      since: "Joined {date}",
      noBio: "No bio yet.",
      edit: "✏️ Edit profile",
      signOut: "Sign out",
      account: "Account",
      nickname: "Nickname",
      aliases: "Other names I've used on scoreboards (optional)",
      aliasesHint: "Separate with commas or spaces, up to 5. Games recorded under your nickname or these names count on your profile.",
      bio: "Bio (optional)",
      bioPh: "Favourite games, when you usually come, what kind of players you're looking for…",
      save: "💾 Save",
      saving: "Saving…",
      cancel: "Cancel",
      saved: "✓ Saved",
      needName: "Please enter a nickname.",
      tooMany: "Up to 5 other names, 30 characters each.",
      nameTaken: "That name belongs to another account: your nickname and other names can't match anyone else's.",
      statPlays: "Games",
      statWins: "Wins",
      statGames: "Different games",
      summary: "🎲 Games summary",
      colGame: "Game",
      colPlays: "Plays",
      colWins: "Wins",
      colBest: "Best",
      colAvg: "Average",
      colLast: "Last played",
      recent: "📜 Recent games",
      prevPage: "‹ Previous",
      shelfTitle: "🎲 Games played ({n})",
      shelfTile: "See the games played",
      spaceHint: "Drag to spin · wheel or pinch to zoom · tap a cover for that game's summary",
      cardLabel: "{name}, {n} games",
      modeLabel: "Layout",
      mode_sphere: "Sphere",
      mode_helix: "Spiral",
      mode_ring: "Rings",
      mode_plane: "Wall",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      playsN: "{n} games",
      backToShelf: "‹ Back",
      colFirst: "First played",
      gameRecords: "📜 Games ({n})",
      toScoreboard: "🧮 Scoreboard",
      close: "Close",
      nextPage: "Next ›",
      pageOf: "Page {n} of {m}",
      rank: "#{n} of {m}",
      points: "{n} pts",
      won: "🏆 Won",
      noGames: "No games yet. Save games on the scoreboards under your nickname{aliases}, and they'll show up here.",
      noGamesAlias: " or other names",
      matchHint: "Games are matched by name: scoreboard games with {names} count here.",
      signups: "📅 My event sign-ups",
      signupsHint: "Only you can see this. Sign-ups made while signed in show up here.",
      noSignups: "No sign-ups yet.",
      upcoming: "Coming up",
      pastSignups: "Past ({n})",
      suCurrent: "Coming up",
      suHistory: "🕘 Past events",
      suNoCurrent: "No sign-ups for events that are still to come.",
      suNoHistory: "No past events yet.",
      suLoading: "Loading…",
      suLoadFailed: "Couldn't load: {msg}",
      host: "host",
      startsAt: "🕒 {t}",
      failed: "Something went wrong: {msg}",
      offline: "Couldn't connect. Check your connection and try again.",
    },
  };
  const lang = () => HVI18n.lang;
  const tr = (k, vars = {}) => (STR[lang()][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const L = (v) => HVI18n.loc(v);
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const main = $("pf-main");
  const locale = () => (lang() === "zh" ? "zh-CN" : "en-GB");
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const fmtDay = (s, opts = { year: "numeric", month: "short", day: "numeric" }) => new Intl.DateTimeFormat(locale(), opts).format(parseYmd(s));
  const norm = (s) => String(s || "").trim().toLowerCase();
  // Month and day; the year too when it isn't this year.
  const shortDay = (s) =>
    fmtDay(s, s.slice(0, 4) === String(new Date().getFullYear()) ? { month: "short", day: "numeric" } : { year: "numeric", month: "short", day: "numeric" });

  const uParam = new URLSearchParams(location.search).get("u");
  const USER = uParam && /^[0-9a-f-]{36}$/i.test(uParam) ? uParam.toLowerCase() : null;

  let own = false;
  let profile = null; // { user_id, name, aliases, bio, created_at }
  let scores = null; // game records with this player
  // 我的活动报名 (own page only): current sign-ups (event today or later) or past ones, 10 a page, each page loaded
  // from the database only when shown; pages already loaded are kept.
  const SU_PAGE = 10;
  const su = { view: "current", page: 1, cache: {}, loading: false, err: null, shown: null }; // shown: the page on screen
  const suKey = () => `${su.view}:${su.page}`;
  async function loadSignups() {
    const key = suKey();
    if (su.cache[key]) return;
    su.loading = true;
    su.err = null;
    try {
      su.cache[key] = await HVLoans.mySignupsPage(ymd(new Date()), su.view === "past", (su.page - 1) * SU_PAGE, SU_PAGE);
    } catch (err) {
      su.err = err;
    }
    su.loading = false;
  }
  async function showSignups(view, page) {
    su.view = view;
    su.page = page;
    if (!su.cache[suKey()]) {
      su.loading = true;
      renderSignups(); // show "loading" in the list only
      await loadSignups();
    }
    renderSignups();
  }
  function renderSignups() {
    const box = main.querySelector("[data-signups]");
    if (box) box.outerHTML = signupsHtml();
  }
  let catalog = {}; // game id -> game
  let loadErr = null;
  let loaded = false;
  let editing = null; // { name, aliases, bio, err } while the form is open
  let busy = false;
  let flash = "";

  function errText(err) {
    if (err instanceof TypeError) return tr("offline");
    if (err && err.code === "HVP02") return tr("nameTaken");
    if (err && err.code === "HVP01") return tr("tooMany");
    return tr("failed", { msg: err.message });
  }
  const splitNames = (s) =>
    String(s || "")
      .split(/[,，、;；\s]+/)
      .map((x) => x.trim())
      .filter(Boolean);

  async function load() {
    loadErr = null;
    try {
      const uid = USER || HVLoans.userId;
      own = Boolean(HVLoans.userId) && uid === HVLoans.userId;
      const [p, data] = await Promise.all([HVLoans.profile(uid), fetch("data/games.json").then((r) => r.json()).catch(() => null)]);
      catalog = Object.fromEntries(((data && data.games) || []).map((g) => [g.id, g]));
      profile = p;
      if (profile) {
        const [s] = await Promise.all([HVLoans.playerScores([profile.name, ...(profile.aliases || [])]), own ? loadSignups() : null]);
        scores = s;
      } else if (own) {
        // A new account: set the nickname first (the one typed at sign-up is suggested).
        editing = { name: localStorage.getItem("hv-pending-name") || "", aliases: "", bio: "", err: "", setup: true };
      }
    } catch (err) {
      loadErr = err;
    }
    loaded = true;
    render();
  }

  const PAGE = 10; // games per page in 桌游总结
  let summaryPage = 1;
  // ---------- numbers ----------
  function stats() {
    const names = new Set([profile.name, ...(profile.aliases || [])].map(norm));
    const games = {};
    const recent = [];
    let plays = 0;
    let wins = 0;
    for (const r of scores || []) {
      const players = Array.isArray(r.players) ? r.players : [];
      const me = players.find((pl) => names.has(norm(pl.name)));
      if (!me || typeof me.total !== "number") continue;
      const day = r.played_on || ymd(new Date(r.played_at));
      const rank = 1 + players.filter((pl) => typeof pl.total === "number" && pl.total > me.total).length;
      const won = me.total === r.top_score;
      plays++;
      if (won) wins++;
      const g = (games[r.game_id] ||= { id: r.game_id, plays: 0, wins: 0, best: -Infinity, sum: 0, last: "", first: "" });
      g.plays++;
      if (won) g.wins++;
      g.best = Math.max(g.best, me.total);
      g.sum += me.total;
      if (day > g.last) g.last = day;
      if (!g.first || day < g.first) g.first = day;
      recent.push({ day, at: r.played_at, game: r.game_id, total: me.total, rank, count: players.length, won });
    }
    recent.sort((a, b) => b.day.localeCompare(a.day) || String(b.at).localeCompare(String(a.at)));
    // Most recently played first; same day: the one played more often.
    const list = Object.values(games).sort((a, b) => b.last.localeCompare(a.last) || b.plays - a.plays);
    return { plays, wins, list, recent };
  }
  const gameName = (id) => {
    const g = catalog[id];
    return g ? (typeof g.name === "string" ? g.name : L(g.name)) : id;
  };
  const gameLink = (id) => {
    const g = catalog[id];
    return g && g.scorer ? g.scorer : `score.html?game=${encodeURIComponent(id)}`;
  };
  const thumb = (id) => {
    const g = catalog[id];
    return `<img class="pf-thumb" src="${esc(HVMedia.imageUrl(g && g.image))}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">`;
  };
  const num = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  // ---------- page ----------
  function render() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    $("pf-title").textContent = tr("title");
    $("pf-back").textContent = tr("back");
    $("pf-events").textContent = tr("events");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    if (!HVLoans.enabled) return void (main.innerHTML = `<p class="ac-msg is-err">${esc(tr("noBackend"))}</p>`);
    if (!loaded) return void (main.innerHTML = `<p class="ac-msg">${esc(tr("loading"))}</p>`);
    if (loadErr)
      return void (main.innerHTML = `<p class="ac-msg is-err">${esc(tr("loadFailed", { msg: errText(loadErr) }))}</p><button class="btn" type="button" data-retry>${esc(tr("retry"))}</button>`);
    if (editing && editing.setup) return void (main.innerHTML = `<section class="ac-card"><h2>${esc(tr("setupTitle"))}</h2><p class="ac-hint">${esc(tr("setupHint"))}</p>${editForm()}</section>`);
    if (!profile) return void (main.innerHTML = `<p class="ac-msg">${esc(tr("notFound"))}</p>`);
    document.title = `${profile.name} · ${tr("title")} · ${HVI18n.t("siteName")}`;
    main.innerHTML = hero() + (editing ? `<section class="ac-card">${editForm()}</section>` : "") + statsHtml() + (own ? signupsHtml() : "");
  }

  function hero() {
    const aliases = profile.aliases || [];
    return `<section class="ac-card pf-hero">
      <span class="pf-avatar" aria-hidden="true">${esc(Array.from(profile.name)[0] || "?")}</span>
      <div class="pf-who">
        <h2>${esc(profile.name)}</h2>
        ${aliases.length ? `<p class="pf-aka">${esc(tr("aka", { names: aliases.join("、") }))}</p>` : ""}
        <p class="pf-since">${esc(tr("since", { date: fmtDay(ymd(new Date(profile.created_at))) }))}</p>
      </div>
      <p class="pf-bio${profile.bio ? "" : " is-empty"}">${esc(profile.bio || tr("noBio"))}</p>
      ${flash ? `<p class="ac-msg is-ok" role="status">${esc(flash)}</p>` : ""}
      ${own && !editing ? `<div class="ac-actions"><button class="btn" type="button" data-edit>${esc(tr("edit"))}</button><a class="btn ghost" href="account.html">${esc(tr("account"))}</a><button class="btn signout" type="button" data-signout>${esc(tr("signOut"))}</button></div>` : ""}
    </section>`;
  }

  function editForm() {
    const e = editing;
    return `<form class="ac-form" data-edit-form novalidate>
      <label class="ac-field"><span>${esc(tr("nickname"))}</span><input name="name" maxlength="30" autocomplete="nickname" value="${esc(e.name)}" required autofocus></label>
      <label class="ac-field"><span>${esc(tr("aliases"))}</span><input name="aliases" value="${esc(e.aliases)}"></label>
      <small class="ac-hint">${esc(tr("aliasesHint"))}</small>
      <label class="ac-field"><span>${esc(tr("bio"))}</span><textarea name="bio" rows="5" maxlength="1000" placeholder="${esc(tr("bioPh"))}">${esc(e.bio)}</textarea></label>
      ${e.err ? `<p class="ac-msg is-err" role="alert">${esc(e.err)}</p>` : ""}
      <div class="ac-actions">
        ${e.setup ? "" : `<button class="btn ghost" type="button" data-cancel>${esc(tr("cancel"))}</button>`}
        <button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("save"))}</button>
      </div>
    </form>`;
  }

  function statsHtml() {
    const s = stats();
    const names = [profile.name, ...(profile.aliases || [])].map((n) => `「${n}」`).join("、");
    if (!s.plays)
      return `<section class="ac-card"><h2>${esc(tr("summary"))}</h2><p class="ac-hint">${esc(tr("noGames", { aliases: (profile.aliases || []).length ? tr("noGamesAlias") : "" }))}</p></section>`;
    const tiles = [
      [tr("statPlays"), s.plays],
      [tr("statWins"), s.wins],
      [tr("statGames"), s.list.length],
    ];
    // 桌游总结: 10 games a page.
    const pages = Math.max(1, Math.ceil(s.list.length / PAGE));
    summaryPage = Math.min(Math.max(1, summaryPage), pages);
    const pageRows = s.list.slice((summaryPage - 1) * PAGE, summaryPage * PAGE);
    const pager = pages > 1
      ? `<nav class="pf-pager" aria-label="${esc(tr("summary"))}">
          <button class="btn ghost btn-sm" type="button" data-page="${summaryPage - 1}"${summaryPage <= 1 ? " disabled" : ""}>${esc(tr("prevPage"))}</button>
          <span>${esc(tr("pageOf", { n: summaryPage, m: pages }))}</span>
          <button class="btn ghost btn-sm" type="button" data-page="${summaryPage + 1}"${summaryPage >= pages ? " disabled" : ""}>${esc(tr("nextPage"))}</button>
        </nav>`
      : "";
    return `<section class="pf-tiles">${tiles
      .map(([k, v], i) =>
        i === 2 // 玩过的桌游: opens the 3D carousel
          ? `<button class="pf-tile pf-tile-btn" type="button" data-shelf aria-label="${esc(tr("shelfTile"))}"><b>${esc(v)}</b><span>${esc(k)} ›</span></button>`
          : `<div class="pf-tile"><b>${esc(v)}</b><span>${esc(k)}</span></div>`
      )
      .join("")}</section>
      <section class="ac-card">
        <h2>${esc(tr("summary"))}</h2>
        <div class="pf-table-wrap"><table class="pf-table">
          <thead><tr><th>${esc(tr("colGame"))}</th><th>${esc(tr("colPlays"))}</th><th>${esc(tr("colWins"))}</th><th>${esc(tr("colBest"))}</th><th>${esc(tr("colAvg"))}</th><th>${esc(tr("colLast"))}</th></tr></thead>
          <tbody>${pageRows
            .map(
              (g) => `<tr><td><a class="pf-game" href="${esc(gameLink(g.id))}">${thumb(g.id)}<span>${esc(gameName(g.id))}</span></a></td>
                <td>${g.plays}</td><td>${g.wins}</td><td>${esc(num(g.best))}</td><td>${esc(num(g.sum / g.plays))}</td><td>${esc(shortDay(g.last))}</td></tr>`
            )
            .join("")}</tbody>
        </table></div>
        ${pager}
        <p class="ac-hint">${esc(tr("matchHint", { names }))}</p>
      </section>
      <section class="ac-card">
        <h2>${esc(tr("recent"))}</h2>
        <ul class="pf-recent">${s.recent
          .slice(0, 10)
          .map(
            (r) => `<li class="${r.won ? "is-won" : ""}">
              <span class="pf-day">${esc(shortDay(r.day))}</span>
              <a class="pf-game" href="${esc(gameLink(r.game))}">${thumb(r.game)}<span>${esc(gameName(r.game))}</span></a>
              <span class="pf-res">${esc(tr("points", { n: r.total }))} · ${esc(tr("rank", { n: r.rank, m: r.count }))}${r.won ? ` <b>${esc(tr("won"))}</b>` : ""}</span>
            </li>`
          )
          .join("")}</ul>
      </section>`;
  }

  // ---------- 玩过的桌游: a 3D space of covers (CSS 3D, no library), and one game's summary ----------
  // Layouts: 球体 (covers spread evenly over a sphere), 螺旋 (a rising spiral), 环形 (rings stacked like a drum) and
  // 平面 (a flat wall). Drag / swipe to spin it in any direction, wheel / pinch / ＋ － to zoom; it turns slowly by itself
  // while left alone. Tap a cover for that game's summary.
  const dlg3d = $("pf3d");
  const CW = 96; // cover card width, px
  const CH = 136; // cover card height (picture + name), px
  const MODES = ["sphere", "helix", "ring", "plane"];
  const space = { list: [], recent: [], view: "space", game: null, mode: "sphere", rx: -12, ry: 0, zoom: 1, raf: 0, paused: false };
  const reduceMotion = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Where each cover goes in a layout: { t: CSS transform, w, h, d } (w/h/d: the layout's size, for fitting it).
  function layout(mode, n) {
    const out = [];
    if (mode === "sphere") {
      const R = Math.max(170, Math.round(47 * Math.sqrt(n)));
      for (let i = 0; i < n; i++) {
        const y = n === 1 ? 0 : 1 - (2 * (i + 0.5)) / n; // -1 … 1, evenly spread (Fibonacci sphere)
        const lat = (Math.asin(y) * 180) / Math.PI;
        const lon = (i * 137.508) % 360;
        out.push(`rotateY(${lon.toFixed(2)}deg) rotateX(${lat.toFixed(2)}deg) translateZ(${R}px)`);
      }
      return { t: out, w: 2 * R + CW, h: 2 * R + CH, d: R };
    }
    if (mode === "helix") {
      const k = Math.min(Math.max(Math.ceil(Math.sqrt(n) * 1.6), 8), 20); // covers per turn
      const R = Math.max(160, Math.round((k * (CW + 14)) / (2 * Math.PI)));
      const dy = (CH + 18) / k; // one turn rises by a card's height, so turns don't overlap
      const top = ((n - 1) * dy) / 2;
      for (let i = 0; i < n; i++) out.push(`translateY(${(i * dy - top).toFixed(1)}px) rotateY(${((i * 360) / k).toFixed(2)}deg) translateZ(${R}px)`);
      return { t: out, w: 2 * R + CW, h: (n - 1) * dy + CH, d: R };
    }
    if (mode === "ring") {
      const k = Math.min(n, 18); // covers per ring
      const rows = Math.ceil(n / k);
      const R = Math.max(150, Math.round((k * (CW + 16)) / (2 * Math.PI)));
      const top = ((rows - 1) * (CH + 18)) / 2;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / k), col = i % k;
        const shift = row % 2 ? 180 / k : 0; // every other ring offset by half a cover
        out.push(`translateY(${(row * (CH + 18) - top).toFixed(1)}px) rotateY(${((col * 360) / k + shift).toFixed(2)}deg) translateZ(${R}px)`);
      }
      return { t: out, w: 2 * R + CW, h: rows * (CH + 18), d: R };
    }
    // plane: a flat wall, a little wider than tall
    const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.5)));
    const rows = Math.ceil(n / cols);
    const gx = CW + 14, gy = CH + 14;
    for (let i = 0; i < n; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      out.push(`translate3d(${((c - (cols - 1) / 2) * gx).toFixed(1)}px, ${((r - (rows - 1) / 2) * gy).toFixed(1)}px, 0px)`);
    }
    return { t: out, w: cols * gx, h: rows * gy, d: 0 };
  }
  const head3d = (title, back) => `<div class="pf3d-head">
      ${back ? `<button class="btn ghost btn-sm" type="button" data-shelf-back>${esc(tr("backToShelf"))}</button>` : ""}
      <h2 id="pf3d-title">${esc(title)}</h2>
      <button class="pf3d-close" type="button" data-shelf-close aria-label="${esc(tr("close"))}">✕</button>
    </div>`;
  function openShelf() {
    const s = stats();
    space.list = s.list;
    space.recent = s.recent;
    space.view = "space";
    space.rx = space.mode === "plane" ? 0 : -12;
    space.ry = 0;
    space.zoom = 1;
    renderSpace();
    if (!dlg3d.open) {
      document.documentElement.classList.add("pf3d-open"); // full screen: no page scrolling behind it
      dlg3d.showModal();
    }
    startSpin();
  }
  function renderSpace() {
    if (space.view === "game") return renderGame();
    const n = space.list.length;
    const cards = space.list
      .map((g, i) => `<button class="pf3d-card" type="button" data-card="${i}" aria-label="${esc(tr("cardLabel", { name: gameName(g.id), n: g.plays }))}">
          <img src="${esc(HVMedia.imageUrl(catalog[g.id] && catalog[g.id].image))}" alt="" draggable="false" decoding="async" onerror="this.src='images/placeholder.svg'">
          <b>${esc(gameName(g.id))}</b>
        </button>`)
      .join("");
    dlg3d.innerHTML = `${head3d(tr("shelfTitle", { n }), false)}
      <div class="pf3d-stage" tabindex="-1">
        <div class="pf3d-world">${cards}</div>
        <div class="pf3d-zoom"><button type="button" data-zoom="1" aria-label="${esc(tr("zoomIn"))}">＋</button><button type="button" data-zoom="-1" aria-label="${esc(tr("zoomOut"))}">－</button></div>
      </div>
      <div class="pf3d-foot"><p class="pf3d-hint">${esc(tr("spaceHint"))}</p>
      <div class="pf3d-modes" role="group" aria-label="${esc(tr("modeLabel"))}">${MODES.map(
        (m) => `<button type="button" data-mode="${m}" aria-pressed="${m === space.mode}"${m === space.mode ? ' class="is-on"' : ""}>${esc(tr("mode_" + m))}</button>`
      ).join("")}</div></div>`;
    dlg3d.classList.add("is-space");
    placeCards(false);
    applyWorld(false);
  }
  // Puts every cover where the current layout wants it (animated when switching layouts).
  function placeCards(animate) {
    const L3 = layout(space.mode, space.list.length);
    space.fitBox = L3;
    dlg3d.querySelectorAll(".pf3d-card").forEach((c, i) => {
      c.classList.toggle("no-anim", !animate);
      c.style.transform = L3.t[i];
    });
  }
  // Turns and sizes the whole space: fits the layout to the stage, then the user's zoom on top.
  function applyWorld(animate) {
    const world = dlg3d.querySelector(".pf3d-world"), stage = dlg3d.querySelector(".pf3d-stage");
    if (!world || !space.fitBox) return;
    const b = space.fitBox;
    // Full screen: leave room for the title at the top and the layout buttons at the bottom.
    const fit = Math.min(1.5, (stage.clientWidth * 0.92) / b.w, Math.max(200, stage.clientHeight - 170) / b.h);
    const sc = fit * space.zoom;
    world.classList.toggle("no-anim", !animate);
    world.style.transform = `translateZ(${(-b.d * sc).toFixed(1)}px) rotateX(${space.rx.toFixed(2)}deg) rotateY(${space.ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
  }
  // The slow turn while nobody touches it (not for 平面, and not with "reduce motion").
  function startSpin() {
    cancelAnimationFrame(space.raf);
    if (reduceMotion()) return;
    let last = performance.now();
    const tick = (now) => {
      if (!dlg3d.open) return;
      const dt = Math.min(64, now - last);
      last = now;
      if (space.view === "space" && space.mode !== "plane" && !space.paused && !drag) {
        space.ry += dt * 0.006; // about 6° a second
        applyWorld(false);
      }
      space.raf = requestAnimationFrame(tick);
    };
    space.raf = requestAnimationFrame(tick);
  }
  const clampRx = (v) => Math.max(space.mode === "plane" ? -35 : -80, Math.min(space.mode === "plane" ? 35 : 80, v));
  const clampRy = (v) => (space.mode === "plane" ? Math.max(-45, Math.min(45, v)) : v);
  function setMode(m) {
    if (!MODES.includes(m) || m === space.mode) return;
    space.mode = m;
    try {
      localStorage.setItem("hv-pf3d-mode", m);
    } catch {}
    dlg3d.querySelectorAll("[data-mode]").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.mode === m);
      b.setAttribute("aria-pressed", String(b.dataset.mode === m));
    });
    space.rx = m === "plane" ? 0 : -12;
    space.ry = m === "plane" ? 0 : space.ry % 360;
    placeCards(!reduceMotion());
    applyWorld(!reduceMotion());
  }
  try {
    const saved = localStorage.getItem("hv-pf3d-mode");
    if (MODES.includes(saved)) space.mode = saved;
  } catch {}
  function openGame(i) {
    space.view = "game";
    space.game = space.list[i];
    renderGame();
    const back = dlg3d.querySelector("[data-shelf-back]");
    if (back) back.focus();
  }
  function renderGame() {
    const g = space.game;
    const cat = catalog[g.id];
    const rows = space.recent.filter((r) => r.game === g.id);
    const tiles = [
      [tr("colPlays"), g.plays],
      [tr("colWins"), g.wins],
      [tr("colBest"), num(g.best)],
      [tr("colAvg"), num(g.sum / g.plays)],
      [tr("colFirst"), shortDay(g.first)],
      [tr("colLast"), shortDay(g.last)],
    ];
    dlg3d.classList.remove("is-space");
    dlg3d.innerHTML = `<div class="pf3d-page">${head3d(gameName(g.id), true)}
      <div class="pf3d-game">
        <img class="pf3d-cover" src="${esc(HVMedia.imageUrl(cat && cat.image))}" alt="" onerror="this.src='images/placeholder.svg'">
        <div class="pf3d-gtiles">${tiles.map(([k, v], i) => `<div class="pf-tile${i >= 4 ? " is-date" : ""}"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join("")}</div>
      </div>
      <p class="pf3d-links"><a class="btn ghost btn-sm" href="${esc(gameLink(g.id))}">${esc(tr("toScoreboard"))}</a>${cat ? ` <a class="btn ghost btn-sm" href="index.html#/game/${encodeURIComponent(g.id)}">🎲 ${esc(gameName(g.id))}</a>` : ""}</p>
      <h3>${esc(tr("gameRecords", { n: rows.length }))}</h3>
      <ul class="pf-recent">${rows
        .map((r) => `<li class="${r.won ? "is-won" : ""}"><span class="pf-day">${esc(shortDay(r.day))}</span>
          <span class="pf-res">${esc(tr("points", { n: r.total }))} · ${esc(tr("rank", { n: r.rank, m: r.count }))}${r.won ? ` <b>${esc(tr("won"))}</b>` : ""}</span></li>`)
        .join("")}</ul></div>`;
    dlg3d.scrollTop = 0;
  }

  // Dragging (one finger / the mouse) spins the space; two fingers pinch to zoom. A tap is a click.
  let drag = null;
  const touches = new Map(); // pointerId → { x, y }
  let pinch = null;
  // The click a browser fires right after releasing a drag (same task) is the end of that drag, not a tap.
  let swallowClick = false;
  const setZoom = (z) => {
    space.zoom = Math.max(0.45, Math.min(2.6, z));
    applyWorld(false);
  };
  dlg3d.addEventListener("pointerdown", (e) => {
    const stage = e.target.closest(".pf3d-stage");
    if (!stage || e.button > 0 || e.target.closest(".pf3d-zoom")) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: space.zoom };
      drag = null;
      return;
    }
    drag = { x: e.clientX, y: e.clientY, rx: space.rx, ry: space.ry, id: e.pointerId, stage, moved: false };
  });
  dlg3d.addEventListener("pointermove", (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) {
      const [a, b] = [...touches.values()];
      return setZoom(pinch.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, pinch.dist)));
    }
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    if (!drag.moved) {
      drag.moved = true;
      try {
        drag.stage.setPointerCapture(e.pointerId); // keep following the finger outside the stage
      } catch {}
    }
    space.ry = clampRy(drag.ry + dx * 0.35);
    space.rx = clampRx(drag.rx - dy * 0.35);
    applyWorld(false);
  });
  const endPointer = (e) => {
    touches.delete(e.pointerId);
    if (touches.size < 2) pinch = null;
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved) {
      swallowClick = true;
      setTimeout(() => (swallowClick = false), 0);
    }
    drag = null;
  };
  dlg3d.addEventListener("pointerup", endPointer);
  dlg3d.addEventListener("pointercancel", endPointer);
  dlg3d.addEventListener(
    "wheel",
    (e) => {
      if (!e.target.closest(".pf3d-stage")) return;
      e.preventDefault();
      setZoom(space.zoom * Math.pow(1.0015, -e.deltaY));
    },
    { passive: false }
  );
  // Pause the slow turn while the pointer is over the space or a cover has keyboard focus.
  dlg3d.addEventListener("pointerover", (e) => (space.paused = Boolean(e.target.closest(".pf3d-stage")) && e.pointerType === "mouse"));
  dlg3d.addEventListener("pointerleave", () => (space.paused = false));
  dlg3d.addEventListener("focusin", (e) => (space.paused = Boolean(e.target.closest(".pf3d-card"))));
  dlg3d.addEventListener("click", (e) => {
    if (e.target === dlg3d || e.target.closest("[data-shelf-close]")) return dlg3d.close();
    if (e.target.closest("[data-shelf-back]")) {
      space.view = "space";
      renderSpace();
      return;
    }
    const mode = e.target.closest("[data-mode]");
    if (mode) return setMode(mode.dataset.mode);
    const zoom = e.target.closest("[data-zoom]");
    if (zoom) return setZoom(space.zoom * (zoom.dataset.zoom === "1" ? 1.25 : 0.8));
    const card = e.target.closest("[data-card]");
    if (card && !swallowClick) return openGame(Number(card.dataset.card));
  });
  // Arrow keys spin it; + / - zoom.
  dlg3d.addEventListener("keydown", (e) => {
    if (space.view !== "space") return;
    const k = e.key;
    if (k === "ArrowLeft" || k === "ArrowRight") space.ry = clampRy(space.ry + (k === "ArrowRight" ? 15 : -15));
    else if (k === "ArrowUp" || k === "ArrowDown") space.rx = clampRx(space.rx + (k === "ArrowUp" ? 10 : -10));
    else if (k === "+" || k === "=") return setZoom(space.zoom * 1.25);
    else if (k === "-") return setZoom(space.zoom * 0.8);
    else return;
    e.preventDefault();
    applyWorld(true);
  });
  dlg3d.addEventListener("close", () => {
    cancelAnimationFrame(space.raf);
    document.documentElement.classList.remove("pf3d-open");
  });
  window.addEventListener("resize", () => {
    if (dlg3d.open && space.view === "space") applyWorld(false);
  });
  HVI18n.onChange(() => {
    if (dlg3d.open) renderSpace();
  });

  function signupsHtml() {
    const item = (x) => `<li>
      <span class="pf-day">${esc(fmtDay(x.event_date, { month: "short", day: "numeric", weekday: "short" }))}</span>
      <a href="events.html?id=${x.event_id}">${esc(x.title)}</a>
      <span class="pf-res">🎲 ${esc(x.game_id && catalog[x.game_id] ? gameName(x.game_id) : x.game_name)}${x.table_time ? ` · ${esc(tr("startsAt", { t: x.table_time.slice(0, 5) }))}` : ""}${x.is_host ? ` · <b>${esc(tr("host"))}</b>` : ""}</span>
    </li>`;
    const past = su.view === "past";
    // While the next page loads, keep the one on screen (dimmed) if it is the same list, so nothing jumps.
    const kept = su.loading && su.shown && su.shown.view === su.view ? su.shown.data : null;
    const data = su.cache[suKey()] || kept;
    if (su.cache[suKey()]) su.shown = { view: su.view, data };
    let body;
    if (su.err) body = `<p class="ac-msg is-err">${esc(tr("suLoadFailed", { msg: errText(su.err) }))}</p><button class="btn ghost btn-sm" type="button" data-su-page="${su.page}">${esc(tr("retry"))}</button>`;
    else if (!data) body = `<p class="ac-hint">${esc(tr("suLoading"))}</p>`;
    else if (!data.total) body = `<p>${esc(tr(past ? "suNoHistory" : "suNoCurrent"))}</p>`;
    else {
      const pages = Math.max(1, Math.ceil(data.total / SU_PAGE));
      body = `<ul class="pf-recent${su.loading ? " is-loading" : ""}">${data.rows.map(item).join("")}</ul>
        ${pages > 1 ? `<nav class="pf-pager" aria-label="${esc(tr(past ? "suHistory" : "suCurrent"))}">
          <button class="btn ghost btn-sm" type="button" data-su-page="${su.page - 1}"${su.page <= 1 || su.loading ? " disabled" : ""}>${esc(tr("prevPage"))}</button>
          <span>${esc(tr("pageOf", { n: su.page, m: pages }))}</span>
          <button class="btn ghost btn-sm" type="button" data-su-page="${su.page + 1}"${su.page >= pages || su.loading ? " disabled" : ""}>${esc(tr("nextPage"))}</button>
        </nav>` : ""}`;
    }
    return `<section class="ac-card" data-signups>
      <div class="pf-su-head">
        <h2>${esc(tr("signups"))}</h2>
        <div class="pf-su-tabs" role="tablist">
          <button type="button" role="tab" class="chip${past ? "" : " is-on"}" aria-selected="${!past}" data-su-view="current">${esc(tr("suCurrent"))}</button>
          <button type="button" role="tab" class="chip${past ? " is-on" : ""}" aria-selected="${past}" data-su-view="past">${esc(tr("suHistory"))}</button>
        </div>
      </div>
      <p class="ac-hint">${esc(tr("signupsHint"))}</p>
      ${body}
    </section>`;
  }

  // ---------- actions ----------
  function readForm() {
    const f = main.querySelector("[data-edit-form]");
    if (!f || !editing) return;
    editing.name = f.elements.name.value;
    editing.aliases = f.elements.aliases.value;
    editing.bio = f.elements.bio.value;
  }
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-shelf")) return openShelf();
    if (b.dataset.suView) return b.dataset.suView === su.view ? undefined : void showSignups(b.dataset.suView, 1);
    if (b.dataset.suPage) return su.loading ? undefined : void showSignups(su.view, Number(b.dataset.suPage));
    if (b.dataset.page) {
      summaryPage = Number(b.dataset.page);
      render();
      const pager = main.querySelector(".pf-pager");
      if (pager) pager.closest(".ac-card").scrollIntoView({ block: "nearest" });
      return;
    }
    if (b.hasAttribute("data-retry")) {
      loaded = false;
      render();
      return void load();
    }
    if (b.hasAttribute("data-edit")) {
      flash = "";
      editing = { name: profile.name, aliases: (profile.aliases || []).join("、"), bio: profile.bio || "", err: "" };
      return render();
    }
    if (b.hasAttribute("data-cancel")) {
      editing = null;
      return render();
    }
    if (b.hasAttribute("data-signout")) {
      HVLoans.signOut();
      location.href = "index.html";
    }
  });
  main.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy || !editing) return;
    readForm();
    const name = editing.name.trim();
    const aliases = splitNames(editing.aliases).filter((a) => norm(a) !== norm(name));
    if (!name) {
      editing.err = tr("needName");
      return render();
    }
    if (aliases.length > 5 || aliases.some((a) => a.length > 30)) {
      editing.err = tr("tooMany");
      return render();
    }
    busy = true;
    editing.err = "";
    render();
    try {
      const wasSetup = editing.setup;
      profile = await HVLoans.saveProfile({ name: name.slice(0, 30), aliases, bio: editing.bio.trim() }, Boolean(profile));
      if (wasSetup) localStorage.removeItem("hv-pending-name");
      editing = null;
      flash = tr("saved");
      busy = false;
      loaded = false;
      render();
      await load(); // names may have changed, so the games do too
    } catch (err) {
      busy = false;
      editing.err = errText(err);
      render();
    }
  });
  $("lang-toggle").addEventListener("click", () => {
    readForm();
    HVI18n.toggle();
  });
  HVI18n.onChange(render);

  render();
  if (!HVLoans.enabled) return;
  if (!USER && !HVLoans.user) return void location.replace("account.html?next=profile.html");
  load();
})();
