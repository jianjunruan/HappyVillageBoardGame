// Game wishes (想玩桌游, wishgames.html): anyone suggests a board game they'd like to play here — the game, a short
// description, an optional name and one optional photo — and everyone can see them and add a "我也想玩 +1".
// Admins mark one 关注中 (watching), 采纳 (adopted: shown as 购买中, being bought) or 不采纳 (declined), each with an
// optional note shown in red, then 已购买 (bought). Bought ones leave the home page and stay here as history.
// Data: Supabase tables game_wishes / game_wish_votes and the "game-wish-photos" bucket (supabase/schema.sql).
(() => {
  const STR = {
    zh: {
      title: "想玩桌游",
      back: "← 桌游目录",
      heading: "🎲 想玩桌游",
      intro: "想玩什么桌游？写下来（可以附一张照片），大家都能看到，也可以点“我也想玩 +1”投票。",
      note: "我们会根据大家的投票和情况决定是否采购，提交不代表一定会买。",
      add: "＋ 我想玩…",
      signIn: "👤 登录后提议",
      signInHint: "只有注册用户可以提议和投票，请先登录或注册。",
      errSignIn: "请先登录（只有注册用户可以提议和投票）。",
      empty: "还没有人提交。想玩什么桌游？来提第一个吧！",
      bought: "✅ 已购买（{n}）",
      boughtHint: "已经买回来的桌游，可以在桌游目录里找找。",
      loading: "加载中…",
      loadFailed: "加载失败：{msg}",
      retry: "重试",
      noBackend: "这个功能还没有启用（需要设置 Supabase）。",
      watching: "👀 关注中",
      watchingTip: "管理员已经注意到了，还在考虑，还没确定。",
      buying: "🛒 已采纳 · 购买中",
      rejected: "未采纳",
      boughtTag: "✅ 已购买",
      boughtOn: "{date} 已购买",
      mine: "我提的",
      by: "{name} 提议 · {date}",
      byAnon: "匿名提议 · {date}",
      adminNote: "📝 管理员备注：{note}",
      vote: "🙋 我也想玩 +1",
      voted: "✓ 我也想玩",
      voteNo: "不能再 +1",
      votes: "{n} 人想玩",
      aWatch: "👀 关注",
      aAdopt: "✓ 采纳",
      aReject: "✗ 不采纳",
      aBought: "✅ 标为已购买",
      aReopen: "↩ 改回待定",
      aNote: "📝 备注",
      edit: "✏️ 修改",
      del: "🗑 删除",
      delConfirm: "删除「{title}」？",
      formTitle: "我想玩…",
      editTitle: "修改想玩的桌游",
      fName: "你的名字（可不填，不填就是匿名）",
      fNamePh: "例如：小明",
      fTitle: "桌游名称",
      fTitlePh: "例如：璀璨宝石、卡坦岛",
      fDesc: "说明（可不填）",
      fDescPh: "为什么想玩、适合几个人、在哪里看到的……",
      fPhoto: "照片（可不填，1 张）",
      fPhotoHint: "例如桌游的盒子封面。大家都能看到。",
      fPhotoRemove: "移除照片",
      fPhotoBad: "这个文件不是图片，请换一张。",
      submit: "📮 提交",
      save: "💾 保存",
      cancel: "取消",
      close: "关闭",
      saving: "保存中…",
      needTitle: "请填写桌游名称。",
      thanks: "✓ 谢谢！已经提交。",
      saved: "✓ 已保存。",
      deleted: "✓ 已删除。",
      notMine: "只能修改或删除自己提交的。",
      noteTitleAdopt: "采纳：{title}",
      noteTitleReject: "不采纳：{title}",
      noteTitleEdit: "备注：{title}",
      noteField: "备注（可不填，会用红字显示给大家看）",
      notePhAdopt: "例如：预计下个月到货",
      notePhReject: "例如：店里已经有类似的游戏了",
      noteSave: "💾 保存",
      errFlood: "刚才提交的人太多了，请一分钟后再试。",
      errClosed: "这一项已经不能再 +1 了。",
      errAdmin: "需要管理员权限，请重新登录。",
      failed: "出错了：{msg}",
      offline: "网络连接失败，请检查网络后再试。",
      photoAlt: "{title} 的照片",
    },
    en: {
      title: "Games we'd like",
      back: "← Games",
      heading: "🎲 Games we'd like to play",
      intro: "What game would you like to play here? Write it down (a photo is welcome). Everyone can see it and tap \"I want to play +1\".",
      note: "We decide what to buy from the votes and other things; suggesting a game doesn't mean we'll buy it.",
      add: "+ I'd like to play…",
      signIn: "👤 Sign in to suggest",
      signInHint: "Only registered players can suggest and vote. Please sign in or sign up.",
      errSignIn: "Please sign in first (only registered players can suggest and vote).",
      empty: "Nothing here yet. Which game would you like? Suggest the first one!",
      bought: "✅ Bought ({n})",
      boughtHint: "Games we've bought: look for them in the catalogue.",
      loading: "Loading…",
      loadFailed: "Couldn't load: {msg}",
      retry: "Try again",
      noBackend: "This isn't switched on yet (Supabase isn't set up).",
      watching: "👀 Watching",
      watchingTip: "The admins have seen this and are thinking about it; not decided yet.",
      buying: "🛒 Adopted · Buying",
      rejected: "Declined",
      boughtTag: "✅ Bought",
      boughtOn: "Bought {date}",
      mine: "Mine",
      by: "by {name} · {date}",
      byAnon: "anonymous · {date}",
      adminNote: "📝 Admin note: {note}",
      vote: "🙋 I want to play +1",
      voted: "✓ I want to play",
      voteNo: "Closed",
      votes: "{n} want to play",
      aWatch: "👀 Watch",
      aAdopt: "✓ Adopt",
      aReject: "✗ Decline",
      aBought: "✅ Mark as bought",
      aReopen: "↩ Undecided",
      aNote: "📝 Note",
      edit: "✏️ Edit",
      del: "🗑 Delete",
      delConfirm: "Delete \"{title}\"?",
      formTitle: "I'd like to play…",
      editTitle: "Edit your suggestion",
      fName: "Your name (optional; leave it empty to stay anonymous)",
      fNamePh: "e.g. Ming",
      fTitle: "Game",
      fTitlePh: "e.g. Splendor, Catan",
      fDesc: "Description (optional)",
      fDescPh: "Why you'd like it, how many players, where you saw it…",
      fPhoto: "Photo (optional, 1)",
      fPhotoHint: "e.g. the box cover. Everyone can see it.",
      fPhotoRemove: "Remove photo",
      fPhotoBad: "That file isn't a picture. Please pick another one.",
      submit: "📮 Send",
      save: "💾 Save",
      cancel: "Cancel",
      close: "Close",
      saving: "Saving…",
      needTitle: "Please enter the game.",
      thanks: "✓ Thank you! It's in.",
      saved: "✓ Saved.",
      deleted: "✓ Deleted.",
      notMine: "You can only change or delete your own suggestions.",
      noteTitleAdopt: "Adopt: {title}",
      noteTitleReject: "Decline: {title}",
      noteTitleEdit: "Note: {title}",
      noteField: "Note (optional; shown to everyone in red)",
      notePhAdopt: "e.g. Should arrive next month",
      notePhReject: "e.g. We already have a similar game",
      noteSave: "💾 Save",
      errFlood: "Too many just now. Please try again in a minute.",
      errClosed: "This one can't take more +1s.",
      errAdmin: "This needs an admin. Please sign in again.",
      failed: "Something went wrong: {msg}",
      offline: "Couldn't connect. Check your connection and try again.",
      photoAlt: "Photo of {title}",
    },
  };
  const lang = () => HVI18n.lang;
  const tr = (k, vars = {}) => (STR[lang()][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const main = $("gw-main");
  const dlg = $("gw-dlg");
  const fmtDate = (iso) =>
    new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));

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

  function errText(err) {
    if (err instanceof TypeError) return tr("offline");
    const code = err && err.code;
    if (code === "HVW01") return tr("errFlood");
    if (code === "HVW02") return tr("errClosed");
    if (code === "HVW05") return tr("errSignIn");
    if (code === "not-mine") return tr("notMine");
    if (code === "not-image") return tr("fPhotoBad");
    if (code === "42501" || (err && (err.status === 401 || err.status === 403))) return tr("errAdmin");
    return tr("failed", { msg: (err && err.message) || "" });
  }

  // Only registered players can suggest and vote (the database checks again).
  const signedIn = () => Boolean(HVLoans.userId);
  const LOGIN = "account.html?next=" + encodeURIComponent("wishgames.html");
  let wishes = null;
  let loadErr = null;
  let isAdmin = false;
  let mine = new Set();
  let voted = new Set();
  let flash = null; // { text, ok }
  let busy = false;
  let D = null; // the open dialog's state

  async function load() {
    loadErr = null;
    try {
      const [rows, st] = await Promise.all([HVLoans.gameWishes(), HVLoans.gameWishState(token()).catch(() => null)]);
      wishes = rows;
      mine = new Set(((st && st.mine) || []).map(Number));
      voted = new Set(((st && st.voted) || []).map(Number));
    } catch (err) {
      loadErr = err;
    }
    render();
  }

  // ---------- page ----------
  function card(w) {
    const st = w.status;
    const isMine = mine.has(w.id);
    const on = voted.has(w.id);
    const closed = st === "rejected" || st === "bought";
    const badge =
      st === "watching" ? `<span class="ev-wish-badge is-watch" title="${esc(tr("watchingTip"))}">${esc(tr("watching"))}</span>`
      : st === "buying" ? `<span class="ev-wish-badge gw-buying">${esc(tr("buying"))}</span>`
      : st === "rejected" ? `<span class="ev-wish-badge is-no">${esc(tr("rejected"))}</span>`
      : st === "bought" ? `<span class="ev-wish-badge">${esc(tr("boughtTag"))}</span>` : "";
    const voteBtn = `<button class="ev-vote${on ? " is-on" : ""}" type="button" data-vote="${w.id}" aria-pressed="${on}"${closed && !on ? " disabled" : ""}>${esc(tr(on ? "voted" : closed ? "voteNo" : "vote"))}</button>`;
    const a = (k, attrs) => `<button class="link-btn" type="button" ${attrs} data-id="${w.id}">${esc(tr(k))}</button>`;
    const admin = isAdmin
      ? [
          st === "open" && a("aWatch", 'data-status="watching"'),
          (st === "open" || st === "watching" || st === "rejected") && a("aAdopt", 'data-note-for="buying"'),
          st !== "rejected" && st !== "bought" && a("aReject", 'data-note-for="rejected"'),
          st === "buying" && a("aBought", 'data-status="bought"'),
          st !== "open" && a("aReopen", 'data-status="open"'),
          a("aNote", 'data-note-for=""'),
        ].filter(Boolean).join("")
      : "";
    const own = isMine ? a("edit", "data-edit") : "";
    const del = isMine || isAdmin ? a("del", "data-del") : "";
    const date = fmtDate(w.created_at);
    return `<article class="ev-wish gw-wish is-${st}${isMine ? " is-mine" : ""}">
      ${w.photo ? `<button class="gw-photo" type="button" data-photo="${esc(w.photo)}" data-title="${esc(w.title)}"><img src="${esc(HVLoans.wishPhotoUrl(w.photo))}" alt="${esc(tr("photoAlt", { title: w.title }))}" loading="lazy"></button>` : ""}
      <div class="ev-wish-top"><h3>${esc(w.title)}</h3>${badge}${isMine ? `<span class="ev-wish-mine">${esc(tr("mine"))}</span>` : ""}</div>
      ${st === "watching" ? `<p class="ev-wish-watch">${esc(tr("watchingTip"))}</p>` : ""}
      ${st === "bought" && w.status_at ? `<p class="ev-wish-by">${esc(tr("boughtOn", { date: fmtDate(w.status_at) }))}</p>` : ""}
      ${w.admin_note ? `<p class="wish-admin-note">${esc(tr("adminNote", { note: w.admin_note }))}</p>` : ""}
      ${w.description ? `<p class="ev-wish-desc">${esc(w.description)}</p>` : ""}
      <p class="ev-wish-by">${esc(w.name ? tr("by", { name: w.name, date }) : tr("byAnon", { date }))}</p>
      <div class="ev-wish-vote">${voteBtn}<span class="ev-wish-count">${esc(tr("votes", { n: w.votes || 0 }))}</span></div>
      ${admin || own || del ? `<p class="ev-admin-row">${own}${admin}${del}</p>` : ""}
    </article>`;
  }
  let boughtOpen = location.hash === "#bought";
  function render() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    document.title = `${tr("title")} · ${HVI18n.t("siteName")}`;
    $("gw-title").textContent = tr("title");
    $("gw-back").textContent = tr("back");
    $("lang-toggle").textContent = HVI18n.t("toggle");
    $("lang-toggle").setAttribute("aria-label", HVI18n.t("toggleLabel"));
    if (!HVLoans.enabled) return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("noBackend"))}</p>`);
    if (loadErr)
      return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("loadFailed", { msg: errText(loadErr) }))}</p><button class="btn" type="button" data-retry>${esc(tr("retry"))}</button>`);
    if (!wishes) return void (main.innerHTML = `<p class="ev-msg">${esc(tr("loading"))}</p>`);
    // Adopted (购买中) first, then the rest by votes (the server's order); declined at the end; bought in the history.
    const active = [...wishes.filter((w) => w.status === "buying"), ...wishes.filter((w) => w.status === "watching" || w.status === "open")];
    const rejected = wishes.filter((w) => w.status === "rejected");
    const bought = wishes.filter((w) => w.status === "bought").sort((a, b) => String(b.status_at || "").localeCompare(String(a.status_at || "")));
    const list = [...active, ...rejected];
    main.innerHTML = `<section class="ev-wishes">
        <div class="ev-head"><h2>${esc(tr("heading"))}</h2>${
          signedIn() ? `<button class="btn" type="button" data-add>${esc(tr("add"))}</button>` : `<a class="btn" href="${esc(LOGIN)}">${esc(tr("signIn"))}</a>`
        }</div>
        <p class="ev-hint">${esc(tr("intro"))}</p>
        ${signedIn() ? "" : `<p class="ev-msg">${esc(tr("signInHint"))}</p>`}
        <p class="ev-wish-note">${esc(tr("note"))}</p>
        ${flash ? `<p class="ev-msg ${flash.ok ? "is-ok" : "is-err"}" role="status">${esc(flash.text)}</p>` : ""}
        ${list.length ? `<div class="ev-wish-list">${list.map(card).join("")}</div>` : `<p class="ev-empty">${esc(tr("empty"))}</p>`}
      </section>
      ${bought.length ? `<details class="ev-past" id="bought" data-bought${boughtOpen ? " open" : ""}><summary>${esc(tr("bought", { n: bought.length }))}</summary>
        <p class="ev-hint">${esc(tr("boughtHint"))}</p>
        <div class="ev-wish-list">${bought.map(card).join("")}</div></details>` : ""}`;
  }

  // ---------- dialogs ----------
  const head = (title) => `<div class="ev-sheet-head"><h2 id="gw-dlg-title">${esc(title)}</h2><button class="ev-close" type="button" data-close aria-label="${esc(tr("close"))}">✕</button></div>`;
  const errLine = () => (D && D.err ? `<p class="ev-msg is-err" role="alert">${esc(D.err)}</p>` : "");
  function openDialog(state) {
    D = state;
    renderDialog();
    if (!dlg.open) dlg.showModal();
    const first = dlg.querySelector("[autofocus]");
    if (first) first.focus();
  }
  function closeDialog() {
    if (D && D.preview) URL.revokeObjectURL(D.preview);
    D = null;
    if (dlg.open) dlg.close();
  }
  function renderDialog() {
    if (!D) return;
    if (D.mode === "form") return renderForm();
    if (D.mode === "note") return renderNoteForm();
    if (D.mode === "photo") {
      dlg.innerHTML = `${head(D.title)}<img class="ev-qr-big gw-photo-big" src="${esc(HVLoans.wishPhotoUrl(D.photo))}" alt="${esc(tr("photoAlt", { title: D.title }))}">`;
    }
  }
  function renderForm() {
    const shown = D.preview || (D.photo ? HVLoans.wishPhotoUrl(D.photo) : "");
    dlg.innerHTML = `${head(tr(D.id ? "editTitle" : "formTitle"))}
      <form class="ev-form" data-form novalidate>
        <p class="ev-wish-note">${esc(tr("note"))}</p>
        <label class="ev-field"><span>${esc(tr("fTitle"))}</span><input name="title" maxlength="80" placeholder="${esc(tr("fTitlePh"))}" value="${esc(D.title)}" required autofocus></label>
        <label class="ev-field"><span>${esc(tr("fDesc"))}</span><textarea name="desc" rows="3" maxlength="1000" placeholder="${esc(tr("fDescPh"))}">${esc(D.desc)}</textarea></label>
        <div class="ev-field"><span>${esc(tr("fPhoto"))}</span>
          ${shown ? `<div class="gw-preview"><img src="${esc(shown)}" alt=""><button class="link-btn" type="button" data-photo-remove>${esc(tr("fPhotoRemove"))}</button></div>` : ""}
          <input name="photo" type="file" accept="image/*">
          <small class="ev-hint">${esc(tr("fPhotoHint"))}</small>
        </div>
        <label class="ev-field"><span>${esc(tr("fName"))}</span><input name="name" maxlength="30" autocomplete="nickname" placeholder="${esc(tr("fNamePh"))}" value="${esc(D.name)}"></label>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr(D.id ? "save" : "submit"))}</button></div>
      </form>`;
  }
  function renderNoteForm() {
    const w = wishes.find((x) => x.id === D.id);
    if (!w) return closeDialog();
    const k = D.status === "buying" ? "noteTitleAdopt" : D.status === "rejected" ? "noteTitleReject" : "noteTitleEdit";
    dlg.innerHTML = `${head(tr(k, { title: w.title }))}
      <form class="ev-form" data-note-form novalidate>
        <label class="ev-field"><span>${esc(tr("noteField"))}</span><textarea name="note" rows="3" maxlength="300" placeholder="${esc(tr(D.status === "rejected" ? "notePhReject" : "notePhAdopt"))}" autofocus>${esc(D.note)}</textarea></label>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("noteSave"))}</button></div>
      </form>`;
  }
  function readForm() {
    const f = dlg.querySelector("form");
    if (!f || !D) return;
    if (D.mode === "form") {
      D.title = f.elements.title.value;
      D.desc = f.elements.desc.value;
      D.name = f.elements.name.value;
    }
    if (D.mode === "note") D.note = f.elements.note.value;
  }

  // Phone photos are big: keep the longest side at most 1280 px, as a JPEG.
  async function shrinkImage(file) {
    if (!file || !/^image\//i.test(file.type || "")) throw Object.assign(new Error("not an image"), { code: "not-image" });
    let img;
    try {
      img = await createImageBitmap(file);
    } catch {
      throw Object.assign(new Error("not an image"), { code: "not-image" });
    }
    const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("could not read the picture"))), "image/jpeg", 0.85));
  }

  async function run(fn) {
    if (busy) return;
    busy = true;
    if (D) {
      D.err = "";
      renderDialog();
    }
    try {
      await fn();
      busy = false;
      closeDialog();
      await load();
    } catch (err) {
      busy = false;
      if (D) {
        D.err = errText(err);
        renderDialog();
      } else {
        flash = { text: errText(err), ok: false };
        render();
      }
    }
  }
  async function submitForm() {
    readForm();
    D.err = "";
    const title = D.title.trim().slice(0, 80);
    if (!title) {
      D.err = tr("needTitle");
      return renderDialog();
    }
    const st = D;
    const before = st.id ? (wishes.find((x) => x.id === st.id) || {}).photo || "" : ""; // the photo saved now
    await run(async () => {
      let photo = st.photo || "";
      let uploaded = "";
      if (st.file) photo = uploaded = await HVLoans.uploadWishPhoto(await shrinkImage(st.file));
      const fields = { name: st.name.trim().slice(0, 30), title, description: st.desc.trim().slice(0, 1000), photo };
      try {
        if (st.id) {
          if (!(await HVLoans.updateGameWish(st.id, fields, token()))) throw Object.assign(new Error("not mine"), { code: "not-mine" });
          flash = { text: tr("saved"), ok: true };
        } else {
          await HVLoans.addGameWish(fields, token());
          flash = { text: tr("thanks"), ok: true };
        }
      } catch (err) {
        if (uploaded) await HVLoans.deleteWishPhoto(uploaded).catch(() => {}); // not saved: don't keep the new photo
        throw err;
      }
      // A replaced or removed photo is deleted from storage, so nothing is left behind.
      if (before && before !== photo) await HVLoans.deleteWishPhoto(before).catch(() => {});
    });
  }
  async function submitNote() {
    readForm();
    const st = D;
    await run(async () => {
      await HVLoans.setGameWishStatus(st.id, st.status || null, st.note);
      flash = null;
    });
  }
  async function vote(id, btn) {
    if (!signedIn()) return void (location.href = LOGIN);
    if (busy) return;
    busy = true;
    btn.disabled = true;
    try {
      const r = await HVLoans.toggleGameWishVote(id, token());
      const w = wishes.find((x) => x.id === id);
      if (w) w.votes = r.votes;
      r.voted ? voted.add(id) : voted.delete(id);
      flash = null;
    } catch (err) {
      flash = { text: errText(err), ok: false };
    }
    busy = false;
    render();
  }

  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-retry")) {
      wishes = null;
      render();
      return void load();
    }
    if (b.hasAttribute("data-add")) return openDialog({ mode: "form", id: null, title: "", desc: "", name: "", photo: "", file: null, preview: "", err: "" });
    if (b.dataset.photo) return openDialog({ mode: "photo", photo: b.dataset.photo, title: b.dataset.title });
    if (b.dataset.vote) return void vote(Number(b.dataset.vote), b);
    const id = Number(b.dataset.id);
    const w = wishes && wishes.find((x) => x.id === id);
    if (!w) return;
    if (b.dataset.status) return void run(() => HVLoans.setGameWishStatus(id, b.dataset.status));
    if (b.dataset.noteFor != null) return openDialog({ mode: "note", id, status: b.dataset.noteFor, note: w.admin_note || "", err: "" });
    if (b.hasAttribute("data-edit")) return openDialog({ mode: "form", id, title: w.title, desc: w.description, name: w.name, photo: w.photo || "", file: null, preview: "", err: "" });
    if (b.hasAttribute("data-del")) {
      if (!confirm(tr("delConfirm", { title: w.title }))) return;
      return void run(async () => {
        if (isAdmin) await HVLoans.deleteGameWish(id);
        else if (!(await HVLoans.deleteOwnGameWish(id, token()))) throw Object.assign(new Error("not mine"), { code: "not-mine" });
        if (w.photo) await HVLoans.deleteWishPhoto(w.photo).catch(() => {}); // the photo goes with it
        flash = { text: tr("deleted"), ok: true };
      });
    }
  });
  main.addEventListener(
    "toggle",
    (e) => {
      if (e.target.matches && e.target.matches("[data-bought]")) boughtOpen = e.target.open;
    },
    true
  );
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest("[data-close]")) return closeDialog();
    if (e.target.closest("[data-photo-remove]")) {
      readForm();
      if (D.preview) URL.revokeObjectURL(D.preview);
      Object.assign(D, { photo: "", file: null, preview: "" });
      renderDialog();
    }
  });
  dlg.addEventListener("change", (e) => {
    if (!D || e.target.name !== "photo") return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    readForm();
    if (!/^image\//i.test(file.type || "")) {
      D.err = tr("fPhotoBad");
      return renderDialog();
    }
    if (D.preview) URL.revokeObjectURL(D.preview);
    Object.assign(D, { file, preview: URL.createObjectURL(file), err: "" });
    renderDialog();
  });
  dlg.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!D) return;
    if (e.target.hasAttribute("data-form")) return void submitForm();
    if (e.target.hasAttribute("data-note-form")) return void submitNote();
  });
  dlg.addEventListener("cancel", (e) => {
    if (busy) e.preventDefault();
  });
  dlg.addEventListener("close", () => {
    if (!busy) D = null;
  });

  $("lang-toggle").addEventListener("click", () => {
    readForm();
    HVI18n.toggle();
  });
  HVI18n.onChange(() => {
    render();
    renderDialog();
  });
  render();
  if (!HVLoans.enabled) return;
  load();
  if (HVLoans.user)
    HVLoans.isAdmin().then(
      (yes) => {
        isAdmin = yes;
        render();
      },
      () => {}
    );
})();
