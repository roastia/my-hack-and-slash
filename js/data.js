// =============================================================
// data.js
// =============================================================

const dungeons = [
    {
        name: 'スライムの洞窟', maxFloor: 3, diff: 1,
        boss: { name: 'キングスライム', speed: 6, hp: 40, atk: 4, exp: 30 },
        story: '勇者よ、旅立ちのときが来た。\n村はずれの洞窟にスライムが群れをなし、田畑を荒らしている。\nまずはここで剣を慣らせ。'
    },
    {
        name: '呪われた墓地', maxFloor: 4, diff: 2,
        boss: { name: '骸骨の王', speed: 7, hp: 70, atk: 6, exp: 50 },
        story: '夜ごと墓場から死者が蘇り、村人を脅かしている。\n亡者を再び眠らせるのも、勇者の務めだ。\n怖気づくな。'
    },
    {
        name: '盗賊団のアジト', maxFloor: 4, diff: 3,
        boss: { name: '頭目ガルフ', speed: 10, hp: 120, atk: 9, exp: 80 },
        story: '街道を荒らす盗賊団の根城が山中に見つかった。\n奪われた旅人の財と命を返すため、乗り込め。\nやつらも命がけで立ち向かってくるぞ。'
    },
    {
        name: '廃城の地下', maxFloor: 5, diff: 4,
        boss: { name: '甲冑将軍ヴェルガ', speed: 8, hp: 180, atk: 12, exp: 120 },
        story: '朽ち果てた古城の地下に、魔物が巣食い始めた。\n城主の亡霊が番をしているという噂もある。\n気を引き締めて挑め。'
    },
    {
        name: '毒沼の遺跡', maxFloor: 5, diff: 5,
        boss: { name: '沼地の主バロン', speed: 7, hp: 250, atk: 16, exp: 180 },
        story: 'かつて栄えた古代文明の遺跡が、毒の沼に沈んでいる。\n底に眠る財宝を求めて入った者は誰も戻らなかった。\n今のお前ならどうだ？'
    },
    {
        name: '魔物の森', maxFloor: 6, diff: 6,
        boss: { name: '森の大魔女', speed: 11, hp: 350, atk: 22, exp: 250 },
        story: '光も届かぬ深い森に、凶暴な魔物が棲み着いた。\nかつて里を守っていた精霊の加護も今はなく、森全体が牙をむく。\n道を切り開け。'
    },
    {
        name: '氷雪の洞窟', maxFloor: 6, diff: 7,
        boss: { name: '氷の女王', speed: 10, hp: 480, atk: 30, exp: 350 },
        story: '山奥の洞窟が永久凍土に閉ざされ、村の水源が絶えかけている。\n氷を支配する女王が棲むという——倒せば春が戻るかもしれない。'
    },
    {
        name: '砂漠の古神殿', maxFloor: 7, diff: 8,
        boss: { name: '番人スフィンクス', speed: 9, hp: 650, atk: 40, exp: 480 },
        story: '砂に埋もれた神殿から強大な魔力が溢れ出している。\n封じられていた古の番人が目覚めたのだ。\n謎を解いて打ち勝て。'
    },
    {
        name: '火山の地下道', maxFloor: 7, diff: 9,
        boss: { name: '炎の魔人ヴォルカン', speed: 12, hp: 850, atk: 52, exp: 650 },
        story: '噴火寸前の火山の内部に道がある。\n溶岩と魔物が渦巻くその先に、封印の鍵があるという。\n炎を恐れるな。'
    },
    {
        name: '海底神殿', maxFloor: 8, diff: 10,
        boss: { name: '海神の化身', speed: 10, hp: 1100, atk: 65, exp: 850 },
        story: '大海の底に沈む古代の神殿。\n海神の怒りが波と嵐をもたらしているという。\n深みへと潜れ——帰る空気は保証しない。'
    },
    {
        name: '古代の迷宮', maxFloor: 8, diff: 11,
        boss: { name: '迷宮の支配者デダロス', speed: 9, hp: 1450, atk: 85, exp: 1100 },
        story: '終わりのない迷路が地下に広がっている。\n入った者は全員迷子になったと言われる。\n知恵と剣で突破せよ。'
    },
    {
        name: '魔族の砦', maxFloor: 9, diff: 12,
        boss: { name: '魔族将軍ゲルニコ', hp: 1900, atk: 110, exp: 1450 },
        story: '魔王軍の前線基地が山の要害に築かれた。\n砦が落ちれば、王都への道が開く。\n総攻撃あるのみだ。'
    },
    {
        name: '竜の巣穴', maxFloor: 9, diff: 13,
        boss: { name: 'シルバードレイク', hp: 2500, atk: 145, exp: 1900 },
        story: '古竜の一族が棲む山岳の洞窟。\n竜の鱗は最強の防具になるという——しかし竜は死を厭わず戦う。'
    },
    {
        name: '呪いの塔', maxFloor: 10, diff: 14,
        boss: { name: '呪いの塔の魔女', hp: 3200, atk: 190, exp: 2500 },
        story: '近づく者を次々と石に変えてきた呪いの塔。\n頂にいる魔女を倒さぬ限り、呪いは解けない。\n意志の力で石化を跳ね返せ。'
    },
    {
        name: '精霊の試練場', maxFloor: 10, diff: 15,
        boss: { name: '精霊王', hp: 4200, atk: 250, exp: 3200 },
        story: '神に選ばれた勇者だけが踏み込める試練の地。\n精霊たちはお前の真の強さを問う。\n逃げることは許されない。'
    },
    {
        name: '魔王の前線基地', maxFloor: 10, diff: 16,
        boss: { name: 'ダークビショップ', hp: 5500, atk: 320, exp: 4200 },
        story: '魔王みずから設けた最前線の拠点。\nここを落とせば魔王城への道が見えてくる。\nいよいよ本番だ——心して挑め。'
    },
    {
        name: '闇の回廊', maxFloor: 11, diff: 17,
        boss: { name: '闇の化身', hp: 7000, atk: 410, exp: 5500 },
        story: '光が届かぬ漆黒の通路が延々と続く。\nここで正気を保てなかった者は、闇に飲まれ魔物になった。\n前だけを見ろ。'
    },
    {
        name: '奈落の底', maxFloor: 11, diff: 18,
        boss: { name: '奈落の番人ベルガル', hp: 9000, atk: 530, exp: 7000 },
        story: '世界の底へと続く深淵。ここより先は地獄と呼ばれる領域だ。\n生きて帰った者はいない——まだ、誰も。'
    },
    {
        name: '魂の迷宮', maxFloor: 11, diff: 19,
        boss: { name: '悪夢の化身ナイトメア', hp: 11500, atk: 680, exp: 9000 },
        story: '死した英雄たちの魂が彷徨う場所。\n恐怖そのものが形を持ち、お前の前に立ちはだかる。\n自分の心と戦え。'
    },
    {
        name: '魔王城・外壁', maxFloor: 12, diff: 20,
        boss: { name: '守護竜バルドラン', hp: 15000, atk: 880, exp: 11500 },
        story: 'ついに魔王城が見えた。\n城壁を守る強大な竜を突破しなければ、中へは入れない。\n長い旅の集大成——諦めるな！'
    },
    {
        name: '魔王城・地下牢', maxFloor: 12, diff: 21,
        boss: { name: '処刑人グレイム', hp: 19000, atk: 1130, exp: 15000 },
        story: '数えきれぬ罪なき者が囚われたこの地下牢。\n彼らの怨念が怪物を生み出している。\n全ての囚人を救うため、深くへ進め。'
    },
    {
        name: '魔王城・武器庫', maxFloor: 12, diff: 22,
        boss: { name: '武器神マルスゲル', hp: 25000, atk: 1450, exp: 19000 },
        story: '魔王軍の兵器が集積された巨大な武器庫。\n奥には魔王軍最強の武器と、それを守る存在が潜む。\n制圧して敵の力を削げ。'
    },
    {
        name: '魔王城・魔法塔', maxFloor: 13, diff: 23,
        boss: { name: '大魔道士ゾルガ', hp: 32000, atk: 1870, exp: 25000 },
        story: '魔法の研究が行われる塔に、膨大な魔力が渦巻いている。\n魔王の軍師、大魔道士ゾルガがここで待ち受けている。\n魔法には魔法で対抗せよ。'
    },
    {
        name: '魔王城・玉座への間', maxFloor: 13, diff: 24,
        boss: { name: '近衛騎士長ジーク', hp: 41000, atk: 2400, exp: 32000 },
        story: '玉座の間まであと一歩。だが魔王の親衛隊が最後の防壁となって立ちふさがる。\nここを越えれば——魔王と対面できる。'
    },
    {
        name: '混沌の谷', maxFloor: 14, diff: 25,
        boss: { name: '混沌の化身カオス', hp: 52000, atk: 3100, exp: 41000 },
        story: '時空が歪み、あらゆる存在が混ざり合う谷。\nここは世界の法則が通じない。\n生き残ることが唯一のルールだ。'
    },
    {
        name: '神々の試練', maxFloor: 14, diff: 26,
        boss: { name: '神の試練ガーディアン', hp: 67000, atk: 4000, exp: 52000 },
        story: '神が人間の限界を試す場所。\n真の勇者にしか突破できない、最後の聖域だ。\n信念を貫け。'
    },
    {
        name: '創世の神殿', maxFloor: 14, diff: 27,
        boss: { name: '世界竜アルカヌス', hp: 86000, atk: 5150, exp: 67000 },
        story: 'この世界が生まれた場所、神話の神殿。\n世界竜が目覚め、全てを終わらせようとしている。\n世界の命運はお前の剣にかかっている。'
    },
    {
        name: '終焉の回廊', maxFloor: 15, diff: 28,
        boss: { name: '終焉の天使', hp: 110000, atk: 6650, exp: 86000 },
        story: 'あらゆる命が尽きる場所への道。\n天使は終わりをもたらすためにここにいる。\nこれが最後の戦いかもしれない——それでも剣を取れ。'
    },
    {
        name: '世界の果て', maxFloor: 15, diff: 29,
        boss: { name: '世界の意思', hp: 140000, atk: 8600, exp: 110000 },
        story: '地平の果て、世界が終わる場所。\nここには世界そのものの意思が宿っているという。\n終わりと始まりが重なり合う地に立て。'
    },
    {
        name: '神話の頂', maxFloor: 16, diff: 30,
        boss: { name: '究極の魔王ゼロアス', hp: 180000, atk: 11000, exp: 140000 },
        story: '全ての神話の頂点。\n究極の魔王ゼロアスがここで待っている。\n——長い旅の、本当の終わりだ。立ち向かえ、勇者よ。'
    }
];


const enemiesBase = [
    // 邪霊族 (magicAtk: 魔法ダメージあり)
    { name: 'スライム',     hp: 8,   atk: 2,  exp: 4,  speed: 4,  type: '粘体族', magicAtk: 0 },
    { name: '大スライム',   hp: 14,  atk: 3,  exp: 7,  speed: 5,  type: '粘体族', magicAtk: 0 },
    { name: '毒スライム',   hp: 12,  atk: 4,  exp: 9,  speed: 6,  type: '粘体族', magicAtk: 1, mat: '薬草' },
    { name: 'ゴブリン',     hp: 12,  atk: 4,  exp: 8,  speed: 8,  type: '小鬼族', magicAtk: 0, mat: '布切れ' },
    { name: 'ゴブリン盗賊', hp: 15,  atk: 6,  exp: 12, speed: 11, type: '小鬼族', magicAtk: 0, mat: '布切れ' },
    { name: 'コボルト',     hp: 18,  atk: 5,  exp: 11, speed: 7,  type: '獣人族', magicAtk: 0, mat: '骨片' },
    { name: 'オーク',       hp: 30,  atk: 8,  exp: 18, speed: 6,  type: '鬼族',   magicAtk: 0, mat: '鉄くず' },
    { name: 'オーク剣士',   hp: 35,  atk: 10, exp: 22, speed: 7,  type: '鬼族',   magicAtk: 0, mat: '鉄くず' },
    { name: 'ゾンビ',       hp: 22,  atk: 7,  exp: 14, speed: 4,  type: '不死族', magicAtk: 2, mat: '骨片' },
    { name: 'スケルトン',   hp: 20,  atk: 8,  exp: 15, speed: 6,  type: '不死族', magicAtk: 1, mat: '骨片' },
    { name: '呪い師スケルトン', hp: 18, atk: 6, exp: 18, speed: 5, type: '不死族', magicAtk: 5, mat: '魔石' },
    { name: 'ヘビ',         hp: 15,  atk: 5,  exp: 10, speed: 10, type: '爬虫族', magicAtk: 0, mat: '薬草' },
    { name: '毒ヘビ',       hp: 18,  atk: 7,  exp: 14, speed: 12, type: '爬虫族', magicAtk: 2, mat: '薬草' },
    { name: 'バット',       hp: 10,  atk: 4,  exp: 8,  speed: 13, type: '鳥族',   magicAtk: 0 },
    { name: '大コウモリ',   hp: 20,  atk: 7,  exp: 16, speed: 14, type: '鳥族',   magicAtk: 0 },
    { name: 'コカトリス',   hp: 28,  atk: 10, exp: 22, speed: 11, type: '鳥族',   magicAtk: 3, mat: '骨片' },
    { name: 'ウルフ',       hp: 25,  atk: 9,  exp: 16, speed: 12, type: '獣族',   magicAtk: 0 },
    { name: '炎狼',         hp: 30,  atk: 12, exp: 24, speed: 13, type: '獣族',   magicAtk: 4, mat: '魔石' },
    { name: 'ゴーレム',     hp: 55,  atk: 14, exp: 30, speed: 4,  type: '機械族', magicAtk: 0, mat: '鉄くず' },
    { name: '不良品ゴーレム', hp: 40, atk: 10, exp: 22, speed: 6, type: '機械族', magicAtk: 0, mat: '鉄くず' },
    { name: 'ミミック',     hp: 35,  atk: 13, exp: 28, speed: 8,  type: '不定形', magicAtk: 0, mat: '布切れ' },
    { name: 'サラマンダー', hp: 40,  atk: 14, exp: 32, speed: 9,  type: '爬虫族', magicAtk: 6, mat: '魔石' },
    { name: '毒キノコ',     hp: 20,  atk: 6,  exp: 12, speed: 3,  type: '植物族', magicAtk: 3, mat: '薬草' },
    { name: '暗黒騎士',     hp: 60,  atk: 18, exp: 45, speed: 9,  type: '人族',   magicAtk: 0, mat: '鉄くず' },
    { name: '魔法使い兵',   hp: 25,  atk: 8,  exp: 38, speed: 8,  type: '人族',   magicAtk: 10, mat: '魔石' },
    { name: 'マンドレイク',  hp: 30,  atk: 10, exp: 26, speed: 5,  type: '植物族', magicAtk: 4, mat: '薬草' },
    { name: 'ウィスプ',     hp: 18,  atk: 5,  exp: 22, speed: 15, type: '邪霊族', magicAtk: 8, mat: '魔石' },
    { name: 'バンシー',     hp: 22,  atk: 7,  exp: 28, speed: 13, type: '邪霊族', magicAtk: 9, mat: '魔石' },
    { name: 'サキュバス',   hp: 35,  atk: 12, exp: 40, speed: 11, type: '悪魔族', magicAtk: 7, mat: '布切れ' },
    { name: 'デーモン',     hp: 70,  atk: 20, exp: 55, speed: 10, type: '悪魔族', magicAtk: 5, mat: '魔石' },
    { name: '竜の子',       hp: 80,  atk: 24, exp: 65, speed: 9,  type: '竜族',   magicAtk: 8, mat: '骨片' },
    { name: 'サンドワーム', hp: 90,  atk: 22, exp: 60, speed: 5,  type: '虫族',   magicAtk: 0, mat: '骨片' },
    { name: 'ガーゴイル',   hp: 75,  atk: 19, exp: 58, speed: 8,  type: '石族',   magicAtk: 3, mat: '鉄くず' },
    { name: 'リッチ',       hp: 50,  atk: 14, exp: 70, speed: 7,  type: '不死族', magicAtk: 14, mat: '魔石' },
    { name: 'ゴルゴン',     hp: 100, atk: 28, exp: 80, speed: 7,  type: '獣族',   magicAtk: 4, mat: '骨片' },
    { name: '闇の精霊',     hp: 40,  atk: 10, exp: 60, speed: 14, type: '邪霊族', magicAtk: 16, mat: '魔石' },
];







// ダンジョンの難易度に応じた敵プールを返す（enemiesBase全体を難易度でフィルタリング）
// explore.js の addEnemyToStack で activeDungeon.enemies が null なら enemiesBase を使う
// ここで明示的にダンジョン別の敵セットを定義することも可能
function getEnemiesForDungeon(dungeon) {
    if (!dungeon) return enemiesBase;
    // 難易度に応じた敵の配列（enemiesBase からスライス）
    const diff = dungeon.diff || 1;
    // 難易度1-5: 序盤の敵, 6-10: 中盤, 11+: 終盤
    return enemiesBase; // 全敵から選択（スケーリングで難易度調整済み）
}

// =============================================================
// 戦闘スキルデータ
// =============================================================
const combatSkills = [
    {
        id: 'powerStrike',
        name: '渾身の一撃',
        icon: '💥',
        atbMultiplier: 1.4,   // 通常より遅い（強力）
        shopCost: 80,
        desc: '力を込めた一撃。Lvが上がるほど威力増加。',
        levelThresholds: [0, 10, 30, 60, 100],
        dmgMults: [1.8, 2.2, 2.7, 3.2, 4.0],
    },
    {
        id: 'rapidStrike',
        name: '連撃',
        icon: '⚔',
        atbMultiplier: 0.75,  // 通常より速い（連続）
        shopCost: 80,
        desc: '素早い連続攻撃。Lvが上がるほど連撃数増加。',
        levelThresholds: [0, 10, 30, 60, 100],
        hitsPerLevel: [2, 2, 3, 3, 4],
        hitMult: 0.55,
    },
    {
        id: 'healingWave',
        name: '回復術',
        icon: '✦',
        atbMultiplier: 1.0,
        shopCost: 100,
        desc: 'HPを回復する。Lvが上がるほど回復量増加。',
        levelThresholds: [0, 10, 30, 60, 100],
        healPcts: [0.15, 0.20, 0.25, 0.32, 0.42],
    },
    {
        id: 'guardStance',
        name: '鉄壁',
        icon: '🛡',
        atbMultiplier: 0.9,
        shopCost: 80,
        desc: '次の敵攻撃を大幅に軽減。Lvで効果増加。',
        levelThresholds: [0, 10, 30, 60, 100],
        defMults: [0.5, 0.4, 0.3, 0.2, 0.1], // 被ダメ倍率
    },
];

function getSkillLevel(skillId) {
    const entry = typeof skillBook !== 'undefined' ? skillBook[skillId] : null;
    if (!entry || !entry.learned) return 0;
    const skill = combatSkills.find(s => s.id === skillId);
    if (!skill) return 1;
    let lv = 1;
    for (let i = 0; i < skill.levelThresholds.length; i++) {
        if (entry.uses >= skill.levelThresholds[i]) lv = i + 1;
    }
    return Math.min(5, lv);
}

function getSkillNextThreshold(skillId) {
    const entry = typeof skillBook !== 'undefined' ? skillBook[skillId] : null;
    if (!entry) return 10;
    const skill = combatSkills.find(s => s.id === skillId);
    if (!skill) return 10;
    const lv = getSkillLevel(skillId);
    return lv < 5 ? skill.levelThresholds[lv] : null;
}


// =============================================================
// クラフトレシピ（浅層: 最大2素材）
// =============================================================
const craftMaterialTypes = ['薬草', '鉄くず', '魔石', '骨片', '布切れ'];

const craftRecipes = [
    {
        name: 'ハーブ薬',
        ingredients: { '薬草': 2 },
        result: { type: 'food', name: 'ハーブ薬', hp: 35, hunger: 0 },
        desc: '薬草×2 → HP+35回復',
    },
    {
        name: '魔力の水',
        ingredients: { '魔石': 1, '薬草': 1 },
        result: { type: 'sp_potion', name: '魔力の水', spRestore: 50 },
        desc: '魔石×1 + 薬草×1 → SP+50回復',
    },
    {
        name: '鋼の盾片',
        ingredients: { '鉄くず': 3 },
        result: { type: 'shield', name: '鋼の盾片', def: 5, rarity: 1 },
        desc: '鉄くず×3 → DEF+5の盾',
    },
    {
        name: '骨の鎧',
        ingredients: { '骨片': 2, '布切れ': 1 },
        result: { type: 'armor', name: '骨の鎧', def: 6, spirit: 2, rarity: 1 },
        desc: '骨片×2 + 布切れ×1 → DEF+6, 精神+2の鎧',
    },
    {
        name: 'ローブ',
        ingredients: { '布切れ': 3 },
        result: { type: 'armor', name: 'ローブ', def: 2, spirit: 4, rarity: 1 },
        desc: '布切れ×3 → DEF+2, 精神+4の魔法ローブ',
    },
    {
        name: '鬼骨の刃',
        ingredients: { '骨片': 2, '鉄くず': 2 },
        result: { type: 'weapon', name: '鬼骨の刃', atk: 10, rarity: 2 },
        desc: '骨片×2 + 鉄くず×2 → ATK+10の武器',
    },
    {
        name: '魔封の水筒',
        ingredients: { '魔石': 3 },
        result: { type: 'water', name: '魔封の水筒', thirstRestore: 60, sp: 20 },
        desc: '魔石×3 → 渇き+60, SP+20',
    },
];

// =============================================================
// 道具屋アイテム
// =============================================================
const shopItems = [
    // ── 食料 ──────────────────────────────────────────────────
    { name: 'パン',             category: 'food',  cost: 15,
      food: { name: 'パン',             type: 'food', hunger: 25, hp: 0,  desc: '素朴な村のパン。' } },
    { name: '干し肉',           category: 'food',  cost: 25,
      food: { name: '干し肉',           type: 'food', hunger: 40, hp: 0,  desc: '旅人の定番携帯食。' } },
    { name: '薬草スープ',       category: 'food',  cost: 35,
      food: { name: '薬草スープ',       type: 'food', hunger: 35, hp: 8,  desc: '体も癒す薬草煮込み。' } },
    { name: '冒険者の携帯食',   category: 'food',  cost: 50,
      food: { name: '冒険者の携帯食',   type: 'food', hunger: 50, hp: 0,  desc: '高カロリー保存食。' } },
    { name: '聖水の滴',         category: 'food',  cost: 80,
      food: { name: '聖水の滴',         type: 'food', hunger: 60, hp: 20, desc: '精霊の加護。空腹とHPを癒す。' } },
    // ── スキル書 ───────────────────────────────────────────────
    { name: '戦士の心得書',     category: 'skill', cost: 80,
      effect: { permBaseAtk: 3 },  desc: '基礎 ATK +3（永続）' },
    { name: '守護の誓い書',     category: 'skill', cost: 80,
      effect: { permBaseDef: 3 },  desc: '基礎 DEF +3（永続）' },
    { name: '疾風の秘伝書',     category: 'skill', cost: 100,
      effect: { baseSpeed: 3 },    desc: '基礎 SPD +3（永続）' },
    { name: '鋼の肉体書',       category: 'skill', cost: 100,
      effect: { permMaxHp: 25 },   desc: '最大 HP +25（永続）' },
    { name: '大食漢の秘法書',   category: 'skill', cost: 60,
      effect: { maxHunger: 20 },   desc: '満腹度上限 +20（永続）' },
    { name: '達人の剣術書',     category: 'skill', cost: 150,
      effect: { permBaseAtk: 6 },  desc: '基礎 ATK +6（永続）' },
    { name: '不動の大盾書',     category: 'skill', cost: 150,
      effect: { permBaseDef: 6 },  desc: '基礎 DEF +6（永続）' },
    // ── 戦闘スキル書 ───────────────────────────────────────────
    // ── 水・SP回復 ───────────────────────────────────────────
    { name: '清水',       category: 'water', cost: 15,
      water: { name: '清水',   type: 'water', thirstRestore: 40, sp: 0 },
      desc: '渇き+40回復' },
    { name: '聖なる水',   category: 'water', cost: 35,
      water: { name: '聖なる水', type: 'water', thirstRestore: 80, sp: 30 },
      desc: '渇き+80, SP+30回復' },
    // ── 素材（購入）────────────────────────────────────────────
    { name: '薬草',   category: 'material', cost: 10, mat: '薬草',  desc: '素材: 薬草' },
    { name: '鉄くず', category: 'material', cost: 8,  mat: '鉄くず', desc: '素材: 鉄くず' },
    { name: '魔石',   category: 'material', cost: 20, mat: '魔石',  desc: '素材: 魔石' },
    // ── 戦闘スキル書 ─────────────────────────────────────────
    { name: '渾身の一撃の書', category: 'combat_skill', meritCost: 15, skillId: 'powerStrike',
      desc: '戦闘スキル「渾身の一撃」を習得' },
    { name: '連撃の書',       category: 'combat_skill', meritCost: 15, skillId: 'rapidStrike',
      desc: '戦闘スキル「連撃」を習得' },
    { name: '回復術の書',     category: 'combat_skill', meritCost: 20, skillId: 'healingWave',
      desc: '戦闘スキル「回復術」を習得' },
    { name: '鉄壁の書',       category: 'combat_skill', meritCost: 15, skillId: 'guardStance',
      desc: '戦闘スキル「鉄壁」を習得' },
];

// =============================================================
// 食料データベース
// =============================================================
const foodDatabase = [
    { name: 'パン',             hunger: 25, hp: 0,  desc: '素朴な村のパン。空腹を少し満たす。' },
    { name: '干し肉',           hunger: 40, hp: 0,  desc: '旅人の定番。しっかり腹を満たす。' },
    { name: '薬草スープ',       hunger: 35, hp: 8,  desc: '薬草を煮込んだスープ。体も癒す。' },
    { name: '炎の実',           hunger: 30, hp: 5,  desc: '辛い木の実。体が燃えるように熱くなる。' },
    { name: '冒険者の携帯食',   hunger: 50, hp: 0,  desc: '高カロリーの保存食。空腹を大きく満たす。' },
    { name: '神秘の木の実',     hunger: 20, hp: 15, desc: '光を放つ果実。少量でHPが大きく回復。' },
    { name: 'ドラゴン肉',       hunger: 80, hp: 25, desc: '竜の肉。滋養に溢れ、力が漲る。' },
    { name: '聖水の滴',         hunger: 60, hp: 20, desc: '精霊が宿る泉の水。空腹と傷を癒す。' },
    { name: '黒パン',           hunger: 20, hp: 0,  desc: '硬い黒パン。不味いが腹は満たせる。' },
    { name: '森の恵み',         hunger: 30, hp: 10, desc: '森で採れた果物と木の実の詰め合わせ。' }
];

const itemsDatabase = [
    // 武器 (30)
    { name: '木の棒',             type: 'weapon', atk:  0 },
    { name: '旅人の短剣',         type: 'weapon', atk:  1 },
    { name: '銅の剣',             type: 'weapon', atk:  2 },
    { name: '鉄の剣',             type: 'weapon', atk:  3, crit:  2 },
    { name: '騎士の剣',           type: 'weapon', atk:  4 },
    { name: '炎の剣',             type: 'weapon', atk:  5, crit:  3 },
    { name: '魔法の剣',           type: 'weapon', atk:  6 },
    { name: '大剣',               type: 'weapon', atk:  7 },
    { name: '竜殺しの剣',         type: 'weapon', atk:  8, crit:  4 },
    { name: '聖なる剣',           type: 'weapon', atk:  9, steal: 4 },
    { name: '英雄の槍',           type: 'weapon', atk: 10 },
    { name: '魔王の剣',           type: 'weapon', atk: 11, crit:  5 },
    { name: '伝説の剣',           type: 'weapon', atk: 12 },
    { name: '神剣・天威',         type: 'weapon', atk: 13, crit:  6 },
    { name: '究極剣・ゼロ',       type: 'weapon', atk: 14 },
    { name: '短剣・毒刃',         type: 'weapon', atk:  1, steal: 5 },
    { name: '戦士の斧',           type: 'weapon', atk:  5 },
    { name: '魔法の杖',           type: 'weapon', atk:  3, crit:  4 },
    { name: '聖なる槍',           type: 'weapon', atk:  7, steal: 5 },
    { name: '黒の鎌',             type: 'weapon', atk:  6, steal: 6 },
    { name: '鉄の弓',             type: 'weapon', atk:  4, crit:  3 },
    { name: '賢者の杖',           type: 'weapon', atk:  5, crit:  5 },
    { name: '竜骨の槍',           type: 'weapon', atk:  9 },
    { name: '暗殺者の短剣',       type: 'weapon', atk:  2, steal: 8 },
    { name: '炎の弓',             type: 'weapon', atk:  8, crit:  4 },
    { name: 'エルフの弓矢',       type: 'weapon', atk:  6, crit:  6 },
    { name: '黄金の剣',           type: 'weapon', atk: 10, steal: 6 },
    { name: '破滅の大鎌',         type: 'weapon', atk: 12, steal: 7 },
    { name: '神話の弓',           type: 'weapon', atk: 11, crit:  7 },
    { name: '世界樹の枝',         type: 'weapon', atk: 16, steal: 8 },
    // 兜 (20)
    { name: '皮の帽子',   type: 'helm', def:  1 },
    { name: '鉄兜',       type: 'helm', def:  2 },
    { name: '騎士の兜',   type: 'helm', def:  3 },
    { name: '魔法の帽子', type: 'helm', def:  2, crit:  3 },
    { name: '炎の兜',     type: 'helm', def:  4 },
    { name: '竜鱗の兜',   type: 'helm', def:  5 },
    { name: '黄金の冠',   type: 'helm', def:  4, steal: 4 },
    { name: '聖者の帽子', type: 'helm', def:  3, steal: 3 },
    { name: '魔王の兜',   type: 'helm', def:  6 },
    { name: '英雄の兜',   type: 'helm', def:  7 },
    { name: '革の帽子',   type: 'helm', def:  1, crit:  2 },
    { name: '賢者の冠',   type: 'helm', def:  3, crit:  4 },
    { name: '鋼の兜',     type: 'helm', def:  5 },
    { name: '妖精の帽子', type: 'helm', def:  2, steal: 5 },
    { name: '魔法の兜',   type: 'helm', def:  6, crit:  3 },
    { name: '戦士の兜',   type: 'helm', def:  4 },
    { name: '神話の冠',   type: 'helm', def:  8 },
    { name: '守護の兜',   type: 'helm', def:  7, steal: 3 },
    { name: '暗黒の兜',   type: 'helm', def:  8, crit:  4 },
    { name: '伝説の兜',   type: 'helm', def:  9 },
    // 鎧 (20)
    { name: '皮の鎧',       type: 'armor', def:  2 },
    { name: '鎖帷子',       type: 'armor', def:  3 },
    { name: '鉄の鎧',       type: 'armor', def:  4 },
    { name: '騎士の鎧',     type: 'armor', def:  5 },
    { name: '魔法の鎧',     type: 'armor', def:  4, crit:  3 },
    { name: '炎の鎧',       type: 'armor', def:  6 },
    { name: '竜鱗の鎧',     type: 'armor', def:  7 },
    { name: '黄金の鎧',     type: 'armor', def:  6, steal: 4 },
    { name: '聖なる鎧',     type: 'armor', def:  5, steal: 5 },
    { name: '英雄の鎧',     type: 'armor', def:  8 },
    { name: '魔王の鎧',     type: 'armor', def:  9 },
    { name: '革の胸当て',   type: 'armor', def:  2, crit:  2 },
    { name: '鋼の鎧',       type: 'armor', def:  6 },
    { name: '妖精の衣',     type: 'armor', def:  3, steal: 5 },
    { name: '賢者の法衣',   type: 'armor', def:  4, crit:  4 },
    { name: '闇の鎧',       type: 'armor', def:  7, crit:  3 },
    { name: '守護の鎧',     type: 'armor', def:  8, steal: 3 },
    { name: '神話の鎧',     type: 'armor', def: 10 },
    { name: '伝説の鎧',     type: 'armor', def:  9 },
    { name: '世界樹の衣',   type: 'armor', def: 10, steal: 4 },
    // 盾 (15)
    { name: '木の盾',       type: 'shield', def:  1 },
    { name: '革の盾',       type: 'shield', def:  2 },
    { name: '鉄の盾',       type: 'shield', def:  3 },
    { name: '騎士の盾',     type: 'shield', def:  4 },
    { name: '魔法の盾',     type: 'shield', def:  3, steal: 3 },
    { name: '炎の盾',       type: 'shield', def:  5 },
    { name: '竜鱗の盾',     type: 'shield', def:  6 },
    { name: '黄金の盾',     type: 'shield', def:  5, steal: 4 },
    { name: '聖なる盾',     type: 'shield', def:  4, steal: 5 },
    { name: '英雄の盾',     type: 'shield', def:  7 },
    { name: '魔王の盾',     type: 'shield', def:  8 },
    { name: '守護の盾',     type: 'shield', def:  7, steal: 3 },
    { name: '神話の盾',     type: 'shield', def:  9 },
    { name: '伝説の盾',     type: 'shield', def:  8, crit:  3 },
    { name: '世界樹の盾',   type: 'shield', def: 10 }
];


const nothings = [
    '静まり返った通路。足音だけが響く。',
    '壁に古い落書きがある。「引き返せ」と書かれていた。',
    '遠くで何かが動く気配がするが、姿は見えない。',
    '松明の炎が揺れる。風がどこかから吹いている。',
    '床に古い骨が転がっていた。先人の成れの果てか。',
    '暗い廊下に光が差し込んでくる。出口ではないようだ。',
    '罠の痕跡があったが、すでに作動済みだった。',
    '水が床を流れている。遠くでぽたぽたと水滴の音がする。',
    '苔むした石壁を手で触れる。冷たく、湿っている。',
    '誰かが残した炭の跡。まだ新しい。',
    '扉があった。開けると先に続く通路があるだけだった。',
    '壁に描かれた古い地図がある。もう読めない。',
    '天井から砂が降ってくる。崩落しそうだが、何とか通り抜けた。',
    '大きな蜘蛛の巣がある。主は留守のようだ。',
    '崩れかけた柱を避けながら進む。',
    '風が鳴く。何かの声のように聞こえた。',
    '宝箱があった。しかし中は空だった。',
    '小さな泉がある。飲んでいいか迷ったが、やめた。',
    '洞窟の壁に輝く鉱石が埋まっていた。取れそうにない。',
    '深い穴がある。石を落としたが、音がしなかった。',
    '何かの爪痕が壁に残っている。大きな魔物のものらしい。',
    'かすかに光る苔が床を彩る。不思議と心が落ち着く。',
    '矢が壁に刺さっていた。誰かが戦った跡だ。',
    '枯れた花束が床に置かれている。誰かが供えたのか。',
    '天井が高く、声が反響する。叫んでみたが誰も答えない。',
    '古い書物のページが散らばっていた。文字は読めない言語だ。',
    '足跡がある。しかし途中で消えていた。',
    '甲冑の破片が落ちていた。かつての戦士のものか。',
    '洞窟の奥から低い唸り声が聞こえた。近くはない。',
    '見慣れない紋章が刻まれた石板がある。解読できない。',
    '通路が二手に分かれている。直感で正しい方を選んだ。',
    '蝙蝠の群れが頭上を飛び去った。びっくりしたが害はない。',
    '壊れた武器が床に散乱している。激しい戦いがあったようだ。',
    '石の台座だけが残っていた。何かが置かれていたはずだが。',
    '暗くなってきた。先に光はあるだろうか。',
    '冷たい空気が通路を流れる。どこかに隙間があるのか。',
    '地面に古いコインが一枚落ちていた。拾っておいた。',
    '不思議な模様が床に描かれている。踏まないようにした。',
    '壁のひびから草が生えている。生命力を感じる。',
    '光の玉がふわふわ漂っていた。近づくと消えた。',
];


const returnNothings = [
    '来た道を戻る。足が重い。',
    '引き返しながら、次に挑む時の作戦を練る。',
    '足音が後ろからするような気がした。振り返ると何もない。',
    '壁に手をついて、慎重に歩く。',
    '帰り道は来た時より長く感じる。',
    'さっき戦った場所を通り過ぎる。血の跡が残っている。',
    '出口の方角はどっちだっただろうか。冷静に考える。',
    '後ろを振り返ったが、ついてくるものはない。今のところは。',
    '深呼吸をして、足を速める。',
    '廊下が暗くなってきた。松明が消えかけている。',
    '帰ることは弱さではない。生き延びることも戦略だ。',
    '「もう少しで出られる」と自分に言い聞かせる。',
    '足音が廊下に響く。返ってくるのは自分の足音だけだ。',
    '出口まであとどれくらいだろうか。',
    '途中で見つけた窓から外が見えた。あそこまで帰れば安全だ。',
    '疲れてきた。でも休んでいる暇はない。',
    '前を向いて走れ。振り返るな。',
    '壁に残ったひっかき傷が、かつてここで何かが起きたことを語る。',
    'ここを抜ければ、村が近い。',
    '出口の光が見えてきた。もうすぐだ。',
    '一歩一歩が、確実に安全に近づいている。',
    'このダンジョンの全容が、ようやく見えてきた気がする。',
    '遠くに光が見えた。出口かもしれない。',
    '何かが後ろをついてくる気がするが、振り向かないことにする。',
    '装備の重さを感じながら、それでも足を止めない。',
    '今回の冒険で学んだことを、頭の中で整理しながら歩く。',
    '静かだ。静かすぎる。それが逆に怖い。',
    '損傷した壁を触りながら、道を確認する。',
    '帰ったら、まず宿屋で休もう。そう思いながら歩き続ける。',
    '廃墟の中を歩くたびに、ここがかつて何だったのかを考える。',
    '無事に帰れたら、次はもっと深くへ行こう。',
    '何も手に入れられなくても、生きて帰ることは成功だ。',
    '足元に転がっていた金属片を避けながら、静かに進む。',
    '地面が少し不安定だ。早く安定した場所に戻りたい。',
    '出口のビーコンが見えてきた。',
    '今来た道を逆走しているはずなのに、少し違う景色に見える。',
    '誰かに帰りを待ってもらえるなら、もっと急いで帰れるのに。',
    'ゴールドを持ち帰れた。今回の冒険は無駄ではなかった。',
    '自分の息遣いだけが、この空間で唯一の生命の音だ。',
    '帰還後の強化計画を、すでに頭の中で描いている。',
    '崩れかけた天井を気にしながら、それでも進む。',
    '帰り道に落ちていた古い剣に、「諦めるな」と刻まれていた。',
    '生きて帰ることが、次の冒険への準備になる。',
    '少し休憩できる場所があった。が、長居は禁物だ。',
    '出口まであと少し。足に力を入れる。',
    '壊れた扉が音を立てた。風か、それとも……。',
    '無事に帰れば、また挑戦できる。それだけで十分だ。',
    '出口の光が見えた。もうすぐだ。',
    'この冒険が終わっても、世界はまだ続く。',
    'どんな結末でも、生き残ることが勝者だ。',
    '自分の足音を頼りに出口を目指す。',
];


const escapeNothings = [
    'ダンジョンが崩れ始めている！急がなくては！',
    '背後から轟音が迫ってくる。早く出口へ！',
    '警告の声が遠くから響いている。急いでゲートへ！',
    '天井から岩が降り注ぐ。長居は無用だ！',
    '大地が揺れている。崩落が始まったのか！',
    '床が波打っている。地震か、それとも魔法か！',
    '壁がひび割れていく。この空間そのものが瓦解しつつある！',
    'ボス撃破の余波で、周囲が崩れ始めている！',
    'この場所ごと崩れてしまう前に、脱出しなくては！',
    '亀裂が広がっている。飲み込まれる前に走れ！',
    '天井が落ちてきた！かわしながら走る！',
    '魔力が暴走している。構わず走る。',
    '光が歪んでいる。魔法空間が崩壊しようとしている。',
    '目の前の床が突然崩れた。別のルートを探せ！',
    'ここにいると生き埋めになってしまう。全速力で！',
    '魔王の力が消えた反動で、城全体が揺れている！',
    '爆発の衝撃波が追いかけてくる。走れ、走れ！',
    '崩れていく石壁をかわしながら突き進む。',
    '床の下で何かが唸っている。構わず駆け抜ける。',
    '通路が次々と崩れ落ちていく。逃げ場を失う前に！',
    '魔法の均衡が崩れている。今すぐ出なければ！',
    '出口の信号が弱まっている。急いで辿り着かなければ！',
    '存在が薄くなっていく感覚がある。早くここを出なければ！',
    '呪いの連鎖が始まっている。このエリア全体が消滅する！',
    'ボスの残留魔力が暴走している。',
    '壁の向こうで大爆発が起きた。時間がない！',
    '光が消えていく。暗闇に飲み込まれる前に脱出せよ！',
    '足元が崩れた！ギリギリで踏みとどまり、走り続ける。',
    '世界の法則が書き換えられようとしている。今すぐ逃げろ！',
    '出口まであと少しのはずだ。諦めるな！',
    '崩壊の波が背後から迫っている。全力で前へ！',
    '時間が狂い始めた。過去と未来が混じり合っている。',
    'ここにいることが危険な状態になっている。脱出が最優先だ。',
    '出口の光が見えた！もうひと踏ん張りだ！',
    'ボスを倒したのに、まだ死ぬわけにはいかない。走れ！',
    '崩れ落ちる天井をかわしながら、前へ前へ進む。',
    '空間が収縮している。出口が近づくにつれ、道が狭くなる。',
    '背後で大爆発が起きた。衝撃波に押されながらも走る。',
    '倒した魔王の呪いがまだ残っている。早く出ろ！',
    '「諦めるな」という思いを、強引に体に刻み込む。走れ！',
    '出口への道が崩れている。別のルートを瞬時に判断する。',
    '熱と圧力が増している。これ以上は危ない。',
    '出口の光が見える。あと少しだ！',
    '崩壊音が連続する。リズムに合わせるように走る。',
    '時間がない。考えるより先に身体が動く。',
    'ボスの残骸が爆発した。その衝撃で前に飛ばされる。好都合だ。',
    '崩壊していく世界の中で、それでも前に進む意思だけは消えない。',
    '生き残るという本能だけが、今の自分を動かしている。',
    '出口に飛び込んだ。あとは走るだけだ。',
    '炎の中を駆け抜けた。これが今日最後の試練だ。',
    '全てが崩れ去る中、ただ一つの出口だけが光り続けている。',
];
