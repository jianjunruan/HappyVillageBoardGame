(() => {
  const els = {
    grid: document.getElementById("grid"),
    status: document.getElementById("status"),
    search: document.getElementById("search"),
    tags: document.getElementById("tags"),
    dialog: document.getElementById("detail"),
    detailBody: document.getElementById("detail-body"),
  };

  let games = [];
  let activeTag = null;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function meta(game) {
    return [
      game.players && `👥 ${esc(game.players)}`,
      game.playtime && `⏱ ${esc(game.playtime)}`,
      game.age && `🎂 ${esc(game.age)}`,
    ].filter(Boolean);
  }

  function renderTags() {
    const all = [...new Set(games.flatMap((g) => g.tags || []))].sort();
    els.tags.innerHTML = ["All", ...all]
      .map((t) => {
        const on = (t === "All" && !activeTag) || t === activeTag;
        return `<button class="chip${on ? " is-on" : ""}" data-tag="${esc(t)}">${esc(t)}</button>`;
      })
      .join("");
  }

  function renderGrid() {
    const q = els.search.value.trim().toLowerCase();
    const list = games.filter((g) => {
      const text = [g.name, g.description, ...(g.tags || [])].join(" ").toLowerCase();
      return (!q || text.includes(q)) && (!activeTag || (g.tags || []).includes(activeTag));
    });

    els.status.textContent = list.length ? "" : "No games match your search.";
    els.grid.innerHTML = list
      .map(
        (g) => `
        <a class="card" href="#/game/${encodeURIComponent(g.id)}">
          <img src="${esc(HVMedia.imageUrl(g.image))}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">
          <div class="card-body">
            <h2>${esc(g.name)}</h2>
            <p class="meta">${meta(g).join(" · ")}</p>
            <p class="summary">${esc(g.description)}</p>
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
      (m.embedUrl ? videos : others).push({ ...link, ...m });
    }
    const videoHtml = videos
      .map(
        (v) => `
        <figure class="video">
          <div class="frame"><iframe src="${esc(v.embedUrl)}" title="${esc(v.label || "Video")}" loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
          <figcaption>${esc(v.label || "Video")} · <a href="${esc(v.url)}" target="_blank" rel="noopener">open in ${v.type === "youtube" ? "YouTube" : "Google Drive"} ↗</a></figcaption>
        </figure>`
      )
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
      <img class="hero" src="${esc(HVMedia.imageUrl(g.image))}" alt="${esc(g.name)}" onerror="this.src='images/placeholder.svg'">
      <h2 id="detail-title">${esc(g.name)}</h2>
      <p class="meta">${meta(g).join(" · ")}</p>
      ${(g.tags || []).length ? `<p class="tag-row">${g.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</p>` : ""}
      <p class="description">${esc(g.description)}</p>
      ${renderLinks(g.links)}`;
    document.title = `${g.name} · ${HV_CONFIG.siteName}`;
    if (!els.dialog.open) els.dialog.showModal();
  }

  function closeGame() {
    if (els.dialog.open) els.dialog.close();
    els.detailBody.innerHTML = ""; // stops any playing video
    document.title = HV_CONFIG.siteName;
  }

  function route() {
    const m = location.hash.match(/^#\/game\/(.+)$/);
    m ? openGame(decodeURIComponent(m[1])) : closeGame();
  }

  els.search.addEventListener("input", renderGrid);
  els.tags.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tag]");
    if (!btn) return;
    activeTag = btn.dataset.tag === "All" ? null : btn.dataset.tag;
    renderTags();
    renderGrid();
  });
  els.dialog.addEventListener("close", () => {
    if (location.hash) history.pushState("", document.title, location.pathname + location.search);
    closeGame();
  });
  els.dialog.addEventListener("click", (e) => {
    if (e.target === els.dialog || e.target.closest("[data-close]")) els.dialog.close();
  });
  window.addEventListener("hashchange", route);

  HVData.getGames()
    .then((data) => {
      games = data.slice().sort((a, b) => a.name.localeCompare(b.name));
      renderTags();
      renderGrid();
      route();
    })
    .catch((err) => {
      els.status.textContent =
        location.protocol === "file:"
          ? "Open this site through a web server (see README), not by double-clicking index.html."
          : err.message;
    });
})();
