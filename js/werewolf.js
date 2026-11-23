// Werewolf judge's recorder (werewolf.html), linked from every 狼人杀 game ("judge" in data/games.json).
//
// Two views:
//   • the judge's view (only on the judge's phone): pick a board (or the roles one by one), deal the roles, run each
//     night step by step, the sheriff election, vote counting, a speaking timer, the full log and past games. Roles:
//     werewolf, wolf beauty, villager, seer, witch, hunter, knight; from 米勒山谷狼人：新月 the defender (守卫), elder
//     (长老), scapegoat (替罪羊), idiot (白痴) and piper (吹笛人, plays alone); and the 网易狼人杀 roles 狼王, 白狼王,
//     石像鬼, 恶灵骑士, 梦魇, 血月使徒, 隐狼, 守墓人, 通灵师, 摄梦人, 猎魔人, 乌鸦 and 魔术师;
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
      ruleGuard: "守卫：每晚第一个睁眼，守护一人（可以守自己），不能连续两晚守同一人；被守护的人当晚不会被狼杀。",
      ruleElder: "长老：第一次被狼刀不会死（第二次才死）；如果被投票放逐、被毒或被猎人带走，所有好人神职从此失去技能。",
      ruleGoat: "替罪羊：放逐投票平票时，由替罪羊代替出局，并决定第二天谁可以投票。",
      rulePiper: "吹笛人：自己一个阵营。每晚迷惑两名玩家（不能迷惑自己），被迷惑的玩家睁眼互认；当所有存活玩家都被迷惑时，吹笛人独自获胜。",
      customRoles: "选择这局用到的神职和特殊角色（点选加入，再点移除）：",
      guardWitch: "同一晚被守护又被女巫救",
      guardDie: "同守同救则死",
      guardLive: "仍然活着",
      stepGuard: "守卫",
      stepPiper: "吹笛人",
      guardOpen: "🛡️ 守卫请睁眼",
      guardHint: "请选择今晚要守护的玩家（可以守自己{ban}）。",
      guardBan: "；不能连续守 {s}",
      noGuard: "空守",
      confirmGuard: "守护 {s}",
      piperOpen: "🎵 吹笛人请睁眼",
      piperHint: "请选择今晚要迷惑的两名玩家（不能迷惑自己，已被迷惑的不用再选）。",
      confirmPipe: "迷惑 {list}",
      pipedWake: "🎵 请所有被迷惑的玩家睁眼互认：{list}，然后闭眼。",
      powersLost: "⚠️ 长老被好人害死，神职已经失去技能：照常念流程，假装等待即可。",
      guard: "守卫",
      piper: "吹笛人",
      piped: "已被迷惑",
      elderSaved: "长老第一次被狼刀，没有死",
      goatOut: "平票 → 替罪羊 {s} 出局",
      goatHint: "替罪羊出局后，由他决定明天谁可以投票（投票时把不能投票的人记为弃票）。",
      winPiper: "🎵 吹笛人独自获胜",
      piperWin: "吹笛人胜",
      solo: "🎵 吹笛人 {n}",
      c_goat: "平票时替罪",
      p_guard: "🛡️ 守卫守 {s}",
      p_pipe: "🎵 吹笛人迷惑 {list}",
      p_elder: "👴 长老挡下第一刀",
      e_elderLost: "👴 长老被好人害死：所有神职失去技能",
      e_goat: "🐐 平票，替罪羊 {s} 代替出局",
      e_win_piper: "🏆 所有存活玩家都被迷惑，吹笛人独自获胜",
      ruleWolfking: "狼王：和狼队一起刀人；出局时可以开枪带走一人（被毒、自爆、被恐惧的当晚出局则不能开枪）。",
      ruleWhitewolf: "白狼王：白天发言阶段可以自爆，并带走一名玩家，之后直接天黑（投票和遗言阶段不能用）。",
      ruleGargoyle: "石像鬼：夜里不和狼队见面，每晚查验一人的具体身份；其他狼人全部出局后，由他刀人。",
      ruleEvilknight: "恶灵骑士：夜里不会死（刀、毒都无效，猎人和白狼王也带不走），只能被投票放逐；预言家查验他，预言家当晚死亡（反伤）；女巫毒他，女巫当晚死亡。",
      ruleNightmare: "梦魇：每晚最先睁眼，恐惧一名好人，被恐惧的人当晚不能使用技能；不能连续两晚恐惧同一人。",
      ruleBloodmoon: "血月使徒：自爆后直接天黑，当晚所有神职技能被封印；作为最后一只狼时自爆，封印无效。",
      ruleHiddenwolf: "隐狼：夜里不和狼队见面，被预言家查验是好人；其他狼人全部出局后，由他刀人。",
      ruleGravekeeper: "守墓人：每晚得知前一个白天被放逐的玩家是好人还是狼人。",
      rulePsychic: "通灵师：每晚查验一人的具体身份。",
      ruleDreamer: "摄梦人：每晚选一人入梦，梦游者当晚不会被刀、被毒；连续两晚选同一人，那人死亡；摄梦人夜里死亡，梦游者一起死亡。",
      ruleDemonhunter: "猎魔人：从第二晚起可以狩猎一人：是狼人则狼人死亡，是好人则猎魔人自己死亡；女巫的毒对他无效。",
      ruleCrow: "乌鸦：每晚诅咒一人，那人第二天的放逐投票额外多一票。",
      ruleMagician: "魔术师：每晚最先睁眼，可以交换两个人的号码牌，当晚所有对这两人的技能互换对象；每人整局只能被交换一次。",
      groupGods: "神职",
      groupWolves: "狼人阵营",
      groupSolo: "第三方",
      stepMagician: "魔术师",
      stepNightmare: "梦魇",
      stepDreamer: "摄梦人",
      stepGargoyle: "石像鬼",
      stepPsychic: "通灵师",
      stepGravekeeper: "守墓人",
      stepDemonhunter: "猎魔人",
      stepCrow: "乌鸦",
      magicianOpen: "🎩 魔术师请睁眼",
      magicianHint: "选择要交换号码牌的两名玩家（可以包括自己；每人整局只能被交换一次），或者不交换。",
      noSwap: "不交换",
      confirmSwap: "交换 {list}",
      swapNote: "🎩 今晚 {a} 和 {b} 已交换：对他们的技能会互换对象。",
      nightmareOpen: "😱 梦魇请睁眼",
      nightmareHint: "选择今晚要恐惧的玩家（不能连续两晚同一人{ban}）。",
      noFear: "不恐惧",
      confirmFear: "恐惧 {s}",
      dreamerOpen: "🌙 摄梦人请睁眼",
      dreamerHint: "选择今晚的梦游者（连续两晚同一人会让他死亡{last}）。",
      dreamLast: "；昨晚是 {s}",
      noDream: "不选",
      confirmDream: "入梦 {s}",
      gargoyleOpen: "🗿 石像鬼请睁眼",
      gargoyleHint: "选择要查验具体身份的玩家。",
      psychicOpen: "🔮 通灵师请睁眼",
      psychicHint: "选择要查验具体身份的玩家。",
      gravekeeperOpen: "⚰️ 守墓人请睁眼",
      graveResult: "昨天被放逐的 {s}：{res}",
      graveNone: "昨天没有人被放逐。",
      demonhunterOpen: "🗡️ 猎魔人请睁眼",
      demonhunterHint: "选择要狩猎的玩家，或者不狩猎。是狼人则狼人死亡，是好人则猎魔人死亡。",
      demonhunterFirst: "第一晚不能狩猎。",
      noHunt: "不狩猎",
      confirmHunt: "狩猎 {s}",
      crowOpen: "🐦 乌鸦请睁眼",
      crowHint: "选择要诅咒的玩家：他第二天的放逐投票多一票。",
      noCurse: "不诅咒",
      confirmCurse: "诅咒 {s}",
      roleIs: "{s} · {role}",
      blockedFear: "😱 {role} 今晚被梦魇恐惧，不能使用技能：照常念流程，假装等待即可。",
      blockedBlood: "🩸 血月使徒自爆，今晚所有神职技能被封印：照常念流程，假装等待即可。",
      wakeWolves: "存活狼人：{list}。请选择今晚要击杀的玩家。",
      loneWolves: "其他狼人都已出局，由 {list} 刀人。",
      hiddenNote: "（{list} 不和狼队见面）",
      swapRow: "魔术师",
      fearRow: "梦魇",
      dreamRow: "摄梦人",
      gargRow: "石像鬼",
      psyRow: "通灵师",
      huntRow: "猎魔人",
      curseRow: "乌鸦",
      actualVictim: "（魔术师交换后，实际是 {s}）",
      takeWho: "🐺 白狼王 {s} 带走谁？",
      takeHint: "选择和白狼王同归于尽的玩家。",
      noTake: "不带人",
      bloodLast: "这是最后一只狼，血月封印无效。",
      curseTag: "🐦+1",
      curseHint: "乌鸦诅咒：{s} 额外多一票。",
      c_backlash: "反伤",
      c_dream: "梦中死亡",
      c_hunt: "猎魔",
      c_take: "被白狼王带走",
      p_swap: "🎩 魔术师交换 {a} 和 {b}",
      p_fear: "😱 梦魇恐惧 {s}",
      p_dream: "🌙 摄梦人入梦 {s}",
      p_gcheck: "🗿 石像鬼验 {s} → {role}",
      p_pcheck: "🔮 通灵师验 {s} → {role}",
      p_hunt: "🗡️ 猎魔人狩猎 {s}",
      p_curse: "🐦 乌鸦诅咒 {s}",
      e_take: "🐺 白狼王 {s} 自爆，带走 {t}",
      e_bloodmoon: "🩸 血月使徒 {s} 自爆：今晚所有神职技能被封印",
      e_immune: "🛡️ {s} 免疫这次伤害",
      e_noShot2: "🔫 {s} 不能开枪（{cause}）",
      e_shot2: "🔫 {h} 开枪带走 {t}",
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
      hunterSkill: "🔫 {s} 发动技能",
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
      ruleGuard: "Defender: wakes first each night and protects a player from the wolves (may protect herself), never the same player two nights running.",
      ruleElder: "Elder: survives the first werewolf attack (dies at the second). If the village kills her (vote, poison or the hunter), every good role loses its power for the rest of the game.",
      ruleGoat: "Scapegoat: when the exile vote is tied, the scapegoat is out instead, and decides who may vote the next day.",
      rulePiper: "Piper: plays alone. Each night charms two players (not herself); the charmed players wake and see each other. When every player left is charmed, the piper wins alone.",
      customRoles: "Pick the special roles in this game (tap to add, tap again to remove):",
      guardWitch: "Protected and saved by the witch the same night",
      guardDie: "dies",
      guardLive: "lives",
      stepGuard: "Defender",
      stepPiper: "Piper",
      guardOpen: "🛡️ Defender, wake up",
      guardHint: "Pick a player to protect tonight (herself allowed{ban}).",
      guardBan: "; not {s} again",
      noGuard: "No one",
      confirmGuard: "Protect {s}",
      piperOpen: "🎵 Piper, wake up",
      piperHint: "Pick two players to charm (not herself; players already charmed don't count).",
      confirmPipe: "Charm {list}",
      pipedWake: "🎵 Charmed players, wake up and see each other: {list}. Then sleep.",
      powersLost: "⚠️ The village killed the elder, so the good roles have lost their powers: call this step and pretend to wait.",
      guard: "Defender",
      piper: "Piper",
      piped: "charmed",
      elderSaved: "The elder survived her first werewolf attack",
      goatOut: "Tie → scapegoat {s} is out",
      goatHint: "The scapegoat now decides who may vote tomorrow (mark the others as abstaining).",
      winPiper: "🎵 The piper wins alone",
      piperWin: "Piper wins",
      solo: "🎵 Piper {n}",
      c_goat: "scapegoat on a tie",
      p_guard: "🛡️ Defender protected {s}",
      p_pipe: "🎵 Piper charmed {list}",
      p_elder: "👴 The elder survived the attack",
      e_elderLost: "👴 The village killed the elder: the good roles lose their powers",
      e_goat: "🐐 Tied vote: scapegoat {s} is out instead",
      e_win_piper: "🏆 Every player left is charmed: the piper wins alone",
      ruleWolfking: "Wolf King: kills with the wolves; when out, may shoot a player (not if poisoned, self-destructed, or out on a night he was feared).",
      ruleWhitewolf: "White Wolf King: during the day's talk may self-destruct and take a player along; night falls at once (not during the vote or last words).",
      ruleGargoyle: "Gargoyle: doesn't meet the wolves at night; checks a player's exact role each night; once the other wolves are out, he makes the kill.",
      ruleEvilknight: "Evil Knight: can't die at night (wolves and poison fail, the hunter and White Wolf King can't take him); only an exile vote removes him. A seer who checks him dies that night; a witch who poisons him dies that night.",
      ruleNightmare: "Nightmare: wakes first each night and frightens a good player, who can't use a skill that night; never the same player two nights running.",
      ruleBloodmoon: "Blood Moon Apostle: self-destructs and night falls at once; that night every god's skill is sealed. As the last wolf, the seal doesn't work.",
      ruleHiddenwolf: "Hidden Wolf: doesn't meet the wolves at night and checks as good; once the other wolves are out, he makes the kill.",
      ruleGravekeeper: "Gravekeeper: each night learns whether the player exiled the day before was good or a werewolf.",
      rulePsychic: "Psychic: checks a player's exact role each night.",
      ruleDreamer: "Dreamweaver: each night puts a player into a dream; they can't be killed or poisoned that night. The same player two nights running dies; if the dreamweaver dies at night, the dreamer dies too.",
      ruleDemonhunter: "Demon Hunter: from night 2 may hunt a player: a werewolf dies, a good player means the hunter dies. Immune to the witch's poison.",
      ruleCrow: "Crow: each night curses a player, who gets one extra vote in the next day's exile vote.",
      ruleMagician: "Magician: wakes first each night and may swap two players' number cards: that night every skill aimed at one goes to the other. Each player can be swapped once a game.",
      groupGods: "Gods",
      groupWolves: "Werewolf side",
      groupSolo: "Own side",
      stepMagician: "Magician",
      stepNightmare: "Nightmare",
      stepDreamer: "Dreamweaver",
      stepGargoyle: "Gargoyle",
      stepPsychic: "Psychic",
      stepGravekeeper: "Gravekeeper",
      stepDemonhunter: "Demon hunter",
      stepCrow: "Crow",
      magicianOpen: "🎩 Magician, wake up",
      magicianHint: "Pick two players to swap (herself allowed; each player once a game), or no swap.",
      noSwap: "No swap",
      confirmSwap: "Swap {list}",
      swapNote: "🎩 Tonight {a} and {b} are swapped: skills aimed at one go to the other.",
      nightmareOpen: "😱 Nightmare, wake up",
      nightmareHint: "Pick a player to frighten tonight (not the same two nights running{ban}).",
      noFear: "No one",
      confirmFear: "Frighten {s}",
      dreamerOpen: "🌙 Dreamweaver, wake up",
      dreamerHint: "Pick tonight's dreamer (the same player two nights running dies{last}).",
      dreamLast: "; last night: {s}",
      noDream: "No one",
      confirmDream: "Dream {s}",
      gargoyleOpen: "🗿 Gargoyle, wake up",
      gargoyleHint: "Pick a player to see their exact role.",
      psychicOpen: "🔮 Psychic, wake up",
      psychicHint: "Pick a player to see their exact role.",
      gravekeeperOpen: "⚰️ Gravekeeper, wake up",
      graveResult: "Exiled yesterday, {s}: {res}",
      graveNone: "Nobody was exiled yesterday.",
      demonhunterOpen: "🗡️ Demon hunter, wake up",
      demonhunterHint: "Pick a player to hunt, or none. A werewolf dies; a good player means the hunter dies.",
      demonhunterFirst: "No hunting on the first night.",
      noHunt: "No hunt",
      confirmHunt: "Hunt {s}",
      crowOpen: "🐦 Crow, wake up",
      crowHint: "Pick a player to curse: one extra vote against them tomorrow.",
      noCurse: "No curse",
      confirmCurse: "Curse {s}",
      roleIs: "{s} · {role}",
      blockedFear: "😱 The {role} is frightened by the nightmare tonight and can't use a skill: call this step and pretend to wait.",
      blockedBlood: "🩸 The Blood Moon Apostle self-destructed: every god's skill is sealed tonight. Call this step and pretend to wait.",
      wakeWolves: "Werewolves alive: {list}. Pick tonight's victim.",
      loneWolves: "The other wolves are out: {list} makes the kill.",
      hiddenNote: " ({list} don't meet the pack)",
      swapRow: "Magician",
      fearRow: "Nightmare",
      dreamRow: "Dreamweaver",
      gargRow: "Gargoyle",
      psyRow: "Psychic",
      huntRow: "Demon hunter",
      curseRow: "Crow",
      actualVictim: " (after the magician's swap it's {s})",
      takeWho: "🐺 White Wolf King {s} takes whom?",
      takeHint: "Pick the player who goes out with the White Wolf King.",
      noTake: "Nobody",
      bloodLast: "This is the last wolf: the blood moon seal doesn't work.",
      curseTag: "🐦+1",
      curseHint: "Crow's curse: {s} has one extra vote.",
      c_backlash: "backlash",
      c_dream: "died in a dream",
      c_hunt: "demon hunt",
      c_take: "taken by the White Wolf King",
      p_swap: "🎩 Magician swapped {a} and {b}",
      p_fear: "😱 Nightmare frightened {s}",
      p_dream: "🌙 Dreamweaver dreamed {s}",
      p_gcheck: "🗿 Gargoyle checked {s} → {role}",
      p_pcheck: "🔮 Psychic checked {s} → {role}",
      p_hunt: "🗡️ Demon hunter hunted {s}",
      p_curse: "🐦 Crow cursed {s}",
      e_take: "🐺 White Wolf King {s} self-destructs and takes {t}",
      e_bloodmoon: "🩸 Blood Moon Apostle {s} self-destructs: every god's skill is sealed tonight",
      e_immune: "🛡️ {s} is immune to this",
      e_noShot2: "🔫 {s} can't shoot ({cause})",
      e_shot2: "🔫 {h} shoots {t}",
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
      hunterSkill: "🔫 {s} shoots",
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
    wolfking: { zh: "狼王", en: "Wolf King", c: "wolf", side: "wolf" },
    whitewolf: { zh: "白狼王", en: "White Wolf King", c: "wolf", side: "wolf" },
    gargoyle: { zh: "石像鬼", en: "Gargoyle", c: "wolf", side: "wolf" },
    evilknight: { zh: "恶灵骑士", en: "Evil Knight", c: "wolf", side: "wolf" },
    nightmare: { zh: "梦魇", en: "Nightmare", c: "wolf", side: "wolf" },
    bloodmoon: { zh: "血月使徒", en: "Blood Moon Apostle", c: "wolf", side: "wolf" },
    hiddenwolf: { zh: "隐狼", en: "Hidden Wolf", c: "wolf", side: "wolf" },
    vil: { zh: "平民", en: "Villager", c: "vil", side: "vil" },
    seer: { zh: "预言家", en: "Seer", c: "god", side: "god" },
    witch: { zh: "女巫", en: "Witch", c: "god", side: "god" },
    hunter: { zh: "猎人", en: "Hunter", c: "god", side: "god" },
    knight: { zh: "骑士", en: "Knight", c: "god", side: "god" },
    idiot: { zh: "白痴", en: "Idiot", c: "god", side: "god" },
    guard: { zh: "守卫", en: "Defender", c: "god", side: "god" },
    elder: { zh: "长老", en: "Elder", c: "god", side: "god" },
    scapegoat: { zh: "替罪羊", en: "Scapegoat", c: "god", side: "god" },
    gravekeeper: { zh: "守墓人", en: "Gravekeeper", c: "god", side: "god" },
    psychic: { zh: "通灵师", en: "Psychic", c: "god", side: "god" },
    dreamer: { zh: "摄梦人", en: "Dreamweaver", c: "god", side: "god" },
    demonhunter: { zh: "猎魔人", en: "Demon Hunter", c: "god", side: "god" },
    crow: { zh: "乌鸦", en: "Crow", c: "god", side: "god" },
    magician: { zh: "魔术师", en: "Magician", c: "god", side: "god" },
    piper: { zh: "吹笛人", en: "Piper", c: "solo", side: "solo" },
  };
  // Every special role a board can use, grouped for the 自选角色 picker.
  const SPECIAL_GROUPS = [
    ["groupGods", ["seer", "witch", "hunter", "guard", "idiot", "knight", "elder", "scapegoat", "gravekeeper", "psychic", "dreamer", "demonhunter", "crow", "magician"]],
    ["groupWolves", ["wolfking", "whitewolf", "beauty", "gargoyle", "evilknight", "nightmare", "bloodmoon", "hiddenwolf"]],
    ["groupSolo", ["piper"]],
  ];
  const SPECIALS = SPECIAL_GROUPS.flatMap((g) => g[1]);
  // Wolves that don't wake with the pack (they make the kill once the others are out), and wolves that can self-destruct.
  const LONE_WOLVES = ["gargoyle", "hiddenwolf"];
  const CAN_EXPLODE = ["wolf", "wolfking", "whitewolf", "evilknight", "nightmare", "bloodmoon"];
  const BOARDS = {
    beauty: { zh: "预女猎骑·狼美人", en: "Seer, Witch, Hunter, Knight · Wolf Beauty", specials: ["beauty", "seer", "witch", "hunter", "knight"], wolves: 3 },
    classic: { zh: "预女猎白", en: "Seer, Witch, Hunter, Idiot", specials: ["seer", "witch", "hunter", "idiot"], wolves: 4 },
    guard: { zh: "预女猎守", en: "Seer, Witch, Hunter, Defender", specials: ["seer", "witch", "hunter", "guard"], wolves: 4 },
    wolfking: { zh: "狼王守卫", en: "Wolf King · Defender", specials: ["wolfking", "seer", "witch", "hunter", "guard"], wolves: 3 },
    whitewolf: { zh: "白狼王骑士", en: "White Wolf King · Knight", specials: ["whitewolf", "seer", "witch", "guard", "knight"], wolves: 3 },
    gargoyle: { zh: "石像鬼守墓人", en: "Gargoyle · Gravekeeper", specials: ["gargoyle", "seer", "witch", "hunter", "gravekeeper"], wolves: 3 },
    evilknight: { zh: "恶灵骑士", en: "Evil Knight", specials: ["evilknight", "seer", "witch", "hunter", "guard"], wolves: 3 },
    nightmare: { zh: "梦魇守卫", en: "Nightmare · Defender", specials: ["nightmare", "seer", "witch", "hunter", "guard"], wolves: 3 },
    bloodmoon: { zh: "血月猎魔", en: "Blood Moon · Demon Hunter", specials: ["bloodmoon", "seer", "witch", "guard", "demonhunter"], wolves: 3 },
    newmoon: { zh: "米勒山谷·新月", en: "Miller's Hollow · New Moon", specials: ["seer", "witch", "hunter", "guard", "idiot", "elder", "scapegoat", "piper"], wolves: 3, n: 14 },
    custom: { zh: "自选角色", en: "Pick the roles", specials: null, wolves: 3 },
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
      lastGuard: null, piped: [], elderHit: false, powersLost: false,
      lastFear: null, fear: null, lastDream: null, swapped: [], curse: null, lastExiled: null, bloodNight: 0,
      elect: { stage: "signup", cands: [], withdrawn: [] }, vote: null, seq: 0,
    };
  }
  // The custom board keeps its roles in cfg.custom.
  const BOARD = () => {
    const b = BOARDS[S.cfg.board] || BOARDS.beauty;
    return b.specials ? b : { ...b, specials: SPECIALS.filter((r) => (S.cfg.custom || []).includes(r)) };
  };
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
      if (!S.piped) S.piped = [];
      if (!S.swapped) S.swapped = [];
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
  const seerSees = (s) => isWolf(s) && P(s).role !== "hiddenwolf"; // what the seer is told
  const roleAt = (s) => (P(s) ? P(s).role : null);
  const seatOf = (r) => (byRole(r) ? byRole(r).seat : null);
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
        if (v.guard) parts.unshift(tr("p_guard", { s: s(v.guard) }));
        if (v.dream) parts.unshift(tr("p_dream", { s: s(v.dream) }));
        if (v.fear) parts.unshift(tr("p_fear", { s: s(v.fear) }));
        if (v.swap && v.swap.length === 2) parts.unshift(tr("p_swap", { a: s(v.swap[0]), b: s(v.swap[1]) }));
        if (v.gcheck) parts.push(tr("p_gcheck", { s: s(v.gcheck), role: rn(v.grole) }));
        if (v.pcheck) parts.push(tr("p_pcheck", { s: s(v.pcheck), role: rn(v.prole) }));
        if (v.hunt) parts.push(tr("p_hunt", { s: s(v.hunt) }));
        if (v.curse) parts.push(tr("p_curse", { s: s(v.curse) }));
        if (v.pipe && v.pipe.length) parts.push(tr("p_pipe", { list: list(v.pipe, roleOf) }));
        if (v.elder) parts.push(tr("p_elder"));
        return parts.join(lang() === "zh" ? "；" : "; ");
      }
      case "death": return tr("e_death", { s: s(v.s), cause: tr("c_" + (CAUSES.includes(v.cause) ? v.cause : "wolf")) });
      case "hunterPoison": return tr("e_hunterPoison");
      case "hunterCharm": return tr("e_hunterCharm");
      case "beautyDuel": return tr("e_beautyDuel", { s: s(v.s) });
      case "beautyCharm": return tr("e_beautyCharm", { s: s(v.s) });
      case "win": return tr("e_win_" + (["good", "god", "vil", "all", "piper"].includes(v.w) ? v.w : "good"));
      case "elderLost": return tr("e_elderLost");
      case "take": return tr("e_take", { s: s(v.s), t: s(v.t) });
      case "bloodmoon": return tr("e_bloodmoon", { s: s(v.s) });
      case "immune": return tr("e_immune", { s: s(v.s) });
      case "noShot2": return tr("e_noShot2", { s: s(v.s), cause: tr("c_" + (CAUSES.includes(v.cause) ? v.cause : "wolf")) });
      case "goat": return tr("e_goat", { s: s(v.s) });
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
          rows: (rows.join(lang() === "zh" ? "；" : "; ") || tr("noVotesYet")) + (v.curse ? ` ${tr("curseTag")}${tr("seat", { n: N(v.curse) })}` : ""),
          abst: v.abst && v.abst.length ? tr("abstList", { list: list(v.abst) }) : "",
        });
      }
      case "pk": return tr("e_pk", { list: list(v.list, roleOf) });
      case "noExile": return tr("e_noExile");
      case "exiled": return tr("e_exiled", { s: s(v.s) });
      case "shot": return tr(roleOf && roleOf(N(v.h)) === "hunter" ? "e_shot" : "e_shot2", { h: s(v.h), t: s(v.t) });
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
  const CAUSES = ["duel", "duelFail", "charm", "wolf", "poison", "exile", "shot", "explode", "goat", "backlash", "dream", "hunt", "take"];
  const PUBLIC_CAUSES = ["exile", "shot", "explode", "duel", "duelFail", "goat", "take"]; // night deaths stay "out"

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
  // Causes that stop a shot (hunter, wolf king): poison, dying with the beauty, dying in a dream, backlash.
  const NO_SHOT = ["poison", "charm", "dream", "backlash"];
  const NIGHT_CAUSES = ["wolf", "poison", "dream", "hunt", "backlash", "charm"];
  function kill(seat, cause) {
    const p = P(seat);
    if (!p || !p.alive) return;
    // The evil knight only leaves by an exile vote (or by self-destructing, or a knight's duel).
    if (p.role === "evilknight" && ["wolf", "poison", "shot", "hunt", "take", "dream"].includes(cause)) {
      L("immune", { s: seat });
      return;
    }
    p.alive = false;
    p.cause = cause;
    p.at = phaseKey();
    L("death", { s: seat, cause });
    if (cause === "charm" && !applyingNight) PL("out", { s: seat });
    // The village killing the elder takes every good role's power away.
    if (p.role === "elder" && ["exile", "poison", "shot", "goat"].includes(cause) && !S.powersLost) {
      S.powersLost = true;
      L("elderLost");
    }
    if (p.role === "hunter" || p.role === "wolfking") {
      const feared = S.fear === seat && NIGHT_CAUSES.includes(cause);
      if (p.role === "hunter" && S.powersLost) {} // no powers left: no shot (the log already says why)
      else if (NO_SHOT.includes(cause) || (p.role === "wolfking" && cause === "explode") || feared) L("noShot2", { s: seat, cause: feared ? "wolf" : cause });
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
    const piper = a.find((p) => p.role === "piper");
    const hasG = S.players.some((p) => sideOf(p.role) === "god"), hasV = S.players.some((p) => p.role === "vil");
    let win = null;
    // The piper wins the moment everyone else still in is charmed.
    if (piper && a.every((p) => p === piper || S.piped.includes(p.seat))) win = "piper";
    else if (w === 0 && !piper) win = "good";
    // 屠边 only counts a side the board has (a custom board may have no gods, or no villagers).
    else if (w > 0) {
      if (S.cfg.win === "side" ? (hasG && g === 0) || (hasV && v === 0) : g + v === 0) win = "wolf";
    }
    if (win && !S.winner) {
      S.winner = win;
      LP("win", { w: win === "piper" ? "piper" : win === "good" ? "good" : S.cfg.win === "city" ? "all" : hasG && g === 0 ? "god" : "vil" });
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
    S.night = { step: nightSteps()[0], kill: null, save: false, poison: null, check: null, charm: null, guard: null, pipe: [], swap: [], fear: null, dream: null, gcheck: null, pcheck: null, hunt: null, curse: null };
    S.day = null;
  }
  // Who dies at dawn. The magician's swap moves every skill aimed at one of the two to the other. The defender and
  // the dreamweaver stop the wolves (protected and saved the same night: cfg.guardWitch); the elder survives the
  // wolves once; the evil knight can't die at night and hurts back a seer who checks or a witch who poisons him;
  // the demon hunter is immune to poison and dies hunting a good player.
  function nightOutcome(n) {
    const sw = (x) => (!x || !n.swap || n.swap.length !== 2 ? x : x === n.swap[0] ? n.swap[1] : x === n.swap[1] ? n.swap[0] : x);
    const kill = sw(n.kill), guard = sw(n.guard), poison = sw(n.poison), dream = sw(n.dream), hunt = sw(n.hunt), check = sw(n.check);
    const d = [];
    const add = (seat, cause) => seat && !d.some((x) => x[0] === seat) && d.push([seat, cause]);
    let hit = kill && !(guard && guard === kill);
    if (kill && guard === kill && n.save && S.cfg.guardWitch !== "live") hit = true; // 同守同救则死
    else if (n.save) hit = false;
    if (hit && dream && kill === dream) hit = false; // the dreamer is safe tonight
    let elder = false;
    if (hit && roleAt(kill) === "elder" && !S.elderHit) {
      hit = false;
      elder = true;
    }
    if (hit && roleAt(kill) !== "evilknight") add(kill, "wolf");
    if (poison) {
      if (roleAt(poison) === "evilknight") add(seatOf("witch"), "backlash");
      else if (roleAt(poison) !== "demonhunter" && poison !== dream) add(poison, "poison");
    }
    if (check && roleAt(check) === "evilknight") add(seatOf("seer"), "backlash");
    if (hunt) {
      if (sideOf(roleAt(hunt)) === "wolf") roleAt(hunt) !== "evilknight" && add(hunt, "hunt");
      else add(seatOf("demonhunter"), "hunt");
    }
    if (dream && S.lastDream === dream) add(dream, "dream"); // the same dreamer two nights running
    const dw = seatOf("dreamer");
    if (dream && dw && d.some((x) => x[0] === dw)) add(dream, "dream"); // the dreamweaver takes the dreamer along
    return { deaths: d, elder, sw };
  }
  const nightDeaths = (n) => nightOutcome(n).deaths;
  function applyDeaths(deaths) {
    const before = alive().map((p) => p.seat);
    applyingNight = true;
    deaths.forEach((d) => kill(d[0], d[1]));
    applyingNight = false;
    PL("announce", { list: before.filter((s) => !P(s).alive) });
  }
  function startDay() {
    const n = S.night, out = nightOutcome(n), deaths = out.deaths;
    if (n.save) S.witch.anti = false;
    if (n.poison) S.witch.poison = false;
    if (out.elder) S.elderHit = true;
    S.lastGuard = n.guard || null;
    S.lastFear = n.fear || null;
    S.fear = n.fear || null;
    S.lastDream = n.dream || null;
    S.curse = n.curse ? { seat: n.curse, round: S.round } : null;
    (n.swap || []).forEach((x) => !S.swapped.includes(x) && S.swapped.push(x));
    (n.pipe || []).forEach((x) => !S.piped.includes(x) && S.piped.push(x));
    const chk = out.sw(n.check), g = out.sw(n.gcheck), ps = out.sw(n.pcheck);
    L("night", {
      kill: n.kill, save: n.save, poison: n.poison, charm: n.charm, check: n.check, res: chk ? seerSees(chk) : false, guard: n.guard, pipe: n.pipe, elder: out.elder,
      swap: n.swap, fear: n.fear, dream: n.dream, gcheck: n.gcheck, grole: g ? roleAt(g) : null, pcheck: n.pcheck, prole: ps ? roleAt(ps) : null, hunt: n.hunt, curse: n.curse,
    });
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
        const tags = [S.sheriff === p.seat ? "👮" : "", S.charm === p.seat && !hide ? "💋" : "", S.piped && S.piped.includes(p.seat) && !hide ? "🎵" : "", S.curse && S.curse.round === S.round && S.curse.seat === p.seat && S.phase === "day" ? "🐦" : "", p.role === "knight" && S.knightUsed ? "⚔️" : "", p.revealed ? "🃏" : ""].join("");
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
        h += `<div class="ww-card win ${S.winner === "wolf" ? "wolfwin" : S.winner === "piper" ? "piperwin" : ""}"><div class="big">${esc(tr(S.winner === "good" ? "winGood" : S.winner === "piper" ? "winPiper" : "winWolf"))}</div><p class="hint">${esc(tr("winHint"))}</p><div class="ww-btns">${B("sec", "newGame", tr("newGame"))}</div></div>`;
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
    const wi = byRole("witch"), so = a.filter((p) => sideOf(p.role) === "solo").length;
    return `<div class="ww-pills"><span>${esc(tr("w", { n: w }))}</span><span>${esc(tr("g", { n: g }))}</span><span>${esc(tr("v", { n: v }))}</span>${so ? `<span>${esc(tr("solo", { n: so }))}</span>` : ""}${
      wi && wi.alive ? `<span class="${S.witch.anti ? "" : "used"}">${esc(tr("antiShort"))}</span><span class="${S.witch.poison ? "" : "used"}">${esc(tr("poisonShort"))}</span>` : ""
    }</div>`;
  }
  const chip = (on, act, label, args = "") => `<button type="button" class="ww-chip ${on ? "on" : ""}" data-act="${act}"${args !== "" ? ` data-args="${esc(args)}"` : ""}>${esc(label)}</button>`;

  // ---- setup ----
  // The rule line shown on the setup page for each role the board has.
  const RULES = [
    ["beauty", "ruleBeauty"], ["idiot", "ruleIdiot"], ["guard", "ruleGuard"], ["elder", "ruleElder"], ["scapegoat", "ruleGoat"], ["piper", "rulePiper"],
    ["wolfking", "ruleWolfking"], ["whitewolf", "ruleWhitewolf"], ["gargoyle", "ruleGargoyle"], ["evilknight", "ruleEvilknight"], ["nightmare", "ruleNightmare"],
    ["bloodmoon", "ruleBloodmoon"], ["hiddenwolf", "ruleHiddenwolf"], ["gravekeeper", "ruleGravekeeper"], ["psychic", "rulePsychic"], ["dreamer", "ruleDreamer"],
    ["demonhunter", "ruleDemonhunter"], ["crow", "ruleCrow"], ["magician", "ruleMagician"],
  ];
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
      ${has("guard") && has("witch") ? row(tr("guardWitch"), chip(S.cfg.guardWitch !== "live", "cfg", tr("guardDie"), "guardWitch:die") + chip(S.cfg.guardWitch === "live", "cfg", tr("guardLive"), "guardWitch:live")) : ""}
      ${S.cfg.board === "custom" ? `<p class="hint" style="margin:10px 0 6px">${esc(tr("customRoles"))}</p>${SPECIAL_GROUPS.map(([g, rs]) => `<p class="ww-group">${esc(tr(g))}</p><div class="ww-palette">${rs.map((r) => chip((S.cfg.custom || []).includes(r), "togRole", rn(r), r)).join("")}</div>`).join("")}` : ""}
      ${RULES.filter(([r]) => has(r) || (r === "beauty" && has("knight"))).map(([, k]) => `<p class="hint" style="margin:8px 0 0">${esc(tr(k))}</p>`).join("")}
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
  // The order the judge calls the roles in.
  const NIGHT_ORDER = ["magician", "nightmare", "guard", "dreamer", "wolf", "beauty", "gargoyle", "witch", "seer", "psychic", "gravekeeper", "demonhunter", "crow", "piper", "hunter"];
  function nightSteps() {
    return [...NIGHT_ORDER.filter((r) => r === "wolf" || has(r)), "dawn"];
  }
  const STEP_LABEL = {
    magician: "stepMagician", nightmare: "stepNightmare", guard: "stepGuard", dreamer: "stepDreamer", wolf: "stepWolf", beauty: "stepBeauty", gargoyle: "stepGargoyle",
    witch: "stepWitch", seer: "stepSeer", psychic: "stepPsychic", gravekeeper: "stepGravekeeper", demonhunter: "stepDemonhunter", crow: "stepCrow", piper: "stepPiper", hunter: "stepHunter", dawn: "stepDawn",
  };
  const OPEN = {
    magician: "magicianOpen", nightmare: "nightmareOpen", guard: "guardOpen", dreamer: "dreamerOpen", beauty: "beautyOpen", gargoyle: "gargoyleOpen", witch: "witchOpen",
    seer: "seerOpen", psychic: "psychicOpen", gravekeeper: "gravekeeperOpen", demonhunter: "demonhunterOpen", crow: "crowOpen", piper: "piperOpen", hunter: "hunterOpen",
  };
  // Why a role can't act tonight, if it can't: the elder's death, the blood moon, or the nightmare's fear.
  function blocked(r) {
    const god = sideOf(r) === "god";
    if (god && S.powersLost && ["guard", "witch", "seer", "hunter", "gravekeeper", "psychic", "dreamer", "demonhunter", "crow", "magician"].includes(r)) return tr("powersLost");
    if (god && S.bloodNight === S.round) return tr("blockedBlood");
    const p = byRole(r);
    if (p && S.night && S.night.fear === p.seat) return tr("blockedFear", { role: rn(r) });
    return "";
  }
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
    const swapNote = n.swap && n.swap.length === 2 && n.step !== "magician" ? `<p class="hint">${esc(tr("swapNote", { a: S_(n.swap[0]), b: S_(n.swap[1]) }))}</p>` : "";
    // one seat (or none) for a role: field to set, who can be picked, button labels
    const pickOne = (field, filter, skipKey, confirmKey) =>
      `${seatGrid({ pick: sel(), filter, onTap: "pickSel" })}
        <div class="ww-btns">${skipKey ? B("sec", "nightPick", tr(skipKey), { args: `${field}:0` }) : ""}${B("", "nightPick", tr(confirmKey, { s: S_(sel()) }), { dis: !sel(), args: `${field}:${sel() || 0}` })}</div>`;
    const me = byRole(n.step);
    if (n.step !== "wolf" && n.step !== "dawn") {
      h += `<h2>${esc(tr(OPEN[n.step]))}</h2>`;
      if (!me || !me.alive) return h + deadNote(n.step) + nextBtn + "</div>";
      const why = blocked(n.step);
      if (why) return h + `<p class="hint">${esc(why)}</p>` + nextBtn + "</div>";
      h += swapNote;
    }
    if (n.step === "magician") {
      const pick = ui.multi || [];
      h += `<p class="hint">${esc(tr("magicianHint"))}</p>
        ${seatGrid({ pick, filter: (p) => p.alive && !S.swapped.includes(p.seat), onTap: "pickMulti" })}
        <div class="ww-btns">${B("sec", "nightSwap", tr("noSwap"), { args: "none" })}${B("purple", "nightSwap", tr("confirmSwap", { list: pick.length ? list(pick) : "" }), { dis: pick.length !== 2 })}</div>`;
    } else if (n.step === "nightmare") {
      const ban = S.lastFear;
      h += `<p class="hint">${esc(tr("nightmareHint", { ban: ban ? tr("guardBan", { s: S_(ban) }) : "" }))}</p>${pickOne("fear", (p) => p.alive && p.seat !== ban && sideOf(p.role) !== "wolf", "noFear", "confirmFear")}`;
    } else if (n.step === "guard") {
      const ban = S.lastGuard;
      h += `<p class="hint">${esc(tr("guardHint", { ban: ban ? tr("guardBan", { s: S_(ban) }) : "" }))}</p>${pickOne("guard", (p) => p.alive && p.seat !== ban, "noGuard", "confirmGuard")}`;
    } else if (n.step === "dreamer") {
      h += `<p class="hint">${esc(tr("dreamerHint", { last: S.lastDream ? tr("dreamLast", { s: S_(S.lastDream) }) : "" }))}</p>${pickOne("dream", (p) => p.alive && p.seat !== me.seat, "noDream", "confirmDream")}`;
    } else if (n.step === "gargoyle" || n.step === "psychic") {
      const field = n.step === "gargoyle" ? "gcheck" : "pcheck";
      h += `<p class="hint">${esc(tr(n.step + "Hint"))}</p>`;
      if (n[field]) {
        const t = nightOutcome(n).sw(n[field]);
        h += `${seatGrid({ pick: n[field], filter: () => false })}<div class="ww-result g">${esc(tr("roleIs", { s: S_(n[field]), role: rn(roleAt(t)) }))}</div>${nextBtn}`;
      } else
        h += `${seatGrid({ pick: sel(), filter: (p) => p.alive && p.seat !== me.seat, onTap: "pickSel" })}<div class="ww-btns">${B("", "nightPick", tr("check", { s: S_(sel()) }), { dis: !sel(), args: `${field}:${sel() || 0}:stay` })}</div>`;
    } else if (n.step === "gravekeeper") {
      const x = S.lastExiled && S.lastExiled.round === S.round - 1 ? S.lastExiled.seat : null;
      h += x ? `<div class="ww-result ${isWolf(x) ? "w" : "g"}">${esc(tr("graveResult", { s: S_(x), res: tr(isWolf(x) ? "isWolf" : "isGood") }))}</div>` : `<p class="big">${esc(tr("graveNone"))}</p>`;
      h += nextBtn;
    } else if (n.step === "demonhunter") {
      if (S.round === 1) h += `<p class="hint">${esc(tr("demonhunterFirst"))}</p>${nextBtn}`;
      else h += `<p class="hint">${esc(tr("demonhunterHint"))}</p>${pickOne("hunt", (p) => p.alive && p.seat !== me.seat, "noHunt", "confirmHunt")}`;
    } else if (n.step === "crow") {
      h += `<p class="hint">${esc(tr("crowHint"))}</p>${pickOne("curse", (p) => p.alive, "noCurse", "confirmCurse")}`;
    } else if (n.step === "piper") {
      const pick = ui.multi || [];
      const can = alive().filter((p) => p.seat !== me.seat && !S.piped.includes(p.seat)).length;
      const need = Math.min(2, can);
      h += `<p class="hint">${esc(tr("piperHint"))}</p>
        ${seatGrid({ pick, filter: (p) => p.alive && p.seat !== me.seat && !S.piped.includes(p.seat), onTap: "pickMulti", sub: (p) => (S.piped.includes(p.seat) ? tr("piped") : "") })}
        <div class="ww-btns">${B("purple", "nightPipe", tr("confirmPipe", { list: pick.length ? list(pick) : "" }), { dis: pick.length !== need })}</div>`;
      const charmed = [...new Set([...S.piped, ...(n.pipe || []), ...pick])]; // incl. the two being picked now
      if (charmed.length) h += `<p class="hint" style="margin-top:8px">${esc(tr("pipedWake", { list: list(charmed) }))}</p>`;
    } else if (n.step === "wolf") {
      const pack = S.players.filter((p) => sideOf(p.role) === "wolf" && p.alive && !LONE_WOLVES.includes(p.role)).map((p) => p.seat);
      const lone = S.players.filter((p) => p.alive && LONE_WOLVES.includes(p.role)).map((p) => p.seat);
      const hint = pack.length ? tr("wakeWolves", { list: list(pack) }) + (lone.length ? tr("hiddenNote", { list: list(lone) }) : "") : tr("loneWolves", { list: list(lone) });
      h += `<h2>${esc(tr("wolfOpen"))}</h2><p class="hint">${esc(hint)}</p>${swapNote}
        ${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}
        <div class="ww-btns">${B("sec", "nightKill", tr("noKill"), { args: "0" })}${B("red", "nightKill", tr("confirmKill", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
    } else if (n.step === "beauty") {
      const ban = S.cfg.charmRepeat ? null : S.charm;
      h += `<p class="hint">${esc(tr("beautyHint", { ban: ban ? tr("beautyBan", { s: S_(ban) }) : "" }))}</p>
        ${seatGrid({ pick: sel(), filter: (p) => p.alive && p.seat !== me.seat && p.seat !== ban, onTap: "pickSel" })}
        <div class="ww-btns">${B("red", "nightCharm", tr("confirmCharm", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
    } else if (n.step === "witch") {
      const self = n.kill && n.kill === me.seat;
      const canSelf = S.cfg.selfSave === "always" || (S.cfg.selfSave === "first" && S.round === 1);
      const canSave = S.witch.anti && n.kill && (!self || canSelf);
      const real = nightOutcome(n).sw(n.kill);
      h += `<div class="ww-pills"><span class="${S.witch.anti ? "" : "used"}">${esc(tr("anti"))}</span><span class="${S.witch.poison ? "" : "used"}">${esc(tr("poison"))}</span></div>
        <p class="big">${esc(tr("downTonight", { s: n.kill ? S_(n.kill) : tr("nobody") }))}${real && real !== n.kill ? esc(tr("actualVictim", { s: S_(real) })) : ""}</p>
        ${!S.witch.anti ? `<p class="hint">${esc(tr("antiUsed"))}</p>` : ""}
        ${self && !canSelf && S.witch.anti ? `<p class="hint">${esc(tr("noSelfSave"))}</p>` : ""}
        ${S.witch.poison ? `<p class="hint">${esc(tr("poisonHint"))}</p>${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}` : ""}
        <div class="ww-btns">${B("green", "nightSave", tr("save", { s: S_(n.kill) }), { dis: !canSave })}${B("purple", "nightPoison", tr("usePoison", { s: S_(sel()) }), { dis: !(S.witch.poison && sel()), args: String(sel() || 0) })}${B("sec", "nightNext", tr("noPotion"))}</div>`;
    } else if (n.step === "seer") {
      h += `<p class="hint">${esc(tr("seerHint"))}</p>${seatGrid({ pick: n.check || sel(), filter: (p) => p.alive && p.seat !== me.seat, onTap: n.check ? null : "pickSel" })}`;
      if (n.check) {
        const bad = seerSees(nightOutcome(n).sw(n.check));
        h += `<div class="ww-result ${bad ? "w" : "g"}">${esc(S_(n.check))} · ${esc(tr(bad ? "isWolf" : "isGood"))}</div>${nextBtn}`;
      } else h += `<div class="ww-btns">${B("", "nightCheck", tr("check", { s: S_(sel()) }), { dis: !sel(), args: String(sel() || 0) })}</div>`;
    } else if (n.step === "hunter") {
      const outc = nightOutcome(n), mine = outc.deaths.find((d) => d[0] === me.seat);
      const cant = (mine && NO_SHOT.includes(mine[1])) || n.fear === me.seat;
      h += `<div class="ww-result ${cant ? "w" : "g"}">${esc(tr(cant ? "cantShoot" : "canShoot"))}</div><p class="hint">${esc(tr("hunterHint", { s: S_(me.seat) }))}${n.charm === me.seat && !cant ? " " + esc(tr("hunterCharmed")) : ""}</p>${nextBtn}`;
    } else {
      const outc = nightOutcome(n), dies = outc.deaths.map((d) => d[0]);
      const bz = byRole("beauty");
      if (bz && dies.includes(bz.seat) && n.charm && !dies.includes(n.charm)) dies.push(n.charm);
      const jr = judgeRole;
      const row = (show, label, value) => (show ? `<div class="ww-row">${esc(tr(label))}<b>${esc(value)}</b></div>` : "");
      h += `<h2>${esc(tr("dawn"))}</h2>
        ${row(has("magician"), "swapRow", n.swap && n.swap.length === 2 ? `${pn(n.swap[0], jr)} ⇄ ${pn(n.swap[1], jr)}` : tr("noSwap"))}
        ${row(has("nightmare"), "fearRow", n.fear ? pn(n.fear, jr) : "—")}
        ${row(has("guard"), "guard", n.guard ? pn(n.guard, jr) : tr("noGuard"))}
        ${row(has("dreamer"), "dreamRow", n.dream ? pn(n.dream, jr) : "—")}
        ${row(true, "kill", n.kill ? pn(n.kill, jr) : tr("noKill"))}
        ${outc.elder ? `<p class="hint">👴 ${esc(tr("elderSaved"))}</p>` : ""}
        ${row(has("beauty"), "charm", n.charm ? pn(n.charm, jr) : "—")}
        ${row(has("gargoyle"), "gargRow", n.gcheck ? `${pn(n.gcheck, jr)} → ${rn(roleAt(outc.sw(n.gcheck)))}` : "—")}
        ${row(has("witch"), "witch", n.save ? tr("saved") : n.poison ? tr("poisoned", { s: pn(n.poison, jr) }) : tr("noUse"))}
        ${row(has("seer"), "seer", n.check ? `${pn(n.check, jr)} → ${tr(seerSees(outc.sw(n.check)) ? "wolfWord" : "goodWord")}` : "—")}
        ${row(has("psychic"), "psyRow", n.pcheck ? `${pn(n.pcheck, jr)} → ${rn(roleAt(outc.sw(n.pcheck)))}` : "—")}
        ${row(has("demonhunter"), "huntRow", n.hunt ? pn(n.hunt, jr) : "—")}
        ${row(has("crow"), "curseRow", n.curse ? pn(n.curse, jr) : "—")}
        ${row(has("piper"), "piper", n.pipe && n.pipe.length ? list(n.pipe, jr) : "—")}
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
        h += `<div class="ww-card pending"><h2>${esc(tr("hunterSkill", { s: pn(pd.seat, judgeRole) }))}</h2><p class="hint">${esc(tr("hunterSkillHint"))}</p>${seatGrid({ pick: sel(), filter: (p) => p.alive, onTap: "pickSel" })}
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
          ${k && k.alive && !S.knightUsed && !S.powersLost ? `<div class="ww-btns">${B("gold", "openDuel", tr("duelBtn"))}</div>` : ""}
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
  function tallyOf(v, sheriff, curse) {
    const weight = (s) => (v.kind === "exile" && N(sheriff) === N(s) ? 1.5 : 1);
    const t = {};
    (v.cands || []).forEach((c) => (t[c] = { score: 0, by: [] }));
    // the crow's curse: one more vote against that player in today's exile vote
    if (v.kind === "exile" && curse && t[N(curse)]) t[N(curse)].score += 1;
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
  const curseToday = () => (S.curse && S.curse.round === S.round && P(S.curse.seat) && P(S.curse.seat).alive ? S.curse.seat : null);
  const tally = () => tallyOf(S.vote, liveSheriff(), curseToday());
  function startExileVote() {
    act(() => {
      S.vote = { kind: "exile", cands: alive().map((p) => p.seat), voters: alive().filter((p) => !p.revealed).map((p) => p.seat), ballots: {}, pk: 0 };
    });
  }
  function voteEvent() {
    const v = S.vote, { t, abst } = tally();
    return {
      kind: v.kind, pk: v.pk, sheriff: liveSheriff(), curse: v.kind === "exile" ? curseToday() : null,
      rows: sortN(v.cands).filter((c) => t[c].score > 0).map((c) => ({ c, score: t[c].score, by: t[c].by.slice() })),
      abst,
    };
  }
  function voteWidget() {
    const v = S.vote, { t, abst, max, lead, weight } = tally();
    const isS = v.kind === "sheriff";
    if (ui.tgt === undefined || (ui.tgt !== 0 && !v.cands.includes(ui.tgt))) ui.tgt = v.cands[0];
    const chips = sortN(v.cands).map((c) => chip(ui.tgt === c, "tgt", tr("voteFor", { s: S_(c) }), String(c))).join("") + chip(ui.tgt === 0, "tgt", tr("abstain"), "0");
    const grid = seatGrid({
      filter: (p) => v.voters.includes(p.seat), onTap: "castVote",
      pick: v.voters.filter((x) => v.ballots[x] === ui.tgt),
      sub: (p) => (v.voters.includes(p.seat) ? (v.ballots[p.seat] ? "→" + v.ballots[p.seat] : v.ballots[p.seat] === 0 ? tr("abstShort") : tr("notVoted")) : v.cands.includes(p.seat) && v.kind === "sheriff" ? tr("cand") : ""),
    });
    const by = (c) => t[c].by.map((x) => tr("seat", { n: x }) + (weight(x) > 1 ? "👮" : "")).join(lang() === "zh" ? "、" : ", ");
    const rows = sortN(v.cands).filter((c) => t[c].score > 0).map((c) => `<div class="ww-row"><b>${esc(S_(c))} · ${esc(tr("votes", { n: t[c].score }))}</b><span>${esc(by(c))}${!isS && c === curseToday() ? " " + esc(tr("curseTag")) : ""}</span></div>`).join("") +
      `<div class="ww-row"><span>${esc(tr("abstNot"))}</span><span>${esc(list(abst))}</span></div>`;
    let btns = "";
    if (lead.length === 1) btns += B(isS ? "gold" : "red", "finishVote", isS ? tr("electOk", { s: S_(lead[0]) }) : tr("exileOk", { s: S_(lead[0]) }), { args: `ok:${lead[0]}` });
    const goat = !isS && lead.length > 1 ? byRole("scapegoat") : null;
    if (goat && goat.alive) btns += B("red", "finishVote", tr("goatOut", { s: S_(goat.seat) }), { args: `goat:${goat.seat}` });
    if (lead.length > 1 && v.pk < 1) btns += B("purple", "finishVote", tr("goPk", { list: list(lead) }), { args: "pk:0" });
    btns += B("sec", "finishVote", tr(isS ? "badgeLostBtn" : "noExileBtn"), { args: "none:0" });
    const hint = tr("voteHint") + " " + (isS ? tr("voteHintS") : liveSheriff() ? tr("sheriffWeight", { s: S_(liveSheriff()) }) : "") + (!isS && curseToday() ? " " + tr("curseHint", { s: S_(curseToday()) }) : "") + (v.pk ? tr(isS ? "pkHintS" : "pkHintE") : "");
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
      if (action === "goat") {
        S.day.exiled = true;
        LP("goat", { s: target });
        kill(target, "goat");
        return;
      }
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
    S.lastExiled = { seat: s, round: S.round };
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
    const ws = S.players.filter((p) => p.alive && CAN_EXPLODE.includes(p.role));
    modal(`<h2>${esc(tr("explodeWho"))}</h2><p class="hint">${esc(tr("explodeHint"))}${S.round === 1 && !S.sheriffDone ? " " + esc(tr("explodeElectHint")) : ""}</p>
      <div class="ww-btns">${ws.map((p) => B("red", "explode", `${S_(p.seat)}${p.role !== "wolf" ? " · " + rn(p.role) : ""}`, { args: String(p.seat) })).join("")}</div><div class="ww-btns">${B("sec", "closeModal", tr("cancel"))}</div>`);
  }
  function openTake(s) {
    modal(`<h2>${esc(tr("takeWho", { s: S_(s) }))}</h2><p class="hint">${esc(tr("takeHint"))}</p>
      <div class="ww-grid">${alive().filter((p) => p.seat !== s).map((p) => `<button type="button" class="ww-seat" data-act="explodeTake" data-args="${s}:${p.seat}"><span class="no">${p.seat}</span></button>`).join("")}</div>
      <div class="ww-btns">${B("sec", "explodeTake", tr("noTake"), { args: `${s}:0` })}${B("sec", "closeModal", tr("cancel"))}</div>`);
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
  function explode(s, take = 0) {
    closeModal();
    act(() => {
      const role = roleAt(s);
      if (role === "whitewolf" && take) LP("take", { s, t: take });
      else LP("explode", { s });
      // The blood moon seals the gods tonight, unless she was the last wolf.
      if (role === "bloodmoon") {
        if (alive().some((p) => p.seat !== s && sideOf(p.role) === "wolf")) {
          S.bloodNight = S.round + 1;
          L("bloodmoon", { s });
        } else L("immune", { s });
      }
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
      if (role === "whitewolf" && take) kill(take, "take");
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
    const r = g.winner === "good" ? tr("goodWin") : g.winner === "wolf" ? tr("wolfWin") : g.winner === "piper" ? tr("piperWin") : tr("undecided");
    return `${tr("logHead", { board: boardName(g.board || "beauty") })} ${fmtT(g.t)}\n${tr("result", { r })}\n${logText(g.log, roleOf)}`;
  }
  function renderHistory() {
    let h = `<div class="ww-card"><h2>${esc(tr("historyCard"))}</h2>${S.phase === "setup" ? `<div class="ww-btns" style="margin-top:0">${B("sec", "closeHistory", tr("backSetup"))}</div>` : ""}
      ${archive.length ? "" : `<p class="hint">${esc(tr("noHistory"))}</p>`}`;
    archive.forEach((g, i) => {
      const res = g.winner === "good" ? `<span class="good">${esc(tr("goodWin"))}</span>` : g.winner === "wolf" ? `<span class="bad">${esc(tr("wolfWin"))}</span>` : g.winner === "piper" ? `<span class="solo">${esc(tr("piperWin"))}</span>` : `<span class="hint">${esc(tr("undecided"))}</span>`;
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
      vote: S.vote ? { kind: S.vote.kind, pk: S.vote.pk, cands: S.vote.cands, voters: S.vote.voters, ballots: S.vote.ballots, curse: S.vote.kind === "exile" ? curseToday() : null } : null,
      pub: S.pub,
      timer: timerPub(),
    };
    return st;
  }
  // Every value from the shared state goes through N() or a fixed list before it is shown.
  function renderPub(st) {
    if (!st || typeof st !== "object") return "";
    const seats = Array.isArray(st.seats) ? st.seats : [];
    const over = st.winner === "good" || st.winner === "wolf" || st.winner === "piper";
    const sheriff = N(st.sheriff);
    const pubEv = Array.isArray(st.pub) ? st.pub.filter((e) => e && typeof e === "object") : [];
    let h = "";
    const phase = st.phase === "night" ? `🌙 ${tr("nightN", { n: N(st.round) })}` : st.phase === "day" ? `☀️ ${tr("dayN", { n: N(st.round) })}` : tr("pubWaiting");
    h += `<div class="ww-card ww-pubhead ${st.phase === "night" ? "night" : st.phase === "day" ? "day" : ""}"><div class="ww-pubphase">${esc(phase)}</div>
      ${BOARDS[st.board] ? `<div class="hint">${esc(boardName(st.board))}</div>` : ""}</div>`;
    if (over) h += `<div class="ww-card win ${st.winner === "wolf" ? "wolfwin" : st.winner === "piper" ? "piperwin" : ""}"><div class="big">${esc(tr(st.winner === "good" ? "winGood" : st.winner === "piper" ? "winPiper" : "winWolf"))}</div></div>`;
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
    const curse = vv.kind === "exile" ? N(v.curse) || null : null;
    const { t, abst, max } = tallyOf(vv, sheriff, curse);
    const total = Math.max(1, max);
    const rows = sortN(vv.cands)
      .filter((c) => t[c].score > 0)
      .sort((a, b) => t[b].score - t[a].score || a - b)
      .map((c) => `<div class="ww-bar"><div class="ww-bar-top"><b>${esc(S_(c))}</b><span>${esc(tr("votes", { n: t[c].score }))}</span></div><div class="ww-bar-track"><i style="width:${Math.round((t[c].score / total) * 100)}%"></i></div><div class="hint">← ${esc(t[c].by.map((x) => tr("seat", { n: x })).join(lang() === "zh" ? "、" : ", "))}${c === curse ? " " + esc(tr("curseTag")) : ""}</div></div>`)
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
      if (BOARDS[b].n) S.cfg.n = BOARDS[b].n;
      if (b === "custom" && !Array.isArray(S.cfg.custom)) S.cfg.custom = ["seer", "witch", "hunter", "guard"];
      fixVil();
      initPlayers();
      if (!["wolf", "vil", ...BOARD().specials].includes(ui.brush)) ui.brush = "wolf";
      render();
    },
    togRole: (r) => {
      if (!SPECIALS.includes(r)) return;
      const c = (S.cfg.custom = Array.isArray(S.cfg.custom) ? S.cfg.custom : []);
      const i = c.indexOf(r);
      i < 0 ? c.push(r) : c.splice(i, 1);
      // keep at least one villager seat: more seats when needed
      S.cfg.n = Math.max(S.cfg.n, c.length + S.cfg.wolves + 1);
      fixVil();
      initPlayers();
      if (!["wolf", "vil", ...BOARD().specials].includes(ui.brush)) ui.brush = "wolf";
      render();
    },
    nightGuard: (s) => nightSet({ guard: N(s) || null }),
    // one seat for a role's night skill: "field:seat" (":stay" keeps the step to show a result)
    nightPick: (a) => {
      const [field, seat, stay] = a.split(":");
      if (!["fear", "guard", "dream", "gcheck", "pcheck", "hunt", "curse"].includes(field)) return;
      nightSet({ [field]: N(seat) || null }, stay !== "stay");
    },
    nightSwap: (a) => {
      const pick = a === "none" ? [] : (ui.multi || []).slice(0, 2);
      ui.multi = [];
      nightSet({ swap: pick.length === 2 ? pick : [] });
    },
    explodeTake: (a) => {
      const [w, t] = a.split(":").map(N);
      explode(w, t);
    },
    nightPipe: () => {
      const pick = (ui.multi || []).slice();
      ui.multi = [];
      nightSet({ pipe: pick });
    },
    setN: (d) => {
      S.cfg.n = Math.min(20, Math.max(Math.max(8, BOARD().specials.length + 2), S.cfg.n + N(d)));
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
    explode: (s) => (roleAt(N(s)) === "whitewolf" ? openTake(N(s)) : explode(N(s))),
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
    pickMulti: (s) => {
      const m = (ui.multi = ui.multi || []), i = m.indexOf(s);
      if (i >= 0) m.splice(i, 1);
      else {
        m.push(s);
        if (m.length > 2) m.shift();
      }
      render();
    },
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
