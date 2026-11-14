// Picking a player's name in the score pages (score.html, flip7.html): typing a name lists matching players —
// registered players (their account nickname or one of its aliases) first, then names used in past records — and a
// new name can still be typed. A name that belongs to a registered player can't be typed by hand: it has to be picked
// from the list (which also spells it the way the account does), so a player's games stay theirs.
//
//   HVPlayerPicker.field({ value, picked, attrs })  → html for one name box (attrs: extra attributes for the <input>)
//   HVPlayerPicker.wire(root, onChange)             → onChange(input, name, picked) when typed (picked false) or picked
//   HVPlayerPicker.problem(name, picked)            → an error message when the name must be picked, else ""
//   HVPlayerPicker.setPast(names)                   → names from past records, offered after registered players
//   HVPlayerPicker.onReady(fn)                      → fn() once the registered players have loaded
window.HVPlayerPicker = (() => {
  const STR = {
    zh: {
      reg: "已注册",
      past: "玩过",
      newName: "新玩家：「{name}」",
      mustPick: "「{name}」是已注册玩家，请从下面的列表里选择。",
      mustPickSave: "「{name}」是已注册玩家的名字，请在名字框里从列表中选择。",
      alias: "又名 {alias}",
    },
    en: {
      reg: "registered",
      past: "played before",
      newName: "New player: \"{name}\"",
      mustPick: "\"{name}\" is a registered player. Please pick them from the list below.",
      mustPickSave: "\"{name}\" is a registered player's name. Please pick it from the list in the name box.",
      alias: "aka {alias}",
    },
  };
  const tr = (k, vars = {}) => (STR[(window.HVI18n && HVI18n.lang) || "zh"][k] ?? STR.zh[k]).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const key = (n) => String(n || "").trim().toLowerCase();

  let profiles = []; // [{ name, aliases }]
  let past = []; // names from past records
  let ready = false;
  const waiting = [];
  if (window.HVLoans && HVLoans.enabled) {
    HVLoans.allProfiles()
      .then((rows) => (profiles = (rows || []).filter((p) => p && p.name)))
      .catch(() => {})
      .then(() => {
        ready = true;
        waiting.splice(0).forEach((fn) => fn());
      });
  } else ready = true;
  const onReady = (fn) => (ready ? fn() : waiting.push(fn));

  // The registered player a name belongs to (nickname or alias, ignoring case and spaces), or null.
  function registered(name) {
    const k = key(name);
    if (!k) return null;
    return profiles.find((p) => key(p.name) === k) || profiles.find((p) => (p.aliases || []).some((a) => key(a) === k)) || null;
  }
  // Fine to save: empty, picked from the list, or not a registered player's name.
  function problem(name, picked) {
    const p = !picked && registered(name);
    return p ? tr("mustPickSave", { name: String(name).trim() }) : "";
  }
  function setPast(names) {
    past = [...new Map((names || []).filter((n) => key(n)).map((n) => [key(n), String(n).trim()])).values()];
  }

  // Up to 8 matching players: registered first (by nickname, then alias), then past names that aren't registered.
  function matches(q) {
    const k = key(q);
    const out = [];
    const seen = new Set();
    for (const p of profiles) {
      const alias = (p.aliases || []).find((a) => k && key(a).includes(k) && !key(p.name).includes(k));
      if (k && !key(p.name).includes(k) && !alias) continue;
      if (!k) continue; // registered players only once something is typed
      out.push({ name: p.name, reg: true, alias });
      seen.add(key(p.name));
      for (const a of p.aliases || []) seen.add(key(a));
    }
    out.sort((a, b) => (key(a.name) === k ? -1 : 0) - (key(b.name) === k ? -1 : 0) || Boolean(a.alias) - Boolean(b.alias));
    for (const n of past) if (!seen.has(key(n)) && (!k || key(n).includes(k))) out.push({ name: n, reg: false });
    return out.slice(0, 8);
  }

  function field({ value = "", picked = false, attrs = "" } = {}) {
    return `<span class="pp-wrap">
      <input ${attrs} data-pp value="${esc(value)}" data-picked="${picked ? "1" : ""}" maxlength="30" autocomplete="off" autocapitalize="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false">
      <span class="pp-list" role="listbox" hidden></span>
      <span class="pp-warn" role="alert">${esc(warnText(value, picked))}</span>
    </span>`;
  }
  function warnText(value, picked) {
    const p = !picked && registered(value);
    return p ? tr("mustPick", { name: String(value).trim() }) : "";
  }
  function listHtml(input) {
    const q = input.value;
    const items = matches(q);
    const typed = String(q).trim();
    const exact = items.some((it) => key(it.name) === key(typed));
    const rows = items.map(
      (it) => `<button type="button" class="pp-item" role="option" data-pp-name="${esc(it.name)}" data-pp-reg="${it.reg ? "1" : ""}">
        <b>${esc(it.name)}</b>${it.alias ? ` <small>${esc(tr("alias", { alias: it.alias }))}</small>` : ""}
        <span class="pp-tag${it.reg ? " is-reg" : ""}">${esc(tr(it.reg ? "reg" : "past"))}</span></button>`
    );
    // A new name (not registered and not in the list) can be kept as typed.
    if (typed && !exact && !registered(typed)) rows.push(`<span class="pp-new">${esc(tr("newName", { name: typed }))}</span>`);
    return rows.join("");
  }
  function show(input) {
    const wrap = input.closest(".pp-wrap");
    if (!wrap) return;
    const list = wrap.querySelector(".pp-list");
    const html = listHtml(input);
    list.innerHTML = html;
    list.hidden = !html;
    input.setAttribute("aria-expanded", String(Boolean(html)));
    wrap.querySelector(".pp-warn").textContent = warnText(input.value, input.dataset.picked === "1");
  }
  function hide(input) {
    const wrap = input.closest(".pp-wrap");
    if (!wrap) return;
    wrap.querySelector(".pp-list").hidden = true;
    input.setAttribute("aria-expanded", "false");
  }

  function wire(root, onChange) {
    root.addEventListener("input", (e) => {
      const input = e.target.closest && e.target.closest("[data-pp]");
      if (!input) return;
      input.dataset.picked = ""; // typed by hand
      onChange(input, input.value, false);
      show(input);
    });
    root.addEventListener("focusin", (e) => {
      const input = e.target.closest && e.target.closest("[data-pp]");
      if (input) show(input);
    });
    root.addEventListener("focusout", (e) => {
      const input = e.target.closest && e.target.closest("[data-pp]");
      if (!input) return;
      // Let a tap on a list item land first.
      setTimeout(() => {
        const wrap = input.closest(".pp-wrap");
        if (wrap && !wrap.contains(document.activeElement)) hide(input);
      }, 150);
    });
    // pointerdown keeps the focus in the box (no blur before the pick on phones).
    root.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pp-item")) e.preventDefault();
    });
    root.addEventListener("click", (e) => {
      const item = e.target.closest(".pp-item");
      if (!item) return;
      const input = item.closest(".pp-wrap").querySelector("[data-pp]");
      input.value = item.dataset.ppName;
      input.dataset.picked = "1";
      onChange(input, input.value, true);
      hide(input);
      input.closest(".pp-wrap").querySelector(".pp-warn").textContent = "";
    });
    root.addEventListener("keydown", (e) => {
      const input = e.target.closest && e.target.closest("[data-pp]");
      if (input && e.key === "Escape") hide(input);
    });
  }

  return { field, wire, problem, setPast, onReady, registered };
})();
