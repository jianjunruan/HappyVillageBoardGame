// Scoreboard for any game (score.html?game=<id>): record each player's final score (plus optional choices such
// as faction or colour), save the game to Supabase (table game_scores), and show every record and leaderboards.
//
// Each game can describe its extra choices in js/scoreboards/<id>.js by calling HVScoreboard.register(id, config).
// Games without a config file get the simple version: date, player names and scores.
//
// How the game is won comes from "scoring" in data/games.json (a config file can set the same keys):
//   mode:         "high" (default: each player's score, highest wins) | "low" (lowest score wins) |
//                 "win" (no scores: tick who won) | "teams" (each player picks a side, then which side won) |
//                 "coop" (everyone wins or loses together; optional team score)
//   teams:        (teams) [{ key, zh, en, color }]
//   score:        (coop) { zh, en, min, max }: an optional score for the whole team (e.g. Hanabi 0–25)
//   "none" means the game isn't scored (no 🧮 button). Records save the method in details.mode (not for "high"), and
//   players[].total is the score, or 1 / 0 (won / lost) without scores; top_score is the winning value either way, so a
//   player won when total === top_score. Sides are saved on each player as "team", the winning side as details.winTeam,
//   and a co-op game's result as details.won (+ details.score).
//
// Config:
//   name:         { zh, en }       game name for the header (default: the name in data/games.json)
//   maxPlayers:   number           (default: the most players in data/games.json, or 6)
//   minScore:     number           lowest score allowed (default 0; e.g. -999 for games where scores can be negative)
//   playerFields: [field]          choices made by each player, saved on each player in "players"
//   gameFields:   [field]          choices about the whole game, saved in "details"
// A field:
//   key           saved under this key, e.g. "faction"
//   type          "cards"    one option per player, picked from a dialog of cards (picture or icon, name, text rows)
//                 "swatches" one option per player, picked from a row of round buttons (colour or picture)
//                 "chips"    (gameFields) several options for the whole game, up to `max`
//   label         { zh, en }       field name, e.g. 角色
//   unique        true: two players can't pick the same option
//   max           (chips) how many can be picked
//   statsTitle    { zh, en }       heading of this field's table on the leaderboard (omit for no table)
//   favLabel      { zh, en }       (one cards field) adds a "favourite …" column to the players table
//   allowCustom   (cards) true: players can also type a name that isn't in the list (saved as that text)
//   groups        (cards) [{ key, label: { zh, en } }]: headings in the picker; each option names its group with "group"
//   options       [{ key, name: { zh, en }, img, icon, color, rows: [{ label: { zh, en }, text: { zh, en } }], summary: { zh, en }, note: { zh, en } }]
//                 img: picture; icon: emoji when there's no picture; color: accent colour;
//                 rows: text on the card (cards); summary: one line shown on the button once picked (default: last row);
//                 note: line shown under the swatches once picked
(() => {
  const params = new URLSearchParams(location.search);
  const GAME_ID = (params.get("game") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const MAX_SCORE = 9999;
  const CONFIGS = {};
  window.HVScoreboard = { register: (id, cfg) => (CONFIGS[id] = cfg) };

  const STR = {
    zh: {
      title: "积分榜",
      back: "← 返回桌游",
      tabScore: "📝 记录一局",
      tabRecords: "📜 战绩记录",
      tabLeaders: "🏆 排行榜",
      date: "游戏日期",
      thisGame: "这一局",
      players: "玩家和得分",
      playerN: "玩家 {n}",
      name: "名字",
      score: "得分",
      none: "不选",
      pickPh: "点选{label}（可不选）",
      pickFor: "{name} 的{label}",
      pickSub: "已被其他玩家选走的不能再选。",
      takenBy: "已被 {name} 选",
      upTo: "最多选 {n} 个",
      customLabel: "列表里没有？手动填写",
      customPh: "输入{label}名称",
      customUse: "使用",
      customTag: "手动填写",
      close: "关闭",
      removePlayer: "移除玩家 {n}",
      addPlayer: "＋ 添加玩家",
      hintBase: "名字和得分必填。名字和上次写一样，排行榜才会算在一起。",
      hintOptional: "名字和得分必填；{fields}可以不填。名字和上次写一样，排行榜才会算在一起。",
      save: "💾 保存这一局",
      saving: "正在保存……",
      saved: "✓ 已保存！",
      viewRecords: "查看战绩记录",
      needName: "请填写第 {n} 位玩家的名字。",
      needScore: "请填写 {name} 的得分（{min}–{max} 的整数）。",
      futureDate: "游戏日期不能晚于今天。",
      needDate: "请选择游戏日期。",
      clear: "清空表格",
      clearConfirm: "清空表格里填写的内容？",
      saveFailed: "保存失败：{msg}",
      tooMany: "刚才保存的记录太多了，请一分钟后再试。",
      offline: "网络连接失败，请检查网络后再试。",
      noBackend: "战绩记录还没有启用（需要设置 Supabase）。",
      noGame: "找不到这款游戏。",
      won: "🏆 {names} 获胜！",
      noScoring: "这款游戏不需要计分。",
      playersOnly: "玩家",
      won2: "🏆 赢了",
      winTag: "获胜",
      lostTag: "未获胜",
      teamLabel: "阵营",
      whoWon: "哪一方获胜？",
      teamWon: "🏆 {team}获胜！",
      coopResult: "结果",
      coopWin: "✅ 合作成功",
      coopLose: "❌ 合作失败",
      optional: "（可不填）",
      hintNames: "名字必填。名字和上次写一样，排行榜才会算在一起。",
      hintLow: "这款游戏分数最低的获胜。",
      hintWin: "点「🏆 赢了」标出获胜的玩家（可以有多位）。",
      hintTeams: "给每位玩家选阵营，再选哪一方获胜。",
      hintCoop: "大家一起赢或一起输，选好结果就行。",
      needWinner: "请标出至少一位获胜的玩家。",
      needTeam: "请给 {name} 选择阵营。",
      needWinTeam: "请选择哪一方获胜。",
      needCoop: "请选择合作成功还是失败。",
      needCoopScore: "{label}要是 {min}–{max} 的整数（也可以不填）。",
      lbPlayersTitle: "玩家战绩",
      lbTeamsTitle: "各阵营胜率",
      lbTeam: "阵营",
      lbCoopTitle: "全队战绩",
      lbCoopWins: "成功",
      lbCoopRate: "成功率",
      lbLow: "最低分",
      lbCoopHint: "合作游戏全队一起算胜负。",
      lbTeamHint: "按阵营统计：这一方赢了的局数 ÷ 这一方有人参加的局数。",
      pending: "⏳ 活动中开始的对局，等待在活动页面填写分数",
      pendingShort: "待填",
      filter: "按玩家名字筛选",
      prevPage: "‹ 上一页",
      nextPage: "下一页 ›",
      pageOf: "第 {n} / {m} 页",
      loading: "正在加载……",
      loadFailed: "无法加载战绩记录：{msg}",
      retry: "重试",
      empty: "还没有记录。打完一局后在「记录一局」里保存。",
      noMatch: "没有这位玩家的记录。",
      gamesCount: "共 {n} 局",
      points: "{n} 分",
      delete: "删除",
      edit: "编辑",
      editing: "✏️ 正在修改 {date} 的记录（管理员）",
      cancelEdit: "取消修改",
      saveEdit: "💾 保存修改",
      updated: "✓ 已修改",
      updateFailed: "修改失败：{msg}",
      deleteConfirm: "删除这条记录？删除后不能恢复。",
      deleteFailed: "删除失败：{msg}",
      lbTotal: "总榜（累计得分）",
      lbSum: "累计总分",
      lbTotalHint: "所有已保存对局的得分相加，打得越多累计越高。",
      lbWinsTitle: "胜场排行",
      lbPlayer: "玩家",
      lbGames: "局数",
      lbWins: "胜场",
      lbRate: "胜率",
      lbBest: "最高分",
      lbAvg: "平均分",
      lbTopAvg: "冠军平均分",
      lbHint: "按名字统计：同一个人每次请写同样的名字（不分大小写）。并列第一都算获胜。",
      toggle: "EN",
      toggleLabel: "Switch to English",
    },
    en: {
      title: "Scoreboard",
      back: "← Back to games",
      tabScore: "📝 Record a game",
      tabRecords: "📜 Records",
      tabLeaders: "🏆 Leaderboard",
      date: "Date played",
      thisGame: "This game",
      players: "Players and scores",
      playerN: "Player {n}",
      name: "Name",
      score: "Score",
      none: "None",
      pickPh: "Pick a {label} (optional)",
      pickFor: "{label} for {name}",
      pickSub: "Options another player has taken can't be picked.",
      takenBy: "Taken by {name}",
      upTo: "Pick up to {n}",
      customLabel: "Not in the list? Type it in",
      customPh: "{label} name",
      customUse: "Use",
      customTag: "Typed in",
      close: "Close",
      removePlayer: "Remove player {n}",
      addPlayer: "+ Add player",
      hintBase: "Name and score are required. Use the same name as last time so the leaderboard adds it up.",
      hintOptional: "Name and score are required; {fields} are optional. Use the same name as last time so the leaderboard adds it up.",
      save: "💾 Save this game",
      saving: "Saving…",
      saved: "✓ Saved!",
      viewRecords: "View records",
      needName: "Enter a name for player {n}.",
      needScore: "Enter a score for {name} (a whole number from {min} to {max}).",
      futureDate: "The date can't be later than today.",
      needDate: "Pick the date played.",
      clear: "Clear form",
      clearConfirm: "Clear everything in the form?",
      saveFailed: "Couldn't save: {msg}",
      tooMany: "Too many records were saved just now. Try again in a minute.",
      offline: "Couldn't connect. Check your connection and try again.",
      noBackend: "Game records aren't switched on yet (Supabase isn't set up).",
      noGame: "Game not found.",
      won: "🏆 {names} wins!",
      noScoring: "This game isn't scored.",
      playersOnly: "Players",
      won2: "🏆 Won",
      winTag: "Won",
      lostTag: "Lost",
      teamLabel: "Side",
      whoWon: "Which side won?",
      teamWon: "🏆 {team} won!",
      coopResult: "Result",
      coopWin: "✅ We won",
      coopLose: "❌ We lost",
      optional: " (optional)",
      hintNames: "Names are required. Use the same name as last time so the leaderboard adds it up.",
      hintLow: "In this game the lowest score wins.",
      hintWin: "Tap \"🏆 Won\" for each winner (there can be more than one).",
      hintTeams: "Pick each player's side, then the side that won.",
      hintCoop: "Everyone wins or loses together: just pick the result.",
      needWinner: "Mark at least one winner.",
      needTeam: "Pick a side for {name}.",
      needWinTeam: "Pick the side that won.",
      needCoop: "Pick whether you won or lost.",
      needCoopScore: "{label} must be a whole number from {min} to {max} (or left empty).",
      lbPlayersTitle: "Players",
      lbTeamsTitle: "Wins by side",
      lbTeam: "Side",
      lbCoopTitle: "Team record",
      lbCoopWins: "Won",
      lbCoopRate: "Win rate",
      lbLow: "Lowest",
      lbCoopHint: "In a co-op game the whole team wins or loses together.",
      lbTeamHint: "By side: games that side won ÷ games someone played on that side.",
      pending: "⏳ Started at an event, waiting for scores on the event page",
      pendingShort: "to come",
      filter: "Filter by player name",
      prevPage: "‹ Previous",
      nextPage: "Next ›",
      pageOf: "Page {n} of {m}",
      loading: "Loading…",
      loadFailed: "Couldn't load the records: {msg}",
      retry: "Try again",
      empty: "No records yet. After a game, save it under Record a game.",
      noMatch: "No records for that player.",
      gamesCount: "{n} games",
      points: "{n} pts",
      delete: "Delete",
      edit: "Edit",
      editing: "✏️ Editing the record from {date} (admin)",
      cancelEdit: "Cancel editing",
      saveEdit: "💾 Save changes",
      updated: "✓ Changes saved",
      updateFailed: "Couldn't save the changes: {msg}",
      deleteConfirm: "Delete this record? This can't be undone.",
      deleteFailed: "Couldn't delete: {msg}",
      lbTotal: "Overall (total points)",
      lbSum: "Total points",
      lbTotalHint: "Every saved game's score added up, so the more you play, the higher it goes.",
      lbWinsTitle: "Most wins",
      lbPlayer: "Player",
      lbGames: "Games",
      lbWins: "Wins",
      lbRate: "Win rate",
      lbBest: "Best",
      lbAvg: "Average",
      lbTopAvg: "Winning avg",
      lbHint: "Counted by name: use the same name each time (capital letters don't matter). A shared first place counts as a win for each.",
      toggle: "中文",
      toggleLabel: "切换到中文",
    },
  };
  const tr = (key, vars = {}) =>
    (STR[HVI18n.lang][key] ?? STR.zh[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[HVI18n.lang] ?? o.zh ?? o.en ?? "");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const $ = (id) => document.getElementById(id);
  const joinNames = (names) => names.join(HVI18n.lang === "zh" ? "、" : " & ");
  const nameKey = (n) => String(n).trim().toLowerCase();
  const today = () => HVDatePicker.today();

  // ---------- the game and its config ----------
  let CFG = null; // filled in by start()
  let gameName = { zh: "", en: "" };
  const pFields = () => CFG.playerFields || [];
  const MODE = () => CFG.mode || "high";
  const SCORED = () => MODE() === "high" || MODE() === "low"; // each player has a score
  const teamOf = (key) => (CFG.teams || []).find((t) => t.key === key);
  const recMode = (r) => (r.details && r.details.mode) || "high";
  const gFields = () => CFG.gameFields || [];
  const optOf = (field, key) => (field.options || []).find((o) => o.key === key);
  const optName = (field, key) => {
    const o = optOf(field, key);
    return o ? L(o.name) : key || "";
  };
  // A small picture (or the icon on a coloured badge) for an option.
  function optPic(o, cls) {
    if (!o) return "";
    if (o.img) return `<img class="${cls}" src="${esc(o.img)}" alt="" loading="lazy">`;
    return `<span class="${cls} sb-badge" style="--c:${esc(o.color || "var(--accent)")}" aria-hidden="true">${esc(o.icon || L(o.name).slice(0, 1))}</span>`;
  }
  // What goes before a chip's name: its picture, or its icon.
  const chipLead = (o) => (!o ? "" : o.img ? `<img class="sb-chip-img" src="${esc(o.img)}" alt="" loading="lazy">` : o.icon ? `<span aria-hidden="true">${esc(o.icon)}</span> ` : "");
  const dotHtml = (o) =>
    o
      ? o.img
        ? `<img class="sb-dot" src="${esc(o.img)}" alt="" title="${esc(L(o.name))}" style="--c:${esc(o.color || "transparent")}">`
        : `<i class="sb-dot" style="--c:${esc(o.color || "var(--accent)")}" title="${esc(L(o.name))}"></i>`
      : "";

  // ---------- the form (kept in this browser until saved) ----------
  const KEY = `hv-score-draft-${GAME_ID}`;
  const blankPlayer = () => Object.fromEntries([["name", ""], ["score", ""], ["won", false], ["team", ""], ...pFields().map((f) => [f.key, ""])]);
  const blankRes = () => ({ team: "", coop: "", score: "" }); // the winning side / co-op result and score
  const blankExtra = () => Object.fromEntries(gFields().map((f) => [f.key, []]));
  const blank = () => ({ date: today(), dateSetOn: null, players: Array.from({ length: Math.min(3, CFG.maxPlayers) }, blankPlayer), extra: blankExtra(), res: blankRes() });
  function load() {
    try {
      // The Age of Innovation page kept its form under its own key before the scoreboards were shared.
      const raw = localStorage.getItem(KEY) || (GAME_ID === "age-of-innovation" ? localStorage.getItem("hv-aoi-draft") : null);
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.players) || !d.players.length) return null;
      if (d.dateSetOn !== today() || !d.date || d.date > today()) d.date = today(); // a date picked on an earlier day goes back to today
      d.players = d.players.slice(0, CFG.maxPlayers).map((p) => ({ ...blankPlayer(), ...p }));
      d.extra = { ...blankExtra(), ...(d.extra || {}) };
      d.res = { ...blankRes(), ...(d.res || {}) };
      return d;
    } catch {
      return null;
    }
  }
  function store() {
    if (editing) return; // changes to a saved record aren't kept as the draft
    try {
      localStorage.setItem(KEY, JSON.stringify(F));
    } catch {}
  }
  let F = null;
  let saveState = null; // null | "saving" | "saved" | "updated" | { err }
  // Admins can load a saved record into the form to change it; the visitor's own draft waits in draftAside.
  let editing = null; // { id, day } while changing a saved record
  let draftAside = null;

  // ---------- tabs ----------
  const TABS = ["score", "records", "leaders"];
  const tabNow = () => (TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "score");
  function renderTabs() {
    const now = tabNow();
    const label = { score: "tabScore", records: "tabRecords", leaders: "tabLeaders" };
    $("sb-tabs").innerHTML = TABS.map(
      (k) => `<a class="chip${k === now ? " is-on" : ""}" href="#${k}"${k === now ? ' aria-current="page"' : ""}>${esc(tr(label[k]))}</a>`
    ).join("");
    TABS.forEach((k) => ($(`tab-${k}`).hidden = k !== now));
    if (now !== "score") loadRecords();
  }

  // ---------- record a game ----------
  const takenBy = (field, i) => {
    const m = new Map();
    if (!field.unique) return m;
    F.players.forEach((q, j) => j !== i && q[field.key] && m.set(q[field.key], q.name.trim() || tr("playerN", { n: j + 1 })));
    return m;
  };

  function cardsFieldHtml(field, p, i) {
    const v = p[field.key];
    // A typed-in value (allowCustom) shows as a pseudo-option.
    const o = optOf(field, v) || (v ? { key: v, name: v, icon: "✏️", color: "#8a8f96", summary: { zh: tr("customTag"), en: tr("customTag") } } : null);
    const id = `f-${field.key}-${i}`;
    const summary = o ? L(o.summary) || L((o.rows || []).slice(-1)[0]?.text) : "";
    return `<div class="sb-f"><span id="${id}">${esc(L(field.label))}</span>
      <button type="button" class="sb-pick-btn${o ? " is-set" : ""}" data-pick="${esc(field.key)}" data-i="${i}" aria-labelledby="${id} ${id}-v" style="--c:${esc((o && o.color) || "var(--border)")}">
        ${o ? optPic(o, "sb-pick-thumb") : `<span class="sb-pick-q" aria-hidden="true">?</span>`}
        <span class="sb-pick-txt" id="${id}-v">${o ? `<b>${esc(L(o.name))}</b>${summary ? `<small>${esc(summary)}</small>` : ""}` : `<span class="sb-ph">${esc(tr("pickPh", { label: L(field.label) }))}</span>`}</span>
        <i aria-hidden="true">›</i>
      </button></div>`;
  }
  function swatchFieldHtml(field, p, i) {
    const taken = takenBy(field, i);
    const o = optOf(field, p[field.key]);
    const id = `f-${field.key}-${i}`;
    return `<div class="sb-f"><span id="${id}">${esc(L(field.label))}${o ? ` · <b>${esc(L(o.name))}</b>` : ""}</span>
      <div class="sb-swatches" role="group" aria-labelledby="${id}" style="--n:${field.options.length}">
        ${field.options
          .map(
            (x) => `<button type="button" class="sb-swatch${x.img ? " has-img" : ""}" style="--c:${esc(x.color || "var(--accent)")}" data-swatch="${esc(field.key)}" data-i="${i}" data-v="${esc(x.key)}" aria-pressed="${p[field.key] === x.key}" title="${esc(L(x.name))}" aria-label="${esc(L(x.name))}"${taken.has(x.key) ? " disabled" : ""}>${x.img ? `<img src="${esc(x.img)}" alt="">` : ""}</button>`
          )
          .join("")}
      </div>
      ${o && o.note ? `<p class="sb-note">✨ ${esc(L(o.note))}</p>` : ""}
    </div>`;
  }
  function playerHtml(p, i) {
    const n = i + 1;
    // The card's edge shows the player's colour (a swatch field), or else the colour of their first choice.
    const order = [...pFields().filter((f) => f.type === "swatches"), ...pFields().filter((f) => f.type !== "swatches")];
    const accent = (MODE() === "teams" && teamOf(p.team)) || order.map((f) => optOf(f, p[f.key])).find((o) => o && o.color);
    return `<fieldset class="sb-player" style="--edge:${accent ? esc(accent.color) : "var(--border)"}">
      <legend>${esc(tr("playerN", { n }))}</legend>
      <button class="f7-icon-btn sb-del" type="button" data-del="${i}" aria-label="${esc(tr("removePlayer", { n }))}" ${F.players.length <= 1 ? "disabled" : ""}>×</button>
      <div class="sb-row">
        <label class="sb-f sb-name"><span>${esc(tr("name"))}</span>
          ${HVPlayerPicker.field({ value: p.name, picked: p.picked, attrs: `data-i="${i}" data-k="name" placeholder="${esc(tr("playerN", { n }))}"` })}</label>
        ${SCORED() ? `<label class="sb-f sb-score"><span>${esc(tr("score"))}</span>
          <input data-i="${i}" data-k="score" value="${esc(p.score)}" type="number" inputmode="${CFG.minScore < 0 ? "text" : "numeric"}" min="${CFG.minScore}" max="${MAX_SCORE}" step="1"></label>` : ""}
        ${MODE() === "win" ? `<div class="sb-f sb-score"><span>${esc(tr("winTag"))}</span><button type="button" class="sb-win${p.won ? " is-on" : ""}" data-win="${i}" aria-pressed="${!!p.won}">${esc(tr("won2"))}</button></div>` : ""}
      </div>
      ${MODE() === "teams" ? `<div class="sb-f"><span id="t-${i}">${esc(tr("teamLabel"))}</span><div class="sb-chips" role="group" aria-labelledby="t-${i}">${CFG.teams
        .map((t) => `<button type="button" class="sb-chip${p.team === t.key ? " is-on" : ""}" data-team="${i}" data-v="${esc(t.key)}" aria-pressed="${p.team === t.key}" style="--c:${esc(t.color || "var(--accent)")}">${esc(L(t))}</button>`)
        .join("")}</div></div>` : ""}
      ${pFields().map((f) => (f.type === "cards" ? cardsFieldHtml(f, p, i) : swatchFieldHtml(f, p, i))).join("")}
    </fieldset>`;
  }
  function gameFieldsHtml() {
    if (!gFields().length) return "";
    return `<h2>${esc(tr("thisGame"))}</h2><div class="sb-game-fields">${gFields()
      .map((f) => {
        const picked = F.extra[f.key] || [];
        const full = f.max && picked.length >= f.max;
        return `<div class="sb-f"><span id="g-${esc(f.key)}">${esc(L(f.label))}${f.max ? ` <small>· ${esc(tr("upTo", { n: f.max }))}</small>` : ""}</span>
          <div class="sb-chips" role="group" aria-labelledby="g-${esc(f.key)}">${f.options
            .map((o) => {
              const on = picked.includes(o.key);
              return `<button type="button" class="sb-chip${on ? " is-on" : ""}" data-gchip="${esc(f.key)}" data-v="${esc(o.key)}" aria-pressed="${on}" style="--c:${esc(o.color || "var(--accent)")}"${!on && full ? " disabled" : ""}>${chipLead(o)}${esc(L(o.name))}</button>`;
            })
            .join("")}</div></div>`;
      })
      .join("")}</div>`;
  }

  function resultHtml() {
    if (MODE() === "teams")
      return `<h2 id="res-l">${esc(tr("whoWon"))}</h2><div class="sb-chips sb-result" role="group" aria-labelledby="res-l">${CFG.teams
        .map((t) => `<button type="button" class="sb-chip${F.res.team === t.key ? " is-on" : ""}" data-winteam="${esc(t.key)}" aria-pressed="${F.res.team === t.key}" style="--c:${esc(t.color || "var(--accent)")}">🏆 ${esc(L(t))}</button>`)
        .join("")}</div>`;
    if (MODE() === "coop") {
      const c = CFG.coopScore;
      return `<h2 id="res-l">${esc(tr("coopResult"))}</h2><div class="sb-chips sb-result" role="group" aria-labelledby="res-l">
        <button type="button" class="sb-chip${F.res.coop === "yes" ? " is-on" : ""}" data-coop="yes" aria-pressed="${F.res.coop === "yes"}" style="--c:var(--ok)">${esc(tr("coopWin"))}</button>
        <button type="button" class="sb-chip${F.res.coop === "no" ? " is-on" : ""}" data-coop="no" aria-pressed="${F.res.coop === "no"}" style="--c:var(--danger)">${esc(tr("coopLose"))}</button></div>
        ${c ? `<label class="sb-f sb-coop-score"><span>${esc(L(c))}${esc(tr("optional"))}</span><input id="sb-coop-score" type="number" min="${c.min ?? 0}" max="${c.max ?? MAX_SCORE}" step="1" value="${esc(F.res.score)}"></label>` : ""}`;
    }
    return "";
  }
  function renderForm() {
    const el = $("tab-score");
    let msg = "";
    if (!HVLoans.enabled) msg = `<p class="f7-msg">${esc(tr("noBackend"))}</p>`;
    else if (saveState === "updated") msg = `<p class="f7-msg is-ok" role="status">${esc(tr("updated"))} · <a href="#records">${esc(tr("viewRecords"))}</a></p>`;
    else if (saveState === "saved") msg = `<p class="f7-msg is-ok" role="status">${esc(tr("saved"))} · <a href="#records">${esc(tr("viewRecords"))}</a></p>`;
    else if (saveState && saveState.err) msg = `<p class="f7-msg is-err" role="alert">${esc(saveState.err)}</p>`;
    const optional = [...pFields(), ...gFields()].map((f) => L(f.label));
    const modeHint = { low: "hintLow", win: "hintWin", teams: "hintTeams", coop: "hintCoop" }[MODE()];
    const hint = (modeHint ? tr(modeHint) + " " : "") +
      (!SCORED() ? tr("hintNames") : optional.length ? tr("hintOptional", { fields: optional.join(HVI18n.lang === "zh" ? "、" : ", ") }) : tr("hintBase"));
    const banner = editing
      ? `<div class="sb-editing" role="status"><span>${esc(tr("editing", { date: fmtDay(editing.day) }))}</span><button class="link-btn" type="button" id="cancel-edit">${esc(tr("cancelEdit"))}</button></div>`
      : "";
    el.innerHTML = `${banner}
      <h2 id="date-l">${esc(tr("date"))}</h2>
      <input type="hidden" id="sb-date" value="${esc(F.date)}" data-datepicker data-max="today" data-size="lg" data-labelledby="date-l">
      ${gameFieldsHtml()}
      <h2>${esc(tr(SCORED() ? "players" : "playersOnly"))}</h2>
      <div class="sb-players">${F.players.map(playerHtml).join("")}</div>
      <button class="f7-dashed" type="button" id="add-p" ${F.players.length >= CFG.maxPlayers ? "disabled" : ""}>${esc(tr("addPlayer"))}</button>
      ${resultHtml()}
      <p class="f7-hint">${esc(hint)}</p>
      <p style="margin-top:20px"><button class="btn f7-wide" type="button" id="save-rec" ${saveState === "saving" || !HVLoans.enabled ? "disabled" : ""}>${esc(tr(saveState === "saving" ? "saving" : editing ? "saveEdit" : "save"))}</button></p>
      ${msg}
      <p style="text-align:center">${editing ? `<button class="link-btn" type="button" id="cancel-edit">${esc(tr("cancelEdit"))}</button>` : `<button class="link-btn" type="button" id="clear-form">${esc(tr("clear"))}</button>`}</p>`;
    HVDatePicker.enhance(el);
  }

  function clearMsg() {
    if (saveState === "saved" || saveState === "updated" || (saveState && saveState.err)) {
      saveState = null;
      const m = $("tab-score").querySelector(".f7-msg");
      if (m) m.remove();
    }
  }
  function wireForm() {
    const el = $("tab-score");
    // Picking a player from the list (registered players must be picked, not typed).
    HVPlayerPicker.wire(el, (input, name, picked) => {
      if (input.dataset.k !== "name" || !picked) return;
      const p = F.players[+input.dataset.i];
      if (!p) return;
      p.name = name;
      p.picked = true;
      clearMsg();
      store();
    });
    HVPlayerPicker.onReady(() => {
      if (tabNow && tabNow() === "score" && !el.contains(document.activeElement)) renderForm(); // show any "must pick" notes
    });
    el.addEventListener("input", (e) => {
      const t = e.target;
      if (t.id === "sb-date") {
        F.date = t.value || today();
        F.dateSetOn = today();
      } else if (t.dataset.k === "name" || t.dataset.k === "score") {
        F.players[+t.dataset.i][t.dataset.k] = t.value;
        if (t.dataset.k === "name") F.players[+t.dataset.i].picked = false; // typed by hand
      } else if (t.id === "sb-coop-score") {
        F.res.score = t.value;
      } else return;
      clearMsg();
      store();
    });
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const refocus = (sel) => {
        const again = el.querySelector(sel);
        if (again) again.focus();
      };
      if (b.dataset.pick) return openPicker(b.dataset.pick, +b.dataset.i);
      // won / side / result: tap again to clear
      const pickOne = (apply, sel) => {
        apply();
        clearMsg();
        store();
        renderForm();
        refocus(sel);
      };
      if (b.dataset.win) return pickOne(() => (F.players[+b.dataset.win].won = !F.players[+b.dataset.win].won), `[data-win="${b.dataset.win}"]`);
      if (b.dataset.team) {
        const pl = F.players[+b.dataset.team];
        return pickOne(() => (pl.team = pl.team === b.dataset.v ? "" : b.dataset.v), `[data-team="${b.dataset.team}"][data-v="${b.dataset.v}"]`);
      }
      if (b.dataset.winteam) return pickOne(() => (F.res.team = F.res.team === b.dataset.winteam ? "" : b.dataset.winteam), `[data-winteam="${b.dataset.winteam}"]`);
      if (b.dataset.coop) return pickOne(() => (F.res.coop = F.res.coop === b.dataset.coop ? "" : b.dataset.coop), `[data-coop="${b.dataset.coop}"]`);
      if (b.dataset.swatch) {
        const p = F.players[+b.dataset.i];
        p[b.dataset.swatch] = p[b.dataset.swatch] === b.dataset.v ? "" : b.dataset.v; // tap again to clear
        clearMsg();
        store();
        renderForm();
        return refocus(`[data-swatch="${b.dataset.swatch}"][data-i="${b.dataset.i}"][data-v="${b.dataset.v}"]`);
      }
      if (b.dataset.gchip) {
        const list = F.extra[b.dataset.gchip] || (F.extra[b.dataset.gchip] = []);
        const at = list.indexOf(b.dataset.v);
        if (at >= 0) list.splice(at, 1);
        else list.push(b.dataset.v);
        clearMsg();
        store();
        renderForm();
        return refocus(`[data-gchip="${b.dataset.gchip}"][data-v="${b.dataset.v}"]`);
      }
      if (b.dataset.del) {
        F.players.splice(+b.dataset.del, 1);
        store();
        return renderForm();
      }
      if (b.id === "add-p") {
        F.players.push(blankPlayer());
        store();
        renderForm();
        return refocus(`[data-i="${F.players.length - 1}"][data-k="name"]`);
      }
      if (b.id === "cancel-edit") return stopEditing(true);
      if (b.id === "clear-form") {
        if (!confirm(tr("clearConfirm"))) return;
        F = blank();
        saveState = null;
        store();
        return renderForm();
      }
      if (b.id === "save-rec") saveRecord();
    });
  }

  // ---------- card picker (a dialog with a card per option) ----------
  let pick = null; // { field, i }
  function openPicker(key, i) {
    const field = pFields().find((f) => f.key === key);
    if (!field) return;
    pick = { field, i };
    renderPicker();
    $("sb-pick").showModal();
    const on = $("sb-pick").querySelector(".is-on") || $("sb-pick").querySelector("[data-opt]");
    if (on) on.focus();
  }
  function renderPicker() {
    const { field, i } = pick;
    const p = F.players[i];
    if (!p) return;
    const taken = takenBy(field, i);
    const who = p.name.trim() || tr("playerN", { n: i + 1 });
    const cur = p[field.key];
    $("sb-pick").innerHTML = `
      <div class="sh-head">
        <div><div class="who" id="pick-title">${esc(tr("pickFor", { name: who, label: L(field.label) }))}</div>${field.unique ? `<div class="sub">${esc(tr("pickSub"))}</div>` : ""}</div>
        <button type="button" class="sb-x" data-close aria-label="${esc(tr("close"))}">×</button>
      </div>
      <button type="button" class="sb-none${cur ? "" : " is-on"}" data-opt="" aria-pressed="${!cur}">${esc(tr("none"))}</button>
      ${field.allowCustom ? `<form class="sb-custom" data-custom-form>
        <label for="sb-custom-in">${esc(tr("customLabel"))}</label>
        <div><input id="sb-custom-in" maxlength="30" autocomplete="off" value="${esc(cur && !optOf(field, cur) ? cur : "")}" placeholder="${esc(tr("customPh", { label: L(field.label) }))}">
        <button class="btn" type="submit">${esc(tr("customUse"))}</button></div>
      </form>` : ""}
      ${(field.groups || [{ key: undefined }])
        .map((g) => {
          const opts = field.options.filter((o) => !field.groups || o.group === g.key);
          if (!opts.length) return "";
          return `${g.label ? `<h3 class="sb-group" id="grp-${esc(g.key)}">${esc(L(g.label))} <span class="count">${opts.length}</span></h3>` : ""}
      <div class="sb-card-grid" role="group" aria-labelledby="${g.label ? `grp-${esc(g.key)}` : "pick-title"}">${opts
        .map((o) => {
          const by = taken.get(o.key);
          return `<button type="button" class="sb-card${cur === o.key ? " is-on" : ""}" data-opt="${esc(o.key)}" aria-pressed="${cur === o.key}" style="--c:${esc(o.color || "var(--accent)")}"${by ? " disabled" : ""}>
            <span class="sb-card-pic">${o.img ? `<img src="${esc(o.img)}" alt="" loading="lazy">` : `<span class="sb-card-badge" aria-hidden="true">${esc(o.icon || "")}</span>`}${by ? `<span class="sb-taken">${esc(tr("takenBy", { name: by }))}</span>` : ""}</span>
            <b>${esc(L(o.name))}</b>
            ${(o.rows || []).map((r) => `<span class="sb-card-row"><em>${esc(L(r.label))}</em>${esc(L(r.text))}</span>`).join("")}
          </button>`;
        })
        .join("")}</div>`;
        })
        .join("")}`;
  }
  function wirePicker() {
    const dlg = $("sb-pick");
    const choose = (v) => {
      F.players[pick.i][pick.field.key] = v;
      clearMsg();
      store();
      dlg.close();
      renderForm();
      const back = $("tab-score").querySelector(`[data-pick="${pick.field.key}"][data-i="${pick.i}"]`);
      if (back) back.focus();
    };
    dlg.addEventListener("submit", (e) => {
      if (!e.target.matches("[data-custom-form]") || !pick) return;
      e.preventDefault();
      const text = $("sb-custom-in").value.trim().slice(0, 30);
      if (!text) return $("sb-custom-in").focus();
      // Typing a listed name picks that option, so stats don't split.
      // Names match with or without a "Map 14:" / "地图 14：" prefix or (…) note, and "地图14" / "map 14" alone also match.
      const norm = (n) => String(n).toLowerCase().replace(/[\s（）()]/g, "");
      const forms = (n) => {
        const m = String(n).match(/^(.*?\d+[a-z]?)\s*[:：]\s*(.+)$/i);
        const base = String(n).replace(/[（(].*?[)）]/g, "");
        return [n, base, ...(m ? [m[1], m[2]] : [])].map(norm);
      };
      const want = norm(text);
      const match = pick.field.options.find((o) => [o.name.zh, o.name.en].some((n) => n && forms(n).includes(want)));
      choose(match ? match.key : text);
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) return dlg.close();
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.hasAttribute("data-close")) return dlg.close();
      if (b.dataset.opt === undefined || !pick) return;
      choose(b.dataset.opt);
    });
  }

  // ---------- save ----------
  function check() {
    if (!F.date) return tr("needDate");
    if (F.date > today()) return tr("futureDate");
    for (let i = 0; i < F.players.length; i++) {
      const p = F.players[i];
      if (!p.name.trim()) return tr("needName", { n: i + 1 });
      const must = HVPlayerPicker.problem(p.name, p.picked);
      if (must) return must;
      if (SCORED()) {
        const s = Number(p.score);
        if (p.score === "" || !Number.isInteger(s) || s < CFG.minScore || s > MAX_SCORE) return tr("needScore", { name: p.name.trim(), min: CFG.minScore, max: MAX_SCORE });
      }
      if (MODE() === "teams" && !teamOf(p.team)) return tr("needTeam", { name: p.name.trim() });
    }
    if (MODE() === "win" && !F.players.some((p) => p.won)) return tr("needWinner");
    if (MODE() === "teams" && !teamOf(F.res.team)) return tr("needWinTeam");
    if (MODE() === "coop") {
      if (!F.res.coop) return tr("needCoop");
      const c = CFG.coopScore;
      const v = String(F.res.score ?? "").trim();
      if (c && v !== "" && !(Number.isInteger(Number(v)) && Number(v) >= (c.min ?? 0) && Number(v) <= (c.max ?? MAX_SCORE)))
        return tr("needCoopScore", { label: L(c), min: c.min ?? 0, max: c.max ?? MAX_SCORE });
    }
    return null;
  }
  function toRecord() {
    const mode = MODE();
    // Without scores, total is 1 for a winner and 0 otherwise, and the winning value (top_score) is 1.
    const won = (p) => (mode === "win" ? p.won : mode === "teams" ? p.team === F.res.team : F.res.coop === "yes");
    const players = F.players.map((p) => {
      const out = { name: p.name.trim().slice(0, 30), total: SCORED() ? Number(p.score) : won(p) ? 1 : 0 };
      if (mode === "teams") out.team = p.team;
      for (const f of pFields()) if (p[f.key]) out[f.key] = p[f.key];
      return out;
    });
    const details = {};
    for (const f of gFields()) if ((F.extra[f.key] || []).length) details[f.key] = F.extra[f.key].slice(0, f.max || 20);
    if (mode !== "high") details.mode = mode;
    if (mode === "teams") details.winTeam = F.res.team;
    if (mode === "coop") {
      details.won = F.res.coop === "yes";
      if (CFG.coopScore && String(F.res.score ?? "").trim() !== "") details.score = Number(F.res.score);
    }
    const top = mode === "low" ? Math.min(...players.map((p) => p.total)) : SCORED() ? Math.max(...players.map((p) => p.total)) : 1;
    const winners = players.filter((p) => p.total === top).map((p) => p.name);
    return {
      game_id: GAME_ID,
      played_on: F.date,
      players,
      rounds: [],
      winner: (winners.join("、") || "—").slice(0, 400),
      top_score: top,
      round_count: 0,
      ...(Object.keys(details).length ? { details } : {}),
    };
  }
  const errText = (err) => (err.code === "HVS02" ? tr("tooMany") : err instanceof TypeError ? tr("offline") : err.message);
  async function saveRecord() {
    if (saveState === "saving") return;
    const bad = check();
    if (bad) {
      saveState = { err: bad };
      return renderForm();
    }
    saveState = "saving";
    renderForm();
    if (editing) {
      try {
        const { game_id, ...changes } = toRecord();
        const row = await HVLoans.updateScore(editing.id, { details: {}, ...changes, pending: false });
        if (records) records = records.map((r) => (String(r.id) === String(editing.id) ? { ...r, ...row } : r));
        stopEditing(false);
        saveState = "updated";
        renderForm();
        renderRecords();
      } catch (err) {
        saveState = { err: tr("updateFailed", { msg: errText(err) }) };
        renderForm();
      }
      return;
    }
    try {
      await HVLoans.saveScore(toRecord());
      // Ready for the next game: same players and date; scores and choices cleared.
      F = { date: F.date, dateSetOn: F.dateSetOn, players: F.players.map((p) => ({ ...blankPlayer(), name: p.name, picked: p.picked })), extra: blankExtra(), res: blankRes() };
      store();
      saveState = "saved";
      records = null; // reload the list next time it's shown
    } catch (err) {
      saveState = { err: tr("saveFailed", { msg: errText(err) }) };
    }
    renderForm();
  }

  // ---------- changing a saved record (admins) ----------
  function startEditing(r) {
    if (!editing) draftAside = F;
    const details = r.details && typeof r.details === "object" ? r.details : {};
    editing = { id: r.id, day: dayOf(r) };
    F = {
      date: dayOf(r),
      dateSetOn: today(),
      players: (r.players || []).map((p) => ({
        ...blankPlayer(),
        ...Object.fromEntries(pFields().map((f) => [f.key, p[f.key] || ""])),
        name: String(p.name || ""),
        picked: true, // already saved: only a changed name has to be picked again
        score: r.pending || !SCORED() ? "" : String(p.total ?? ""),
        won: !r.pending && p.total === r.top_score,
        team: p.team || "",
      })),
      extra: { ...blankExtra(), ...Object.fromEntries(gFields().map((f) => [f.key, Array.isArray(details[f.key]) ? details[f.key].slice() : []])) },
      res: { team: details.winTeam || "", coop: details.won === true ? "yes" : details.won === false ? "no" : "", score: details.score != null ? String(details.score) : "" },
    };
    saveState = null;
    renderForm();
    location.hash = "#score";
    window.scrollTo(0, 0);
  }
  function stopEditing(show) {
    editing = null;
    F = draftAside || blank();
    draftAside = null;
    saveState = null;
    if (show) renderForm();
  }

  // ---------- records ----------
  let records = null, loadingRecords = false, recordsErr = null;
  let isAdmin = false;
  let filter = "";

  const dayOf = (r) => r.played_on || String(r.played_at || "").slice(0, 10);
  async function loadRecords(force = false) {
    if (!HVLoans.enabled) return renderRecords();
    if (loadingRecords || (records && !force)) return renderRecords();
    loadingRecords = true;
    recordsErr = null;
    renderRecords();
    try {
      const rows = await HVLoans.scores(GAME_ID);
      // Newest game date first; games on the same day by when they were saved.
      records = rows.sort((a, b) => dayOf(b).localeCompare(dayOf(a)) || String(b.played_at).localeCompare(String(a.played_at)));
    } catch (err) {
      recordsErr = errText(err);
    }
    loadingRecords = false;
    renderRecords();
    fillNameList();
  }

  const fmtDay = (d) => {
    const [y, m, day] = d.split("-").map(Number);
    if (!y) return d;
    return new Date(y, m - 1, day).toLocaleDateString(HVI18n.lang === "zh" ? "zh-CN" : "en", { year: "numeric", month: "short", day: "numeric", weekday: "short" });
  };
  // How a player's choices show in a record: swatch fields as a dot before the name, card fields as a pill after it.
  function choicesHtml(p) {
    let dot = "", after = "";
    for (const f of pFields()) {
      const o = optOf(f, p[f.key]);
      if (!o && !p[f.key]) continue;
      if (f.type === "swatches") {
        dot = dot || dotHtml(o);
        after += `<span class="sb-tag-plain">${esc(optName(f, p[f.key]))}</span>`;
      } else after += `<span class="sb-tag">${optPic(o, "sb-ico")}${esc(optName(f, p[f.key]))}</span>`;
    }
    return { dot: dot || `<i class="sb-dot is-none"></i>`, after };
  }
  function recordHtml(r) {
    const players = Array.isArray(r.players) ? r.players : [];
    if (r.pending)
      return `<article class="f7-rec is-pending">
        <div class="f7-rec-head"><b>${esc(tr("pending"))}</b><time datetime="${esc(dayOf(r))}">${esc(fmtDay(dayOf(r)))}</time></div>
        <table class="sb-res"><tbody>${players.map((p) => `<tr><td class="sb-rank">·</td><td><span class="sb-pn">${esc(p.name)}</span></td><td class="sb-pts">${esc(tr("pendingShort"))}</td></tr>`).join("")}</tbody></table>
        ${isAdmin ? `<div class="f7-rec-foot"><span></span><span class="sb-admin-acts"><button class="link-btn" type="button" data-edit-rec="${esc(r.id)}">${esc(tr("edit"))}</button><button class="link-btn" type="button" data-del-rec="${esc(r.id)}">${esc(tr("delete"))}</button></span></div>` : ""}
      </article>`;
    const sorted = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total || a.i - b.i);
    const details = r.details && typeof r.details === "object" ? r.details : {};
    const mode = recMode(r);
    if (mode === "low") sorted.sort((a, b) => a.total - b.total || a.i - b.i);
    const scored = mode === "high" || mode === "low";
    if (!scored) sorted.sort((a, b) => (b.total === r.top_score) - (a.total === r.top_score) || (mode === "teams" ? String(a.team).localeCompare(String(b.team)) : 0) || a.i - b.i);
    const tm = (p) => (mode === "teams" && teamOf(p.team) ? `<span class="sb-tag-plain sb-team" style="--c:${esc(teamOf(p.team).color || "var(--accent)")}">${esc(L(teamOf(p.team)))}</span>` : "");
    const headline =
      mode === "teams" ? tr("teamWon", { team: teamOf(details.winTeam) ? L(teamOf(details.winTeam)) : details.winTeam || "" })
      : mode === "coop" ? `${tr(details.won ? "coopWin" : "coopLose")}${details.score != null && CFG.coopScore ? ` · ${L(CFG.coopScore)} ${details.score}` : ""}`
      : tr("won", { names: joinNames(String(r.winner).split("、")) });
    const gameTags = gFields()
      .map((f) => (Array.isArray(details[f.key]) && details[f.key].length ? `<div class="sb-rec-game"><em>${esc(L(f.label))}</em>${details[f.key].map((k) => `<span class="sb-chip is-on is-static" style="--c:${esc(optOf(f, k)?.color || "var(--accent)")}">${chipLead(optOf(f, k))}${esc(optName(f, k))}</span>`).join("")}</div>` : ""))
      .join("");
    let rank = 0, prev = null;
    return `<article class="f7-rec">
      <div class="f7-rec-head"><b>${esc(headline)}</b><time datetime="${esc(dayOf(r))}">${esc(fmtDay(dayOf(r)))}</time></div>
      ${gameTags}
      <table class="sb-res">
        <tbody>${sorted
          .map((p, j) => {
            if (p.total !== prev) rank = j + 1;
            prev = p.total;
            const win = p.total === r.top_score;
            const c = choicesHtml(p);
            const res = scored ? tr("points", { n: p.total }) : mode === "coop" ? "" : tr(win ? "winTag" : "lostTag");
            return `<tr class="${win && (scored || mode !== "coop" || details.won) ? "is-win" : ""}"><td class="sb-rank">${win && (mode !== "coop" || details.won) ? "🏆" : scored ? rank : "·"}</td>
              <td>${c.dot}<span class="sb-pn">${esc(p.name)}</span>${tm(p)}${c.after}</td>
              <td class="sb-pts">${esc(res)}</td></tr>`;
          })
          .join("")}</tbody>
      </table>
      ${isAdmin ? `<div class="f7-rec-foot"><span></span><span class="sb-admin-acts"><button class="link-btn" type="button" data-edit-rec="${esc(r.id)}">${esc(tr("edit"))}</button><button class="link-btn" type="button" data-del-rec="${esc(r.id)}">${esc(tr("delete"))}</button></span></div>` : ""}
    </article>`;
  }

  const shown = () => (records || []).filter((r) => !filter || (r.players || []).some((p) => nameKey(p.name).includes(nameKey(filter))));

  function renderRecords() {
    const recEl = $("tab-records"), lbEl = $("tab-leaders");
    let body;
    if (!HVLoans.enabled) body = `<p class="f7-hint">${esc(tr("noBackend"))}</p>`;
    else if (recordsErr)
      body = `<p class="f7-msg is-err">${esc(tr("loadFailed", { msg: recordsErr }))}</p><p><button class="btn ghost" type="button" data-retry>${esc(tr("retry"))}</button></p>`;
    else if (!records) body = `<p class="f7-hint">${esc(tr("loading"))}</p>`;
    else body = null;

    if (body) {
      recEl.innerHTML = `<h2>${esc(tr("tabRecords"))}</h2>${body}`;
      lbEl.innerHTML = `<h2>${esc(tr("tabLeaders"))}</h2>${body}`;
      return;
    }
    // Keep the filter box (and its focus) while the list below changes.
    if (!$("rec-filter")) {
      recEl.innerHTML = `<h2>${esc(tr("tabRecords"))} <span class="count" id="rec-count"></span></h2>
        <input id="rec-filter" class="f7-filter" type="search" placeholder="${esc(tr("filter"))}" aria-label="${esc(tr("filter"))}" list="sb-names">
        <div class="f7-recs" id="rec-list"></div>
        <nav class="f7-pager" id="rec-pager" aria-label="${esc(tr("tabRecords"))}"></nav>`;
      $("rec-filter").value = filter;
      $("rec-filter").addEventListener("input", (e) => {
        filter = e.target.value;
        recPage = 1;
        renderRecordList();
      });
    }
    renderRecordList();
    lbEl.innerHTML = leaderboardHtml();
  }
  // 10 records a page: drawing hundreds at once is what makes a long list slow.
  const REC_PAGE = 10;
  let recPage = 1;
  function renderRecordList() {
    const list = shown();
    const pages = Math.max(1, Math.ceil(list.length / REC_PAGE));
    recPage = Math.min(Math.max(1, recPage), pages);
    $("rec-count").textContent = records.length ? tr("gamesCount", { n: list.length }) : "";
    $("rec-list").innerHTML = list.length
      ? list.slice((recPage - 1) * REC_PAGE, recPage * REC_PAGE).map(recordHtml).join("")
      : `<p class="f7-hint">${esc(tr(records.length ? "noMatch" : "empty"))}</p>`;
    $("rec-pager").innerHTML = pages > 1
      ? `<button class="btn ghost btn-sm" type="button" data-rec-page="${recPage - 1}"${recPage <= 1 ? " disabled" : ""}>${esc(tr("prevPage"))}</button>
         <span>${esc(tr("pageOf", { n: recPage, m: pages }))}</span>
         <button class="btn ghost btn-sm" type="button" data-rec-page="${recPage + 1}"${recPage >= pages ? " disabled" : ""}>${esc(tr("nextPage"))}</button>`
      : "";
  }

  // ---------- leaderboard ----------
  // Adds one result to a stats row: games, wins, best, sum.
  const addTo = (map, k, init, total, win) => {
    const s = map.get(k) || { ...init, games: 0, wins: 0, best: -Infinity, low: Infinity, sum: 0 };
    s.games++;
    if (win) s.wins++;
    s.best = Math.max(s.best, total);
    s.low = Math.min(s.low, total);
    s.sum += total;
    map.set(k, s);
    return s;
  };
  const byWins = (a, b) => b.wins - a.wins || b.wins / b.games - a.wins / a.games || b.games - a.games || b.best - a.best;
  const rate = (s) => `${Math.round((s.wins / s.games) * 100)}%`;
  const avg = (s) => Math.round(s.sum / s.games);
  const medal = ["🥇", "🥈", "🥉"];
  const table = (head, rows) => `<div class="f7-scroll"><table class="f7-table f7-lb"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;

  // Without scores (win / teams / co-op): wins and win rate per player, plus per side or the team's record.
  function winBoardHtml(done) {
    const people = new Map();
    for (const r of done) for (const p of r.players || []) {
      const k = nameKey(p.name);
      if (!k) continue;
      const s = people.get(k) || { name: String(p.name).trim(), games: 0, wins: 0 };
      s.games++;
      if (p.total === r.top_score) s.wins++;
      people.set(k, s);
    }
    if (!people.size) return `<h2>${esc(tr("tabLeaders"))}</h2><p class="f7-hint">${esc(tr("empty"))}</p>`;
    const byW = (a, b) => b.wins - a.wins || b.wins / b.games - a.wins / a.games || b.games - a.games;
    let html = `<h2>${esc(tr("tabLeaders"))} <span class="count">${esc(tr("gamesCount", { n: done.length }))}</span></h2>`;
    if (MODE() === "coop") {
      const wins = done.filter((r) => r.details && r.details.won).length;
      const sc = done.map((r) => r.details && r.details.score).filter((v) => typeof v === "number");
      html += `<h3 class="sb-h3">${esc(tr("lbCoopTitle"))}</h3>${table(
        [tr("lbGames"), tr("lbCoopWins"), tr("lbCoopRate"), ...(CFG.coopScore && sc.length ? [`${L(CFG.coopScore)} · ${tr("lbBest")}`, `${L(CFG.coopScore)} · ${tr("lbAvg")}`] : [])],
        [`<tr><td>${done.length}</td><td><b>${wins}</b></td><td>${Math.round((wins / done.length) * 100)}%</td>${CFG.coopScore && sc.length ? `<td>${Math.max(...sc)}</td><td>${Math.round(sc.reduce((a, b) => a + b, 0) / sc.length)}</td>` : ""}</tr>`]
      )}<p class="f7-hint">${esc(tr("lbCoopHint"))}</p>`;
    }
    if (MODE() === "teams") {
      const sides = (CFG.teams || []).map((t) => {
        const played = done.filter((r) => (r.players || []).some((p) => p.team === t.key));
        return { t, games: played.length, wins: played.filter((r) => r.details && r.details.winTeam === t.key).length };
      }).filter((x) => x.games);
      if (sides.length)
        html += `<h3 class="sb-h3">${esc(tr("lbTeamsTitle"))}</h3>${table(
          [tr("lbTeam"), tr("lbWins"), tr("lbGames"), tr("lbRate")],
          sides.sort(byW).map((x) => `<tr><td><i class="sb-dot" style="--c:${esc(x.t.color || "var(--accent)")}"></i>${esc(L(x.t))}</td><td><b>${x.wins}</b></td><td>${x.games}</td><td>${rate(x)}</td></tr>`)
        )}<p class="f7-hint">${esc(tr("lbTeamHint"))}</p>`;
    }
    html += `<h3 class="sb-h3">${esc(tr(MODE() === "win" ? "lbWinsTitle" : "lbPlayersTitle"))}</h3>${table(
      [tr("lbPlayer"), tr("lbWins"), tr("lbGames"), tr("lbRate")],
      [...people.values()].sort(byW).map((s, i) => `<tr><td>${medal[i] || ""} ${esc(s.name)}</td><td><b>${s.wins}</b></td><td>${s.games}</td><td>${rate(s)}</td></tr>`)
    )}<p class="f7-hint">${esc(tr("lbHint"))}</p>`;
    return html;
  }
  function leaderboardHtml() {
    // Only finished games recorded the way this game is scored now.
    const done = records.filter((r) => !r.pending && recMode(r) === MODE());
    if (!SCORED()) return winBoardHtml(done);
    const low = MODE() === "low";
    const people = new Map();
    const perField = new Map(pFields().map((f) => [f.key, new Map()]));
    const perGame = new Map(gFields().map((f) => [f.key, new Map()]));
    const favField = pFields().find((f) => f.favLabel);
    for (const r of done) {
      for (const p of r.players || []) {
        const k = nameKey(p.name);
        if (!k) continue;
        const win = p.total === r.top_score;
        const s = addTo(people, k, { name: String(p.name).trim(), used: {} }, p.total, win);
        for (const f of pFields()) {
          const v = p[f.key];
          if (!v) continue;
          addTo(perField.get(f.key), v, { key: v }, p.total, win);
          if (f === favField) s.used[v] = (s.used[v] || 0) + 1;
        }
      }
      const details = r.details && typeof r.details === "object" ? r.details : {};
      for (const f of gFields()) for (const v of Array.isArray(details[f.key]) ? details[f.key] : []) addTo(perGame.get(f.key), v, { key: v }, r.top_score, false);
    }
    if (!people.size) return `<h2>${esc(tr("tabLeaders"))}</h2><p class="f7-hint">${esc(tr("empty"))}</p>`;
    const all = [...people.values()];
    const fav = (s) => {
      const top = Object.entries(s.used).sort((a, b) => b[1] - a[1])[0];
      return top ? esc(optName(favField, top[0])) : "–";
    };
    // Lowest-score games: the best score is the lowest one, and there's no "total points" table.
    if (low) for (const s of [...all, ...[...perField.values()].flatMap((m) => [...m.values()])]) s.best = s.low;
    const nums = (s) => `<td><b>${s.wins}</b></td><td>${s.games}</td><td>${rate(s)}</td><td>${s.best}</td><td>${avg(s)}</td>`;
    const statHead = (first) => [first, tr("lbWins"), tr("lbGames"), tr("lbRate"), tr(low ? "lbLow" : "lbBest"), tr("lbAvg")];

    let html = `<h2>${esc(tr("tabLeaders"))} <span class="count">${esc(tr("gamesCount", { n: done.length }))}</span></h2>
      ${low ? "" : `<h3 class="sb-h3">${esc(tr("lbTotal"))}</h3>
      ${table(
        [tr("lbPlayer"), tr("lbSum"), tr("lbGames"), tr("lbAvg"), tr("lbWins")],
        all.sort((a, b) => b.sum - a.sum || b.games - a.games).map((s, i) => `<tr><td>${medal[i] || ""} ${esc(s.name)}</td><td><b>${s.sum}</b></td><td>${s.games}</td><td>${avg(s)}</td><td>${s.wins}</td></tr>`)
      )}
      <p class="f7-hint">${esc(tr("lbTotalHint"))}</p>`}
      <h3 class="sb-h3">${esc(tr("lbWinsTitle"))}</h3>
      ${table(
        [...statHead(tr("lbPlayer")), ...(favField ? [L(favField.favLabel)] : [])],
        [...people.values()].sort(byWins).map((s, i) => `<tr><td>${medal[i] || ""} ${esc(s.name)}</td>${nums(s)}${favField ? `<td>${fav(s)}</td>` : ""}</tr>`)
      )}
      <p class="f7-hint">${esc(tr("lbHint"))}</p>`;
    for (const f of pFields()) {
      const rows = [...perField.get(f.key).values()].sort(byWins);
      if (!f.statsTitle || !rows.length) continue;
      const lead = (k) => (f.type === "swatches" ? dotHtml(optOf(f, k)) : optPic(optOf(f, k), "sb-ico"));
      html += `<h3 class="sb-h3">${esc(L(f.statsTitle))}</h3>${table(statHead(L(f.label)), rows.map((s) => `<tr><td>${lead(s.key)}${esc(optName(f, s.key))}</td>${nums(s)}</tr>`))}`;
    }
    for (const f of gFields()) {
      const rows = [...perGame.get(f.key).values()].sort((a, b) => b.games - a.games || b.best - a.best);
      if (!f.statsTitle || !rows.length) continue;
      html += `<h3 class="sb-h3">${esc(L(f.statsTitle))}</h3>${table(
        [L(f.label), tr("lbGames"), tr("lbTopAvg"), tr("lbBest")],
        rows.map((s) => `<tr><td>${chipLead(optOf(f, s.key))}${esc(optName(f, s.key))}</td><td><b>${s.games}</b></td><td>${avg(s)}</td><td>${s.best}</td></tr>`)
      )}`;
    }
    return html;
  }

  // Past players' names as suggestions, so the same person is spelt the same way.
  function fillNameList() {
    const names = new Map();
    for (const r of records || []) for (const p of r.players || []) if (!names.has(nameKey(p.name))) names.set(nameKey(p.name), String(p.name).trim());
    $("sb-names").innerHTML = [...names.values()].map((n) => `<option value="${esc(n)}"></option>`).join("");
    HVPlayerPicker.setPast([...names.values()]);
  }

  function wireRecords() {
    document.querySelector(".f7-main").addEventListener("click", async (e) => {
      if (e.target.closest("[data-retry]")) return loadRecords(true);
    const pg = e.target.closest("[data-rec-page]");
    if (pg) {
      recPage = Number(pg.dataset.recPage);
      renderRecordList();
      $("rec-filter").scrollIntoView({ block: "nearest" });
      return;
    }
      const ed = e.target.closest("[data-edit-rec]");
      if (ed) {
        const r = (records || []).find((x) => String(x.id) === ed.dataset.editRec);
        if (r) startEditing(r);
        return;
      }
      const del = e.target.closest("[data-del-rec]");
      if (!del || !confirm(tr("deleteConfirm"))) return;
      del.disabled = true;
      try {
        await HVLoans.deleteScore(del.dataset.delRec);
        records = records.filter((r) => String(r.id) !== del.dataset.delRec);
        if (editing && String(editing.id) === del.dataset.delRec) stopEditing(true);
        renderRecords();
      } catch (err) {
        del.disabled = false;
        alert(tr("deleteFailed", { msg: errText(err) }));
      }
    });
  }

  // ---------- page ----------
  function renderAll() {
    HVI18n.apply();
    document.title = `${L(gameName)} ${tr("title")} · ${HVI18n.t("siteName")}`;
    $("sb-name").textContent = L(gameName);
    $("sb-title").textContent = tr("title");
    $("sb-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    renderForm();
    if (pick && $("sb-pick").open) renderPicker();
    if ($("rec-filter")) $("tab-records").innerHTML = ""; // rebuilt in the new language
    renderRecords();
    renderTabs();
  }
  function fail(msg) {
    HVI18n.apply();
    $("sb-name").textContent = "";
    $("sb-title").textContent = tr("title");
    $("sb-back").textContent = tr("back");
    $("tab-score").innerHTML = `<p class="f7-msg is-err">${esc(msg)}</p>`;
  }
  const loadScript = (src) =>
    new Promise((ok) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = ok; // no config file: the simple scoreboard
      document.head.appendChild(s);
    });

  async function start() {
    $("lang-toggle").addEventListener("click", () => HVI18n.toggle());
    if (!GAME_ID) return fail(tr("noGame"));
    // The game's name (and that it exists) comes from the catalogue; its extra choices from its config file.
    const [data] = await Promise.all([fetch("data/games.json").then((r) => r.json()).catch(() => null), loadScript(`js/scoreboards/${GAME_ID}.js`)]);
    const game = data && (data.games || []).find((g) => g.id === GAME_ID);
    if (!game && !CONFIGS[GAME_ID]) return fail(tr("noGame"));
    const sc = (game && game.scoring) || {};
    if (sc.mode === "none") return fail(tr("noScoring"));
    // Room for as many players as the game takes (from "2–4" in the catalogue), 6 when it doesn't say.
    const most = Number(String((game && game.players) || "").match(/(\d+)\D*$/)?.[1]) || 6;
    CFG = {
      maxPlayers: Math.min(Math.max(most, 1), 30),
      minScore: 0,
      playerFields: [],
      gameFields: [],
      mode: sc.mode || "high",
      teams: sc.teams || [],
      coopScore: sc.score || null,
      ...(CONFIGS[GAME_ID] || {}),
    };
    gameName = CFG.name || (game && (typeof game.name === "string" ? { zh: game.name, en: game.name } : game.name)) || { zh: GAME_ID, en: GAME_ID };
    const back = `index.html#/game/${encodeURIComponent(GAME_ID)}`;
    $("sb-back").href = back;
    $("sb-home").href = back;
    F = load() || blank();
    wireForm();
    wirePicker();
    wireRecords();
    HVI18n.onChange(renderAll);
    window.addEventListener("hashchange", renderTabs);
    window.addEventListener("beforeunload", (e) => {
      if (saveState === "saving") e.preventDefault();
    });
    renderAll();
    // Admins (signed in on the main site) can delete records.
    if (HVLoans.enabled && HVLoans.user) {
      HVLoans.isAdmin()
        .then((yes) => {
          isAdmin = yes;
          if (records) renderRecords();
        })
        .catch(() => {});
    }
    // Names from past games help with spelling, so load the records in the background.
    if (HVLoans.enabled) loadRecords();
  }
  start();
})();
