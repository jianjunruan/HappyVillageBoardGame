(() => {
  const { t, loc } = HVI18n;
  const els = {
    grid: document.getElementById("grid"),
    status: document.getElementById("status"),
    search: document.getElementById("search"),
    cats: document.getElementById("cats"),
    tags: document.getElementById("tags"),
    loanFilter: document.getElementById("loan-filter"),
    langToggle: document.getElementById("lang-toggle"),
    dialog: document.getElementById("detail"),
    detailBody: document.getElementById("detail-body"),
    adminBar: document.getElementById("admin-bar"),
    login: document.getElementById("login"),
    loginForm: document.getElementById("login-form"),
    loginError: document.getElementById("login-error"),
  };

  let games = [];
  let tagNames = {};
  let activeTag = null;
  let activeCat = null;
  let activeLoan = null; // null = all, "in" = available, "out" = on loan, "present" / "storage" = has sets there
  let loaded = false;
  let loans = {}; // open loans by game id (a list per game), from Supabase
  let rulebooks = {}; // game id -> { updated, size } for games with a rulebook PDF
  let info = {}; // sets per location by game id: { present, storage }; games not listed have 1 set, present
  let loansFailed = false;
  let loansLoaded = false;
  let adminOK = false; // the signed-in account is an admin (player accounts can be signed in too)

  // Sections and difficulty bands (BGG weight, 1–5), in display order.
  const CATEGORIES = ["euro", "american", "party", "card", "abstract", "family", "puzzle", "war", "roleplay"];
  const BANDS = [
    { key: "light", max: 2, range: "1–2" },
    { key: "medium-light", max: 2.75, range: "2–2.75" },
    { key: "medium-heavy", max: 3.5, range: "2.75–3.5" },
    { key: "heavy", max: Infinity, range: "3.5–5" },
  ];
  // Games without a known category land in an "other" section so they never disappear.
  const catOf = (g) => (CATEGORIES.includes(g.category) ? g.category : "other");
  const bandOf = (g) => BANDS.findIndex((b) => (g.weight ?? 0) < b.max);
  const dots = (i) => "★".repeat(i + 1) + "☆".repeat(BANDS.length - i - 1);

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Tags are stored as keys (e.g. "Strategy"); their translations live in games.json → "tags".
  const tagLabel = (key) => loc(tagNames[key]) || key;
  const gameName = (g) => loc(g.name);

  // Dates: timestamps come as ISO strings, due dates as "YYYY-MM-DD" (read as a local date, not UTC).
  const toDate = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(...s.split("-").map((n, i) => (i === 1 ? n - 1 : +n))) : new Date(s));
  const fmtDate = (s) =>
    toDate(s).toLocaleDateString(HVI18n.lang === "zh" ? "zh-CN" : "en", { year: "numeric", month: "short", day: "numeric" });
  // Today as "YYYY-MM-DD" in local time (for date inputs).
  const todayYmd = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const isOverdue = (loan) => loan.due_date && toDate(loan.due_date) < new Date(new Date().toDateString());

  // Sets owned, sets out and sets left for a game.
  const loansOf = (g) => loans[g.id] || [];
  const setsAt = (g) => ({ present: 1, storage: 0, withOwner: 0, owner: "", rulebookFrom: null, ...info[g.id] });
  const ownedOf = (g) => setsAt(g).present + setsAt(g).storage + setsAt(g).withOwner;
  // Where sets can be: at the venue, in storage, or at the owner's place (only when an owner is set).
  const LOCATIONS = ["present", "storage", "owner"];
  const locationIcon = (loc) => ({ storage: "📦", owner: "🏠" })[loc] || "📍";
  const countAt = (g, loc) => (loc === "owner" ? setsAt(g).withOwner : setsAt(g)[loc]);
  const locLabel = (g, loc) => (loc === "owner" ? t("loc_owner", { name: setsAt(g).owner }) : t("loc_" + loc));
  // "📍 在场" for a single set; "📍 在场 2 套 · 📦 仓库 1 套" when there are several; "⚪ 暂无（0 套）" when none.
  const whereHtml = (g, cls) =>
    ownedOf(g) === 0
      ? `<span class="${cls} loc-none">⚪ ${esc(t("loc_none"))}</span>`
      : LOCATIONS.filter((loc) => countAt(g, loc) > 0)
      .map((loc) => {
        const n = ownedOf(g) > 1 ? ` ${t("loanQty", { n: countAt(g, loc) })}` : "";
        return `<span class="${cls} loc-${loc}">${locationIcon(loc)} ${esc(locLabel(g, loc))}${esc(n)}</span>`;
      })
      .join(" ");
  const outOf = (g) => loansOf(g).reduce((n, l) => n + (l.quantity || 1), 0);
  const leftOf = (g) => Math.max(ownedOf(g) - outOf(g), 0);

  function meta(game) {
    return [
      game.players && `<span>👥 ${esc(t("players", { v: game.players }))}</span>`,
      game.playtime && `<span>⏱ ${esc(t("playtime", { v: game.playtime }))}</span>`,
      game.age && `<span>🎂 ${esc(t("age", { v: game.age }))}</span>`,
      game.weight &&
        `<span><span class="stars" aria-hidden="true">${dots(bandOf(game))}</span> ${esc(t("difficulty", { band: t("band_" + BANDS[bandOf(game)].key), v: game.weight.toFixed(1) }))}</span>`,
    ].filter(Boolean);
  }

  function renderCats() {
    const chip = (key, label) =>
      `<button class="chip${key === activeCat ? " is-on" : ""}" data-cat="${esc(key ?? "")}">${esc(label)}</button>`;
    els.cats.innerHTML = chip(null, t("all")) + CATEGORIES.map((c) => chip(c, t("cat_" + c))).join("");
  }

  function renderTags() {
    const keys = [...new Set(games.flatMap((g) => g.tags || []))].sort((a, b) =>
      tagLabel(a).localeCompare(tagLabel(b), HVI18n.lang)
    );
    const chip = (key, label) => {
      const on = key === activeTag;
      return `<button class="chip${on ? " is-on" : ""}" data-tag="${esc(key ?? "")}">${esc(label)}</button>`;
    };
    els.tags.innerHTML = chip(null, t("all")) + keys.map((k) => chip(k, tagLabel(k))).join("");
  }

  // Available / on-loan filter; only shown once loan data has loaded.
  function renderLoanFilter() {
    const show = HVLoans.enabled && !loansFailed;
    els.loanFilter.hidden = !show;
    if (!show) return;
    const out = games.filter((g) => outOf(g) > 0).length;
    const chip = (key, label) =>
      `<button class="chip${key === activeLoan ? " is-on" : ""}" data-loan="${esc(key ?? "")}">${esc(label)}</button>`;
    const at = (loc) => games.filter((g) => countAt(g, loc) > 0).length;
    const none = games.filter((g) => ownedOf(g) === 0).length;
    els.loanFilter.innerHTML =
      chip(null, t("all")) +
      chip("in", t("loanFilterIn")) +
      chip("out", `${t("loanFilterOut")} (${out})`) +
      LOCATIONS.filter((loc) => loc !== "owner" || at(loc) || activeLoan === "owner")
        .map((loc) => chip(loc, `${locationIcon(loc)} ${t("locFilter_" + loc)} (${at(loc)})`))
        .join("") +
      (none || activeLoan === "none" ? chip("none", `⚪ ${t("loc_noneShort")} (${none})`) : "");
  }

  function renderGrid() {
    const q = els.search.value.trim().toLowerCase();
    const list = games
      .filter((g) => {
        // Search matches either language, so "catan" and "卡坦" both work.
        const text = [g.name, g.description, ...(g.tags || []).flatMap((k) => [k, tagNames[k]])]
          .flatMap((v) => (v && typeof v === "object" ? Object.values(v) : [v]))
          .join(" ")
          .toLowerCase();
        return (
          (!q || text.includes(q)) &&
          (!activeTag || (g.tags || []).includes(activeTag)) &&
          (!activeCat || catOf(g) === activeCat) &&
          (!activeLoan ||
            (activeLoan === "out" ? outOf(g) > 0 : activeLoan === "in" ? leftOf(g) > 0 : activeLoan === "none" ? ownedOf(g) === 0 : countAt(g, activeLoan) > 0))
        );
      });
    // Easiest first within each category and band, but games in the same series (base game, expansions,
    // editions) stay together: the series sits where its easiest member would, base game first.
    const groupKey = (g) => `${catOf(g)}|${bandOf(g)}|${g.series || g.id}`;
    const groupMin = {};
    for (const g of list) groupMin[groupKey(g)] = Math.min(groupMin[groupKey(g)] ?? Infinity, g.weight ?? 0);
    const groupName = {};
    for (const g of list) if (!groupName[groupKey(g)] || g.id === g.series) groupName[groupKey(g)] = gameName(g);
    list.sort(
      (a, b) =>
        groupMin[groupKey(a)] - groupMin[groupKey(b)] ||
        groupName[groupKey(a)].localeCompare(groupName[groupKey(b)], HVI18n.lang) ||
        groupKey(a).localeCompare(groupKey(b)) ||
        (b.id === b.series) - (a.id === a.series) ||
        (a.weight ?? 0) - (b.weight ?? 0) ||
        gameName(a).localeCompare(gameName(b), HVI18n.lang)
    );

    // Quick-look tags in the card's top-right corner: sets owned, where they are, and loan status.
    const badge = (g) => {
      if (!HVLoans.enabled || loansFailed || !loansLoaded) return "";
      const owned = ownedOf(g);
      const tag = (cls, text, title = "") =>
        `<span class="card-tag ${cls}"${title ? ` title="${esc(title)}"` : ""}>${esc(text)}</span>`;
      if (owned === 0) return `<div class="card-tags">${tag("is-none", `⚪ ${t("loc_none")}`)}</div>`;
      // One place: "📍 在场" / "📦 仓库" / "🏠 在小明处". Several: "📍1 📦1 🏠1" (hover for details).
      const places = LOCATIONS.filter((loc) => countAt(g, loc) > 0);
      const where =
        places.length > 1
          ? tag(
              "is-where",
              places.map((loc) => `${locationIcon(loc)}${countAt(g, loc)}`).join(" "),
              places.map((loc) => `${locLabel(g, loc)} ${countAt(g, loc)}`).join(" · ")
            )
          : tag("is-where", `${locationIcon(places[0])} ${locLabel(g, places[0])}`);
      const list = loansOf(g);
      const left = leftOf(g);
      const who = list.map((l) => `${l.borrower}${(l.quantity || 1) > 1 ? ` ×${l.quantity}` : ""}`).join("、");
      const overdue = list.some(isOverdue) ? " is-overdue" : "";
      const status = !list.length
        ? tag("is-in", owned > 1 ? `🟢 ${t("tagLeft", { n: left })}` : `🟢 ${t("loanFilterIn")}`)
        : left
          ? tag(`is-partial${overdue}`, `🟠 ${t("tagOut", { out: outOf(g), owned })}`, who)
          : tag(`is-out${overdue}`, `🔴 ${t("loanOnLoan")}${owned === 1 ? ` · ${who}` : ` ${outOf(g)}/${owned}`}`, who);
      return `<div class="card-tags">${tag("is-sets", `🎲 ${t("loanQty", { n: owned })}`)}${where}${status}</div>`;
    };
    const card = (g) => `
        <a class="card${loansLoaded && !loansFailed && ownedOf(g) === 0 ? " is-gone" : ""}" href="#/game/${encodeURIComponent(g.id)}">
          ${badge(g)}
          <img src="${esc(HVMedia.imageUrl(g.image))}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">
          <div class="card-body">
            <h4 class="card-title">${esc(gameName(g))}</h4>
            <p class="meta">${meta(g).join(" · ")}</p>
            <p class="summary">${esc(loc(g.description))}</p>
          </div>
        </a>`;

    // Category sections, each split into difficulty bands from light to heavy.
    els.status.textContent = list.length ? "" : t("noMatch");
    els.grid.innerHTML = [...CATEGORIES, "other"].map((cat) => {
      const inCat = list.filter((g) => catOf(g) === cat);
      if (!inCat.length) return "";
      const bands = BANDS.map((b, i) => {
        const inBand = inCat.filter((g) => bandOf(g) === i);
        if (!inBand.length) return "";
        return `
          <div class="band">
            <h3 class="band-title"><span class="dots" aria-hidden="true">${dots(i)}</span> ${esc(t("band_" + b.key))}
              <span class="band-range">${esc(t("bandRange", { v: b.range }))} · ${esc(t("count", { n: inBand.length }))}</span></h3>
            <div class="grid">${inBand.map(card).join("")}</div>
          </div>`;
      }).join("");
      return `
        <section class="cat-section" id="cat-${cat}">
          <h2 class="cat-title">${esc(t("cat_" + cat))} <span class="count">${esc(t("count", { n: inCat.length }))}</span></h2>
          <p class="cat-hint">${esc(t("cat_" + cat + "_hint"))}</p>
          ${bands}
        </section>`;
    }).join("");
  }

  function renderLinks(links = []) {
    const videos = [];
    const others = [];
    for (const link of links) {
      const m = HVMedia.parse(link.url);
      (m.embedUrl ? videos : others).push({ ...m, label: loc(link.label) });
    }
    const videoHtml = videos
      .map((v) => {
        const label = v.label || t("video");
        const site = v.type === "youtube" ? "YouTube" : "Google Drive";
        return `
        <figure class="video">
          <div class="frame"><iframe src="${esc(v.embedUrl)}" title="${esc(label)}" loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
          <figcaption>${esc(label)} · <a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(t("openIn", { site }))} ↗</a></figcaption>
        </figure>`;
      })
      .join("");
    const linkHtml = others.length
      ? `<ul class="links">${others
          .map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)} ↗</a></li>`)
          .join("")}</ul>`
      : "";
    return videoHtml + linkHtml;
  }

  // --- Loan box in the game popup: status for everyone, lend/return + history for admins ---
  // Summary line (e.g. "🟢 共 3 套 · 可借 1 套"), then one line per open loan.
  function loanStatusHtml(g, admin) {
    const owned = ownedOf(g);
    const left = leftOf(g);
    const summary =
      owned === 0
        ? `<p class="loan-status is-none">⚪ ${esc(t("loanNone"))}</p>`
        : owned > 1
        ? `<p class="loan-status ${left ? "is-in" : "is-out"}">${left ? "🟢" : "🔴"} ${esc(t("loanSets", { owned, left }))}</p>`
        : left
          ? `<p class="loan-status is-in">🟢 ${esc(t("loanAvailable"))}</p>`
          : `<p class="loan-status is-out">🔴 ${esc(t("loanOnLoan"))}</p>`;
    const rows = loansOf(g).map((loan) => {
      const bits = [t("loanTo", { name: loan.borrower })];
      if (owned > 1 || (loan.quantity || 1) > 1) bits.push(t("loanQty", { n: loan.quantity || 1 }));
      bits.push(t("loanSince", { date: fmtDate(loan.loaned_at) }));
      if (loan.due_date) bits.push(t("loanDue", { date: fmtDate(loan.due_date) }));
      const overdue = isOverdue(loan) ? ` <strong class="overdue">${esc(t("loanOverdue"))}</strong>` : "";
      const ret = admin
        ? `<button class="btn ghost btn-sm" type="button" data-loan-return="${esc(loan.id)}" data-borrower="${esc(loan.borrower)}">${esc(t("loanReturn"))}</button>`
        : "";
      return `<li><span>${esc(bits.join(" · "))}${overdue}</span>${ret}</li>`;
    });
    const where = owned === 0 ? "" : whereHtml(g, "loan-loc");
    const owner = setsAt(g).owner ? `<p class="loan-owner">👤 ${esc(t("ownerIs", { name: setsAt(g).owner }))}</p>` : "";
    // The game's own rulebook, plus the one it shares with another game (set by an admin, or "rulebookFrom" in games.json).
    const sharedId = HVShare.resolve(games, g, info, rulebooks);
    const shared = sharedId && games.find((x) => x.id === sharedId);
    const bookLinks = [
      rulebooks[g.id] && [g.id, t("rulebook")],
      shared && [shared.id, t("rulebookBase", { name: gameName(shared) })],
    ].filter(Boolean);
    const book = bookLinks.length
      ? `<p class="loan-rulebook">${bookLinks
          .map(([id, label]) => {
            const url = HVLoans.rulebookUrl(id, rulebooks[id]);
            return `<span class="rulebook-item"><a href="${esc(url)}" target="_blank" rel="noopener">📖 ${esc(label)} ↗</a>` +
              `<button class="link-btn pdf-preview-btn" type="button" data-preview="${esc(url)}" data-preview-title="${esc(label)}">👁 ${esc(t("preview"))}</button></span>`;
          })
          .join("")}</p>`
      : "";
    return summary.replace("</p>", ` ${where}</p>`) + owner + book + (rows.length ? `<ul class="loan-list">${rows.join("")}</ul>` : "");
  }

  function renderLoanBox(g, message = "", messageOk = false) {
    const box = els.detailBody.querySelector("#loan-box");
    if (!box) return;
    if (loansFailed) {
      box.innerHTML = `<p class="loan-status">${esc(t("loanLoadError"))}</p>`;
      return;
    }
    const isAdmin = adminOK;
    let admin = "";
    if (isAdmin) {
      const left = leftOf(g);
      // Quantity picker only when more than one set is left.
      const qty =
        left > 1
          ? `<label class="loan-qty">${esc(t("loanQtyLabel"))}<select name="quantity">${Array.from({ length: left }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("")}</select></label>`
          : `<input type="hidden" name="quantity" value="1">`;
      const s = setsAt(g);
      admin = `<form class="loan-form copies-form" data-copies>
             <label class="owner-field">👤 ${esc(t("ownerLabel"))}<input name="owner" maxlength="60" autocomplete="off" value="${esc(s.owner)}" placeholder="${esc(t("ownerPlaceholder"))}"></label>
             <label>📍 ${esc(t("setsPresent"))}<input name="present" type="number" min="0" max="99" step="1" value="${s.present}" required></label>
             <label>📦 ${esc(t("setsStorage"))}<input name="storage" type="number" min="0" max="99" step="1" value="${s.storage}" required></label>
             <label data-owner-only${s.owner ? "" : " hidden"}>🏠 ${esc(t("setsWithOwner"))}<input name="withOwner" type="number" min="0" max="99" step="1" value="${s.withOwner}" required></label>
             <button class="btn ghost" type="submit">${esc(t("copiesSave"))}</button>
           </form>`;
      admin += left
        ? `<form class="loan-form lend-form" data-loan-lend>
             <label>${esc(t("loanBorrower"))}<input name="borrower" required maxlength="60" autocomplete="off"></label>
             ${qty}
             <label class="date-field">${esc(t("loanDateLabel"))}<input name="loaned" type="hidden" value="${todayYmd()}" data-datepicker data-max="today"></label>
             <label class="date-field">${esc(t("loanDueLabel"))}<input name="due" type="hidden" value="" data-datepicker data-optional data-min-field="loaned" data-quick="week,2weeks,month" data-placeholder="${esc(t("loanDueNone"))}"></label>
             <button class="btn" type="submit">${esc(t("loanLend"))}</button>
           </form>`
        : "";
      const has = Boolean(rulebooks[g.id]);
      const shareId = HVShare.target(g, info);
      const baseGame = shareId && games.find((x) => x.id === shareId);
      const baseHint = baseGame && !has
        ? `<p class="hint rulebook-hint">${esc(t(HVShare.resolve(games, g, info, rulebooks) ? "rulebookUsingBase" : "rulebookBaseMissing", { name: gameName(baseGame) }))}</p>`
        : "";
      // Pick which game's rulebook this one shares; similar names are listed first.
      const shareSelect = HVShare.options(games, g, shareId || "", {
        none: t("shareNone"),
        similarLabel: t("shareSimilar"),
        othersLabel: t("shareOthers"),
        lang: HVI18n.lang,
        esc,
      });
      admin += `<form class="loan-form rulebook-form" data-rulebook>${baseHint}
             <label>📖 ${esc(t("rulebookLabel"))}<input name="file" type="file" accept="application/pdf,.pdf" required></label>
             <button class="btn ghost" type="submit">${esc(t(has ? "rulebookReplace" : "rulebookUpload"))}</button>
             ${has ? `<button class="link-btn" type="button" data-rulebook-delete>${esc(t("rulebookDelete"))}</button>` : ""}
           </form>
           <form class="loan-form share-form" data-share>
             <label>🔗 ${esc(t("shareLabel"))}<select name="share">${shareSelect}</select></label>
             <button class="btn ghost" type="submit">${esc(t("copiesSave"))}</button>
           </form>`;
      admin += `<p class="form-error${messageOk ? " is-ok" : ""}" role="alert">${esc(message)}</p>
        <details class="loan-history" data-history><summary>${esc(t("loanHistory"))}</summary><ul><li>…</li></ul></details>`;
    }
    box.innerHTML = loanStatusHtml(g, isAdmin) + admin;
    HVDatePicker.enhance(box);
  }

  async function loadHistory(g, details) {
    const ul = details.querySelector("ul");
    try {
      const rows = await HVLoans.history(g.id);
      ul.innerHTML = rows.length
        ? rows
            .map((r) => {
              const end = r.returned_at ? t("loanReturnedOn", { date: fmtDate(r.returned_at) }) : t("loanOnLoan");
              const qty = (r.quantity || 1) > 1 ? ` · ${t("loanQty", { n: r.quantity })}` : "";
              return `<li>${esc(r.borrower)}${esc(qty)} · ${esc(fmtDate(r.loaned_at))} → ${esc(end)}</li>`;
            })
            .join("")
        : `<li>${esc(t("loanHistoryEmpty"))}</li>`;
    } catch (err) {
      ul.innerHTML = `<li>${esc(t("loanError", { msg: err.message }))}</li>`;
    }
  }

  function loanErrorText(err) {
    if (err.code === "HVC01" || err.code === "23505") return t("loanAlready");
    if (err.code === "HVC02") return t("copiesTooFew");
    if (err.code === "HVC03") return t("loanDateFuture");
    if (err.code === "rulebook-not-pdf") return t("rulebookNotPdf");
    if (err.code === "rulebook-too-big") return t("rulebookTooBig");
    if (err.code === "rulebook-none") return t("rulebookPick");
    if (err.code === "HVC04") return t("loanDueBeforeLoan");
    if (err.code === "42501" || err.code === "nothing-updated" || err.status === 403) return t("loanNotAllowed");
    if (err.status === 401) return t("loanSignedOut");
    return t("loanError", { msg: err.message });
  }

  async function refreshLoans() {
    if (!HVLoans.enabled) return;
    try {
      // Rulebooks are optional: if Storage isn't set up yet, the rest still works.
      [loans, info, rulebooks] = await Promise.all([HVLoans.active(), HVLoans.gameInfo(), HVLoans.rulebooks().catch(() => ({}))]);
      loansFailed = false;
      loansLoaded = true;
    } catch {
      loansFailed = true;
    }
    if (!loaded) return;
    renderLoanFilter();
    renderGrid();
    const g = els.dialog.open && games.find((x) => x.id === currentGameId());
    if (g) renderLoanBox(g);
  }

  // The admin button only appears with ?admin in the address (e.g. index.html?admin=1),
  // or while an admin is signed in, so they can always sign out.
  // Not case-sensitive: ?admin=1, ?Admin=1 and ?ADMIN all work.
  const adminParam = [...new URLSearchParams(location.search).keys()].some((k) => k.toLowerCase() === "admin");
  function renderAdminBar() {
    const show = HVLoans.enabled && (adminParam || adminOK);
    els.adminBar.hidden = !show;
    if (!show) return void (els.adminBar.innerHTML = "");
    const who = HVLoans.user && esc(t("adminSignedIn", { email: HVLoans.user }));
    els.adminBar.innerHTML = adminOK
      ? `<span class="admin-who" title="${who}">${who}</span><a class="admin-btn" href="admin/inventory.html">${esc(t("inventory"))}</a><button class="admin-btn" type="button" data-signout title="${who}">${esc(t("adminSignOut"))}</button>`
      : `<button class="admin-btn" type="button" data-signin>${esc(t("adminLogin"))}</button>`;
  }

  function openGame(id) {
    const g = games.find((x) => x.id === id);
    if (!g) return;
    els.detailBody.innerHTML = `
      <img class="hero" src="${esc(HVMedia.imageUrl(g.image))}" alt="${esc(gameName(g))}" onerror="this.src='images/placeholder.svg'">
      <h2 id="detail-title">${esc(gameName(g))}</h2>
      <p class="meta">${meta(g).join(" · ")}</p>
      ${(g.tags || []).length ? `<p class="tag-row">${g.tags.map((k) => `<span class="chip">${esc(tagLabel(k))}</span>`).join("")}</p>` : ""}
      ${g.scorer ? `<p class="scorer-link"><a class="btn" href="${esc(g.scorer)}">🧮 ${esc(t("scorer"))}</a></p>` : ""}
      ${HVLoans.enabled ? `<div id="loan-box" class="loan-box"></div><div id="pdf-preview" class="pdf-preview" hidden></div>` : ""}
      <p class="description">${esc(loc(g.description))}</p>
      ${renderLinks(g.links)}`;
    renderLoanBox(g);
    document.title = `${gameName(g)} · ${t("siteName")}`;
    if (!els.dialog.open) els.dialog.showModal();
  }

  function closeGame() {
    if (els.dialog.open) els.dialog.close();
    els.detailBody.innerHTML = ""; // stops any playing video
    document.title = t("siteName");
  }

  function currentGameId() {
    const m = location.hash.match(/^#\/game\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function route() {
    const id = currentGameId();
    id ? openGame(id) : closeGame();
  }

  function renderAll() {
    HVI18n.apply();
    document.title = t("siteName");
    els.langToggle.textContent = t("toggle");
    els.langToggle.setAttribute("aria-label", t("toggleLabel"));
    renderAdminBar();
    if (!loaded) return;
    renderCats();
    renderTags();
    renderLoanFilter();
    renderGrid();
    if (els.dialog.open) openGame(currentGameId()); // re-render open popup in the new language
  }

  els.search.addEventListener("input", renderGrid);
  els.tags.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tag]");
    if (!btn) return;
    activeTag = btn.dataset.tag || null;
    renderTags();
    renderGrid();
  });
  els.cats.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    activeCat = btn.dataset.cat || null;
    renderCats();
    renderGrid();
  });
  els.loanFilter.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-loan]");
    if (!btn) return;
    activeLoan = btn.dataset.loan || null;
    renderLoanFilter();
    renderGrid();
  });
  els.langToggle.addEventListener("click", () => HVI18n.toggle());
  HVI18n.onChange(renderAll);
  els.dialog.addEventListener("close", () => {
    if (location.hash) history.pushState("", document.title, location.pathname + location.search);
    closeGame();
  });
  els.dialog.addEventListener("click", (e) => {
    if (e.target === els.dialog || e.target.closest("[data-close]")) els.dialog.close();
  });

  // Admin actions inside the popup.
  els.detailBody.addEventListener("toggle", (e) => {
    const g = games.find((x) => x.id === currentGameId());
    if (g && e.target.matches("[data-history]") && e.target.open) loadHistory(g, e.target);
  }, true);
  els.detailBody.addEventListener("input", (e) => {
    if (e.target.name !== "owner" || !e.target.closest("[data-copies]")) return;
    const field = e.target.closest("[data-copies]").querySelector("[data-owner-only]");
    if (field) field.hidden = !e.target.value.trim();
  });
  els.detailBody.addEventListener("submit", async (e) => {
    const shareForm = e.target.closest("[data-share]");
    if (shareForm) {
      e.preventDefault();
      const g = games.find((x) => x.id === currentGameId());
      if (!g) return;
      shareForm.querySelector("button").disabled = true;
      try {
        // Saved with the game's other settings; "" = shares with none.
        await HVLoans.saveGameInfo(g.id, { ...setsAt(g), rulebookFrom: shareForm.elements.share.value });
        await refreshLoans();
        renderLoanBox(g, t("shareSaved"), true);
      } catch (err) {
        renderLoanBox(g, loanErrorText(err));
        if (err.status === 401) renderAdminBar();
      }
      return;
    }
    const bookForm = e.target.closest("[data-rulebook]");
    if (bookForm) {
      e.preventDefault();
      const g = games.find((x) => x.id === currentGameId());
      if (!g) return;
      const btn = bookForm.querySelector("button[type=submit]");
      btn.disabled = true;
      els.detailBody.querySelector("#loan-box .form-error").textContent = t("rulebookUploading");
      try {
        await HVLoans.uploadRulebook(g.id, bookForm.elements.file.files[0]);
        await refreshLoans();
        renderLoanBox(g, t("rulebookUploaded"), true);
      } catch (err) {
        renderLoanBox(g, loanErrorText(err));
        if (err.status === 401) renderAdminBar();
      }
      return;
    }
    const copiesForm = e.target.closest("[data-copies]");
    if (copiesForm) {
      e.preventDefault();
      const g = games.find((x) => x.id === currentGameId());
      if (!g) return;
      const f = copiesForm.elements;
      const sets = {
        present: parseInt(f.present.value, 10) || 0,
        storage: parseInt(f.storage.value, 10) || 0,
        withOwner: parseInt(f.withOwner.value, 10) || 0,
        owner: f.owner.value.trim(),
        rulebookFrom: setsAt(g).rulebookFrom,
      };
      // No owner: sets can't be "at the owner's", so count them as present.
      if (!sets.owner) {
        sets.present += sets.withOwner;
        sets.withOwner = 0;
      }
      if (!g) return;
      const total = sets.present + sets.storage + sets.withOwner;
      if (total > 99 || total < outOf(g)) {
        renderLoanBox(g, total < outOf(g) ? t("copiesTooFew") : t("setsTotalRange"));
        return;
      }
      copiesForm.querySelector("button").disabled = true;
      try {
        await HVLoans.saveGameInfo(g.id, sets);
        await refreshLoans();
      } catch (err) {
        renderLoanBox(g, loanErrorText(err));
        if (err.status === 401) renderAdminBar();
      }
      return;
    }
    const form = e.target.closest("[data-loan-lend]");
    if (!form) return;
    e.preventDefault();
    const g = games.find((x) => x.id === currentGameId());
    const borrower = form.elements.borrower.value.trim();
    if (!g || !borrower) return;
    // Loan date: today means "now"; an earlier date is recorded at noon that day (local time), so it never
    // slips to the day before when stored in UTC.
    const day = form.elements.loaned.value || todayYmd();
    const due = form.elements.due.value;
    if (day > todayYmd()) return renderLoanBox(g, t("loanDateFuture"));
    if (due && due < day) return renderLoanBox(g, t("loanDueBeforeLoan"));
    const loanedAt = day === todayYmd() ? null : new Date(toDate(day).setHours(12)).toISOString();
    form.querySelector("button").disabled = true;
    try {
      await HVLoans.lend(g.id, borrower, due, parseInt(form.elements.quantity.value, 10) || 1, loanedAt);
      await refreshLoans();
    } catch (err) {
      renderLoanBox(g, loanErrorText(err));
      if (err.status === 401) renderAdminBar();
    }
  });
  // Rulebook preview inside the popup (desktop only; phones open the PDF in a new tab instead).
  function showPreview(url, title) {
    const panel = els.detailBody.querySelector("#pdf-preview");
    if (!panel) return;
    panel.innerHTML = `
      <div class="pdf-preview-bar">
        <strong>📖 ${esc(title)}</strong>
        <span>
          <a href="${esc(url)}" target="_blank" rel="noopener">${esc(t("openNewTab"))} ↗</a>
          <button class="btn ghost btn-sm" type="button" data-preview-close>✕ ${esc(t("previewClose"))}</button>
        </span>
      </div>
      <iframe src="${esc(url)}#view=FitH" title="${esc(title)}"></iframe>`;
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function closePreview() {
    const panel = els.detailBody.querySelector("#pdf-preview");
    if (!panel) return;
    panel.hidden = true;
    panel.innerHTML = ""; // unloads the PDF
  }
  els.detailBody.addEventListener("click", (e) => {
    const open = e.target.closest("[data-preview]");
    if (open) return showPreview(open.dataset.preview, open.dataset.previewTitle);
    if (e.target.closest("[data-preview-close]")) closePreview();
  });

  els.detailBody.addEventListener("click", async (e) => {
    if (e.target.closest("[data-rulebook-delete]")) {
      const g = games.find((x) => x.id === currentGameId());
      if (!g || !confirm(t("rulebookDeleteConfirm", { name: gameName(g) }))) return;
      try {
        await HVLoans.deleteRulebook(g.id);
        await refreshLoans();
        renderLoanBox(g, t("rulebookDeleted"), true);
      } catch (err) {
        renderLoanBox(g, loanErrorText(err));
        if (err.status === 401) renderAdminBar();
      }
      return;
    }
    const btn = e.target.closest("[data-loan-return]");
    if (!btn) return;
    const g = games.find((x) => x.id === currentGameId());
    if (!g || !confirm(t("loanReturnConfirm", { name: gameName(g), borrower: btn.dataset.borrower }))) return;
    btn.disabled = true;
    try {
      await HVLoans.returnLoan(btn.dataset.loanReturn);
      await refreshLoans();
    } catch (err) {
      renderLoanBox(g, loanErrorText(err));
      if (err.status === 401) renderAdminBar();
    }
  });

  // Admin sign-in / sign-out.
  els.adminBar.addEventListener("click", (e) => {
    if (e.target.closest("[data-signin]")) {
      els.loginError.textContent = "";
      els.login.showModal();
    } else if (e.target.closest("[data-signout]")) {
      HVLoans.signOut();
      adminOK = false;
      renderAll();
      window.dispatchEvent(new Event("hv-auth-change"));
    }
  });
  els.login.addEventListener("click", (e) => {
    if (e.target === els.login || e.target.closest("[data-login-cancel]")) els.login.close();
  });
  els.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = els.loginForm.elements;
    els.loginError.textContent = "";
    try {
      await HVLoans.signIn(f.email.value.trim(), f.password.value);
      f.password.value = "";
      if (!(await HVLoans.isAdmin())) {
        HVLoans.signOut();
        els.loginError.textContent = t("notAdmin");
        window.dispatchEvent(new Event("hv-auth-change"));
        return;
      }
      adminOK = true;
      els.login.close();
      renderAll();
      window.dispatchEvent(new Event("hv-auth-change"));
    } catch (err) {
      els.loginError.textContent = t("signInError", { msg: err.message });
    }
  });

  window.addEventListener("hashchange", route);
  // Pick up loans made on another device when the tab comes back into view.
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && refreshLoans());

  // A remembered sign-in may be an admin or a player account; only admins get the admin tools.
  // (Asked of the database on every load, in case the account was removed from the admin list.)
  if (HVLoans.enabled && HVLoans.user) {
    HVLoans.isAdmin()
      .then((ok) => {
        adminOK = ok;
        renderAll();
      })
      .catch(() => {});
  }

  renderAll();
  HVData.getCatalog()
    .then((data) => {
      games = data.games;
      tagNames = data.tags;
      loaded = true;
      els.status.removeAttribute("data-i18n"); // status text is managed by renderGrid from now on
      renderAll();
      route();
      refreshLoans();
    })
    .catch((err) => {
      els.status.removeAttribute("data-i18n");
      els.status.textContent = location.protocol === "file:" ? t("fileProtocol") : `${t("loadError")} (${err.message})`;
    });
})();
