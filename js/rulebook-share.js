// Which games share a rulebook (e.g. an expansion uses its base game's Happy Village rulebook).
// The admin's choice is stored in Supabase (game_copies.rulebook_from) and overrides "rulebookFrom" in games.json:
//   null / not set  -> use games.json "rulebookFrom" (the default)
//   ""              -> shares with no other game
//   "<game id>"     -> uses that game's rulebook
window.HVShare = (() => {
  const nameOf = (g, lang) => (typeof g.name === "string" ? g.name : g.name[lang] || g.name.zh || g.name.en || "").trim();
  const norm = (s) => s.toLowerCase();
  // "重塑火星：动荡" -> "重塑火星", "Root: The Underworld" -> "root"
  const baseOf = (s) => norm(s.split(/[：:（(]| - | – | — /)[0].trim());
  // a is b plus a suffix such as "：动荡", " - 敦威治遗产", ": Colonies" (so "Root" isn't a prefix of "Rootbeer").
  const extends_ = (a, b) => b.length >= 2 && a.length > b.length && a.startsWith(b) && /^[\s：:\-–—（(]/.test(a.slice(b.length));

  // Games with the same or a similar name (same series, same base name, or one name extends the other).
  function similar(games, g) {
    const mine = ["zh", "en"].map((l) => norm(nameOf(g, l)));
    const myBases = mine.map(baseOf).filter((k) => k.length >= 2);
    return games.filter((x) => {
      if (x.id === g.id) return false;
      if (g.series && x.series === g.series) return true;
      const theirs = ["zh", "en"].map((l) => norm(nameOf(x, l)));
      if (theirs.map(baseOf).some((k) => k.length >= 2 && myBases.includes(k))) return true;
      return mine.some((a) => theirs.some((b) => extends_(a, b) || extends_(b, a)));
    });
  }

  // For auto-matching: the game whose full name this game's name extends, e.g. "重塑火星：动荡" -> "重塑火星".
  // The longest match wins ("诡镇奇谈：卡牌版 - 敦威治遗产" -> "诡镇奇谈：卡牌版").
  function suggest(games, g) {
    let best = null, bestLen = 0;
    for (const x of games) {
      if (x.id === g.id) continue;
      for (const l of ["zh", "en"]) {
        const b = norm(nameOf(x, l));
        if (extends_(norm(nameOf(g, l)), b) && b.length > bestLen) {
          best = x;
          bestLen = b.length;
        }
      }
    }
    return best;
  }

  // The game whose rulebook this one uses directly (or null).
  function target(g, info) {
    const v = info[g.id] && info[g.id].rulebookFrom;
    if (v === "") return null;
    return v || g.rulebookFrom || null;
  }

  // The game whose uploaded rulebook should be shown, following a chain (A uses B, B uses C) until one has a file.
  function resolve(games, g, info, books) {
    let id = target(g, info);
    const seen = new Set([g.id]);
    while (id && !seen.has(id)) {
      if (books[id]) return id;
      seen.add(id);
      const x = games.find((y) => y.id === id);
      id = x ? target(x, info) : null;
    }
    return null;
  }

  // <option>s for a "shares rulebook with" dropdown: similar names first, then everything else by name.
  function options(games, g, selected, { none, similarLabel, othersLabel, lang = "zh", esc }) {
    const label = (x) => (lang === "en" ? nameOf(x, "en") : nameOf(x, "zh"));
    const sort = (a, b) => label(a).localeCompare(label(b), lang === "en" ? "en" : "zh-CN");
    const sim = similar(games, g).sort(sort);
    const simIds = new Set(sim.map((x) => x.id));
    const rest = games.filter((x) => x.id !== g.id && !simIds.has(x.id)).sort(sort);
    const opt = (x) => `<option value="${esc(x.id)}"${x.id === selected ? " selected" : ""}>${esc(label(x))}</option>`;
    return (
      `<option value=""${selected ? "" : " selected"}>${esc(none)}</option>` +
      (sim.length ? `<optgroup label="${esc(similarLabel)}">${sim.map(opt).join("")}</optgroup>` : "") +
      `<optgroup label="${esc(othersLabel)}">${rest.map(opt).join("")}</optgroup>`
    );
  }

  return { similar, suggest, target, resolve, options, nameOf };
})();
