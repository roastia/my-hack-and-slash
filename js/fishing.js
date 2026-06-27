// =============================================================
// fishing.js — 釣りミニゲーム（テキスト選択式）
// =============================================================

let fishingState = {
    active: false,
    phase: 'idle',   // idle / waiting / biting / reeling
    waitTimer: 0,
    rodLevel: 1,     // 釣竿レベル (1-5)
    rodUpgradeCost: 30,
};

const fishCatalog = [
    { name: '雑魚',       hunger: 10, thirst: 0,  sp: 5,  weight: 40, desc: 'どこにでもいる小魚。' },
    { name: 'タフィッシュ', hunger: 20, thirst: 0,  sp: 8,  weight: 30, desc: '硬い鱗を持つ魚。食べ応えがある。' },
    { name: '霊泉魚',      hunger: 15, thirst: 20, sp: 0,  weight: 15, desc: '体内に清水を溜め込んだ幻の魚。' },
    { name: 'SP魚',        hunger: 5,  thirst: 5,  sp: 30, weight: 12, desc: '全身に魔力を帯びた深海魚。' },
    { name: '黄金魚',      hunger: 30, thirst: 10, sp: 20, weight: 8,  desc: '光り輝く希少魚。食べると力が満ちる。' },
    { name: '竜の子魚',    hunger: 50, thirst: 20, sp: 40, weight: 3,  desc: '竜の血を引くとされる伝説の魚。' },
];

function openFishing() {
    fishingState.active = true;
    fishingState.phase  = 'idle';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.base-panel').forEach(p => p.classList.add('hidden'));
    const tabFish = document.getElementById('tabFish');
    if (tabFish) tabFish.classList.add('active');
    const panel = document.getElementById('panelFish');
    if (panel) panel.classList.remove('hidden');
    renderFishing();
}

function closeFishing() {
    fishingState.active = false;
    fishingState.phase  = 'idle';
    const panel = document.getElementById('panelFish');
    if (panel) panel.classList.add('hidden');
    renderBaseScene();
    updateUI();
}

function renderFishing() {
    const panel = document.getElementById('panelFish');
    if (!panel) return;
    panel.classList.remove('hidden');

    const apUsed = getMedalApUsed ? getMedalApUsed() : 0;
    const catchBonus = (fishingState.rodLevel - 1) * 10; // 釣竿Lvで希少魚出やすくなる
    const invFull = inventory.length >= maxInventory;

    let html = `
        <div style="color:var(--accent-cyan); font-size:15px; font-weight:bold; margin-bottom:8px;">🎣 釣り場 <span class="info-icon" onclick="showHelp('釣り','タイミングよくボタンを押してアイテムや食料を釣り上げるミニゲーム。SP5消費で1回挑戦できる。釣り竿をアップグレードするほど良いアイテムが出やすくなる。SP回復ポーション・食料・装備品などが手に入る。')">ⓘ</span></div>
        <div class="lab-desc" style="margin-bottom:10px;">釣竿レベル: <b>${fishingState.rodLevel}</b> / SP: ${sp}/${maxSp}</div>
    `;

    if (fishingState.phase === 'idle') {
        html += `
            <div style="color:var(--text-dim); margin-bottom:10px;">川面は静かだ。糸を垂らすか？</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mini-btn btn-attack" onclick="startFishing()" ${sp < 5 ? 'disabled' : ''}>🎣 糸を垂らす (SP-5)</button>
                <button class="mini-btn" style="border-color:#aa88ff;color:#aa88ff;" onclick="upgradeFishingRod()" ${starDust < fishingState.rodUpgradeCost || fishingState.rodLevel >= 5 ? 'disabled' : ''}>
                    釣竿強化 (G${fishingState.rodUpgradeCost}) ${fishingState.rodLevel >= 5 ? '最大' : ''}
                </button>
                <button class="mini-btn" style="border-color:var(--text-dim);color:var(--text-dim);" onclick="closeFishing()">立ち去る</button>
            </div>
        `;
    } else if (fishingState.phase === 'waiting') {
        html += `
            <div style="color:var(--accent-orange); margin-bottom:10px;">…糸を垂らした。待っている…<br><span style="font-size:11px; color:var(--text-dim)">魚が食いつくのを待て。</span></div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mini-btn btn-attack" onclick="checkBite()">👀 様子を見る</button>
                <button class="mini-btn" style="border-color:var(--text-dim);color:var(--text-dim);" onclick="cancelFishing()">引き上げる（中断）</button>
            </div>
        `;
    } else if (fishingState.phase === 'biting') {
        html += `
            <div style="color:var(--accent-green); font-weight:bold; margin-bottom:10px;">⚡ 魚が食いついた！ 今すぐ引け！</div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="mini-btn btn-attack" onclick="reelIn()" ${invFull ? 'disabled' : ''}>💪 引き上げる！</button>
                <button class="mini-btn" style="border-color:var(--text-dim);color:var(--text-dim);" onclick="missedFish()">（逃した…）</button>
            </div>
            ${invFull ? '<div style="color:var(--danger-red); font-size:12px; margin-top:6px;">荷物が満杯で持てない！</div>' : ''}
        `;
    }

    // 釣果ログ
    html += `<div id="fishingLog" style="margin-top:12px; font-size:13px; min-height:40px; color:var(--text-main);"></div>`;

    panel.innerHTML = html;
}

function startFishing() {
    if (sp < 5) { addFishLog('SPが足りない…'); return; }
    sp -= 5;
    fishingState.phase = 'waiting';
    fishingState.waitTimer = 1 + Math.floor(Math.random() * 3); // 1-3回待ち
    addFishLog('糸を垂らした。川面をじっと見つめる…');
    renderFishing();
    updateUI();
}

function checkBite() {
    fishingState.waitTimer--;
    if (fishingState.waitTimer <= 0 || Math.random() < 0.45) {
        fishingState.phase = 'biting';
        addFishLog('ピクッ！ 浮きが沈んだ！');
    } else {
        addFishLog(['…何も来ない。','…波紋だけが広がる。','…静寂。もう少し待て。'][Math.floor(Math.random()*3)]);
    }
    renderFishing();
}

function cancelFishing() {
    fishingState.phase = 'idle';
    addFishLog('糸を引き上げた。今日は釣れなかった…');
    renderFishing();
}

function missedFish() {
    fishingState.phase = 'idle';
    addFishLog('逃げられた！ 素早い魚だ。');
    renderFishing();
}

function reelIn() {
    if (inventory.length >= maxInventory) { addFishLog('荷物が満杯だ！'); return; }

    // 釣竿Lvで重み調整
    const lvBonus = (fishingState.rodLevel - 1) * 5;
    const totalWeight = fishCatalog.reduce((s, f, i) => s + Math.max(1, f.weight - (i >= 3 ? -lvBonus : 0)), 0);
    let roll = Math.random() * totalWeight;
    let caught = fishCatalog[0];
    for (const f of fishCatalog) {
        const w = Math.max(1, f.weight - (fishCatalog.indexOf(f) >= 3 ? -lvBonus : 0));
        roll -= w;
        if (roll <= 0) { caught = f; break; }
    }

    const fish = {
        name:  `【${caught.name}】`,
        type:  'food',
        hunger: caught.hunger,
        thirstRestore: caught.thirst,
        sp:    caught.sp,
        desc:  caught.desc,
    };
    inventory.push(fish);
    addFishLog(`🐟 <span style="color:var(--accent-cyan); font-weight:bold;">${caught.name}</span> を釣り上げた！ (HP回復+${caught.hunger}${caught.thirst>0?' 渇き+'+caught.thirst:''}${caught.sp>0?' SP+'+caught.sp:''})`);
    fishingState.phase = 'idle';
    saveData();
    renderFishing();
    updateUI();
}

function upgradeFishingRod() {
    if (fishingState.rodLevel >= 5) { addFishLog('釣竿は既に最高レベルだ。'); return; }
    if (starDust < fishingState.rodUpgradeCost) { addFishLog(`ゴールドが足りない。（必要: G${fishingState.rodUpgradeCost}）`); return; }
    starDust -= fishingState.rodUpgradeCost;
    fishingState.rodLevel++;
    fishingState.rodUpgradeCost = Math.floor(fishingState.rodUpgradeCost * 2.0);
    addFishLog(`🎣 釣竿が強化された！ Lv${fishingState.rodLevel} になった。希少魚が釣れやすくなる。`);
    saveData();
    renderFishing();
    updateUI();
}

function addFishLog(msg) {
    const el = document.getElementById('fishingLog');
    if (el) el.innerHTML = msg;
}
