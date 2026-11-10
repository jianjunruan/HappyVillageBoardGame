// Events and sign-ups. events.html lists the events (soonest first, past ones folded away underneath);
// events.html?id=<id> shows one event, where anyone can join a table or open a new one for a game, picked from
// the catalogue or typed in. Admins publish, edit and delete events and can tidy up tables.
// Data: Supabase tables events, event_tables, event_players (supabase/schema.sql), through HVLoans.
//
// Visitors have no accounts. Each browser keeps a random secret (localStorage "hv-event-token") that goes with
// every sign-up, and the ids of its own sign-ups ("hv-event-mine"), so it can show "me" and leave a table again.
(() => {
  const STR = {
    zh: {
      title: "活动报名",
      back: "← 桌游目录",
      allEvents: "← 全部活动",
      toggle: "EN",
      toggleLabel: "Switch to English",
      loading: "正在加载……",
      loadFailed: "无法加载活动：{msg}",
      retry: "重试",
      noBackend: "活动报名还没有启用（需要设置 Supabase）。",
      notFound: "找不到这个活动，可能已经被删除了。",
      upcoming: "即将举行",
      noUpcoming: "暂时没有即将举行的活动，过几天再来看看吧。",
      past: "往期活动（{n}）",
      today: "今天",
      tomorrow: "明天",
      inDays: "{n} 天后",
      over: "已结束",
      tables: "{n} 桌",
      people: "{n} 人报名",
      noTables: "还没有人开桌",
      newEvent: "＋ 发布活动",
      editEvent: "编辑活动",
      deleteEvent: "删除活动",
      deleteEventConfirm: "删除「{title}」？这个活动里的桌和报名也会一起删除，不能恢复。",
      evTitle: "活动名称",
      evTitlePh: "例如：周六桌游夜",
      evDate: "日期",
      evTime: "开始时间（可不填）",
      evEnd: "结束时间（可不填）",
      evPlace: "活动地点（可不填）",
      evPlacePh: "例如：欢乐小镇活动室，XX 路 123 号",
      evMap: "地图链接（可不填）",
      evMapPh: "粘贴 Google 地图的分享链接",
      evMapHint: "不填的话，点活动地点会在 Google 地图里搜索这个地址。",
      badMap: "地图链接要以 https:// 开头，例如 https://maps.app.goo.gl/…",
      needStart: "填了结束时间，也请填开始时间。",
      openMap: "在 Google 地图打开",
      mapShort: "地图",
      evDesc: "简介说明（可不填）",
      evDescPh: "时间安排、注意事项……（可以用上面的按键改字体、字号、颜色）",
      descTooLong: "简介太长了，请删减一些（或少用一些格式）。",
      evSave: "💾 发布",
      evSaveEdit: "💾 保存修改",
      needTitle: "请填写活动名称。",
      needDate: "请选择日期。",
      openTables: "已开的桌（{n}）",
      openNew: "🎲 开新桌",
      openFirst: "还没有人开桌。选一款桌游，开第一桌吧！",
      overNote: "这个活动已经结束，不能再报名。",
      onSite: "📍 在现场",
      notOnSite: "🚚 不在现场",
      notOnSiteHint: "需要有人带来",
      custom: "✏️ 手动填写",
      seats: "{n} / {max} 人",
      seatsOpen: "{n} 人（不限人数）",
      full: "已满",
      join: "加入",
      leave: "退出",
      me: "我",
      leaveConfirm: "退出「{game}」这一桌？",
      leaveGone: "没能退出：这个报名已经不在了（可能被管理员移除，或是在别的设备上报名的）。",
      removePlayer: "移除 {name}",
      removeConfirm: "把 {name} 从这一桌移除？",
      deleteTable: "删除这桌",
      deleteTableConfirm: "删除「{game}」这一桌？桌上的报名也会一起删除。",
      markOnSite: "标为在现场",
      markNotOnSite: "标为不在现场",
      host: "开桌",
      startsAt: "🕒 {t} 开",
      tableTime: "几点开（可不填）",
      deleteOwn: "删除这桌",
      deleteOwnConfirm: "删除你开的「{game}」这一桌？",
      cantDelete: "桌上还有其他玩家，不能删除。想离开的话可以点「退出」，把开桌人交给别人。",
      notHost: "只有这一桌的开桌人或管理员可以这样做（开桌人可能已经换人了）。",
      tableDeleted: "✓ 已删除这一桌",
      editTime: "修改时间",
      timeTitle: "「{game}」几点开",
      timeHint: "清空表示不定时间。",
      timeSave: "💾 保存时间",
      timeSaved: "✓ 时间已更新",
      leaveTitle: "退出「{game}」这一桌",
      changeHost: "更换开桌人",
      hostTitle: "「{game}」的开桌人",
      hostWho: "选一位桌上的玩家当开桌人：",
      hostNow: "（现在的开桌人）",
      hostSave: "💾 确认更换",
      hostSaved: "✓ 已更换开桌人为「{name}」",
      hostGone: "没能更换：这位玩家已经不在这一桌了。",
      leaveWho: "你是开桌人，退出后谁来接手？",
      leaveDefault: "不指定：按加入顺序，由「{name}」接手",
      leaveSubmit: "确认退出",
      leaving: "正在退出…",
      // dialogs
      close: "关闭",
      cancel: "取消",
      pickGame: "选一款桌游",
      search: "搜索桌游名称",
      customLabel: "库里没有？手动填写",
      customPh: "输入桌游名称",
      customUse: "使用",
      noResults: "没有找到。可以在上面手动填写。",
      inVenue: "在场 {n} 套",
      notInVenue: "不在场",
      players: "{p} 人",
      change: "更换",
      whereGame: "桌游在现场吗？",
      whereOn: "📍 在现场",
      whereOff: "🚚 不在现场（有人带来）",
      whereHint: "根据库存自动选好了，有人自己带来可以改。",
      maxPlayers: "人数上限",
      maxPh: "不限",
      note: "备注（可不填）",
      notePh: "例如：新手教学、下午 3 点开始",
      yourName: "你的名字",
      namePh: "其他人会看到这个名字",
      needName: "请填写你的名字。",
      badMax: "人数上限请填 1–30 的整数，或留空表示不限。",
      openSubmit: "🎲 开桌并加入",
      joinTitle: "加入「{game}」",
      joinSubmit: "✓ 加入这一桌",
      saving: "正在保存……",
      // errors
      errOver: "这个活动已经结束或不存在了。",
      errFull: "这一桌已经满了。",
      errJoined: "你的账号已经在这一桌了。",
      errName: "这一桌已经有同名的人了，换个写法吧（比如加上姓氏）。",
      errBusy: "刚才报名的人太多了，请一分钟后再试。",
      errTooManyTables: "这个活动的桌数已经到上限了。",
      errAdmin: "需要管理员登录才能操作。",
      errOffline: "网络连接失败，请检查网络后再试。",
      failed: "操作失败：{msg}",
      // admin sign-in
      adminLogin: "管理员登录",
      email: "邮箱",
      password: "密码",
      signIn: "登录",
      notAdmin: "这个账号不是管理员。",
      signInError: "登录失败：{msg}",
      // organizers (负责人)
      staffBtn: "👥 负责人",
      staffTitle: "负责人",
      staffHint: "这个名单只有管理员能看到。被安排到活动里的负责人，联系方式会显示在活动页上；活动结束后自动隐藏。",
      staffEmpty: "还没有负责人。先添加一位，发布活动时就能选择。",
      staffAdd: "＋ 添加负责人",
      staffEdit: "编辑负责人",
      staffNew: "添加负责人",
      edit: "编辑",
      delete: "删除",
      staffDeleteConfirm: "删除负责人「{name}」？已安排的活动里也会取消这位负责人。",
      staffName: "名字",
      staffPhone: "电话",
      staffWechat: "微信号",
      staffXhs: "小红书号（可不填）",
      staffWechatQr: "微信二维码（可不填）",
      staffXhsQr: "小红书二维码（可不填）",
      qrPick: "📷 选择图片",
      qrChange: "📷 更换图片",
      qrRemove: "移除",
      qrNone: "未上传",
      qrNotImage: "请选择图片文件（PNG、JPG）。",
      needStaffName: "请填写负责人的名字。",
      needPhone: "请填写电话。",
      needWechat: "请填写微信号。",
      staffSave: "💾 保存",
      adminOnly: "负责人名单只有管理员可以查看，请先登录。",
      backToEvents: "← 返回活动",
      staffN: "负责人{n}",
      leadField: "当日负责人",
      leadHint: "负责人1 必选；选好一位后会出现下一位，按顺序显示在活动页上。",
      slotPick: "选择负责人",
      slotNone: "（不选）",
      needLead: "请选择负责人1。",
      noStaffYet: "还没有负责人，请先在「👥 负责人」里添加。",
      manageStaff: "管理负责人名单",
      contacts: "当日负责人",
      contactsHint: "有问题可以联系负责人。",
      phone: "电话",
      wechat: "微信",
      xhs: "小红书",
      copy: "复制",
      copied: "已复制 ✓",
      wechatQr: "微信二维码",
      xhsQr: "小红书二维码",
      qrOf: "{name} 的{kind}",
      qrTap: "手机上长按图片可以识别二维码。",
      // templates
      tplImport: "📋 从模板导入",
      tplPick: "选择模板……",
      tplNone: "还没有模板。填好活动名称、简介、时间和地点后，可以点下面的「存为模板」。",
      tplReplace: "用模板「{name}」替换当前填写的活动名称、简介、时间和地点？",
      tplSave: "💾 把名称、简介、时间和地点存为模板",
      tplSaved: "✓ 已存为模板「{name}」",
      tplOverwrite: "已经有叫「{name}」的模板了，用现在的简介替换它？",
      tplDelete: "删除这个模板",
      tplDeleteConfirm: "删除模板「{name}」？",
      tplDeleted: "✓ 已删除模板「{name}」",
      tplLoadFailed: "模板加载失败：{msg}",
    },
    en: {
      title: "Events",
      back: "← Games",
      allEvents: "← All events",
      toggle: "中文",
      toggleLabel: "切换到中文",
      loading: "Loading…",
      loadFailed: "Couldn't load events: {msg}",
      retry: "Retry",
      noBackend: "Event sign-ups aren't switched on yet (Supabase isn't set up).",
      notFound: "This event wasn't found. It may have been deleted.",
      upcoming: "Coming up",
      noUpcoming: "No events coming up yet. Check back in a few days.",
      past: "Past events ({n})",
      today: "Today",
      tomorrow: "Tomorrow",
      inDays: "In {n} days",
      over: "Over",
      tables: "{n} tables",
      people: "{n} signed up",
      noTables: "No tables yet",
      newEvent: "+ New event",
      editEvent: "Edit event",
      deleteEvent: "Delete event",
      deleteEventConfirm: "Delete \"{title}\"? Its tables and sign-ups are deleted too. This can't be undone.",
      evTitle: "Event name",
      evTitlePh: "e.g. Saturday game night",
      evDate: "Date",
      evTime: "Start time (optional)",
      evEnd: "End time (optional)",
      evPlace: "Place (optional)",
      evPlacePh: "e.g. Happy Village club room, 123 Main St",
      evMap: "Map link (optional)",
      evMapPh: "Paste a Google Maps share link",
      evMapHint: "Without a link, tapping the place searches for it on Google Maps.",
      badMap: "The map link must start with https://, e.g. https://maps.app.goo.gl/…",
      needStart: "Please add a start time too, since there's an end time.",
      openMap: "Open in Google Maps",
      mapShort: "Map",
      evDesc: "Description (optional)",
      evDescPh: "Schedule, things to know… (use the buttons above for font, size and colour)",
      descTooLong: "The description is too long. Please shorten it (or use less formatting).",
      evSave: "💾 Publish",
      evSaveEdit: "💾 Save changes",
      needTitle: "Please enter the event name.",
      needDate: "Please pick a date.",
      openTables: "Tables ({n})",
      openNew: "🎲 Open a table",
      openFirst: "Nobody has opened a table yet. Pick a game and open the first one!",
      overNote: "This event is over, so sign-ups are closed.",
      onSite: "📍 At the venue",
      notOnSite: "🚚 Not at the venue",
      notOnSiteHint: "someone needs to bring it",
      custom: "✏️ Typed in",
      seats: "{n} / {max} players",
      seatsOpen: "{n} players (no limit)",
      full: "Full",
      join: "Join",
      leave: "Leave",
      me: "me",
      leaveConfirm: "Leave the {game} table?",
      leaveGone: "Couldn't leave: this sign-up is gone (an admin may have removed it, or it was made on another device).",
      removePlayer: "Remove {name}",
      removeConfirm: "Remove {name} from this table?",
      deleteTable: "Delete table",
      deleteTableConfirm: "Delete the {game} table? Its sign-ups are deleted too.",
      markOnSite: "Mark at the venue",
      markNotOnSite: "Mark not at the venue",
      host: "host",
      startsAt: "🕒 Starts {t}",
      tableTime: "Start time (optional)",
      deleteOwn: "Delete table",
      deleteOwnConfirm: "Delete your {game} table?",
      cantDelete: "Other players are at this table, so it can't be deleted. To go, use \"Leave\" and hand the table to someone else.",
      notHost: "Only this table's host or an admin can do that (the host may have changed).",
      tableDeleted: "✓ Table deleted",
      editTime: "Change time",
      timeTitle: "When does {game} start?",
      timeHint: "Leave it empty for no set time.",
      timeSave: "💾 Save time",
      timeSaved: "✓ Time updated",
      leaveTitle: "Leave the {game} table",
      changeHost: "Change host",
      hostTitle: "Host of {game}",
      hostWho: "Pick a player at this table to be the host:",
      hostNow: "(current host)",
      hostSave: "💾 Change host",
      hostSaved: "✓ {name} is now the host",
      hostGone: "Couldn't change: that player is no longer at this table.",
      leaveWho: "You're the host. Who takes over after you leave?",
      leaveDefault: "No preference: next to join, {name}",
      leaveSubmit: "Leave",
      leaving: "Leaving…",
      close: "Close",
      cancel: "Cancel",
      pickGame: "Pick a game",
      search: "Search games",
      customLabel: "Not in the library? Type it in",
      customPh: "Game name",
      customUse: "Use",
      noResults: "Nothing found. You can type the name in above.",
      inVenue: "{n} at the venue",
      notInVenue: "Not at the venue",
      players: "{p} players",
      change: "Change",
      whereGame: "Is the game at the venue?",
      whereOn: "📍 At the venue",
      whereOff: "🚚 Not at the venue (someone brings it)",
      whereHint: "Picked from the inventory. Change it if someone brings their own copy.",
      maxPlayers: "Max players",
      maxPh: "No limit",
      note: "Note (optional)",
      notePh: "e.g. teaching game, starts at 3 pm",
      yourName: "Your name",
      namePh: "Others will see this name",
      needName: "Please enter your name.",
      badMax: "Max players must be a whole number from 1 to 30, or empty for no limit.",
      openSubmit: "🎲 Open and join",
      joinTitle: "Join {game}",
      joinSubmit: "✓ Join this table",
      saving: "Saving…",
      errOver: "This event is over or no longer exists.",
      errFull: "This table is full.",
      errJoined: "Your account has already joined this table.",
      errName: "Someone with this name already joined this table. Try another spelling (e.g. add your surname).",
      errBusy: "Lots of sign-ups just now. Please try again in a minute.",
      errTooManyTables: "This event already has the most tables allowed.",
      errAdmin: "Only a signed-in admin can do this.",
      errOffline: "Couldn't connect. Check your connection and try again.",
      failed: "Something went wrong: {msg}",
      adminLogin: "Admin sign-in",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      notAdmin: "This account isn't an admin.",
      signInError: "Sign-in failed: {msg}",
      staffBtn: "👥 Organizers",
      staffTitle: "Organizers",
      staffHint: "Only admins can see this list. When an organizer is assigned to an event, their contact details show on that event's page, and are hidden again after the event.",
      staffEmpty: "No organizers yet. Add one, then pick them when publishing an event.",
      staffAdd: "+ Add organizer",
      staffEdit: "Edit organizer",
      staffNew: "Add organizer",
      edit: "Edit",
      delete: "Delete",
      staffDeleteConfirm: "Delete organizer \"{name}\"? They are also taken off the events they were assigned to.",
      staffName: "Name",
      staffPhone: "Phone",
      staffWechat: "WeChat ID",
      staffXhs: "Xiaohongshu ID (optional)",
      staffWechatQr: "WeChat QR code (optional)",
      staffXhsQr: "Xiaohongshu QR code (optional)",
      qrPick: "📷 Choose picture",
      qrChange: "📷 Change picture",
      qrRemove: "Remove",
      qrNone: "None",
      qrNotImage: "Please choose a picture (PNG or JPG).",
      needStaffName: "Please enter the organizer's name.",
      needPhone: "Please enter a phone number.",
      needWechat: "Please enter a WeChat ID.",
      staffSave: "💾 Save",
      adminOnly: "Only admins can see the organizers. Please sign in.",
      backToEvents: "← Back to events",
      staffN: "Organizer {n}",
      leadField: "Organizers on the day",
      leadHint: "Organizer 1 is required. Pick one and the next appears; they show on the event page in this order.",
      slotPick: "Choose an organizer",
      slotNone: "(none)",
      needLead: "Please choose Organizer 1.",
      noStaffYet: "No organizers yet. Add them under \"👥 Organizers\" first.",
      manageStaff: "Manage organizers",
      contacts: "Organizers on the day",
      contactsHint: "Questions? Contact the organizers.",
      phone: "Phone",
      wechat: "WeChat",
      xhs: "Xiaohongshu",
      copy: "Copy",
      copied: "Copied ✓",
      wechatQr: "WeChat QR code",
      xhsQr: "Xiaohongshu QR code",
      qrOf: "{name}'s {kind}",
      qrTap: "On a phone, press and hold the picture to scan the QR code.",
      tplImport: "📋 Use a template",
      tplPick: "Choose a template…",
      tplNone: "No templates yet. Fill in the name, description, times and place, then use \"Save as template\" below.",
      tplReplace: "Replace the name, description, times and place you've filled in with the template \"{name}\"?",
      tplSave: "💾 Save name, description, times and place as a template",
      tplSaved: "✓ Saved as template \"{name}\"",
      tplOverwrite: "A template called \"{name}\" already exists. Replace it with this description?",
      tplDelete: "Delete this template",
      tplDeleteConfirm: "Delete the template \"{name}\"?",
      tplDeleted: "✓ Deleted the template \"{name}\"",
      tplLoadFailed: "Couldn't load templates: {msg}",
    },
  };
  const lang = () => HVI18n.lang;
  const tr = (k, vars = {}) => (STR[lang()][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? "");
  const L = (v) => HVI18n.loc(v);
  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const main = $("ev-main");
  const dlg = $("ev-dlg");

  const EVENT_ID = (() => {
    const v = new URLSearchParams(location.search).get("id");
    return v && /^\d+$/.test(v) ? Number(v) : null;
  })();
  // events.html?staff: the organizers list (admins only)
  const STAFF_VIEW = EVENT_ID == null && new URLSearchParams(location.search).has("staff");

  // ---------- this browser's sign-ups ----------
  const store = {
    get(k, fallback) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    },
  };
  function token() {
    let tk = store.get("hv-event-token", "");
    if (typeof tk !== "string" || tk.length < 16) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      tk = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      store.set("hv-event-token", tk);
    }
    return tk;
  }
  let mine = new Set(store.get("hv-event-mine", []));
  const saveMine = () => store.set("hv-event-mine", [...mine].slice(-300));
  let profileName = ""; // a signed-in player's nickname
  const myName = () => store.get("hv-event-name", "") || profileName;

  // ---------- dates ----------
  const pad = (n) => String(n).padStart(2, "0");
  const todayYmd = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const parseYmd = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const daysAway = (s) => Math.round((parseYmd(s) - parseYmd(todayYmd())) / 864e5);
  const isOver = (ev) => daysAway(ev.event_date) < 0;
  function fmtDate(s, withYear) {
    const d = parseYmd(s);
    const opts = { month: lang() === "zh" ? "long" : "short", day: "numeric", weekday: "short" };
    if (withYear || d.getFullYear() !== new Date().getFullYear()) opts.year = "numeric";
    return new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-GB", opts).format(d);
  }
  const fmtTime = (t) => (t ? t.slice(0, 5) : "");
  // "14:00–18:00", "14:00", or "" (an end earlier than the start just means past midnight).
  const timeRange = (e) => (e.start_time ? fmtTime(e.start_time) + (e.end_time ? "–" + fmtTime(e.end_time) : "") : "");
  // The event's own map link, or a Google Maps search for its place; "" when it has neither.
  const mapLink = (e) =>
    e.map_url || (e.location ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.location) : "");
  // Map links typed without https:// (e.g. "maps.app.goo.gl/…") get it added; http:// becomes https://.
  const cleanMapUrl = (u) => {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^http:\/\//i.test(u)) return "https://" + u.slice(7);
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u) && /^[^\s/]+\.[^\s]+$/.test(u)) return "https://" + u;
    return u;
  };
  function relDay(s) {
    const n = daysAway(s);
    if (n < 0) return { text: tr("over"), cls: "is-over" };
    if (n === 0) return { text: tr("today"), cls: "is-today" };
    if (n === 1) return { text: tr("tomorrow"), cls: "is-soon" };
    return { text: tr("inDays", { n }), cls: n <= 7 ? "is-soon" : "" };
  }

  // ---------- catalogue (for picking a game) and which games are at the venue ----------
  let catalog = []; // games from data/games.json
  let venue = {}; // game id -> sets at the venue now (present minus on loan); missing = 1
  let gone = new Set(); // games the club no longer has (0 sets)
  const gameById = (id) => catalog.find((g) => g.id === id);
  const gameLabel = (g) => (typeof g.name === "string" ? g.name : L(g.name));
  const tableName = (t) => {
    const g = t.game_id && gameById(t.game_id);
    return g ? gameLabel(g) : t.game_name;
  };
  const atVenue = (id) => (id in venue ? venue[id] : 1);
  const maxFromPlayers = (p) => {
    const nums = String(p || "").match(/\d+/g);
    const n = nums ? Number(nums[nums.length - 1]) : NaN;
    return n >= 1 && n <= 30 ? n : null;
  };
  async function loadCatalog() {
    const [data, info, loans] = await Promise.all([
      fetch("data/games.json", { cache: "no-cache" }).then((r) => r.json()).catch(() => null),
      HVLoans.gameInfo().catch(() => ({})),
      HVLoans.active().catch(() => ({})),
    ]);
    catalog = (data && data.games) || [];
    venue = {};
    gone = new Set();
    for (const [id, s] of Object.entries(info)) {
      if (s.present + s.storage + s.withOwner === 0) gone.add(id);
      venue[id] = s.present;
    }
    for (const g of catalog) {
      const out = (loans[g.id] || []).reduce((n, r) => n + (r.quantity || 1), 0);
      if (out) venue[g.id] = Math.max(0, atVenue(g.id) - out);
    }
  }

  // ---------- errors ----------
  function errText(err) {
    const code = err && err.code;
    if (code === "leave-gone") return tr("leaveGone");
    if (code === "host-gone") return tr("hostGone");
    if (code === "not-host") return tr("notHost");
    if (code === "HVE06") return tr("needLead");
    if (code === "HVE07") return tr("errJoined");
    if (code === "HVE08") return tr("cantDelete");
    if (code === "qr-not-image") return tr("qrNotImage");
    if (code === "HVE01") return tr("errOver");
    if (code === "HVE02") return tr("errFull");
    if (code === "HVE03" || code === "23505") return tr("errName");
    if (code === "HVE04") return tr("errBusy");
    if (code === "HVE05") return tr("errTooManyTables");
    if (code === "42501" || err.status === 401 || err.status === 403) return tr("errAdmin");
    if (err instanceof TypeError) return tr("errOffline");
    return tr("failed", { msg: err.message });
  }

  // ---------- state ----------
  let events = null; // list view
  let ev = null; // detail view
  let loadErr = null;
  let loaded = false; // the first load finished
  let isAdmin = false;
  let adminChecked = !HVLoans.user; // nothing to check when nobody is signed in
  let staffRows = null; // the organizers list (STAFF_VIEW)
  let flash = null; // { text, ok } shown above the tables once
  let busy = false;

  async function load() {
    loadErr = null;
    try {
      if (STAFF_VIEW) {
        if (isAdmin) staffRows = await HVLoans.staffList();
      } else if (EVENT_ID == null) events = await HVLoans.events();
      else {
        ev = await HVLoans.event(EVENT_ID);
        // A signed-in player's sign-ups count as theirs on any device.
        if (ev && HVLoans.user) {
          try {
            for (const id of await HVLoans.myEventPlayerIds(EVENT_ID)) rememberMine(Number(id));
          } catch {}
        }
        if (ev) {
          // Forget sign-ups that are gone (left elsewhere, or removed by an admin) — only for this event's tables.
          const here = new Set(ev.event_tables.flatMap((t) => t.event_players.map((p) => p.id)));
          const known = store.get("hv-event-mine-at", {});
          for (const id of Object.keys(known)) if (known[id] === EVENT_ID && !here.has(Number(id))) {
            mine.delete(Number(id));
            delete known[id];
          }
          store.set("hv-event-mine-at", known);
          saveMine();
        }
      }
    } catch (err) {
      loadErr = err;
    }
    loaded = true;
    render();
  }
  function rememberMine(playerId) {
    mine.add(playerId);
    saveMine();
    const known = store.get("hv-event-mine-at", {});
    known[playerId] = EVENT_ID;
    store.set("hv-event-mine-at", known);
  }

  // ---------- rendering ----------
  function render() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    $("ev-title").textContent = tr("title");
    $("ev-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    renderAdminBar();
    renderLogin();
    if (!HVLoans.enabled) return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("noBackend"))}</p>`);
    if (loadErr && !(events || ev || staffRows))
      return void (main.innerHTML = `<p class="ev-msg is-err">${esc(tr("loadFailed", { msg: errText(loadErr) }))}</p>
        <button class="btn" type="button" data-retry>${esc(tr("retry"))}</button>`);
    if (STAFF_VIEW) renderStaffPage();
    else if (EVENT_ID == null) renderList();
    else renderEvent();
    if (dlg.open) renderDialog();
  }

  function stats(e) {
    const tables = e.event_tables || [];
    const people = tables.reduce((n, t) => n + (t.event_players || []).length, 0);
    return tables.length ? `${tr("tables", { n: tables.length })} · ${tr("people", { n: people })}` : tr("noTables");
  }
  function eventCard(e) {
    const d = parseYmd(e.event_date);
    const rel = relDay(e.event_date);
    const games = (e.event_tables || []).map(tableName);
    const shown = games.slice(0, 4);
    return `<a class="ev-card${isOver(e) ? " is-past" : ""}" href="events.html?id=${e.id}">
      <span class="ev-cal" aria-hidden="true"><small>${esc(new Intl.DateTimeFormat(lang() === "zh" ? "zh-CN" : "en-GB", { month: "short" }).format(d))}</small><b>${d.getDate()}</b></span>
      <span class="ev-card-body">
        <span class="ev-card-title">${esc(e.title)}</span>
        <span class="ev-when">${esc(fmtDate(e.event_date))}${e.start_time ? ` · ${esc(timeRange(e))}` : ""} <span class="ev-rel ${rel.cls}">${esc(rel.text)}</span></span>
        ${e.location ? `<span class="ev-card-place">📍 ${esc(e.location)}</span>` : ""}
        ${e.description ? `<span class="ev-card-desc">${esc(HVRich.text(e.description))}</span>` : ""}
        <span class="ev-card-stats">${esc(stats(e))}</span>
        ${shown.length ? `<span class="ev-card-games">${shown.map((n) => `<span class="chip">${esc(n)}</span>`).join("")}${games.length > shown.length ? `<span class="chip">+${games.length - shown.length}</span>` : ""}</span>` : ""}
      </span>
    </a>`;
  }
  function renderList() {
    if (!events) return void (main.innerHTML = `<p class="ev-msg">${esc(tr("loading"))}</p>`);
    const up = events.filter((e) => !isOver(e)); // already soonest first
    const past = events.filter(isOver).reverse(); // most recent first
    main.innerHTML = `
      <div class="ev-head">
        <h2>${esc(tr("upcoming"))}</h2>
        ${isAdmin ? `<span class="ev-head-acts"><a class="btn ghost" href="events.html?staff">${esc(tr("staffBtn"))}</a><button class="btn" type="button" data-new-event>${esc(tr("newEvent"))}</button></span>` : ""}
      </div>
      ${up.length ? `<div class="ev-list">${up.map(eventCard).join("")}</div>` : `<p class="ev-empty">${esc(tr("noUpcoming"))}</p>`}
      ${past.length ? `<details class="ev-past"><summary>${esc(tr("past", { n: past.length }))}</summary><div class="ev-list">${past.map(eventCard).join("")}</div></details>` : ""}`;
  }

  function tableCard(t, over) {
    const g = t.game_id && gameById(t.game_id);
    const players = t.event_players;
    const full = t.max_players != null && players.length >= t.max_players;
    const mineHere = players.find((p) => mine.has(p.id));
    const name = tableName(t);
    const img = g ? HVMedia.imageUrl(g.image) : null;
    const seat = t.max_players != null ? tr("seats", { n: players.length, max: t.max_players }) : tr("seatsOpen", { n: players.length });
    const title = g ? `<a href="index.html#/game/${encodeURIComponent(g.id)}">${esc(name)}</a>` : esc(name);
    // Tables from before the host was recorded: the first to join opened it.
    // The current host (the one who opened it, or whoever took over after they left).
    const hostId = t.host_player != null ? t.host_player : players[0] && players[0].id;
    const iHost = hostId != null && mine.has(hostId);
    const chips = players
      .map((p) => {
        const me = mine.has(p.id);
        return `<span class="ev-player${me ? " is-me" : ""}">${esc(p.name)}${p.id === hostId ? ` <small>· ${esc(tr("host"))}</small>` : ""}${me ? ` <small>(${esc(tr("me"))})</small>` : ""}${
          isAdmin ? `<button type="button" class="ev-x" data-remove-player="${p.id}" data-name="${esc(p.name)}" aria-label="${esc(tr("removePlayer", { name: p.name }))}">✕</button>` : ""
        }</span>`;
      })
      .join("");
    let action = "";
    if (!over) {
      if (mineHere) action = `<button class="btn ghost btn-sm" type="button" data-leave="${mineHere.id}" data-table="${t.id}">${esc(tr("leave"))}</button>`;
      else if (full) action = `<span class="ev-full">${esc(tr("full"))}</span>`;
      else action = `<button class="btn btn-sm" type="button" data-join="${t.id}">${esc(tr("join"))}</button>`;
    }
    return `<article class="ev-table${full ? " is-full" : ""}${mineHere ? " is-mine" : ""}">
      <div class="ev-table-top">
        ${img ? `<img class="ev-thumb" src="${esc(img)}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">` : `<span class="ev-thumb ev-thumb-icon" aria-hidden="true">🎲</span>`}
        <div class="ev-table-info">
          <h3>${title}</h3>
          <p class="ev-badges">
            <span class="ev-badge ${t.on_site ? "is-on" : "is-off"}"${t.on_site ? "" : ` title="${esc(tr("notOnSiteHint"))}"`}>${esc(tr(t.on_site ? "onSite" : "notOnSite"))}</span>
            ${t.start_time ? `<span class="ev-badge is-time">${esc(tr("startsAt", { t: fmtTime(t.start_time) }))}</span>` : ""}
            ${g ? "" : `<span class="ev-badge is-custom">${esc(tr("custom"))}</span>`}
            <span class="ev-seats">${esc(seat)}</span>
          </p>
          ${t.note ? `<p class="ev-note">${esc(t.note)}</p>` : ""}
        </div>
        <div class="ev-table-act">${action}</div>
      </div>
      <div class="ev-players">${chips}</div>
      ${iHost && !isAdmin && !over ? `<div class="ev-admin-row">
        <button class="link-btn" type="button" data-edit-time="${t.id}">${esc(tr("editTime"))}</button>
        ${players.length > 1 ? `<span class="ev-hint">${esc(tr("cantDelete"))}</span>` : `<button class="link-btn" type="button" data-delete-own="${t.id}">${esc(tr("deleteOwn"))}</button>`}
      </div>` : ""}
      ${isAdmin ? `<div class="ev-admin-row">
        <button class="link-btn" type="button" data-edit-time="${t.id}">${esc(tr("editTime"))}</button>
        ${players.length > 1 ? `<button class="link-btn" type="button" data-change-host="${t.id}">${esc(tr("changeHost"))}</button>` : ""}
        <button class="link-btn" type="button" data-toggle-site="${t.id}" data-on="${t.on_site ? 1 : 0}">${esc(tr(t.on_site ? "markNotOnSite" : "markOnSite"))}</button>
        <button class="link-btn" type="button" data-delete-table="${t.id}">${esc(tr("deleteTable"))}</button>
      </div>` : ""}
    </article>`;
  }
  // ---------- organizers (负责人) ----------
  // One person's contact card. n: their number at the event (负责人1, 2, …) or null; admin: show edit/delete (organizers page).
  function staffCard(s, n, admin) {
    const copyBtn = (v) => `<button class="ev-copy" type="button" data-copy="${esc(v)}">${esc(tr("copy"))}</button>`;
    const qr = (path, kind) =>
      path
        ? `<button class="ev-qr" type="button" data-qr="${esc(HVLoans.qrUrl(path))}" data-qr-title="${esc(tr("qrOf", { name: s.name, kind: tr(kind) }))}">
            <img src="${esc(HVLoans.qrUrl(path))}" alt="${esc(tr("qrOf", { name: s.name, kind: tr(kind) }))}" loading="lazy"><small>${esc(tr(kind))}</small></button>`
        : "";
    const qrs = qr(s.wechat_qr, "wechatQr") + qr(s.xhs_qr, "xhsQr");
    return `<article class="ev-staff">
      <div class="ev-staff-top"><b>${esc(s.name)}</b>${n ? `<span class="ev-role">${esc(tr("staffN", { n }))}</span>` : ""}</div>
      <ul class="ev-contact">
        ${s.phone ? `<li><span>📞 ${esc(tr("phone"))}</span><a href="tel:${esc(s.phone.replace(/[^\d+]/g, ""))}">${esc(s.phone)}</a></li>` : ""}
        ${s.wechat ? `<li><span><img class="ev-ico-wx" src="images/wechat.svg" alt=""> ${esc(tr("wechat"))}</span><b>${esc(s.wechat)}</b>${copyBtn(s.wechat)}</li>` : ""}
        ${s.xhs ? `<li><span><img class="ev-ico-xhs" src="images/xiaohongshu.png" alt=""> ${esc(tr("xhs"))}</span><b>${esc(s.xhs)}</b>${copyBtn(s.xhs)}</li>` : ""}
      </ul>
      ${qrs ? `<div class="ev-qrs">${qrs}</div>` : ""}
      ${admin ? `<p class="ev-admin-row"><button class="link-btn" type="button" data-staff-edit="${s.id}">${esc(tr("edit"))}</button><button class="link-btn" type="button" data-staff-delete="${s.id}">${esc(tr("delete"))}</button></p>` : ""}
    </article>`;
  }
  function staffSection(e) {
    // Contacts are for the day itself: visitors don't see them on past events (the database hides most of them
    // anyway, but not people who also run an upcoming event).
    if (isOver(e) && !isAdmin) return "";
    const people = (e.event_staff || []).filter((x) => x.staff);
    if (!people.length) return "";
    return `<section class="ev-contacts">
      <div class="ev-head"><h2>${esc(tr("contacts"))}</h2></div>
      <div class="ev-staff-grid">${people.map((x, i) => staffCard(x.staff, i + 1)).join("")}</div>
    </section>`;
  }
  function renderStaffPage() {
    document.title = `${tr("staffTitle")} · ${tr("title")} · ${HVI18n.t("siteName")}`;
    const crumb = `<p class="ev-crumb"><a href="events.html">${esc(tr("backToEvents"))}</a></p>`;
    if (!adminChecked) return void (main.innerHTML = crumb + `<p class="ev-msg">${esc(tr("loading"))}</p>`);
    if (!isAdmin)
      return void (main.innerHTML = crumb + `<p class="ev-msg">${esc(tr("adminOnly"))}</p><button class="btn" type="button" data-signin>${esc(tr("adminLogin"))}</button>`);
    if (!staffRows) return void (main.innerHTML = crumb + `<p class="ev-msg">${esc(tr("loading"))}</p>`);
    main.innerHTML = `${crumb}
      <div class="ev-head"><h2>${esc(tr("staffTitle"))}</h2><button class="btn" type="button" data-staff-add>${esc(tr("staffAdd"))}</button></div>
      <p class="ev-hint">${esc(tr("staffHint"))}</p>
      ${flash ? `<p class="ev-msg ${flash.ok ? "is-ok" : "is-err"}" role="status">${esc(flash.text)}</p>` : ""}
      ${staffRows.length ? `<div class="ev-staff-grid">${staffRows.map((s) => staffCard(s, null, true)).join("")}</div>` : `<p class="ev-empty">${esc(tr("staffEmpty"))}</p>`}`;
  }

  // 📍 The place, linking to Google Maps (or the event's own map link).
  function placeLine(e) {
    const url = mapLink(e);
    if (!url) return "";
    const a = (text, cls) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;
    return e.location
      ? `<p class="ev-where">📍 ${a(e.location, "ev-place")} ${a(tr("mapShort") + " ↗", "ev-map-btn")}</p>`
      : `<p class="ev-where">📍 ${a(tr("openMap") + " ↗", "ev-place")}</p>`;
  }
  function renderEvent() {
    if (!ev) {
      main.innerHTML = loaded
        ? `<p class="ev-crumb"><a href="events.html">${esc(tr("allEvents"))}</a></p><p class="ev-msg">${esc(tr("notFound"))}</p>`
        : `<p class="ev-msg">${esc(tr("loading"))}</p>`;
      return;
    }
    document.title = `${ev.title} · ${tr("title")} · ${HVI18n.t("siteName")}`;
    const over = isOver(ev);
    const rel = relDay(ev.event_date);
    const tables = ev.event_tables;
    main.innerHTML = `
      <p class="ev-crumb"><a href="events.html">${esc(tr("allEvents"))}</a></p>
      <section class="ev-hero">
        <h2>${esc(ev.title)}</h2>
        <p class="ev-when">📅 ${esc(fmtDate(ev.event_date, true))}${ev.start_time ? ` · 🕒 ${esc(timeRange(ev))}` : ""} <span class="ev-rel ${rel.cls}">${esc(rel.text)}</span></p>
        ${placeLine(ev)}
        ${ev.description ? `<div class="ev-desc rt-content">${HVRich.html(ev.description)}</div>` : ""}
        ${isAdmin ? `<p class="ev-admin-row"><button class="link-btn" type="button" data-edit-event>${esc(tr("editEvent"))}</button><button class="link-btn" type="button" data-delete-event>${esc(tr("deleteEvent"))}</button></p>` : ""}
      </section>
      ${staffSection(ev)}
      <div class="ev-head">
        <h2>${esc(tr("openTables", { n: tables.length }))}</h2>
        ${over ? "" : `<button class="btn" type="button" data-open-table>${esc(tr("openNew"))}</button>`}
      </div>
      ${flash ? `<p class="ev-msg ${flash.ok ? "is-ok" : "is-err"}" role="status">${esc(flash.text)}</p>` : ""}
      ${over ? `<p class="ev-empty">${esc(tr("overNote"))}</p>` : ""}
      ${tables.length ? `<div class="ev-tables">${tables.map((t) => tableCard(t, over)).join("")}</div>` : over ? "" : `<p class="ev-empty">${esc(tr("openFirst"))}</p>`}`;
  }

  // ---------- dialogs: open a table, join a table, publish/edit an event ----------
  let D = null; // { mode: "open", step: "pick" | "form", q, game: { id } | { custom }, onSite, max, note, name, err }
  //             { mode: "join", table, name, err }   { mode: "event", id, title, date, time, desc, err }
  function openDialog(state) {
    D = state;
    renderDialog();
    if (!dlg.open) dlg.showModal();
    const first = dlg.querySelector("[autofocus]");
    if (first) first.focus();
  }
  function closeDialog() {
    D = null;
    if (dlg.open) dlg.close();
  }
  const head = (title) => `<div class="ev-sheet-head"><h2 id="ev-dlg-title">${esc(title)}</h2><button class="ev-close" type="button" data-close aria-label="${esc(tr("close"))}">✕</button></div>`;
  const errLine = () => `<p class="form-error" role="alert">${esc(D.err || "")}</p>`;
  function renderDialog() {
    if (!D) return;
    if (D.mode === "open" && D.step === "pick") return renderPick();
    if (D.mode === "open") return renderOpenForm();
    if (D.mode === "join") return renderJoin();
    if (D.mode === "event") return renderEventForm();
    if (D.mode === "staff") return renderStaffForm();
    if (D.mode === "qr") return renderQr();
    if (D.mode === "time") return renderTimeForm();
    if (D.mode === "leave") return renderLeaveForm();
    if (D.mode === "host") return renderHostForm();
  }

  const norm = (s) => String(s || "").toLowerCase().replace(/[\s·:：\-–—'’!！?？.,，、()（）]/g, "");
  function gameMatches(g, q) {
    if (!q) return true;
    const names = typeof g.name === "string" ? [g.name] : Object.values(g.name || {});
    return names.some((n) => norm(n).includes(q)) || norm(g.id).includes(q);
  }
  function pickList() {
    const q = norm(D.q);
    const list = catalog
      .filter((g) => !gone.has(g.id) && gameMatches(g, q))
      .sort((a, b) => (atVenue(b.id) > 0) - (atVenue(a.id) > 0) || gameLabel(a).localeCompare(gameLabel(b), lang() === "zh" ? "zh-CN" : "en"));
    if (!list.length) return `<p class="ev-empty">${esc(tr("noResults"))}</p>`;
    return list
      .map((g) => {
        const n = atVenue(g.id);
        return `<button type="button" class="ev-pick-item" data-pick-game="${esc(g.id)}">
          <img src="${esc(HVMedia.imageUrl(g.image))}" alt="" loading="lazy" onerror="this.src='images/placeholder.svg'">
          <span><b>${esc(gameLabel(g))}</b><small>${g.players ? esc(tr("players", { p: g.players })) + " · " : ""}<span class="${n > 0 ? "ev-in" : "ev-out"}">${esc(n > 0 ? tr("inVenue", { n }) : tr("notInVenue"))}</span></small></span>
        </button>`;
      })
      .join("");
  }
  function renderPick() {
    dlg.innerHTML = `${head(tr("pickGame"))}
      <form class="ev-custom" data-custom-form>
        <label for="ev-custom-in">${esc(tr("customLabel"))}</label>
        <div class="ev-inline"><input id="ev-custom-in" maxlength="80" placeholder="${esc(tr("customPh"))}" value="${esc(D.custom || "")}"><button class="btn ghost" type="submit">${esc(tr("customUse"))}</button></div>
      </form>
      <input id="ev-search" class="ev-search" type="search" placeholder="${esc(tr("search"))}" aria-label="${esc(tr("search"))}" value="${esc(D.q)}" autofocus>
      <div class="ev-pick-list" id="ev-pick-list">${pickList()}</div>`;
  }
  function chosenGame() {
    const g = D.game.id && gameById(D.game.id);
    return g
      ? `<div class="ev-chosen"><img src="${esc(HVMedia.imageUrl(g.image))}" alt="" onerror="this.src='images/placeholder.svg'"><span><b>${esc(gameLabel(g))}</b>${g.players ? `<small>${esc(tr("players", { p: g.players }))}</small>` : ""}</span><button class="link-btn" type="button" data-change-game>${esc(tr("change"))}</button></div>`
      : `<div class="ev-chosen"><span class="ev-thumb ev-thumb-icon" aria-hidden="true">🎲</span><span><b>${esc(D.game.custom)}</b><small>${esc(tr("custom"))}</small></span><button class="link-btn" type="button" data-change-game>${esc(tr("change"))}</button></div>`;
  }
  const nameField = () => `<label class="ev-field"><span>${esc(tr("yourName"))}</span><input name="name" maxlength="30" autocomplete="nickname" placeholder="${esc(tr("namePh"))}" value="${esc(D.name)}" required${D.name ? "" : " autofocus"}></label>`;
  function renderOpenForm() {
    dlg.innerHTML = `${head(tr("openNew"))}
      <form class="ev-form" data-open-form novalidate>
        ${chosenGame()}
        <fieldset class="ev-field">
          <legend>${esc(tr("whereGame"))}</legend>
          <div class="ev-seg">
            <label><input type="radio" name="site" value="1"${D.onSite ? " checked" : ""}><span>${esc(tr("whereOn"))}</span></label>
            <label><input type="radio" name="site" value="0"${D.onSite ? "" : " checked"}><span>${esc(tr("whereOff"))}</span></label>
          </div>
          ${D.game.id ? `<small class="ev-hint">${esc(tr("whereHint"))}</small>` : ""}
        </fieldset>
        <div class="ev-row">
          <label class="ev-field ev-time"><span>${esc(tr("tableTime"))}</span><input name="time" type="time" value="${esc(D.time || "")}"></label>
          <label class="ev-field ev-max"><span>${esc(tr("maxPlayers"))}</span><input name="max" type="number" inputmode="numeric" min="1" max="30" placeholder="${esc(tr("maxPh"))}" value="${esc(D.max ?? "")}"></label>
        </div>
        <label class="ev-field"><span>${esc(tr("note"))}</span><input name="note" maxlength="200" placeholder="${esc(tr("notePh"))}" value="${esc(D.note)}"></label>
        ${nameField()}
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("openSubmit"))}</button></div>
      </form>`;
  }
  function renderJoin() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    dlg.innerHTML = `${head(tr("joinTitle", { game: tableName(t) }))}
      <form class="ev-form" data-join-form novalidate>
        <p class="ev-hint">${esc(t.max_players != null ? tr("seats", { n: t.event_players.length, max: t.max_players }) : tr("seatsOpen", { n: t.event_players.length }))} · ${esc(t.event_players.map((p) => p.name).join("、"))}</p>
        ${nameField()}
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""} autofocus>${esc(busy ? tr("saving") : tr("joinSubmit"))}</button></div>
      </form>`;
  }
  function renderEventForm() {
    dlg.innerHTML = `${head(tr(D.id ? "editEvent" : "newEvent").replace(/^[+＋]\s*/, ""))}
      <form class="ev-form" data-event-form novalidate>
        ${templatePicker()}
        <label class="ev-field"><span>${esc(tr("evTitle"))}</span><input name="title" maxlength="80" placeholder="${esc(tr("evTitlePh"))}" value="${esc(D.title)}" required autofocus></label>
        <div class="ev-row">
          <label class="ev-field date-field"><span>${esc(tr("evDate"))}</span><input type="hidden" name="date" value="${esc(D.date)}" data-datepicker data-quick="today,week,2weeks,month"></label>
          <label class="ev-field ev-time"><span>${esc(tr("evTime"))}</span><input name="time" type="time" value="${esc(D.time)}"></label>
          <label class="ev-field ev-time"><span>${esc(tr("evEnd"))}</span><input name="end" type="time" value="${esc(D.end)}"></label>
        </div>
        <label class="ev-field"><span>${esc(tr("evPlace"))}</span><input name="place" maxlength="200" placeholder="${esc(tr("evPlacePh"))}" value="${esc(D.place)}"></label>
        <label class="ev-field"><span>${esc(tr("evMap"))}</span><input name="map" type="url" inputmode="url" maxlength="500" placeholder="${esc(tr("evMapPh"))}" value="${esc(D.map)}"><small class="ev-hint">${esc(tr("evMapHint"))}</small></label>
        <div class="ev-field"><span id="ev-desc-label">${esc(tr("evDesc"))}</span>${HVRich.editorHtml(D.desc, tr("evDescPh"))}</div>
        <p class="ev-tpl-save"><button class="btn ghost btn-sm" type="button" data-tpl-save>${esc(tr("tplSave"))}</button>${D.tplMsg ? `<span class="ev-msg ${D.tplMsg.ok ? "is-ok" : "is-err"}" role="status">${esc(D.tplMsg.text)}</span>` : ""}</p>
        ${staffPickers()}
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr(D.id ? "evSaveEdit" : "evSave"))}</button></div>
      </form>`;
    HVDatePicker.enhance(dlg);
    const rich = dlg.querySelector("[data-rich]");
    rich.querySelector(".rt-edit").setAttribute("aria-labelledby", "ev-desc-label");
    HVRich.mount(rich);
  }
  // Event templates: pick one to fill in the name and description.
  function templatePicker() {
    if (!D.tpls) return "";
    if (!D.tpls.length) return `<p class="ev-hint ev-tpl">${esc(tr("tplNone"))}</p>`;
    const sel = String(D.tplSel || "");
    return `<div class="ev-tpl">
      <label class="ev-field"><span>${esc(tr("tplImport"))}</span>
        <select name="tpl"><option value="">${esc(tr("tplPick"))}</option>${D.tpls
          .map((t) => `<option value="${t.id}"${String(t.id) === sel ? " selected" : ""}>${esc(t.title)}</option>`)
          .join("")}</select></label>
      ${sel ? `<button class="link-btn" type="button" data-tpl-delete>${esc(tr("tplDelete"))}</button>` : ""}
    </div>`;
  }
  const sameName = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  function useTemplate(id) {
    const prev = D.tplSel;
    readForm();
    D.tplMsg = null;
    const t = D.tpls.find((x) => String(x.id) === String(id));
    if (!t) {
      D.tplSel = "";
      return renderDialog();
    }
    const tPlace = t.location || "";
    const tMap = t.map_url || "";
    const tTime = fmtTime(t.start_time);
    const tEnd = fmtTime(t.end_time);
    const filled = [D.title, D.desc, D.place, D.map].some((x) => String(x || "").trim());
    const differs = !sameName(D.title, t.title) || String(D.desc || "").trim() !== t.description.trim() ||
      String(D.place || "").trim() !== tPlace.trim() || String(D.map || "").trim() !== tMap.trim() ||
      (D.time || "") !== tTime || (D.end || "") !== tEnd;
    if (filled && differs && !confirm(tr("tplReplace", { name: t.title }))) {
      D.tplSel = prev; // puts the select back
      return renderDialog();
    }
    Object.assign(D, { tplSel: String(t.id), title: t.title, desc: t.description, place: tPlace, map: tMap, time: tTime, end: tEnd });
    renderDialog();
  }
  async function saveTemplate() {
    readForm();
    const title = String(D.title || "").trim();
    if (!title) {
      D.tplMsg = { text: tr("needTitle"), ok: false };
      return renderDialog();
    }
    if (D.end && !D.time) {
      D.tplMsg = { text: tr("needStart"), ok: false };
      return renderDialog();
    }
    if (String(D.desc || "").length > 20000) {
      D.tplMsg = { text: tr("descTooLong"), ok: false };
      return renderDialog();
    }
    const map = cleanMapUrl(D.map);
    if (map && !/^https:\/\/\S+$/i.test(map)) {
      D.tplMsg = { text: tr("badMap"), ok: false };
      return renderDialog();
    }
    D.map = map;
    const existing = (D.tpls || []).find((t) => sameName(t.title, title));
    if (existing && !confirm(tr("tplOverwrite", { name: existing.title }))) return;
    const state = D;
    let row = null;
    let fail = null;
    try {
      row = await HVLoans.saveTemplate(
        {
          title,
          description: String(state.desc || "").trim(),
          start_time: state.time || null,
          end_time: state.end || null,
          location: String(state.place || "").trim().slice(0, 200),
          map_url: map,
        },
        existing ? existing.id : null
      );
    } catch (err) {
      fail = err;
    }
    if (D === state) readForm(); // keep anything typed meanwhile, then show the result
    if (row) {
      state.tpls = [...(state.tpls || []).filter((t) => t.id !== row.id), row].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
      state.tplSel = String(row.id);
      state.tplMsg = { text: tr("tplSaved", { name: row.title }), ok: true };
    } else state.tplMsg = { text: errText(fail), ok: false };
    if (D === state) renderDialog();
  }
  async function deleteTemplate() {
    readForm();
    const t = (D.tpls || []).find((x) => String(x.id) === String(D.tplSel));
    if (!t || !confirm(tr("tplDeleteConfirm", { name: t.title }))) return;
    const state = D;
    let fail = null;
    try {
      await HVLoans.deleteTemplate(t.id);
    } catch (err) {
      fail = err;
    }
    if (D === state) readForm();
    if (!fail) {
      state.tpls = state.tpls.filter((x) => x.id !== t.id);
      state.tplSel = "";
      state.tplMsg = { text: tr("tplDeleted", { name: t.title }), ok: true };
    } else state.tplMsg = { text: errText(fail), ok: false };
    if (D === state) renderDialog();
  }

  // The event's organizers in order: 负责人1 (required), 负责人2, … One dropdown per chosen person, plus an empty one
  // for the next while anyone is left. Each dropdown leaves out the people chosen in the others.
  function staffPickers() {
    const manage = `<a href="events.html?staff">${esc(tr("manageStaff"))}</a>`;
    if (!D.staff) return `<p class="ev-hint">${esc(tr("leadField"))}: ${esc(tr("loading"))}</p>`;
    if (!D.staff.length) return `<p class="ev-msg is-err">${esc(tr("noStaffYet"))} ${manage}</p>`;
    const known = new Set(D.staff.map((x) => String(x.id)));
    const slots = D.slots.filter((id) => known.has(id));
    const shown = slots.length < D.staff.length ? [...slots, ""] : slots;
    const pickers = shown
      .map((id, i) => {
        const taken = new Set(slots.filter((x, j) => j !== i));
        return `<label class="ev-slot"><span>${esc(tr("staffN", { n: i + 1 }))}</span>
          <select name="slot"${i === 0 ? " required" : ""}><option value="">${esc(i === 0 ? tr("slotPick") : tr("slotNone"))}</option>${D.staff
            .filter((x) => !taken.has(String(x.id)))
            .map((x) => `<option value="${x.id}"${String(x.id) === id ? " selected" : ""}>${esc(x.name)}</option>`)
            .join("")}</select></label>`;
      })
      .join("");
    return `<fieldset class="ev-field" data-slots><legend>${esc(tr("leadField"))}</legend>
        <div class="ev-slots">${pickers}</div>
        <small class="ev-hint">${esc(tr("leadHint"))}</small>
      </fieldset>
      <p class="ev-hint">${manage}</p>`;
  }
  // The organizer form. Each QR code: { path (saved), file (new picture), url (preview), removed }.
  function renderStaffForm() {
    const qrField = (kind, label) => {
      const q = D.qr[kind];
      const src = q.url || (q.path && !q.removed ? HVLoans.qrUrl(q.path) : "");
      return `<div class="ev-field"><span>${esc(tr(label))}</span>
        <div class="ev-qr-edit">
          ${src ? `<img src="${esc(src)}" alt="">` : `<span class="ev-qr-none">${esc(tr("qrNone"))}</span>`}
          <label class="btn ghost btn-sm ev-file">${esc(tr(src ? "qrChange" : "qrPick"))}<input type="file" accept="image/png,image/jpeg,image/webp" data-qr-file="${kind}"></label>
          ${src ? `<button class="link-btn" type="button" data-qr-remove="${kind}">${esc(tr("qrRemove"))}</button>` : ""}
        </div></div>`;
    };
    dlg.innerHTML = `${head(tr(D.id ? "staffEdit" : "staffNew"))}
      <form class="ev-form" data-staff-form novalidate>
        <label class="ev-field"><span>${esc(tr("staffName"))}</span><input name="name" maxlength="30" value="${esc(D.name)}" required autofocus></label>
        <div class="ev-row">
          <label class="ev-field"><span>${esc(tr("staffPhone"))}</span><input name="phone" type="tel" maxlength="30" value="${esc(D.phone)}" required></label>
          <label class="ev-field"><span>${esc(tr("staffWechat"))}</span><input name="wechat" maxlength="60" value="${esc(D.wechat)}" required></label>
        </div>
        <label class="ev-field"><span>${esc(tr("staffXhs"))}</span><input name="xhs" maxlength="60" value="${esc(D.xhs)}"></label>
        ${qrField("wechat_qr", "staffWechatQr")}
        ${qrField("xhs_qr", "staffXhsQr")}
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("staffSave"))}</button></div>
      </form>`;
  }
  // A table's start time (its host or an admin).
  function renderTimeForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    dlg.innerHTML = `${head(tr("timeTitle", { game: tableName(t) }))}
      <form class="ev-form" data-time-form novalidate>
        <label class="ev-field ev-time"><span>${esc(tr("tableTime"))}</span><input name="time" type="time" value="${esc(D.time || "")}" autofocus></label>
        <p class="ev-hint">${esc(tr("timeHint"))}</p>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("timeSave"))}</button></div>
      </form>`;
  }
  async function submitTime() {
    readForm();
    D.err = "";
    const id = D.table;
    const time = D.time || null;
    await submit(async () => {
      if (isAdmin) await HVLoans.updateTable(id, { start_time: time });
      else if (!(await HVLoans.setTableTime(id, token(), time))) throw Object.assign(new Error("not host"), { code: "not-host" });
      flash = { text: tr("timeSaved"), ok: true };
    });
  }
  // The host leaving a table with other players: pick who takes over, or leave it to joining order.
  function renderLeaveForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    const others = t ? t.event_players.filter((p) => p.id !== D.player) : [];
    if (!others.length) return closeDialog();
    const opt = (value, label) =>
      `<label class="ev-leave-opt"><input type="radio" name="next" value="${value}"${String(D.next) === String(value) ? " checked" : ""}><span>${esc(label)}</span></label>`;
    dlg.innerHTML = `${head(tr("leaveTitle", { game: tableName(t) }))}
      <form class="ev-form" data-leave-form novalidate>
        <fieldset class="ev-field">
          <legend>${esc(tr("leaveWho"))}</legend>
          <div class="ev-leave-list">
            ${opt("", tr("leaveDefault", { name: others[0].name }))}
            ${others.map((p) => opt(p.id, p.name)).join("")}
          </div>
        </fieldset>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("leaving") : tr("leaveSubmit"))}</button></div>
      </form>`;
  }
  // Admins: pick another player at the table to be its host.
  function renderHostForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t || t.event_players.length < 2) return closeDialog();
    const hostId = t.host_player != null ? t.host_player : t.event_players[0].id;
    const opts = t.event_players
      .map((p) => `<label class="ev-leave-opt"><input type="radio" name="host" value="${p.id}"${String(D.host) === String(p.id) ? " checked" : ""}><span>${esc(p.name)}${p.id === hostId ? ` <small>${esc(tr("hostNow"))}</small>` : ""}</span></label>`)
      .join("");
    dlg.innerHTML = `${head(tr("hostTitle", { game: tableName(t) }))}
      <form class="ev-form" data-host-form novalidate>
        <fieldset class="ev-field"><legend>${esc(tr("hostWho"))}</legend><div class="ev-leave-list">${opts}</div></fieldset>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("hostSave"))}</button></div>
      </form>`;
  }
  async function submitHost() {
    readForm();
    D.err = "";
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    const p = t && t.event_players.find((x) => String(x.id) === String(D.host));
    if (!p) return closeDialog();
    if (p.id === t.host_player) return closeDialog(); // nothing changes
    await submit(async () => {
      if (!(await HVLoans.setTableHost(t.id, p.id))) throw Object.assign(new Error("gone"), { code: "host-gone" });
      flash = { text: tr("hostSaved", { name: p.name }), ok: true };
    });
  }
  async function submitLeave() {
    readForm();
    D.err = "";
    const pid = D.player;
    const next = D.next ? Number(D.next) : null;
    await submit(async () => {
      const ok = await HVLoans.leaveTable(pid, token(), next);
      mine.delete(pid);
      saveMine();
      if (!ok) throw Object.assign(new Error("gone"), { code: "leave-gone" });
    });
  }
  function renderQr() {
    dlg.innerHTML = `${head(D.title)}
      <img class="ev-qr-big" src="${esc(D.url)}" alt="${esc(D.title)}">
      <p class="ev-hint">${esc(tr("qrTap"))}</p>`;
  }
  // Phone photos of QR codes are big; keep the longest side at most 900 px.
  async function shrinkImage(file) {
    if (!file || !/^image\/(png|jpeg|webp|gif|heic|heif)$/i.test(file.type || "")) throw Object.assign(new Error("not an image"), { code: "qr-not-image" });
    let img;
    try {
      img = await createImageBitmap(file);
    } catch {
      throw Object.assign(new Error("not an image"), { code: "qr-not-image" });
    }
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("could not read the picture"))), "image/jpeg", 0.92));
  }

  // Keeps what was typed when the dialog is redrawn (e.g. after an error or a language switch).
  function readForm() {
    const f = dlg.querySelector("form.ev-form");
    if (!f || !D) return;
    const v = (n) => (f.elements[n] ? f.elements[n].value : undefined);
    if (D.mode === "open") Object.assign(D, { onSite: v("site") === "1", time: v("time"), max: v("max"), note: v("note"), name: v("name") });
    if (D.mode === "join") D.name = v("name");
    if (D.mode === "time") D.time = v("time");
    if (D.mode === "leave") D.next = (f.querySelector("input[name=next]:checked") || {}).value || "";
    if (D.mode === "host") D.host = (f.querySelector("input[name=host]:checked") || {}).value || "";
    if (D.mode === "event") {
      Object.assign(D, { title: v("title"), date: v("date"), time: v("time"), end: v("end"), place: v("place"), map: v("map") });
      if (f.querySelector("[data-rich]")) D.desc = HVRich.value(f.querySelector("[data-rich]"));
      if (f.elements.tpl) D.tplSel = f.elements.tpl.value;
      // Chosen organizers in order, without gaps or repeats.
      if (f.querySelector("[data-slots]")) D.slots = [...new Set([...f.querySelectorAll("select[name=slot]")].map((x) => x.value).filter(Boolean))];
    }
    if (D.mode === "staff") Object.assign(D, { name: v("name"), phone: v("phone"), wechat: v("wechat"), xhs: v("xhs") });
  }
  function openEventForm(e) {
    openDialog({
      mode: "event",
      id: e ? e.id : null,
      title: e ? e.title : "",
      date: e ? e.event_date : todayYmd(),
      time: e ? fmtTime(e.start_time) : "",
      end: e ? fmtTime(e.end_time) : "",
      place: e ? e.location || "" : "",
      map: e ? e.map_url || "" : "",
      desc: e ? e.description : "",
      slots: e ? (e.event_staff || []).filter((x) => x.staff).map((x) => String(x.staff.id)) : [], // already in order
      staff: null,
      tpls: null,
      tplSel: "",
      tplMsg: null,
      err: "",
    });
    const state = D;
    HVLoans.templates().then(
      (list) => {
        if (D !== state) return;
        readForm();
        D.tpls = list;
        renderDialog();
      },
      (err) => {
        if (D !== state) return;
        readForm();
        D.tplMsg = { text: tr("tplLoadFailed", { msg: errText(err) }), ok: false };
        renderDialog();
      }
    );
    HVLoans.staffList().then(
      (list) => {
        if (D !== state) return;
        readForm();
        D.staff = list;
        renderDialog();
      },
      (err) => {
        if (D !== state) return;
        readForm();
        D.staff = [];
        D.err = errText(err);
        renderDialog();
      }
    );
  }
  function openStaffForm(s) {
    openDialog({
      mode: "staff",
      id: s ? s.id : null,
      name: s ? s.name : "",
      phone: s ? s.phone : "",
      wechat: s ? s.wechat : "",
      xhs: s ? s.xhs : "",
      qr: {
        wechat_qr: { path: s ? s.wechat_qr : null, file: null, url: "", removed: false },
        xhs_qr: { path: s ? s.xhs_qr : null, file: null, url: "", removed: false },
      },
      err: "",
    });
  }

  function startOpen() {
    // The start time begins as the event's own start time; the host can change or clear it.
    openDialog({ mode: "open", step: "pick", q: "", custom: "", game: null, onSite: true, time: ev && ev.start_time ? fmtTime(ev.start_time) : "", max: "", note: "", name: myName(), err: "" });
  }
  function chooseGame(game) {
    const g = game.id && gameById(game.id);
    Object.assign(D, { step: "form", game, err: "", onSite: g ? atVenue(g.id) > 0 : false, max: g ? maxFromPlayers(g.players) ?? "" : D.max || "" });
    renderDialog();
    const f = dlg.querySelector("[autofocus]") || dlg.querySelector("input[name=name]");
    if (f) f.focus();
  }
  function checkName() {
    const name = String(D.name || "").trim();
    if (!name) {
      D.err = tr("needName");
      return null;
    }
    return name.slice(0, 30);
  }

  async function submit(fn) {
    if (busy) return;
    busy = true;
    D.err = "";
    renderDialog();
    try {
      await fn();
      busy = false;
      closeDialog();
      await load();
    } catch (err) {
      busy = false;
      if (D) {
        D.err = errText(err);
        renderDialog();
      }
      if (err.code === "HVE02" || err.code === "HVE01") load();
    }
  }
  async function submitOpen() {
    readForm();
    D.err = "";
    const name = checkName();
    const max = String(D.max ?? "").trim();
    if (name && max && !/^\d+$/.test(max)) D.err = tr("badMax");
    else if (name && max && (Number(max) < 1 || Number(max) > 30)) D.err = tr("badMax");
    if (!name || D.err) return renderDialog();
    const g = D.game.id && gameById(D.game.id);
    const gameName = g ? (typeof g.name === "string" ? g.name : g.name.zh || g.name.en) : D.game.custom;
    await submit(async () => {
      const r = await HVLoans.openTable(
        EVENT_ID,
        { game_id: g ? g.id : null, game_name: gameName, on_site: D.onSite, max_players: max ? Number(max) : null, note: D.note, start_time: D.time || null },
        name,
        token()
      );
      store.set("hv-event-name", name);
      rememberMine(r.player_id);
      flash = null;
    });
  }
  async function submitJoin() {
    readForm();
    D.err = "";
    const name = checkName();
    if (!name) return renderDialog();
    await submit(async () => {
      const id = await HVLoans.joinTable(D.table, name, token());
      store.set("hv-event-name", name);
      rememberMine(id);
      flash = null;
    });
  }
  async function submitEvent() {
    readForm();
    D.err = "";
    const title = String(D.title || "").trim();
    if (!title) D.err = tr("needTitle");
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(D.date || "")) D.err = tr("needDate");
    else if (D.end && !D.time) D.err = tr("needStart");
    else if (String(D.desc || "").length > 20000) D.err = tr("descTooLong");
    else if ((D.map = cleanMapUrl(D.map)) && !/^https:\/\/\S+$/i.test(D.map)) D.err = tr("badMap");
    else if (!D.staff) D.err = tr("loading");
    else if (!D.staff.length) D.err = tr("noStaffYet");
    else if (!D.slots.length) D.err = tr("needLead");
    if (D.err) return renderDialog();
    const wasNew = !D.id;
    const lead = Number(D.slots[0]); // 负责人1 (stored as the main organizer); the rest keep their order
    const deps = D.slots.slice(1).map(Number);
    const state = D;
    await submit(async () => {
      const row = await HVLoans.saveEvent(
        {
          title,
          event_date: state.date,
          start_time: state.time || null,
          end_time: state.end || null,
          location: String(state.place || "").trim().slice(0, 200),
          map_url: state.map || "",
          description: String(state.desc || "").trim(),
        },
        state.id
      );
      state.id = row.id; // a retry after a failed organizer save changes this event instead of adding another
      await HVLoans.setEventStaff(row.id, lead, deps);
      if (wasNew) location.href = `events.html?id=${row.id}`;
    });
  }
  async function submitStaff() {
    readForm();
    D.err = "";
    const name = String(D.name || "").trim();
    const phone = String(D.phone || "").trim();
    const wechat = String(D.wechat || "").trim();
    if (!name) D.err = tr("needStaffName");
    else if (!phone) D.err = tr("needPhone");
    else if (!wechat) D.err = tr("needWechat");
    if (D.err) return renderDialog();
    const state = D;
    const uploaded = [];
    await submit(async () => {
      const fields = { name, phone, wechat, xhs: String(state.xhs || "").trim() };
      const old = [];
      try {
        for (const kind of ["wechat_qr", "xhs_qr"]) {
          const q = state.qr[kind];
          if (q.file) {
            const path = await HVLoans.uploadQr(q.file);
            uploaded.push(path);
            fields[kind] = path;
            if (q.path) old.push(q.path);
          } else if (q.removed) {
            fields[kind] = null;
            if (q.path) old.push(q.path);
          }
        }
        await HVLoans.saveStaff(fields, state.id);
      } catch (err) {
        uploaded.forEach((p) => HVLoans.deleteQr(p).catch(() => {}));
        throw err;
      }
      old.forEach((p) => HVLoans.deleteQr(p).catch(() => {})); // replaced pictures
    });
  }

  // Admin and "leave" actions on the page; errors show above the tables.
  async function act(fn, okText) {
    if (busy) return;
    busy = true;
    try {
      await fn();
      flash = okText ? { text: okText, ok: true } : null;
    } catch (err) {
      flash = { text: errText(err), ok: false };
    }
    busy = false;
    await load();
  }

  // ---------- events ----------
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-retry")) {
      main.innerHTML = `<p class="ev-msg">${esc(tr("loading"))}</p>`;
      return void load();
    }
    if (b.dataset.copy != null) return copyText(b);
    if (b.dataset.qr) return openDialog({ mode: "qr", url: b.dataset.qr, title: b.dataset.qrTitle });
    if (b.hasAttribute("data-signin")) {
      $("login-error").textContent = "";
      return $("login").showModal();
    }
    if (b.hasAttribute("data-staff-add")) return openStaffForm(null);
    if (b.dataset.staffEdit) return openStaffForm(staffRows.find((s) => s.id === Number(b.dataset.staffEdit)));
    if (b.dataset.staffDelete) {
      const s = staffRows.find((x) => x.id === Number(b.dataset.staffDelete));
      if (!s || !confirm(tr("staffDeleteConfirm", { name: s.name }))) return;
      return void act(async () => {
        await HVLoans.deleteStaff(s.id);
        [s.wechat_qr, s.xhs_qr].filter(Boolean).forEach((p) => HVLoans.deleteQr(p).catch(() => {}));
      });
    }
    if (b.hasAttribute("data-new-event")) return openEventForm(null);
    if (b.hasAttribute("data-edit-event")) return openEventForm(ev);
    if (b.hasAttribute("data-delete-event")) {
      if (!confirm(tr("deleteEventConfirm", { title: ev.title }))) return;
      return void HVLoans.deleteEvent(ev.id).then(
        () => (location.href = "events.html"),
        (err) => alert(errText(err))
      );
    }
    if (b.hasAttribute("data-open-table")) return startOpen();
    const tableOf = (id) => ev.event_tables.find((t) => t.id === Number(id));
    if (b.dataset.join) return openDialog({ mode: "join", table: Number(b.dataset.join), name: myName(), err: "" });
    if (b.dataset.leave) {
      const t = tableOf(b.dataset.table);
      const pid = Number(b.dataset.leave);
      // The host leaving a table with others picks who takes over (default: the next person who joined).
      if (t && t.host_player === pid && t.event_players.some((p) => p.id !== pid)) {
        return openDialog({ mode: "leave", table: t.id, player: pid, next: "", err: "" });
      }
      if (!confirm(tr("leaveConfirm", { game: t ? tableName(t) : "" }))) return;
      return void act(async () => {
        const ok = await HVLoans.leaveTable(pid, token());
        mine.delete(pid);
        saveMine();
        if (!ok) throw Object.assign(new Error("gone"), { code: "leave-gone" });
      });
    }
    if (b.dataset.deleteOwn) {
      const t = tableOf(b.dataset.deleteOwn);
      if (!confirm(tr("deleteOwnConfirm", { game: t ? tableName(t) : "" }))) return;
      const id = Number(b.dataset.deleteOwn);
      return void act(async () => {
        const ok = await HVLoans.deleteOwnTable(id, token());
        if (!ok) throw Object.assign(new Error("not host"), { code: "not-host" });
      }, tr("tableDeleted"));
    }
    if (b.dataset.changeHost) {
      const t = tableOf(b.dataset.changeHost);
      if (t) openDialog({ mode: "host", table: t.id, host: String(t.host_player != null ? t.host_player : t.event_players[0].id), err: "" });
      return;
    }
    if (b.dataset.editTime) {
      const t = tableOf(b.dataset.editTime);
      if (t) openDialog({ mode: "time", table: t.id, time: fmtTime(t.start_time), err: "" });
      return;
    }
    if (b.dataset.removePlayer) {
      if (!confirm(tr("removeConfirm", { name: b.dataset.name }))) return;
      return void act(() => HVLoans.removePlayer(Number(b.dataset.removePlayer)));
    }
    if (b.dataset.deleteTable) {
      const t = tableOf(b.dataset.deleteTable);
      if (!confirm(tr("deleteTableConfirm", { game: t ? tableName(t) : "" }))) return;
      return void act(() => HVLoans.deleteTable(Number(b.dataset.deleteTable)));
    }
    if (b.dataset.toggleSite) return void act(() => HVLoans.updateTable(Number(b.dataset.toggleSite), { on_site: b.dataset.on !== "1" }));
  });

  // Copies a WeChat / Xiaohongshu ID and says so on the button for a moment.
  async function copyText(b) {
    const text = b.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy");
      } catch {}
      t.remove();
    }
    b.textContent = tr("copied");
    setTimeout(() => (b.textContent = tr("copy")), 1500);
  }

  dlg.addEventListener("change", async (e) => {
    if (!D) return;
    const t = e.target;
    if (t.name === "slot") {
      readForm();
      return renderDialog();
    }
    if (t.name === "tpl") return useTemplate(t.value);
    if (t.dataset.qrFile && t.files && t.files[0]) {
      readForm();
      const kind = t.dataset.qrFile;
      const state = D;
      try {
        const blob = await shrinkImage(t.files[0]);
        const q = state.qr[kind];
        if (q.url) URL.revokeObjectURL(q.url);
        Object.assign(q, { file: blob, url: URL.createObjectURL(blob), removed: false });
        state.err = "";
      } catch (err) {
        state.err = errText(err);
      }
      if (D === state) renderDialog();
    }
  });
  // Forms close only with ✕ or 取消, so a stray click outside (or Esc) doesn't lose what was typed.
  // The enlarged QR code isn't a form: a click outside or Esc closes it.
  dlg.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || (e.target === dlg && D && D.mode === "qr")) return closeDialog();
    if (e.target.closest("[data-tpl-save]") && D) return void saveTemplate();
    if (e.target.closest("[data-tpl-delete]") && D) return void deleteTemplate();
    const rm = e.target.closest("[data-qr-remove]");
    if (rm && D && D.qr) {
      readForm();
      const q = D.qr[rm.dataset.qrRemove];
      if (q.url) URL.revokeObjectURL(q.url);
      Object.assign(q, { file: null, url: "", removed: true });
      return renderDialog();
    }
    const pg = e.target.closest("[data-pick-game]");
    if (pg) return chooseGame({ id: pg.dataset.pickGame });
    if (e.target.closest("[data-change-game]")) {
      readForm();
      D.step = "pick";
      renderDialog();
      const s = $("ev-search");
      if (s) s.focus();
    }
  });
  dlg.addEventListener("input", (e) => {
    if (!D) return;
    if (e.target.id === "ev-search") {
      D.q = e.target.value;
      $("ev-pick-list").innerHTML = pickList();
    } else if (e.target.id === "ev-custom-in") D.custom = e.target.value;
  });
  dlg.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    if (!D) return;
    if (f.hasAttribute("data-custom-form")) {
      const name = $("ev-custom-in").value.trim();
      if (!name) return $("ev-custom-in").focus();
      // A typed name that is in the library counts as that game.
      const hit = catalog.find((g) => !gone.has(g.id) && (typeof g.name === "string" ? [g.name] : Object.values(g.name)).some((n) => norm(n) === norm(name)));
      return chooseGame(hit ? { id: hit.id } : { custom: name.slice(0, 80) });
    }
    if (f.hasAttribute("data-open-form")) return void submitOpen();
    if (f.hasAttribute("data-join-form")) return void submitJoin();
    if (f.hasAttribute("data-event-form")) return void submitEvent();
    if (f.hasAttribute("data-staff-form")) return void submitStaff();
    if (f.hasAttribute("data-time-form")) return void submitTime();
    if (f.hasAttribute("data-leave-form")) return void submitLeave();
    if (f.hasAttribute("data-host-form")) return void submitHost();
  });
  // "close" arrives a moment later, so ignore it if another dialog has been opened since.
  dlg.addEventListener("cancel", (e) => {
    if (!D || D.mode !== "qr") e.preventDefault();
  });
  dlg.addEventListener("close", () => {
    if (!dlg.open && !busy) D = null;
  });

  // ---------- admin sign-in ----------
  const adminParam = [...new URLSearchParams(location.search).keys()].some((k) => k.toLowerCase() === "admin");
  function renderAdminBar() {
    const bar = $("admin-bar");
    // Player accounts can be signed in too; the admin bar is only for admins (or ?admin, to sign in as one).
    const show = HVLoans.enabled && (adminParam || isAdmin);
    bar.hidden = !show;
    if (!show) return void (bar.innerHTML = "");
    bar.innerHTML = isAdmin
      ? `<span class="admin-who" title="${esc(HVLoans.user)}">${esc(HVLoans.user)}</span>` // signing out: the header button (js/account-link.js)
      : `<button class="admin-btn" type="button" data-signin>${esc(tr("adminLogin"))}</button>`;
  }
  function renderLogin() {
    $("login-title").textContent = tr("adminLogin");
    $("login-email").textContent = tr("email");
    $("login-password").textContent = tr("password");
    document.querySelector("[data-login-cancel]").textContent = tr("cancel");
    document.querySelector("[data-login-submit]").textContent = tr("signIn");
  }
  $("admin-bar").addEventListener("click", (e) => {
    if (e.target.closest("[data-signin]")) {
      $("login-error").textContent = "";
      $("login").showModal();
    }
  });
  // Like the other forms: closes only with 取消.
  $("login").addEventListener("click", (e) => {
    if (e.target.closest("[data-login-cancel]")) $("login").close();
  });
  $("login").addEventListener("cancel", (e) => e.preventDefault());
  $("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target.elements;
    $("login-error").textContent = "";
    try {
      await HVLoans.signIn(f.email.value.trim(), f.password.value);
      f.password.value = "";
      if (!(await HVLoans.isAdmin())) {
        HVLoans.signOut();
        $("login-error").textContent = tr("notAdmin");
        window.dispatchEvent(new Event("hv-auth-change"));
        return;
      }
      isAdmin = true;
      adminChecked = true;
      $("login").close();
      window.dispatchEvent(new Event("hv-auth-change"));
      load(); // admins see more (organizers list, organizers of past events)
    } catch (err) {
      $("login-error").textContent = tr("signInError", { msg: err.message });
    }
  });

  // ---------- start ----------
  $("lang-toggle").addEventListener("click", () => {
    readForm();
    HVI18n.toggle();
  });
  HVI18n.onChange(render);
  render();
  if (!HVLoans.enabled) return;
  if (HVLoans.user) {
    HVLoans.isAdmin()
      .then((yes) => {
        isAdmin = yes;
      })
      .catch(() => {})
      .then(() => {
        adminChecked = true;
        if (STAFF_VIEW && isAdmin) load();
        else render();
      });
    // A signed-in player's nickname fills in the name when joining or opening a table.
    const uid = HVLoans.userId;
    if (uid) HVLoans.profile(uid).then((p) => (profileName = (p && p.name) || ""), () => {});
  }
  // The catalogue only matters for names and pictures, so the event shows first and fills in after.
  load();
  loadCatalog().then(render, render);
  // Pick up sign-ups made by others while the page is open.
  const refresh = () => document.visibilityState === "visible" && !dlg.open && !busy && load();
  document.addEventListener("visibilitychange", refresh);
  if (EVENT_ID != null) setInterval(refresh, 30000);
})();
