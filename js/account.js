// Player accounts: sign in, sign up, forgot password, choose a new password, and the landing page for the links in
// Supabase's emails (they open account.html#access_token=…&type=signup|recovery). Accounts are Supabase Auth users;
// the profile (nickname, bio) is the "profiles" table, edited on profile.html.
// account.html?next=<page> returns to that page after signing in.
(() => {
  const STR = {
    zh: {
      title: "登录 / 注册",
      back: "← 桌游目录",
      toggle: "EN",
      toggleLabel: "Switch to English",
      tabIn: "登录",
      tabUp: "注册新账号",
      email: "邮箱",
      password: "密码",
      password2: "再输入一次密码",
      passwordHint: "至少 6 位。",
      nickname: "昵称",
      nicknameHint: "其他玩家看到的名字；计分板上用这个名字记录的对局会算进你的主页。",
      signIn: "登录",
      signUp: "注册",
      forgot: "忘记密码？",
      forgotTitle: "重设密码",
      forgotHint: "输入注册时用的邮箱，我们会发一封邮件，点里面的链接就能设置新密码。",
      forgotSend: "发送邮件",
      forgotSent: "如果这个邮箱注册过，重设密码的邮件已经发出，请查收（也看看垃圾邮件）。",
      backToSignIn: "← 返回登录",
      newPwTitle: "设置新密码",
      newPwSave: "保存新密码",
      newPwSaved: "✓ 新密码已保存。",
      signedInAs: "已登录：{email}",
      toProfile: "👤 我的主页",
      changePw: "修改密码",
      signOut: "退出登录",
      confirmSent: "确认邮件已发送到 {email}。请点邮件里的链接完成注册（也看看垃圾邮件）。",
      working: "请稍候……",
      needEmail: "请填写邮箱。",
      needPassword: "请填写密码。",
      shortPassword: "密码至少 6 位。",
      mismatch: "两次输入的密码不一样。",
      needNickname: "请填写昵称。",
      linkFailed: "邮件链接无效或已过期，请重新操作。（{msg}）",
      errCreds: "邮箱或密码不对。",
      errExists: "这个邮箱已经注册过了，请直接登录（忘记密码可以重设）。",
      errNotConfirmed: "这个邮箱还没有确认，请先点确认邮件里的链接。",
      errRate: "操作太频繁了，请过一会儿再试。",
      errClosed: "暂时不开放注册，请联系管理员。",
      errWeak: "密码太简单了，换一个更长的密码。",
      errName: "这个昵称已经被别的账号用了，换一个吧（可以稍后在主页修改）。",
      errOffline: "网络连接失败，请检查网络后再试。",
      noBackend: "账号功能还没有启用（需要设置 Supabase）。",
      failed: "出错了：{msg}",
    },
    en: {
      title: "Sign in",
      back: "← Games",
      toggle: "中文",
      toggleLabel: "切换到中文",
      tabIn: "Sign in",
      tabUp: "Create account",
      email: "Email",
      password: "Password",
      password2: "Password again",
      passwordHint: "At least 6 characters.",
      nickname: "Nickname",
      nicknameHint: "The name other players see. Games recorded under this name on the scoreboards count on your profile.",
      signIn: "Sign in",
      signUp: "Create account",
      forgot: "Forgot password?",
      forgotTitle: "Reset password",
      forgotHint: "Enter the email you signed up with. We'll send a link to choose a new password.",
      forgotSend: "Send email",
      forgotSent: "If this email has an account, the reset email is on its way. Check your inbox (and spam).",
      backToSignIn: "← Back to sign in",
      newPwTitle: "Choose a new password",
      newPwSave: "Save new password",
      newPwSaved: "✓ New password saved.",
      signedInAs: "Signed in as {email}",
      toProfile: "👤 My profile",
      changePw: "Change password",
      signOut: "Sign out",
      confirmSent: "A confirmation email was sent to {email}. Click the link in it to finish signing up (check spam too).",
      working: "Please wait…",
      needEmail: "Please enter your email.",
      needPassword: "Please enter a password.",
      shortPassword: "The password needs at least 6 characters.",
      mismatch: "The two passwords don't match.",
      needNickname: "Please enter a nickname.",
      linkFailed: "This email link is invalid or has expired. Please try again. ({msg})",
      errCreds: "Wrong email or password.",
      errExists: "This email already has an account. Please sign in (or reset your password).",
      errNotConfirmed: "This email isn't confirmed yet. Click the link in the confirmation email first.",
      errRate: "Too many tries. Please wait a little and try again.",
      errClosed: "Sign-ups are closed for now. Please contact an admin.",
      errWeak: "That password is too weak. Try a longer one.",
      errName: "Another account already uses this nickname. Pick another (you can change it later on your profile).",
      errOffline: "Couldn't connect. Check your connection and try again.",
      noBackend: "Accounts aren't switched on yet (Supabase isn't set up).",
      failed: "Something went wrong: {msg}",
    },
  };
  const tr = (k, vars = {}) => (STR[HVI18n.lang][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const main = $("ac-main");
  const PENDING = "hv-pending-name"; // nickname typed at sign-up, used once the email is confirmed

  // Where to go after signing in: ?next=<page on this site>, else the profile.
  const next = (() => {
    const n = new URLSearchParams(location.search).get("next") || "";
    return /^[\w.-]+\.html([?#].*)?$/.test(n) && !/^account\.html/.test(n) ? n : "profile.html";
  })();
  const linkBack = () => new URL("account.html", location.href).href;

  function errText(err) {
    const m = String((err && err.message) || "").toLowerCase();
    if (err instanceof TypeError) return tr("errOffline");
    if (err && err.code === "HVP02") return tr("errName");
    if (m.includes("invalid login credentials")) return tr("errCreds");
    if (m.includes("already registered") || m.includes("already exists")) return tr("errExists");
    if (m.includes("not confirmed")) return tr("errNotConfirmed");
    if (m.includes("rate limit") || err.status === 429) return tr("errRate");
    if (m.includes("signups not allowed") || m.includes("signup is disabled")) return tr("errClosed");
    if (m.includes("weak") || m.includes("at least")) return tr("errWeak");
    return tr("failed", { msg: err.message });
  }

  // view: "in" | "up" | "forgot" | "newpw" | "done"
  let view = "in";
  let busy = false;
  let msg = null; // { text, ok }
  let typed = {}; // what was typed, kept across redraws

  function field(name, label, type, extra = "") {
    return `<label class="ac-field"><span>${esc(tr(label))}</span><input name="${name}" type="${type}" value="${esc(typed[name] || "")}" ${extra}></label>`;
  }
  const msgLine = () => (msg ? `<p class="ac-msg ${msg.ok ? "is-ok" : "is-err"}" role="alert">${esc(msg.text)}</p>` : "");
  const submitBtn = (label) => `<button class="btn ac-wide" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("working") : tr(label))}</button>`;

  function render() {
    document.documentElement.lang = HVI18n.lang === "zh" ? "zh-CN" : "en";
    document.title = `${tr("title")} · ${HVI18n.t("siteName")}`;
    $("ac-title").textContent = tr("title");
    $("ac-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    if (!HVLoans.enabled) return void (main.innerHTML = `<p class="ac-msg is-err">${esc(tr("noBackend"))}</p>`);
    if (view === "newpw") {
      main.innerHTML = `<section class="ac-card"><h2>${esc(tr("newPwTitle"))}</h2>
        <form class="ac-form" data-form="newpw" novalidate>
          ${field("password", "password", "password", 'autocomplete="new-password" minlength="6" autofocus')}
          <small class="ac-hint">${esc(tr("passwordHint"))}</small>
          ${field("password2", "password2", "password", 'autocomplete="new-password"')}
          ${msgLine()}${submitBtn("newPwSave")}
        </form></section>`;
      return;
    }
    if (HVLoans.user && view !== "forgot") {
      main.innerHTML = `<section class="ac-card">
        <p class="ac-who">${esc(tr("signedInAs", { email: HVLoans.user }))}</p>
        ${msgLine()}
        <div class="ac-actions">
          <a class="btn" href="${esc(next)}">${esc(next === "profile.html" ? tr("toProfile") : "→ " + next.replace(/\.html.*/, ""))}</a>
          <button class="btn ghost" type="button" data-go="newpw">${esc(tr("changePw"))}</button>
          <button class="btn ghost" type="button" data-signout>${esc(tr("signOut"))}</button>
        </div></section>`;
      return;
    }
    if (view === "forgot") {
      main.innerHTML = `<section class="ac-card"><h2>${esc(tr("forgotTitle"))}</h2>
        <p class="ac-hint">${esc(tr("forgotHint"))}</p>
        <form class="ac-form" data-form="forgot" novalidate>
          ${field("email", "email", "email", 'autocomplete="email" autofocus')}
          ${msgLine()}${submitBtn("forgotSend")}
        </form>
        <p><button class="link-btn" type="button" data-go="in">${esc(tr("backToSignIn"))}</button></p></section>`;
      return;
    }
    if (view === "done") {
      main.innerHTML = `<section class="ac-card">${msgLine()}<p><button class="link-btn" type="button" data-go="in">${esc(tr("backToSignIn"))}</button></p></section>`;
      return;
    }
    const up = view === "up";
    main.innerHTML = `<section class="ac-card">
      <div class="ac-tabs" role="tablist">
        <button type="button" role="tab" class="chip${up ? "" : " is-on"}" aria-selected="${!up}" data-go="in">${esc(tr("tabIn"))}</button>
        <button type="button" role="tab" class="chip${up ? " is-on" : ""}" aria-selected="${up}" data-go="up">${esc(tr("tabUp"))}</button>
      </div>
      <form class="ac-form" data-form="${up ? "up" : "in"}" novalidate>
        ${up ? field("nickname", "nickname", "text", 'maxlength="30" autocomplete="nickname" autofocus') + `<small class="ac-hint">${esc(tr("nicknameHint"))}</small>` : ""}
        ${field("email", "email", "email", `autocomplete="email"${up ? "" : " autofocus"}`)}
        ${field("password", "password", "password", `autocomplete="${up ? "new-password" : "current-password"}"`)}
        ${up ? `<small class="ac-hint">${esc(tr("passwordHint"))}</small>` + field("password2", "password2", "password", 'autocomplete="new-password"') : ""}
        ${msgLine()}${submitBtn(up ? "signUp" : "signIn")}
      </form>
      ${up ? "" : `<p class="ac-forgot"><button class="link-btn" type="button" data-go="forgot">${esc(tr("forgot"))}</button></p>`}
    </section>`;
  }

  function readTyped() {
    const f = main.querySelector("form");
    if (!f) return;
    for (const el of f.elements) if (el.name && el.type !== "password") typed[el.name] = el.value;
  }
  function go(v) {
    readTyped();
    view = v;
    msg = null;
    render();
  }

  // Makes the profile with the nickname typed at sign-up, if there isn't one yet. Errors are left for profile.html.
  async function ensureProfile(nickname) {
    const id = HVLoans.userId;
    if (!id || !nickname) return;
    try {
      if (!(await HVLoans.profile(id))) await HVLoans.saveProfile({ name: nickname, aliases: [], bio: "" }, false);
      localStorage.removeItem(PENDING);
    } catch {}
  }

  async function run(fn) {
    if (busy) return;
    busy = true;
    msg = null;
    render();
    try {
      await fn();
    } catch (err) {
      msg = { text: errText(err), ok: false };
    }
    busy = false;
    render();
  }

  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.go) return go(b.dataset.go);
    if (b.hasAttribute("data-signout")) {
      HVLoans.signOut();
      view = "in";
      msg = null;
      render();
    }
  });
  main.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    readTyped();
    const v = (n) => (f.elements[n] ? f.elements[n].value : "");
    const email = v("email").trim();
    const pw = v("password");
    const form = f.dataset.form;
    const bad = (k) => {
      msg = { text: tr(k), ok: false };
      render();
    };
    if (form === "in") {
      if (!email) return bad("needEmail");
      if (!pw) return bad("needPassword");
      return void run(async () => {
        await HVLoans.signIn(email, pw);
        await ensureProfile(localStorage.getItem(PENDING));
        location.href = next;
      });
    }
    if (form === "up") {
      const nickname = v("nickname").trim();
      if (!nickname) return bad("needNickname");
      if (!email) return bad("needEmail");
      if (pw.length < 6) return bad("shortPassword");
      if (pw !== v("password2")) return bad("mismatch");
      return void run(async () => {
        localStorage.setItem(PENDING, nickname.slice(0, 30));
        const r = await HVLoans.signUp(email, pw, linkBack());
        if (r.signedIn) {
          await ensureProfile(nickname);
          location.href = next;
          return;
        }
        view = "done";
        msg = { text: tr("confirmSent", { email }), ok: true };
      });
    }
    if (form === "forgot") {
      if (!email) return bad("needEmail");
      return void run(async () => {
        await HVLoans.sendPasswordReset(email, linkBack());
        view = "done";
        msg = { text: tr("forgotSent"), ok: true };
      });
    }
    if (form === "newpw") {
      if (pw.length < 6) return bad("shortPassword");
      if (pw !== v("password2")) return bad("mismatch");
      return void run(async () => {
        await HVLoans.changePassword(pw);
        view = "in"; // shows the signed-in card
        msg = { text: tr("newPwSaved"), ok: true };
      });
    }
  });

  $("lang-toggle").addEventListener("click", () => {
    readTyped();
    HVI18n.toggle();
  });
  HVI18n.onChange(render);

  // Arriving from an email link: sign in from it, then choose a new password or go on.
  if (HVLoans.enabled && /access_token=|error_description=/.test(location.hash)) {
    const hash = location.hash;
    history.replaceState(null, "", location.pathname + location.search); // keep the token out of the address bar
    HVLoans.signInFromLink(hash).then(
      async (type) => {
        if (type === "recovery") {
          view = "newpw";
          return render();
        }
        await ensureProfile(localStorage.getItem(PENDING));
        location.href = next;
      },
      (err) => {
        view = "done";
        msg = { text: tr("linkFailed", { msg: err.message }), ok: false };
        render();
      }
    );
    main.innerHTML = `<p class="ac-msg">${esc(tr("working"))}</p>`;
  } else render();
})();
