// =============================================================
// data.js — JSONから動的ロード + スキル定義
// data/ フォルダ内の JSON ファイルを編集するだけで敵・ダンジョン等を追加できます
// =============================================================

// ---  グローバルデータ（loadGameData()で注入される）---
let dungeons         = [];
let enemiesBase      = [];
let foodDatabase     = [];
let shopItems        = [];
let craftRecipes     = [];
const craftMaterialTypes = ['薬草', '鉄くず', '魔石', '骨片', '布切れ'];

// --- データ初期化（data/*.js のグローバル変数から代入）---
function loadGameData() {
    enemiesBase  = typeof enemiesData  !== 'undefined' ? enemiesData  : [];
    dungeons     = typeof dungeonsData !== 'undefined' ? dungeonsData : [];
    foodDatabase = typeof foodData     !== 'undefined' ? foodData     : [];
    shopItems    = typeof shopData     !== 'undefined' ? shopData     : [];
    craftRecipes = typeof recipesData  !== 'undefined' ? recipesData  : [];
    console.log(`[data] ロード完了: 敵${enemiesBase.length}体 / ダンジョン${dungeons.length}件`);
}

// ダンジョン別の敵プールを返す
function getEnemiesForDungeon(dungeon) {
    if (!dungeon) return enemiesBase;
    return enemiesBase; // 全敵プール（スケーリングで難易度調整）
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
    {
        id: 'flameBurst',
        name: '炎撃',
        icon: '🔥',
        element: '炎',
        atbMultiplier: 1.1,
        shopCost: 120,
        desc: '炎属性の一撃。敵の弱点なら威力+50%。',
        levelThresholds: [0, 15, 40, 80, 120],
        dmgMults: [1.4, 1.7, 2.1, 2.6, 3.2],
    },
    {
        id: 'iceEdge',
        name: '氷刃',
        icon: '❄',
        element: '氷',
        atbMultiplier: 0.85,
        shopCost: 120,
        desc: '氷属性で敵を斬る。命中時に敵SPD-20%（1ターン）。',
        levelThresholds: [0, 15, 40, 80, 120],
        dmgMults: [1.2, 1.4, 1.7, 2.1, 2.6],
    },
    {
        id: 'thunderClap',
        name: '雷霆',
        icon: '⚡',
        element: '雷',
        atbMultiplier: 1.3,
        shopCost: 150,
        desc: 'スタック全体に雷撃（威力は分散）。',
        levelThresholds: [0, 20, 50, 90, 140],
        dmgMults: [0.9, 1.1, 1.4, 1.7, 2.2],
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
// =============================================================
// 道具屋アイテム
// =============================================================
// =============================================================
// 食料データベース
// =============================================================
const itemsDatabase = [
    // 武器 (30)
    { name: '木の棒',             type: 'weapon', atk:  0, weight: 1 },
    { name: '旅人の短剣',         type: 'weapon', atk:  1, weight: 1 },
    { name: '銅の剣',             type: 'weapon', atk:  2, weight: 2 },
    { name: '鉄の剣',             type: 'weapon', atk:  3, crit:  2, weight: 2 },
    { name: '騎士の剣',           type: 'weapon', atk:  4, weight: 3 },
    { name: '炎の剣',   element: '炎', type: 'weapon', atk:  5, crit:  3, weight: 3 },
    { name: '魔法の剣', element: '魔', type: 'weapon', atk:  6, weight: 2 },
    { name: '大剣',               type: 'weapon', atk:  7, weight: 5 },
    { name: '竜殺しの剣', element: '斬', type: 'weapon', atk:  8, crit:  4, weight: 4 },
    { name: '聖なる剣', element: '光', type: 'weapon', atk:  9, steal: 4, weight: 3 },
    { name: '英雄の槍', element: '光', type: 'weapon', atk: 10, weight: 3 },
    { name: '魔王の剣',           type: 'weapon', atk: 11, crit:  5, weight: 4 },
    { name: '伝説の剣',           type: 'weapon', atk: 12, weight: 4 },
    { name: '神剣・天威', element: '光', type: 'weapon', atk: 13, crit:  6, weight: 5 },
    { name: '究極剣・ゼロ', element: '斬', type: 'weapon', atk: 14, weight: 5 },
    { name: '短剣・毒刃',         type: 'weapon', atk:  1, steal: 5, weight: 1 },
    { name: '戦士の斧',           type: 'weapon', atk:  5, weight: 4 },
    { name: '魔法の杖', element: '魔', type: 'weapon', atk:  3, crit:  4, weight: 1 },
    { name: '聖なる槍', element: '光', type: 'weapon', atk:  7, steal: 5, weight: 3 },
    { name: '黒の鎌',   element: '闇', type: 'weapon', atk:  6, steal: 6, weight: 3 },
    { name: '鉄の弓',             type: 'weapon', atk:  4, crit:  3, rangeWeapon: true, weight: 2 },
    { name: '賢者の杖',           type: 'weapon', atk:  5, crit:  5, weight: 1 },
    { name: '竜骨の槍', element: '斬', type: 'weapon', atk:  9, weight: 3 },
    { name: '暗殺者の短剣', element: '刺', type: 'weapon', atk:  2, steal: 8, weight: 1 },
    { name: '炎の弓',   element: '炎', type: 'weapon', atk:  8, crit:  4, rangeWeapon: true, weight: 2 },
    { name: 'エルフの弓矢',       type: 'weapon', atk:  6, crit:  6, rangeWeapon: true, weight: 2 },
    { name: '黄金の剣',           type: 'weapon', atk: 10, steal: 6, weight: 4 },
    { name: '破滅の大鎌', element: '闇', type: 'weapon', atk: 12, steal: 7, weight: 5 },
    { name: '神話の弓',           type: 'weapon', atk: 11, crit:  7, rangeWeapon: true, weight: 2 },
    { name: '世界樹の枝',         type: 'weapon', atk: 16, steal: 8, weight: 3 },
    // 兜 (20)
    { name: '皮の帽子',   type: 'helm', def:  1, weight: 1 },
    { name: '鉄兜',       type: 'helm', def:  2, weight: 2 },
    { name: '騎士の兜',   type: 'helm', def:  3, weight: 3 },
    { name: '魔法の帽子', type: 'helm', def:  2, crit:  3, weight: 1 },
    { name: '炎の兜',   element: '炎', type: 'helm', def:  4, weight: 3 },
    { name: '竜鱗の兜',   type: 'helm', def:  5, weight: 4 },
    { name: '黄金の冠',   type: 'helm', def:  4, steal: 4, weight: 2 },
    { name: '聖者の帽子', type: 'helm', def:  3, steal: 3, weight: 1 },
    { name: '魔王の兜',   type: 'helm', def:  6, weight: 4 },
    { name: '英雄の兜',   type: 'helm', def:  7, weight: 4 },
    { name: '革の帽子',   type: 'helm', def:  1, crit:  2, weight: 1 },
    { name: '賢者の冠',   type: 'helm', def:  3, crit:  4, weight: 1 },
    { name: '鋼の兜',     type: 'helm', def:  5, weight: 3 },
    { name: '妖精の帽子', type: 'helm', def:  2, steal: 5, weight: 1 },
    { name: '魔法の兜',   type: 'helm', def:  6, crit:  3, weight: 2 },
    { name: '戦士の兜',   type: 'helm', def:  4, weight: 3 },
    { name: '神話の冠',   type: 'helm', def:  8, weight: 5 },
    { name: '守護の兜',   type: 'helm', def:  7, steal: 3, weight: 4 },
    { name: '暗黒の兜',   type: 'helm', def:  8, crit:  4, weight: 4 },
    { name: '伝説の兜',   type: 'helm', def:  9, weight: 5 },
    // 鎧 (20)
    { name: '皮の鎧',       type: 'armor', def:  2, weight: 1 },
    { name: '鎖帷子',       type: 'armor', def:  3, weight: 2 },
    { name: '鉄の鎧',       type: 'armor', def:  4, weight: 3 },
    { name: '騎士の鎧',     type: 'armor', def:  5, weight: 4 },
    { name: '魔法の鎧', element: '魔', type: 'armor', def:  4, crit:  3, weight: 2 },
    { name: '炎の鎧',   element: '炎', type: 'armor', def:  6, weight: 4 },
    { name: '竜鱗の鎧',     type: 'armor', def:  7, weight: 5 },
    { name: '黄金の鎧',     type: 'armor', def:  6, steal: 4, weight: 3 },
    { name: '聖なる鎧', element: '光', type: 'armor', def:  5, steal: 5, weight: 3 },
    { name: '英雄の鎧',     type: 'armor', def:  8, weight: 5 },
    { name: '魔王の鎧',     type: 'armor', def:  9, weight: 5 },
    { name: '革の胸当て',   type: 'armor', def:  2, crit:  2, weight: 1 },
    { name: '鋼の鎧',       type: 'armor', def:  6, weight: 4 },
    { name: '妖精の衣',     type: 'armor', def:  3, steal: 5, weight: 1 },
    { name: '賢者の法衣',   type: 'armor', def:  4, crit:  4, weight: 2 },
    { name: '闇の鎧',       type: 'armor', def:  7, crit:  3, weight: 4 },
    { name: '守護の鎧',     type: 'armor', def:  8, steal: 3, weight: 5 },
    { name: '神話の鎧',     type: 'armor', def: 10, weight: 6 },
    { name: '伝説の鎧',     type: 'armor', def:  9, weight: 5 },
    { name: '世界樹の衣',   type: 'armor', def: 10, steal: 4, weight: 2 },
    // 盾 (15)
    { name: '木の盾',       type: 'shield', def:  1, weight: 1 },
    { name: '革の盾',       type: 'shield', def:  2, weight: 1 },
    { name: '鉄の盾',       type: 'shield', def:  3, weight: 2 },
    { name: '騎士の盾',     type: 'shield', def:  4, weight: 3 },
    { name: '魔法の盾', element: '魔', type: 'shield', def:  3, steal: 3, weight: 1 },
    { name: '炎の盾',   element: '炎', type: 'shield', def:  5, weight: 3 },
    { name: '竜鱗の盾',     type: 'shield', def:  6, weight: 4 },
    { name: '黄金の盾',     type: 'shield', def:  5, steal: 4, weight: 2 },
    { name: '聖なる盾', element: '光', type: 'shield', def:  4, steal: 5, weight: 2 },
    { name: '英雄の盾',     type: 'shield', def:  7, weight: 4 },
    { name: '魔王の盾',     type: 'shield', def:  8, weight: 5 },
    { name: '守護の盾',     type: 'shield', def:  7, steal: 3, weight: 4 },
    { name: '神話の盾',     type: 'shield', def:  9, weight: 5 },
    { name: '伝説の盾',     type: 'shield', def:  8, crit:  3, weight: 4 },
    { name: '世界樹の盾',   type: 'shield', def: 10, weight: 5 }
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

// =============================================================
// メダルカタログ（AP制着脱可能パッシブ強化パーツ）
// =============================================================
const medalCatalog = [
    { id: 'medal_atk',    name: '武神の章',   apCost: 4, meritCost: 20, desc: 'ATK +25%',      effects: { atkMult: 1.25 } },
    { id: 'medal_def',    name: '鉄城の章',   apCost: 2, meritCost: 10, desc: 'DEF +4',         effects: { defBonus: 4 } },
    { id: 'medal_hp',     name: '鋼鉄の章',   apCost: 3, meritCost: 15, desc: '最大HP +20%',    effects: { hpMult: 1.2 } },
    { id: 'medal_sp',     name: '精霊の章',   apCost: 2, meritCost: 12, desc: '最大SP +30',      effects: { spBonus: 30 } },
    { id: 'medal_spd',    name: '迅風の章',   apCost: 4, meritCost: 25, desc: 'SPD +6',          effects: { spdBonus: 6 } },
    { id: 'medal_spirit', name: '霊魂の章',   apCost: 3, meritCost: 15, desc: '精神 +6',         effects: { spiritBonus: 6 } },
    { id: 'medal_crit',   name: '鋭刃の章',   apCost: 4, meritCost: 20, desc: 'クリ率 +12%',    effects: { critBonus: 12 } },
    { id: 'medal_exp',    name: '賢者の章',   apCost: 3, meritCost: 18, desc: 'EXP +40%',        effects: { expMult: 1.4 } },
    { id: 'medal_drain',  name: '吸命の章',   apCost: 5, meritCost: 30, desc: '吸血率 +8%',      effects: { drainBonus: 8 } },
    { id: 'medal_thirst', name: '砂漠の章',   apCost: 2, meritCost: 8,  desc: '渇き消費 -40%',   effects: { thirstReduce: 0.6 } },
    { id: 'medal_hunger', name: '飽食の章',   apCost: 2, meritCost: 8,  desc: '空腹消費 -40%',   effects: { hungerReduce: 0.6 } },
    { id: 'medal_range',  name: '弓神の章',   apCost: 4, meritCost: 22, desc: '遠隔ATK +30%',    effects: { rangeMult: 1.3 } },
];

// 装備中メダルのエフェクトを合算して返す
function getMedalEffects() {
    const result = {};
    for (const id of equippedMedals) {
        const m = medalCatalog.find(x => x.id === id);
        if (!m) continue;
        for (const [k, v] of Object.entries(m.effects)) {
            if (k.endsWith('Mult') || k.endsWith('Reduce')) {
                result[k] = (result[k] || 1) * v;
            } else {
                result[k] = (result[k] || 0) + v;
            }
        }
    }
    return result;
}

// 現在使用中のAP合計
function getMedalApUsed() {
    return equippedMedals.reduce((sum, id) => {
        const m = medalCatalog.find(x => x.id === id);
        return sum + (m ? m.apCost : 0);
    }, 0);
}

// ============================================================
// DNA突然変異カタログ
// req: { type: '種族名', count: 必要討伐数 }
// effects: getMedalEffectsと同じキー体系 + hpMult, hpRegen, skillSpCost
// ============================================================
const mutationCatalog = [
    { id: 'mut_slime',   name: '粘液装甲',   icon: '🟢', req: { type: '粘体族',  count: 30 }, desc: 'DEF+15%',             effects: { defBonus: 0.15 } },
    { id: 'mut_goblin',  name: '小鬼の俊足', icon: '🟡', req: { type: '小鬼族',  count: 25 }, desc: 'SPD+15%',             effects: { spdBonus: 0.15 } },
    { id: 'mut_undead',  name: '不死の意志', icon: '💀', req: { type: '不死族',  count: 20 }, desc: '最大HP+25%',           effects: { hpMult: 1.25 } },
    { id: 'mut_beast',   name: '野獣の牙',   icon: '🐺', req: { type: '獣族',    count: 25 }, desc: 'ATK+15%',             effects: { atkMult: 1.15 } },
    { id: 'mut_dragon',  name: '竜鱗化',     icon: '🐉', req: { type: '竜族',    count: 5  }, desc: 'ATK+20% DEF+20%',    effects: { atkMult: 1.20, defBonus: 0.20 } },
    { id: 'mut_demon',   name: '悪魔の知恵', icon: '😈', req: { type: '悪魔族',  count: 15 }, desc: 'スキルSP消費-30%',     effects: { skillSpCost: 0.70 } },
    { id: 'mut_insect',  name: '虫の外骨格', icon: '🦂', req: { type: '虫族',    count: 30 }, desc: 'DEF+20%',             effects: { defBonus: 0.20 } },
    { id: 'mut_spirit',  name: '霊体融合',   icon: '👻', req: { type: '邪霊族',  count: 20 }, desc: '精霊力+20',           effects: { spiritBonus: 20 } },
    { id: 'mut_machine', name: '機械強化',   icon: '⚙️', req: { type: '機械族',  count: 20 }, desc: 'ATK+10% DEF+10%',    effects: { atkMult: 1.10, defBonus: 0.10 } },
    { id: 'mut_plant',   name: '植物回生',   icon: '🌿', req: { type: '植物族',  count: 25 }, desc: '歩行ごとHP+2回復',     effects: { hpRegen: 2 } },
    { id: 'mut_ogre',    name: '鬼力覚醒',   icon: '👹', req: { type: '鬼族',    count: 25 }, desc: 'ATK+20%',             effects: { atkMult: 1.20 } },
    { id: 'mut_reptile', name: '爬虫の皮',   icon: '🦎', req: { type: '爬虫族',  count: 30 }, desc: 'DEF+10% 盗み率+10%',  effects: { defBonus: 0.10, drainBonus: 0.10 } },
    { id: 'mut_beastman',name: '獣人の血',   icon: '🐗', req: { type: '獣人族',  count: 20 }, desc: 'ATK+10% SPD+10%',    effects: { atkMult: 1.10, spdBonus: 0.10 } },
    { id: 'mut_bird',    name: '風の翼',     icon: '🦅', req: { type: '鳥族',    count: 25 }, desc: 'SPD+25%',             effects: { spdBonus: 0.25 } },
    { id: 'mut_stone',   name: '岩の肉体',   icon: '🪨', req: { type: '石族',    count: 15 }, desc: 'DEF+30%',             effects: { defBonus: 0.30 } },
];

// 変異効果を合算して返す
function getMutationEffects() {
    const me = { atkMult:1, defBonus:0, spdBonus:0, drainBonus:0, critBonus:0, spiritBonus:0, hpMult:1, hpRegen:0, skillSpCost:1 };
    mutations.forEach(id => {
        const m = mutationCatalog.find(x => x.id === id);
        if (!m) return;
        if (m.effects.atkMult)     me.atkMult     *= m.effects.atkMult;
        if (m.effects.defBonus)    me.defBonus    += m.effects.defBonus;
        if (m.effects.spdBonus)    me.spdBonus    += m.effects.spdBonus;
        if (m.effects.drainBonus)  me.drainBonus  += m.effects.drainBonus;
        if (m.effects.critBonus)   me.critBonus   += m.effects.critBonus;
        if (m.effects.spiritBonus) me.spiritBonus += m.effects.spiritBonus;
        if (m.effects.hpMult)      me.hpMult      *= m.effects.hpMult;
        if (m.effects.hpRegen)     me.hpRegen     += m.effects.hpRegen;
        if (m.effects.skillSpCost) me.skillSpCost *= m.effects.skillSpCost;
    });
    return me;
}

// ============================================================
// 拠点トラップカタログ
// ============================================================
const trapCatalog = [
    // ── Tier 1: 基本トラップ ─────────────────────────────────────────────
    { id: 'trap_spike',   name: 'スパイクトラップ', icon: '⚔️', cost: 15, dmgBase: 35, uses: 2, ignoresDef: false, desc: '物理35ダメ×2回' },
    { id: 'trap_magic',   name: '魔法陣トラップ',   icon: '✨', cost: 25, dmgBase: 60, uses: 1, ignoresDef: true,  desc: '魔法60ダメ×1回（防御無視）' },
    { id: 'trap_poison',  name: '毒霧トラップ',     icon: '☠️', cost: 18, dmgBase: 20, uses: 3, ignoresDef: false, desc: '毒20ダメ×3回' },
    { id: 'trap_needle',  name: '針山トラップ',     icon: '🪡', cost: 10, dmgBase: 15, uses: 4, ignoresDef: false, desc: '15ダメ×4回（使い捨て多め）' },
    // ── Tier 2: 属性トラップ ─────────────────────────────────────────────
    { id: 'trap_fire',    name: '炎の壁トラップ',   icon: '🔥', cost: 30, dmgBase: 50, uses: 2, ignoresDef: false, desc: '炎50ダメ×2回' },
    { id: 'trap_ice',     name: '氷結トラップ',     icon: '❄️', cost: 35, dmgBase: 65, uses: 1, ignoresDef: true,  desc: '魔法65ダメ×1回（防御無視）' },
    { id: 'trap_thunder', name: '雷撃トラップ',     icon: '⚡', cost: 32, dmgBase: 45, uses: 2, ignoresDef: true,  desc: '雷45ダメ×2回（防御無視）' },
    { id: 'trap_wind',    name: '風刃トラップ',     icon: '🌀', cost: 22, dmgBase: 35, uses: 3, ignoresDef: false, desc: '風35ダメ×3回' },
    // ── Tier 3: 重火力トラップ ────────────────────────────────────────────
    { id: 'trap_bomb',    name: '爆裂トラップ',     icon: '💣', cost: 45, dmgBase: 90, uses: 1, ignoresDef: false, desc: '物理90ダメ×1回' },
    { id: 'trap_grav',    name: '重力トラップ',     icon: '⬛', cost: 38, dmgBase: 40, uses: 3, ignoresDef: true,  desc: '40ダメ×3回（防御無視）' },
    { id: 'trap_chain',   name: '鎖爆発トラップ',   icon: '🔗', cost: 50, dmgBase: 30, uses: 5, ignoresDef: false, desc: '物理30ダメ×5回' },
    { id: 'trap_holy',    name: '光の槍トラップ',   icon: '🌟', cost: 60, dmgBase: 100,uses: 1, ignoresDef: true,  desc: '光100ダメ×1回（防御無視）' },
    // ── Tier 4: 毒・呪いトラップ ──────────────────────────────────────────
    { id: 'trap_venom',   name: '猛毒針トラップ',   icon: '🧪', cost: 28, dmgBase: 18, uses: 5, ignoresDef: false, desc: '毒18ダメ×5回' },
    { id: 'trap_curse',   name: '呪いの陣トラップ', icon: '🔮', cost: 42, dmgBase: 30, uses: 4, ignoresDef: true,  desc: '呪30ダメ×4回（防御無視）' },
    { id: 'trap_dark',    name: '暗黒の鎖トラップ', icon: '🌑', cost: 55, dmgBase: 50, uses: 3, ignoresDef: true,  desc: '闇50ダメ×3回（防御無視）' },
    { id: 'trap_spider',  name: '蜘蛛の巣トラップ', icon: '🕷️', cost: 20, dmgBase: 12, uses: 6, ignoresDef: false, desc: '物理12ダメ×6回' },
    // ── Tier 5: 最高位トラップ ────────────────────────────────────────────
    { id: 'trap_iron',    name: '鉄球トラップ',     icon: '⚙️', cost: 48, dmgBase: 75, uses: 2, ignoresDef: false, desc: '物理75ダメ×2回' },
    { id: 'trap_earth',   name: '大地の怒りトラップ',icon:'🌋', cost: 52, dmgBase: 55, uses: 3, ignoresDef: false, desc: '地55ダメ×3回' },
    { id: 'trap_holy2',   name: '聖水の罠',         icon: '💧', cost: 40, dmgBase: 55, uses: 2, ignoresDef: true,  desc: '聖55ダメ×2回（防御無視）' },
    { id: 'trap_dragon',  name: '龍炎の罠',         icon: '🐉', cost: 80, dmgBase: 130,uses: 1, ignoresDef: true,  desc: '龍炎130ダメ×1回（防御無視）' },
];

// =============================================================
// 称号（二つ名）カタログ
// =============================================================
const titleCatalog = [
    {
        id: 'nameless', name: '名もなき勇者', icon: '⚔',
        desc: '始まりの称号。特別な効果はない。',
        unlockHint: '最初から所持',
        unlockFn: () => true,
        effects: {}
    },
    {
        id: 'berserker', name: '狂戦士', icon: '🔥',
        desc: '攻撃力 ×1.5 / 防御力 ×0.7。火力で押し切る荒くれ者。',
        unlockHint: '50体討伐',
        unlockFn: () => (typeof stats !== 'undefined') && stats.kills >= 50,
        effects: { atkMult: 1.5, defMult: 0.7 }
    },
    {
        id: 'guardian', name: '鉄壁の守護者', icon: '🛡',
        desc: '防御力 ×1.5 / 攻撃力 ×0.75。鉄の意志で仲間を守る。',
        unlockHint: '100体討伐',
        unlockFn: () => (typeof stats !== 'undefined') && stats.kills >= 100,
        effects: { defMult: 1.5, atkMult: 0.75 }
    },
    {
        id: 'shadow', name: '影の暗殺者', icon: '🗡',
        desc: '会心+25% / 素早さ+8 / 防御 ×0.6。先手を取って一気に仕留める。',
        unlockHint: 'クリティカル20回達成',
        unlockFn: () => (typeof titleStats !== 'undefined') && titleStats.critHits >= 20,
        effects: { critBonus: 25, spdBonus: 8, defMult: 0.6 }
    },
    {
        id: 'greedy', name: '貪欲なる者', icon: '💰',
        desc: '奪取率+15% / スキルEXP +20%。あらゆるものを掻き集める。',
        unlockHint: '敵から15回奪取',
        unlockFn: () => (typeof titleStats !== 'undefined') && titleStats.stealCount >= 15,
        effects: { stealBonus: 15, expMult: 1.2 }
    },
    {
        id: 'undying', name: '不死身の戦士', icon: '💀',
        desc: '防御 ×1.3 / 精神+15 / 攻撃 ×0.8。何度倒れても立ち上がる不屈の魂。',
        unlockHint: '5回力尽きる',
        unlockFn: () => (typeof stats !== 'undefined') && stats.deaths >= 5,
        effects: { defMult: 1.3, spiritBonus: 15, atkMult: 0.8 }
    },
    {
        id: 'mage', name: '魔道の申し子', icon: '✨',
        desc: '魔法 ×1.5 / 精神+10 / 物理攻撃 ×0.7。魔力と共に生きる者。',
        unlockHint: 'スキル30回使用',
        unlockFn: () => (typeof titleStats !== 'undefined') && titleStats.skillUseCount >= 30,
        effects: { magicMult: 1.5, spiritBonus: 10, atkMult: 0.7 }
    },
    {
        id: 'challenger', name: '命知らずの挑戦者', icon: '⚡',
        desc: '攻撃 ×1.8 / 防御 ×0.4 / 素早さ+10。リスクを恐れぬ真の勇者。',
        unlockHint: '3回力尽き、かつ30体討伐',
        unlockFn: () => (typeof stats !== 'undefined') && stats.deaths >= 3 && stats.kills >= 30,
        effects: { atkMult: 1.8, defMult: 0.4, spdBonus: 10 }
    },
    {
        id: 'chosen', name: '天運の使者', icon: '⭐',
        desc: '会心+15% / EXP +20%。運命に選ばれた者。',
        unlockHint: '200体討伐',
        unlockFn: () => (typeof stats !== 'undefined') && stats.kills >= 200,
        effects: { critBonus: 15, expMult: 1.2 }
    },
    {
        id: 'explorer', name: '果ての探索者', icon: '🗺',
        desc: '素早さ ×1.3 / 奪取+10%。誰も踏み入れぬ地を目指す者。',
        unlockHint: '300歩探索',
        unlockFn: () => (typeof titleStats !== 'undefined') && titleStats.stepsTotal >= 300,
        effects: { spdMult: 1.3, stealBonus: 10 }
    },
];

// =============================================================
// 星座（ダンジョン修飾）カタログ
// =============================================================
const constellationCatalog = [
    { id: 'none',     name: 'なし',   icon: '⬜', desc: '通常の難易度',                                difficulty: 0, effects: {} },
    { id: 'aries',    name: '牡羊座', icon: '♈', desc: '敵ATK +30% / 獲得G +60%',                   difficulty: 1, effects: { enemyAtkMult: 1.3, goldMult: 1.6 } },
    { id: 'gemini',   name: '双子座', icon: '♊', desc: '戦闘で追加の敵が出現 / EXP +50%',             difficulty: 1, effects: { extraEnemy: true, expMult: 1.5 } },
    { id: 'capricorn',name: '山羊座', icon: '♑', desc: 'SP回復 ×0.5 / ドロップ率 +70%',             difficulty: 2, effects: { spRegenMult: 0.5, dropMult: 1.7 } },
    { id: 'scorpio',  name: '蠍座',   icon: '♏', desc: '毎ターン最大HPの5%毒ダメージ / EXP +80%',   difficulty: 2, effects: { poisonDmgPct: 0.05, expMult: 1.8 } },
    { id: 'leo',      name: '獅子座', icon: '♌', desc: '敵HP +50% / 敵ATK +20% / 全報酬 +60%',      difficulty: 2, effects: { enemyHpMult: 1.5, enemyAtkMult: 1.2, expMult: 1.6, goldMult: 1.6 } },
    { id: 'death',    name: '死神座', icon: '☠', desc: '敵ATK +60% / 敵HP +60% / 全報酬 ×2',        difficulty: 3, effects: { enemyAtkMult: 1.6, enemyHpMult: 1.6, expMult: 2.0, goldMult: 2.0 } },
];

// =============================================================
// 属性システム定義
// =============================================================
const ELEMENTS = {
    '炎': { color: '#ff6644', icon: '🔥', beats: '植', weak: '水' },
    '氷': { color: '#44ccff', icon: '❄', beats: '竜', weak: '炎' },
    '雷': { color: '#ffee44', icon: '⚡', beats: '水', weak: '土' },
    '風': { color: '#88ff88', icon: '🌀', beats: '土', weak: '雷' },
    '光': { color: '#ffffaa', icon: '✨', beats: '闇', weak: '闇' },
    '闇': { color: '#cc44ff', icon: '🌑', beats: '光', weak: '光' },
    '斬': { color: '#ff8844', icon: '⚔',  beats: '獣', weak: '盾' },
    '刺': { color: '#aaffaa', icon: '🗡',  beats: '魔', weak: '鎧' },
    '魔': { color: '#aa88ff', icon: '🔮', beats: '物', weak: '光' },
};

function getElementBonus(attackElement, defenderWeakElement) {
    if (!attackElement || !defenderWeakElement) return 1.0;
    if (attackElement === defenderWeakElement) return 1.5;
    return 1.0;
}

// =============================================================
// ジョブ（職業）カタログ
// =============================================================
// 職業の熟練度レベル閾値（この戦闘数で次のLvへ）
const JOB_LEVEL_THRESHOLDS = [20, 50, 100, 200, 350];

function getJobLevel(jobId) {
    if (typeof jobKillCounts === 'undefined') return 0;
    const kills = jobKillCounts[jobId] || 0;
    let lv = 0;
    for (const t of JOB_LEVEL_THRESHOLDS) { if (kills >= t) lv++; else break; }
    return lv; // 0〜5
}

function getJobLevelBonus(baseEffects, lv) {
    if (lv === 0) return baseEffects;
    const bonus = {};
    const scale = 1 + lv * 0.08; // Lv1:+8%, Lv5:+40%
    for (const [k, v] of Object.entries(baseEffects)) {
        if (typeof v !== 'number') { bonus[k] = v; continue; }
        if (k.endsWith('Mult')) {
            // >1 は強化方向に、<1 は弱体方向を緩和
            bonus[k] = v >= 1 ? v + (v - 1) * (lv * 0.1)
                              : Math.min(1, v + (1 - v) * (lv * 0.05));
        } else if (k.endsWith('Bonus') || k === 'spRegen' || k === 'spiritBonus') {
            bonus[k] = Math.round(v * scale);
        } else {
            bonus[k] = v;
        }
    }
    return bonus;
}

const jobCatalog = [
    // ── 基本 ──────────────────────────────────────────────────────────────
    { id: 'none',       name: '無職',       icon: '👤', changeCost:  0, desc: '特別な恩恵なし。すべての職業の基礎。',                                                   effects: {} },
    { id: 'warrior',    name: '戦士',       icon: '⚔️', changeCost: 50, desc: 'ATK+20% / DEF+10%。重い装備を纏い前線で戦う。',                                          effects: { atkMult:1.2, defMult:1.1 } },
    { id: 'mage',       name: '魔道士',     icon: '🔮', changeCost: 50, desc: '魔法ATK×2 / 精神+20 / 物理-30%。魔力に特化した術師。',                                   effects: { magicMult:2.0, spiritBonus:20, atkMult:0.7 } },
    { id: 'rogue',      name: '盗賊',       icon: '🗡️', changeCost: 50, desc: '会心+20% / 素早さ+15 / 奪取+10%。素早い一撃で仕留める。',                               effects: { critBonus:20, spdBonus:15, stealBonus:10 } },
    { id: 'cleric',     name: '聖者',       icon: '✦',  changeCost: 60, desc: '精神+30 / DEF+15% / SPリジェネ+3。神の加護を受けし者。',                                 effects: { spiritBonus:30, defMult:1.15, spRegen:3 } },
    { id: 'monk',       name: '武道家',     icon: '🥋', changeCost: 60, desc: '会心+25% / ATK+15% / DEF-20%。素手に近い軽装で最大火力を発揮。',                         effects: { critBonus:25, atkMult:1.15, defMult:0.8 } },
    { id: 'ranger',     name: '弓使い',     icon: '🏹', changeCost: 50, desc: '遠隔ATK×1.5 / 素早さ+10 / 会心+10%。遠距離から精確に狙う。',                            effects: { rangeMult:1.5, spdBonus:10, critBonus:10 } },
    { id: 'alchemist',  name: '錬金術師',   icon: '⚗️', changeCost: 70, desc: '素材ドロップ+50% / G収入+30% / ATK-10%。知識で富を生み出す賢者。',                       effects: { matDropMult:1.5, goldMult:1.3, atkMult:0.9 } },
    // ── 剣・槍・格闘系 ──────────────────────────────────────────────────
    { id: 'swordsman',  name: '剣士',       icon: '🗡️', changeCost: 55, desc: 'ATK+30% / 素早さ+5。磨かれた剣技で敵を圧倒する。',                                       effects: { atkMult:1.3, spdBonus:5 } },
    { id: 'knight',     name: '騎士',       icon: '🛡️', changeCost: 55, desc: 'DEF+30% / HP+20%。鉄壁の守りで味方を護る騎士。',                                         effects: { defMult:1.3, hpMult:1.2 } },
    { id: 'lancer',     name: '槍術士',     icon: '🔱', changeCost: 60, desc: 'ATK+25% / 会心+15%。長槍の間合いを活かした戦士。',                                       effects: { atkMult:1.25, critBonus:15 } },
    { id: 'darkKnight', name: '暗黒騎士',   icon: '🖤', changeCost: 80, desc: 'ATK+40% / DEF-20% / 奪取+8%。闇の力で敵を蹂躙する。',                                    effects: { atkMult:1.4, defMult:0.8, stealBonus:8 } },
    { id: 'paladin',    name: 'パラディン', icon: '🌟', changeCost: 90, desc: 'DEF+25% / SPリジェネ+2 / ATK-10%。聖なる力で守護する者。',                               effects: { defMult:1.25, spRegen:2, atkMult:0.9 } },
    { id: 'berserker',  name: '狂戦士',     icon: '😤', changeCost: 70, desc: 'ATK+60% / DEF-30%。怒りに身を委ねた破壊の化身。',                                         effects: { atkMult:1.6, defMult:0.7 } },
    { id: 'samurai',    name: '侍',         icon: '⛩️', changeCost: 80, desc: 'ATK+35% / 会心+20% / DEF-15%。武士道を体現する剣豪。',                                   effects: { atkMult:1.35, critBonus:20, defMult:0.85 } },
    // ── 魔法・精神系 ─────────────────────────────────────────────────────
    { id: 'sage',       name: '賢者',       icon: '📖', changeCost: 90, desc: '魔法×2.5 / 精神+30 / ATK-50%。奥義を極めた魔法の使い手。',                              effects: { magicMult:2.5, spiritBonus:30, atkMult:0.5 } },
    { id: 'shaman',     name: '呪術師',     icon: '🔯', changeCost: 65, desc: '魔法×1.5 / 会心+10% / 精神+15。精霊の力を借りる術者。',                                  effects: { magicMult:1.5, critBonus:10, spiritBonus:15 } },
    { id: 'druid',      name: 'ドルイド',   icon: '🌿', changeCost: 65, desc: 'SPリジェネ+4 / DEF+15% / ATK-20%。自然の摂理と調和する者。',                            effects: { spRegen:4, defMult:1.15, atkMult:0.8 } },
    { id: 'summoner',   name: '召喚士',     icon: '🌀', changeCost: 75, desc: 'EXP+40% / G+20%。召喚獣を使役し戦場を制す。',                                            effects: { expMult:1.4, goldMult:1.2 } },
    { id: 'necromancer',name: '死霊術師',   icon: '💀', changeCost: 85, desc: 'EXP+60% / 魔法×1.8 / HP-20%。死者を操る禁忌の術師。',                                   effects: { expMult:1.6, magicMult:1.8, hpMult:0.8 } },
    { id: 'archmage',   name: '大魔導士',   icon: '🌌', changeCost:120, desc: '魔法×3.0 / 精神+50 / ATK×0.3。魔法の頂点に君臨する者。',                               effects: { magicMult:3.0, spiritBonus:50, atkMult:0.3 } },
    { id: 'spellblade', name: '魔剣士',     icon: '⚡', changeCost: 75, desc: 'ATK+20% / 魔法×1.3。剣と魔法を融合させた複合戦士。',                                     effects: { atkMult:1.2, magicMult:1.3 } },
    // ── 素早さ・奇襲系 ──────────────────────────────────────────────────
    { id: 'ninja',      name: '忍者',       icon: '🥷', changeCost: 75, desc: '素早さ+25 / 会心+30% / ATK-10%。影に潜む暗殺者。',                                       effects: { spdBonus:25, critBonus:30, atkMult:0.9 } },
    { id: 'dancer',     name: '踊り子',     icon: '💃', changeCost: 60, desc: '素早さ+30 / 精神+20 / DEF-10%。舞いで敵を翻弄する。',                                    effects: { spdBonus:30, spiritBonus:20, defMult:0.9 } },
    { id: 'pirate',     name: '海賊',       icon: '🏴‍☠️', changeCost: 65, desc: '奪取+40% / G+40% / 会心+10%。荒くれ者の自由な生き方。',                                effects: { stealBonus:40, goldMult:1.4, critBonus:10 } },
    { id: 'shadow',     name: '影使い',     icon: '🌑', changeCost: 70, desc: '奪取+30% / 会心+15% / 遠隔×1.2。闇に潜む影の支配者。',                                  effects: { stealBonus:30, critBonus:15, rangeMult:1.2 } },
    // ── 支援・経済系 ─────────────────────────────────────────────────────
    { id: 'bard',       name: '吟遊詩人',   icon: '🎶', changeCost: 60, desc: 'SPリジェネ+5 / EXP+25%。詩で仲間を鼓舞する旅人。',                                       effects: { spRegen:5, expMult:1.25 } },
    { id: 'merchant',   name: '商人',       icon: '💰', changeCost: 70, desc: 'G×2.0 / 素材ドロップ+60%。稼ぎに特化した商売人。',                                       effects: { goldMult:2.0, matDropMult:1.6 } },
    { id: 'detective',  name: '探偵',       icon: '🔍', changeCost: 65, desc: 'EXP+50% / 奪取+20%。真実を追い求める調査者。',                                            effects: { expMult:1.5, stealBonus:20 } },
    { id: 'tactician',  name: '戦略家',     icon: '🎯', changeCost: 80, desc: 'G+50% / EXP+30%。知略で戦場を支配する指揮官。',                                           effects: { goldMult:1.5, expMult:1.3 } },
    { id: 'sealer',     name: '封印師',     icon: '📿', changeCost: 75, desc: '精神+40 / EXP+30% / ATK-20%。古の印術を操る賢者。',                                      effects: { spiritBonus:40, expMult:1.3, atkMult:0.8 } },
    // ── 特殊・高難度系 ──────────────────────────────────────────────────
    { id: 'dragoon',    name: '竜騎士',     icon: '🐲', changeCost:100, desc: 'ATK+35% / DEF+15%。竜の力を宿した至高の戦士。',                                           effects: { atkMult:1.35, defMult:1.15 } },
    { id: 'holyKnight', name: '聖剣士',     icon: '⚔️', changeCost:100, desc: 'ATK+25% / DEF+25% / SPリジェネ+2。光と剣を体現する者。',                                effects: { atkMult:1.25, defMult:1.25, spRegen:2 } },
    { id: 'destroyer',  name: '破壊者',     icon: '💥', changeCost: 90, desc: 'ATK×2.0 / DEF×0.5。破壊のみを追い求める狂人。',                                          effects: { atkMult:2.0, defMult:0.5 } },
    { id: 'guardian',   name: '守護者',     icon: '🛡️', changeCost: 90, desc: 'DEF×2.0 / ATK×0.5。全てを守る盾となった者。',                                            effects: { defMult:2.0, atkMult:0.5 } },
    { id: 'hunter',     name: '狩人',       icon: '🎣', changeCost: 60, desc: '遠隔×1.8 / 素材ドロップ+30%。獲物を追う孤高の狩人。',                                    effects: { rangeMult:1.8, matDropMult:1.3 } },
    { id: 'geomancer',  name: '風水師',     icon: '🌊', changeCost: 70, desc: 'G+30% / DEF+20% / 遠隔×1.3。大地の力を操る術師。',                                       effects: { goldMult:1.3, defMult:1.2, rangeMult:1.3 } },
    { id: 'blacksmith', name: '鍛冶師',     icon: '🔨', changeCost: 65, desc: 'DEF+30% / ATK+10% / 素材ドロップ+40%。武具の達人。',                                     effects: { defMult:1.3, atkMult:1.1, matDropMult:1.4 } },
    { id: 'zealot',     name: '狂信者',     icon: '🔥', changeCost: 85, desc: 'ATK+50% / 魔法+50%。信念の力で限界を超える者。',                                          effects: { atkMult:1.5, magicMult:1.5 } },
    { id: 'beastTamer', name: '魔獣使い',   icon: '🐺', changeCost: 70, desc: '素材ドロップ+80% / EXP+20%。野生を統べる異能者。',                                       effects: { matDropMult:1.8, expMult:1.2 } },
];

function getJobEffects() {
    if (typeof equippedJob === 'undefined' || !equippedJob) return {};
    const j = jobCatalog.find(x => x.id === equippedJob);
    if (!j) return {};
    const lv = (typeof getJobLevel === 'function') ? getJobLevel(equippedJob) : 0;
    return (lv > 0 && typeof getJobLevelBonus === 'function')
        ? getJobLevelBonus(j.effects, lv)
        : j.effects;
}
