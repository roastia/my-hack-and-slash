// =============================================================
// state.js — ゲームの全状態変数
// ここに「今何が起きているか」のデータが集まる
// =============================================================

// --- 永続パラメータ（LABで強化される値） ---
let permMaxHp    = 30;
let baseSpeed    = 10;   // 素早さ基礎値
let permBaseAtk  = 2;
let permBaseDef  = 0;
let starDust     = 0;   // 通貨（星屑）
let battleMerit  = 0;   // 武勲：戦闘スキル購入に使う

// LAB強化コスト
let costHp  = 10;
let costAtk = 20;
let costDef = 15;

// 累積統計
let stats = { kills: 0, deaths: 0, returns: 0 };

// --- ラン中パラメータ（ダンジョン開始時にリセット） ---
let level = 1, maxHp = 30, currentHp = 30, exp = 0, nextExp = 30;
let baseAttack = 2, baseDefense = 0;

let equipment = { weapon: null, helm: null, armor: null, shield: null };
let inventory  = [];
let maxInventory = 10;
let bagUpgradeLevel = 0;  // 荷物拡張レベル（max5）

// --- 探索状態 ---
let currentProgress  = 0;   // 解放済みダンジョン数
let activeDungeon    = null; // 現在潜っているダンジョンオブジェクト
let visitedDungeons  = [];   // 初回訪問済みダンジョンのインデックス一覧

let currentFloor   = 1;
let stepCount      = 0;
let isBossDefeated = false;
const stepsToNextFloor = 7;

// --- 空腹システム ---
let hunger    = 100;
let maxHunger = 100;  // 道具屋スキルで拡張可能


// --- SPシステム（探索・戦闘スキル共有）---
let sp    = 100;
let maxSp = 100;

// --- 渇きシステム ---
let thirst    = 100;
let maxThirst = 100;

// --- 拡張ステータス ---
let baseMagic  = 0;   // 魔法攻撃・精神ステータス（道具屋スキルで上昇）
let baseSpirit = 0;   // 精神（魔法防御 + バフ乗算）
let baseRange  = 0;   // 遠隔攻撃力（弓・遠距離武器に適用）

// --- テンションシステム ---
let tension = 1;      // 1=通常 / 2=高揚 / 3=狂乱

// --- スタック・エンカウント ---
let enemyStack = [];  // { name, hp, maxHp, atk, exp, speed, type, magicAtk }

// --- 素材ストック ---
let materials = {};   // { '薬草': 3, '鉄くず': 2, ... }

// --- 戦闘スキル習得状況 ---
// { skillId: { learned: true, uses: 0 } }
let skillBook = {};

// --- 拠点劣化システム ---
let baseCondition = 100;  // 拠点コンディション (0-100)
let costRepairBase = 20;  // 修繕コスト

// --- バトル・イベント状態 ---
let battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
let eventState  = { active: false, type: null };

// --- AP制メダルシステム ---
let equippedMedals = [];   // 装備中のメダルID配列
let medalApLimit   = 10;   // AP上限（LABで拡張可能）
let costMedalAp    = 30;   // AP拡張コスト（starDust）

// --- DNA突然変異システム ---
let dnaCounts     = {};   // { '種族名': 討伐数 }
let mutations     = [];   // 装備中の変異ID配列（最大 mutationSlots 個）
let mutationSlots = 3;    // 変異装備スロット上限

// --- 拠点トラップ ---
let traps    = [];        // 設置中のトラップ配列 { id, name, dmgBase, usesLeft, ignoresDef }
const MAX_TRAPS = 3;      // 同時設置上限
// --- 称号（二つ名）システム ---
let equippedTitle  = null;           // 装備中の称号ID
let unlockedTitles = ['nameless'];   // 解除済み称号ID配列
let titleStats     = { critHits: 0, stealCount: 0, skillUseCount: 0, stepsTotal: 0 };

// --- 星座システム ---
let activeDungeonConstellation = null;  // ダンジョン突入時の星座ID

// --- カスタムAI優先度 ---
let customAiPriority = ['healingWave', 'powerStrike', 'rapidStrike', 'guardStance', 'normal'];

// --- ジョブシステム ---
let equippedJob = 'none';  // 現在のジョブID
