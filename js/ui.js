// =============================================================
// ui.js — DOM参照、ステータス計算、画面描画
// =============================================================

// --- DOM参照 ---
const locationDisplay  = document.getElementById('locationDisplay');
const floorDisplay     = document.getElementById('floorDisplay');
const currentHpDisplay = document.getElementById('currentHpDisplay');
const maxHpDisplay     = document.getElementById('maxHpDisplay');
const levelDisplay     = document.getElementById('levelDisplay');
const expDisplay       = document.getElementById('expDisplay');
const nextExpDisplay   = document.getElementById('nextExpDisplay');
const attackDisplay    = document.getElementById('attackDisplay');
const defenseDisplay   = document.getElementById('defenseDisplay');
const critDisplay      = document.getElementById('critDisplay');
const stealDisplay     = document.getElementById('stealDisplay');
const spiritDisplay    = document.getElementById('spiritDisplay');
const itemCountDisplay = document.getElementById('itemCountDisplay');
const inventoryList    = document.getElementById('inventoryList');
const stardustDisplay  = document.getElementById('stardustDisplay');

const baseScene    = document.getElementById('baseScene');
const exploreScene = document.getElementById('exploreScene');
const logContent   = document.getElementById('logContent');
const exploreBtn   = document.getElementById('exploreBtn');
const returnBtn    = document.getElementById('returnBtn');

const progressContainer = document.getElementById('progressContainer');
const distBase          = document.getElementById('distBase');
const distBoss          = document.getElementById('distBoss');
const progressBar       = document.getElementById('progressBar');

// =============================================================
// ステータス計算（装備込み）
// =============================================================


// =============================================================
// 称号エフェクト
// =============================================================
function getTitleEffects() {
    if (typeof equippedTitle === 'undefined' || !equippedTitle) return {};
    const t = (typeof titleCatalog !== 'undefined') ? titleCatalog.find(x => x.id === equippedTitle) : null;
    return t ? t.effects : {};
}

// =============================================================
// 現型（装備シナジー）エフェクト
// =============================================================
function getArchetypeEffect() {
    const w = equipment.weapon  !== null;
    const h = equipment.helm    !== null;
    const a = equipment.armor   !== null;
    const s = equipment.shield  !== null;
    const cnt = [w,h,a,s].filter(Boolean).length;
    if (cnt === 4) return { id:'fullArmor',  name:'完全武装型',  icon:'⚔🛡', atkMult:1.1, defMult:1.1, spdBonus:3,  critBonus:5 };
    if (w && !h && !a && !s) return { id:'bladeMaster', name:'剣聖型',      icon:'⚔',   atkMult:1.2, spdBonus:6 };
    if (!w && h && a && s)   return { id:'fortress',    name:'要塞型',      icon:'🛡',   defMult:1.35 };
    if (w && s && !h && !a)  return { id:'duelist',     name:'決闘者型',    icon:'⚔🛡', atkMult:1.15, defMult:1.1 };
    if (w && h && a && !s)   return { id:'assault',     name:'強襲型',      icon:'💥',   atkMult:1.15, critBonus:10 };
    if (!w && !h && !a && !s) return null;
    return null;
}

// =============================================================
// 星座エフェクト（現在アクティブな星座）
// =============================================================
function getConstellationEffects() {
    if (typeof activeDungeonConstellation === 'undefined' || !activeDungeonConstellation) return {};
    const c = (typeof constellationCatalog !== 'undefined') ? constellationCatalog.find(x => x.id === activeDungeonConstellation) : null;
    return c ? c.effects : {};
}

function getTotalAttack() {
    let total = baseAttack;
    Object.values(equipment).forEach(eq => { if (eq && eq.atk) total += eq.atk; });
    // 空腹ペナルティ
    if (typeof hunger !== 'undefined') {
        if (hunger <= 0)  total = Math.max(1, total - 3);
        else if (hunger <= 25) total = Math.max(1, total - 1);
    }
    // 渇きペナルティ
    if (typeof thirst !== 'undefined') {
        if (thirst <= 0)  total = Math.max(1, total - 3);
        else if (thirst <= 25) total = Math.max(1, total - 1);
    }
    // メダル効果
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.atkMult) total = Math.floor(total * me.atkMult);
    }
    // 変異効果
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.atkMult && mu.atkMult !== 1) total = Math.floor(total * mu.atkMult);
    }
    // 拠点荒廃ペナルティ
    if (typeof baseCondition !== 'undefined' && baseCondition === 0) {
        total = Math.max(1, Math.floor(total * 0.8));
    }
    // 称号効果
    const _te = getTitleEffects();
    if (_te.atkMult) total = Math.floor(total * _te.atkMult);
    // 現型効果
    const _ar = getArchetypeEffect();
    if (_ar && _ar.atkMult) total = Math.floor(total * _ar.atkMult);
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je=getJobEffects(); if(_je.atkMult) total=Math.floor(total*_je.atkMult); }
    return Math.max(1, total);
}

// 遠隔武器かどうか判定
function isRangeWeapon() {
    return equipment.weapon && equipment.weapon.rangeWeapon === true;
}

// 遠隔攻撃合計（弓装備時: baseAttack + baseRange + メダル）
function getTotalRangeAttack() {
    let total = baseAttack + (typeof baseRange !== 'undefined' ? baseRange : 0);
    if (equipment.weapon && equipment.weapon.atk) total += equipment.weapon.atk;
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.atkMult)   total = Math.floor(total * me.atkMult);
        if (me.rangeMult) total = Math.floor(total * me.rangeMult);
    }
    if (typeof hunger !== 'undefined' && hunger <= 0)   total = Math.max(1, total - 3);
    if (typeof thirst !== 'undefined' && thirst <= 0)   total = Math.max(1, total - 3);
    return Math.max(1, total);
}

// 精神ステータス合計（魔法防御・バフ倍率）
function getTotalSpirit() {
    let total = typeof baseSpirit !== 'undefined' ? baseSpirit : 0;
    Object.values(equipment).forEach(eq => { if (eq && eq.spirit) total += eq.spirit; });
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.spiritBonus) total += me.spiritBonus;
    }
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.spiritBonus) total += mu.spiritBonus;
    }
    // 称号効果
    const _te_st = getTitleEffects();
    if (_te_st.spiritBonus) total += _te_st.spiritBonus;
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je_st=getJobEffects(); if(_je_st.spiritBonus) total+=_je_st.spiritBonus; }
    return total;
}

function getTotalDef() {
    let total = baseDefense;
    Object.values(equipment).forEach(eq => { if (eq && eq.def) total += eq.def; });
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.defBonus) total += me.defBonus;
    }
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.defBonus) total += mu.defBonus;
    }
    // 称号効果
    const _te_d = getTitleEffects();
    if (_te_d.defMult) total = Math.floor(total * _te_d.defMult);
    // 現型効果
    const _ar_d = getArchetypeEffect();
    if (_ar_d && _ar_d.defMult) total = Math.floor(total * _ar_d.defMult);
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je_d=getJobEffects(); if(_je_d.defMult) total=Math.floor(total*_je_d.defMult); }
    return total;
}

function getCritRate() {
    let total = 0;
    Object.values(equipment).forEach(eq => { if (eq && eq.crit) total += eq.crit; });
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.critBonus) total += me.critBonus;
    }
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.critBonus) total += mu.critBonus;
    }
    // 称号効果
    const _te_c = getTitleEffects();
    if (_te_c.critBonus) total += _te_c.critBonus;
    // 現型効果
    const _ar_c = getArchetypeEffect();
    if (_ar_c && _ar_c.critBonus) total += _ar_c.critBonus;
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je_c=getJobEffects(); if(_je_c.critBonus) total+=_je_c.critBonus; }
    return total;
}

function getStealRate() {
    let total = 0;
    Object.values(equipment).forEach(eq => { if (eq && eq.steal) total += eq.steal; });
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.drainBonus) total += me.drainBonus;
    }
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.drainBonus) total += mu.drainBonus;
    }
    // 称号効果
    const _te_s = getTitleEffects();
    if (_te_s.stealBonus) total += _te_s.stealBonus;
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je_s=getJobEffects(); if(_je_s.stealBonus) total+=_je_s.stealBonus; }
    return total;
}

function getTotalSpeed() {
    let total = baseSpeed;
    Object.values(equipment).forEach(eq => { if (eq && eq.spd) total += eq.spd; });
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.spdBonus) total += me.spdBonus;
    }
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.spdBonus) total += mu.spdBonus;
    }
    // 称号効果
    const _te_sp = getTitleEffects();
    if (_te_sp.spdBonus) total += _te_sp.spdBonus;
    if (_te_sp.spdMult)  total = Math.floor(total * _te_sp.spdMult);
    // 現型効果
    const _ar_sp = getArchetypeEffect();
    if (_ar_sp && _ar_sp.spdBonus) total += _ar_sp.spdBonus;
    // ジョブ効果
    if (typeof getJobEffects === 'function') { const _je_sp=getJobEffects(); if(_je_sp.spdBonus) total+=_je_sp.spdBonus; }
    // 重量ペナルティ
    const totalWeight = Object.values(equipment).reduce((s,e)=>s+(e&&e.weight?e.weight:0),0);
    if (totalWeight > 6) total = Math.max(1, total - Math.floor((totalWeight - 6) * 0.8));
    return Math.max(1, total);
}

function getTotalSpirits() {
    let total = {};
    Object.values(equipment).forEach(eq => {
        if (eq && eq.spirits) {
            for (let k in eq.spirits) {
                if (total[k]) total[k].val += eq.spirits[k].val;
                else total[k] = { ...eq.spirits[k] };
            }
        }
    });
    return total;
}

function getSpiritText(spiritsObj) {
    if (!spiritsObj || Object.keys(spiritsObj).length === 0) return '無';
    let parts = [];
    for (let k in spiritsObj) parts.push(`<span style="color:${spiritsObj[k].color}">${k}${spiritsObj[k].val}</span>`);
    return parts.join(' ');
}

// =============================================================
// イラスト（中央ビューポート）
// =============================================================

function updateIllustration(type, enemy = null) {
    const content = document.getElementById('viewportContent');
    const gold  = 'var(--accent-cyan)';
    const flame = 'var(--accent-orange)';
    const magic = 'var(--accent-magenta)';
    const green = 'var(--accent-green)';
    const red   = 'var(--danger-red)';
    const dim   = 'var(--text-dim)';
    const pale  = 'var(--text-main)';

    const logArea = document.getElementById('exploreScene');
    if (logArea) {
        if (type === 'battle' || type === 'boss') {
            logArea.classList.add('battle-mode-bg');
        } else {
            logArea.classList.remove('battle-mode-bg');
        }
    }

    // 戦闘以外ではHPオーバーレイを非表示
    const _ov = document.getElementById('enemyHpOverlay');
    if (_ov && !enemy) _ov.style.display = 'none';

    let enemyLabel = '';
    if (enemy) {
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        const hpCol   = hpRatio > 0.5 ? green : hpRatio > 0.25 ? flame : red;
        // 敵名はSVG内に薄く残す（イラストの背後なので邪魔にならない）
        enemyLabel = '';
        // HP表示はSVG外のオーバーレイに
        const ov = document.getElementById('enemyHpOverlay');
        if (ov) {
            ov.style.display = 'block';
            document.getElementById('enemyHpName').textContent = enemy.name;
            document.getElementById('enemyHpText').textContent = `HP ${enemy.hp} / ${enemy.maxHp}`;
            const fill = document.getElementById('enemyHpFill');
            fill.style.width = `${hpRatio * 100}%`;
            fill.style.background = hpCol;
        }
    }

    function getEnemySprite(name) {
        if (/スライム|ぶよぶよ|バブル|はぐれ/.test(name)) return 'slime';
        if (/スケルトン|ゾンビ|亡霊|死霊|骸骨|亡者|不死|千年|骸|しかばね|幽霊/.test(name)) return 'undead';
        if (/ゴブリン|オーク|おに|コボルド|リザード/.test(name)) return 'goblin';
        if (/ドラゴン|ワイバーン|ドレイク|竜|ハイドラ|飛竜/.test(name)) return 'dragon';
        if (/ナイト|騎士|将軍|処刑|剣士|ダーク|侍/.test(name)) return 'knight';
        if (/ウルフ|バジリスク|タイガー|ベア|ライオン|獣|くい|ありくい|狼/.test(name)) return 'beast';
        if (/コウモリ|ドラキー|ハーピー|翼|蝙蝠/.test(name)) return 'flyer';
        if (/魔女|魔道|魔法|きとうし|プリースト|ウィザード|ゾルガ|邪悪な|僧侶/.test(name)) return 'mage';
        if (/ゴーレム|アーマー|鎧|石像|巨人/.test(name)) return 'golem';
        return 'monster';
    }

    let svg = '';
    switch (type) {

        case 'base':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="63" fill="#060409"/>
            <circle cx="16" cy="14" r="6.5" fill="#e8e0a0" opacity="0.8"/>
            <circle cx="18.5" cy="12.5" r="5" fill="#060409"/>
            <circle cx="35" cy="6" r="0.6" fill="${pale}"/><circle cx="52" cy="9" r="0.7" fill="${pale}"/>
            <circle cx="68" cy="4" r="0.5" fill="${pale}"/><circle cx="82" cy="12" r="0.6" fill="${pale}"/>
            <circle cx="90" cy="7" r="0.5" fill="${pale}"/><circle cx="8" cy="24" r="0.4" fill="${pale}"/>
            <circle cx="75" cy="22" r="0.5" fill="${pale}"/><circle cx="44" cy="3" r="0.4" fill="${pale}"/>
            <rect x="0" y="63" width="100" height="37" fill="#0e0b07"/>
            <rect x="24" y="33" width="36" height="30" fill="#18100a" stroke="${gold}" stroke-width="0.8"/>
            <polygon points="20,33 60,33 40,19" fill="#221608" stroke="${gold}" stroke-width="0.8"/>
            <rect x="49" y="19" width="5" height="10" fill="#221608" stroke="${gold}" stroke-width="0.5"/>
            <path d="M51 19 Q54 14 51 9 Q54 5 52 2" stroke="${dim}" stroke-width="1.2" fill="none" opacity="0.45"/>
            <rect x="37" y="49" width="8" height="14" rx="1" fill="#2a1408" stroke="${gold}" stroke-width="0.6"/>
            <circle cx="44" cy="56" r="0.8" fill="${gold}"/>
            <rect x="27" y="38" width="9" height="8" rx="0.5" fill="${flame}" opacity="0.2" stroke="${gold}" stroke-width="0.5"/>
            <line x1="31.5" y1="38" x2="31.5" y2="46" stroke="${gold}" stroke-width="0.4" opacity="0.5"/>
            <line x1="27" y1="42" x2="36" y2="42" stroke="${gold}" stroke-width="0.4" opacity="0.5"/>
            <rect x="50" y="38" width="9" height="8" rx="0.5" fill="${flame}" opacity="0.2" stroke="${gold}" stroke-width="0.5"/>
            <line x1="54.5" y1="38" x2="54.5" y2="46" stroke="${gold}" stroke-width="0.4" opacity="0.5"/>
            <line x1="50" y1="42" x2="59" y2="42" stroke="${gold}" stroke-width="0.4" opacity="0.5"/>
            <rect x="5" y="52" width="4" height="12" fill="#2a1a0a"/>
            <ellipse cx="7" cy="49" rx="7" ry="8" fill="#142010" stroke="${green}" stroke-width="0.5" opacity="0.8"/>
            <rect x="80" y="54" width="4" height="10" fill="#2a1a0a"/>
            <ellipse cx="82" cy="51" rx="6" ry="7" fill="#142010" stroke="${green}" stroke-width="0.5" opacity="0.8"/>
            <rect x="60" y="44" width="14" height="8" fill="#1a1208" stroke="${gold}" stroke-width="0.5"/>
            <text x="67" y="50" text-anchor="middle" font-size="4.5" fill="${gold}" opacity="0.8" font-family="serif">宿屋</text>
            </svg>`;
            content.style.color = gold; break;

        case 'lab':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            <ellipse cx="35" cy="71" rx="16" ry="5" fill="${flame}" opacity="0.12"/>
            <rect x="18" y="55" width="34" height="18" rx="2" fill="#1a1008" stroke="${flame}" stroke-width="1"/>
            <rect x="22" y="52" width="26" height="5" rx="1" fill="#2a1808" stroke="${gold}" stroke-width="0.6"/>
            <path d="M27 55 Q30 45 35 52 Q39 42 43 55" fill="${flame}" opacity="0.65"/>
            <path d="M29 55 Q32 47 35 53 Q38 47 41 55" fill="#ffe060" opacity="0.45"/>
            <circle cx="29" cy="47" r="1" fill="#ffe060" opacity="0.9"/>
            <circle cx="36" cy="44" r="1.2" fill="${flame}" opacity="0.7"/>
            <circle cx="41" cy="46" r="0.8" fill="#ffe060" opacity="0.8"/>
            <rect x="60" y="60" width="22" height="11" rx="1" fill="#2a2020" stroke="${dim}" stroke-width="0.8"/>
            <rect x="57" y="69" width="28" height="4" rx="1" fill="#1e1818"/>
            <rect x="63" y="73" width="14" height="7" rx="1" fill="#1e1818"/>
            <rect x="82" y="18" width="5" height="36" rx="1" fill="${gold}" opacity="0.7"/>
            <rect x="78" y="24" width="13" height="6" rx="1" fill="${gold}" opacity="0.7"/>
            <ellipse cx="84" cy="56" rx="3" ry="2" fill="${gold}" opacity="0.8"/>
            <path d="M12 16 L22 16 L22 30 L17 36 L12 30 Z" fill="#18120a" stroke="${gold}" stroke-width="1"/>
            <path d="M14 20 L20 20 L20 28 L17 32 L14 28 Z" fill="none" stroke="${flame}" stroke-width="0.6"/>
            <rect x="0" y="80" width="100" height="20" fill="#0e0c08"/>
            <line x1="0" y1="80" x2="100" y2="80" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
            </svg>`;
            content.style.color = flame; break;

        case 'explore':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            <rect x="0" y="0" width="23" height="100" fill="#0e0a06"/>
            <rect x="77" y="0" width="23" height="100" fill="#0e0a06"/>
            <rect x="0" y="0" width="100" height="14" fill="#0e0a06"/>
            <rect x="0" y="83" width="100" height="17" fill="#0e0a06"/>
            <line x1="0" y1="24" x2="23" y2="24" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="0" y1="40" x2="23" y2="40" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="0" y1="56" x2="23" y2="56" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="0" y1="70" x2="23" y2="70" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="10" y1="14" x2="10" y2="24" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="5" y1="24" x2="5" y2="40" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="15" y1="40" x2="15" y2="56" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="77" y1="24" x2="100" y2="24" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="77" y1="40" x2="100" y2="40" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="77" y1="56" x2="100" y2="56" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="77" y1="70" x2="100" y2="70" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <line x1="88" y1="14" x2="88" y2="24" stroke="${dim}" stroke-width="0.3" opacity="0.5"/>
            <rect x="23" y="14" width="54" height="69" fill="#060409"/>
            <rect x="20" y="27" width="3" height="9" fill="#3a2010"/>
            <path d="M19 27 Q21.5 19 24 27" fill="${flame}" opacity="0.8"/>
            <path d="M20 26 Q21.5 20 23 26" fill="#ffe060" opacity="0.5"/>
            <ellipse cx="21.5" cy="36" rx="3" ry="1.5" fill="${flame}" opacity="0.18"/>
            <rect x="77" y="27" width="3" height="9" fill="#3a2010"/>
            <path d="M76 27 Q78.5 19 81 27" fill="${flame}" opacity="0.8"/>
            <path d="M77 26 Q78.5 20 80 26" fill="#ffe060" opacity="0.5"/>
            <ellipse cx="78.5" cy="36" rx="3" ry="1.5" fill="${flame}" opacity="0.18"/>
            <ellipse cx="21" cy="83" rx="13" ry="3" fill="${flame}" opacity="0.07"/>
            <ellipse cx="79" cy="83" rx="13" ry="3" fill="${flame}" opacity="0.07"/>
            <rect x="38" y="28" width="24" height="40" fill="#060409"/>
            <path d="M38 48 Q50 28 62 48" fill="#060409" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
            <path d="M47 38 Q50 35 53 38" fill="${flame}" opacity="0.2"/>
            <line x1="30" y1="83" x2="70" y2="83" stroke="${dim}" stroke-width="0.3" opacity="0.3"/>
            <line x1="36" y1="83" x2="36" y2="100" stroke="${dim}" stroke-width="0.3" opacity="0.25"/>
            <line x1="50" y1="83" x2="50" y2="100" stroke="${dim}" stroke-width="0.3" opacity="0.25"/>
            <line x1="64" y1="83" x2="64" y2="100" stroke="${dim}" stroke-width="0.3" opacity="0.25"/>
            </svg>`;
            content.style.color = dim; break;

        case 'item':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            <ellipse cx="50" cy="72" rx="32" ry="12" fill="${gold}" opacity="0.06"/>
            <rect x="20" y="54" width="60" height="34" rx="2" fill="#2a1c0a" stroke="${gold}" stroke-width="1.2"/>
            <path d="M20 54 Q20 36 50 33 Q80 36 80 54" fill="#341e08" stroke="${gold}" stroke-width="1.2"/>
            <path d="M22 52 Q22 38 50 35 Q78 38 78 52" fill="#2a1808"/>
            <line x1="20" y1="60" x2="80" y2="60" stroke="${gold}" stroke-width="0.6"/>
            <rect x="44" y="57" width="12" height="10" rx="2" fill="#3a2808" stroke="${gold}" stroke-width="0.8"/>
            <circle cx="50" cy="62" r="2" fill="${gold}"/>
            <ellipse cx="50" cy="54" rx="18" ry="7" fill="${gold}" opacity="0.16"/>
            <line x1="50" y1="46" x2="50" y2="24" stroke="${gold}" stroke-width="0.7" opacity="0.4"/>
            <line x1="50" y1="46" x2="28" y2="30" stroke="${gold}" stroke-width="0.5" opacity="0.3"/>
            <line x1="50" y1="46" x2="72" y2="30" stroke="${gold}" stroke-width="0.5" opacity="0.3"/>
            <line x1="50" y1="46" x2="18" y2="40" stroke="${gold}" stroke-width="0.3" opacity="0.2"/>
            <line x1="50" y1="46" x2="82" y2="40" stroke="${gold}" stroke-width="0.3" opacity="0.2"/>
            <ellipse cx="34" cy="88" rx="5" ry="2.5" fill="${gold}" opacity="0.65"/>
            <ellipse cx="48" cy="90" rx="4" ry="2" fill="${gold}" opacity="0.55"/>
            <ellipse cx="62" cy="87" rx="4.5" ry="2.2" fill="${gold}" opacity="0.6"/>
            <ellipse cx="72" cy="91" rx="3" ry="1.8" fill="${gold}" opacity="0.45"/>
            <path d="M50 20 L51 15 L52 20 L57 21 L52 22 L51 27 L50 22 L45 21 Z" fill="${gold}" opacity="0.8"/>
            <path d="M24 35 L25 32 L26 35 L29 35.5 L26 36 L25 39 L24 36 L21 35.5 Z" fill="${gold}" opacity="0.45"/>
            <path d="M76 33 L77 30 L78 33 L81 33.5 L78 34 L77 37 L76 34 L73 33.5 Z" fill="${gold}" opacity="0.45"/>
            </svg>`;
            content.style.color = gold; break;

        case 'event':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            <ellipse cx="50" cy="74" rx="28" ry="9" fill="${magic}" opacity="0.1"/>
            <rect x="18" y="69" width="64" height="11" rx="1" fill="#1a1218" stroke="${magic}" stroke-width="0.8"/>
            <rect x="22" y="61" width="56" height="10" rx="1" fill="#201428" stroke="${magic}" stroke-width="0.8"/>
            <rect x="22" y="79" width="8" height="14" fill="#1a1218" stroke="${dim}" stroke-width="0.4"/>
            <rect x="70" y="79" width="8" height="14" fill="#1a1218" stroke="${dim}" stroke-width="0.4"/>
            <circle cx="50" cy="66" r="14" fill="none" stroke="${magic}" stroke-width="0.5" opacity="0.5" stroke-dasharray="3,2"/>
            <circle cx="50" cy="66" r="9" fill="none" stroke="${magic}" stroke-width="0.4" opacity="0.45"/>
            <text x="50" y="69.5" text-anchor="middle" font-size="9" fill="${magic}" opacity="0.7" font-family="serif">✦</text>
            <circle cx="50" cy="44" r="9" fill="none" stroke="${magic}" stroke-width="1" opacity="0.8"/>
            <circle cx="50" cy="44" r="5" fill="${magic}" opacity="0.35"/>
            <circle cx="50" cy="44" r="2.5" fill="${magic}" opacity="0.7"/>
            <line x1="50" y1="31" x2="50" y2="26" stroke="${magic}" stroke-width="0.5" opacity="0.5"/>
            <line x1="41" y1="34" x2="37" y2="30" stroke="${magic}" stroke-width="0.5" opacity="0.5"/>
            <line x1="59" y1="34" x2="63" y2="30" stroke="${magic}" stroke-width="0.5" opacity="0.5"/>
            <line x1="37" y1="44" x2="32" y2="44" stroke="${magic}" stroke-width="0.5" opacity="0.5"/>
            <line x1="63" y1="44" x2="68" y2="44" stroke="${magic}" stroke-width="0.5" opacity="0.5"/>
            <circle cx="30" cy="37" r="1" fill="${magic}" opacity="0.6"/>
            <circle cx="70" cy="41" r="1.2" fill="${magic}" opacity="0.5"/>
            <circle cx="38" cy="26" r="0.8" fill="${magic}" opacity="0.7"/>
            <circle cx="63" cy="24" r="1" fill="${magic}" opacity="0.6"/>
            </svg>`;
            content.style.color = magic; break;

        case 'death':
            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            <rect x="0" y="76" width="100" height="24" fill="#0a0806"/>
            <rect x="36" y="30" width="28" height="42" rx="2" fill="#1a1818" stroke="${dim}" stroke-width="1"/>
            <path d="M36 36 Q50 24 64 36" fill="#1a1818" stroke="${dim}" stroke-width="1"/>
            <text x="50" y="54" text-anchor="middle" font-size="8" fill="${dim}" opacity="0.75" font-family="serif">R.I.P.</text>
            <line x1="40" y1="60" x2="60" y2="60" stroke="${dim}" stroke-width="0.5" opacity="0.5"/>
            <path d="M50 36 L48 56 L51 66" stroke="${dim}" stroke-width="0.8" opacity="0.5" fill="none"/>
            <line x1="73" y1="54" x2="83" y2="74" stroke="${dim}" stroke-width="2" opacity="0.45"/>
            <line x1="70" y1="57" x2="75" y2="52" stroke="${dim}" stroke-width="1.5" opacity="0.45"/>
            <line x1="75" y1="59" x2="69" y2="64" stroke="${dim}" stroke-width="1.5" opacity="0.45"/>
            <circle cx="26" cy="77" r="2.5" fill="${red}" opacity="0.45"/>
            <circle cx="33" cy="76" r="2" fill="${red}" opacity="0.35"/>
            <circle cx="66" cy="77" r="2.5" fill="${red}" opacity="0.45"/>
            <line x1="26" y1="77" x2="26" y2="84" stroke="${green}" stroke-width="0.8" opacity="0.45"/>
            <line x1="33" y1="76" x2="33" y2="84" stroke="${green}" stroke-width="0.8" opacity="0.35"/>
            <line x1="66" y1="77" x2="66" y2="84" stroke="${green}" stroke-width="0.8" opacity="0.45"/>
            <path d="M14 20 Q17 18 20 20 M17 19 L17 24" stroke="${dim}" stroke-width="0.8" fill="none" opacity="0.5"/>
            <path d="M79 15 Q82 13 85 15 M82 14 L82 19" stroke="${dim}" stroke-width="0.8" fill="none" opacity="0.4"/>
            </svg>`;
            content.style.color = red; break;

        case 'battle':
        case 'boss': {
            const isBossType = (type === 'boss');
            const spriteType = enemy ? getEnemySprite(enemy.name) : 'monster';

            const bossAura = isBossType ? `
            <ellipse cx="50" cy="60" rx="44" ry="38" fill="none" stroke="${red}" stroke-width="0.5" stroke-dasharray="5,3" opacity="0.25"/>
            <ellipse cx="50" cy="60" rx="48" ry="42" fill="none" stroke="${red}" stroke-width="0.3" stroke-dasharray="7,5" opacity="0.15"/>` : '';

            let sprite = '';
            switch (spriteType) {

                case 'slime':
                    sprite = `
                    <ellipse cx="50" cy="72" rx="22" ry="6" fill="${green}" opacity="0.12"/>
                    <path d="M28 65 Q27 50 34 41 Q40 30 50 28 Q60 30 66 41 Q73 50 72 65 Q67 71 50 73 Q33 71 28 65" fill="#1e3c10" stroke="${green}" stroke-width="1.5"/>
                    <path d="M30 62 Q29 50 35 43 Q40 33 50 31 Q60 33 65 43 Q71 50 70 62" fill="#28481a" opacity="0.5"/>
                    <ellipse cx="40" cy="45" rx="6" ry="4" fill="${green}" opacity="0.12" transform="rotate(-20 40 45)"/>
                    <circle cx="42" cy="56" r="5.5" fill="#162e0c" stroke="${green}" stroke-width="1"/>
                    <circle cx="58" cy="56" r="5.5" fill="#162e0c" stroke="${green}" stroke-width="1"/>
                    <circle cx="42" cy="56" r="3.2" fill="${green}" opacity="0.8"/>
                    <circle cx="58" cy="56" r="3.2" fill="${green}" opacity="0.8"/>
                    <circle cx="43" cy="55" r="1.1" fill="#f0e8c0" opacity="0.8"/>
                    <circle cx="59" cy="55" r="1.1" fill="#f0e8c0" opacity="0.8"/>
                    <path d="M41 65 Q50 69 59 65" stroke="${green}" stroke-width="1" fill="none"/>`;
                    break;

                case 'undead':
                    sprite = `
                    <ellipse cx="50" cy="88" rx="20" ry="5" fill="${magic}" opacity="0.1"/>
                    <ellipse cx="50" cy="34" rx="15" ry="17" fill="#b8b098" stroke="${dim}" stroke-width="1"/>
                    <ellipse cx="50" cy="39" rx="11" ry="10" fill="#a8a090"/>
                    <ellipse cx="42" cy="31" rx="5" ry="6" fill="#080606"/>
                    <ellipse cx="58" cy="31" rx="5" ry="6" fill="#080606"/>
                    <ellipse cx="42" cy="31" rx="3" ry="4" fill="${magic}" opacity="0.7"/>
                    <ellipse cx="58" cy="31" rx="3" ry="4" fill="${magic}" opacity="0.7"/>
                    <path d="M47 42 L50 47 L53 42" fill="#080606"/>
                    <rect x="41" y="46" width="4" height="6" rx="1" fill="#c8c0b0"/>
                    <rect x="46" y="46" width="3" height="5" rx="1" fill="#b8b0a0"/>
                    <rect x="50" y="46" width="4" height="6" rx="1" fill="#c8c0b0"/>
                    <rect x="55" y="46" width="3" height="5" rx="1" fill="#b8b0a0"/>
                    <line x1="50" y1="53" x2="50" y2="80" stroke="#b8b098" stroke-width="2.2"/>
                    <path d="M50 58 Q37 56 35 64 Q37 66 50 64" fill="none" stroke="#b8b098" stroke-width="1.2"/>
                    <path d="M50 65 Q37 63 35 71 Q37 73 50 71" fill="none" stroke="#b8b098" stroke-width="1.2"/>
                    <path d="M50 58 Q63 56 65 64 Q63 66 50 64" fill="none" stroke="#b8b098" stroke-width="1.2"/>
                    <path d="M50 65 Q63 63 65 71 Q63 73 50 71" fill="none" stroke="#b8b098" stroke-width="1.2"/>
                    <path d="M50 57 Q34 59 28 70 Q26 76 30 79" fill="none" stroke="#b8b098" stroke-width="1.5"/>
                    <path d="M50 57 Q66 59 72 70 Q74 76 70 79" fill="none" stroke="#b8b098" stroke-width="1.5"/>`;
                    break;

                case 'goblin':
                    sprite = `
                    <ellipse cx="50" cy="88" rx="18" ry="5" fill="#000" opacity="0.25"/>
                    <ellipse cx="50" cy="68" rx="14" ry="17" fill="#1c3010" stroke="#2a4818" stroke-width="1"/>
                    <ellipse cx="50" cy="42" rx="13" ry="13" fill="#243818" stroke="#2a4818" stroke-width="1"/>
                    <ellipse cx="34" cy="40" rx="6" ry="10" fill="#1c3010" stroke="#2a4818" stroke-width="1"/>
                    <ellipse cx="66" cy="40" rx="6" ry="10" fill="#1c3010" stroke="#2a4818" stroke-width="1"/>
                    <ellipse cx="43" cy="40" rx="4" ry="5" fill="#080606"/>
                    <ellipse cx="57" cy="40" rx="4" ry="5" fill="#080606"/>
                    <circle cx="43" cy="40" r="2.5" fill="${red}" opacity="0.8"/>
                    <circle cx="57" cy="40" r="2.5" fill="${red}" opacity="0.8"/>
                    <circle cx="44" cy="39" r="1" fill="#fff" opacity="0.5"/>
                    <circle cx="58" cy="39" r="1" fill="#fff" opacity="0.5"/>
                    <ellipse cx="50" cy="47" rx="3" ry="2" fill="#1a2e10"/>
                    <path d="M42 51 Q50 56 58 51" fill="#1a2e10" stroke="#2a4818" stroke-width="0.8"/>
                    <line x1="45" y1="51" x2="44" y2="56" stroke="#d8d0c0" stroke-width="1.5"/>
                    <line x1="55" y1="51" x2="56" y2="56" stroke="#d8d0c0" stroke-width="1.5"/>
                    <line x1="50" y1="61" x2="34" y2="54" stroke="#1c3010" stroke-width="6" stroke-linecap="round"/>
                    <ellipse cx="27" cy="50" rx="7" ry="4" fill="#3a2010" stroke="${dim}" stroke-width="0.8" transform="rotate(-30 27 50)"/>`;
                    break;

                case 'dragon':
                    sprite = `
                    <ellipse cx="50" cy="91" rx="28" ry="5" fill="#000" opacity="0.4"/>
                    <path d="M50 50 Q19 18 7 33 Q14 50 30 56" fill="#180606" stroke="${red}" stroke-width="0.8"/>
                    <path d="M50 50 Q81 18 93 33 Q86 50 70 56" fill="#180606" stroke="${red}" stroke-width="0.8"/>
                    <path d="M50 50 Q30 28 10 36" stroke="${red}" stroke-width="0.4" fill="none" opacity="0.5"/>
                    <path d="M50 50 Q36 26 18 28" stroke="${red}" stroke-width="0.4" fill="none" opacity="0.4"/>
                    <path d="M50 50 Q70 28 90 36" stroke="${red}" stroke-width="0.4" fill="none" opacity="0.5"/>
                    <ellipse cx="50" cy="68" rx="21" ry="18" fill="#1e0606" stroke="${red}" stroke-width="1.2"/>
                    <path d="M41 52 Q45 42 50 38 Q55 42 59 52" fill="#1e0606" stroke="${red}" stroke-width="1"/>
                    <ellipse cx="50" cy="32" rx="15" ry="12" fill="#260a0a" stroke="${red}" stroke-width="1.2"/>
                    <path d="M40 37 Q50 43 60 37" fill="#1e0606" stroke="${red}" stroke-width="0.8"/>
                    <path d="M42 22 L38 11" stroke="${red}" stroke-width="2.2" stroke-linecap="round"/>
                    <path d="M58 22 L62 11" stroke="${red}" stroke-width="2.2" stroke-linecap="round"/>
                    <ellipse cx="42" cy="27" rx="4" ry="5" fill="#080606"/>
                    <ellipse cx="58" cy="27" rx="4" ry="5" fill="#080606"/>
                    <ellipse cx="42" cy="27" rx="2.5" ry="3.5" fill="${flame}" opacity="0.9"/>
                    <ellipse cx="58" cy="27" rx="2.5" ry="3.5" fill="${flame}" opacity="0.9"/>
                    <path d="M42 40 L40 44 M46 41 L45 45 M54 41 L55 45 M58 40 L60 44" stroke="#d8c8a8" stroke-width="1.2" fill="none"/>
                    <path d="M31 80 L27 88 M35 84 L31 92 M39 86 L38 94" stroke="${red}" stroke-width="1.2" fill="none"/>
                    <path d="M69 80 L73 88 M65 84 L69 92 M61 86 L63 94" stroke="${red}" stroke-width="1.2" fill="none"/>`;
                    break;

                case 'knight':
                    sprite = `
                    <ellipse cx="50" cy="91" rx="18" ry="5" fill="#000" opacity="0.3"/>
                    <path d="M38 38 Q34 56 29 87 Q40 90 50 88 Q60 90 71 87 Q66 56 62 38" fill="#180618" stroke="${magic}" stroke-width="0.6"/>
                    <rect x="36" y="52" width="28" height="30" rx="2" fill="#282028" stroke="${dim}" stroke-width="1"/>
                    <path d="M40 56 L50 52 L60 56 L60 72 L50 76 L40 72 Z" fill="#1a1820" stroke="${gold}" stroke-width="0.6" opacity="0.7"/>
                    <rect x="37" y="27" width="26" height="24" rx="2" fill="#282028" stroke="${dim}" stroke-width="1"/>
                    <rect x="37" y="36" width="26" height="8" rx="1" fill="#1a1820" stroke="${gold}" stroke-width="0.6"/>
                    <line x1="39" y1="40" x2="63" y2="40" stroke="${magic}" stroke-width="1.5" opacity="0.8"/>
                    <path d="M39 27 L35 17 L42 22" fill="#282028" stroke="${dim}" stroke-width="0.8"/>
                    <path d="M61 27 L65 17 L58 22" fill="#282028" stroke="${dim}" stroke-width="0.8"/>
                    <line x1="36" y1="55" x2="21" y2="70" stroke="#282028" stroke-width="7" stroke-linecap="round"/>
                    <line x1="17" y1="73" x2="8" y2="91" stroke="${gold}" stroke-width="2.2"/>
                    <line x1="14" y1="76" x2="21" y2="73" stroke="${gold}" stroke-width="1.5"/>
                    <line x1="64" y1="55" x2="77" y2="68" stroke="#282028" stroke-width="7" stroke-linecap="round"/>
                    <path d="M73 62 L85 62 L85 78 L79 84 L73 78 Z" fill="#1a1820" stroke="${gold}" stroke-width="1"/>`;
                    break;

                case 'beast':
                    sprite = `
                    <ellipse cx="50" cy="91" rx="25" ry="5" fill="#000" opacity="0.3"/>
                    <ellipse cx="50" cy="68" rx="24" ry="16" fill="#281606" stroke="#3a2010" stroke-width="1.2"/>
                    <path d="M29 60 Q35 50 50 52 Q65 50 71 60" fill="#1a0e04" stroke="#3a2010" stroke-width="0.6"/>
                    <ellipse cx="29" cy="54" rx="17" ry="13" fill="#301806" stroke="#3a2010" stroke-width="1.2"/>
                    <path d="M19 44 L17 34 L27 41" fill="#281606" stroke="#3a2010" stroke-width="0.8"/>
                    <path d="M39 43 L43 33 L34 41" fill="#281606" stroke="#3a2010" stroke-width="0.8"/>
                    <ellipse cx="19" cy="57" rx="8" ry="6" fill="#261606" stroke="#3a2010" stroke-width="0.8"/>
                    <ellipse cx="27" cy="49" rx="4" ry="3" fill="#080606"/>
                    <ellipse cx="27" cy="49" rx="2.5" ry="2" fill="${flame}" opacity="0.9"/>
                    <path d="M13 60 Q19 66 28 63" fill="#200a06" stroke="#3a2010" stroke-width="0.6"/>
                    <line x1="15" y1="60" x2="13" y2="65" stroke="#d8c8a8" stroke-width="1.5"/>
                    <line x1="21" y1="63" x2="20" y2="68" stroke="#d8c8a8" stroke-width="1.5"/>
                    <path d="M74 62 Q86 50 89 58 Q91 66 80 71" fill="none" stroke="#3a2010" stroke-width="3" stroke-linecap="round"/>
                    <line x1="37" y1="80" x2="34" y2="93" stroke="#281606" stroke-width="7" stroke-linecap="round"/>
                    <line x1="47" y1="82" x2="45" y2="95" stroke="#281606" stroke-width="7" stroke-linecap="round"/>
                    <line x1="60" y1="82" x2="62" y2="95" stroke="#281606" stroke-width="7" stroke-linecap="round"/>
                    <line x1="68" y1="80" x2="72" y2="93" stroke="#281606" stroke-width="7" stroke-linecap="round"/>`;
                    break;

                case 'flyer':
                    sprite = `
                    <ellipse cx="50" cy="92" rx="20" ry="4" fill="#000" opacity="0.2"/>
                    <path d="M50 52 Q28 28 8 38 Q14 56 30 61 Q40 64 50 61" fill="#180620" stroke="${magic}" stroke-width="0.8"/>
                    <path d="M50 52 Q34 33 14 36" stroke="${magic}" stroke-width="0.4" fill="none" opacity="0.5"/>
                    <path d="M50 52 Q38 30 21 30" stroke="${magic}" stroke-width="0.4" fill="none" opacity="0.4"/>
                    <path d="M50 52 Q72 28 92 38 Q86 56 70 61 Q60 64 50 61" fill="#180620" stroke="${magic}" stroke-width="0.8"/>
                    <path d="M50 52 Q66 33 86 36" stroke="${magic}" stroke-width="0.4" fill="none" opacity="0.5"/>
                    <ellipse cx="50" cy="60" rx="11" ry="15" fill="#1e0a28" stroke="${magic}" stroke-width="1"/>
                    <ellipse cx="50" cy="41" rx="11" ry="10" fill="#260c30" stroke="${magic}" stroke-width="1"/>
                    <path d="M41 33 L39 21 L46 29" fill="#1e0a28" stroke="${magic}" stroke-width="0.8"/>
                    <path d="M59 33 L61 21 L54 29" fill="#1e0a28" stroke="${magic}" stroke-width="0.8"/>
                    <circle cx="44" cy="41" r="4" fill="#080606"/>
                    <circle cx="56" cy="41" r="4" fill="#080606"/>
                    <circle cx="44" cy="41" r="2.5" fill="${magic}" opacity="0.8"/>
                    <circle cx="56" cy="41" r="2.5" fill="${magic}" opacity="0.8"/>
                    <path d="M43 49 L41 54" stroke="#d8c8e0" stroke-width="1.5"/>
                    <path d="M57 49 L59 54" stroke="#d8c8e0" stroke-width="1.5"/>
                    <path d="M43 74 L39 83 M44 74 L42 84" stroke="${magic}" stroke-width="1.2"/>
                    <path d="M57 74 L61 83 M56 74 L58 84" stroke="${magic}" stroke-width="1.2"/>`;
                    break;

                case 'mage':
                    sprite = `
                    <ellipse cx="50" cy="91" rx="16" ry="4" fill="#000" opacity="0.3"/>
                    <path d="M38 52 Q34 70 29 89 Q41 93 50 91 Q59 93 71 89 Q66 70 62 52 Z" fill="#1c0828" stroke="${magic}" stroke-width="0.8"/>
                    <path d="M38 52 Q50 57 62 52" fill="none" stroke="${gold}" stroke-width="0.6"/>
                    <rect x="37" y="44" width="26" height="11" rx="2" fill="#240c34" stroke="${magic}" stroke-width="0.8"/>
                    <text x="50" y="52.5" text-anchor="middle" font-size="8" fill="${magic}" opacity="0.8" font-family="serif">✦</text>
                    <ellipse cx="50" cy="31" rx="12" ry="14" fill="#281038" stroke="${magic}" stroke-width="1"/>
                    <path d="M38 27 L50 4 L62 27 Z" fill="#200830" stroke="${magic}" stroke-width="1"/>
                    <ellipse cx="50" cy="27" rx="15" ry="4" fill="#180620" stroke="${magic}" stroke-width="0.8"/>
                    <path d="M50 11 L51.2 8 L52.5 11 L55.5 11.5 L53 13.5 L54 16.5 L51 15 L48 16.5 L49 13.5 L46.5 11.5 Z" fill="${gold}" opacity="0.6"/>
                    <circle cx="43" cy="31" r="3.5" fill="#080606"/>
                    <circle cx="57" cy="31" r="3.5" fill="#080606"/>
                    <circle cx="43" cy="31" r="2" fill="${magic}" opacity="0.9"/>
                    <circle cx="57" cy="31" r="2" fill="${magic}" opacity="0.9"/>
                    <line x1="37" y1="52" x2="22" y2="70" stroke="#240c34" stroke-width="6" stroke-linecap="round"/>
                    <line x1="17" y1="72" x2="11" y2="92" stroke="#3a2010" stroke-width="2"/>
                    <circle cx="17" cy="70" r="6" fill="#200830" stroke="${magic}" stroke-width="1"/>
                    <circle cx="17" cy="70" r="3" fill="${magic}" opacity="0.6"/>
                    <circle cx="24" cy="54" r="1.5" fill="${magic}" opacity="0.7"/>
                    <circle cx="18" cy="61" r="1" fill="${magic}" opacity="0.6"/>`;
                    break;

                case 'golem':
                    sprite = `
                    <ellipse cx="50" cy="92" rx="23" ry="5" fill="#000" opacity="0.4"/>
                    <rect x="29" y="44" width="42" height="44" rx="3" fill="#2a2420" stroke="${dim}" stroke-width="1.5"/>
                    <line x1="31" y1="55" x2="69" y2="55" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
                    <line x1="31" y1="65" x2="69" y2="65" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
                    <line x1="31" y1="75" x2="69" y2="75" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
                    <line x1="42" y1="46" x2="42" y2="88" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
                    <line x1="58" y1="46" x2="58" y2="88" stroke="${dim}" stroke-width="0.4" opacity="0.4"/>
                    <rect x="33" y="22" width="34" height="25" rx="2" fill="#302824" stroke="${dim}" stroke-width="1.5"/>
                    <rect x="36" y="28" width="11" height="9" rx="1" fill="#080606"/>
                    <rect x="53" y="28" width="11" height="9" rx="1" fill="#080606"/>
                    <rect x="37" y="29" width="9" height="7" rx="0.5" fill="${flame}" opacity="0.7"/>
                    <rect x="54" y="29" width="9" height="7" rx="0.5" fill="${flame}" opacity="0.7"/>
                    <path d="M50 24 L48 37 M48 37 L53 44" stroke="${dim}" stroke-width="0.8" opacity="0.6"/>
                    <rect x="8" y="44" width="23" height="14" rx="2" fill="#2a2420" stroke="${dim}" stroke-width="1.2"/>
                    <rect x="69" y="44" width="23" height="14" rx="2" fill="#2a2420" stroke="${dim}" stroke-width="1.2"/>
                    <rect x="6" y="55" width="17" height="15" rx="2" fill="#302824" stroke="${dim}" stroke-width="1.2"/>
                    <rect x="77" y="55" width="17" height="15" rx="2" fill="#302824" stroke="${dim}" stroke-width="1.2"/>`;
                    break;

                default:
                    sprite = `
                    <ellipse cx="50" cy="91" rx="21" ry="5" fill="#000" opacity="0.3"/>
                    <ellipse cx="50" cy="62" rx="23" ry="22" fill="#1a1028" stroke="${magic}" stroke-width="1.5"/>
                    <ellipse cx="50" cy="62" rx="16" ry="16" fill="#200c30" opacity="0.5"/>
                    <path d="M29 70 Q19 75 14 86" stroke="${magic}" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <path d="M33 78 Q27 89 21 96" stroke="${magic}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M50 83 Q50 91 48 99" stroke="${magic}" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <path d="M67 78 Q73 89 79 96" stroke="${magic}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                    <path d="M71 70 Q81 75 86 86" stroke="${magic}" stroke-width="3" fill="none" stroke-linecap="round"/>
                    <circle cx="41" cy="54" r="5.5" fill="#080606"/>
                    <circle cx="59" cy="54" r="5.5" fill="#080606"/>
                    <circle cx="50" cy="65" r="4.5" fill="#080606"/>
                    <circle cx="41" cy="54" r="3.2" fill="${red}" opacity="0.8"/>
                    <circle cx="59" cy="54" r="3.2" fill="${flame}" opacity="0.8"/>
                    <circle cx="50" cy="65" r="2.8" fill="${magic}" opacity="0.8"/>
                    <path d="M37 71 Q50 79 63 71" fill="#080606" stroke="${magic}" stroke-width="0.8"/>
                    <line x1="41" y1="71" x2="39" y2="76" stroke="#d8c8e0" stroke-width="1.2"/>
                    <line x1="47" y1="73" x2="46" y2="78" stroke="#d8c8e0" stroke-width="1.2"/>
                    <line x1="53" y1="73" x2="54" y2="78" stroke="#d8c8e0" stroke-width="1.2"/>
                    <line x1="59" y1="71" x2="61" y2="76" stroke="#d8c8e0" stroke-width="1.2"/>`;
            }

            svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="100" height="100" fill="#060409"/>
            ${bossAura}${enemyLabel}
            ${sprite}
            </svg>`;
            content.style.color = isBossType ? magic : red; break;
        }
    }
    content.innerHTML = svg;
}

// =============================================================
// ログ
// =============================================================

function addLog(message, className = 'log-entry') {
    const el = document.createElement('div');
    el.className = className;
    el.innerHTML = message;
    logContent.appendChild(el);
    exploreScene.scrollTop = exploreScene.scrollHeight;
}

function clearLog() {
    logContent.innerHTML = '';
}

// =============================================================
// アクションボタン状態管理
// =============================================================

function updateActionButtons() {
    const _actionGroup = document.querySelector('.action-group');
    if (!activeDungeon) {
        if (_actionGroup) { _actionGroup.style.setProperty('display', 'none', 'important'); }
        exploreBtn.classList.add('hidden');
        returnBtn.classList.add('hidden');
        return;
    }
    if (_actionGroup) { _actionGroup.style.removeProperty('display'); _actionGroup.classList.remove('hidden'); }

    if (eventState.active && eventState.type === 'console') {
        exploreBtn.disabled    = false;
        exploreBtn.classList.remove('hidden');
        exploreBtn.textContent = '［接続: HP半減/遺物］';
        returnBtn.classList.remove('hidden');
        returnBtn.disabled     = false;
        returnBtn.textContent  = '［ 無視する ］';
        exploreBtn.style.order = '1';
        returnBtn.style.order  = '2';
        exploreBtn.style.fontSize      = '16px';
        exploreBtn.style.letterSpacing = '1px';
        returnBtn.style.fontSize       = '16px';
        returnBtn.style.letterSpacing  = '2px';
        exploreBtn.classList.remove('btn-attack');
        returnBtn.classList.remove('btn-flee');
        exploreScene.classList.remove('battle-mode-bg');
        return;
    }

    // スタイルリセット
    exploreBtn.style.fontSize      = '';
    exploreBtn.style.letterSpacing = '';
    returnBtn.style.fontSize       = '';
    returnBtn.style.letterSpacing  = '';

    if (battleState.active) {
        exploreBtn.disabled    = false;
        exploreBtn.classList.remove('hidden');
        exploreBtn.textContent = '通常攻撃';
        exploreBtn.classList.add('btn-attack');
        returnBtn.classList.remove('hidden');
        returnBtn.disabled    = false;
        returnBtn.textContent = '逃走';
        returnBtn.classList.add('btn-flee');
        exploreScene.classList.add('battle-mode-bg');
        exploreBtn.style.order = '1';
        returnBtn.style.order  = '99';
        const tp = document.getElementById('tensionPanel');
        if (tp) tp.classList.remove('hidden');
        const sp2 = document.getElementById('stackPanel');
        if (sp2) sp2.classList.add('hidden');

        // スキルボタン列を表示
        const skillRow = document.getElementById('skillBtnRow');
        if (skillRow) {
            skillRow.innerHTML = '';
            const learned = combatSkills.filter(s => skillBook[s.id] && skillBook[s.id].learned);
            if (learned.length > 0) {
                skillRow.classList.remove('hidden');
                skillRow.style.display = 'flex';
                learned.forEach(skill => {
                    const lv      = getSkillLevel(skill.id);
                    const entry   = skillBook[skill.id];
                    const next    = getSkillNextThreshold(skill.id);
                    const tooltip = next
                        ? `Lv${lv}  使用:${entry.uses}/${next}`
                        : `Lv${lv} MAX`;
                    const btn = document.createElement('button');
                    btn.className = 'skill-action-btn';
                    btn.title     = tooltip;
                    btn.innerHTML = `${skill.icon}<span class="sk-name">${skill.name}</span><span class="sk-lv">Lv${lv}</span>`;
                    btn.onclick   = () => executeBattleTurn(skill.id);
                    skillRow.appendChild(btn);
                });
            } else {
                skillRow.classList.add('hidden');
                skillRow.style.display = '';
            }
        }
    } else {
        const skillRow = document.getElementById('skillBtnRow');
        if (skillRow) skillRow.classList.add('hidden');
        const tp2 = document.getElementById('tensionPanel');
        if (tp2) tp2.classList.add('hidden');
        if (isBossDefeated) {
            exploreBtn.disabled    = true;
            exploreBtn.classList.remove('hidden');
            exploreBtn.textContent = '［ 最 深 部 ］';
            exploreBtn.style.order = '2';
            returnBtn.style.order  = '1';
        } else {
            exploreBtn.disabled    = false;
            exploreBtn.classList.remove('hidden');
            exploreBtn.textContent = '［ 進 む ］';
            exploreBtn.style.order = '1';
            returnBtn.style.order  = '2';
        }
        exploreBtn.classList.remove('btn-attack');
        returnBtn.classList.remove('hidden');
        returnBtn.disabled    = false;
        returnBtn.textContent = '［ 戻 る ］';
        returnBtn.classList.remove('btn-flee');
        exploreScene.classList.remove('battle-mode-bg');
    }
    if (typeof renderAutoRow === 'function') renderAutoRow();
}



// =============================================================
// メインUI更新
// =============================================================

function formatEq(eq, prop) {
    if (!eq) return '<span style="color:var(--text-dim)">未装備</span>';
    const r  = getRarityInfo(eq);
    const val = eq[prop] || 0;
    return `<span style="color:${r.color}; font-weight:bold">${eq.name}</span> <span style="font-size:11px; color:${r.color}; opacity:0.8">(+${val})</span>`;
}

function updateUI() {
    // プログレスバー
    if (activeDungeon) {
        floorDisplay.textContent = `(Sec:${currentFloor}/${activeDungeon.maxFloor} Step:${stepCount})`;
        progressContainer.style.display = 'flex';

        let totalSteps   = activeDungeon.maxFloor * stepsToNextFloor;
        let currentSteps = (currentFloor - 1) * stepsToNextFloor + stepCount;
        let remainToBoss = Math.max(0, totalSteps - currentSteps);

        distBase.textContent = currentSteps;
        distBoss.textContent = remainToBoss;

        let pct = Math.min(100, (currentSteps / totalSteps) * 100);
        progressBar.style.width = `${pct}%`;

        const color = isBossDefeated ? 'var(--accent-orange)' : 'var(--accent-cyan)';
        progressContainer.querySelector('div').style.color = color;
        progressBar.style.backgroundColor = color;
        progressBar.style.boxShadow = `0 0 5px ${color}`;
    } else {
        progressContainer.style.display = 'none';
    }

    // ステータス
    currentHpDisplay.textContent = currentHp;
    maxHpDisplay.textContent     = maxHp;
    levelDisplay.textContent     = level;
    expDisplay.textContent       = exp;
    nextExpDisplay.textContent   = nextExp;

    // HP ゲージ
    const hpFill = document.getElementById('hpBarFill');
    const hpText = document.getElementById('hpGaugeText');
    if (hpFill && hpText) {
        const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
        hpFill.style.width = hpPct + '%';
        hpFill.style.background = hpPct > 50 ? 'var(--accent-green)' : hpPct > 25 ? 'var(--accent-orange)' : 'var(--danger-red)';
        hpText.textContent = currentHp + '/' + maxHp;
        hpText.style.color = hpPct > 50 ? 'var(--accent-green)' : hpPct > 25 ? 'var(--accent-orange)' : 'var(--danger-red)';
    }
    // EXP ゲージ
    const expFill = document.getElementById('expBarFill');
    const expText = document.getElementById('expGaugeText');
    if (expFill && expText) {
        const expPct = nextExp > 0 ? Math.min(100, (exp / nextExp) * 100) : 0;
        expFill.style.width = expPct + '%';
        expText.textContent = exp + '/' + nextExp;
    }
    attackDisplay.textContent    = getTotalAttack();
    defenseDisplay.textContent   = getTotalDef();
    critDisplay.textContent      = getCritRate();
    if (document.getElementById('speedDisplay')) document.getElementById('speedDisplay').textContent = getTotalSpeed();
    stealDisplay.textContent     = getStealRate();
    stardustDisplay.textContent  = starDust;
    const _meritEl = document.getElementById('meritDisplay'); if (_meritEl) _meritEl.textContent = battleMerit;
    spiritDisplay.innerHTML      = getSpiritText(getTotalSpirits());

    // 空腹バー
    const hungerBar  = document.getElementById('hungerBarFill');
    const hungerText = document.getElementById('hungerText');
    if (hungerBar && hungerText) {
        const hpct = Math.max(0, Math.min(100, (hunger / maxHunger) * 100));
        hungerBar.style.width = hpct + '%';
        if (hunger <= 0)       { hungerBar.style.background = 'var(--danger-red)';   hungerText.style.color = 'var(--danger-red)'; }
        else if (hunger <= 25) { hungerBar.style.background = 'var(--accent-orange)'; hungerText.style.color = 'var(--accent-orange)'; }
        else                   { hungerBar.style.background = '#c8a060';              hungerText.style.color = '#c8a060'; }
        hungerText.textContent = hunger <= 0 ? '飢餓！' : hunger <= 25 ? '空腹…' : `${hunger}`;
    }

    // 渇きバー
    const thirstBar  = document.getElementById('thirstBarFill');
    const thirstText = document.getElementById('thirstText');
    if (thirstBar && thirstText && typeof thirst !== 'undefined') {
        const tpct = Math.max(0, Math.min(100, (thirst / maxThirst) * 100));
        thirstBar.style.width = tpct + '%';
        if (thirst <= 0)       { thirstBar.style.background = '#4488ff'; thirstText.style.color = '#4488ff'; thirstText.textContent = '脱水！'; }
        else if (thirst <= 25) { thirstBar.style.background = '#88aaff'; thirstText.style.color = '#88aaff'; thirstText.textContent = '渇き…'; }
        else                   { thirstBar.style.background = '#6699dd'; thirstText.style.color = '#6699dd'; thirstText.textContent = `${thirst}`; }
    }

    // SPバー
    const spBar  = document.getElementById('spBarFill');
    const spText = document.getElementById('spText');
    if (spBar && spText && typeof sp !== 'undefined') {
        const spPct = Math.max(0, Math.min(100, (sp / maxSp) * 100));
        spBar.style.width = spPct + '%';
        spBar.style.background = spPct > 50 ? '#a050d8' : spPct > 20 ? '#e07828' : '#d83030';
        spText.textContent = sp + '/' + maxSp;
    }

    // 精神ステータム表示
    const spiritStatEl = document.getElementById('spiritStatDisplay');
    if (spiritStatEl) spiritStatEl.textContent = getTotalSpirit();
    // 称号・現型表示
    const titleEl = document.getElementById('activeTitleDisplay');
    if (titleEl) {
        const te = getTitleEffects();
        const hasEffect = Object.keys(te).length > 0;
        const tObj = (typeof titleCatalog !== 'undefined' && equippedTitle) ? titleCatalog.find(t=>t.id===equippedTitle) : null;
        titleEl.textContent = tObj ? `${tObj.icon} ${tObj.name}` : '称号なし';
        titleEl.style.color = tObj ? '#ffd700' : 'var(--text-dim)';
    }
    const archetypeEl = document.getElementById('activeArchetypeDisplay');
    if (archetypeEl) {
        const ar = getArchetypeEffect();
        archetypeEl.textContent = ar ? `${ar.icon} ${ar.name}` : '—';
        archetypeEl.style.color = ar ? 'var(--accent-cyan)' : 'var(--text-dim)';
    }
    const jobEl = document.getElementById('activeJobDisplay');
    if (jobEl && typeof jobCatalog !== 'undefined' && typeof equippedJob !== 'undefined') {
        const jObj = jobCatalog.find(j=>j.id===equippedJob);
        jobEl.textContent = jObj ? `${jObj.icon} ${jObj.name}` : '無職';
        jobEl.style.color = (jObj && jObj.id !== 'none') ? 'var(--accent-green)' : 'var(--text-dim)';
    }

    // テンション表示
    const tensionEl = document.getElementById('tensionDisplay');
    if (tensionEl && typeof tension !== 'undefined') {
        const tLabels = ['1:通常', '2:高揚 ×1.3EXP', '3:狂乱 ×1.8EXP'];
        const tColors = ['var(--text-dim)', 'var(--accent-orange)', 'var(--danger-red)'];
        tensionEl.textContent = tLabels[tension - 1];
        tensionEl.style.color = tColors[tension - 1];
    }

    // 装備欄
    document.getElementById('eqWeapon').innerHTML = formatEq(equipment.weapon, 'atk');
    document.getElementById('eqHelm').innerHTML   = formatEq(equipment.helm,   'def');
    document.getElementById('eqArmor').innerHTML  = formatEq(equipment.armor,  'def');
    document.getElementById('eqShield').innerHTML = formatEq(equipment.shield, 'def');

    // インベントリ
    itemCountDisplay.textContent = inventory.length;
    const _mxd = document.getElementById('maxInventoryDisp');
    if (_mxd) _mxd.textContent = maxInventory;
    const _bld = document.getElementById('labBagDisp');
    if (_bld) _bld.textContent = maxInventory;
    const _blv = document.getElementById('labBagLvDisp');
    if (_blv) _blv.textContent = bagUpgradeLevel;
    const _bcb = document.getElementById('btnUpgradeBag');
    if (_bcb) _bcb.disabled = bagUpgradeLevel >= 5;
    const _bcd = document.getElementById('costBagDisp');
    const bagCosts = [50, 120, 220, 360, 550];
    if (_bcd && bagUpgradeLevel < 5) _bcd.textContent = bagCosts[bagUpgradeLevel];
    if (_bcd && bagUpgradeLevel >= 5) { _bcd.textContent = '―'; }
    inventoryList.innerHTML = '';
    const typeIcons = { weapon: '⚔️', helm: '🪖', armor: '👕', shield: '🛡️' };

    if (inventory.length === 0) {
        inventoryList.innerHTML = '<li class="empty-text">空間は虚無に包まれている</li>';
    } else {
        inventory.forEach((item, index) => {
            const li = document.createElement('li');
            const r  = getRarityInfo(item);
            let statsText = '';
            if (item.atk > 0)  statsText += `ATK+${item.atk} `;
            if (item.def > 0)  statsText += `DEF+${item.def} `;
            if (item.crit)     statsText += `CRI+${item.crit}% `;
            if (item.steal)    statsText += `ABS+${item.steal}% `;
            let spText = getSpiritText(item.spirits);
            if (spText !== '無') statsText += `[${spText}]`;
            if (item.weight) statsText += ` ⚖${item.weight}`;

                // ★ star color override
                const starColor = item.stars === 3 ? '#FFD700' : item.stars === 2 ? '#C0C0C0' : item.stars === 1 ? '#CD7F32' : null;
            li.style.borderLeft = `3px solid ${starColor || r.color}`;
            if (starColor) li.style.boxShadow = `inset 0 0 6px ${starColor}44`;
            if (item.type === 'food') {
                li.style.borderLeft = '3px solid #c8a060';
                li.innerHTML = `
                    <div style="display:flex; flex-direction:column; flex-grow:1; padding-left:6px;">
                        <span class="item-name" style="color:#c8a060">🍖 ${item.name}</span>
                        <span class="item-stats" style="color:#8a7050">満腹度 +${item.hunger}${item.hp ? ' / HP +' + item.hp : ''}</span>
                    </div>
                    <div class="item-actions">
                        <button class="mini-btn" style="border-color:#c8a060;color:#c8a060" onclick="eatFood(${index})">食べる</button>
                    </div>
                `;
            } else if (item.type === 'water') {
                li.style.borderLeft = '3px solid #6699dd';
                li.innerHTML = `
                    <div style="display:flex; flex-direction:column; flex-grow:1; padding-left:6px;">
                        <span class="item-name" style="color:#88ccff">💧 ${item.name}</span>
                        <span class="item-stats" style="color:#6688aa">渇き +${item.thirstRestore}${item.sp ? ' / SP +' + item.sp : ''}</span>
                    </div>
                    <div class="item-actions">
                        <button class="mini-btn" style="border-color:#6699dd;color:#88ccff" onclick="drinkWater(${index})">飲む</button>
                    </div>
                `;
            } else if (item.type === 'sp_potion') {
                li.style.borderLeft = '3px solid #a050d8';
                li.innerHTML = `
                    <div style="display:flex; flex-direction:column; flex-grow:1; padding-left:6px;">
                        <span class="item-name" style="color:#c080ff">✦ ${item.name}</span>
                        <span class="item-stats" style="color:#8060a0">SP +${item.spRestore}</span>
                    </div>
                    <div class="item-actions">
                        <button class="mini-btn" style="border-color:#a050d8;color:#c080ff" onclick="useSpPotion(${index})">使う</button>
                    </div>
                `;
            } else {
                // 装備比較
                let compareHtml = '';
                const cur = equipment[item.type];
                if (cur) {
                    const dAtk = (item.atk || 0) - (cur.atk || 0);
                    const dDef = (item.def || 0) - (cur.def || 0);
                    const parts = [];
                    if (item.atk !== undefined || cur.atk) {
                        const col = dAtk > 0 ? '#6ccb5f' : dAtk < 0 ? '#ff5c5c' : '#888';
                        parts.push(`<span style="color:${col}">ATK ${dAtk >= 0 ? '+' : ''}${dAtk}</span>`);
                    }
                    if (item.def !== undefined || cur.def) {
                        const col = dDef > 0 ? '#6ccb5f' : dDef < 0 ? '#ff5c5c' : '#888';
                        parts.push(`<span style="color:${col}">DEF ${dDef >= 0 ? '+' : ''}${dDef}</span>`);
                    }
                    if (parts.length) compareHtml = `<span style="font-size:11px; margin-left:4px;">[${parts.join(' ')}]</span>`;
                } else {
                    compareHtml = `<span style="font-size:11px; color:#6ccb5f; margin-left:4px;">[新規装備]</span>`;
                }
                li.innerHTML = `
                    <div style="display:flex; flex-direction:column; flex-grow:1; padding-left:6px;">
                        <span class="item-name" style="color:${r.color}">${typeIcons[item.type] || ''} ${item.name}</span>
                        <span class="item-stats">${statsText}<span style="color:${r.color}; opacity:0.75; margin-left:6px;">${r.label}</span>${compareHtml}</span>
                    </div>
                    <div class="item-actions">
                        <button class="mini-btn btn-equip" onclick="equipItem(${index})">装備</button>
                        <button class="mini-btn btn-mix"   onclick="mixItem(${index})">合成</button>
                    </div>
                `;
            }
            inventoryList.appendChild(li);
        });
    }

    // LAB UI
    document.getElementById('labHpDisp').textContent   = permMaxHp;
    document.getElementById('costHpDisp').textContent  = costHp;
    document.getElementById('btnUpgradeHp').disabled   = starDust < costHp;

    document.getElementById('labAtkDisp').textContent  = permBaseAtk;
    document.getElementById('costAtkDisp').textContent = costAtk;
    document.getElementById('btnUpgradeAtk').disabled  = starDust < costAtk;

    document.getElementById('labDefDisp').textContent  = permBaseDef;
    document.getElementById('costDefDisp').textContent = costDef;
    document.getElementById('btnUpgradeDef').disabled  = starDust < costDef;

    // 拠点コンディション UI
    const condEl = document.getElementById('labBaseCondDisp');
    const repairCostEl = document.getElementById('costRepairDisp');
    const btnRepair = document.getElementById('btnRepairBase');
    if (condEl) {
        condEl.textContent = typeof baseCondition !== 'undefined' ? baseCondition : 100;
        condEl.style.color = baseCondition <= 30 ? 'var(--danger-red)' : baseCondition <= 60 ? 'var(--accent-orange)' : 'var(--accent-green)';
    }
    if (repairCostEl) repairCostEl.textContent = typeof costRepairBase !== 'undefined' ? costRepairBase : 20;
    if (btnRepair) btnRepair.disabled = starDust < (typeof costRepairBase !== 'undefined' ? costRepairBase : 20);

    // 遠隔 UI
    const rangeEl = document.getElementById('labRangeDisp');
    const costRangeEl = document.getElementById('costRangeDisp');
    const btnRange = document.getElementById('btnUpgradeRange');
    if (rangeEl) rangeEl.textContent = typeof baseRange !== 'undefined' ? baseRange : 0;
    const rangeCost = 25 + (typeof baseRange !== 'undefined' ? baseRange : 0) * 15;
    if (costRangeEl) costRangeEl.textContent = rangeCost;
    if (btnRange) btnRange.disabled = starDust < rangeCost;

    // メダルAP UI
    const apEl = document.getElementById('labApDisp');
    const apUsedEl = document.getElementById('labApUsedDisp');
    const apCostEl = document.getElementById('costMedalApDisp');
    if (apEl) apEl.textContent = medalApLimit;
    if (apUsedEl && typeof getMedalApUsed === 'function') apUsedEl.textContent = getMedalApUsed();
    if (apCostEl) apCostEl.textContent = costMedalAp;

    // アーカイブ UI
    document.getElementById('statKills').textContent   = stats.kills;
    document.getElementById('statReturns').textContent = stats.returns;
    document.getElementById('statDeaths').textContent  = stats.deaths;

    // ATBゲージ更新
    const atbBarsEl = document.getElementById('atbBars');
    if (atbBarsEl && battleState.active) {
        atbBarsEl.classList.remove('hidden');
        const pPct = Math.min(100, battleState.playerAtb || 0);
        const ePct = Math.min(100, battleState.enemyAtb  || 0);
        document.getElementById('playerAtbFill').style.width = pPct + '%';
        document.getElementById('enemyAtbFill').style.width  = ePct + '%';
        document.getElementById('playerSpdDisp').textContent = 'SPD ' + (battleState.playerSpeed || 10);
        document.getElementById('enemySpdDisp').textContent  = 'SPD ' + (battleState.enemySpeed  || 8);
        const nameEl = document.getElementById('enemyAtbName');
        if (nameEl && battleState.enemy) nameEl.textContent = battleState.enemy.name.slice(0, 5);
        // テンション表示更新
        const tensionBtns = document.querySelectorAll('.tension-btn');
        tensionBtns.forEach((btn, i) => {
            btn.classList.toggle('tension-active', (i + 1) === tension);
        });
        // ゲージ満タン時に攻撃ボタンを光らせる
        const btn = document.getElementById('exploreBtn');
        if (btn) btn.style.boxShadow = pPct >= 100 ? '0 0 12px var(--accent-cyan)' : '';
    } else if (atbBarsEl) {
        atbBarsEl.classList.add('hidden');
        const btn = document.getElementById('exploreBtn');
        if (btn) btn.style.boxShadow = '';
    }

    // 自動セーブ
    saveData();

    // モバイルトップバー更新
    if (typeof updateMobileTopBar === 'function') updateMobileTopBar();
}

// =============================================================
// タブ切替・拠点画面描画
// =============================================================

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.base-panel').forEach(p => p.classList.add('hidden'));

    if (tab === 'map') {
        document.getElementById('tabMap').classList.add('active');
        document.getElementById('panelMap').classList.remove('hidden');
        updateIllustration('base');
    }
    if (tab === 'lab') {
        document.getElementById('tabLab').classList.add('active');
        document.getElementById('panelLab').classList.remove('hidden');
        updateIllustration('lab');
        if (typeof renderMeritShop === 'function') renderMeritShop();
    }
    if (tab === 'shop') {
        const tabShop = document.getElementById('tabShop');
        if (tabShop) tabShop.classList.add('active');
        const panelShop = document.getElementById('panelShop');
        if (panelShop) panelShop.classList.remove('hidden');
        if (typeof renderShop === 'function') renderShop();
        updateIllustration('base');
    }
    if (tab === 'archive') {
        document.getElementById('tabArchive').classList.add('active');
        document.getElementById('panelArchive').classList.remove('hidden');
        updateIllustration('base');
        if (typeof renderSaveSlots === 'function') renderSaveSlots();
    }
    if (tab === 'craft') {
        const tc = document.getElementById('tabCraft');
        if (tc) tc.classList.add('active');
        const pc = document.getElementById('panelCraft');
        if (pc) pc.classList.remove('hidden');
        if (typeof renderCraft === 'function') renderCraft();
        updateIllustration('base');
    }
    if (tab === 'dna') {
        const td = document.getElementById('tabDna');
        if (td) td.classList.add('active');
        const pd = document.getElementById('panelDna');
        if (pd) pd.classList.remove('hidden');
        if (typeof renderDnaPanel === 'function') renderDnaPanel();
        updateIllustration('base');
    }
    if (tab === 'title') {
        const ttl = document.getElementById('tabTitle');
        if (ttl) ttl.classList.add('active');
        const ptl = document.getElementById('panelTitle');
        if (ptl) ptl.classList.remove('hidden');
        if (typeof renderTitlePanel === 'function') renderTitlePanel();
        updateIllustration('base');
    }
    if (tab === 'job') {
        const tj = document.getElementById('tabJob');
        if (tj) tj.classList.add('active');
        const pj = document.getElementById('panelJob');
        if (pj) pj.classList.remove('hidden');
        if (typeof renderJobPanel === 'function') renderJobPanel();
        updateIllustration('base');
    }
    if (tab === 'ai') {
        const tai = document.getElementById('tabAi');
        if (tai) tai.classList.add('active');
        const pai = document.getElementById('panelAi');
        if (pai) pai.classList.remove('hidden');
        if (typeof renderAiPanel === 'function') renderAiPanel();
        updateIllustration('base');
    }
    if (tab === 'trap') {
        const tt = document.getElementById('tabTrap');
        if (tt) tt.classList.add('active');
        const pt = document.getElementById('panelTrap');
        if (pt) pt.classList.remove('hidden');
        if (typeof renderTrapPanel === 'function') renderTrapPanel();
        updateIllustration('base');
    }
    if (tab === 'fish') {
        const tf = document.getElementById('tabFish');
        if (tf) tf.classList.add('active');
        const pf = document.getElementById('panelFish');
        if (pf) pf.classList.remove('hidden');
        if (typeof renderFishing === 'function') renderFishing();
        updateIllustration('base');
    }
}

function renderBaseScene() {
    locationDisplay.textContent = '村';
    floorDisplay.style.display  = 'none';
    switchTab('map');

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };
    updateActionButtons();

    // 星座選択UI
    const constEl = document.getElementById('dungeonList');
    constEl.innerHTML = '';
    if (typeof constellationCatalog !== 'undefined') {
        const constDiv = document.createElement('div');
        constDiv.style.cssText = 'margin-bottom:10px; padding:8px; background:rgba(30,20,60,0.6); border:1px solid #443; border-radius:6px;';
        const active = activeDungeonConstellation || 'none';
        const diffColors = ['var(--text-dim)', 'var(--accent-orange)', 'var(--danger-red)', '#ff4444'];
        constDiv.innerHTML = `<div style="color:var(--accent-cyan);font-size:12px;margin-bottom:6px;">✨ 星座（ダンジョン修飾）<span class="info-icon" onclick="showHelp('星座（ダンジョン修飾）','ダンジョンに難易度バフをかける仕組み。星座を選ぶと敵が強くなる代わりに獲得EXP・ゴールド・素材ドロップ量が増加する。⚠の数が多いほど高難度。なしを選ぶと通常難易度で探索できる。')">ⓘ</span>: <b style="color:#ffd700">${
            constellationCatalog.find(c=>c.id===active)?.name || 'なし'
        }</b></div><div style="display:flex;flex-wrap:wrap;gap:4px;">${
            constellationCatalog.map(c => {
                const sel = c.id === active;
                return `<button class="mini-btn" onclick="selectConstellation('${c.id}')" style="font-size:11px;padding:3px 7px;${sel?'background:rgba(255,215,0,0.15);border-color:#ffd700;color:#ffd700;':''}">${c.icon} ${c.name}${'⚠'.repeat(c.difficulty)}</button>`;
            }).join('')
        }</div>${active !== 'none' ? `<div style="font-size:11px;color:var(--text-dim);margin-top:5px;">${constellationCatalog.find(c=>c.id===active)?.desc || ''}</div>` : ''}`;
        constEl.appendChild(constDiv);
    }

    const list = document.getElementById('dungeonList');
    for (let i = 0; i <= currentProgress && i < dungeons.length; i++) {
        const d          = dungeons[i];
        const totalSteps = d.maxFloor * stepsToNextFloor;
        const btn        = document.createElement('button');
        btn.className    = `dungeon-btn ${i < currentProgress ? 'cleared' : ''}`;
        btn.innerHTML    = `<span>${i + 1}. ${d.name}</span><span style="font-size:13px; color:var(--text-dim)">全${totalSteps}歩</span>`;
        btn.onclick      = () => tryEnterDungeon(i);  // explore.js で定義
        list.appendChild(btn);
    }

    exploreBtn.disabled    = true;
    exploreBtn.textContent = '［ 目 標 を 選 択 ］';
    returnBtn.classList.add('hidden');
    updateIllustration('base');
}