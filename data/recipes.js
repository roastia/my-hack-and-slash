const recipesData = [
  {
    "name": "ハーブ薬",
    "ingredients": {
      "薬草": 2
    },
    "result": {
      "type": "food",
      "name": "ハーブ薬",
      "hp": 35,
      "hunger": 0
    },
    "desc": "薬草×2 → HP+35回復"
  },
  {
    "name": "魔力の水",
    "ingredients": {
      "魔石": 1,
      "薬草": 1
    },
    "result": {
      "type": "sp_potion",
      "name": "魔力の水",
      "spRestore": 50
    },
    "desc": "魔石×1 + 薬草×1 → SP+50回復"
  },
  {
    "name": "鋼の盾片",
    "ingredients": {
      "鉄くず": 3
    },
    "result": {
      "type": "shield",
      "name": "鋼の盾片",
      "def": 5,
      "rarity": 1
    },
    "desc": "鉄くず×3 → DEF+5の盾"
  },
  {
    "name": "骨の鎧",
    "ingredients": {
      "骨片": 2,
      "布切れ": 1
    },
    "result": {
      "type": "armor",
      "name": "骨の鎧",
      "def": 6,
      "spirit": 2,
      "rarity": 1
    },
    "desc": "骨片×2 + 布切れ×1 → DEF+6, 精神+2の鎧"
  },
  {
    "name": "ローブ",
    "ingredients": {
      "布切れ": 3
    },
    "result": {
      "type": "armor",
      "name": "ローブ",
      "def": 2,
      "spirit": 4,
      "rarity": 1
    },
    "desc": "布切れ×3 → DEF+2, 精神+4の魔法ローブ"
  },
  {
    "name": "鬼骨の刃",
    "ingredients": {
      "骨片": 2,
      "鉄くず": 2
    },
    "result": {
      "type": "weapon",
      "name": "鬼骨の刃",
      "atk": 10,
      "rarity": 2
    },
    "desc": "骨片×2 + 鉄くず×2 → ATK+10の武器"
  },
  {
    "name": "魔封の水筒",
    "ingredients": {
      "魔石": 3
    },
    "result": {
      "type": "water",
      "name": "魔封の水筒",
      "thirstRestore": 60,
      "sp": 20
    },
    "desc": "魔石×3 → 渇き+60, SP+20"
  }
];
