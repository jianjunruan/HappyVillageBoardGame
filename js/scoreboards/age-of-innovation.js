// 大创造时代 Age of Innovation: each player's faction (12 in the base game) and terrain colour (7 landscape tiles).
// Abilities are from the Board Game Arena rules summary; terrain tiles from the publisher's rulebook (page 2).
HVScoreboard.register("age-of-innovation", {
  "maxPlayers": 5,
  "playerFields": [
    {
      "key": "faction",
      "type": "cards",
      "label": {
        "zh": "角色",
        "en": "Faction"
      },
      "unique": true,
      "statsTitle": {
        "zh": "角色统计",
        "en": "Factions"
      },
      "favLabel": {
        "zh": "常用角色",
        "en": "Favourite faction"
      },
      "options": [
        {
          "key": "blessed",
          "name": {
            "zh": "蒙福者",
            "en": "Blessed"
          },
          "img": "images/aoi/blessed.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "每个学科前进 1 级。",
                "en": "Gain one level in each Discipline."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "回合结束按学科计分时，你的学科等级都算 +3（可以超过 12）。",
                "en": "When scoring Disciplines at the end of a round, add 3 to your levels (even beyond 12)."
              }
            }
          ]
        },
        {
          "key": "felines",
          "name": {
            "zh": "猫族",
            "en": "Felines"
          },
          "img": "images/aoi/felines.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "银行学和医学各前进 1 级。",
                "en": "Advance one level in Banking and Medicine."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "每建成一座城市，可在任意学科共前进 3 级，并获得 1 本任选颜色的书。",
                "en": "When you make a City, advance 3 levels in any Discipline(s) and gain a Book of your choice."
              }
            }
          ]
        },
        {
          "key": "goblins",
          "name": {
            "zh": "哥布林",
            "en": "Goblins"
          },
          "img": "images/aoi/goblins.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "银行学和工程学各前进 1 级，获得 1 个工具。",
                "en": "Advance one level in Banking and Engineering. Gain 1 Tool."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "每使用 1 把铲子，获得 2 金币。",
                "en": "Gain 2 Coins whenever a Spade is used."
              }
            }
          ]
        },
        {
          "key": "illusionists",
          "name": {
            "zh": "幻术师",
            "en": "Illusionists"
          },
          "img": "images/aoi/illusionists.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "医学前进 2 级。",
                "en": "Advance 2 levels in Medicine."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "魔力行动的费用减 1；每做一次魔力行动得 3 分（5 人局得 4 分）。",
                "en": "Power actions cost 1 less. Gain 3 VP (4 VP with 5 players) for each Power action."
              }
            }
          ]
        },
        {
          "key": "inventors",
          "name": {
            "zh": "发明家",
            "en": "Inventors"
          },
          "img": "images/aoi/inventors.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "免费拿 1 个专长板块。",
                "en": "Take a Competency Tile for free."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "没有额外的持续能力。",
                "en": "No ongoing ability."
              }
            }
          ],
          "summary": {
            "zh": "免费拿 1 个专长板块。",
            "en": "Take a Competency Tile for free."
          }
        },
        {
          "key": "lizards",
          "name": {
            "zh": "蜥蜴人",
            "en": "Lizards"
          },
          "img": "images/aoi/lizards.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "一个学科前进 2 级，或两个学科各前进 1 级。",
                "en": "Advance 2 levels in 1 Discipline, or 1 level in 2."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "每建成一座城市，可做一次「改造并建造」：免费 1 把铲子和 1 个工坊（工坊不必放在刚改造的地块上）。",
                "en": "When you make a City, take a Terraform and Build action with 1 free Spade and 1 free Workshop (it can go on a different hex)."
              }
            }
          ]
        },
        {
          "key": "moles",
          "name": {
            "zh": "鼹鼠人",
            "en": "Moles"
          },
          "img": "images/aoi/moles.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "工程学前进 2 级。",
                "en": "Advance 2 levels in Engineering."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "可以「挖隧道」（多付 1 个工具）隔一格改造或建造，每次得 4 分；行动：付 1 个工具建一座桥，可跨过河流或两个有建筑的地块。",
                "en": "Tunnel (pay 1 extra Tool) to skip one hex when terraforming or building, gaining 4 VP. Action: pay 1 Tool to build a Bridge over a river or two built-up hexes."
              }
            }
          ]
        },
        {
          "key": "monks",
          "name": {
            "zh": "僧侣",
            "en": "Monks"
          },
          "img": "images/aoi/monks.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "法学前进 1 级；开局不放工坊，等其他玩家放完后放 1 座大学（照常拿专长板块）。",
                "en": "Advance 1 level in Law. Instead of a Workshop, place a University after everyone else has placed theirs (gain a Competency Tile as normal)."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "没有额外的持续能力。",
                "en": "No ongoing ability."
              }
            }
          ],
          "summary": {
            "zh": "法学前进 1 级；开局不放工坊，等其他玩家放完后放 1 座大学（照常拿专长板块）。",
            "en": "Advance 1 level in Law. Instead of a Workshop, place a University after everyone else has placed theirs (gain a Competency Tile as normal)."
          }
        },
        {
          "key": "navigators",
          "name": {
            "zh": "航海家",
            "en": "Navigators"
          },
          "img": "images/aoi/navigators.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "法学前进 3 级。",
                "en": "Advance 3 levels in Law."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "在河流旁建工坊时得 2 分。",
                "en": "Gain 2 VP when you build a Workshop next to a river."
              }
            }
          ]
        },
        {
          "key": "omar",
          "name": {
            "zh": "欧玛人",
            "en": "Omar"
          },
          "img": "images/aoi/omar.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "银行学和工程学各前进 1 级；开局除两个工坊外还要放 1 座中立塔。",
                "en": "Advance 1 level in Banking and Engineering. Also place a Neutral Tower with your two Workshops."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "每回合收入阶段额外获得 2 魔力和 2 金币。",
                "en": "During Income, gain 2 Power and 2 Coins."
              }
            }
          ]
        },
        {
          "key": "philosophers",
          "name": {
            "zh": "哲学家",
            "en": "Philosophers"
          },
          "img": "images/aoi/philosophers.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "银行学前进 2 级。",
                "en": "Advance 2 levels in Banking."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "拿专长板块时，再获得 1 本同色的书；特殊行动：获得 1 本任选颜色的书。",
                "en": "When you gain a Competency Tile, also gain a Book of the same colour. Special action: gain 1 Book of your choice."
              }
            }
          ]
        },
        {
          "key": "psychics",
          "name": {
            "zh": "灵能者",
            "en": "Psychics"
          },
          "img": "images/aoi/psychics.png",
          "rows": [
            {
              "label": {
                "zh": "开局",
                "en": "Setup"
              },
              "text": {
                "zh": "银行学和医学各前进 1 级，获得 1 个工具。",
                "en": "Advance 1 level in Banking and Medicine. Gain 1 Tool."
              }
            },
            {
              "label": {
                "zh": "能力",
                "en": "Ability"
              },
              "text": {
                "zh": "特殊行动：获得 5 魔力，然后立刻再做一个行动。",
                "en": "Special action: gain 5 Power, then take a second action right away."
              }
            }
          ]
        }
      ]
    },
    {
      "key": "terrain",
      "type": "swatches",
      "label": {
        "zh": "土地颜色",
        "en": "Terrain colour"
      },
      "unique": true,
      "statsTitle": {
        "zh": "土地颜色统计",
        "en": "Terrain colours"
      },
      "options": [
        {
          "key": "plains",
          "name": {
            "zh": "平原（棕）",
            "en": "Plains (brown)"
          },
          "color": "#8b5a2b",
          "img": "images/aoi/terrain-plains.png",
          "note": {
            "zh": "「升级改造」行动更便宜。",
            "en": "The Upgrade Terraforming action costs less."
          }
        },
        {
          "key": "swamp",
          "name": {
            "zh": "沼泽（黑）",
            "en": "Swamp (black)"
          },
          "color": "#262626",
          "img": "images/aoi/terrain-swamp.png",
          "note": {
            "zh": "开局后获得 1 个学者和 2 魔力。",
            "en": "After setup, gain 1 Scholar and 2 Power."
          }
        },
        {
          "key": "lake",
          "name": {
            "zh": "湖泊（蓝）",
            "en": "Lake (blue)"
          },
          "color": "#2f6fd0",
          "img": "images/aoi/terrain-lake.png",
          "note": {
            "zh": "航行等级 +1。",
            "en": "Advance 1 level in Sailing."
          }
        },
        {
          "key": "forest",
          "name": {
            "zh": "森林（绿）",
            "en": "Forest (green)"
          },
          "color": "#2e8b3e",
          "img": "images/aoi/terrain-forest.png",
          "note": {
            "zh": "每个学科前进 1 级，获得 1 魔力。",
            "en": "Advance 1 level in each Discipline. Gain 1 Power."
          }
        },
        {
          "key": "mountain",
          "name": {
            "zh": "山脉（灰）",
            "en": "Mountain (grey)"
          },
          "color": "#8a8f96",
          "img": "images/aoi/terrain-mountain.png",
          "note": {
            "zh": "收入阶段额外 2 金币；第一个公会产出 3 金币（不是 2）。",
            "en": "Gain 2 extra Coins during Income; your first Guild earns 3 Coins instead of 2."
          }
        },
        {
          "key": "wasteland",
          "name": {
            "zh": "荒地（红）",
            "en": "Wasteland (red)"
          },
          "color": "#c43c3c",
          "img": "images/aoi/terrain-wasteland.png",
          "note": {
            "zh": "开局后获得 1 个工具和 1 本书；第二个创新不用额外付书。",
            "en": "After setup, gain 1 Tool and 1 Book. Your second Innovation doesn't cost the extra Book."
          }
        },
        {
          "key": "desert",
          "name": {
            "zh": "沙漠（黄）",
            "en": "Desert (yellow)"
          },
          "color": "#e3b505",
          "img": "images/aoi/terrain-desert.png",
          "note": {
            "zh": "开局后获得 1 把铲子。",
            "en": "After setup, gain 1 Spade."
          }
        }
      ]
    }
  ]
});
