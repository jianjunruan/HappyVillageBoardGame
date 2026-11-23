// Werewolf judge's recorder (werewolf.html), linked from every 狼人杀 game ("judge" in data/games.json).
//
// Two views:
//   • the judge's view (only on the judge's phone): deal the roles, run each night step by step, the sheriff
//     election, vote counting, the hunter, knight, wolf beauty and idiot, a speaking timer, the full log and past games;
//   • the players' view: only what everyone may know — seats in or out, the sheriff, deaths announced in the morning,
//     every vote and its result, the timer; the roles only once the game is over. It shows on the judge's phone
//     ("在本机显示"), or on another screen (a TV, a tablet) through a 6-character room code:
//     werewolf.html?room=ABC123 (Supabase table werewolf_rooms, see supabase/schema.sql).
// The game is kept in this browser (localStorage) so a reload doesn't lose it; ↩︎ 撤销 undoes the last step.
(() => {
  const params = new URLSearchParams(location.search);
  const ROOM_VIEW = (params.get("room") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) || null;
  const GAME_ID = (params.get("game") || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const N = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0); // numbers from saved or shared state
  const lang = () => (window.HVI18n && HVI18n.lang === "en" ? "en" : "zh");

  // ---------- text ----------
  const STR = {
    zh: {
      title: "狼人杀法官记录器",
      pubTitle: "狼人杀 · 玩家看板",
      back: "← 返回桌游",
      toggle: "EN",
      toggleLabel: "Switch to English",
      undo: "↩︎ 撤销",
      timer: "⏱ 计时",
      show: "📺 玩家展示",
      seat: "{n}号",
      setup: "配置中",
      nightN: "第{n}夜",
      dayN: "第{n}天",
      setupLbl: "开局",
      tabGame: "流程",
      tabLog: "记录",
      tabMore: "设置",
      tabHistory: "历史",
      // setup
      board: "板子",
      players: "人数",
      wolves: "普通狼人",
      vils: "平民数",
      selfSave: "女巫自救",
      firstOnly: "仅首夜",
      never: "不可",
      always: "可以",
      winRule: "胜利条件",
      side: "屠边",
      city: "屠城",
      charmRepeat: "狼美人连续魅惑同一人",
      duelCharm: "骑士决斗狼美人时",
      noCharmDie: "不殉情",
      charmDie: "殉情",
      ruleBeauty: "狼美人：每晚魅惑一人，狼美人出局时被魅惑者殉情（殉情不能发动技能）；狼美人不能自爆。骑士：白天发言阶段可翻牌决斗一次，决斗到狼则狼出局并立即天黑，决斗到好人则骑士以死谢罪。",
      ruleIdiot: "白痴：被投票放逐时翻牌免死，之后留在场上但不能再投票；被狼刀、被毒照常出局。",
      deal: "🃏 发身份",
      dealHint: "先选身份，再点座位号。或者直接随机发牌。",
      clear: "清除",
      random: "🎲 随机发牌",
      start: "开始游戏 · 天黑请闭眼",
      historyCard: "📚 历史对局",
      historyCount: "共保存 {n} 局（最多 30 局）。",
      historyOpen: "查看上一局及历史记录",
      iAmPlayer: "📺 玩家看板",
      iAmPlayerHint: "在另一台设备（电视、平板、手机）上看投票结果：输入法官给的房间号。",
      roomCode: "房间号",
      open: "打开",
      // night
      deadNote: "⚠️ {role}（{seat}）已出局，照常念流程，假装等待即可。",
      wolfOpen: "🐺 狼人请睁眼",
      wolfHint: "存活狼人：{list}。请选择今晚要击杀的玩家。",
      noKill: "空刀",
      confirmKill: "确认击杀 {s}",
      beautyOpen: "💋 狼美人请睁眼",
      beautyHint: "请选择今晚要魅惑的玩家（不能魅惑自己{ban}）。",
      beautyBan: "；不能连续魅惑 {s}",
      confirmCharm: "确认魅惑 {s}",
      next: "下一步",
      witchOpen: "🧪 女巫请睁眼",
      anti: "💊 解药",
      poison: "☠️ 毒药",
      downTonight: "今晚倒牌：{s}",
      nobody: "空刀（无人）",
      antiUsed: "解药已用，不再告知刀口。",
      noSelfSave: "女巫自己被刀，按规则不能自救。",
      poisonHint: "要用毒药就点一个座位（同一晚不能双药）。",
      save: "💊 救 {s}",
      usePoison: "☠️ 毒 {s}",
      noPotion: "不使用",
      seerOpen: "🔮 预言家请睁眼",
      seerHint: "请选择要查验的玩家。",
      check: "查验 {s}",
      isWolf: "👎 狼人",
      isGood: "👍 好人",
      hunterOpen: "🔫 猎人请睁眼",
      cantShoot: "✋ 今晚不能开枪",
      canShoot: "👍 可以开枪",
      hunterHint: "给猎人（{s}）比手势告知开枪状态。",
      hunterCharmed: "⚠️ 猎人今晚被魅惑，若因殉情出局则不能开枪。",
      dawn: "🌅 天亮总结（仅法官可见）",
      kill: "狼刀",
      charm: "狼美人",
      witch: "女巫",
      seer: "预言家",
      saved: "救人",
      poisoned: "毒 {s}",
      noUse: "未用药",
      deadLast: "昨夜死亡：{list}",
      peaceful: "昨夜是平安夜",
      dayBreak: "☀️ 天亮了",
      stepWolf: "狼人",
      stepBeauty: "狼美人",
      stepWitch: "女巫",
      stepSeer: "预言家",
      stepHunter: "猎人",
      stepDawn: "天亮",
      // day
      hunterSkill: "🔫 猎人 {s} 发动技能",
      hunterSkillHint: "选择带走一名玩家，或选择不开枪。",
      noShoot: "不开枪",
      shoot: "带走 {s}",
      badgePass: "👮 警长 {s} 移交警徽",
      tearBadge: "撕警徽",
      passTo: "移交给 {s}",
      announceTitle: "📢 公布昨夜信息",
      announceBtn: "公布",
      lastNight: "📢 昨夜",
      died: "死亡：{list}",
      peace: "平安夜",
      lastWords: "首夜死亡玩家有遗言。",
      exileVote: "🗳️ 放逐投票",
      exileHint: "发言结束后开始记票。",
      sheriffWeight: "警长 {s} 1.5 票。",
      duelBtn: "⚔️ 骑士翻牌决斗",
      startVote: "开始投票",
      explodeBtn: "💥 狼人自爆",
      dayEnd: "🌙 白天结束",
      toNight: "天黑请闭眼 → 第{n}夜",
      winGood: "🏆 好人阵营胜利",
      winWolf: "🐺 狼人阵营胜利",
      winHint: "如判定有误可点「撤销」；也可继续记录。",
      newGame: "新的一局",
      status: "全场状态",
      w: "🐺 狼 {n}",
      g: "⭐ 神 {n}",
      v: "👤 民 {n}",
      antiShort: "解药",
      poisonShort: "毒药",
      // election
      electSignup: "👮 警长竞选 · 上警",
      electSignupHint: "点选举手上警的玩家（再点取消）。",
      upDown: "上警：{up}　警下：{down}",
      noCand: "无人上警",
      confirmCands: "确认上警（{n}人）",
      electSpeech: "👮 警上发言 · 退水",
      electSpeechHint: "上警：{list}。发言中有人退水就点他（再点取消）。退水玩家不能投票。",
      withdrawn: "退水",
      onStage: "警上",
      startElectVote: "发言结束，开始投票",
      explodeElect: "💥 狼人自爆（竞选中）",
      none: "无",
      // votes
      sheriffVote: "👮 警长投票",
      pkTag: "（PK）",
      voteHint: "先选「投几号」，再点投给他的玩家。",
      voteHintS: "警下玩家投票。",
      pkHintS: " PK 后仍平票则警徽流失。",
      pkHintE: " PK 后仍平票则无人出局。",
      voteFor: "投 {s}",
      abstain: "弃票",
      notVoted: "未投",
      abstShort: "弃",
      cand: "候选",
      restAbstain: "剩余未投 → 弃票",
      clearVotes: "清空重投",
      votes: "{n}票",
      abstNot: "弃票/未投",
      tie: "⚖️ 平票：{list}（{n}票）",
      electOk: "确认 {s} 当选警长",
      exileOk: "确认放逐 {s}",
      goPk: "平票 → {list} PK",
      badgeLostBtn: "警徽流失",
      noExileBtn: "无人出局",
      // modals
      explodeWho: "💥 哪位狼人自爆？",
      explodeHint: "自爆后直接进入黑夜。狼美人不能自爆。",
      explodeElectHint: "竞选中自爆，警徽流失。",
      cancel: "取消",
      duelWho: "⚔️ 骑士 {s} 决斗谁？",
      duelHint: "狼人阵营（含狼美人）→ 对方出局，立即天黑；好人 → 骑士以死谢罪，继续发言。",
      // log
      logTitle: "📜 对局记录",
      noLog: "暂无记录",
      copyLog: "📋 复制记录",
      copied: "✅ 已复制",
      copyFail: "复制失败",
      outList: "⚰️ 出局名单",
      // settings
      settings: "⚙️ 设置",
      hideRoles: "隐藏座位上的身份（防偷看）",
      knightSkill: "骑士技能",
      used: "已使用",
      unused: "未使用",
      curCharm: "当前魅惑",
      curSheriff: "当前警长",
      endGame: "结束本局 / 新开一局",
      newConfirm: "确定开新局？",
      newConfirmHint: "当前对局会存入「历史」，然后开始新的一局（座位人数和规则保留）。",
      ok: "确定",
      // history
      backSetup: "← 返回配置",
      noHistory: "还没有保存的对局。点「新开一局」时，当前对局会自动存进这里。",
      lastGame: "🆕 上一局 · ",
      rounds: "{n}轮",
      goodWin: "好人胜",
      wolfWin: "狼人胜",
      undecided: "未分胜负",
      copyGame: "📋 复制这局记录",
      del: "🗑 删除",
      delConfirm: "删除这局记录？",
      delHint: "{t} 的对局，删除后不能恢复。",
      // timer
      speaking: "正在发言",
      noSpeaker: "未选发言人",
      timeUp: "时间到！",
      collapse: "收起",
      sec: "{n}秒",
      plus15: "+15秒",
      pause: "⏸ 暂停",
      resume: "▶ 继续",
      go: "▶ 开始",
      reset: "↺ 重置",
      prev: "◀ 逆序",
      nextSpk: "下一位 ▶",
      // players' screen
      showTitle: "📺 给玩家看的画面",
      showHint: "玩家画面只显示公开信息：存活、警长、公布的死亡、投票结果和计时；身份到游戏结束才公开。",
      showLocal: "在本机显示玩家画面",
      showRemote: "在其他设备显示（电视、平板）",
      showRemoteHint: "开启后会得到一个房间号，其他设备打开下面的网址就能实时看到。",
      roomOn: "房间号",
      roomLink: "玩家看板网址",
      copyLink: "🔗 复制网址",
      roomClose: "关闭其他设备展示",
      roomOpening: "正在开启……",
      roomFail: "开启失败：{msg}",
      roomGone: "这个房间已经过期，请重新开启。",
      roomSync: "已同步",
      roomNoBackend: "这个功能需要连接数据库（Supabase）。",
      backJudge: "← 返回法官画面",
      peekWarn: "确定回到法官画面？法官画面会显示所有身份。",
      // players' screen content
      pubNight: "🌙 天黑请闭眼",
      pubNightHint: "夜晚进行中……",
      pubWaiting: "等待法官开始游戏",
      pubDeaths: "昨夜出局",
      pubNoDeaths: "昨夜是平安夜",
      pubNotYet: "等待法官公布昨夜信息",
      pubSheriff: "👮 警长：{s}",
      pubNoSheriff: "👮 暂无警长",
      pubLiveVote: "计票中",
      pubVotes: "🗳️ 投票记录",
      pubNoVotes: "还没有投票。",
      pubEvents: "📜 公开记录",
      pubSeats: "座位",
      pubAlive: "存活 {n} 人",
      pubRoles: "身份公开",
      pubRoom: "房间 {code}",
      pubLoading: "正在连接房间……",
      pubNoRoom: "找不到房间 {code}，可能已经过期，或者房间号输错了。",
      pubOffline: "连不上网络，正在重试……",
      pubCands: "上警：{list}",
      pubWithdrawn: "退水：{list}",
      pubElect: "👮 警长竞选中",
      pubPending: "等待法官处理……",
      out: "出局",
      // causes
      c_duel: "被骑士决斗",
      c_duelFail: "决斗失败以死谢罪",
      c_charm: "殉情",
      c_wolf: "被狼刀",
      c_poison: "被毒",
      c_exile: "被放逐",
      c_shot: "被猎人带走",
      c_explode: "自爆",
      // log events
      e_start: "🎲 游戏开始：{list}",
      e_night: "{parts}",
      p_kill: "🔪 狼刀：{s}",
      p_save: "💊 女巫救人",
      p_poison: "☠️ 女巫毒 {s}",
      p_charm: "💋 狼美人魅惑 {s}",
      p_check: "🔮 预言家验 {s} → {res}",
      wolfWord: "狼人",
      goodWord: "好人",
      e_death: "💀 {s} {cause}出局",
      e_hunterPoison: "🔫 猎人被毒，不能开枪",
      e_hunterCharm: "🔫 猎人殉情，不能开枪",
      e_beautyDuel: "💋 狼美人被骑士决斗，{s} 不殉情",
      e_beautyCharm: "💋 狼美人出局，被魅惑的 {s} 殉情",
      e_win_good: "🏆 狼人全部出局，好人胜利",
      e_win_god: "🏆 神职全部出局，狼人胜利",
      e_win_vil: "🏆 平民全部出局，狼人胜利",
      e_win_all: "🏆 好人全部出局，狼人胜利",
      e_sheriff: "👮 {s} 当选警长",
      e_badgeLost: "👮 警徽流失",
      e_noCand: "🙋 无人上警",
      e_cands: "🙋 上警：{up}；警下：{down}",
      e_withdraw: "↩️ 退水：{list}",
      e_allWithdraw: "所有人退水",
      e_autoSheriff: "{s} 唯一留在警上，自动当选",
      e_vote: "🗳️ {kind}{pk}：{rows}{abst}",
      k_sheriff: "警长投票",
      k_exile: "放逐投票",
      noVotesYet: "无人得票",
      abstList: "；弃票：{list}",
      e_pk: "⚔️ {list} 平票，进入PK发言",
      e_noExile: "🗳️ 无人出局",
      e_exiled: "🗳️ {s} 被放逐出局",
      e_shot: "🔫 猎人 {h} 开枪带走 {t}",
      e_noShot: "🔫 猎人 {h} 不开枪",
      e_badge: "👮 警徽移交给 {s}",
      e_badgeTorn: "👮 警徽被撕毁",
      e_explode: "💥 {s} 狼人自爆",
      e_duelWolf: "⚔️ 骑士 {k} 决斗 {t}：是狼人！",
      e_duelGood: "⚔️ 骑士 {k} 决斗 {t}：是好人，骑士以死谢罪",
      e_duelNight: "🌙 骑士决斗成功，立即进入黑夜",
      e_idiot: "🃏 {s} 翻牌：白痴免死，留在场上但不能再投票",
      e_announce: "📢 昨夜死亡：{list}",
      e_announcePeace: "📢 昨夜是平安夜",
      e_out: "💀 {s} 随之出局",
      logHead: "狼人杀记录（{board}）",
      result: "结果：{r}",
    },
    en: {
      title: "Werewolf judge",
      pubTitle: "Werewolf · players' board",
      back: "← Back to games",
      toggle: "中文",
      toggleLabel: "切换到中文",
      undo: "↩︎ Undo",
      timer: "⏱ Timer",
      show: "📺 Players' screen",
      seat: "#{n}",
      setup: "Setting up",
      nightN: "Night {n}",
      dayN: "Day {n}",
      setupLbl: "Start",
      tabGame: "Game",
      tabLog: "Log",
      tabMore: "Settings",
      tabHistory: "History",
      board: "Board",
      players: "Players",
      wolves: "Werewolves",
      vils: "Villagers",
      selfSave: "Witch saves herself",
      firstOnly: "Night 1 only",
      never: "Never",
      always: "Always",
      winRule: "Wolves win when",
      side: "a side is gone",
      city: "all good are gone",
      charmRepeat: "Charm the same player twice in a row",
      duelCharm: "When the knight duels the wolf beauty",
      noCharmDie: "charmed player lives",
      charmDie: "charmed player dies",
      ruleBeauty: "Wolf beauty: charms a player each night; when she is out, the charmed player dies with her (and can't use a skill); she can't self-destruct. Knight: once, during the day's talk, may duel a player: a wolf is out and night falls at once; a good player means the knight dies instead.",
      ruleIdiot: "Idiot: when voted out, reveals the card and stays, but can no longer vote; dies as usual to wolves or poison.",
      deal: "🃏 Deal roles",
      dealHint: "Pick a role, then tap seats. Or deal at random.",
      clear: "Clear",
      random: "🎲 Deal at random",
      start: "Start · night falls",
      historyCard: "📚 Past games",
      historyCount: "{n} games kept (up to 30).",
      historyOpen: "See the last game and history",
      iAmPlayer: "📺 Players' board",
      iAmPlayerHint: "Watch votes on another device (TV, tablet, phone): enter the room code from the judge.",
      roomCode: "Room code",
      open: "Open",
      deadNote: "⚠️ The {role} ({seat}) is out: call this step as usual and pretend to wait.",
      wolfOpen: "🐺 Werewolves, wake up",
      wolfHint: "Werewolves alive: {list}. Pick tonight's victim.",
      noKill: "No kill",
      confirmKill: "Kill {s}",
      beautyOpen: "💋 Wolf beauty, wake up",
      beautyHint: "Pick a player to charm (not herself{ban}).",
      beautyBan: "; not {s} again",
      confirmCharm: "Charm {s}",
      next: "Next",
      witchOpen: "🧪 Witch, wake up",
      anti: "💊 Antidote",
      poison: "☠️ Poison",
      downTonight: "Tonight's victim: {s}",
      nobody: "nobody (no kill)",
      antiUsed: "The antidote is used: the victim isn't shown any more.",
      noSelfSave: "The witch was attacked and the rules don't let her save herself.",
      poisonHint: "To poison, tap a seat (only one potion a night).",
      save: "💊 Save {s}",
      usePoison: "☠️ Poison {s}",
      noPotion: "No potion",
      seerOpen: "🔮 Seer, wake up",
      seerHint: "Pick a player to check.",
      check: "Check {s}",
      isWolf: "👎 Werewolf",
      isGood: "👍 Good",
      hunterOpen: "🔫 Hunter, wake up",
      cantShoot: "✋ Can't shoot tonight",
      canShoot: "👍 Can shoot",
      hunterHint: "Signal the hunter ({s}) whether they can shoot.",
      hunterCharmed: "⚠️ The hunter is charmed tonight: dying with the wolf beauty means no shot.",
      dawn: "🌅 Night summary (judge only)",
      kill: "Werewolves",
      charm: "Wolf beauty",
      witch: "Witch",
      seer: "Seer",
      saved: "saved",
      poisoned: "poisoned {s}",
      noUse: "no potion",
      deadLast: "Out last night: {list}",
      peaceful: "Nobody died last night",
      dayBreak: "☀️ Day breaks",
      stepWolf: "Wolves",
      stepBeauty: "Beauty",
      stepWitch: "Witch",
      stepSeer: "Seer",
      stepHunter: "Hunter",
      stepDawn: "Dawn",
      hunterSkill: "🔫 Hunter {s} shoots",
      hunterSkillHint: "Pick a player to take along, or no shot.",
      noShoot: "No shot",
      shoot: "Shoot {s}",
      badgePass: "👮 Sheriff {s} passes the badge",
      tearBadge: "Tear up the badge",
      passTo: "Give to {s}",
      announceTitle: "📢 Announce last night",
      announceBtn: "Announce",
      lastNight: "📢 Last night",
      died: "Out: {list}",
      peace: "Nobody died",
      lastWords: "Players out on night 1 give last words.",
      exileVote: "🗳️ Exile vote",
      exileHint: "Count the votes after everyone has spoken.",
      sheriffWeight: "Sheriff {s} counts 1.5.",
      duelBtn: "⚔️ Knight duels",
      startVote: "Start the vote",
      explodeBtn: "💥 Werewolf self-destructs",
      dayEnd: "🌙 End of the day",
      toNight: "Night falls → night {n}",
      winGood: "🏆 The good side wins",
      winWolf: "🐺 The werewolves win",
      winHint: "If this is wrong, tap Undo; you can also keep recording.",
      newGame: "New game",
      status: "Table",
      w: "🐺 Wolves {n}",
      g: "⭐ Gods {n}",
      v: "👤 Villagers {n}",
      antiShort: "Antidote",
      poisonShort: "Poison",
      electSignup: "👮 Sheriff election · candidates",
      electSignupHint: "Tap players who raise a hand to run (tap again to undo).",
      upDown: "Running: {up}   Not running: {down}",
      noCand: "Nobody runs",
      confirmCands: "Confirm ({n})",
      electSpeech: "👮 Candidates speak · withdrawals",
      electSpeechHint: "Running: {list}. Tap anyone who withdraws (tap again to undo). They can't vote.",
      withdrawn: "Withdrew",
      onStage: "Running",
      startElectVote: "Speeches done, vote",
      explodeElect: "💥 Werewolf self-destructs (election)",
      none: "none",
      sheriffVote: "👮 Sheriff vote",
      pkTag: " (run-off)",
      voteHint: "Pick \"Vote for\", then tap the players voting for them.",
      voteHintS: "Players not running vote.",
      pkHintS: " Still tied after the run-off: no sheriff.",
      pkHintE: " Still tied after the run-off: nobody is out.",
      voteFor: "For {s}",
      abstain: "Abstain",
      notVoted: "—",
      abstShort: "abst.",
      cand: "running",
      restAbstain: "Rest → abstain",
      clearVotes: "Clear votes",
      votes: "{n} votes",
      abstNot: "Abstained / no vote",
      tie: "⚖️ Tie: {list} ({n} votes)",
      electOk: "{s} becomes sheriff",
      exileOk: "Exile {s}",
      goPk: "Tie → run-off {list}",
      badgeLostBtn: "No sheriff",
      noExileBtn: "Nobody out",
      explodeWho: "💥 Which werewolf self-destructs?",
      explodeHint: "Night falls at once. The wolf beauty can't self-destruct.",
      explodeElectHint: "During the election: no sheriff.",
      cancel: "Cancel",
      duelWho: "⚔️ Knight {s} duels whom?",
      duelHint: "Werewolf side (incl. wolf beauty) → out, night falls at once; good → the knight dies, talk goes on.",
      logTitle: "📜 Game log",
      noLog: "Nothing yet",
      copyLog: "📋 Copy log",
      copied: "✅ Copied",
      copyFail: "Couldn't copy",
      outList: "⚰️ Out",
      settings: "⚙️ Settings",
      hideRoles: "Hide roles on the seats (against peeking)",
      knightSkill: "Knight's duel",
      used: "used",
      unused: "not used",
      curCharm: "Charmed now",
      curSheriff: "Sheriff",
      endGame: "End this game / new game",
      newConfirm: "Start a new game?",
      newConfirmHint: "This game goes into History, then a new one starts (same seats and rules).",
      ok: "OK",
      backSetup: "← Back to setup",
      noHistory: "No saved games yet. Starting a new game saves the current one here.",
      lastGame: "🆕 Last game · ",
      rounds: "{n} rounds",
      goodWin: "Good wins",
      wolfWin: "Wolves win",
      undecided: "Unfinished",
      copyGame: "📋 Copy this game",
      del: "🗑 Delete",
      delConfirm: "Delete this game?",
      delHint: "The game from {t} can't be brought back.",
      speaking: "Speaking",
      noSpeaker: "No speaker picked",
      timeUp: "Time's up!",
      collapse: "Hide",
      sec: "{n}s",
      plus15: "+15s",
      pause: "⏸ Pause",
      resume: "▶ Resume",
      go: "▶ Start",
      reset: "↺ Reset",
      prev: "◀ Back",
      nextSpk: "Next ▶",
      showTitle: "📺 The players' screen",
      showHint: "The players' screen shows only public information: who is in, the sheriff, announced deaths, votes and the timer. Roles appear when the game ends.",
      showLocal: "Show it on this phone",
      showRemote: "Show it on another device (TV, tablet)",
      showRemoteHint: "You'll get a room code; another device that opens the address below follows the game live.",
      roomOn: "Room code",
      roomLink: "Players' board address",
      copyLink: "🔗 Copy address",
      roomClose: "Stop showing on other devices",
      roomOpening: "Opening…",
      roomFail: "Couldn't open it: {msg}",
      roomGone: "This room has expired. Please open a new one.",
      roomSync: "synced",
      roomNoBackend: "This needs the database (Supabase).",
      backJudge: "← Back to the judge's view",
      peekWarn: "Back to the judge's view? It shows every role.",
      pubNight: "🌙 Night has fallen",
      pubNightHint: "The night is going on…",
      pubWaiting: "Waiting for the judge to start",
      pubDeaths: "Out last night",
      pubNoDeaths: "Nobody died last night",
      pubNotYet: "Waiting for the judge to announce last night",
      pubSheriff: "👮 Sheriff: {s}",
      pubNoSheriff: "👮 No sheriff",
      pubLiveVote: "counting",
      pubVotes: "🗳️ Votes",
      pubNoVotes: "No votes yet.",
      pubEvents: "📜 Public log",
      pubSeats: "Seats",
      pubAlive: "{n} alive",
      pubRoles: "Roles revealed",
      pubRoom: "Room {code}",
      pubLoading: "Connecting to the room…",
      pubNoRoom: "Room {code} wasn't found: it may have expired, or the code is wrong.",
      pubOffline: "No connection, trying again…",
      pubCands: "Running: {list}",
      pubWithdrawn: "Withdrew: {list}",
      pubElect: "👮 Sheriff election",
      pubPending: "Waiting for the judge…",
      out: "out",
      c_duel: "lost the knight's duel",
      c_duelFail: "knight's failed duel",
      c_charm: "died with the beauty",
      c_wolf: "killed by wolves",
      c_poison: "poisoned",
      c_exile: "exiled",
      c_shot: "shot by the hunter",
      c_explode: "self-destructed",
      e_start: "🎲 Game start: {list}",
      e_night: "{parts}",
      p_kill: "🔪 Wolves: {s}",
      p_save: "💊 Witch saved",
      p_poison: "☠️ Witch poisoned {s}",
      p_charm: "💋 Beauty charmed {s}",
      p_check: "🔮 Seer checked {s} → {res}",
      wolfWord: "werewolf",
      goodWord: "good",
      e_death: "💀 {s} out ({cause})",
      e_hunterPoison: "🔫 The hunter was poisoned and can't shoot",
      e_hunterCharm: "🔫 The hunter died with the beauty and can't shoot",
      e_beautyDuel: "💋 The beauty lost a duel: {s} lives",
      e_beautyCharm: "💋 The beauty is out: charmed {s} dies too",
      e_win_good: "🏆 All werewolves out: the good side wins",
      e_win_god: "🏆 All gods out: the werewolves win",
      e_win_vil: "🏆 All villagers out: the werewolves win",
      e_win_all: "🏆 All good players out: the werewolves win",
      e_sheriff: "👮 {s} becomes sheriff",
      e_badgeLost: "👮 No sheriff",
      e_noCand: "🙋 Nobody runs for sheriff",
      e_cands: "🙋 Running: {up}; not running: {down}",
      e_withdraw: "↩️ Withdrew: {list}",
      e_allWithdraw: "Everyone withdrew",
      e_autoSheriff: "{s} is the only candidate left and becomes sheriff",
      e_vote: "🗳️ {kind}{pk}: {rows}{abst}",
      k_sheriff: "Sheriff vote",
      k_exile: "Exile vote",
      noVotesYet: "no votes",
      abstList: "; abstained: {list}",
      e_pk: "⚔️ {list} tied: run-off speeches",
      e_noExile: "🗳️ Nobody is out",
      e_exiled: "🗳️ {s} is exiled",
      e_shot: "🔫 Hunter {h} shoots {t}",
      e_noShot: "🔫 Hunter {h} doesn't shoot",
      e_badge: "👮 Badge passed to {s}",
      e_badgeTorn: "👮 The badge is torn up",
      e_explode: "💥 Werewolf {s} self-destructs",
      e_duelWolf: "⚔️ Knight {k} duels {t}: a werewolf!",
      e_duelGood: "⚔️ Knight {k} duels {t}: good, so the knight dies",
      e_duelNight: "🌙 Duel won: night falls at once",
      e_idiot: "🃏 {s} reveals the Idiot: stays, but can't vote any more",
      e_announce: "📢 Out last night: {list}",
      e_announcePeace: "📢 Nobody died last night",
      e_out: "💀 {s} is out too",
      logHead: "Werewolf log ({board})",
      result: "Result: {r}",
    },
  };
  const tr = (k, v = {}) => (STR[lang()][k] ?? STR.zh[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => (v[x] ?? ""));

  // ---------- roles and boards ----------
  const ROLES = {
    wolf: { zh: "狼人", en: "Werewolf", c: "wolf", side: "wolf" },
    beauty: { zh: "狼美人", en: "Wolf Beauty", c: "wolf", side: "wolf" },
    vil: { zh: "平民", en: "Villager", c: "vil", side: "vil" },
    seer: { zh: "预言家", en: "Seer", c: "god", side: "god" },
    witch: { zh: "女巫", en: "Witch", c: "god", side: "god" },
    hunter: { zh: "猎人", en: "Hunter", c: "god", side: "god" },
    knight: { zh: "骑士", en: "Knight", c: "god", side: "god" },
    idiot: { zh: "白痴", en: "Idiot", c: "god", side: "god" },
  };
  const BOARDS = {
    beauty: { zh: "预女猎骑·狼美人", en: "Seer, Witch, Hunter, Knight · Wolf Beauty", specials: ["beauty", "seer", "witch", "hunter", "knight"], wolves: 3 },
    classic: { zh: "预女猎白", en: "Seer, Witch, Hunter, Idiot", specials: ["seer", "witch", "hunter", "idiot"], wolves: 4 },
  };
  const rn = (r) => (r && ROLES[r] ? ROLES[r][lang()] : "?");
  const boardName = (b) => (BOARDS[b] ? BOARDS[b][lang()] : "");
  const sideOf = (r) => (ROLES[r] ? ROLES[r].side : "vil");

  // ---------- state (the judge's phone) ----------
  const KEY = "hv-ww-judge-v1", ARCH = "hv-ww-judge-archive", RKEY = "hv-ww-room";
  const store = {
    get(k, d) {
      try {
        const v = JSON.parse(localStorage.getItem(k));
        return v ?? d;
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    },
  };
  let S, hist = [], tab = "game";
  const ui = { sel: null, brush: "wolf", tgt: undefined, open: null, viewer: false };
  let archive = store.get(ARCH, []);
  if (!Array.isArray(archive)) archive = [];

  function fresh(cfg) {
    return {
      phase: "setup", round: 1,
      cfg: cfg || { board: "beauty", n: 12, wolves: 3, vils: 4, duelCharm: false, charmRepeat: false, selfSave: "never", win: "side", hideRoles: false },
      players: [], witch: { anti: true, poison: true }, sheriff: null, sheriffDone: false,
      night: null, day: null, charm: null, knightUsed: false, pending: [], log: [], pub: [], winner: null,
      elect: { stage: "signup", cands: [], withdrawn: [] }, vote: null, seq: 0,
    };
  }
  const BOARD = () => BOARDS[S.cfg.board] || BOARDS.beauty;
  const has = (r) => r === "wolf" || r === "vil" || BOARD().specials.includes(r);
  function save() {
    store.set(KEY, { S, hist: hist.slice(-40) });
  }
  function load() {
    const d = store.get(KEY, null);
    if (d && d.S && d.S.cfg && BOARDS[d.S.cfg.board]) {
      S = d.S;
      hist = Array.isArray(d.hist) ? d.hist : [];
      if (!S.pub) S.pub = [];
      return;
    }
    S = fresh();
    initPlayers();
  }
  function snap() {
    hist.push(JSON.stringify(S));
    if (hist.length > 60) hist.shift();
  }
  function undo() {
    if (!hist.length) return;
    S = JSON.parse(hist.pop());
    ui.sel = null;
    render();
  }
  function act(fn) {
    snap();
    fn();
    S.seq = (S.seq || 0) + 1;
    ui.sel = null;
    ui.tgt = undefined;
    checkWin();
    render();
  }
  function initPlayers() {
    S.players = Array.from({ length: S.cfg.n }, (_, i) => ({ seat: i + 1, role: null, alive: true, cause: null, at: null, revealed: false }));
  }
  const P = (seat) => S.players.find((p) => p.seat === seat);
  const byRole = (r) => S.players.find((p) => p.role === r);
  const alive = () => S.players.filter((p) => p.alive);
  const isWolf = (s) => sideOf(P(s).role) === "wolf";
  const phaseKey = () => ({ ph: S.phase, r: S.round });
  // The judge's log, and the public log the players see (formatted in whichever language is on when shown).
  const L = (e, v = {}) => S.log.push({ k: phaseKey(), e, v });
  const PL = (e, v = {}) => S.pub.push({ k: phaseKey(), e, v });
  const LP = (e, v = {}) => (L(e, v), PL(e, v));
  const sortN = (a) => a.map(N).sort((x, y) => x - y);

  function phaseLabel(k) {
    if (!k) return "";
    return k.ph === "night" ? tr("nightN", { n: N(k.r) }) : k.ph === "day" ? tr("dayN", { n: N(k.r) }) : tr("setupLbl");
  }
  // "3号(预言家)" for the judge; "3号" in the public log (roleOf returns nothing there).
  function pn(seat, roleOf) {
    const r = roleOf ? roleOf(N(seat)) : null;
    return tr("seat", { n: N(seat) }) + (r ? (lang() === "zh" ? `(${rn(r)})` : ` (${rn(r)})`) : "");
  }
  const list = (a, roleOf) => (a && a.length ? sortN(a).map((s) => pn(s, roleOf)).join(lang() === "zh" ? "、" : ", ") : tr("none"));
  const judgeRole = (s) => (P(s) ? P(s).role : null);

  // One log entry as text. roleOf adds roles after seat numbers (judge only).
  function fmt(ev, roleOf) {
    const v = ev.v || {};
    const s = (x) => pn(x, roleOf);
    switch (ev.e) {
      case "start": return tr("e_start", { list: (v.list || []).map((x) => `${N(x.s)}${rn(x.r)}`).join(" ") });
      case "night": {
        const parts = [tr("p_kill", { s: v.kill ? s(v.kill) : tr("noKill") })];
        if (v.save) parts.push(tr("p_save"));
        if (v.poison) parts.push(tr("p_poison", { s: s(v.poison) }));
        if (v.charm) parts.push(tr("p_charm", { s: s(v.charm) }));
        if (v.check) parts.push(tr("p_check", { s: s(v.check), res: tr(v.res ? "wolfWord" : "goodWord") }));
        return parts.join(lang() === "zh" ? "；" : "; ");
      }
      case "death": return tr("e_death", { s: s(v.s), cause: tr("c_" + (CAUSES.includes(v.cause) ? v.cause : "wolf")) });
      case "hunterPoison": return tr("e_hunterPoison");
      case "hunterCharm": return tr("e_hunterCharm");
      case "beautyDuel": return tr("e_beautyDuel", { s: s(v.s) });
      case "beautyCharm": return tr("e_beautyCharm", { s: s(v.s) });
      case "win": return tr("e_win_" + (["good", "god", "vil", "all"].includes(v.w) ? v.w : "good"));
      case "sheriff": return v.s ? tr("e_sheriff", { s: s(v.s) }) : tr("e_badgeLost");
      case "noCand": return tr("e_noCand");
      case "cands": return tr("e_cands", { up: list(v.up, roleOf), down: list(v.down, roleOf) });
      case "withdraw": return tr("e_withdraw", { list: list(v.list, roleOf) });
      case "allWithdraw": return tr("e_allWithdraw");
      case "autoSheriff": return tr("e_autoSheriff", { s: s(v.s) });
      case "vote": {
        const rows = (v.rows || []).map((r) => `${s(r.c)} ${tr("votes", { n: N(r.score) })}（${(r.by || []).map((x) => tr("seat", { n: N(x) }) + (N(x) === N(v.sheriff) && v.kind === "exile" ? "👮" : "")).join(lang() === "zh" ? "、" : ", ")}）`);
        return tr("e_vote", {
          kind: tr(v.kind === "sheriff" ? "k_sheriff" : "k_exile"),
          pk: v.pk ? tr("pkTag") : "",
          rows: rows.join(lang() === "zh" ? "；" : "; ") || tr("noVotesYet"),
          abst: v.abst && v.abst.length ? tr("abstList", { list: list(v.abst) }) : "",
        });
      }
      case "pk": return tr("e_pk", { list: list(v.list, roleOf) });
      case "noExile": return tr("e_noExile");
      case "exiled": return tr("e_exiled", { s: s(v.s) });
      case "shot": return tr("e_shot", { h: s(v.h), t: s(v.t) });
      case "noShot": return tr("e_noShot", { h: s(v.h) });
      case "badge": return v.s ? tr("e_badge", { s: s(v.s) }) : tr("e_badgeTorn");
      case "explode": return tr("e_explode", { s: s(v.s) });
      case "badgeLost": return tr("e_badgeLost");
      case "duelWolf": return tr("e_duelWolf", { k: s(v.k), t: s(v.t) });
      case "duelGood": return tr("e_duelGood", { k: s(v.k), t: s(v.t) });
      case "duelNight": return tr("e_duelNight");
      case "idiot": return tr("e_idiot", { s: s(v.s) });
      case "announce": return v.list && v.list.length ? tr("e_announce", { list: list(v.list, roleOf) }) : tr("e_announcePeace");
      case "out": return tr("e_out", { s: s(v.s) });
      default: return "";
    }
  }
  const CAUSES = ["duel", "duelFail", "charm", "wolf", "poison", "exile", "shot", "explode"];
  const PUBLIC_CAUSES = ["exile", "shot", "explode", "duel", "duelFail"]; // night deaths stay "out"

  function needCounts() {
    const c = { wolf: S.cfg.wolves, vil: S.cfg.vils };
    BOARD().specials.forEach((r) => (c[r] = 1));
    return c;
  }
  function curCounts() {
    const c = {};
    Object.keys(needCounts()).forEach((k) => (c[k] = 0));
    S.players.forEach((p) => p.role && c[p.role] !== undefined && c[p.role]++);
    return c;
  }
  function setupOK() {
    const n = needCounts(), c = curCounts();
    return Object.keys(n).every((k) => n[k] === c[k]) && S.players.every((p) => p.role && has(p.role));
  }

  // ---------- deaths and the win ----------
  let applyingNight = false; // deaths announced in the morning go out as one public line
  function kill(seat, cause) {
    const p = P(seat);
    if (!p || !p.alive) return;
    p.alive = false;
    p.cause = cause;
    p.at = phaseKey();
    L("death", { s: seat, cause });
    if (cause === "charm" && !applyingNight) PL("out", { s: seat });
    if (p.role === "hunter") {
      if (cause === "poison") L("hunterPoison");
      else if (cause === "charm") L("hunterCharm");
      else S.pending.push({ type: "hunter", seat });
    }
    if (S.sheriff === seat) S.pending.push({ type: "badge", seat });
    if (p.role === "beauty" && S.charm && P(S.charm) && P(S.charm).alive) {
      if (cause === "duel" && !S.cfg.duelCharm) L("beautyDuel", { s: S.charm });
      else {
        L("beautyCharm", { s: S.charm });
        kill(S.charm, "charm");
      }
    }
  }
  function checkWin() {
    if (S.phase === "setup") return;
    const a = alive();
    const w = a.filter((p) => sideOf(p.role) === "wolf").length;
    const g = a.filter((p) => sideOf(p.role) === "god").length;
    const v = a.filter((p) => p.role === "vil").length;
    let win = null;
    if (w === 0) win = "good";
    else if (S.cfg.win === "side" ? g === 0 || v === 0 : g + v === 0) win = "wolf";
    if (win && !S.winner) {
      S.winner = win;
      LP("win", { w: win === "good" ? "good" : S.cfg.win === "city" ? "all" : g === 0 ? "god" : "vil" });
    }
    if (!win) S.winner = null;
  }

  // ---------- the game ----------
  function startGame() {
    act(() => {
      S.phase = "night";
      S.round = 1;
      startNight();
      L("start", { list: S.players.map((p) => ({ s: p.seat, r: p.role })) });
    });
  }
  function startNight() {
    S.night = { step: "wolf", kill: null, save: false, poison: null, check: null, charm: null };
    S.day = null;
  }
  function nightDeaths(n) {
    const d = [];
    if (n.kill && !n.save) d.push([n.kill, "wolf"]);
    if (n.poison && (n.poison !== n.kill || n.save)) d.push([n.poison, "poison"]);
    return d;
  }
  function applyDeaths(deaths) {
    const before = alive().map((p) => p.seat);
    applyingNight = true;
    deaths.forEach((d) => kill(d[0], d[1]));
    applyingNight = false;
    PL("announce", { list: before.filter((s) => !P(s).alive) });
  }
  function startDay() {
    const n = S.night, deaths = nightDeaths(n);
    if (n.save) S.witch.anti = false;
    if (n.poison) S.witch.poison = false;
    L("night", { kill: n.kill, save: n.save, poison: n.poison, charm: n.charm, check: n.check, res: n.check ? isWolf(n.check) : false });
    S.charm = n.charm || null;
    S.phase = "day";
    S.day = { exiled: false, announced: false };
    // Day 1: the sheriff election comes before the deaths are announced.
    if (S.round === 1 && !S.sheriffDone) S.day.pendingDeaths = deaths;
    else {
      applyDeaths(deaths);
      S.day.announced = true;
    }
    S.night = null;
  }
  function announce() {
    act(() => {
      applyDeaths(S.day.pendingDeaths || []);
      S.day.pendingDeaths = null;
      S.day.announced = true;
    });
  }
  function toNight() {
    act(() => {
      S.round++;
      S.phase = "night";
      startNight();
    });
  }

  // ---------- drawing (judge) ----------
  function seatGrid({ pick = null, filter = null, onTap = null, sub = null } = {}) {
    return `<div class="ww-grid">${S.players
      .map((p) => {
        const r = p.role ? ROLES[p.role] : null;
        const ok = filter ? filter(p) : true;
        const hide = S.cfg.hideRoles && S.phase !== "setup";
        const tags = [S.sheriff === p.seat ? "👮" : "", S.charm === p.seat && !hide ? "💋" : "", p.role === "knight" && S.knightUsed ? "⚔️" : "", p.revealed ? "🃏" : ""].join("");
        const on = Array.isArray(pick) ? pick.includes(p.seat) : pick === p.seat;
        return `<button type="button" class="ww-seat ${r && !hide ? r.c : ""} ${p.alive ? "" : "dead"} ${on ? "sel" : ""} ${ok ? "" : "dim"}" ${onTap && ok ? `data-tap="${onTap}" data-seat="${p.seat}"` : "disabled"}>
          <span class="tags">${tags}</span><span class="no">${p.seat}</span><span class="rl">${hide ? "·" : r ? esc(rn(p.role)) : "—"}</span>${sub ? `<span class="rl sub">${esc(sub(p))}</span>` : ""}</button>`;
      })
      .join("")}</div>`;
  }
  const B = (cls, act, label, { dis = false, args = "" } = {}) =>
    `<button type="button" class="ww-b ${cls}" data-act="${act}"${args ? ` data-args="${esc(args)}"` : ""}${dis ? " disabled" : ""}>${esc(label)}</button>`;
  const sel = () => ui.sel;
  const S_ = (s) => (s ? tr("seat", { n: s }) : "");

  function render() {
    if (ROOM_VIEW) return;
    save();
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    document.title = `${tr(ui.viewer ? "pubTitle" : "title")} · ${window.HVI18n ? HVI18n.t("siteName") : ""}`;
    $("ww-title").textContent = tr(ui.viewer ? "pubTitle" : "title");
    const tag = $("ww-phase");
    tag.className = "ww-phase " + (S.phase === "night" ? "night" : S.phase === "day" ? "day" : "");
    tag.textContent = S.phase === "setup" ? tr("setup") : S.phase === "night" ? "🌙 " + tr("nightN", { n: S.round }) : "☀️ " + tr("dayN", { n: S.round });
    $("ww-undo").textContent = tr("undo");
    $("ww-undo").disabled = !hist.length;
    $("ww-undo").hidden = ui.viewer;
    $("ww-tmr-btn").textContent = tr("timer");
    $("ww-tmr-btn").hidden = ui.viewer;
    $("ww-show-btn").textContent = tr("show");
    $("ww-show-btn").hidden = ui.viewer;
    $("ww-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    document.body.classList.toggle("ww-viewer", ui.viewer);
    if (ui.viewer) {
      $("app").innerHTML = `<div class="ww-btns" style="margin:0 0 12px">${B("sec", "exitViewer", tr("backJudge"))}</div>` + renderPub(pubState());
      drawTimer();
      schedulePush();
      return;
    }
    let h = "";
    if (S.phase !== "setup")
      h += `<div class="ww-tabs">${["game", "log", "more", "history"].map((k) => `<button type="button" class="${tab === k ? "on" : ""}" data-tab="${k}">${esc(tr("tab" + k[0].toUpperCase() + k.slice(1)))}</button>`).join("")}</div>`;
    if (tab === "history") h += renderHistory();
    else if (S.phase === "setup") h += renderSetup();
    else if (tab === "log") h += renderLog();
    else if (tab === "more") h += renderMore();
    else {
      if (S.winner)
        h += `<div class="ww-card win ${S.winner === "wolf" ? "wolfwin" : ""}"><div class="big">${esc(tr(S.winner === "good" ? "winGood" : "winWolf"))}</div><p class="hint">${esc(tr("winHint"))}</p><div class="ww-btns">${B("sec", "newGame", tr("newGame"))}</div></div>`;
      h += S.phase === "night" ? renderNight() : renderDay();
      h += `<div class="ww-card"><h2>${esc(tr("status"))}</h2>${statusLine()}${seatGrid()}</div>`;
    }
    $("app").innerHTML = h;
    drawTimer();
    schedulePush();
  }
  function statusLine() {
    const a = alive();
    const w = a.filter((p) => sideOf(p.role) === "wolf").length, g = a.filter((p) => sideOf(p.role) === "god").length, v = a.filter((p) => p.role === "vil").length;
    const wi = byRole("witch");
    return `<div class="ww-pills"><span>${esc(tr("w", { n: w }))}</span><span>${esc(tr("g", { n: g }))}</span><span>${esc(tr("v", { n: v }))}</span>${
      wi && wi.alive ? `<span class="${S.witch.anti ? "" : "used"}">${esc(tr("antiShort"))}</span><span class="${S.witch.poison ? "" : "used"}">${esc(tr("poisonShort"))}</span>` : ""
    }</div>`;
  }
  const chip = (on, act, label, args = "") => `<button type="button" class="ww-chip ${on ? "on" : ""}" data-act="${act}"${args !== "" ? ` data-args="${esc(args)}"` : ""}>${esc(label)}</button>`;

  // ---- setup ----
  function renderSetup() {
    const n = needCounts(), c = curCounts();
    const cnt = Object.keys(n).map((k) => `${esc(rn(k))} <b class="${c[k] === n[k] ? "ok" : "bad"}">${c[k]}/${n[k]}</b>`).join("　");
    const beauty = has("beauty");
    const row = (label, inner) => `<div class="ww-row">${esc(label)}<span>${inner}</span></div>`;
    return `<div class="ww-card"><h2>⚙️ ${esc(tr("board"))}</h2>
      <div class="ww-palette">${Object.keys(BOARDS).map((b) => chip(S.cfg.board === b, "setBoard", BOARDS[b][lang()], b)).join("")}</div>
      ${row(tr("players"), `${chip(false, "setN", "−", "-1")} <b>${S.cfg.n}</b> ${chip(false, "setN", "＋", "1")}`)}
      ${row(tr("wolves"), `${chip(false, "setW", "−", "-1")} <b>${S.cfg.wolves}</b> ${chip(false, "setW", "＋", "1")}`)}
      ${row(tr("vils"), `<b>${S.cfg.vils}</b>`)}
      ${row(tr("selfSave"), ["first", "never", "always"].map((k) => chip(S.cfg.selfSave === k, "cfg", tr(k === "first" ? "firstOnly" : k), `selfSave:${k}`)).join(""))}
      ${row(tr("winRule"), chip(S.cfg.win === "side", "cfg", tr("side"), "win:side") + chip(S.cfg.win === "city", "cfg", tr("city"), "win:city"))}
      ${beauty ? row(tr("charmRepeat"), chip(!S.cfg.charmRepeat, "cfg", tr("never"), "charmRepeat:0") + chip(S.cfg.charmRepeat, "cfg", tr("always"), "charmRepeat:1")) : ""}
      ${beauty ? row(tr("duelCharm"), chip(!S.cfg.duelCharm, "cfg", tr("noCharmDie"), "duelCharm:0") + chip(S.cfg.duelCharm, "cfg", tr("charmDie"), "duelCharm:1")) : ""}
      <p class="hint" style="margin:8px 0 0">${esc(tr(beauty ? "ruleBeauty" : "ruleIdiot"))}</p>
    </div>
    <div class="ww-card"><h2>${esc(tr("deal"))}</h2><p class="hint">${esc(tr("dealHint"))}</p>
      <div class="ww-palette">${["wolf", "vil", ...BOARD().specials].map((k) => chip(ui.brush === k, "brush", rn(k), k)).join("")}${chip(ui.brush === null, "brush", tr("clear"), "")}</div>
      ${seatGrid({ onTap: "paint" })}
      <div class="ww-counts">${cnt}</div>
      <div class="ww-btns">${B("sec", "randomDeal", tr("random"))}${B("green", "startGame", tr("start"), { dis: !setupOK() })}</div>
    </div>
    <div class="ww-card"><h2>${esc(tr("historyCard"))}</h2><p class="hint">${esc(tr("historyCount", { n: archive.length }))}</p><div class="ww-btns">${B("sec", "openHistory", tr("historyOpen"), { dis: !archive.length })}</div></div>
    ${joinCard()}`;
  }
  function joinCard(code = "") {
    return `<div class="ww-card"><h2>${esc(tr("iAmPlayer"))}</h2><p class="hint">${esc(tr("iAmPlayerHint"))}</p>
      <form class="ww-join" data-join><input name="code" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="${esc(tr("roomCode"))}" value="${esc(code)}" aria-label="${esc(tr("roomCode"))}"><button class="ww-b" type="submit">${esc(tr("open"))}</button></form></div>`;
  }
  function fixVil() {
    const sp = BOARD().specials.length;
    S.cfg.wolves = Math.max(1, Math.min(S.cfg.wolves, S.cfg.n - sp - 1));
    S.cfg.vils = S.cfg.n - sp - S.cfg.wolves;
  }
  function randomDeal() {
    const n = needCounts(), deck = [];
    Object.keys(n).forEach((k) => {
      for (let i = 0; i < n[k]; i++) deck.push(k);
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    S.players.forEach((p, i) => (p.role = deck[i]));
    render();
  }

  // ---- night ----
  function nightSteps() {
    return ["wolf", ...["beauty", "witch", "seer", "hunter"].filter(has), "dawn"];
  }
  const STEP_LABEL = { wolf: "stepWolf", beauty: "stepBeauty", witch: "stepWitch", seer: "stepSeer", hunter: "stepHunter", dawn: "stepDawn" };
  function nightSet(o, move = true) {
    act(() => {
      Object.assign(S.night, o);
      if (move) {
        const st = nightSteps();
        S.night.step = st[st.indexOf(S.night.step) + 1] || "dawn";
      }
    });
  }
  function renderNight() {
    const n = S.night, steps = nightSteps(), idx = steps.indexOf(n.step);
    let h = `<div class="ww-card"><div class="ww-steps">${steps.map((s, i) => `<span class="${i === idx ? "on" : i < idx ? "done" : ""}">${esc(tr(STEP_LABEL[s]))}</span>`).join("")}</div>`;
    const deadNote = (r) => {
      const p = byRole(r);
      return p && !p.alive ? `<p class="hint">${esc(tr("deadNote", { role: rn(r), seat: S_(p.seat) }))}</p>` : "";
    };
    const nextBtn = `<div class="ww-btns">${B("", "nightNext", tr("next"))}</div>`;
    if (n.step === "wolf") {
      const wolves = S.players.filter((p) => sideOf(p.role) === "wolf" && p.alive).map((p) => p.seat);
      h += `<h2>${esc(tr("wolfOpen"))}</h2><p class="hint">${esc(tr("wolfHint", { list: list(wolves) }))}</p>
        ${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}
        <div class="ww-btns">${B("sec", "nightKill", tr("noKill"), { args: "0" })}${B("red", "nightKill", tr("confirmKill", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
    } else if (n.step === "beauty") {
      const b = byRole("beauty");
      h += `<h2>${esc(tr("beautyOpen"))}</h2>${deadNote("beauty")}`;
      if (b && b.alive) {
        const ban = S.cfg.charmRepeat ? null : S.charm;
        h += `<p class="hint">${esc(tr("beautyHint", { ban: ban ? tr("beautyBan", { s: S_(ban) }) : "" }))}</p>
          ${seatGrid({ pick: sel(), filter: (p) => p.alive && p.seat !== b.seat && p.seat !== ban, onTap: "pickSel" })}
          <div class="ww-btns">${B("red", "nightCharm", tr("confirmCharm", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
      } else h += nextBtn;
    } else if (n.step === "witch") {
      const w = byRole("witch"), self = n.kill && w && n.kill === w.seat;
      const canSelf = S.cfg.selfSave === "always" || (S.cfg.selfSave === "first" && S.round === 1);
      const canSave = w && w.alive && S.witch.anti && n.kill && (!self || canSelf);
      h += `<h2>${esc(tr("witchOpen"))}</h2>`;
      if (!w || !w.alive) h += deadNote("witch") + nextBtn;
      else
        h += `<div class="ww-pills"><span class="${S.witch.anti ? "" : "used"}">${esc(tr("anti"))}</span><span class="${S.witch.poison ? "" : "used"}">${esc(tr("poison"))}</span></div>
          <p class="big">${esc(tr("downTonight", { s: n.kill ? S_(n.kill) : tr("nobody") }))}</p>
          ${!S.witch.anti ? `<p class="hint">${esc(tr("antiUsed"))}</p>` : ""}
          ${self && !canSelf && S.witch.anti ? `<p class="hint">${esc(tr("noSelfSave"))}</p>` : ""}
          ${S.witch.poison ? `<p class="hint">${esc(tr("poisonHint"))}</p>${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}` : ""}
          <div class="ww-btns">${B("green", "nightSave", tr("save", { s: S_(n.kill) }), { dis: !canSave })}${B("purple", "nightPoison", tr("usePoison", { s: S_(sel()) }), { dis: !(S.witch.poison && sel()), args: String(sel() || 0) })}${B("sec", "nightNext", tr("noPotion"))}</div>`;
    } else if (n.step === "seer") {
      const s = byRole("seer");
      h += `<h2>${esc(tr("seerOpen"))}</h2>${deadNote("seer")}`;
      if (s && s.alive) {
        h += `<p class="hint">${esc(tr("seerHint"))}</p>${seatGrid({ pick: n.check || sel(), filter: (p) => p.alive && p.seat !== s.seat, onTap: n.check ? null : "pickSel" })}`;
        if (n.check) {
          const bad = isWolf(n.check);
          h += `<div class="ww-result ${bad ? "w" : "g"}">${esc(S_(n.check))} · ${esc(tr(bad ? "isWolf" : "isGood"))}</div>${nextBtn}`;
        } else h += `<div class="ww-btns">${B("", "nightCheck", tr("check", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
      } else h += nextBtn;
    } else if (n.step === "hunter") {
      const hu = byRole("hunter"), poisoned = hu && n.poison === hu.seat, charmed = hu && n.charm === hu.seat;
      h += `<h2>${esc(tr("hunterOpen"))}</h2>${deadNote("hunter")}`;
      if (hu && hu.alive)
        h += `<div class="ww-result ${poisoned ? "w" : "g"}">${esc(tr(poisoned ? "cantShoot" : "canShoot"))}</div><p class="hint">${esc(tr("hunterHint", { s: S_(hu.seat) }))}${charmed && !poisoned ? " " + esc(tr("hunterCharmed")) : ""}</p>`;
      h += nextBtn;
    } else {
      const dies = nightDeaths(n).map((d) => d[0]);
      const bz = byRole("beauty");
      if (bz && dies.includes(bz.seat) && n.charm && !dies.includes(n.charm)) dies.push(n.charm);
      const jr = judgeRole;
      h += `<h2>${esc(tr("dawn"))}</h2>
        <div class="ww-row">${esc(tr("kill"))}<b>${esc(n.kill ? pn(n.kill, jr) : tr("noKill"))}</b></div>
        ${has("beauty") ? `<div class="ww-row">${esc(tr("charm"))}<b>${esc(n.charm ? pn(n.charm, jr) : "—")}</b></div>` : ""}
        <div class="ww-row">${esc(tr("witch"))}<b>${esc(n.save ? tr("saved") : n.poison ? tr("poisoned", { s: pn(n.poison, jr) }) : tr("noUse"))}</b></div>
        <div class="ww-row">${esc(tr("seer"))}<b>${esc(n.check ? `${pn(n.check, jr)} → ${tr(isWolf(n.check) ? "wolfWord" : "goodWord")}` : "—")}</b></div>
        <p class="big">${esc(dies.length ? tr("deadLast", { list: list(dies) }) : tr("peaceful"))}</p>
        <div class="ww-btns">${B("gold", "startDay", tr("dayBreak"))}</div>`;
    }
    return h + "</div>";
  }

  // ---- day ----
  function renderDay() {
    const d = S.day;
    let h = "";
    if (S.pending.length) {
      const pd = S.pending[0];
      if (pd.type === "hunter")
        h += `<div class="ww-card pending"><h2>${esc(tr("hunterSkill", { s: S_(pd.seat) }))}</h2><p class="hint">${esc(tr("hunterSkillHint"))}</p>${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}
          <div class="ww-btns">${B("sec", "resolve", tr("noShoot"), { args: "0" })}${B("red", "resolve", tr("shoot", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div></div>`;
      else
        h += `<div class="ww-card pending"><h2>${esc(tr("badgePass", { s: S_(pd.seat) }))}</h2>${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}
          <div class="ww-btns">${B("sec", "resolve", tr("tearBadge"), { args: "0" })}${B("gold", "resolve", tr("passTo", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div></div>`;
      return h;
    }
    if (S.round === 1 && !S.sheriffDone) return h + renderElect();
    if (!d.announced) {
      const ds = (d.pendingDeaths || []).map((x) => x[0]);
      return h + `<div class="ww-card"><h2>${esc(tr("announceTitle"))}</h2><p class="big">${esc(ds.length ? tr("deadLast", { list: list(ds) }) : tr("peaceful"))}</p><div class="ww-btns">${B("gold", "announce", tr("announceBtn"))}</div></div>`;
    }
    const last = [...S.pub].reverse().find((e) => e.e === "announce");
    const ds = last ? last.v.list || [] : [];
    h += `<div class="ww-card"><h2>${esc(tr("lastNight"))}</h2><p class="big">${esc(ds.length ? tr("died", { list: list(ds) }) : tr("peace"))}</p>${S.round === 1 && ds.length ? `<p class="hint">${esc(tr("lastWords"))}</p>` : ""}</div>`;
    if (!d.exiled) {
      if (S.vote) h += voteWidget();
      else {
        const k = byRole("knight");
        h += `<div class="ww-card"><h2>${esc(tr("exileVote"))}</h2><p class="hint">${esc(tr("exileHint"))}${S.sheriff && P(S.sheriff).alive ? " " + esc(tr("sheriffWeight", { s: S_(S.sheriff) })) : ""}</p>
          ${k && k.alive && !S.knightUsed ? `<div class="ww-btns">${B("gold", "openDuel", tr("duelBtn"))}</div>` : ""}
          <div class="ww-btns">${B("red", "startExileVote", tr("startVote"))}</div>
          <div class="ww-btns">${B("sec", "openExplode", tr("explodeBtn"))}</div></div>`;
      }
    } else h += `<div class="ww-card"><h2>${esc(tr("dayEnd"))}</h2><div class="ww-btns">${B("purple", "toNight", tr("toNight", { n: S.round + 1 }))}</div></div>`;
    return h;
  }
  function setSheriffInner(s) {
    S.sheriff = s;
    S.sheriffDone = true;
    S.vote = null;
    LP("sheriff", { s });
  }

  // ---- sheriff election ----
  function renderElect() {
    const e = S.elect;
    const boom = `<div class="ww-btns">${B("sec", "openExplode", tr("explodeElect"))}</div>`;
    const down = alive().map((p) => p.seat).filter((x) => !e.cands.includes(x));
    if (e.stage === "signup")
      return `<div class="ww-card"><h2>${esc(tr("electSignup"))}</h2><p class="hint">${esc(tr("electSignupHint"))}</p>
        ${seatGrid({ pick: e.cands, filter: (p) => p.alive, onTap: "togCand" })}
        <p class="hint" style="margin-top:8px">${esc(tr("upDown", { up: list(e.cands), down: list(down) }))}</p>
        <div class="ww-btns">${B("sec", "noCand", tr("noCand"))}${B("gold", "confirmCands", tr("confirmCands", { n: e.cands.length }), { dis: !e.cands.length })}</div>${boom}</div>`;
    if (e.stage === "speech")
      return `<div class="ww-card"><h2>${esc(tr("electSpeech"))}</h2><p class="hint">${esc(tr("electSpeechHint", { list: list(e.cands) }))}</p>
        ${seatGrid({ pick: e.withdrawn, filter: (p) => p.alive && e.cands.includes(p.seat), onTap: "togWd", sub: (p) => (e.withdrawn.includes(p.seat) ? tr("withdrawn") : e.cands.includes(p.seat) ? tr("onStage") : "") })}
        <div class="ww-btns">${B("gold", "startElectVote", tr("startElectVote"))}</div>${boom}</div>`;
    return voteWidget() + `<div class="ww-card">${boom}</div>`;
  }
  function startElectVote() {
    act(() => {
      const e = S.elect;
      if (e.withdrawn.length) LP("withdraw", { list: e.withdrawn.slice() });
      const rem = e.cands.filter((x) => !e.withdrawn.includes(x) && P(x).alive);
      if (!rem.length) {
        LP("allWithdraw");
        setSheriffInner(null);
        return;
      }
      if (rem.length === 1) {
        LP("autoSheriff", { s: rem[0] });
        setSheriffInner(rem[0]);
        return;
      }
      e.stage = "vote";
      S.vote = { kind: "sheriff", cands: rem, voters: alive().map((p) => p.seat).filter((x) => !e.cands.includes(x)), ballots: {}, pk: 0 };
    });
  }

  // ---- votes ----
  // Shared with the players' view: tally(vote, sheriffSeat) works on the public copy of a vote too.
  function tallyOf(v, sheriff) {
    const weight = (s) => (v.kind === "exile" && N(sheriff) === N(s) ? 1.5 : 1);
    const t = {};
    (v.cands || []).forEach((c) => (t[c] = { score: 0, by: [] }));
    const abst = [];
    (v.voters || []).forEach((x) => {
      const b = (v.ballots || {})[x];
      if (b && t[b]) {
        t[b].score += weight(x);
        t[b].by.push(x);
      } else abst.push(x);
    });
    const max = Math.max(0, ...Object.values(t).map((o) => o.score));
    const lead = max > 0 ? (v.cands || []).filter((c) => t[c].score === max) : [];
    return { t, abst, max, lead, weight };
  }
  const liveSheriff = () => (S.sheriff && P(S.sheriff) && P(S.sheriff).alive ? S.sheriff : null);
  const tally = () => tallyOf(S.vote, liveSheriff());
  function startExileVote() {
    act(() => {
      S.vote = { kind: "exile", cands: alive().map((p) => p.seat), voters: alive().filter((p) => !p.revealed).map((p) => p.seat), ballots: {}, pk: 0 };
    });
  }
  function voteEvent() {
    const v = S.vote, { t, abst } = tally();
    return {
      kind: v.kind, pk: v.pk, sheriff: liveSheriff(),
      rows: sortN(v.cands).filter((c) => t[c].score > 0).map((c) => ({ c, score: t[c].score, by: t[c].by.slice() })),
      abst,
    };
  }
  function voteWidget() {
    const v = S.vote, { t, abst, max, lead, weight } = tally();
    if (ui.tgt === undefined || (ui.tgt !== 0 && !v.cands.includes(ui.tgt))) ui.tgt = v.cands[0];
    const chips = sortN(v.cands).map((c) => chip(ui.tgt === c, "tgt", tr("voteFor", { s: S_(c) }), String(c))).join("") + chip(ui.tgt === 0, "tgt", tr("abstain"), "0");
    const grid = seatGrid({
      filter: (p) => v.voters.includes(p.seat), onTap: "castVote",
      pick: v.voters.filter((x) => v.ballots[x] === ui.tgt),
      sub: (p) => (v.voters.includes(p.seat) ? (v.ballots[p.seat] ? "→" + v.ballots[p.seat] : v.ballots[p.seat] === 0 ? tr("abstShort") : tr("notVoted")) : v.cands.includes(p.seat) && v.kind === "sheriff" ? tr("cand") : ""),
    });
    const by = (c) => t[c].by.map((x) => tr("seat", { n: x }) + (weight(x) > 1 ? "👮" : "")).join(lang() === "zh" ? "、" : ", ");
    const rows = sortN(v.cands).filter((c) => t[c].score > 0).map((c) => `<div class="ww-row"><b>${esc(S_(c))} · ${esc(tr("votes", { n: t[c].score }))}</b><span>${esc(by(c))}</span></div>`).join("") +
      `<div class="ww-row"><span>${esc(tr("abstNot"))}</span><span>${esc(list(abst))}</span></div>`;
    const isS = v.kind === "sheriff";
    let btns = "";
    if (lead.length === 1) btns += B(isS ? "gold" : "red", "finishVote", isS ? tr("electOk", { s: S_(lead[0]) }) : tr("exileOk", { s: S_(lead[0]) }), { args: `ok:${lead[0]}` });
    if (lead.length > 1 && v.pk < 1) btns += B("purple", "finishVote", tr("goPk", { list: list(lead) }), { args: "pk:0" });
    btns += B("sec", "finishVote", tr(isS ? "badgeLostBtn" : "noExileBtn"), { args: "none:0" });
    const hint = tr("voteHint") + " " + (isS ? tr("voteHintS") : liveSheriff() ? tr("sheriffWeight", { s: S_(liveSheriff()) }) : "") + (v.pk ? tr(isS ? "pkHintS" : "pkHintE") : "");
    return `<div class="ww-card"><h2>${esc(tr(isS ? "sheriffVote" : "exileVote"))}${v.pk ? esc(tr("pkTag")) : ""}</h2>
      <p class="hint">${esc(hint)}</p>
      <div class="ww-palette">${chips}</div>${grid}
      <div class="ww-btns">${B("sec", "restAbstain", tr("restAbstain"))}${B("sec", "clearVotes", tr("clearVotes"))}</div>
      <div style="margin-top:10px">${rows}</div>
      ${lead.length > 1 ? `<p class="hint">${esc(tr("tie", { list: list(lead), n: max }))}</p>` : ""}
      <div class="ww-btns">${btns}</div></div>`;
  }
  function finishVote(action, target) {
    act(() => {
      const v = S.vote;
      LP("vote", voteEvent());
      if (action === "pk") {
        const tied = tally().lead;
        LP("pk", { list: tied });
        const voters = v.kind === "sheriff" ? v.voters : alive().filter((p) => !tied.includes(p.seat) && !p.revealed).map((p) => p.seat);
        S.vote = { kind: v.kind, cands: tied, voters, ballots: {}, pk: v.pk + 1 };
        return;
      }
      S.vote = null;
      if (v.kind === "sheriff") setSheriffInner(action === "ok" ? target : null);
      else if (action === "ok") doExile(target);
      else {
        S.day.exiled = true;
        LP("noExile");
      }
    });
  }
  function doExile(s) {
    S.day.exiled = true;
    const p = P(s);
    // The idiot reveals the card instead of leaving (once), and can't vote from then on.
    if (p.role === "idiot" && !p.revealed) {
      p.revealed = true;
      LP("idiot", { s });
      return;
    }
    PL("exiled", { s });
    kill(s, "exile");
  }
  function resolve(t) {
    act(() => {
      const pd = S.pending.shift();
      if (pd.type === "hunter") {
        if (t) {
          LP("shot", { h: pd.seat, t });
          kill(t, "shot");
        } else L("noShot", { h: pd.seat });
      } else {
        S.sheriff = t || null;
        LP("badge", { s: t || null });
      }
    });
  }
  function modal(html) {
    $("modal").innerHTML = `<div class="ww-modal" data-modal-bg><div class="ww-card">${html}</div></div>`;
  }
  const closeModal = () => ($("modal").innerHTML = "");
  function openExplode() {
    const ws = S.players.filter((p) => p.alive && p.role === "wolf");
    modal(`<h2>${esc(tr("explodeWho"))}</h2><p class="hint">${esc(tr("explodeHint"))}${S.round === 1 && !S.sheriffDone ? " " + esc(tr("explodeElectHint")) : ""}</p>
      <div class="ww-btns">${ws.map((p) => B("red", "explode", S_(p.seat), { args: String(p.seat) })).join("")}</div><div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}</div>`);
  }
  function openDuel() {
    const k = byRole("knight");
    modal(`<h2>${esc(tr("duelWho", { s: S_(k.seat) }))}</h2><p class="hint">${esc(tr("duelHint"))}</p>
      <div class="ww-grid">${alive().filter((p) => p.seat !== k.seat).map((p) => `<button type="button" class="ww-seat" data-act="duel" data-args="${p.seat}"><span class="no">${p.seat}</span></button>`).join("")}</div>
      <div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}</div>`);
  }
  function duel(t) {
    const k = byRole("knight");
    closeModal();
    if (!k || S.knightUsed || !k.alive) return;
    act(() => {
      S.knightUsed = true;
      S.vote = null;
      if (isWolf(t)) {
        LP("duelWolf", { k: k.seat, t });
        kill(t, "duel");
        S.day.exiled = true;
        LP("duelNight");
      } else {
        LP("duelGood", { k: k.seat, t });
        kill(k.seat, "duelFail");
      }
    });
  }
  function explode(s) {
    closeModal();
    act(() => {
      LP("explode", { s });
      S.vote = null;
      if (S.round === 1 && !S.sheriffDone) {
        S.sheriffDone = true;
        S.sheriff = null;
        LP("badgeLost");
      }
      if (S.day && S.day.pendingDeaths) {
        applyDeaths(S.day.pendingDeaths);
        S.day.pendingDeaths = null;
        S.day.announced = true;
      }
      kill(s, "explode");
      S.day.exiled = true;
    });
  }

  // ---- log, settings, history ----
  function logHtml(entries, roleOf) {
    let h = "", last = null;
    entries.forEach((e) => {
      const k = phaseLabel(e.k);
      if (k !== last) {
        h += `<div class="r">${esc(k)}</div>`;
        last = k;
      }
      const t = fmt(e, roleOf);
      if (t) h += `<div class="e">${esc(t)}</div>`;
    });
    return h;
  }
  function logText(entries, roleOf) {
    let t = "", last = null;
    entries.forEach((e) => {
      const k = phaseLabel(e.k);
      if (k !== last) {
        t += `\n【${k}】\n`;
        last = k;
      }
      t += fmt(e, roleOf) + "\n";
    });
    return t;
  }
  function renderLog() {
    let h = `<div class="ww-card ww-log"><h2>${esc(tr("logTitle"))}</h2>${S.log.length ? logHtml(S.log, judgeRole) : `<p class="hint">${esc(tr("noLog"))}</p>`}
      <div class="ww-btns">${B("sec", "copyLog", tr("copyLog"))}</div></div>`;
    const dead = S.players.filter((p) => !p.alive);
    h += `<div class="ww-card"><h2>${esc(tr("outList"))}</h2>${dead.length ? dead.map((p) => `<div class="ww-row">${esc(pn(p.seat, judgeRole))}<span>${esc(phaseLabel(p.at))} · ${esc(tr("c_" + p.cause))}</span></div>`).join("") : `<p class="hint">${esc(tr("none"))}</p>`}</div>`;
    return h;
  }
  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = tr("copied");
    } catch {
      btn.textContent = tr("copyFail");
    }
  }
  function renderMore() {
    const row = (k, v) => `<div class="ww-row">${esc(k)}<b>${esc(v)}</b></div>`;
    return `<div class="ww-card"><h2>${esc(tr("settings"))}</h2>
      <label class="ww-tog"><input type="checkbox" data-hide ${S.cfg.hideRoles ? "checked" : ""}> ${esc(tr("hideRoles"))}</label>
      ${row(tr("board"), boardName(S.cfg.board))}
      ${row(tr("selfSave"), tr({ first: "firstOnly", never: "never", always: "always" }[S.cfg.selfSave]))}
      ${row(tr("winRule"), tr(S.cfg.win === "side" ? "side" : "city"))}
      ${has("beauty") ? row(tr("charmRepeat"), tr(S.cfg.charmRepeat ? "always" : "never")) + row(tr("duelCharm"), tr(S.cfg.duelCharm ? "charmDie" : "noCharmDie")) + row(tr("curCharm"), S.charm ? S_(S.charm) : tr("none")) : ""}
      ${has("knight") ? row(tr("knightSkill"), tr(S.knightUsed ? "used" : "unused")) : ""}
      ${row(tr("curSheriff"), S.sheriff ? S_(S.sheriff) : tr("none"))}
      <div class="ww-btns">${B("red", "confirmNew", tr("endGame"))}</div></div>`;
  }
  function fmtT(t) {
    const d = new Date(t), z = (n) => String(n).padStart(2, "0");
    return lang() === "zh" ? `${d.getMonth() + 1}月${d.getDate()}日 ${z(d.getHours())}:${z(d.getMinutes())}` : `${d.toLocaleDateString("en", { month: "short", day: "numeric" })} ${z(d.getHours())}:${z(d.getMinutes())}`;
  }
  function archiveCurrent() {
    if (S.phase === "setup" || !S.log.length) return;
    archive.unshift({ t: Date.now(), board: S.cfg.board, winner: S.winner, round: S.round, players: S.players.map((p) => ({ seat: p.seat, role: p.role, alive: p.alive, cause: p.cause, at: p.at })), log: S.log });
    archive = archive.slice(0, 30);
    store.set(ARCH, archive);
  }
  function gameText(g) {
    const roleOf = (s) => (g.players.find((p) => p.seat === s) || {}).role;
    const r = g.winner === "good" ? tr("goodWin") : g.winner === "wolf" ? tr("wolfWin") : tr("undecided");
    return `${tr("logHead", { board: boardName(g.board || "beauty") })} ${fmtT(g.t)}\n${tr("result", { r })}\n${logText(g.log, roleOf)}`;
  }
  function renderHistory() {
    let h = `<div class="ww-card"><h2>${esc(tr("historyCard"))}</h2>${S.phase === "setup" ? `<div class="ww-btns" style="margin-top:0">${B("sec", "closeHistory", tr("backSetup"))}</div>` : ""}
      ${archive.length ? "" : `<p class="hint">${esc(tr("noHistory"))}</p>`}`;
    archive.forEach((g, i) => {
      const res = g.winner === "good" ? `<span class="good">${esc(tr("goodWin"))}</span>` : g.winner === "wolf" ? `<span class="bad">${esc(tr("wolfWin"))}</span>` : `<span class="hint">${esc(tr("undecided"))}</span>`;
      h += `<button type="button" class="ww-row ww-rowbtn" data-act="openGame" data-args="${i}"><span>${i === 0 ? esc(tr("lastGame")) : ""}${esc(fmtT(g.t))} · ${esc(boardName(g.board || "beauty"))} · ${esc(tr("rounds", { n: g.round }))}</span><b>${res} ${ui.open === i ? "▲" : "▼"}</b></button>`;
      if (ui.open === i) {
        const roleOf = (s) => (g.players.find((p) => p.seat === s) || {}).role;
        h += `<div class="ww-grid" style="margin:8px 0">${g.players.map((p) => `<div class="ww-seat ${p.role && ROLES[p.role] ? ROLES[p.role].c : ""} ${p.alive ? "" : "dead"}"><span class="no">${p.seat}</span><span class="rl">${esc(rn(p.role))}</span>${p.alive ? "" : `<span class="rl sub">${esc(phaseLabel(p.at))}</span>`}</div>`).join("")}</div>
          <div class="ww-log">${logHtml(g.log, roleOf)}</div>
          <div class="ww-btns">${B("sec", "copyGame", tr("copyGame"), { args: String(i) })}${B("sec", "delGame", tr("del"), { args: String(i) })}</div>`;
      }
    });
    return h + "</div>";
  }
  function newGame() {
    archiveCurrent();
    const c = S.cfg;
    S = fresh(c);
    initPlayers();
    hist = [];
    tab = "game";
    ui.sel = null;
    render();
  }

  // ---------- what the players may see ----------
  function pubState() {
    const over = Boolean(S.winner);
    const e = S.elect;
    const st = {
      v: 1, board: S.cfg.board, phase: S.phase, round: S.round, winner: S.winner || null,
      sheriff: S.sheriff && P(S.sheriff) && P(S.sheriff).alive ? S.sheriff : null,
      seats: S.players.map((p) => ({
        seat: p.seat, alive: p.alive, idiot: Boolean(p.revealed),
        cause: p.alive ? null : PUBLIC_CAUSES.includes(p.cause) ? p.cause : "out",
        at: p.alive ? null : p.at,
        role: over ? p.role : null,
      })),
      pending: S.phase === "day" && S.pending.length > 0,
      announced: S.phase !== "day" || Boolean(S.day && S.day.announced),
      elect: S.phase === "day" && S.round === 1 && !S.sheriffDone ? { stage: e.stage, cands: e.stage === "signup" ? [] : e.cands, withdrawn: e.withdrawn } : null,
      vote: S.vote ? { kind: S.vote.kind, pk: S.vote.pk, cands: S.vote.cands, voters: S.vote.voters, ballots: S.vote.ballots } : null,
      pub: S.pub,
      timer: timerPub(),
    };
    return st;
  }
  // Every value from the shared state goes through N() or a fixed list before it is shown.
  function renderPub(st) {
    if (!st || typeof st !== "object") return "";
    const seats = Array.isArray(st.seats) ? st.seats : [];
    const over = st.winner === "good" || st.winner === "wolf";
    const sheriff = N(st.sheriff);
    const pubEv = Array.isArray(st.pub) ? st.pub.filter((e) => e && typeof e === "object") : [];
    let h = "";
    const phase = st.phase === "night" ? `🌙 ${tr("nightN", { n: N(st.round) })}` : st.phase === "day" ? `☀️ ${tr("dayN", { n: N(st.round) })}` : tr("pubWaiting");
    h += `<div class="ww-card ww-pubhead ${st.phase === "night" ? "night" : st.phase === "day" ? "day" : ""}"><div class="ww-pubphase">${esc(phase)}</div>
      ${BOARDS[st.board] ? `<div class="hint">${esc(boardName(st.board))}</div>` : ""}</div>`;
    if (over) h += `<div class="ww-card win ${st.winner === "wolf" ? "wolfwin" : ""}"><div class="big">${esc(tr(st.winner === "good" ? "winGood" : "winWolf"))}</div></div>`;
    h += `<div id="pub-timer"></div>`;
    if (st.phase === "night" && !over) h += `<div class="ww-card ww-center"><div class="big">${esc(tr("pubNight"))}</div><p class="hint">${esc(tr("pubNightHint"))}</p></div>`;
    if (st.phase === "day") {
      const last = [...pubEv].reverse().find((e) => e.e === "announce");
      if (!st.announced) h += `<div class="ww-card ww-center"><p class="hint">${esc(tr("pubNotYet"))}</p></div>`;
      else if (last && N(last.k && last.k.r) === N(st.round)) {
        const ds = Array.isArray(last.v && last.v.list) ? last.v.list : [];
        h += `<div class="ww-card ww-center"><h2>${esc(tr("pubDeaths"))}</h2><div class="big">${esc(ds.length ? list(ds) : tr("pubNoDeaths"))}</div></div>`;
      }
      if (st.pending) h += `<div class="ww-card ww-center"><p class="hint">${esc(tr("pubPending"))}</p></div>`;
      if (st.elect && typeof st.elect === "object") {
        const c = Array.isArray(st.elect.cands) ? st.elect.cands : [], w = Array.isArray(st.elect.withdrawn) ? st.elect.withdrawn : [];
        h += `<div class="ww-card"><h2>${esc(tr("pubElect"))}</h2>${c.length ? `<p>${esc(tr("pubCands", { list: list(c) }))}</p>` : ""}${w.length ? `<p class="hint">${esc(tr("pubWithdrawn", { list: list(w) }))}</p>` : ""}</div>`;
      }
    }
    if (st.vote && typeof st.vote === "object") h += pubVote(st.vote, sheriff);
    // seats
    const alive = seats.filter((p) => p && p.alive).length;
    h += `<div class="ww-card"><h2>${esc(tr("pubSeats"))} <small class="hint">${esc(tr("pubAlive", { n: alive }))}</small></h2>
      <p class="ww-pubsheriff">${esc(sheriff ? tr("pubSheriff", { s: S_(sheriff) }) : tr("pubNoSheriff"))}</p>
      <div class="ww-grid">${seats
        .map((p) => {
          const role = over && ROLES[p.role] ? p.role : null;
          const cause = p.alive ? "" : PUBLIC_CAUSES.includes(p.cause) ? tr("c_" + p.cause) : tr("out");
          return `<div class="ww-seat ${role ? ROLES[role].c : ""} ${p.alive ? "" : "dead"}"><span class="tags">${N(p.seat) === sheriff ? "👮" : ""}${p.idiot ? "🃏" : ""}</span><span class="no">${N(p.seat)}</span>
            <span class="rl">${role ? esc(rn(role)) : p.alive ? "" : esc(cause)}</span>${!p.alive && p.at ? `<span class="rl sub">${esc(phaseLabel(p.at))}</span>` : ""}</div>`;
        })
        .join("")}</div>${over ? `<p class="hint">${esc(tr("pubRoles"))}</p>` : ""}</div>`;
    // votes so far, then the public log
    const votes = pubEv.filter((e) => e.e === "vote");
    h += `<div class="ww-card ww-log"><h2>${esc(tr("pubVotes"))}</h2>${votes.length ? votes.slice().reverse().map((e) => `<div class="e"><span class="r2">${esc(phaseLabel(e.k))}</span> ${esc(fmt(e))}</div>`).join("") : `<p class="hint">${esc(tr("pubNoVotes"))}</p>`}</div>`;
    h += `<div class="ww-card ww-log"><h2>${esc(tr("pubEvents"))}</h2>${pubEv.length ? logHtml(pubEv, null) : `<p class="hint">${esc(tr("noLog"))}</p>`}</div>`;
    return h;
  }
  // A vote in progress, with a bar per candidate.
  function pubVote(v, sheriff) {
    const vv = { kind: v.kind === "sheriff" ? "sheriff" : "exile", pk: N(v.pk), cands: (Array.isArray(v.cands) ? v.cands : []).map(N), voters: (Array.isArray(v.voters) ? v.voters : []).map(N), ballots: {} };
    if (v.ballots && typeof v.ballots === "object") Object.keys(v.ballots).forEach((k) => (vv.ballots[N(k)] = N(v.ballots[k])));
    const { t, abst, max } = tallyOf(vv, sheriff);
    const total = Math.max(1, max);
    const rows = sortN(vv.cands)
      .filter((c) => t[c].score > 0)
      .sort((a, b) => t[b].score - t[a].score || a - b)
      .map((c) => `<div class="ww-bar"><div class="ww-bar-top"><b>${esc(S_(c))}</b><span>${esc(tr("votes", { n: t[c].score }))}</span></div><div class="ww-bar-track"><i style="width:${Math.round((t[c].score / total) * 100)}%"></i></div><div class="hint">← ${esc(t[c].by.map((x) => tr("seat", { n: x })).join(lang() === "zh" ? "、" : ", "))}</div></div>`)
      .join("");
    return `<div class="ww-card ww-pubvote"><h2>${esc(tr(vv.kind === "sheriff" ? "sheriffVote" : "exileVote"))}${vv.pk ? esc(tr("pkTag")) : ""} <small class="ww-live">${esc(tr("pubLiveVote"))}</small></h2>
      ${rows || `<p class="hint">${esc(tr("noVotesYet"))}</p>`}
      <div class="ww-row"><span>${esc(tr("abstNot"))}</span><span>${esc(list(abst))}</span></div></div>`;
  }

  // ---------- speaking timer ----------
  const T = { open: false, dur: 60, left: 60, running: false, end: 0, speaker: null, iv: null, warned: false, buzzed: false, ac: null, mark: 0 };
  const savedDur = N(store.get("hv-ww-timer-dur", 0));
  if (savedDur) T.dur = T.left = savedDur;
  function timerPub() {
    return { dur: T.dur, left: T.running ? (T.end - Date.now()) / 1000 : T.left, running: T.running, speaker: T.speaker, mark: T.mark, shown: T.open || T.running };
  }
  const changed = () => {
    T.mark++;
    schedulePush();
  };
  function beep(freq, ms, times = 1) {
    try {
      T.ac = T.ac || new (window.AudioContext || window.webkitAudioContext)();
      for (let i = 0; i < times; i++) {
        const o = T.ac.createOscillator(), g = T.ac.createGain(), t0 = T.ac.currentTime + i * (ms / 1000 + 0.12);
        o.frequency.value = freq;
        o.connect(g);
        g.connect(T.ac.destination);
        g.gain.setValueAtTime(0.25, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + ms / 1000);
        o.start(t0);
        o.stop(t0 + ms / 1000);
      }
    } catch {}
    try {
      navigator.vibrate && navigator.vibrate(times > 1 ? [300, 150, 300, 150, 300] : 200);
    } catch {}
  }
  function tick() {
    if (!T.running) return;
    T.left = (T.end - Date.now()) / 1000;
    if (!T.warned && T.left <= 10 && T.dur > 10) {
      T.warned = true;
      beep(880, 150);
    }
    if (!T.buzzed && T.left <= 0) {
      T.buzzed = true;
      beep(660, 350, 3);
    }
    drawTimer();
  }
  function tStart() {
    try {
      T.ac = T.ac || new (window.AudioContext || window.webkitAudioContext)();
      T.ac.resume && T.ac.resume();
    } catch {}
    if (T.running) return;
    T.end = Date.now() + T.left * 1000;
    T.running = true;
    clearInterval(T.iv);
    T.iv = setInterval(tick, 200);
    changed();
    drawTimer();
  }
  function tPause() {
    if (!T.running) return;
    tick();
    T.running = false;
    clearInterval(T.iv);
    changed();
    drawTimer();
  }
  function tReset() {
    T.running = false;
    clearInterval(T.iv);
    T.left = T.dur;
    T.warned = T.buzzed = false;
    changed();
    drawTimer();
  }
  function tDur(d) {
    T.dur = d;
    store.set("hv-ww-timer-dur", d);
    tReset();
  }
  function tAdd(sec) {
    T.left += sec;
    if (T.running) T.end += sec * 1000;
    if (T.left > 10) T.warned = false;
    if (T.left > 0) T.buzzed = false;
    changed();
    drawTimer();
  }
  function tSpeaker(s) {
    T.speaker = T.speaker === s ? null : s;
    changed();
    drawTimer();
  }
  function tNext(dir) {
    const al = (S.players || []).filter((p) => p.alive).map((p) => p.seat);
    if (!al.length) return;
    if (T.speaker == null) T.speaker = al[0];
    else {
      const n = S.players.length;
      let x = T.speaker;
      for (let i = 0; i < n; i++) {
        x = ((x - 1 + dir + n) % n) + 1;
        if (al.includes(x)) break;
      }
      T.speaker = x;
    }
    tReset();
    tStart();
  }
  const clockText = (left) => {
    const over = left <= 0, a = Math.abs(left), sec = over ? Math.floor(a) : Math.ceil(a);
    return (over ? "+" : "") + Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
  };
  // The big clock on the players' screen (same layout for the local and the remote one).
  function pubClockHtml(tm, left) {
    if (!tm || !tm.shown) return "";
    const over = left <= 0;
    return `<div class="ww-card ww-pubclock"><div class="clock ${over ? "over" : left <= 10 ? "warn" : ""}">${esc(clockText(left))}</div>
      <div class="spk">${tm.speaker ? `${esc(tr("speaking"))} <b>${esc(S_(N(tm.speaker)))}</b>` : `<span class="hint">${esc(tr("noSpeaker"))}</span>`}${over ? ` <span class="bad">${esc(tr("timeUp"))}</span>` : ""}</div></div>`;
  }
  function drawTimer() {
    if (ROOM_VIEW) return;
    if (ui.viewer) {
      $("timer").innerHTML = "";
      document.body.classList.remove("tmr-on");
      const box = $("pub-timer");
      if (box) box.innerHTML = pubClockHtml(timerPub(), T.left);
      return;
    }
    document.body.classList.toggle("tmr-on", T.open);
    const el = $("timer");
    if (!T.open) return void (el.innerHTML = "");
    const left = T.left, over = left <= 0;
    const pct = Math.max(0, Math.min(100, (left / T.dur) * 100));
    const al = (S.players || []).filter((p) => p.alive).map((p) => p.seat);
    el.innerHTML = `<div class="ww-tmr"><div class="in">
      <div class="top">
        <div class="clock ${over ? "over" : left <= 10 ? "warn" : ""}">${esc(clockText(left))}</div>
        <div class="spk">${T.speaker ? `${esc(tr("speaking"))}<br><b>${esc(S_(T.speaker))}</b>` : `<span class="hint">${esc(tr("noSpeaker"))}</span>`}${over ? `<br><span class="bad">${esc(tr("timeUp"))}</span>` : ""}</div>
        ${chip(false, "toggleTimer", tr("collapse"))}
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="ww-palette" style="margin:0">${[30, 60, 90, 120].map((d) => chip(T.dur === d, "tDur", tr("sec", { n: d }), String(d))).join("")}${chip(false, "tAdd", tr("plus15"), "15")}</div>
      <div class="ww-palette" style="margin:6px 0 0">${al.map((x) => chip(T.speaker === x, "tSpeaker", String(x), String(x))).join("")}</div>
      <div class="ww-btns">
        ${T.running ? B("gold", "tPause", tr("pause")) : B("green", "tStart", tr(T.left < T.dur ? "resume" : "go"))}
        ${B("sec", "tReset", tr("reset"))}${B("sec", "tPrev", tr("prev"))}${B("", "tNext", tr("nextSpk"))}
      </div></div></div>`;
  }

  // ---------- another screen: the room ----------
  let room = store.get(RKEY, null); // { code, token } on the judge's phone
  if (!room || typeof room !== "object" || !/^[A-Z0-9]{6}$/.test(room.code || "")) room = null;
  let roomState = "", lastSent = "", pushT = null, roomErr = "";
  const siteBase = () => (window.HV_CONFIG && HV_CONFIG.siteUrl) || location.href.replace(/[^/]*$/, "");
  const roomUrl = (code) => `${siteBase()}werewolf.html?room=${code}`;
  function schedulePush() {
    if (!room || ROOM_VIEW || !window.HVLoans || !HVLoans.enabled) return;
    clearTimeout(pushT);
    pushT = setTimeout(push, 400);
  }
  async function push() {
    if (!room) return;
    const st = pubState();
    const key = JSON.stringify({ ...st, timer: { ...st.timer, left: st.timer.running ? 0 : st.timer.left } });
    if (key === lastSent) return;
    try {
      const ok = await HVLoans.werewolfSet(room.code, room.token, st);
      if (ok === false) {
        roomErr = tr("roomGone");
        room = null;
        store.set(RKEY, null);
      } else {
        lastSent = key;
        roomErr = "";
      }
    } catch (err) {
      roomErr = tr("roomFail", { msg: err.message });
    }
    if ($("modal").querySelector("[data-show]")) openShow();
  }
  async function openRoom() {
    roomState = "opening";
    openShow();
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const token = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
      const code = await HVLoans.werewolfOpen(token);
      room = { code, token };
      store.set(RKEY, room);
      lastSent = "";
      roomErr = "";
      await push();
    } catch (err) {
      roomErr = tr("roomFail", { msg: err.message });
    }
    roomState = "";
    openShow();
  }
  function openShow() {
    const remote = window.HVLoans && HVLoans.enabled;
    let r = "";
    if (!remote) r = `<p class="hint">${esc(tr("roomNoBackend"))}</p>`;
    else if (room)
      r = `<div class="ww-roomcode"><span>${esc(tr("roomOn"))}</span><b>${esc(room.code)}</b></div>
        <p class="hint">${esc(tr("roomLink"))}</p><p class="ww-url">${esc(roomUrl(room.code))}</p>
        <div class="ww-btns">${B("", "copyRoom", tr("copyLink"))}${B("sec", "closeRoom", tr("roomClose"))}</div>`;
    else r = `<p class="hint">${esc(tr("showRemoteHint"))}</p><div class="ww-btns">${B("", "openRoom", roomState === "opening" ? tr("roomOpening") : tr("showRemote"), { dis: roomState === "opening" })}</div>`;
    modal(`<div data-show><h2>${esc(tr("showTitle"))}</h2><p class="hint">${esc(tr("showHint"))}</p>
      <div class="ww-btns">${B("green", "showLocal", tr("showLocal"))}</div>
      <hr class="ww-hr">${r}${roomErr ? `<p class="bad">${esc(roomErr)}</p>` : ""}
      <div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}</div></div>`);
  }

  // ---------- the players' screen on another device ----------
  let viewState = null, viewAt = "", viewErr = "", viewTimer = null, viewTimerAt = 0;
  async function poll() {
    try {
      const r = await HVLoans.werewolfGet(ROOM_VIEW);
      if (!r) {
        viewErr = "noRoom";
        viewState = null;
      } else {
        viewErr = "";
        if (r.updated_at !== viewAt) {
          viewAt = r.updated_at;
          viewState = r.state;
          const tm = viewState && viewState.timer;
          if (tm && (!viewTimer || N(tm.mark) !== N(viewTimer.mark))) {
            viewTimer = tm;
            viewTimerAt = Date.now();
          }
        }
      }
    } catch {
      viewErr = "offline";
    }
    renderView();
  }
  function viewLeft() {
    if (!viewTimer) return 0;
    return viewTimer.running ? N(viewTimer.left) - (Date.now() - viewTimerAt) / 1000 : N(viewTimer.left);
  }
  function renderView() {
    document.documentElement.lang = lang() === "zh" ? "zh-CN" : "en";
    document.title = `${tr("pubTitle")} · ${window.HVI18n ? HVI18n.t("siteName") : ""}`;
    $("ww-title").textContent = tr("pubTitle");
    $("ww-back").textContent = tr("back");
    $("lang-toggle").textContent = tr("toggle");
    $("lang-toggle").setAttribute("aria-label", tr("toggleLabel"));
    const tag = $("ww-phase");
    tag.className = "ww-phase";
    tag.textContent = tr("pubRoom", { code: ROOM_VIEW });
    let h = "";
    if (!window.HVLoans || !HVLoans.enabled) h = `<div class="ww-card"><p class="hint">${esc(tr("roomNoBackend"))}</p></div>`;
    else if (viewErr === "noRoom") h = `<div class="ww-card"><p class="bad">${esc(tr("pubNoRoom", { code: ROOM_VIEW }))}</p></div>` + joinCard();
    else if (!viewState) h = `<div class="ww-card ww-center"><p class="hint">${esc(viewErr === "offline" ? tr("pubOffline") : tr("pubLoading"))}</p></div>`;
    else h = (viewErr === "offline" ? `<p class="bad">${esc(tr("pubOffline"))}</p>` : "") + renderPub(viewState);
    $("app").innerHTML = h;
    drawViewClock();
  }
  function drawViewClock() {
    const box = $("pub-timer");
    if (box) box.innerHTML = pubClockHtml(viewTimer, viewLeft());
  }

  // ---------- taps ----------
  const actions = {
    setBoard: (b) => {
      if (!BOARDS[b]) return;
      S.cfg.board = b;
      S.cfg.wolves = BOARDS[b].wolves;
      fixVil();
      initPlayers();
      if (!["wolf", "vil", ...BOARDS[b].specials].includes(ui.brush)) ui.brush = "wolf";
      render();
    },
    setN: (d) => {
      S.cfg.n = Math.min(18, Math.max(8, S.cfg.n + N(d)));
      fixVil();
      initPlayers();
      render();
    },
    setW: (d) => {
      S.cfg.wolves += N(d);
      fixVil();
      render();
    },
    cfg: (kv) => {
      const [k, v] = kv.split(":");
      S.cfg[k] = v === "0" ? false : v === "1" ? true : v;
      render();
    },
    brush: (r) => {
      ui.brush = r || null;
      render();
    },
    randomDeal,
    startGame,
    openHistory: () => {
      tab = "history";
      ui.open = 0;
      render();
    },
    closeHistory: () => {
      tab = "game";
      render();
    },
    nightNext: () => nightSet({}),
    nightKill: (s) => nightSet({ kill: N(s) || null }),
    nightCharm: (s) => nightSet({ charm: N(s) || null }),
    nightSave: () => nightSet({ save: true }),
    nightPoison: (s) => nightSet({ poison: N(s) || null }),
    nightCheck: (s) => nightSet({ check: N(s) || null }, false),
    startDay: () => act(startDay),
    announce,
    toNight,
    resolve: (s) => resolve(N(s) || null),
    noCand: () => act(() => {
      LP("noCand");
      setSheriffInner(null);
    }),
    confirmCands: () => act(() => {
      const e = S.elect;
      LP("cands", { up: e.cands.slice(), down: alive().map((p) => p.seat).filter((x) => !e.cands.includes(x)) });
      e.stage = "speech";
    }),
    startElectVote,
    startExileVote,
    tgt: (s) => {
      ui.tgt = N(s);
      render();
    },
    restAbstain: () => {
      const v = S.vote;
      v.voters.forEach((x) => {
        if (!(x in v.ballots)) v.ballots[x] = 0;
      });
      render();
    },
    clearVotes: () => {
      S.vote.ballots = {};
      render();
    },
    finishVote: (a) => {
      const [kind, t] = a.split(":");
      finishVote(kind, N(t));
    },
    openExplode,
    openDuel,
    duel: (s) => duel(N(s)),
    explode: (s) => explode(N(s)),
    closeModal,
    newGame,
    confirmNew: () =>
      modal(`<h2>${esc(tr("newConfirm"))}</h2><p class="hint">${esc(tr("newConfirmHint"))}</p><div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}${B("red", "doNew", tr("ok"))}</div>`),
    doNew: () => {
      closeModal();
      newGame();
    },
    copyLog: (_, btn) => copyText(`${tr("logHead", { board: boardName(S.cfg.board) })}\n${logText(S.log, judgeRole)}`, btn),
    openGame: (i) => {
      ui.open = ui.open === N(i) ? null : N(i);
      render();
    },
    copyGame: (i, btn) => copyText(gameText(archive[N(i)]), btn),
    delGame: (i) =>
      modal(`<h2>${esc(tr("delConfirm"))}</h2><p class="hint">${esc(tr("delHint", { t: fmtT(archive[N(i)].t) }))}</p><div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}${B("red", "doDel", tr("del"), { args: String(i) })}</div>`),
    doDel: (i) => {
      closeModal();
      archive.splice(N(i), 1);
      store.set(ARCH, archive);
      ui.open = null;
      render();
    },
    toggleTimer: () => {
      T.open = !T.open;
      changed();
      drawTimer();
    },
    tDur: (d) => tDur(N(d)),
    tAdd: (s) => tAdd(N(s)),
    tSpeaker: (s) => tSpeaker(N(s)),
    tStart,
    tPause,
    tReset,
    tPrev: () => tNext(-1),
    tNext: () => tNext(1),
    showLocal: () => {
      closeModal();
      ui.viewer = true;
      render();
    },
    exitViewer: () => {
      if (!confirm(tr("peekWarn"))) return;
      ui.viewer = false;
      render();
    },
    openShow,
    openRoom: () => void openRoom(),
    closeRoom: () => {
      room = null;
      store.set(RKEY, null);
      openShow();
    },
    copyRoom: (_, btn) => room && copyText(roomUrl(room.code), btn),
  };
  const taps = {
    pickSel: (s) => {
      ui.sel = ui.sel === s ? null : s;
      render();
    },
    paint: (s) => {
      P(s).role = ui.brush;
      render();
    },
    togCand: (s) => {
      const c = S.elect.cands, i = c.indexOf(s);
      i < 0 ? c.push(s) : c.splice(i, 1);
      render();
    },
    togWd: (s) => {
      const c = S.elect.withdrawn, i = c.indexOf(s);
      i < 0 ? c.push(s) : c.splice(i, 1);
      render();
    },
    castVote: (s) => {
      const b = S.vote.ballots;
      if (b[s] === ui.tgt) delete b[s];
      else b[s] = ui.tgt;
      render();
    },
  };
  document.addEventListener("click", (e) => {
    if (e.target.matches && e.target.matches("[data-modal-bg]")) return closeModal();
    const t = e.target.closest("[data-tap]");
    if (t && taps[t.dataset.tap]) return taps[t.dataset.tap](N(t.dataset.seat));
    const tb = e.target.closest("[data-tab]");
    if (tb) {
      tab = tb.dataset.tab;
      return render();
    }
    const b = e.target.closest("[data-act]");
    if (b && !b.disabled && actions[b.dataset.act]) actions[b.dataset.act](b.dataset.args ?? "", b);
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-hide]")) {
      S.cfg.hideRoles = e.target.checked;
      render();
    }
  });
  document.addEventListener("submit", (e) => {
    if (!e.target.matches("[data-join]")) return;
    e.preventDefault();
    const code = String(e.target.elements.code.value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length === 6) location.href = `werewolf.html?room=${code}${GAME_ID ? `&game=${GAME_ID}` : ""}`;
    else e.target.elements.code.focus();
  });

  // ---------- start ----------
  const back = GAME_ID ? `index.html#/game/${encodeURIComponent(GAME_ID)}` : "index.html";
  $("ww-back").href = back;
  $("ww-home").href = back;
  $("lang-toggle").addEventListener("click", () => HVI18n.toggle());
  if (ROOM_VIEW) {
    $("ww-undo").hidden = $("ww-tmr-btn").hidden = $("ww-show-btn").hidden = true;
    document.body.classList.add("ww-viewer");
    HVI18n.onChange(renderView);
    renderView();
    if (window.HVLoans && HVLoans.enabled) {
      poll();
      setInterval(() => document.visibilityState === "visible" && poll(), 2000);
      setInterval(drawViewClock, 250);
    }
  } else {
    load();
    fixVil();
    $("ww-undo").addEventListener("click", undo);
    HVI18n.onChange(render);
    render();
  }
})();
