const shopData = [
  {
    "name": "パン",
    "category": "food",
    "cost": 15,
    "food": {
      "name": "パン",
      "type": "food",
      "hunger": 25,
      "hp": 0,
      "desc": "素朴な村のパン。"
    }
  },
  {
    "name": "干し肉",
    "category": "food",
    "cost": 25,
    "food": {
      "name": "干し肉",
      "type": "food",
      "hunger": 40,
      "hp": 0,
      "desc": "旅人の定番携帯食。"
    }
  },
  {
    "name": "薬草スープ",
    "category": "food",
    "cost": 35,
    "food": {
      "name": "薬草スープ",
      "type": "food",
      "hunger": 35,
      "hp": 8,
      "desc": "体も癒す薬草煮込み。"
    }
  },
  {
    "name": "冒険者の携帯食",
    "category": "food",
    "cost": 50,
    "food": {
      "name": "冒険者の携帯食",
      "type": "food",
      "hunger": 50,
      "hp": 0,
      "desc": "高カロリー保存食。"
    }
  },
  {
    "name": "聖水の滴",
    "category": "food",
    "cost": 80,
    "food": {
      "name": "聖水の滴",
      "type": "food",
      "hunger": 60,
      "hp": 20,
      "desc": "精霊の加護。空腹とHPを癒す。"
    }
  },
  {
    "name": "戦士の心得書",
    "category": "skill",
    "cost": 80,
    "effect": {
      "permBaseAtk": 3
    },
    "desc": "基礎 ATK +3（永続）"
  },
  {
    "name": "守護の誓い書",
    "category": "skill",
    "cost": 80,
    "effect": {
      "permBaseDef": 3
    },
    "desc": "基礎 DEF +3（永続）"
  },
  {
    "name": "疾風の秘伝書",
    "category": "skill",
    "cost": 100,
    "effect": {
      "baseSpeed": 3
    },
    "desc": "基礎 SPD +3（永続）"
  },
  {
    "name": "鋼の肉体書",
    "category": "skill",
    "cost": 100,
    "effect": {
      "permMaxHp": 25
    },
    "desc": "最大 HP +25（永続）"
  },
  {
    "name": "大食漢の秘法書",
    "category": "skill",
    "cost": 60,
    "effect": {
      "maxHunger": 20
    },
    "desc": "満腹度上限 +20（永続）"
  },
  {
    "name": "達人の剣術書",
    "category": "skill",
    "cost": 150,
    "effect": {
      "permBaseAtk": 6
    },
    "desc": "基礎 ATK +6（永続）"
  },
  {
    "name": "不動の大盾書",
    "category": "skill",
    "cost": 150,
    "effect": {
      "permBaseDef": 6
    },
    "desc": "基礎 DEF +6（永続）"
  },
  {
    "name": "清水",
    "category": "water",
    "cost": 15,
    "water": {
      "name": "清水",
      "type": "water",
      "thirstRestore": 40,
      "sp": 0
    },
    "desc": "渇き+40回復"
  },
  {
    "name": "聖なる水",
    "category": "water",
    "cost": 35,
    "water": {
      "name": "聖なる水",
      "type": "water",
      "thirstRestore": 80,
      "sp": 30
    },
    "desc": "渇き+80, SP+30回復"
  },
  {
    "name": "薬草",
    "category": "material",
    "cost": 10,
    "mat": "薬草",
    "desc": "素材: 薬草"
  },
  {
    "name": "鉄くず",
    "category": "material",
    "cost": 8,
    "mat": "鉄くず",
    "desc": "素材: 鉄くず"
  },
  {
    "name": "魔石",
    "category": "material",
    "cost": 20,
    "mat": "魔石",
    "desc": "素材: 魔石"
  },
  {
    "name": "渾身の一撃の書",
    "category": "combat_skill",
    "meritCost": 15,
    "skillId": "powerStrike",
    "desc": "戦闘スキル「渾身の一撃」を習得"
  },
  {
    "name": "連撃の書",
    "category": "combat_skill",
    "meritCost": 15,
    "skillId": "rapidStrike",
    "desc": "戦闘スキル「連撃」を習得"
  },
  {
    "name": "回復術の書",
    "category": "combat_skill",
    "meritCost": 20,
    "skillId": "healingWave",
    "desc": "戦闘スキル「回復術」を習得"
  },
  {
    "name": "鉄壁の書",
    "category": "combat_skill",
    "meritCost": 15,
    "skillId": "guardStance",
    "desc": "戦闘スキル「鉄壁」を習得"
  }
];
