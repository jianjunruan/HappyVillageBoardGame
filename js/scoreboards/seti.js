// 星空觅迹 SETI: each player's organization (Space Agencies expansion; the Simplified Chinese edition adds 神舟二十一号)
// and player colour, plus the alien species found in the game (2 per game; 5 in the base game, 3 more in Space Agencies).
// Names, ability text and pictures come from the club's own Simplified Chinese copy (photos in images/seti/).
// English text follows the English cards and CGE's official Space Agencies FAQ.
(() => {
  const ABILITY = { zh: "能力", en: "Ability" };
  const FREE = { zh: "自由行动（每轮 1 次）", en: "Free action (once per round)" };
  const SETUP = { zh: "开局", en: "Setup" };
  const org = (key, zh, en, color, rows, extra = {}) => ({
    key,
    name: { zh, en },
    img: `images/seti/agency-${key}.jpg`,
    color,
    rows: rows.map(([label, z, e]) => ({ label, text: { zh: z, en: e } })),
    ...extra,
  });
  const alien = (key, zh, en, color) => ({ key, name: { zh, en }, img: `images/seti/alien-${key}.jpg`, color });

  HVScoreboard.register("seti", {
    name: { zh: "星空觅迹 SETI", en: "SETI" },
    maxPlayers: 4,
    gameFields: [
      {
        key: "aliens",
        type: "chips",
        label: { zh: "外星种族", en: "Alien species" },
        max: 2,
        statsTitle: { zh: "外星种族出现次数", en: "Alien species" },
        options: [
          alien("mascamites", "马斯卡螨", "Mascamites", "#a8862c"),
          alien("exertians", "埃克瑟特人", "Exertians", "#c8452f"),
          alien("centaurians", "半人马座人", "Centaurians", "#2f9a5a"),
          alien("anomalies", "异常体", "Anomalies", "#1f8f9a"),
          alien("oumuamua", "奥穆阿", "ʻOumuamua", "#6a3fa8"),
          alien("amoeba", "变形虫（扩展）", "Amoeba (exp.)", "#c0459a"),
          alien("arkhos", "阿尔科斯（扩展）", "Arkhos (exp.)", "#2d4f9e"),
          alien("glyphids", "刻符族（扩展）", "Glyphids (exp.)", "#4f9a1f"),
        ],
      },
    ],
    playerFields: [
      {
        key: "agency",
        type: "cards",
        label: { zh: "机构", en: "Organization" },
        unique: true,
        statsTitle: { zh: "机构统计", en: "Organizations" },
        favLabel: { zh: "常用机构", en: "Favourite organization" },
        options: [
          org("orbital-dynamics", "轨道动力学", "Orbital Dynamics", "#e5652a", [
            [ABILITY, "你在太空中的探测器上限提高 1。", "Your limit of probes in space is 1 higher."],
            [FREE, "你可移动最多 2 个探测器各 1 步。", "Gain one move with up to 2 of your probes."],
          ]),
          org("fenwick-research-center", "芬威克研究中心", "Fenwick Research Center", "#c8322f", [
            [ABILITY, "研究 1 项科技仅消耗你 5 点宣传。", "Researching a tech costs you only 5 publicity."],
            [FREE, "花费 1 点宣传以获取 1 张卡，并立即获得该卡的左上角效果。", "Spend 1 publicity to gain 1 card and immediately gain its free-action corner effect."],
          ]),
          org("stratus-core", "平流层核心站", "Stratus Core", "#5f9a8f", [
            [FREE, "获得卡牌列中所有 3 张卡牌的左上角效果（无需弃置它们）。", "Gain the free-action corner effect of all 3 cards in the card row (without discarding them)."],
          ]),
          org("deep-sky-survey", "深空巡天", "Deep Sky Survey", "#c2246e", [
            [ABILITY, "分析数据不消耗你的能量。", "Analyzing data costs you no energy."],
            [FREE, "将你手牌中的 1 张卡与卡牌列中的 1 张卡交换。", "Exchange a card from your hand with one in the card row."],
          ]),
          org("turing-systems", "图灵系统", "Turing Systems", "#1f86c4", [
            [ABILITY, "当你研究 1 项电脑科技时，获得 1 点宣传。", "When you research a computer tech, gain 1 publicity."],
            [FREE, "选择任意探测器或望远镜科技。本回合你可使用其效果，如同你已研究过它（不获得该科技的即时奖励）。", "Choose any probe or telescope tech. This turn you can use its effect as if you had researched it (without its immediate reward)."],
          ]),
          org("cosmos-strategy-group", "宇宙战略小组", "Cosmos Strategy Group", "#6b6f78", [
            [ABILITY, "当你以主行动打出 1 张卡时，你可标记 1 个与其扇区颜色匹配的格并获得奖励。", "When you play a card as a main action, you can mark a space matching its sector colour and gain the reward."],
            [FREE, "获取 1 张卡并清除上方所有已标记的奖励格。", "Gain 1 card and clear all marked reward spaces above."],
          ]),
          org("sentinel-probe-network", "哨兵探测器网络", "Sentinel Probe Network", "#5b3a9a", [
            [ABILITY, "当你发射探测器时，在其扇区标记 1 个信号。", "When you launch a probe, mark a signal in its sector."],
            [FREE, "获得你本回合以主行动打出的 1 张非外星卡牌的左上角效果（该卡的主效果需先完全结算）。", "Gain the free-action corner effect of the non-alien card you played as a main action this turn (resolve the card fully first)."],
          ]),
          org("mission-relay", "任务中继站", "Mission Relay", "#9a7b2c", [
            [SETUP, "起始时按图示标记 1 片金色计分板块（你仍可标记其他 3 片）。", "Start with the pictured gold scoring tile marked (you can still mark the other three)."],
            [ABILITY, "当你以主行动打出 1 张含任务的卡时，获得 1 点宣传。", "When you play a card with a mission as a main action, gain 1 publicity."],
            [FREE, "花费 2 点宣传以获取 1 张卡及其右下角的收入资源。", "Spend 2 publicity to gain 1 card and the resource in its income corner."],
          ]),
          org("xenolab", "异种实验室", "Xenolab", "#2a5fa8", [
            [SETUP, "起始时按图示放置 3 个板块。", "Start with the 3 pictured tiles."],
            [ABILITY, "作为主行动，你可支付板块上指示的费用以获得其效果，然后将其翻转。当你获得 1 枚生命迹象时，将对应板块翻到激活面以便再次使用。", "As a main action, pay a tile's cost to gain its effect, then flip it. When you gain a life trace, flip the matching tile back so it can be used again."],
          ]),
          org("futurespan-institute", "未来跨度研究所", "Futurespan Institute", "#d9a520", [
            [ABILITY, "作为自由行动，花费你的标记以正面预备手牌中的 1 张卡，并按卡的费用把标记放到分数标记前方（费用 1/2/3/4 → 前方 15/25/35/45 格）。分数标记到达或越过它时，取回标记并像主行动那样免费打出该卡。", "As a free action, spend your token to prepare a card from your hand face up and place the token ahead of your score by its cost (cost 1/2/3/4 → 15/25/35/45 spaces). When your score reaches it, take the token back and play the card for free as a main action."],
            [FREE, "将标记前进 3 格以获取 1 张卡。", "Advance the token 3 spaces to gain 1 card."],
          ]),
          org("helion-assembly", "氦核装配站", "Helion Assembly", "#2e7d4f", [
            [ABILITY, "研究探测器、望远镜或电脑科技时，标记对应的格并获得奖励。", "When you research a probe, telescope or computer tech, mark the matching space and gain its reward."],
            [FREE, "将你的 1 个探测器科技或望远镜科技放到版图旁来增加收入，然后清除上方所有格。你不能再使用该科技的效果，但在其他用途中仍视为你拥有它。", "Put one of your probe or telescope techs beside your board to increase your income, then clear all spaces above. You can no longer use its effect, but it still counts as yours for everything else."],
          ]),
          org(
            "shenzhou-21",
            "神舟二十一号",
            "Shenzhou-21",
            "#1f6fb5",
            [
              [ABILITY, "消耗宣传拿取卡牌时少支付 1 点宣传。", "When you spend publicity to take a card, pay 1 less."],
              [FREE, "弃置 2 张手牌执行一次发射行动。", "Discard 2 cards from your hand to take a launch action."],
            ],
            { summary: { zh: "中文版独有。拿牌少付 1 宣传；弃 2 张手牌发射。", en: "Chinese edition only. Cards cost 1 less publicity; discard 2 to launch." } }
          ),
        ],
      },
      {
        key: "color",
        type: "swatches",
        label: { zh: "玩家颜色", en: "Player colour" },
        unique: true,
        statsTitle: { zh: "玩家颜色统计", en: "Player colours" },
        options: [
          { key: "purple", name: { zh: "紫色", en: "Purple" }, color: "#4b3fb3" },
          { key: "white", name: { zh: "白色", en: "White" }, color: "#d3d6db" },
          { key: "orange", name: { zh: "橙色", en: "Orange" }, color: "#c67a3c" },
          { key: "green", name: { zh: "绿色", en: "Green" }, color: "#1f8a5c" },
        ],
      },
    ],
  });
})();
