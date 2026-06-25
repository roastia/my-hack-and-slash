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
    { name: '鉄の弓',             type: 'weapon', atk:  4, crit:  3, rangeWeapon: true },
    { name: '賢者の杖',           type: 'weapon', atk:  5, crit:  5 },
    { name: '竜骨の槍',           type: 'weapon', atk:  9 },
    { name: '暗殺者の短剣',       type: 'weapon', atk:  2, steal: 8 },
    { name: '炎の弓',             type: 'weapon', atk:  8, crit:  4, rangeWeapon: true },
    { name: 'エルフの弓矢',       type: 'weapon', atk:  6, crit:  6, rangeWeapon: true },
    { name: '黄金の剣',           type: 'weapon', atk: 10, steal: 6 },
    { name: '破滅の大鎌',         type: 'weapon', atk: 12, steal: 7 },
    { name: '神話の弓',           type: 'weapon', atk: 11, crit:  7, rangeWeapon: true },
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
