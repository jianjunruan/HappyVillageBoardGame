// The account buttons in page headers (<a id="account-link">): "登录 / 注册" when signed out; "我的主页" plus a red
// "退出登录" button when signed in (players and admins alike).
(() => {
  const a = document.getElementById("account-link");
  if (!a || !window.HVLoans) return;
  if (!HVLoans.enabled) return void (a.hidden = true);
  const STR = {
    zh: { signIn: "👤 登录 / 注册", me: "👤 我的主页", out: "退出登录" },
    en: { signIn: "👤 Sign in", me: "👤 My profile", out: "Sign out" },
  };
  const out = document.createElement("button");
  out.type = "button";
  out.className = "admin-btn signout";
  out.id = "signout-btn";
  a.after(out);
  out.addEventListener("click", () => {
    HVLoans.signOut();
    window.dispatchEvent(new Event("hv-auth-change"));
    location.reload(); // every part of the page goes back to its signed-out view
  });
  function render() {
    const s = STR[HVI18n.lang] || STR.zh;
    const signedIn = Boolean(HVLoans.user);
    a.textContent = signedIn ? s.me : s.signIn;
    a.href = signedIn ? "profile.html" : `account.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash)}`;
    out.textContent = s.out;
    out.hidden = !signedIn;
  }
  HVI18n.onChange(render);
  window.addEventListener("hv-auth-change", render);
  render();
})();
