// 方舟动物园 Ark Nova: each player's zoo map (Map A, Map 0 and the 8 advanced maps of the base game), and whether the
// Marine Worlds expansion was used. Final scores can be negative in Ark Nova, so scores down to -999 are allowed.
// Map abilities: Board Game Arena's Ark Nova rules notes and the rulebook; map packs: Zatu's Map Pack 1 & 2 overview;
// fan-made maps: their BoardGameGeek threads, and the Bahamut forum post "方舟動物自製粉絲地圖分享"
// (forum.gamer.com.tw/C.php?bsn=60537&snA=4413; DIY07–11 originally by 153桌游吧 on Bilibili). Chinese map names follow what Chinese BGA players use (Chinese Wikipedia,
// ender-wiggin.com); BGA's alternative maps 1a–8a have the same abilities as 1–8. Any other map can be typed in.
(() => {
  const ABILITY = { zh: "地图能力", en: "Map ability" };
  const ABOUT = { zh: "说明", en: "About" };
  const FAN = { zh: "玩家自制", en: "Fan-made" };
  const SOURCE = { zh: "来源", en: "Source" };
  const map = (key, zh, en, icon, color, rows, group = "base") => ({ key, group, name: { zh, en }, icon, color, rows: rows.map(([label, z, e]) => ({ label, text: { zh: z, en: e } })) });
  const pack = (key, zh, en, icon, color, z, e) => map(key, zh, en, icon, color, [[ABILITY, z, e]], "packs");
  const BAHA = "巴哈姆特「方舟動物自製粉絲地圖分享」";
  const baha = (key, zh, en, icon, color, z, e, by) =>
    map(key, zh, en, icon, color, [[FAN, z, e], [SOURCE, by ? `${by}（${BAHA}）` : BAHA, by ? `${by} (${BAHA})` : BAHA]], "baha");
  const fan = (key, zh, en, icon, color, z, e, by) => map(key, zh, en, icon, color, [[FAN, z, e], [SOURCE, by, by]], "fan");
  const BGG1 = "BGG「Ark Nova custom maps」";
  const II = "BGG / Interactivities Ink";
  const BGG3 = "BGG「Ark Nova custom zoo maps」";

  const cfg = {
    name: { zh: "方舟动物园", en: "Ark Nova" },
    maxPlayers: 4,
    minScore: -999,
    gameFields: [
      {
        key: "expansions",
        type: "chips",
        label: { zh: "使用的扩展", en: "Expansions used" },
        statsTitle: { zh: "扩展使用次数", en: "Expansions" },
        options: [{ key: "marine-worlds", name: { zh: "海洋世界", en: "Marine Worlds" }, icon: "🐠", color: "#1f7fb5" }],
      },
    ],
    playerFields: [
      {
        key: "map",
        type: "cards",
        label: { zh: "动物园地图", en: "Zoo map" },
        unique: false, // several players may use the same map (e.g. everyone on Map A)
        allowCustom: true, // other fan-made or new maps can be typed in
        groups: [
          { key: "base", label: { zh: "基础游戏地图", en: "Base game maps" } },
          { key: "bga", label: { zh: "BGA 替换地图（1a–8a）", en: "BGA alternative maps (1a–8a)" } },
          { key: "packs", label: { zh: "官方地图包（地图包 1、2）", en: "Official Zoo Map Packs 1 & 2" } },
          { key: "baha", label: { zh: "巴哈姆特玩家地图（9A/10A/13A、DIY01–14）", en: "Bahamut fan maps (9A/10A/13A, DIY01–14)" } },
          { key: "fan", label: { zh: "其他玩家 DIY 地图", en: "Other fan-made maps" } },
        ],
        statsTitle: { zh: "地图统计", en: "Zoo maps" },
        favLabel: { zh: "常用地图", en: "Favourite map" },
        options: [
          map("map-a", "地图 A（新手）", "Map A (beginner)", "🌱", "#6aa84f", [
            [ABOUT, "4 张相同的新手地图，所有玩家能力相同，推荐第一局使用；也可以给新手作为较大的起步优势。", "Four identical beginner maps with the same ability for everyone; recommended for your first game, or as a bigger head start for new players."],
          ]),
          map("map-0", "地图 0", "Map 0", "🗺️", "#8a8f96", [
            [ABOUT, "4 张相同的入门地图，所有玩家相同；可以给新手作为较小的起步优势。", "Four identical intermediate maps, the same for everyone; a smaller head start for new players."],
          ]),
          map("map-1", "地图 1：观测塔", "Map 1: Observation Tower", "🗼", "#7b5ea7", [
            [ABILITY, "与观测塔相邻的标准围栏放入动物时，额外获得 2 点吸引力。", "Standard enclosures next to the Observation Tower give 2 extra appeal when an animal is placed in them."],
          ]),
          map("map-2", "地图 2：户外营地", "Map 2: Outdoor Areas", "🌳", "#3d8b3d", [
            [ABILITY, "与户外营地相邻的标准围栏视为大 2 格，可以放需要更大围栏的动物。", "Standard enclosures next to the Outdoor Areas count as 2 spaces larger for the animals they can hold."],
          ]),
          map("map-3", "地图 3：银湖", "Map 3: Silver Lake", "🏞️", "#4a90c2", [
            [ABILITY, "湖边有额外的放置奖励格，覆盖时获得 2 金钱。", "Spaces along the lake give 2 money when you cover them."],
          ]),
          map("map-4", "地图 4：商业港口", "Map 4: Commercial Harbor", "⚓", "#2f5f8a", [
            [ABILITY, "在旁边的建筑格建造后连通。之后每回合可以随时卖掉 1 张手牌，得 3 金钱。", "Connected once you build on the adjacent building space; then, once per turn, you may sell 1 card from your hand for 3 money at any time."],
          ]),
          map("map-5", "地图 5：主题餐厅", "Map 5: Park Restaurant", "🍽️", "#c0623a", [
            [ABILITY, "每次中场休息时，主题餐厅周围每有 1 格建筑，获得 1 金钱。", "During each break, gain 1 money for each space next to the Park Restaurant that has a building on it."],
          ]),
          map("map-6", "地图 6：研究院", "Map 6: Research Institute", "🔬", "#2e8b8b", [
            [ABILITY, "在旁边的建筑格建造后连通。之后打出动物牌时可以少满足 1 个条件（岩石和水的要求除外）。", "Connected once you build on the adjacent building space; then you can play animal cards while 1 condition short (not rock or water requirements)."],
          ]),
          map("map-7", "地图 7：冰淇淋甜品店", "Map 7: Ice Cream Parlors", "🍦", "#d97fa6", [
            [ABILITY, "覆盖了所有奖励售货亭的格子后，中场休息时每个售货亭额外获得 1 金钱。", "Once all kiosk bonus spaces are covered, each kiosk gives 1 extra money during the break."],
          ]),
          map("map-8", "地图 8：好莱坞山", "Map 8: Hollywood Hills", "🎬", "#b8912f", [
            [ABILITY, "在 H 格上建造时，从牌库翻牌直到翻出 1 张赞助商牌并拿到手里；3 个 H 格都覆盖后，你打出的赞助商牌等级都降低 1。", "Each time you build on an H space, reveal cards until a sponsor card and take it; once all 3 are covered, your sponsor cards are 1 level lower."],
          ]),
          // Official Zoo Map Pack 1 (maps 9–10) and 2 (maps 11–14 + Tournament Map 1)
          pack("map-9", "地图 9：地理动物园", "Map 9: Geographical Zoo", "🌍", "#3f7f3f", "地图分成五个大洲颜色的区域。每个大洲限一次：当你放置对应大洲动物到版图对应大洲区域时，可以移除该大洲标记，并选择右侧 5 个奖励中的一个。", "The map has five continent-coloured zones. Once per continent: when you place an animal of that continent in its zone, you may remove that continent's marker and choose one of the 5 rewards on the right."), // text from the club's Chinese map
          pack("map-10", "地图 10：急救站", "Map 10: Rescue Station", "🚑", "#c0392b", "挖掘奖励可以把弃掉的动物牌塞到地图下，它上方的图标计入你的动物园（奖励和放生不算）。", "Digging bonuses tuck a discarded animal under the map; its top icons count for your zoo (not its rewards or release)."),
          pack("map-11", "地图 11：洞穴", "Map 11: Caves", "🕳️", "#6b5a4a", "奖励可以把手牌塞到地图下（不计手牌上限），每次中场休息每张塞下的牌得 2 金钱。", "A bonus tucks a hand card under the map (outside your hand limit); each tucked card gives 2 money every break."),
          pack("map-12", "地图 12：人工智能", "Map 12: Artificial Intelligence", "🤖", "#3a6fb0", "收集到的奖励会提高行动格的强度，减少对 X 标记的需求。", "Collected bonuses raise the strength of action slots, so you need fewer X-tokens."),
          pack("map-13", "地图 13：绘图板", "Map 13: Drawing Board", "📐", "#8a6d3b", "四块区域在中央的起始围栏相接；完成一块区域立即获得奖励，之后每次中场休息再得一次。", "Four segments meet at a central starting enclosure; completing one gives its reward now and again every break."),
          pack("map-14", "地图 14：泻湖", "Map 14: Lagoon", "🏝️", "#1f9a9a", "围绕赞助商：奖励可以从牌库找赞助商牌，保护项目的奖励可以免费打出一张赞助商牌。", "Sponsor-focused: bonuses search the deck for sponsors, and a conservation project bonus plays one for free."),
          pack("tournament-1", "锦标赛地图 1", "Tournament Map 1", "🏆", "#b8912f", "拿到最上面的保护项目奖励后，可以弃 1 张牌提升行动强度（类似 X 标记）。", "After taking the top conservation project reward, discard a card to boost an action's strength (like an X-token)."),
          // Fan maps from the Bahamut forum post (remakes of official maps 9/10/13, and DIY01–14)
          baha("baha-9a", "地图 9A：万国博览会", "Map 9A: World Expo", "🌐", "#3f7f3f", "地理动物园的改版。收入奖励：可以放 1 个方块在已移除的地图能力上，或移除 1 个地图能力标记并获得奖励。1 格水域改为岩石；移除所有标记的 1 保护点改为游戏结束时获得；大洲/大学/工人的保护点分布有调整。", "A remake of Geographical Zoo. Income bonus: place a cube on a removed map ability, or remove a map ability marker for its reward. One water space becomes rock; the 1 CP for removing all markers is scored at game end; CP for continents/universities/workers adjusted."),
          baha("baha-10a", "地图 10A：救助站", "Map 10A: Rescue Station", "🚑", "#c0392b", "急救站的改版，原地图能力过强，重新分布。收入奖励：宣告任意 1 个动物图标、赞助商或任务牌，从牌堆搜索第一张符合的牌加入手牌。保护点分布有调整。", "A remake of Rescue Station with its too-strong abilities redistributed. Income bonus: name any animal icon, sponsor or mission card and take the first matching card from the deck. CP distribution adjusted."),
          baha("baha-13a", "地图 13A：测绘板", "Map 13A: Drawing Board", "📐", "#8a6d3b", "绘图板的改版。移除「抽 3 弃 3 终局卡」奖励，回到 2 格饲养区奖励；调整山水分布，赞助商建筑更好放；初次覆盖全地图得 5 点吸引力。", "A remake of Drawing Board: the draw-3-discard-3 final scoring reward becomes a 2-space enclosure again; rock and water moved so sponsor buildings fit; covering the whole map the first time gives 5 appeal."),
          baha("baha-diy01", "DIY01 石墙", "DIY01 Stone Wall", "🧱", "#8a8f96", "虚线的两个六角格互相连通：在其中一格放建筑后，可以从另一个虚线格开始摆放建筑。", "The two dotted hexes are linked: once you build on one, you may start building from the other.", "原作 BGG MKY，巴哈姆特玩家改版"),
          baha("baha-diy02", "DIY02 亲子农场", "DIY02 Family Farm", "🐑", "#e08a3a", "协会奖励改为寻找萌宠牌；可以额外建造 1 座萌宠馆（不减起始资金）。萌宠收益高，运气成分仍较大。", "Association reward finds petting zoo animals; you may build 1 extra petting zoo (starting money unchanged). High petting-zoo payoff, still luck-heavy.", "原作 BGG MKY，巴哈姆特玩家改版"),
          baha("baha-diy03", "DIY03 游乐园", "DIY03 Amusement Park", "🎢", "#d0577a", "二层休憩亭覆盖一层的（只计算二层），不能盖到三层；有测绘板的协会奖励。海洋世界后休憩亭变强，所以下调了本图。", "A second-level kiosk covers the first (only the top counts); no third level; has Drawing Board's association reward. Toned down since Marine Worlds strengthened kiosks.", "原作 BGG MKY，巴哈姆特玩家改版"),
          baha("baha-diy04", "DIY04 星级度假村", "DIY04 Star Resort", "🏨", "#c9a227", "五选项奖励中的卡牌改为直接多抽 1 张（原本多抽 1 弃 1）；本图专属地图奖励不算地图奖励。", "In the five-choice rewards, the card option now simply draws 1 extra card (was draw 1, discard 1); the map's own bonuses don't count as placement bonuses.", "原作 BGG MKY，巴哈姆特玩家改版"),
          baha("baha-diy05", "DIY05 水世界", "DIY05 Water World", "🐟", "#1f6fb5", "没有普通水域格，改用深层水：需要 1 水的动物和建筑随处可放，需要 2 水的要相邻深层水。收入奖励：触发所有珊瑚住客一次。", "No normal water spaces but deep water: anything needing 1 water can go anywhere; needing 2 water must be next to deep water. Income bonus: trigger all reef dwellers once.", "原作 BGG MKY，巴哈姆特玩家改版"),
          baha("baha-diy06", "DIY06 御竹园", "DIY06 Bamboo Garden", "🎋", "#4f9a3a", "以熊猫的家乡四川盆地为主题。协会奖励：放 1 个 4 格标准饲养区，可以覆盖在升级格上——理论上不升级建造也能盖满。", "Themed on the Sichuan Basin, home of pandas. Association reward: place a 4-space standard enclosure, even on upgrade spaces, so you can fill the zoo without upgrading Build.", "网络地图，巴哈姆特玩家平衡改版"),
          baha("baha-diy07", "DIY07 水力发电场", "DIY07 Hydropower Plant", "⚡", "#2f7fb0", "发电厂可以变为水域格；与发电厂相邻的标准饲养区可以住海洋动物；工人区增加找海洋动物的方法。", "The power plant can become a water space; standard enclosures next to it can house sea animals; the worker area adds ways to find sea animals.", "原作 153桌游吧（B 站），巴哈姆特玩家改版"),
          baha("baha-diy08", "DIY08 实验中心", "DIY08 Research Center", "🧪", "#3a6fb0", "153桌游吧的地图，调整了原本较弱的位置。", "A 153桌游吧 map, with its weaker spots adjusted.", "原作 153桌游吧（B 站），巴哈姆特玩家改版"),
          baha("baha-diy09", "DIY09 马勒戈壁", "DIY09 Gobi", "🏜️", "#c08a2f", "收入奖励：宣告任意 1 个动物图标、赞助商或任务牌，从弃牌堆找（找不到则没有牌）；4 大洲奖励：直接从弃牌堆拿 1 张想要的牌。", "Income bonus: name an animal icon, sponsor or mission card and search the discard pile (none if not found); the 4-continent reward takes any card you want from the discard pile.", "原作 153桌游吧（B 站），巴哈姆特玩家改版"),
          baha("baha-diy10", "DIY10 熊熊遇见你", "DIY10 Bear Encounter", "🐻", "#8a5a3a", "获得饲养区更难，和熊的要素更紧密。", "Enclosures are harder to get, and the map leans into bears.", "原作 153桌游吧（B 站），参考法国团队 la rivière"),
          baha("baha-diy11", "DIY11 工业时代", "DIY11 Industrial Age", "🏭", "#6b6f78", "153桌游吧的地图（帖子作者只做了繁体中文化，没有放出）。", "A 153桌游吧 map (the post's author only translated it and didn't share it).", "原作 153桌游吧（B 站）"),
          baha("baha-diy12", "DIY12 边境市集", "DIY12 Border Market", "💣", "#a0703a", "炸弹：开局可以把 1 个岩石格变成有地图奖励的格（右侧四选一）；收入和工人奖励各触发一次炸弹。地图奖励和赞助商给的贩售亭不受「相隔两格」限制。初次覆盖全地图才有奖励。", "Bomb: at the start, turn a rock space into a bonus space (pick 1 of 4); income and worker bonuses each trigger a bomb. Kiosks from map bonuses and sponsors ignore the 2-space spacing rule. The full-map reward is for the first time only.", "巴哈姆特玩家，参考法国团队 Winter is Coming"),
          baha("baha-diy13", "DIY13 侏罗纪公园", "DIY13 Jurassic Park", "🦖", "#4f7a2f", "动物住的饲养区完全在电网内减 2 元，和电网范围完全一致减 6 元。协会奖励：抽 3 个未使用的奖励板块，弃掉 2 个。专属地图奖励：再次使用你拿到过的奖励板块。", "Animals in enclosures fully inside the electric fence cost 2 less, or 6 less if the enclosure matches the fence exactly. Association reward: draw 3 unused bonus tiles, discard 2. Map bonus: use a bonus tile you've taken again.", "巴哈姆特玩家，改自法国团队 Jurassic Park"),
          baha("baha-diy14", "DIY14 潮间带", "DIY14 Tidal Zone", "🌊", "#1f9a9a", "连接后，你的标记可以放在任何牌上（不只动物牌）。无须连接：打出有海浪标记的牌后，可以主动触发一次海浪（弃置台面最前面的牌）。", "Once connected, your marks can go on any card, not just animals. No connection needed: after playing a card with a wave icon, you may trigger a wave (discard the front card of the display).", "巴哈姆特玩家，创意来自法国团队 SeaWorld"),
          // Fan-made maps shared on BoardGameGeek
          fan("fan-bird-sanctuary", "鸟类保护区", "Bird Sanctuary", "🦜", "#4f9a6a", "以鸟类为主题的自制地图。", "A bird-themed fan map.", BGG1),
          fan("fan-fun-land", "欢乐园", "Fun Land", "🎡", "#d0577a", "以游乐园为主题的自制地图。", "A fun-park themed fan map.", BGG1),
          fan("fan-herbivore-heaven", "食草动物天堂", "Herbivore Heaven", "🦒", "#8aa84f", "以食草动物为主题的自制地图。", "A herbivore-themed fan map.", BGG1),
          fan("fan-lazy-river", "漂流河", "Lazy River", "🛶", "#3a8fc0", "以河流为主题的自制地图；玩家评论说比较需要升级建造行动。", "A river-themed fan map; players note it pushes you to upgrade Build.", BGG1),
          fan("fan-monkey-business", "猴子乐园", "Monkey Business", "🐒", "#a0703a", "以灵长类为主题的自制地图。", "A primate-themed fan map.", BGG1),
          fan("fan-predator-plains", "猛兽平原", "Predator Plains", "🦁", "#c08a2f", "以掠食动物为主题的自制地图。", "A predator-themed fan map.", BGG1),
          fan("fan-reptile-grotto", "爬行动物洞穴", "Reptile Grotto", "🦎", "#5a8a3a", "以爬行动物为主题的自制地图。", "A reptile-themed fan map.", BGG1),
          fan("fan-university-zoo", "大学动物园", "University Zoo", "🎓", "#3a5f9a", "以科研为主题的自制地图。", "A research-themed fan map.", BGG1),
          fan("fan-deluxe-zoo", "豪华动物园", "Deluxe Zoo", "💎", "#7b5ea7", "特殊符号的规则印在地图上。", "Its special symbols' rules are printed on the map.", II),
          fan("fan-childrens-zoo", "儿童动物园", "Children's Zoo", "🧸", "#e08a3a", "运气成分较大，作者建议在轻松局使用。", "Swingy and luck-based; the designer suggests it for casual games.", II),
          // Rules transcribed from a photo of the club's printed copy of the map.
          {
            ...map("fan-ocean-park", "地图 153a：海洋公园", "Map 153a: Ocean Park", "🐬", "#1f8fb5", [
              [ABILITY, "左下角的 2 个水域格：如果已连接，则被激活（需分别激活）。激活时获得 1 个水标志；激活后可以用连接的水域安置海洋动物。", "The 2 water spaces at the bottom left are activated once connected (each separately). When activated, gain 1 water icon; afterwards you can use the connected water to house sea animals."],
              [{ zh: "奖励格", en: "Bonus spaces" }, "2 个 X 奖励格：覆盖时获得等同于你动物园中水标志数量的 X 标记。两个都被覆盖后，每次在你的动物园打出带水标志的牌，获得 2 金钱。", "2 X-token spaces: when covered, gain X-tokens equal to the water icons in your zoo. Once both are covered, gain 2 money each time you play a card with a water icon into your zoo."],
              [{ zh: "需要", en: "Needs" }, "海洋世界扩展（海洋馆、海洋动物）。", "The Marine Worlds expansion (aquariums, sea animals)."],
              [SOURCE, "153桌游吧（B 站）DIY", "Fan-made by 153桌游吧 (Bilibili)"],
            ], "fan"),
            summary: { zh: "153桌游吧 DIY 海洋地图：水域激活后可安置海洋动物；打出水标志牌得 2 金钱。", en: "Fan-made ocean map: activated water houses sea animals; water-icon cards give 2 money." },
          },
          // Rules transcribed from a photo of the club's printed copy of the map.
          map("fan-five-star-hotel", "五星酒店", "Five Star Hotel", "🏨", "#c9a227", [
            [ABILITY, "当吸引力记录条 / 保护记录条 / 声望记录条首次达到 40 / 8 / 10 时，可以获得以下一个奖励（每种限一次，不可以重复选择）。", "The first time your appeal / conservation / reputation track reaches 40 / 8 / 10, you may take one of the rewards below (each only once; you can't pick the same one twice)."],
            [{ zh: "奖励", en: "Rewards" }, "将 1 张标准行动卡牌替换为剩余变体行动卡牌中的任意 1 张（卡牌等级不变）；或抓取 2 张终局计分卡牌，并丢弃其中 1 张。", "Replace 1 standard action card with any of the remaining variant action cards (same level); or draw 2 final scoring cards and discard 1."],
            [{ zh: "需要", en: "Needs" }, "变体行动卡牌来自海洋世界扩展。", "The variant action cards come from the Marine Worlds expansion."],
            [SOURCE, "玩家 DIY", "Fan-made"],
          ], "fan"),
          fan("fan-underwater-zoo", "水下动物园（BGG）", "Underwater Zoo", "🐋", "#1f6fb5", "需要海洋世界扩展，主打海洋动物。", "Needs Marine Worlds; built around sea animals.", II),
          fan("fan-rocky-lake", "岩石湖", "Rocky Lake", "🪨", "#6b7a8a", "使用海洋世界的标记机制；中央的协会工作者格不能被复制。", "Uses Marine Worlds' marking mechanic; the central association worker space can't be duplicated.", II),
          fan("fan-empowered-zoo", "强化动物园", "Empowered Zoo", "⚡", "#c0392b", "带强化格的地图，作者仍在调整平衡。", "A map with empowered spaces; still being balanced.", II),
          fan("fan-conservation-station", "保护站", "Conservation Station", "🌿", "#2e7d4f", "更容易支持保护项目，但奖励较弱；只能翻转 3 张行动卡（不是 4 张）。", "Easier to support conservation projects but weaker rewards; you can flip only 3 action cards instead of 4.", II),
          fan("fan-landscaping", "园林绿化", "Landscaping", "🚚", "#6a8a3a", "标记区域要等两个卡车图标连通后才能建造。", "The marked area can't be built on until the two truck icons are connected.", BGG3),
          fan("fan-documentary-production", "纪录片制作", "Documentary Production", "🎥", "#8a3a5f", "集齐任意 6 只动物、或 4 种不同类型的动物时获得纪录片奖励。", "Documentary rewards for any 6 animals and for 4 different animal types.", BGG3),
          fan("fan-sustainable-design", "可持续设计", "Sustainable Design", "♻️", "#3a9a6a", "新图标「抽 1 张牌再弃 1 张」；与已覆盖格相邻的奖励格在收入阶段也会给奖励。", "New icon: draw a card, then discard one; bonuses next to covered spaces also pay out at income.", BGG3),
          fan("fan-investors", "投资者", "Investors", "💰", "#b8912f", "用一条投资轨道推进奖励；蓝色效果会在一轮内改变地图奖励。", "An investment track of rewards; the blue effect changes the map's bonuses for a round.", BGG3),
          fan("fan-treasure-forest", "宝藏森林", "Treasure Forest", "🌲", "#2f6f3f", "BGG 变体论坛分享的自制地图。", "A fan map shared in BGG's variants forum.", "BGG"),
        ],
      },
    ],
  };

  // BGA's alternative maps 1a–8a (by Feuerland, online only; printable from their site): same abilities as maps 1–8,
  // with rock/water spaces, placement bonuses and Build upgrade limits moved around.
  const maps = cfg.playerFields.find((f) => f.key === "map").options;
  const ALT = { zh: "BGA 替换版", en: "BGA alternative" };
  const alts = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const base = maps.find((o) => o.key === `map-${n}`);
    return {
      ...base,
      key: `map-${n}a`,
      group: "bga",
      name: { zh: base.name.zh.replace(`地图 ${n}：`, `地图 ${n}a：`), en: base.name.en.replace(`Map ${n}:`, `Map ${n}a:`) },
      rows: [
        ...base.rows,
        { label: ALT, text: { zh: "能力和保护项目奖励与地图 " + n + " 相同，岩石/水格、放置奖励和升级建造的限制位置不同。", en: "Same ability and conservation rewards as Map " + n + "; rock/water spaces, placement bonuses and Build upgrade limits are moved." } },
      ],
    };
  });
  maps.splice(maps.findIndex((o) => o.key === "map-8") + 1, 0, ...alts);

  HVScoreboard.register("ark-nova", cfg);
})();

