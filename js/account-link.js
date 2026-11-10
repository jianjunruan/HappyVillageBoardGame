// The account button in page headers (<a id="account-link">): "登录 / 注册" when signed out, "我的主页" when signed in.
(() => {
  const a = document.getElementById("account-link");
  if (!a || !window.HVLoans) return;
  if (!HVLoans.enabled) return void (a.hidden = true);
  const STR = {
    zh: { signIn: "👤 登录 / 注册", me: "👤 我的主页" },
    en: { signIn: "👤 Sign in", me: "👤 My profile" },
  };
  function render() {
    const s = STR[HVI18n.lang] || STR.zh;
    const signedIn = Boolean(HVLoans.user);
    a.textContent = signedIn ? s.me : s.signIn;
    a.href = signedIn ? "profile.html" : `account.html?next=${encodeURIComponent(location.pathname.split("/").pop() + location.search + location.hash)}`;
  }
  HVI18n.onChange(render);
  window.addEventListener("hv-auth-change", render);
  render();
})();
