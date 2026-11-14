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
      prevPage: "‹ 上一页",
      nextPage: "下一页 ›",
      pageOf: "第 {n} / {m} 页",
      pastFailed: "没能加载往期活动：{msg}",
      today: "今天",
      tomorrow: "明天",
      inDays: "{n} 天后",
      over: "已结束",
      tables: "{n} 桌",
      people: "{n} 人参加",
      headcount: "👥 共 {n} 人参加",
      peopleTitle: "来玩的人（{n}）",
      peopleStaff: "负责人",
      peopleHidden: "负责人（名字不公开）",
      peopleExtra: "另外 {n} 位没报名的朋友",
      peopleNone: "还没有人报名。",
      extraField: "没报名的朋友（人数）",
      extraHint: "有人带朋友来、朋友没在网上报名时，在这里填人数，会算进总人数。",
      extraSave: "💾 保存人数",
      badExtra: "请填 0 到 200 之间的整数。",
      extraSaved: "✓ 人数已更新",
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
      gamesTitle: "🎮 对局记录",
      playerName: "名字",
      otherPh: "例如：小明",
      needOtherName: "请填写名字。",
      points: "{n} 分",
      fillResult: "✏️ 填写结果",
      editResult: "修改结果",
      resultTitle: "第 {n} 局 · 填写结果",
      notScored: "这款游戏不计分，不能记录对局。",
      hintLowEv: "这款游戏分数最低的获胜。",
      winWho: "谁赢了？（可以多选）",
      sideOf: "{name} 的阵营",
      whichSide: "哪一方获胜？",
      coopResult: "结果",
      coopWin: "✅ 合作成功",
      coopLose: "❌ 合作失败",
      optional: "（可不填）",
      teamWon: "🏆 {team}获胜",
      winTag: "获胜",
      needWinnerEv: "请勾选至少一位获胜的玩家。",
      needSide: "请给 {name} 选择阵营。",
      needWinSide: "请选择哪一方获胜。",
      needCoopEv: "请选择合作成功还是失败。",
      badCoopScore: "{label}要是 {min}–{max} 的整数（也可以不填）。",
      pickSide: "选择阵营",
      startGame: "▶ 开始对局",
      startAnother: "▶ 开始新的一局",
      gameN: "第 {n} 局",
      gameAt: "{t} 开始",
      pendingScores: "⏳ 等待填写分数",
      fillScores: "✏️ 填写分数",
      editScores: "修改分数",
      cancelGame: "取消这局",
      cancelGameConfirm: "取消第 {n} 局？这一局的记录会被删除。",
      gameCancelled: "✓ 已取消这一局",
      viewRecords: "查看战绩 ↗",
      gamesHintDay: "活动当天，开桌人或管理员可以在这里开始对局，桌上的玩家会自动记进战绩记录。",
      gamesHintWho: "开桌人、管理员和这局里有账号的玩家（已登录）可以填分数。",
      startTitle: "开始「{game}」对局",
      startWho: "这一局谁来玩？",
      startHint: "默认是桌上所有人，可以取消勾选。开始后会马上记一条战绩记录，打完再填分数。",
      startAddLabel: "还有人没报名？在这里加上（有空位时）",
      startAddBtn: "＋ 加入",
      startSubmit: "▶ 开始",
      starting: "正在开始……",
      started: "✓ 已开始第 {n} 局，打完后点「填写分数」。",
      needPlayers: "至少选一位玩家。",
      addPlayer: "＋ 添加玩家",
      addPlayerTitle: "给「{game}」添加玩家",
      addHint: "给没在网上报名的人占个位置。之后开桌人或管理员可以把他移走。",
      addToGame: "同时加入第 {n} 局（还没填分数）",
      addSubmit: "添加",
      adding: "正在添加……",
      added: "✓ 已添加 {name}",
      scoreTitle: "第 {n} 局 · 填写分数",
      scoreHint: "填每位玩家的最终得分（整数，可以是负数）。分数最高的获胜，同分都算获胜。",
      scoreSave: "💾 保存分数",
      scoresSaved: "✓ 分数已保存，已更新到战绩记录",
      needScore: "请填写 {name} 的得分（-9999 到 9999 的整数）。",
      customNoRecord: "这款游戏不在桌游目录里，不能记录对局。",
      errStartHost: "只有开桌人或管理员可以开始对局、添加玩家（开桌人可能已经换人了）。",
      errNotToday: "只能在活动当天开始对局。",
      errTooManyGames: "这一桌的对局太多了。",
      errScoreLate: "活动结束 7 天后就不能再改分数了，请联系管理员。",
      errScoreBad: "分数要是 -9999 到 9999 的整数。",
      scoreNotAllowed: "只有开桌人、管理员或这局里有账号的玩家可以填分数，请先登录。",
      cancelGone: "这一局已经填了分数或已被取消，不能再取消。",
      notHost: "只有这一桌的开桌人或管理员可以这样做（开桌人可能已经换人了）。",
      tableDeleted: "✓ 已删除这一桌",
      editTime: "修改时间",
      timeTitle: "「{game}」几点开",
      timeHint: "清空表示不定时间。",
      timeSave: "💾 保存时间",
      timeSaved: "✓ 时间已更新",
      leaveTitle: "退出「{game}」这一桌",
      wishTitle: "💡 期望活动",
      wishIntro: "想参加什么样的活动？告诉我们！",
      wishNote: "备注：我们会根据情况决定是否采纳举办，提交期望活动不代表一定会举办。",
      wishAdd: "＋ 提议活动",
      wishEmpty: "还没有人提议，来提第一个吧！",
      wishFormTitle: "提议期望活动",
      wishName: "你的名字",
      wishWhat: "期望活动名称",
      wishWhatPh: "例如：狼人杀之夜、新手教学日",
      wishDesc: "活动简介（可不填）",
      wishDescPh: "想怎么玩、大概什么时候、适合谁……",
      wishSubmit: "💡 提交",
      wishThanks: "✓ 谢谢！你的期望活动已提交。",
      wishAdopted: "✓ 已采纳",
      wishBy: "{name} 提议 · {date}",
      wishRejected: "未采纳",
      wishAdopt: "✓ 采纳",
      wishReject: "✕ 不采纳",
      wishReopen: "改回待定",
      wishDelete: "删除",
      wishEdit: "修改",
      wishMine: "我提议的",
      wishEditTitle: "修改期望活动",
      wishSaved: "✓ 已保存修改",
      wishDeleted: "✓ 已删除这个期望活动",
      wishNotMine: "只有提议的人（同一个浏览器或同一个账号）或管理员可以这样做。",
      vote: "🙋 我也想参加 +1",
      voted: "✓ 我也想参加",
      votes: "{n} 人想参加",
      voteNo: "已不采纳，不能再 +1",
      errWishDeclined: "这个期望活动没有被采纳，不能再 +1。",
      wishDeleteConfirm: "删除期望活动「{title}」？",
      needWishTitle: "请填写期望活动名称。",
      errWishFlood: "刚才提交的人太多了，请一分钟后再试。",
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
      prevPage: "‹ Previous",
      nextPage: "Next ›",
      pageOf: "Page {n} of {m}",
      pastFailed: "Couldn't load past events: {msg}",
      today: "Today",
      tomorrow: "Tomorrow",
      inDays: "In {n} days",
      over: "Over",
      tables: "{n} tables",
      people: "{n} people coming",
      headcount: "👥 {n} people coming",
      peopleTitle: "Who's coming ({n})",
      peopleStaff: "organizer",
      peopleHidden: "Organizer (name not shown)",
      peopleExtra: "Plus {n} friends who didn't sign up",
      peopleNone: "Nobody has signed up yet.",
      extraField: "Friends who didn't sign up",
      extraHint: "When someone brings friends who didn't sign up online, enter how many here. They're added to the total.",
      extraSave: "💾 Save",
      badExtra: "Please enter a whole number from 0 to 200.",
      extraSaved: "✓ Headcount updated",
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
      gamesTitle: "🎮 Games played",
      playerName: "Name",
      otherPh: "e.g. Sam",
      needOtherName: "Please enter a name.",
      points: "{n} pts",
      fillResult: "✏️ Enter result",
      editResult: "Change result",
      resultTitle: "Game {n} · result",
      notScored: "This game isn't scored, so its games can't be recorded.",
      hintLowEv: "In this game the lowest score wins.",
      winWho: "Who won? (pick one or more)",
      sideOf: "{name}'s side",
      whichSide: "Which side won?",
      coopResult: "Result",
      coopWin: "✅ We won",
      coopLose: "❌ We lost",
      optional: " (optional)",
      teamWon: "🏆 {team} won",
      winTag: "Won",
      needWinnerEv: "Tick at least one winner.",
      needSide: "Pick a side for {name}.",
      needWinSide: "Pick the side that won.",
      needCoopEv: "Pick whether you won or lost.",
      badCoopScore: "{label} must be a whole number from {min} to {max} (or left empty).",
      pickSide: "Pick a side",
      startGame: "▶ Start a game",
      startAnother: "▶ Start another game",
      gameN: "Game {n}",
      gameAt: "started {t}",
      pendingScores: "⏳ Waiting for scores",
      fillScores: "✏️ Enter scores",
      editScores: "Change scores",
      cancelGame: "Cancel game",
      cancelGameConfirm: "Cancel game {n}? Its record will be deleted.",
      gameCancelled: "✓ Game cancelled",
      viewRecords: "Records ↗",
      gamesHintDay: "On the day, the host or an admin can start a game here: the players at the table go straight into the game records.",
      gamesHintWho: "The host, admins and signed-in players in the game can enter the scores.",
      startTitle: "Start a game of {game}",
      startWho: "Who's playing this game?",
      startHint: "Everyone at the table by default; untick anyone who isn't. A game record is saved right away; enter the scores when you finish.",
      startAddLabel: "Someone didn't sign up? Add them here (if there's a seat)",
      startAddBtn: "+ Add",
      startSubmit: "▶ Start",
      starting: "Starting…",
      started: "✓ Game {n} started. Tap \"Enter scores\" when you finish.",
      needPlayers: "Pick at least one player.",
      addPlayer: "+ Add player",
      addPlayerTitle: "Add a player to {game}",
      addHint: "Saves a seat for someone who didn't sign up online. The host or an admin can take them off again.",
      addToGame: "Also add them to game {n} (no scores yet)",
      addSubmit: "Add",
      adding: "Adding…",
      added: "✓ Added {name}",
      scoreTitle: "Game {n} · scores",
      scoreHint: "Each player's final score (a whole number, can be negative). The highest score wins; a tie means a shared win.",
      scoreSave: "💾 Save scores",
      scoresSaved: "✓ Scores saved to the game records",
      needScore: "Enter a score for {name} (a whole number from -9999 to 9999).",
      customNoRecord: "This game isn't in the catalogue, so its games can't be recorded.",
      errStartHost: "Only the table's host or an admin can start games and add players (the host may have changed).",
      errNotToday: "Games can only be started on the day of the event.",
      errTooManyGames: "Too many games at this table.",
      errScoreLate: "Scores can't be changed more than 7 days after the event. Please ask an admin.",
      errScoreBad: "Scores are whole numbers from -9999 to 9999.",
      scoreNotAllowed: "Only the host, an admin or a player in this game with an account can enter scores. Please sign in.",
      cancelGone: "This game already has scores or was cancelled, so it can't be cancelled.",
      notHost: "Only this table's host or an admin can do that (the host may have changed).",
      tableDeleted: "✓ Table deleted",
      editTime: "Change time",
      timeTitle: "When does {game} start?",
      timeHint: "Leave it empty for no set time.",
      timeSave: "💾 Save time",
      timeSaved: "✓ Time updated",
      leaveTitle: "Leave the {game} table",
      wishTitle: "💡 Event wishes",
      wishIntro: "What kind of event would you like? Tell us!",
      wishNote: "Note: we decide case by case whether to hold a suggested event. Suggesting one doesn't mean it will happen.",
      wishAdd: "+ Suggest an event",
      wishEmpty: "No suggestions yet. Be the first!",
      wishFormTitle: "Suggest an event",
      wishName: "Your name",
      wishWhat: "Event name",
      wishWhatPh: "e.g. Werewolf night, Beginners' day",
      wishDesc: "Description (optional)",
      wishDescPh: "How you'd like to play, roughly when, who it's for…",
      wishSubmit: "💡 Send",
      wishThanks: "✓ Thanks! Your suggestion was sent.",
      wishAdopted: "✓ Adopted",
      wishBy: "Suggested by {name} · {date}",
      wishRejected: "Declined",
      wishAdopt: "✓ Adopt",
      wishReject: "✕ Decline",
      wishReopen: "Back to undecided",
      wishDelete: "Delete",
      wishEdit: "Edit",
      wishMine: "Mine",
      wishEditTitle: "Edit suggestion",
      wishSaved: "✓ Changes saved",
      wishDeleted: "✓ Suggestion deleted",
      wishNotMine: "Only the person who suggested it (same browser or account) or an admin can do that.",
      vote: "🙋 I'd join too +1",
      voted: "✓ I'd join",
      votes: "{n} want to join",
      voteNo: "Declined, no more +1",
      errWishDeclined: "This suggestion was declined, so it can't get more +1s.",
      wishDeleteConfirm: "Delete the suggestion \"{title}\"?",
      needWishTitle: "Please enter the event name.",
      errWishFlood: "Too many suggestions just now. Please try again in a minute.",
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
  let profileNames = []; // their nickname and other names, lower case: a game with one of them is theirs to score
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
  // Only https links are used, even if something else got into the database (the database also checks this).
  const mapLink = (e) =>
    (/^https:\/\//i.test(e.map_url || "") ? e.map_url : "") ||
    (e.location ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.location) : "");
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
    if (code === "HVG01") return tr("errStartHost");
    if (code === "HVG02") return tr("errNotToday");
    if (code === "HVG03") return tr("customNoRecord");
    if (code === "HVG04") return tr("errTooManyGames");
    if (code === "HVG05") return tr("needPlayers");
    if (code === "HVG06") return tr("errScoreLate");
    if (code === "HVG07") return tr("errScoreBad");
    if (code === "score-not-allowed") return tr("scoreNotAllowed");
    if (code === "cancel-gone") return tr("cancelGone");
    if (code === "HVW01") return tr("errWishFlood");
    if (code === "HVW02") return tr("errWishDeclined");
    if (code === "wish-not-mine") return tr("wishNotMine");
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

  let wishes = null; // event wishes (期望活动), shown on the events list
  // 往期活动: 10 a page, each page loaded from the database only when it is shown; pages already loaded are kept.
  const PAST_PAGE = 10;
  const pastSt = { open: false, page: 1, total: 0, cache: {}, loading: false, err: null, shown: null };
  async function loadPast() {
    const page = pastSt.page;
    if (pastSt.cache[page]) return;
    pastSt.loading = true;
    pastSt.err = null;
    try {
      pastSt.cache[page] = await HVLoans.pastEvents(todayYmd(), (page - 1) * PAST_PAGE, PAST_PAGE);
      pastSt.total = pastSt.cache[page].total;
    } catch (err) {
      pastSt.err = err;
    }
    pastSt.loading = false;
  }
  async function showPast(page) {
    pastSt.page = page;
    if (!pastSt.cache[page]) {
      pastSt.loading = true;
      renderPast();
      await loadPast();
    }
    renderPast();
  }
  function pastBodyHtml() {
    if (pastSt.err) return `<p class="ev-msg is-err">${esc(tr("pastFailed", { msg: errText(pastSt.err) }))}</p><button class="btn ghost btn-sm" type="button" data-past-page="${pastSt.page}">${esc(tr("retry"))}</button>`;
    // While the next page loads, keep the one on screen (dimmed) so nothing jumps.
    const data = pastSt.cache[pastSt.page] || (pastSt.loading ? pastSt.shown : null);
    if (!data) return `<p class="ev-msg">${esc(tr("loading"))}</p>`;
    if (pastSt.cache[pastSt.page]) pastSt.shown = data;
    const pages = Math.max(1, Math.ceil(pastSt.total / PAST_PAGE));
    return `<div class="ev-list${pastSt.loading ? " is-loading" : ""}">${data.rows.map(eventCard).join("")}</div>
      ${pages > 1 ? `<nav class="ev-pager" aria-label="${esc(tr("past", { n: pastSt.total }))}">
        <button class="btn ghost btn-sm" type="button" data-past-page="${pastSt.page - 1}"${pastSt.page <= 1 || pastSt.loading ? " disabled" : ""}>${esc(tr("prevPage"))}</button>
        <span>${esc(tr("pageOf", { n: pastSt.page, m: pages }))}</span>
        <button class="btn ghost btn-sm" type="button" data-past-page="${pastSt.page + 1}"${pastSt.page >= pages || pastSt.loading ? " disabled" : ""}>${esc(tr("nextPage"))}</button>
      </nav>` : ""}`;
  }
  function renderPast() {
    const box = main.querySelector("[data-past-body]");
    if (box) box.innerHTML = pastBodyHtml();
  }
  let wishMine = new Set(); // ids this browser / account suggested
  let wishVoted = new Set(); // ids this browser / account gave a +1
  async function load() {
    loadErr = null;
    try {
      if (STAFF_VIEW) {
        if (isAdmin) staffRows = await HVLoans.staffList();
      } else if (EVENT_ID == null) {
        let st;
        let count;
        [events, wishes, st, count] = await Promise.all([
          HVLoans.events(todayYmd()),
          HVLoans.wishes().catch(() => null),
          HVLoans.wishState(token()).catch(() => null),
          HVLoans.pastEvents(todayYmd(), 0, 0).then((r) => r.total, () => 0), // just the count
        ]);
        pastSt.total = count;
        pastSt.cache = {}; // things may have changed (e.g. after an admin edit)
        if (pastSt.open) await loadPast();
        wishMine = new Set(((st && st.mine) || []).map(Number));
        wishVoted = new Set(((st && st.voted) || []).map(Number));
      }
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
    const people = HVLoans.headcount(e);
    return [tables.length ? tr("tables", { n: tables.length }) : tr("noTables"), people ? tr("people", { n: people }) : ""].filter(Boolean).join(" · ");
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
    const up = events.filter((e) => !isOver(e)); // already soonest first (only today and later are loaded)
    main.innerHTML = `
      <div class="ev-head">
        <h2>${esc(tr("upcoming"))}</h2>
        ${isAdmin ? `<span class="ev-head-acts"><a class="btn ghost" href="events.html?staff">${esc(tr("staffBtn"))}</a><button class="btn" type="button" data-new-event>${esc(tr("newEvent"))}</button></span>` : ""}
      </div>
      ${up.length ? `<div class="ev-list">${up.map(eventCard).join("")}</div>` : `<p class="ev-empty">${esc(tr("noUpcoming"))}</p>`}
      ${wishSection()}
      ${pastSt.total ? `<details class="ev-past" data-past${pastSt.open ? " open" : ""}><summary>${esc(tr("past", { n: pastSt.total }))}</summary><div data-past-body>${pastBodyHtml()}</div></details>` : ""}`;
    // events.html#wishes (from the home page): the section only exists now, so scroll to it once.
    if (location.hash === "#wishes" && !scrolledToWishes && $("wishes")) {
      scrolledToWishes = true;
      $("wishes").scrollIntoView();
    }
  }
  let scrolledToWishes = false;

  // ---------- event wishes (期望活动) ----------
  function wishCard(w) {
    const st = w.status;
    const mineW = wishMine.has(w.id);
    const voted = wishVoted.has(w.id);
    const badge = st === "adopted" ? `<span class="ev-wish-badge">${esc(tr("wishAdopted"))}</span>`
      : st === "rejected" ? `<span class="ev-wish-badge is-no">${esc(tr("wishRejected"))}</span>` : "";
    // A declined wish keeps its votes but takes no new ones (taking a vote back still works).
    const canVote = st !== "rejected" || voted;
    const voteBtn = `<button class="ev-vote${voted ? " is-on" : ""}" type="button" data-wish-vote="${w.id}" aria-pressed="${voted}"${canVote ? "" : " disabled"}>${esc(tr(voted ? "voted" : canVote ? "vote" : "voteNo"))}</button>`;
    const admin = isAdmin
      ? [st !== "adopted" && `<button class="link-btn" type="button" data-wish-status="adopted" data-id="${w.id}">${esc(tr("wishAdopt"))}</button>`,
         st !== "rejected" && `<button class="link-btn" type="button" data-wish-status="rejected" data-id="${w.id}">${esc(tr("wishReject"))}</button>`,
         st !== "open" && `<button class="link-btn" type="button" data-wish-status="open" data-id="${w.id}">${esc(tr("wishReopen"))}</button>`]
          .filter(Boolean).join("")
      : "";
    const own = mineW ? `<button class="link-btn" type="button" data-wish-edit="${w.id}">${esc(tr("wishEdit"))}</button>` : "";
    const del = mineW || isAdmin ? `<button class="link-btn" type="button" data-wish-delete="${w.id}">${esc(tr("wishDelete"))}</button>` : "";
    return `<article class="ev-wish${st === "adopted" ? " is-adopted" : st === "rejected" ? " is-rejected" : ""}${mineW ? " is-mine" : ""}">
      <div class="ev-wish-top"><h3>${esc(w.title)}</h3>${badge}${mineW ? `<span class="ev-wish-mine">${esc(tr("wishMine"))}</span>` : ""}</div>
      ${w.description ? `<p class="ev-wish-desc">${esc(w.description)}</p>` : ""}
      <p class="ev-wish-by">${esc(tr("wishBy", { name: w.name, date: fmtDate(w.created_at.slice(0, 10)) }))}</p>
      <div class="ev-wish-vote">${voteBtn}<span class="ev-wish-count">${esc(tr("votes", { n: w.votes || 0 }))}</span></div>
      ${admin || own || del ? `<p class="ev-admin-row">${own}${admin}${del}</p>` : ""}
    </article>`;
  }
  // Most votes first (the server's order); declined ones at the end.
  const wishOrder = (list) => [...list.filter((w) => w.status !== "rejected"), ...list.filter((w) => w.status === "rejected")];
  function wishSection() {
    if (wishes == null) return ""; // not set up yet (or couldn't load): leave the page as it was
    return `<section class="ev-wishes" id="wishes" aria-labelledby="ev-wishes-title">
      <div class="ev-head"><h2 id="ev-wishes-title">${esc(tr("wishTitle"))}</h2><button class="btn" type="button" data-wish-add>${esc(tr("wishAdd"))}</button></div>
      <p class="ev-hint">${esc(tr("wishIntro"))}</p>
      <p class="ev-wish-note">${esc(tr("wishNote"))}</p>
      ${flash ? `<p class="ev-msg ${flash.ok ? "is-ok" : "is-err"}" role="status">${esc(flash.text)}</p>` : ""}
      ${wishes.length ? `<div class="ev-wish-list">${wishOrder(wishes).map(wishCard).join("")}</div>` : `<p class="ev-empty">${esc(tr("wishEmpty"))}</p>`}
    </section>`;
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
      ${gamesHtml(t, g, iHost, over, full)}
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
  // ---------- games played at a table (对局) ----------
  const nameKey = (n) => String(n || "").trim().toLowerCase();
  const scorerUrl = (g) => (g.scorer ? g.scorer : `score.html?game=${encodeURIComponent(g.id)}`);
  // Expansions and other editions are recorded under their base game (the one their scorer page is for).
  const recordGameId = (g) => (/score\.html\?game=([a-z0-9-]+)/.exec(g.scorer || "") || [])[1] || g.id;
  const scoringOf = (g) => ((gameById(recordGameId(g)) || g).scoring || {});
  const scorable = (g) => g && scoringOf(g).mode !== "none" && !(g.tags || []).includes("Accessory");
  const recModeOf = (r) => (r.details && r.details.mode) || "high";
  const sideName = (g, key) => {
    const t = ((g && scoringOf(g).teams) || []).find((x) => x.key === key);
    return t ? (lang() === "zh" ? t.zh : t.en) : key || "";
  };
  const hostOf = (t) => (t.host_player != null ? t.host_player : t.event_players[0] && t.event_players[0].id);
  const iHostOf = (t) => hostOf(t) != null && mine.has(hostOf(t));
  const pendingGame = (t) => [...(t.event_games || [])].reverse().find((x) => x.game_scores.pending);
  // Who may enter a game's scores (the database checks again): admins, the host, and a signed-in player in the game —
  // by the sign-up at this table, or by one of their profile names. Not more than 7 days after the event (admins: always).
  function canScore(t, gm) {
    if (isAdmin) return true;
    if (daysAway(ev.event_date) < -7) return false;
    if (iHostOf(t)) return true;
    if (!HVLoans.user) return false;
    const names = new Set([...t.event_players.filter((p) => mine.has(p.id)).map((p) => nameKey(p.name)), ...profileNames]);
    return (gm.game_scores.players || []).some((p) => names.has(nameKey(p.name)));
  }
  function gameHtml(t, g, gm, n) {
    const r = gm.game_scores;
    const pending = r.pending;
    const list = (r.players || []).map((p, i) => ({ ...p, i }));
    const mode = recModeOf(r);
    const scored = mode === "high" || mode === "low";
    const det = r.details || {};
    const won = (p) => !pending && p.total === r.top_score && (mode !== "coop" || det.won);
    if (!pending) list.sort((a, b) => (scored ? (mode === "low" ? a.total - b.total : b.total - a.total) : won(b) - won(a)) || a.i - b.i);
    const state = pending ? tr("pendingScores")
      : mode === "teams" ? tr("teamWon", { team: sideName(g, det.winTeam) })
      : mode === "coop" ? `${tr(det.won ? "coopWin" : "coopLose")}${det.score != null ? ` · ${det.score}` : ""}`
      : `🏆 ${String(r.winner).split("、").join(lang() === "zh" ? "、" : ", ")}`;
    const val = (p) => (pending ? "–" : scored ? tr("points", { n: p.total }) : mode === "teams" ? sideName(g, p.team) : mode === "win" && won(p) ? tr("winTag") : "");
    // the button follows how the game is scored now (a game with no result yet has no method saved)
    const gmode = (g && scoringOf(g).mode) || "high";
    const fillKey = gmode === "high" || gmode === "low" ? ["fillScores", "editScores"] : ["fillResult", "editResult"];
    const run = isAdmin || iHostOf(t);
    const acts = [
      canScore(t, gm) ? `<button class="${pending ? "btn btn-sm" : "link-btn"}" type="button" data-score-game="${r.id}" data-table="${t.id}">${esc(tr(pending ? fillKey[0] : fillKey[1]))}</button>` : "",
      pending && run ? `<button class="link-btn" type="button" data-cancel-game="${r.id}" data-n="${n}">${esc(tr("cancelGame"))}</button>` : "",
      !pending && scorable(g) ? `<a class="link-btn" href="${esc(scorerUrl(g))}">${esc(tr("viewRecords"))}</a>` : "",
    ].filter(Boolean);
    return `<div class="ev-game${pending ? " is-pending" : ""}">
      <div class="ev-game-head"><b>${esc(tr("gameN", { n }))}</b><small>${esc(tr("gameAt", { t: new Date(gm.started_at).toLocaleTimeString(lang() === "zh" ? "zh-CN" : "en", { hour: "2-digit", minute: "2-digit" }) }))}</small>
        <span class="ev-game-state${!pending && mode === "coop" && !det.won ? " is-lost" : ""}">${esc(state)}</span></div>
      <ol class="ev-game-players">${list
        .map((p) => `<li class="${won(p) ? "is-win" : ""}"><span>${esc(p.name)}</span>${val(p) ? `<b>${esc(val(p))}</b>` : ""}</li>`)
        .join("")}</ol>
      ${acts.length ? `<div class="ev-game-acts">${acts.join("")}</div>` : ""}
    </div>`;
  }
  function gamesHtml(t, g, iHost, over, full) {
    const games = t.event_games || [];
    const run = isAdmin || iHost;
    const today = daysAway(ev.event_date) === 0;
    if (!games.length && !(run && !over)) return "";
    const btns = [
      run && today && scorable(g) ? `<button class="btn btn-sm" type="button" data-start-game="${t.id}">${esc(tr(games.length ? "startAnother" : "startGame"))}</button>` : "",
      run && !over && !full ? `<button class="btn ghost btn-sm" type="button" data-add-player="${t.id}">${esc(tr("addPlayer"))}</button>` : "",
    ].filter(Boolean);
    let hint = "";
    if (run && !g) hint = tr("customNoRecord");
    else if (run && !scorable(g)) hint = tr("notScored");
    else if (run && !today && !over && !games.length) hint = tr("gamesHintDay");
    else if (games.length && games.some((x) => x.game_scores.pending)) hint = tr("gamesHintWho");
    return `<section class="ev-games" aria-label="${esc(tr("gamesTitle"))}">
      <div class="ev-games-head"><h4>${esc(tr("gamesTitle"))}</h4>${btns.length ? `<div class="ev-games-btns">${btns.join("")}</div>` : ""}</div>
      ${games.map((gm, i) => gameHtml(t, g, gm, i + 1)).join("")}
      ${hint ? `<p class="ev-hint">${esc(hint)}</p>` : ""}
    </section>`;
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
        <p class="ev-when"><button class="link-btn ev-count" type="button" data-people>${esc(tr("headcount", { n: HVLoans.headcount(ev) }))}</button></p>
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
    if (D.mode === "wish") return renderWishForm();
    if (D.mode === "start") return renderStartForm();
    if (D.mode === "add") return renderAddForm();
    if (D.mode === "score") return renderScoreForm();
    if (D.mode === "people") return renderPeople();
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
  // Everyone coming to the event, each person once (organizers first), plus friends who didn't sign up.
  // Admins can change that number of friends here.
  function renderPeople() {
    if (!ev) return closeDialog();
    const list = HVLoans.attendees(ev);
    const extra = ev.extra_people || 0;
    const games = new Map(ev.event_tables.map((t) => [t.id, tableName(t)]));
    const rows = list
      .map((a) => {
        const name = a.name != null ? esc(a.name) : esc(tr("peopleHidden"));
        const tag = a.staff && a.name != null ? ` <small>· ${esc(tr("peopleStaff"))}</small>` : "";
        const at = a.tables.map((id) => games.get(id)).filter(Boolean);
        return `<li><b>${name}</b>${tag}${at.length ? `<br><small class="ev-hint">${esc(at.join("、"))}</small>` : ""}</li>`;
      })
      .join("");
    dlg.innerHTML = `${head(tr("peopleTitle", { n: HVLoans.headcount(ev) }))}
      ${list.length ? `<ol class="ev-people">${rows}</ol>` : extra ? "" : `<p class="ev-empty">${esc(tr("peopleNone"))}</p>`}
      ${extra ? `<p class="ev-hint">${esc(tr("peopleExtra", { n: extra }))}</p>` : ""}
      ${
        isAdmin
          ? `<form class="ev-form" data-people-form novalidate>
        <label class="ev-field"><span>${esc(tr("extraField"))}</span><input name="extra" type="number" min="0" max="200" step="1" inputmode="numeric" value="${esc(D.extra ?? extra)}"></label>
        <p class="ev-hint">${esc(tr("extraHint"))}</p>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("close"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("extraSave"))}</button></div>
      </form>`
          : `<div class="form-actions"><button class="btn ghost" type="button" data-close autofocus>${esc(tr("close"))}</button></div>`
      }`;
  }
  async function submitPeople() {
    readForm();
    D.err = "";
    const raw = String(D.extra ?? "").trim();
    const n = raw === "" ? 0 : Number(raw);
    if (!/^\d*$/.test(raw) || n > 200) {
      D.err = tr("badExtra");
      return renderDialog();
    }
    const id = ev.id;
    await submit(async () => {
      await HVLoans.setExtraPeople(id, n);
      flash = { text: tr("extraSaved"), ok: true };
    });
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
  // The host / an admin starts a game: everyone at the table is ticked; people who didn't sign up can be added here.
  function renderStartForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    const full = t.max_players != null && t.event_players.length >= t.max_players;
    const n = (t.event_games || []).length + 1;
    dlg.innerHTML = `${head(tr("startTitle", { game: tableName(t) }))}
      <form class="ev-form" data-start-form novalidate>
        <fieldset class="ev-field">
          <legend>${esc(tr("startWho"))} <small class="ev-count-pill">${esc(tr("gameN", { n }))}</small></legend>
          <div class="ev-leave-list">${t.event_players
            .map((p) => `<label class="ev-leave-opt"><input type="checkbox" name="pick" value="${p.id}"${D.picked.has(String(p.id)) ? " checked" : ""}><span>${esc(p.name)}</span></label>`)
            .join("")}</div>
        </fieldset>
        ${full ? "" : `<div class="ev-field"><span>${esc(tr("startAddLabel"))}</span>
          <div class="ev-inline-add"><input name="addname" maxlength="30" autocomplete="off" placeholder="${esc(tr("otherPh"))}" value="${esc(D.add || "")}"><button class="btn ghost btn-sm" type="button" data-start-add${busy ? " disabled" : ""}>${esc(tr("startAddBtn"))}</button></div></div>`}
        <p class="ev-hint">${esc(tr("startHint"))}</p>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("starting") : tr("startSubmit"))}</button></div>
      </form>`;
  }
  async function startAdd() {
    readForm();
    D.err = "";
    const name = String(D.add || "").trim().slice(0, 30);
    if (!name) {
      const i = dlg.querySelector("input[name=addname]");
      return i && i.focus();
    }
    if (busy) return;
    const state = D;
    busy = true;
    renderDialog();
    try {
      const id = await HVLoans.addTablePlayer(state.table, token(), name);
      state.picked.add(String(id));
      state.add = "";
    } catch (err) {
      state.err = errText(err);
    }
    busy = false;
    await load(); // redraws the dialog with the new player ticked
    if (D === state) {
      renderDialog();
      const i = dlg.querySelector("input[name=addname]");
      if (i) i.focus();
    }
  }
  async function submitStart() {
    readForm();
    D.err = "";
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    const ids = t.event_players.map((p) => p.id).filter((id) => D.picked.has(String(id)));
    if (!ids.length) {
      D.err = tr("needPlayers");
      return renderDialog();
    }
    const n = (t.event_games || []).length + 1;
    await submit(async () => {
      const g = t.game_id && gameById(t.game_id);
      const rec = g ? recordGameId(g) : null;
      await HVLoans.startGame(t.id, token(), ids.length === t.event_players.length ? null : ids, rec && rec !== t.game_id ? rec : null);
      flash = { text: tr("started", { n }), ok: true };
    });
  }
  // The host / an admin adds someone who didn't sign up; optionally into the game still waiting for scores.
  function renderAddForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    const gm = pendingGame(t);
    const n = gm ? t.event_games.indexOf(gm) + 1 : 0;
    dlg.innerHTML = `${head(tr("addPlayerTitle", { game: tableName(t) }))}
      <form class="ev-form" data-add-form novalidate>
        <label class="ev-field"><span>${esc(tr("playerName"))}</span><input name="name" maxlength="30" autocomplete="off" placeholder="${esc(tr("otherPh"))}" value="${esc(D.name || "")}" required autofocus></label>
        ${gm ? `<label class="ev-check"><input type="checkbox" name="togame"${D.toGame ? " checked" : ""}> <span>${esc(tr("addToGame", { n }))}</span></label>` : ""}
        <p class="ev-hint">${esc(tr("addHint"))}</p>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("adding") : tr("addSubmit"))}</button></div>
      </form>`;
  }
  async function submitAdd() {
    readForm();
    D.err = "";
    const name = String(D.name || "").trim().slice(0, 30);
    if (!name) {
      D.err = tr("needOtherName");
      return renderDialog();
    }
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    if (!t) return closeDialog();
    const gm = D.toGame ? pendingGame(t) : null;
    await submit(async () => {
      await HVLoans.addTablePlayer(t.id, token(), name, gm ? gm.score_id : null);
      flash = { text: tr("added", { name }), ok: true };
    });
  }
  // Scores for one game: one whole number per player, in the record's order.
  function renderScoreForm() {
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    const gm = t && (t.event_games || []).find((x) => x.score_id === D.score);
    if (!gm) return closeDialog();
    const n = t.event_games.indexOf(gm) + 1;
    const g = t.game_id && gameById(t.game_id);
    const sc = (g && scoringOf(g)) || {};
    const players = gm.game_scores.players;
    const radio = (name, value, label, on) => `<label class="ev-leave-opt"><input type="radio" name="${name}" value="${esc(value)}"${on ? " checked" : ""}><span>${esc(label)}</span></label>`;
    let body;
    if (D.mode2 === "win")
      body = `<fieldset class="ev-field"><legend>${esc(tr("winWho"))}</legend><div class="ev-leave-list">${players
        .map((p, i) => `<label class="ev-leave-opt"><input type="checkbox" name="w${i}"${D.won[i] ? " checked" : ""}><span>${esc(p.name)}</span></label>`)
        .join("")}</div></fieldset>`;
    else if (D.mode2 === "teams")
      body = `<div class="ev-score-list">${players
        .map((p, i) => `<label class="ev-score-row"><span>${esc(p.name)}</span><select name="t${i}" aria-label="${esc(tr("sideOf", { name: p.name }))}"><option value="">${esc(tr("pickSide"))}</option>${(sc.teams || [])
          .map((x) => `<option value="${esc(x.key)}"${D.teams[i] === x.key ? " selected" : ""}>${esc(lang() === "zh" ? x.zh : x.en)}</option>`)
          .join("")}</select></label>`)
        .join("")}</div>
        <fieldset class="ev-field"><legend>${esc(tr("whichSide"))}</legend><div class="ev-leave-list">${(sc.teams || [])
          .map((x) => radio("winteam", x.key, "🏆 " + (lang() === "zh" ? x.zh : x.en), D.winTeam === x.key))
          .join("")}</div></fieldset>`;
    else if (D.mode2 === "coop")
      body = `<fieldset class="ev-field"><legend>${esc(tr("coopResult"))}</legend><div class="ev-leave-list">${radio("coop", "yes", tr("coopWin"), D.coop === "yes")}${radio("coop", "no", tr("coopLose"), D.coop === "no")}</div></fieldset>
        ${sc.score ? `<label class="ev-field"><span>${esc(lang() === "zh" ? sc.score.zh : sc.score.en)}${esc(tr("optional"))}</span><input name="cs" type="number" step="1" min="${sc.score.min ?? 0}" max="${sc.score.max ?? 9999}" value="${esc(D.coopScore)}"></label>` : ""}`;
    else
      body = `<div class="ev-score-list">${players
        .map((p, i) => `<label class="ev-score-row"><span>${esc(p.name)}</span><input name="s${i}" type="number" step="1" min="-9999" max="9999" value="${esc(D.vals[i] ?? "")}"${i === 0 ? " autofocus" : ""}></label>`)
        .join("")}</div>
        <p class="ev-hint">${esc(D.mode2 === "low" ? tr("hintLowEv") : tr("scoreHint"))}</p>`;
    const scored = D.mode2 === "high" || D.mode2 === "low";
    dlg.innerHTML = `${head(tr(scored ? "scoreTitle" : "resultTitle", { n }))}
      <form class="ev-form" data-score-form novalidate>
        <p class="ev-hint">${esc(tableName(t))}</p>
        ${body}
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("scoreSave"))}</button></div>
      </form>`;
  }
  async function submitScores() {
    readForm();
    D.err = "";
    const t = ev && ev.event_tables.find((x) => x.id === D.table);
    const gm = t && (t.event_games || []).find((x) => x.score_id === D.score);
    if (!gm) return closeDialog();
    const players = gm.game_scores.players;
    const g = t.game_id && gameById(t.game_id);
    const sc = (g && scoringOf(g)) || {};
    const mode = D.mode2;
    const stop = (msg) => {
      D.err = msg;
      renderDialog();
    };
    let totals = [], teams = null, details = mode === "high" ? null : { mode };
    if (mode === "high" || mode === "low") {
      for (let i = 0; i < players.length; i++) {
        const v = String(D.vals[i] ?? "").trim();
        if (!/^-?\d{1,4}$/.test(v)) {
          stop(tr("needScore", { name: players[i].name }));
          const bad = dlg.querySelector(`input[name=s${i}]`);
          if (bad) bad.focus();
          return;
        }
        totals.push(Number(v));
      }
    } else if (mode === "win") {
      if (!D.won.some(Boolean)) return stop(tr("needWinnerEv"));
      totals = players.map((_, i) => (D.won[i] ? 1 : 0));
    } else if (mode === "teams") {
      const keys = (sc.teams || []).map((x) => x.key);
      const missing = players.findIndex((_, i) => !keys.includes(D.teams[i]));
      if (missing >= 0) return stop(tr("needSide", { name: players[missing].name }));
      if (!keys.includes(D.winTeam)) return stop(tr("needWinSide"));
      teams = players.map((_, i) => D.teams[i]);
      totals = teams.map((k) => (k === D.winTeam ? 1 : 0));
      details.winTeam = D.winTeam;
    } else if (mode === "coop") {
      if (!D.coop) return stop(tr("needCoopEv"));
      totals = players.map(() => (D.coop === "yes" ? 1 : 0));
      details.won = D.coop === "yes";
      const v = String(D.coopScore ?? "").trim();
      if (sc.score && v !== "") {
        const min = sc.score.min ?? 0, max = sc.score.max ?? 9999;
        if (!/^-?\d{1,4}$/.test(v) || Number(v) < min || Number(v) > max) return stop(tr("badCoopScore", { label: lang() === "zh" ? sc.score.zh : sc.score.en, min, max }));
        details.score = Number(v);
      }
    }
    await submit(async () => {
      if (!(await HVLoans.setGameScores(gm.score_id, token(), totals, teams, details))) throw Object.assign(new Error("not allowed"), { code: "score-not-allowed" });
      flash = { text: tr("scoresSaved"), ok: true };
    });
  }
  // Anyone: suggest an event (期望活动).
  function renderWishForm() {
    dlg.innerHTML = `${head(tr(D.id ? "wishEditTitle" : "wishFormTitle"))}
      <form class="ev-form" data-wish-form novalidate>
        <p class="ev-wish-note">${esc(tr("wishNote"))}</p>
        <label class="ev-field"><span>${esc(tr("wishName"))}</span><input name="name" maxlength="30" autocomplete="nickname" placeholder="${esc(tr("namePh"))}" value="${esc(D.name)}" required${D.name ? "" : " autofocus"}></label>
        <label class="ev-field"><span>${esc(tr("wishWhat"))}</span><input name="title" maxlength="80" placeholder="${esc(tr("wishWhatPh"))}" value="${esc(D.title)}" required${D.name ? " autofocus" : ""}></label>
        <label class="ev-field"><span>${esc(tr("wishDesc"))}</span><textarea name="desc" rows="4" maxlength="1000" placeholder="${esc(tr("wishDescPh"))}">${esc(D.desc)}</textarea></label>
        ${errLine()}
        <div class="form-actions"><button class="btn ghost" type="button" data-close>${esc(tr("cancel"))}</button><button class="btn" type="submit"${busy ? " disabled" : ""}>${esc(busy ? tr("saving") : tr("wishSubmit"))}</button></div>
      </form>`;
  }
  async function submitWish() {
    readForm();
    D.err = "";
    const name = checkName();
    const title = String(D.title || "").trim().slice(0, 80);
    if (name && !title) D.err = tr("needWishTitle");
    if (!name || D.err) return renderDialog();
    const desc = String(D.desc || "").trim().slice(0, 1000);
    const id = D.id;
    await submit(async () => {
      if (id) {
        if (!(await HVLoans.updateWish(id, name, title, desc, token()))) throw Object.assign(new Error("not mine"), { code: "wish-not-mine" });
        flash = { text: tr("wishSaved"), ok: true };
      } else {
        await HVLoans.addWish(name, title, desc, token());
        flash = { text: tr("wishThanks"), ok: true };
      }
      store.set("hv-event-name", name);
    });
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
    if (D.mode === "people") D.extra = v("extra");
    if (D.mode === "leave") D.next = (f.querySelector("input[name=next]:checked") || {}).value || "";
    if (D.mode === "host") D.host = (f.querySelector("input[name=host]:checked") || {}).value || "";
    if (D.mode === "wish") Object.assign(D, { name: v("name"), title: v("title"), desc: v("desc") });
    if (D.mode === "start") {
      D.picked = new Set([...f.querySelectorAll("input[name=pick]:checked")].map((x) => x.value));
      D.add = v("addname") || "";
    }
    if (D.mode === "add") Object.assign(D, { name: v("name"), toGame: Boolean(f.elements.togame && f.elements.togame.checked) });
    if (D.mode === "score") {
      if (D.mode2 === "high" || D.mode2 === "low") D.vals = D.vals.map((_, i) => v("s" + i));
      if (D.mode2 === "win") D.won = D.won.map((_, i) => Boolean(f.elements["w" + i] && f.elements["w" + i].checked));
      if (D.mode2 === "teams") {
        D.teams = D.teams.map((_, i) => v("t" + i) || "");
        D.winTeam = (f.querySelector("input[name=winteam]:checked") || {}).value || "";
      }
      if (D.mode2 === "coop") {
        D.coop = (f.querySelector("input[name=coop]:checked") || {}).value || "";
        D.coopScore = v("cs") ?? "";
      }
    }
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

  // "我也想参加 +1": only this wish's numbers change, so no full reload.
  async function toggleVote(id, btn) {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    try {
      const r = await HVLoans.toggleWishVote(id, token());
      const w = wishes.find((x) => x.id === id);
      if (w) w.votes = r.votes;
      r.voted ? wishVoted.add(id) : wishVoted.delete(id);
      flash = null;
    } catch (err) {
      flash = { text: errText(err), ok: false };
    }
    busy = false;
    render();
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
  main.addEventListener(
    "toggle", // <details> toggle doesn't bubble, so listen while capturing
    (e) => {
      if (!e.target.matches || !e.target.matches("[data-past]")) return;
      pastSt.open = e.target.open;
      if (pastSt.open && !pastSt.cache[pastSt.page]) showPast(pastSt.page);
    },
    true
  );
  main.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-retry")) {
      main.innerHTML = `<p class="ev-msg">${esc(tr("loading"))}</p>`;
      return void load();
    }
    if (b.dataset.copy != null) return copyText(b);
    if (b.hasAttribute("data-people")) return openDialog({ mode: "people" });
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
    if (b.dataset.pastPage) return pastSt.loading ? undefined : void showPast(Number(b.dataset.pastPage));
    if (b.hasAttribute("data-new-event")) return openEventForm(null);
    if (b.hasAttribute("data-wish-add")) return openDialog({ mode: "wish", name: myName(), title: "", desc: "", err: "" });
    if (b.dataset.wishStatus) return void act(() => HVLoans.setWishStatus(Number(b.dataset.id), b.dataset.wishStatus));
    if (b.dataset.wishEdit) {
      const w = (wishes || []).find((x) => x.id === Number(b.dataset.wishEdit));
      if (w) openDialog({ mode: "wish", id: w.id, name: w.name, title: w.title, desc: w.description, err: "" });
      return;
    }
    if (b.dataset.wishDelete) {
      const w = (wishes || []).find((x) => x.id === Number(b.dataset.wishDelete));
      if (!w || !confirm(tr("wishDeleteConfirm", { title: w.title }))) return;
      // The person who suggested it deletes it with their browser secret / account; admins delete directly.
      return void act(async () => {
        if (wishMine.has(w.id)) {
          if (!(await HVLoans.deleteOwnWish(w.id, token()))) throw Object.assign(new Error("not mine"), { code: "wish-not-mine" });
        } else await HVLoans.deleteWish(w.id);
      }, tr("wishDeleted"));
    }
    if (b.dataset.wishVote) return void toggleVote(Number(b.dataset.wishVote), b);
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
    if (b.dataset.startGame) {
      const t = tableOf(b.dataset.startGame);
      if (t) openDialog({ mode: "start", table: t.id, picked: new Set(t.event_players.map((p) => String(p.id))), add: "", err: "" });
      return;
    }
    if (b.dataset.addPlayer) {
      const t = tableOf(b.dataset.addPlayer);
      if (t) openDialog({ mode: "add", table: t.id, name: "", toGame: true, err: "" });
      return;
    }
    if (b.dataset.scoreGame) {
      const t = tableOf(b.dataset.table);
      const gm = t && (t.event_games || []).find((x) => x.score_id === Number(b.dataset.scoreGame));
      if (gm) {
        const r = gm.game_scores;
        const g = t.game_id && gameById(t.game_id);
        const mode2 = (g && scoringOf(g).mode) || "high";
        const det = r.details || {};
        const same = !r.pending && recModeOf(r) === mode2; // what's saved can fill the form
        openDialog({
          mode: "score",
          mode2,
          table: t.id,
          score: gm.score_id,
          vals: r.players.map((p) => (same ? String(p.total) : "")),
          won: r.players.map((p) => same && p.total === r.top_score),
          teams: r.players.map((p) => (same && p.team) || ""),
          winTeam: (same && det.winTeam) || "",
          coop: same && typeof det.won === "boolean" ? (det.won ? "yes" : "no") : "",
          coopScore: same && det.score != null ? String(det.score) : "",
          err: "",
        });
      }
      return;
    }
    if (b.dataset.cancelGame) {
      if (!confirm(tr("cancelGameConfirm", { n: b.dataset.n }))) return;
      const id = Number(b.dataset.cancelGame);
      return void act(async () => {
        if (!(await HVLoans.cancelGame(id, token()))) throw Object.assign(new Error("gone"), { code: "cancel-gone" });
      }, tr("gameCancelled"));
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
    if (e.target.closest("[data-start-add]") && D) return void startAdd();
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
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.name === "addname" && D && D.mode === "start") {
      e.preventDefault();
      startAdd();
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
    if (f.hasAttribute("data-wish-form")) return void submitWish();
    if (f.hasAttribute("data-start-form")) return void submitStart();
    if (f.hasAttribute("data-add-form")) return void submitAdd();
    if (f.hasAttribute("data-score-form")) return void submitScores();
    if (f.hasAttribute("data-people-form")) return void submitPeople();
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
    if (uid)
      HVLoans.profile(uid).then((p) => {
        profileName = (p && p.name) || "";
        profileNames = p ? [p.name, ...(p.aliases || [])].map(nameKey).filter(Boolean) : [];
        if (ev) render();
      }, () => {});
  }
  // The catalogue only matters for names and pictures, so the event shows first and fills in after.
  load();
  loadCatalog().then(render, render);
  // Pick up sign-ups made by others while the page is open.
  const refresh = () => document.visibilityState === "visible" && !dlg.open && !busy && load();
  document.addEventListener("visibilitychange", refresh);
  if (EVENT_ID != null) setInterval(refresh, 30000);
})();
