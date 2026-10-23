(() => {
  const { t, loc } = HVI18n;
  const els = {
    grid: document.getElementById("grid"),
    status: document.getElementById("status"),
    search: document.getElementById("search"),
    cats: document.getElementById("cats"),
    tags: document.getElementById("tags"),
    langToggle: document.getElementById("lang-toggle"),
    dialog: document.getElementById("detail"),
    detailBody: document.getElementById("detail-body"),
  };

  let games = [];
  let tagNames = {};
  let activeTag = null;
  let activeCat = null;
  let loaded = false;

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
          (!activeCat || catOf(g) === activeCat)
        );
      })
      // Easiest first within each category; name breaks ties.
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0) || gameName(a).localeCompare(gameName(b), HVI18n.lang));

    const card = (g) => `
        <a class="card" href="#/game/${encodeURIComponent(g.id)}">
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

  function openGame(id) {
    const g = games.find((x) => x.id === id);
    if (!g) return;
    els.detailBody.innerHTML = `
      <img class="hero" src="${esc(HVMedia.imageUrl(g.image))}" alt="${esc(gameName(g))}" onerror="this.src='images/placeholder.svg'">
      <h2 id="detail-title">${esc(gameName(g))}</h2>
      <p class="meta">${meta(g).join(" · ")}</p>
      ${(g.tags || []).length ? `<p class="tag-row">${g.tags.map((k) => `<span class="chip">${esc(tagLabel(k))}</span>`).join("")}</p>` : ""}
      <p class="description">${esc(loc(g.description))}</p>
      ${renderLinks(g.links)}`;
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
    if (!loaded) return;
    renderCats();
    renderTags();
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
  els.langToggle.addEventListener("click", () => HVI18n.toggle());
  HVI18n.onChange(renderAll);
  els.dialog.addEventListener("close", () => {
    if (location.hash) history.pushState("", document.title, location.pathname + location.search);
    closeGame();
  });
  els.dialog.addEventListener("click", (e) => {
    if (e.target === els.dialog || e.target.closest("[data-close]")) els.dialog.close();
  });
  window.addEventListener("hashchange", route);

  renderAll();
  HVData.getCatalog()
    .then((data) => {
      games = data.games;
      tagNames = data.tags;
      loaded = true;
      els.status.removeAttribute("data-i18n"); // status text is managed by renderGrid from now on
      renderAll();
      route();
    })
    .catch((err) => {
      els.status.removeAttribute("data-i18n");
      els.status.textContent = location.protocol === "file:" ? t("fileProtocol") : `${t("loadError")} (${err.message})`;
    });
})();
