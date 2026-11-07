// Flip 7 scorer (flip7.html): score each round, then save the finished game to Supabase (table game_scores).
// Everyone can see all records and the leaderboard. The game in progress is kept in this browser until it's saved.
(() => {
  const GAME_ID = "flip-7";
  const KEY = "hv-flip7-current";
  const COLORS = ["#7a8791", "#9a6b3d", "#c43c3c", "#e0662a", "#c99a00", "#5f9e2f", "#1f9a6f", "#1c8fb0", "#2f64c9", "#6a4bc4", "#a540a8", "#d0407a", "#3f4e5c"];
  const MODS = [2, 4, 6, 8, 10];
  const MAX_PLAYERS = 18;

  const STR = {
    zh: {
      pageTitle: "7连翻 计分板",
      title: "计分板",
      back: "← 返回桌游",
      tabScore: "🧮 计分",
      tabRecords: "📜 战绩记录",
      tabLeaders: "🏆 排行榜",
      whoPlays: "谁来玩？",
      playerN: "玩家 {n}",
      removePlayer: "移除玩家 {n}",
      addPlayer: "＋ 添加玩家",
      target: "目标分数",
      targetHint: "任一玩家在一轮结束时达到目标分，游戏结束，总分最高者获胜。名字和上次写一样，排行榜才会算在一起。",
      start: "开始游戏",
      round: "第 {n} 轮",
      rounds: "共 {n} 轮",
      newGame: "新游戏",
      won: "🏆 {names} 获胜！",
      wonSub: "{score} 分，共 {n} 轮",
      again: "同一批人再来一局",
      undo: "撤回上一轮",
      endEarly: "提前结束这局",
      endEarlyConfirm: "现在结束这局？总分最高者获胜。",
      score: "记分",
      bust: "爆牌",
      missing: "还有 {n} 人没记分",
      finishRound: "完成第 {n} 轮",
      history: "每轮明细",
      roundCol: "轮",
      total: "总分",
      editHint: "点表格里的分数可以修改那一轮。",
      startHint: "点每位玩家的「记分」，选出这一轮留下的牌；全员记完后点「完成本轮」。",
      editRound: "修改 {name} 第 {n} 轮",
      editSub: "修改第 {n} 轮",
      undoConfirm: "撤回上一轮？它的分数会回到当前轮，方便修改后重新提交。",
      undoSaved: "这局已经保存到战绩记录，撤回不会删除那条记录；改完再保存会多一条记录。",
      newConfirm: "结束当前这局，重新设置玩家？",
      unsavedConfirm: "这局还没保存到战绩记录，确定不保存吗？",
      save: "💾 保存到战绩记录",
      saving: "正在保存……",
      saved: "✓ 已保存到战绩记录",
      viewRecords: "查看战绩记录",
      saveFailed: "保存失败：{msg}",
      tooMany: "刚才保存的记录太多了，请一分钟后再试。",
      offline: "网络连接失败，请检查网络后再试。",
      noBackend: "战绩记录还没有启用（需要设置 Supabase）。",
      nums: "数字牌",
      mods: "加分牌",
      bustBtn: "爆牌（本轮 0 分）",
      manual: "直接输入分数",
      manualPh: "不用点牌时填这里",
      cancel: "取消",
      ok: "保存",
      thisRound: "第 {n} 轮",
      bustText: "爆牌，本轮 0 分",
      manualText: "使用直接输入的分数",
      numText: "数字 {n}",
      x2Text: "×2 后 {n}",
      modText: "加分 +{n}",
      pick: "点选这位玩家本轮留下的牌",
      bustShort: "爆",
      numLabel: "数字 {n}",
      filter: "按玩家名字筛选",
      loading: "正在加载……",
      loadFailed: "无法加载战绩记录：{msg}",
      retry: "重试",
      none: "还没有记录。打完一局后点「保存到战绩记录」。",
      noMatch: "没有这位玩家的记录。",
      gamesCount: "共 {n} 局",
      roundsTarget: "{n} 轮 · 目标 {t} 分",
      points: "{n} 分",
      delete: "删除",
      deleteConfirm: "删除这条记录？删除后不能恢复。",
      deleteFailed: "删除失败：{msg}",
      lbPlayer: "玩家",
      lbGames: "局数",
      lbWins: "胜场",
      lbRate: "胜率",
      lbBest: "最高分",
      lbAvg: "平均分",
      lbF7: "Flip 7",
      lbBusts: "爆牌",
      lbHint: "按名字统计：同一个人每次请写同样的名字（不分大小写）。Flip 7 和爆牌是次数。",
      toggle: "EN",
      toggleLabel: "Switch to English",
    },
    en: {
      pageTitle: "Flip 7 scorer",
      title: "Scorer",
      back: "← Back to games",
      tabScore: "🧮 Score",
      tabRecords: "📜 Records",
      tabLeaders: "🏆 Leaderboard",
      whoPlays: "Who's playing?",
      playerN: "Player {n}",
      removePlayer: "Remove player {n}",
      addPlayer: "+ Add player",
      target: "Target score",
      targetHint: "The game ends when anyone reaches the target at the end of a round; the highest total wins. Use the same name as last time so the leaderboard adds it up.",
      start: "Start game",
      round: "Round {n}",
      rounds: "{n} rounds",
      newGame: "New game",
      won: "🏆 {names} wins!",
      wonSub: "{score} points in {n} rounds",
      again: "Play again, same players",
      undo: "Undo last round",
      endEarly: "End game now",
      endEarlyConfirm: "End the game now? The highest total wins.",
      score: "Score",
      bust: "Bust",
      missing: "{n} player(s) still to score",
      finishRound: "Finish round {n}",
      history: "Round by round",
      roundCol: "Rd",
      total: "Total",
      editHint: "Tap a score in the table to change that round.",
      startHint: "Tap Score for each player and pick the cards they kept this round. When everyone is scored, finish the round.",
      editRound: "Change {name}, round {n}",
      editSub: "Changing round {n}",
      undoConfirm: "Undo the last round? Its scores go back to the current round so you can fix them and finish it again.",
      undoSaved: "This game is already saved in the records. Undoing won't remove that record, and saving again adds another one.",
      newConfirm: "End this game and set up players again?",
      unsavedConfirm: "This game isn't saved to the records yet. Continue without saving?",
      save: "💾 Save to records",
      saving: "Saving…",
      saved: "✓ Saved to records",
      viewRecords: "View records",
      saveFailed: "Couldn't save: {msg}",
      tooMany: "Too many records were saved just now. Try again in a minute.",
      offline: "Couldn't connect. Check your internet and try again.",
      noBackend: "Records aren't set up yet (Supabase is needed).",
      nums: "Number cards",
      mods: "Modifier cards",
      bustBtn: "Bust (0 points this round)",
      manual: "Type a score",
      manualPh: "Instead of tapping cards",
      cancel: "Cancel",
      ok: "Save",
      thisRound: "Round {n}",
      bustText: "Bust: 0 points this round",
      manualText: "Using the typed score",
      numText: "Numbers {n}",
      x2Text: "×2 = {n}",
      modText: "modifiers +{n}",
      pick: "Tap the cards this player kept",
      bustShort: "✕",
      numLabel: "Number {n}",
      filter: "Filter by player name",
      loading: "Loading…",
      loadFailed: "Couldn't load the records: {msg}",
      retry: "Try again",
      none: "No records yet. After a game, tap Save to records.",
      noMatch: "No records for that player.",
      gamesCount: "{n} games",
      roundsTarget: "{n} rounds · target {t}",
      points: "{n} pts",
      delete: "Delete",
      deleteConfirm: "Delete this record? This can't be undone.",
      deleteFailed: "Couldn't delete: {msg}",
      lbPlayer: "Player",
      lbGames: "Games",
      lbWins: "Wins",
      lbRate: "Win rate",
      lbBest: "Best",
      lbAvg: "Average",
      lbF7: "Flip 7s",
      lbBusts: "Busts",
      lbHint: "Counted by name, so use the same name each time (capital letters don't matter). Flip 7s and busts are counts.",
      toggle: "中文",
      toggleLabel: "切换到中文",
    },
  };
  const tr = (key, vars = {}) =>
    (STR[HVI18n.lang][key] ?? STR.zh[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const $ = (id) => document.getElementById(id);
  const joinNames = (names) => names.join(HVI18n.lang === "zh" ? "、" : " & ");

  // ---------- game in progress (this browser only) ----------
  const blank = () => ({ players: [], target: 200, rounds: [], cur: {}, done: false, savedId: null });
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch {
      return null;
    }
  }
  function store() {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch {}
  }
  let S = load() || blank();
  let draftNames = ["", "", ""];
  let saveState = null; // null | "saving" | { err } — the save button's status for the finished game

  const hasManual = (h) => h.manual !== null && h.manual !== undefined && h.manual !== "";
  function score(h) {
    if (!h) return null;
    if (h.bust) return 0;
    if (hasManual(h)) return Number(h.manual) || 0;
    let n = sum(h.nums);
    if (h.x2) n *= 2;
    n += sum(h.mods);
    if (h.nums.length === 7) n += 15;
    return n;
  }
  const isF7 = (h) => Boolean(h && !h.bust && !hasManual(h) && h.nums.length === 7);
  function totals() {
    const t = {};
    S.players.forEach((p) => (t[p.id] = 0));
    S.rounds.forEach((r) => S.players.forEach((p) => (t[p.id] += score(r[p.id]) || 0)));
    return t;
  }
  const unsaved = () => S.done && !S.savedId && HVLoans.enabled;

  // ---------- tabs ----------
  const TABS = ["score", "records", "leaders"];
  const tabNow = () => (TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "score");
  function renderTabs() {
    const now = tabNow();
    const label = { score: "tabScore", records: "tabRecords", leaders: "tabLeaders" };
    $("f7-tabs").innerHTML = TABS.map(
      (k) => `<a class="chip${k === now ? " is-on" : ""}" href="#${k}"${k === now ? ' aria-current="page"' : ""}>${esc(tr(label[k]))}</a>`
    ).join("");
    TABS.forEach((k) => ($(`tab-${k}`).hidden = k !== now));
    if (now !== "score") loadRecords();
  }

  // ---------- setup ----------
  function renderSetup() {
    const el = $("tab-score");
    el.innerHTML = `
      <h2>${esc(tr("whoPlays"))}</h2>
      <div class="f7-names">
        ${draftNames
          .map(
            (n, i) => `
          <div class="f7-name-row">
            <input aria-label="${esc(tr("playerN", { n: i + 1 }))}" data-i="${i}" value="${esc(n)}" placeholder="${esc(tr("playerN", { n: i + 1 }))}" maxlength="30" list="f7-names" autocomplete="off">
            <button class="f7-icon-btn" type="button" data-del="${i}" aria-label="${esc(tr("removePlayer", { n: i + 1 }))}" ${draftNames.length <= 2 ? "disabled" : ""}>×</button>
          </div>`
          )
          .join("")}
      </div>
      <button class="f7-dashed" type="button" id="add-p" ${draftNames.length >= MAX_PLAYERS ? "disabled" : ""}>${esc(tr("addPlayer"))}</button>
      <div class="f7-field"><label for="target">${esc(tr("target"))}</label><input id="target" type="number" inputmode="numeric" min="1" value="${S.target || 200}"></div>
      <p class="f7-hint">${esc(tr("targetHint"))}</p>
      <p style="margin-top:20px"><button class="btn f7-wide" type="button" id="start">${esc(tr("start"))}</button></p>`;
    el.querySelectorAll("[data-i]").forEach((inp) => inp.addEventListener("input", (e) => (draftNames[+e.target.dataset.i] = e.target.value)));
    el.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => {
        draftNames.splice(+b.dataset.del, 1);
        renderSetup();
      })
    );
    $("add-p").onclick = () => {
      draftNames.push("");
      renderSetup();
      el.querySelector(`[data-i="${draftNames.length - 1}"]`).focus();
    };
    $("start").onclick = () => {
      const tgt = parseInt($("target").value, 10);
      S = blank();
      S.target = tgt > 0 ? Math.min(tgt, 100000) : 200;
      const stamp = Date.now().toString(36);
      S.players = draftNames.map((n, i) => ({ id: `p${i}_${stamp}`, name: n.trim().slice(0, 30) || tr("playerN", { n: i + 1 }) }));
      saveState = null;
      store();
      renderScore();
    };
  }

  // ---------- board ----------
  function chipHtml(h, pid) {
    const sc = score(h);
    const attr = `data-pid="${esc(pid)}" data-ri="-1"`;
    if (sc === null) return `<button class="f7-chip is-empty" type="button" ${attr}>${esc(tr("score"))}</button>`;
    if (h.bust) return `<button class="f7-chip is-bust" type="button" ${attr}>${esc(tr("bust"))}</button>`;
    return `<button class="f7-chip${isF7(h) ? " is-f7" : ""}" type="button" ${attr}>+${sc}</button>`;
  }

  function winnerHtml(order, top) {
    const names = joinNames(order.filter((o) => o.tot === top).map((o) => o.p.name));
    let saveHtml;
    if (!HVLoans.enabled) saveHtml = `<p class="f7-msg">${esc(tr("noBackend"))}</p>`;
    else if (S.savedId) saveHtml = `<p class="f7-msg is-ok">${esc(tr("saved"))} · <a href="#records">${esc(tr("viewRecords"))}</a></p>`;
    else
      saveHtml = `<button class="btn" type="button" id="save-rec" ${saveState === "saving" ? "disabled" : ""}>${esc(tr(saveState === "saving" ? "saving" : "save"))}</button>`;
    const err = saveState && saveState.err ? `<p class="f7-msg is-err" role="alert">${esc(saveState.err)}</p>` : "";
    return `<div class="f7-winner" role="status"><b>${esc(tr("won", { names }))}</b>${esc(tr("wonSub", { score: top, n: S.rounds.length }))}
      <div class="f7-actions">${S.savedId ? "" : saveHtml}<button class="btn ghost" type="button" id="again">${esc(tr("again"))}</button><button class="btn ghost" type="button" id="undo">${esc(tr("undo"))}</button></div>
      ${S.savedId ? saveHtml : ""}${err}</div>`;
  }

  function renderBoard() {
    const t = totals();
    const roundNo = S.rounds.length + 1;
    const order = S.players.map((p, i) => ({ p, i, tot: t[p.id] })).sort((a, b) => b.tot - a.tot || a.i - b.i);
    const top = order.length ? order[0].tot : 0;
    const missing = S.players.filter((p) => !S.cur[p.id]).length;
    let rank = 0, prev = null;
    $("tab-score").innerHTML = `
      <p class="f7-hint" style="margin:0 0 10px"><b>${esc(S.done ? tr("rounds", { n: S.rounds.length }) : tr("round", { n: roundNo }))}</b> · ${esc(tr("target"))} ${S.target}
        <button class="link-btn" type="button" id="new-game" style="float:right">${esc(tr("newGame"))}</button></p>
      ${S.done ? winnerHtml(order, top) : ""}
      <div class="f7-board">
        ${order
          .map((o, idx) => {
            if (o.tot !== prev) {
              rank = idx + 1;
              prev = o.tot;
            }
            const pct = Math.min(100, Math.max(0, (o.tot / S.target) * 100));
            return `<div class="f7-prow${o.tot === top && top > 0 ? " is-lead" : ""}">
            <div class="f7-rank">${rank}</div>
            <div class="f7-pname">${esc(o.p.name)}</div>
            <div class="f7-right">
              <div class="f7-total">${o.tot}<small> / ${S.target}</small></div>
              ${S.done ? "" : chipHtml(S.cur[o.p.id], o.p.id)}
            </div>
            <div class="f7-track"><i style="width:${pct}%"></i></div>
          </div>`;
          })
          .join("")}
      </div>
      ${
        S.done
          ? ""
          : `<button class="btn f7-wide f7-commit" type="button" id="commit" ${missing ? "disabled" : ""}>${esc(missing ? tr("missing", { n: missing }) : tr("finishRound", { n: roundNo }))}</button>
        <div class="f7-tools">
          ${S.rounds.length ? `<button class="btn ghost" type="button" id="undo">${esc(tr("undo"))}</button><button class="btn ghost" type="button" id="end-early">${esc(tr("endEarly"))}</button>` : ""}
        </div>`
      }
      ${S.rounds.length ? historyHtml(t) : `<p class="f7-hint" style="margin-top:20px">${esc(tr("startHint"))}</p>`}`;
  }

  function historyHtml(t) {
    return `<h2>${esc(tr("history"))}</h2>
      <div class="f7-scroll"><table class="f7-table">
        <thead><tr><th>${esc(tr("roundCol"))}</th>${S.players.map((p) => `<th>${esc(p.name)}</th>`).join("")}</tr></thead>
        <tbody>${S.rounds
          .map(
            (r, ri) =>
              `<tr><td>${ri + 1}</td>${S.players
                .map((p) => {
                  const h = r[p.id], sc = score(h);
                  const cls = h && h.bust ? "is-bust" : isF7(h) ? "is-f7" : "";
                  return `<td><button class="${cls}" type="button" data-pid="${esc(p.id)}" data-ri="${ri}" aria-label="${esc(tr("editRound", { name: p.name, n: ri + 1 }))}">${h && h.bust ? "✕" : sc ?? "–"}</button></td>`;
                })
                .join("")}</tr>`
          )
          .join("")}</tbody>
        <tfoot><tr><td>${esc(tr("total"))}</td>${S.players.map((p) => `<td>${t[p.id]}</td>`).join("")}</tr></tfoot>
      </table></div>
      <p class="f7-hint">${esc(tr("editHint"))}</p>`;
  }

  function renderScore() {
    S.players.length ? renderBoard() : renderSetup();
  }

  function finishCheck() {
    S.done = Boolean(S.endedEarly) || Object.values(totals()).some((v) => v >= S.target);
  }
  function commitRound() {
    if (S.players.some((p) => !S.cur[p.id])) return;
    S.rounds.push(S.cur);
    S.cur = {};
    finishCheck();
    store();
    renderScore();
    window.scrollTo({ top: 0 });
  }
  function undoRound() {
    if (!S.rounds.length) return;
    if (!confirm(tr("undoConfirm") + (S.savedId ? "\n\n" + tr("undoSaved") : ""))) return;
    S.cur = S.rounds.pop();
    S.done = false;
    S.endedEarly = false;
    S.savedId = null;
    saveState = null;
    store();
    renderScore();
  }

  // The finished game as a game_scores row. Cells: { s: score, b: bust, f: Flip 7 }.
  function toRecord() {
    const t = totals();
    const top = Math.max(...S.players.map((p) => t[p.id]));
    return {
      game_id: GAME_ID,
      target: S.target,
      players: S.players.map((p) => ({ name: p.name, total: t[p.id] })),
      rounds: S.rounds.map((r) =>
        S.players.map((p) => {
          const h = r[p.id];
          return { s: score(h) || 0, ...(h && h.bust ? { b: true } : {}), ...(isF7(h) ? { f: true } : {}) };
        })
      ),
      winner: S.players.filter((p) => t[p.id] === top).map((p) => p.name).join("、"),
      top_score: top,
      round_count: S.rounds.length,
    };
  }
  const errText = (err) => (err.code === "HVS02" ? tr("tooMany") : err instanceof TypeError ? tr("offline") : err.message);
  async function saveRecord() {
    if (saveState === "saving" || S.savedId) return;
    saveState = "saving";
    renderScore();
    try {
      const row = await HVLoans.saveScore(toRecord());
      S.savedId = row ? row.id : true;
      saveState = null;
      store();
      records = null; // reload the list next time it's shown
    } catch (err) {
      saveState = { err: tr("saveFailed", { msg: errText(err) }) };
    }
    renderScore();
  }

  $("tab-score").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.pid) return openSheet(b.dataset.pid, +b.dataset.ri);
    if (b.id === "commit") return commitRound();
    if (b.id === "undo") return undoRound();
    if (b.id === "save-rec") return saveRecord();
    if (b.id === "end-early") {
      if (!confirm(tr("endEarlyConfirm"))) return;
      // A round half scored is dropped; finished rounds count.
      S.cur = {};
      S.done = true;
      S.endedEarly = true;
      store();
      return renderScore();
    }
    if (b.id === "again") {
      if (unsaved() && !confirm(tr("unsavedConfirm"))) return;
      const keep = S.players, tgt = S.target;
      S = blank();
      S.players = keep;
      S.target = tgt;
      saveState = null;
      store();
      return renderScore();
    }
    if (b.id === "new-game") {
      const inPlay = !S.done && (S.rounds.length || Object.keys(S.cur).length);
      if (inPlay && !confirm(tr("newConfirm"))) return;
      if (unsaved() && !confirm(tr("unsavedConfirm"))) return;
      draftNames = S.players.map((p) => p.name);
      if (draftNames.length < 2) draftNames = ["", "", ""];
      const tgt = S.target;
      S = blank();
      S.target = tgt;
      saveState = null;
      store();
      renderScore();
    }
  });

  // ---------- score sheet ----------
  const sheet = $("f7-sheet");
  const numsEl = $("sh-nums"), modsEl = $("sh-mods"), manualEl = $("sh-manual"), bustBtn = $("sh-bust");
  let edit = null; // { pid, ri, h }

  function renderSheetLabels() {
    numsEl.innerHTML = COLORS.map(
      (c, n) => `<button class="f7-card" type="button" style="--c:${c}" data-n="${n}" aria-pressed="false" aria-label="${esc(tr("numLabel", { n }))}">${n}</button>`
    ).join("");
    modsEl.innerHTML =
      MODS.map((m) => `<button class="mod" type="button" data-m="${m}" aria-pressed="false">+${m}</button>`).join("") +
      `<button class="mod x2" type="button" data-x2 aria-pressed="false">×2</button>`;
    $("sh-nums-label").textContent = tr("nums");
    $("sh-mods-label").textContent = tr("mods");
    bustBtn.textContent = tr("bustBtn");
    $("sh-manual-label").textContent = tr("manual");
    manualEl.placeholder = tr("manualPh");
    $("sh-cancel").textContent = tr("cancel");
    $("sh-save").textContent = tr("ok");
  }

  numsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-n]");
    if (!b || !edit) return;
    const n = +b.dataset.n, h = edit.h, i = h.nums.indexOf(n);
    if (i >= 0) h.nums.splice(i, 1);
    else if (h.nums.length < 7) h.nums.push(n);
    h.manual = "";
    h.bust = false;
    paint();
  });
  modsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || !edit) return;
    const h = edit.h;
    if (b.hasAttribute("data-x2")) h.x2 = !h.x2;
    else {
      const m = +b.dataset.m, i = h.mods.indexOf(m);
      i >= 0 ? h.mods.splice(i, 1) : h.mods.push(m);
    }
    h.manual = "";
    h.bust = false;
    paint();
  });
  bustBtn.onclick = () => {
    if (!edit) return;
    edit.h.bust = !edit.h.bust;
    paint();
  };
  manualEl.addEventListener("input", () => {
    if (!edit) return;
    edit.h.manual = manualEl.value;
    if (manualEl.value !== "") edit.h.bust = false;
    paint(false);
  });

  function openSheet(pid, ri) {
    const p = S.players.find((x) => x.id === pid);
    if (!p) return;
    const src = ri < 0 ? S.cur[pid] : S.rounds[ri][pid];
    const h = src ? JSON.parse(JSON.stringify(src)) : { nums: [], mods: [], x2: false, bust: false, manual: "" };
    if (!hasManual(h)) h.manual = "";
    edit = { pid, ri, h };
    $("sh-who").textContent = p.name;
    $("sh-sub").textContent = ri < 0 ? tr("thisRound", { n: S.rounds.length + 1 }) : tr("editSub", { n: ri + 1 });
    paint();
    sheet.showModal();
    $("sh-save").focus({ preventScroll: true });
  }
  const closeSheet = () => sheet.open && sheet.close();
  sheet.addEventListener("close", () => (edit = null));
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) closeSheet(); // tap outside the sheet
  });
  $("sh-cancel").onclick = closeSheet;
  $("sh-save").onclick = () => {
    if (!edit) return;
    const h = edit.h;
    if (h.manual !== "") h.manual = Number(h.manual) || 0;
    if (edit.ri < 0) S.cur[edit.pid] = h;
    else {
      S.rounds[edit.ri][edit.pid] = h;
      finishCheck();
      // Changing a saved game's scores makes it a different game: it can be saved again.
      if (S.savedId) S.savedId = null;
    }
    store();
    closeSheet();
    renderScore();
  };

  function paint(syncManual = true) {
    const h = edit.h, sc = score(h), full = h.nums.length >= 7;
    numsEl.querySelectorAll("[data-n]").forEach((b) => {
      const on = h.nums.includes(+b.dataset.n);
      b.setAttribute("aria-pressed", on);
      b.disabled = !on && full;
    });
    modsEl.querySelectorAll("[data-m]").forEach((b) => b.setAttribute("aria-pressed", h.mods.includes(+b.dataset.m)));
    modsEl.querySelector("[data-x2]").setAttribute("aria-pressed", Boolean(h.x2));
    bustBtn.setAttribute("aria-pressed", Boolean(h.bust));
    if (syncManual) manualEl.value = h.manual;
    $("sh-count").textContent = `${h.nums.length} / 7`;
    const live = $("sh-live");
    live.textContent = h.bust ? tr("bustShort") : sc;
    live.classList.toggle("is-bust", Boolean(h.bust));
    let txt;
    if (h.bust) txt = esc(tr("bustText"));
    else if (hasManual(h)) txt = esc(tr("manualText"));
    else if (h.nums.length || h.mods.length || h.x2) {
      const base = sum(h.nums);
      const parts = [tr("numText", { n: base })];
      if (h.x2) parts.push(tr("x2Text", { n: base * 2 }));
      if (h.mods.length) parts.push(tr("modText", { n: sum(h.mods) }));
      txt = esc(parts.join(HVI18n.lang === "zh" ? "，" : ", "));
      if (h.nums.length === 7) txt += '<span class="f7flag">Flip 7! +15</span>';
    } else txt = esc(tr("pick"));
    $("sh-break").innerHTML = txt;
  }

  // ---------- records & leaderboard (shared, from Supabase) ----------
  let records = null; // null = not loaded yet
  let recordsErr = null;
  let loadingRecords = false;
  let isAdmin = false;
  let filter = "";

  async function loadRecords(force = false) {
    if (!HVLoans.enabled) return renderRecords();
    if (loadingRecords || (records && !force)) return renderRecords();
    loadingRecords = true;
    recordsErr = null;
    renderRecords();
    try {
      records = await HVLoans.scores(GAME_ID);
    } catch (err) {
      recordsErr = errText(err);
    }
    loadingRecords = false;
    renderRecords();
    fillNameList();
  }

  const fmtTime = (s) =>
    new Date(s).toLocaleString(HVI18n.lang === "zh" ? "zh-CN" : "en", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const nameKey = (n) => String(n).trim().toLowerCase();

  function recordHtml(r) {
    const players = Array.isArray(r.players) ? r.players : [];
    const sorted = players.map((p, i) => ({ ...p, i })).sort((a, b) => b.total - a.total || a.i - b.i);
    const table = Array.isArray(r.rounds) && r.rounds.length
      ? `<details><summary>${esc(tr("history"))}</summary><div class="f7-scroll"><table class="f7-table">
          <thead><tr><th>${esc(tr("roundCol"))}</th>${players.map((p) => `<th>${esc(p.name)}</th>`).join("")}</tr></thead>
          <tbody>${r.rounds
            .map(
              (row, ri) =>
                `<tr><td>${ri + 1}</td>${players
                  .map((_, pi) => {
                    const c = (row && row[pi]) || {};
                    return c.b ? `<td><span class="is-bust">✕</span></td>` : c.f ? `<td><span class="is-f7">${c.s}</span></td>` : `<td>${c.s ?? "–"}</td>`;
                  })
                  .join("")}</tr>`
            )
            .join("")}</tbody>
          <tfoot><tr><td>${esc(tr("total"))}</td>${players.map((p) => `<td class="${p.total === r.top_score ? "is-win" : ""}">${p.total}</td>`).join("")}</tr></tfoot>
        </table></div></details>`
      : "";
    return `<article class="f7-rec">
      <div class="f7-rec-head"><b>${esc(tr("won", { names: joinNames(String(r.winner).split("、")) }))}</b><time datetime="${esc(r.played_at)}">${esc(fmtTime(r.played_at))}</time></div>
      <ol class="f7-rec-players">${sorted
        .map((p) => `<li class="${p.total === r.top_score ? "is-win" : ""}">${esc(p.name)} · ${esc(tr("points", { n: p.total }))}</li>`)
        .join("")}</ol>
      ${table}
      <div class="f7-rec-foot"><span>${esc(tr("roundsTarget", { n: r.round_count, t: r.target ?? "–" }))}</span>
        ${isAdmin ? `<button class="link-btn" type="button" data-del-rec="${esc(r.id)}">${esc(tr("delete"))}</button>` : ""}</div>
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
    // Records: keep the filter box (and its focus) while the list below changes.
    if (!$("rec-filter")) {
      recEl.innerHTML = `<h2>${esc(tr("tabRecords"))} <span class="count" id="rec-count"></span></h2>
        <input id="rec-filter" class="f7-filter" type="search" placeholder="${esc(tr("filter"))}" aria-label="${esc(tr("filter"))}" list="f7-names">
        <div class="f7-recs" id="rec-list"></div>`;
      $("rec-filter").value = filter;
      $("rec-filter").addEventListener("input", (e) => {
        filter = e.target.value;
        renderRecordList();
      });
    }
    renderRecordList();
    lbEl.innerHTML = leaderboardHtml();
  }
  function renderRecordList() {
    const list = shown();
    $("rec-count").textContent = records.length ? tr("gamesCount", { n: list.length }) : "";
    $("rec-list").innerHTML = list.length
      ? list.map(recordHtml).join("")
      : `<p class="f7-hint">${esc(tr(records.length ? "noMatch" : "none"))}</p>`;
  }

  function leaderboardHtml() {
    const stats = new Map();
    for (const r of records) {
      const winners = new Set(String(r.winner).split("、").map(nameKey));
      (r.players || []).forEach((p, pi) => {
        const k = nameKey(p.name);
        if (!k) return;
        const s = stats.get(k) || { name: String(p.name).trim(), games: 0, wins: 0, best: -Infinity, sum: 0, f7: 0, busts: 0 };
        s.games++;
        if (winners.has(k)) s.wins++;
        s.best = Math.max(s.best, p.total);
        s.sum += p.total;
        for (const row of r.rounds || []) {
          const c = (row && row[pi]) || {};
          if (c.f) s.f7++;
          if (c.b) s.busts++;
        }
        stats.set(k, s);
      });
    }
    const rows = [...stats.values()].sort((a, b) => b.wins - a.wins || b.wins / b.games - a.wins / a.games || b.games - a.games || b.best - a.best);
    if (!rows.length) return `<h2>${esc(tr("tabLeaders"))}</h2><p class="f7-hint">${esc(tr("none"))}</p>`;
    const medal = ["🥇", "🥈", "🥉"];
    return `<h2>${esc(tr("tabLeaders"))} <span class="count">${esc(tr("gamesCount", { n: records.length }))}</span></h2>
      <div class="f7-scroll"><table class="f7-table f7-lb">
        <thead><tr><th>${esc(tr("lbPlayer"))}</th><th>${esc(tr("lbWins"))}</th><th>${esc(tr("lbGames"))}</th><th>${esc(tr("lbRate"))}</th><th>${esc(tr("lbBest"))}</th><th>${esc(tr("lbAvg"))}</th><th>${esc(tr("lbF7"))}</th><th>${esc(tr("lbBusts"))}</th></tr></thead>
        <tbody>${rows
          .map(
            (s, i) => `<tr><td>${medal[i] || ""} ${esc(s.name)}</td><td><b>${s.wins}</b></td><td>${s.games}</td><td>${Math.round((s.wins / s.games) * 100)}%</td><td>${s.best}</td><td>${Math.round(s.sum / s.games)}</td><td>${s.f7}</td><td>${s.busts}</td></tr>`
          )
          .join("")}</tbody>
      </table></div>
      <p class="f7-hint">${esc(tr("lbHint"))}</p>`;
  }

  // Past players' names as suggestions, so the same person is spelt the same way.
  function fillNameList() {
    const names = new Map();
    for (const r of records || []) for (const p of r.players || []) if (!names.has(nameKey(p.name))) names.set(nameKey(p.name), String(p.name).trim());
    $("f7-names").innerHTML = [...names.values()].map((n) => `<option value="${esc(n)}"></option>`).join("");
  }

  document.querySelector(".f7-main").addEventListener("click", async (e) => {
    if (e.target.closest("[data-retry]")) return loadRecords(true);
    const del = e.target.closest("[data-del-rec]");
    if (!del || !confirm(tr("deleteConfirm"))) return;
    del.disabled = true;
    try {
      await HVLoans.deleteScore(del.dataset.delRec);
      records = records.filter((r) => String(r.id) !== del.dataset.delRec);
      renderRecords();
    } catch (err) {
      del.disabled = false;
      alert(tr("deleteFailed", { msg: errText(err) }));
    }
  });

  // ---------- page ----------
  function renderAll() {
    HVI18n.apply();
    document.title = `${tr("pageTitle")} · ${HVI18n.t("siteName")}`;
    $("f7-title").textContent = tr("title");
    $("f7-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    renderSheetLabels();
    if (edit) paint();
    renderScore();
    if ($("rec-filter")) $("tab-records").innerHTML = ""; // rebuilt in the new language
    renderRecords();
    renderTabs();
  }
  $("lang-toggle").addEventListener("click", () => HVI18n.toggle());
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
})();
