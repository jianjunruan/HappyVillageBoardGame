(() => {
  const { t, loc } = HVI18n;
  const els = {
    grid: document.getElementById("grid"),
    status: document.getElementById("status"),
    search: document.getElementById("search"),
    tags: document.getElementById("tags"),
    langToggle: document.getElementById("lang-toggle"),
    dialog: document.getElementById("detail"),
    detailBody: document.getElementById("detail-body"),
  };

  let games = [];
  let tagNames = {};
  let activeTag = null;
  let loaded = false;

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
    ].filter(Boolean);
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
        return (!q || text.includes(q)) && (!activeTag || (g.tags || []).includes(activeTag));
      })
      .sort((a, b) => gameName(a).localeCompare(gameName(b), HVI18n.lang));

    els.status.textContent = list.length ? "" : t("noMatch");
    els.grid.innerHTML = list
      .map(
        (g) => `
        <a class="card" href="#/game/${encodeURIComponent(g.id)}">
          <img src="${esc(HVMedia.imageUrl(g.image))}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">
          <div class="card-body">
            <h2>${esc(gameName(g))}</h2>
            <p class="meta">${meta(g).join(" · ")}</p>
            <p class="summary">${esc(loc(g.description))}</p>
          </div>
        </a>`
      )
      .join("");
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
