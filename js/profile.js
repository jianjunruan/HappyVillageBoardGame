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
      statRate: "胜率",
      statPoints: "累计得分",
      statGames: "玩过的桌游",
      summary: "🎲 桌游总结",
      colGame: "桌游",
      colPlays: "局数",
      colWins: "胜场",
      colBest: "最高分",
      colAvg: "平均分",
      colLast: "最近一次",
      recent: "📜 最近对局",
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
      statRate: "Win rate",
      statPoints: "Total points",
      statGames: "Different games",
      summary: "🎲 Games summary",
      colGame: "Game",
      colPlays: "Plays",
      colWins: "Wins",
      colBest: "Best",
      colAvg: "Average",
      colLast: "Last played",
      recent: "📜 Recent games",
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
  let signups = null; // own page only
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
        const [s, mine] = await Promise.all([
          HVLoans.playerScores([profile.name, ...(profile.aliases || [])]),
          own ? HVLoans.mySignups().catch(() => []) : Promise.resolve(null),
        ]);
        scores = s;
        signups = mine;
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

  // ---------- numbers ----------
  function stats() {
    const names = new Set([profile.name, ...(profile.aliases || [])].map(norm));
    const games = {};
    const recent = [];
    let plays = 0;
    let wins = 0;
    let points = 0;
    for (const r of scores || []) {
      const players = Array.isArray(r.players) ? r.players : [];
      const me = players.find((pl) => names.has(norm(pl.name)));
      if (!me || typeof me.total !== "number") continue;
      const day = r.played_on || ymd(new Date(r.played_at));
      const rank = 1 + players.filter((pl) => typeof pl.total === "number" && pl.total > me.total).length;
      const won = me.total === r.top_score;
      plays++;
      if (won) wins++;
      points += me.total;
      const g = (games[r.game_id] ||= { id: r.game_id, plays: 0, wins: 0, best: -Infinity, sum: 0, last: "" });
      g.plays++;
      if (won) g.wins++;
      g.best = Math.max(g.best, me.total);
      g.sum += me.total;
      if (day > g.last) g.last = day;
      recent.push({ day, at: r.played_at, game: r.game_id, total: me.total, rank, count: players.length, won });
    }
    recent.sort((a, b) => b.day.localeCompare(a.day) || String(b.at).localeCompare(String(a.at)));
    const list = Object.values(games).sort((a, b) => b.plays - a.plays || b.last.localeCompare(a.last));
    return { plays, wins, points, list, recent };
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
    const rate = Math.round((s.wins / s.plays) * 100);
    const tiles = [
      [tr("statPlays"), s.plays],
      [tr("statWins"), s.wins],
      [tr("statRate"), `${rate}%`],
      [tr("statPoints"), s.points],
      [tr("statGames"), s.list.length],
    ];
    return `<section class="pf-tiles">${tiles.map(([k, v]) => `<div class="pf-tile"><b>${esc(v)}</b><span>${esc(k)}</span></div>`).join("")}</section>
      <section class="ac-card">
        <h2>${esc(tr("summary"))}</h2>
        <div class="pf-table-wrap"><table class="pf-table">
          <thead><tr><th>${esc(tr("colGame"))}</th><th>${esc(tr("colPlays"))}</th><th>${esc(tr("colWins"))}</th><th>${esc(tr("colBest"))}</th><th>${esc(tr("colAvg"))}</th><th>${esc(tr("colLast"))}</th></tr></thead>
          <tbody>${s.list
            .map(
              (g) => `<tr><td><a class="pf-game" href="${esc(gameLink(g.id))}">${thumb(g.id)}<span>${esc(gameName(g.id))}</span></a></td>
                <td>${g.plays}</td><td>${g.wins}</td><td>${esc(num(g.best))}</td><td>${esc(num(g.sum / g.plays))}</td><td>${esc(shortDay(g.last))}</td></tr>`
            )
            .join("")}</tbody>
        </table></div>
        <p class="ac-hint">${esc(tr("matchHint", { names }))}</p>
      </section>
      <section class="ac-card">
        <h2>${esc(tr("recent"))}</h2>
        <ul class="pf-recent">${s.recent
          .slice(0, 15)
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

  function signupsHtml() {
    const today = ymd(new Date());
    const list = signups || [];
    const item = (x) => `<li>
      <span class="pf-day">${esc(fmtDay(x.event_date, { month: "short", day: "numeric", weekday: "short" }))}</span>
      <a href="events.html?id=${x.event_id}">${esc(x.title)}</a>
      <span class="pf-res">🎲 ${esc(x.game_id && catalog[x.game_id] ? gameName(x.game_id) : x.game_name)}${x.table_time ? ` · ${esc(tr("startsAt", { t: x.table_time.slice(0, 5) }))}` : ""}${x.is_host ? ` · <b>${esc(tr("host"))}</b>` : ""}</span>
    </li>`;
    const up = list.filter((x) => x.event_date >= today).reverse(); // soonest first
    const past = list.filter((x) => x.event_date < today);
    return `<section class="ac-card">
      <h2>${esc(tr("signups"))}</h2>
      <p class="ac-hint">${esc(tr("signupsHint"))}</p>
      ${!list.length ? `<p>${esc(tr("noSignups"))}</p>` : ""}
      ${up.length ? `<h3>${esc(tr("upcoming"))}</h3><ul class="pf-recent">${up.map(item).join("")}</ul>` : ""}
      ${past.length ? `<details><summary>${esc(tr("pastSignups", { n: past.length }))}</summary><ul class="pf-recent">${past.map(item).join("")}</ul></details>` : ""}
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
