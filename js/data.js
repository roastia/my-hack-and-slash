// =============================================================
// data.js — マスターデータ（敵・ダンジョン・アイテム・フレーバーテキスト）
// 新しいダンジョンや敵を追加するにはここだけ編集すればOK
// =============================================================

const dungeons = [
    { name: '廃棄された星屑処理場',          maxFloor: 3, diff: 1,  boss: { name: '暴走した焼却炉制御脳',         hp: 40,   atk: 4,  exp: 30  } },
    { name: 'メランコリア観測ステーション',    maxFloor: 4, diff: 2,  boss: { name: '観測者の亡霊',                 hp: 70,   atk: 6,  exp: 50  } },
    { name: '忘れられたクローンの墓標',        maxFloor: 4, diff: 3,  boss: { name: 'オリジナル・クローン・ゼロ',   hp: 120,  atk: 9,  exp: 80  } },
    { name: '錆びた銀河鉄道の終着駅',          maxFloor: 5, diff: 4,  boss: { name: '機械仕掛けの車掌',             hp: 180,  atk: 12, exp: 120 } },
    { name: '虚無を歌うパイプオルガン',        maxFloor: 5, diff: 5,  boss: { name: '音響兵器マエストロ',           hp: 250,  atk: 16, exp: 180 } },
    { name: '電脳神話の廃墟',                  maxFloor: 6, diff: 6,  boss: { name: '旧神のバックアップデータ',     hp: 350,  atk: 22, exp: 250 } },
    { name: '夢見るアンドロイドのゆりかご',    maxFloor: 6, diff: 7,  boss: { name: 'マザー・システム・エラー',     hp: 480,  atk: 30, exp: 350 } },
    { name: '量子もつれの迷宮',                maxFloor: 7, diff: 8,  boss: { name: 'シュレディンガーの悪魔',       hp: 650,  atk: 40, exp: 480 } },
    { name: '神の不在証明セクター',            maxFloor: 7, diff: 9,  boss: { name: '論理破壊アルゴリズム',         hp: 850,  atk: 52, exp: 650 } },
    { name: '宇宙論的パラドックスの庭',        maxFloor: 8, diff: 10, boss: { name: '矛盾喰い',                     hp: 1100, atk: 65, exp: 850 } }
];

const enemiesBase = [
    { name: '星の欠片',         hp: 4,  exp: 3,  atk: 2 },
    { name: '迷子のクラムボン', hp: 3,  exp: 2,  atk: 1 },
    { name: '量産型クローン兵', hp: 8,  exp: 4,  atk: 3 },
    { name: '狂った防衛機構',   hp: 12, exp: 6,  atk: 5 },
    { name: '第4世代宇宙ゴミ',  hp: 6,  exp: 3,  atk: 4 },
    { name: '概念の残骸',       hp: 15, exp: 8,  atk: 2 },
    { name: '顔のない天使',     hp: 20, exp: 12, atk: 6 }
];

const itemsDatabase = [
    // --- 武器 ---
    { name: 'コスモちくわ',       type: 'weapon', atk: 1 },
    { name: '名刀・斬鉄星',       type: 'weapon', atk: 5 },
    { name: '星の砂の剣',         type: 'weapon', atk: 4 },
    { name: '錆びた鉄パイプ',     type: 'weapon', atk: 2 },
    { name: '超次元カッター',     type: 'weapon', atk: 6 },
    { name: '謎の神聖幾何学',     type: 'weapon', atk: 8 },
    { name: 'ただの石ころ',       type: 'weapon', atk: 0 },
    // --- 兜 ---
    { name: 'ブリキのバケツ',     type: 'helm', def: 1 },
    { name: 'サイバーグラス',     type: 'helm', def: 2, crit: 2 },
    { name: '天使の輪の欠片',     type: 'helm', def: 3 },
    { name: '思念波シールド兜',   type: 'helm', def: 5 },
    // --- 鎧 ---
    { name: '穴あき宇宙服',       type: 'armor', def: 2 },
    { name: '旧世代パワードスーツ', type: 'armor', def: 4 },
    { name: '生体装甲[肉]',       type: 'armor', def: 6, steal: 2 },
    { name: '反重力マント',       type: 'armor', def: 3 },
    // --- 盾 ---
    { name: '鍋のフタ',           type: 'shield', def: 1 },
    { name: 'プラズマバックラー', type: 'shield', def: 3 },
    { name: '次元断層の盾',       type: 'shield', def: 6 }
];

// フレーバーテキスト（進行時）
const nothings = [
    '静かな時間が流れている。真空の冷たさを感じる。',
    '遠くで銀河鉄道の汽笛のような音が聞こえた気がした。',
    '無機質な宇宙の塵が、窓の外を流れていく。',
    '「我思う、ゆえに我あり」と、旧世界の機械が呟いていた。'
];

// フレーバーテキスト（帰還時）
const returnNothings = [
    '来た道を引き返している。足跡だけが虚空に浮かんでいる。',
    '静寂が不気味だ。早く帰還ゲートへ向かわなくては。',
    '遠くで何かが崩れる音がした。',
    '見覚えのある残骸の横を通り過ぎた。',
    '「帰還セヨ…」と、壊れた通信機からノイズが漏れている。'
];

// フレーバーテキスト（ボス撃破後の崩壊脱出時）
const escapeNothings = [
    '空間が崩壊し始めている！急がなくては！',
    '背後から次元の歪みが迫ってくるのを感じる。',
    '警報が鳴り響いている。急いでゲートへ！',
    '天井から破片が降り注ぐ。長居は無用だ。',
    '崩壊のタイムリミットが迫るような錯覚に陥る。'
];
