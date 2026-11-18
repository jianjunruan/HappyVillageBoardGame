// The 「📤 分享」 button in the page header (index.html, events.html): opens the club's share QR card
// (images/share-qr.png, which opens HV_CONFIG.siteUrl), to show someone, save, forward or copy the link.
// In WeChat, long-pressing the picture saves it or sends it to a friend, so that's the main way; the buttons cover
// other browsers: 分享 (the phone's share sheet, with the picture when the browser allows), 保存图片, 复制链接.
(() => {
  const before = document.getElementById("lang-toggle");
  if (!before || !window.HVI18n) return;
  const URL_ = (window.HV_CONFIG && HV_CONFIG.siteUrl) || location.origin + location.pathname.replace(/[^/]*$/, "");
  const IMG = "images/share-qr.png";
  const STR = {
    zh: {
      btn: "📤 分享",
      title: "分享欢乐小镇桌游",
      alt: "欢乐小镇桌游的二维码，扫码打开网站",
      tip: "让朋友扫这个二维码就能打开网站。在微信里长按图片，可以保存或发送给朋友。",
      share: "📤 分享",
      save: "⬇️ 保存图片",
      copy: "🔗 复制链接",
      copied: "✓ 已复制链接",
      copyFail: "复制失败，请长按选择上面的网址",
      close: "关闭",
      shareText: "欢乐小镇桌游：桌游目录、活动报名、计分板",
    },
    en: {
      btn: "📤 Share",
      title: "Share Happy Village Board Games",
      alt: "QR code for Happy Village Board Games: scan to open the site",
      tip: "Friends can scan this QR code to open the site. In WeChat, press and hold the picture to save it or send it to a friend.",
      share: "📤 Share",
      save: "⬇️ Save picture",
      copy: "🔗 Copy link",
      copied: "✓ Link copied",
      copyFail: "Couldn't copy: press and hold the address above to select it",
      close: "Close",
      shareText: "Happy Village Board Games: games, events and scoreboards",
    },
  };
  const tr = (k) => (STR[HVI18n.lang] || STR.zh)[k];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "admin-btn share-btn";
  before.before(btn);

  const dlg = document.createElement("dialog");
  dlg.className = "share-dlg";
  dlg.setAttribute("aria-labelledby", "share-title");
  document.body.append(dlg);

  function render() {
    btn.textContent = tr("btn");
    dlg.innerHTML = `
      <button class="close" type="button" data-share-close aria-label="${esc(tr("close"))}">✕</button>
      <div class="share-body">
        <h2 id="share-title">${esc(tr("title"))}</h2>
        <img class="share-img" src="${esc(IMG)}" alt="${esc(tr("alt"))}" width="600" height="780">
        <p class="share-tip">${esc(tr("tip"))}</p>
        <p class="share-url">${esc(URL_)}</p>
        <div class="share-acts">
          ${navigator.share ? `<button class="btn" type="button" data-share-native>${esc(tr("share"))}</button>` : ""}
          <a class="btn ghost" href="${esc(IMG)}" download="欢乐小镇桌游-二维码.png">${esc(tr("save"))}</a>
          <button class="btn ghost" type="button" data-share-copy>${esc(tr("copy"))}</button>
        </div>
        <p class="share-msg" role="status"></p>
      </div>`;
  }
  const say = (text) => {
    const m = dlg.querySelector(".share-msg");
    if (m) m.textContent = text;
  };

  async function copyLink() {
    try {
      // Some in-app browsers never answer the clipboard request: give up on it after 1.5 s.
      await Promise.race([navigator.clipboard.writeText(URL_), new Promise((_, no) => setTimeout(no, 1500))]);
      return say(tr("copied"));
    } catch {}
    // older browsers (and some in-app ones): select a hidden text box and copy
    const t = document.createElement("textarea");
    t.value = URL_;
    t.style.cssText = "position:fixed;opacity:0";
    document.body.append(t);
    t.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    t.remove();
    say(tr(ok ? "copied" : "copyFail"));
  }

  async function shareNative() {
    const data = { title: tr("title"), text: tr("shareText"), url: URL_ };
    try {
      // With the picture when the browser can share files; otherwise just the link.
      const blob = await fetch(IMG).then((r) => r.blob());
      const file = new File([blob], "欢乐小镇桌游-二维码.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
    } catch {}
    try {
      await navigator.share(data);
    } catch (err) {
      if (err && err.name === "AbortError") return; // closed the share sheet
      try {
        delete data.files; // some apps refuse a file: try the link alone
        await navigator.share(data);
      } catch {}
    }
  }

  btn.addEventListener("click", () => {
    render();
    dlg.showModal();
  });
  dlg.addEventListener("click", (e) => {
    // not a form: a tap outside the card closes it too
    if (e.target === dlg || e.target.closest("[data-share-close]")) return dlg.close();
    if (e.target.closest("[data-share-copy]")) return void copyLink();
    if (e.target.closest("[data-share-native]")) return void shareNative();
  });
  HVI18n.onChange(() => {
    btn.textContent = tr("btn");
    if (dlg.open) render();
  });
  render();
})();
