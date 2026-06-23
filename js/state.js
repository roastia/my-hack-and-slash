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

// LAB強化コスト
let costHp  = 10;
let costAtk = 20;
let costDef = 15;

// 累積統計
let stats = { kills: 0, deaths: 0, returns: 0 };

// --- ラン中パラメータ（ダンジョン開始時にリセット） ---
let level = 1, maxHp = 30, currentHp = 30, exp = 0, nextExp = 10;
let baseAttack = 2, baseDefense = 0;

let equipment = { weapon: null, helm: null, armor: null, shield: null };
let inventory  = [];
const maxInventory = 10;

// --- 探索状態 ---
let currentProgress  = 0;   // 解放済みダンジョン数
let activeDungeon    = null; // 現在潜っているダンジョンオブジェクト
let visitedDungeons  = [];   // 初回訪問済みダンジョンのインデックス一覧

let currentFloor   = 1;
let stepCount      = 0;
let isBossDefeated = false;
const stepsToNextFloor = 7;

// --- 空腹システム ---
let hunger    = 100;  // 現在の満腹度 (0-100)
let maxHunger = 100;

// --- バトル・イベント状態 ---
let battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
let eventState  = { active: false, type: null };
