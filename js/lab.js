// =============================================================
// lab.js — 拠点LAB（永続強化）
// =============================================================

function upgradeHp() {
    if (starDust >= costHp) {
        starDust  -= costHp;
        permMaxHp += 10;
        costHp     = Math.floor(costHp * 1.5);
        maxHp     += 10;
        currentHp += 10;
        addLog(`>> 体力を鍛えた。最大HPが上昇した！`, 'log-entry mix-text');
        updateUI();
    }
}

function upgradeAtk() {
    if (starDust >= costAtk) {
        starDust     -= costAtk;
        permBaseAtk  += 2;
        costAtk       = Math.floor(costAtk * 1.6);
        baseAttack   += 2;
        addLog(`>> 攻撃力を鍛えた。ATKが上昇した！`, 'log-entry mix-text');
        updateUI();
    }
}

function upgradeDef() {
    if (starDust >= costDef) {
        starDust     -= costDef;
        permBaseDef  += 2;
        costDef       = Math.floor(costDef * 1.6);
        baseDefense  += 2;
        addLog(`>> 防御力を鍛えた。DEFが上昇した！`, 'log-entry mix-text');
        updateUI();
    }
}

function upgradeMedalAp() {
    if (starDust >= costMedalAp) {
        starDust     -= costMedalAp;
        medalApLimit += 5;
        costMedalAp   = Math.floor(costMedalAp * 2.0);
        addLog(`>> メダルAPの上限が拡張された！ AP上限: ${medalApLimit}`, 'log-entry mix-text');
        updateUI();
        renderLab();
    }
}

function upgradeRange() {
    const cost = 25 + baseRange * 15;
    if (starDust >= cost) {
        starDust  -= cost;
        baseRange += 2;
        addLog(`>> 遠隔技術を鍛えた。遠隔ATKが上昇した！`, 'log-entry mix-text');
        updateUI();
        renderLab();
    } else {
        addLog(`<span class="damage-text">ゴールドが足りない。（必要: G${cost}）</span>`);
    }
}

function repairBase() {
    if (baseCondition >= 100) {
        addLog(`>> 拠点は既に万全の状態だ。`);
        return;
    }
    if (starDust < costRepairBase) {
        addLog(`<span class="damage-text">ゴールドが足りない。（必要: G${costRepairBase}）</span>`);
        return;
    }
    starDust -= costRepairBase;
    const repairAmt = Math.min(100 - baseCondition, 25);
    baseCondition += repairAmt;
    costRepairBase = Math.max(10, Math.floor(costRepairBase * (baseCondition < 50 ? 1.0 : 1.3)));
    addLog(`>> 拠点を修繕した。コンディション: ${baseCondition}/100`, 'log-entry mix-text');
    updateUI();
    renderLab();
}

// ============================================================
// DNA突然変異パネル
// ============================================================
function renderDnaPanel() {
    const panel = document.getElementById('panelDna');
    if (!panel) return;

    const equippedCount = mutations.length;
    const slotMax = mutationSlots;
    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:3px;">
        <span style="color:var(--accent-cyan);font-size:13px;">🧬 DNA突然変異 <span class="info-icon" onclick="showHelp('DNA突然変異','ダンジョンで入手したDNAを消費して突然変異を解放・装備できる。装備スロット数はmutationSlotsに依存し、一定の組み合わせで強力なシナジー（現型）が発動する。DNAは敵を倒すたびに一定確率でドロップする。')">ⓘ</span></span>
        <span style="margin-left:8px;">装備中: <b style="color:var(--accent-cyan)">${equippedCount}/${slotMax}</b></span>
    </div>`;

    mutationCatalog.forEach(mut => {
        const have      = dnaCounts[mut.req.type] || 0;
        const need      = mut.req.count;
        const unlocked  = have >= need;
        const isEquipped = mutations.includes(mut.id);
        const pct       = Math.min(100, Math.floor(have / need * 100));

        let btnHtml = '';
        if (!unlocked) {
            btnHtml = `<span style="color:var(--text-disabled);font-size:11px;">未解除</span>`;
        } else if (isEquipped) {
            btnHtml = `<button class="mini-btn btn-equipped" onclick="toggleMutation('${mut.id}')">✓ 装備中</button>`;
        } else if (mutations.length < slotMax) {
            btnHtml = `<button class="mini-btn btn-equip" onclick="toggleMutation('${mut.id}')">装備する</button>`;
        } else {
            btnHtml = `<button class="mini-btn" disabled style="opacity:0.5;">スロット満杯</button>`;
        }

        html += `
        <div class="lab-item" style="${isEquipped ? 'border-color:var(--accent-cyan);background:rgba(96,205,255,0.05);' : ''}">
            <div style="flex:1;">
                <div style="font-weight:bold;">${mut.icon} ${mut.name} <span style="color:var(--accent-green);font-size:12px;">${mut.desc}</span></div>
                <div class="lab-desc">${mut.req.type} 討伐: ${have}/${need}
                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:100px;margin-top:1px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${unlocked?'var(--accent-cyan)':'var(--accent-magenta)'};border-radius:100px;transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>
            <div>${btnHtml}</div>
        </div>`;
    });

    panel.innerHTML = html;
}

function toggleMutation(id) {
    const idx = mutations.indexOf(id);
    if (idx >= 0) {
        mutations.splice(idx, 1);
        addLog(`<span style="color:var(--accent-magenta)">🧬 変異「${mutationCatalog.find(m=>m.id===id)?.name}」を外した。</span>`);
    } else {
        if (mutations.length >= mutationSlots) { addLog('変異スロットが満杯です！'); return; }
        const mut = mutationCatalog.find(m => m.id === id);
        if (!mut) return;
        if ((dnaCounts[mut.req.type] || 0) < mut.req.count) { addLog('DNAが足りません。'); return; }
        mutations.push(id);
        addLog(`<span style="color:var(--accent-cyan)">🧬 変異「${mut.name}」を装備した！ ${mut.desc}</span>`);
    }
    saveData();
    renderDnaPanel();
    updateUI();
}

// ============================================================
// 拠点トラップパネル
// ============================================================
function renderTrapPanel() {
    const panel = document.getElementById('panelTrap');
    if (!panel) return;

    const placed = traps.length;
    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:3px;">
        <span style="color:var(--accent-orange);font-size:13px;">🪤 拠点トラップ <span class="info-icon" onclick="showHelp('拠点トラップ','拠点に罠を設置しておくと、次のダンジョン探索で戦闘突入時に先制ダメージを与えられる。素材を消費して工房で作成する。設置できる数に上限あり。')">ⓘ</span></span>
        <span style="margin-left:8px;">設置中: <b style="color:var(--accent-orange)">${placed}/${MAX_TRAPS}</b></span>
    </div>`;

    // 設置済みトラップ
    if (traps.length > 0) {
        html += `<div style="font-size:11px;color:var(--text-dim);margin-bottom:3px;">── 設置済みトラップ ──</div>`;
        traps.forEach((t, i) => {
            html += `<div class="lab-item" style="border-color:rgba(255,215,0,0.2);">
                <div><b>${t.icon||'🪤'} ${t.name}</b> <span class="lab-desc">残り使用回数: ${t.usesLeft}</span></div>
                <button class="mini-btn" style="color:var(--danger-red);border-color:var(--danger-red);" onclick="removeTrap(${i})">撤去</button>
            </div>`;
        });
    }

    // 購入ショップ
    html += `<div style="font-size:11px;color:var(--text-dim);margin:8px 0 4px;">── トラップ購入 (G消費) ──</div>`;
    trapCatalog.forEach(t => {
        const _tMastery = (typeof trapUseCounts !== 'undefined') ? Math.floor((trapUseCounts[t.id] || 0) / 5) : 0;
        const _tUseTotal= (typeof trapUseCounts !== 'undefined') ? (trapUseCounts[t.id] || 0) : 0;
        const _tMasteryBadge = _tMastery > 0
            ? `<span style="color:#aaffcc;font-size:11px"> 熟練Lv${_tMastery}(+${_tMastery*20}%dmg)</span>` : '';
        const canBuy = starDust >= t.cost && traps.length < MAX_TRAPS;
        html += `<div class="lab-item">
            <div><b>${t.icon||'🪤'} ${t.name}</b>${_tMasteryBadge} <span class="lab-desc">${t.desc} / G${t.cost}${_tUseTotal>0?' / 累計'+_tUseTotal+'回':''}</span></div>
            <button class="mini-btn btn-equip" onclick="buyTrap('${t.id}')" ${canBuy ? '' : 'disabled'}>購入</button>
        </div>`;
    });

    panel.innerHTML = html;
}

function buyTrap(id) {
    const tpl = trapCatalog.find(t => t.id === id);
    if (!tpl) return;
    if (starDust < tpl.cost) { addLog('ゴールドが足りない！'); return; }
    if (traps.length >= MAX_TRAPS) { addLog(`トラップは${MAX_TRAPS}個まで設置できます。`); return; }
    starDust -= tpl.cost;
    traps.push({ id: tpl.id, name: tpl.name, icon: tpl.icon, dmgBase: tpl.dmgBase, usesLeft: tpl.uses, ignoresDef: tpl.ignoresDef });
    addLog(`<span style="color:var(--accent-orange)">🪤 ${tpl.name} を設置した！ 次の戦闘で発動する。</span>`);
    saveData();
    renderTrapPanel();
    updateUI();
}

function removeTrap(idx) {
    if (idx < 0 || idx >= traps.length) return;
    const name = traps[idx].name;
    traps.splice(idx, 1);
    addLog(`🪤 ${name} を撤去した。`);
    saveData();
    renderTrapPanel();
}


// =============================================================
// 武勲ショップ
// =============================================================
const meritShopItems = [
    // ── stat: 恒久ステータス強化 ──────────────────────────────────────
    { id: 'ms_maxhp',    name: '最大HP+10',         cost: 20, desc: '最大HPを永続+10',              icon: '❤', type: 'stat' },
    { id: 'ms_sp',       name: 'SP最大値+10',        cost: 15, desc: 'SP上限を永続+10',              icon: '✦', type: 'stat' },
    { id: 'ms_sp20',     name: 'SP最大値+20',        cost: 25, desc: 'SP上限を永続+20',              icon: '✦✦', type: 'stat' },
    { id: 'ms_atk',      name: 'ATK+3',             cost: 25, desc: '攻撃力を永続+3',               icon: '⚔', type: 'stat' },
    { id: 'ms_def',      name: 'DEF+3',             cost: 20, desc: '防御力を永続+3',               icon: '🛡', type: 'stat' },
    { id: 'ms_spd',      name: '素早さ+3',           cost: 20, desc: '素早さを永続+3',               icon: '💨', type: 'stat' },
    { id: 'ms_crit',     name: '会心率+5%',          cost: 30, desc: '会心率を永続+5%',              icon: '💥', type: 'stat' },
    { id: 'ms_spirit',   name: '精神+5',             cost: 20, desc: '精神を永続+5',                icon: '🔮', type: 'stat' },
    { id: 'ms_medalap',  name: 'メダルAP+2',         cost: 40, desc: 'メダル装備APを永続+2',         icon: '🏅', type: 'stat' },
    { id: 'ms_bagup',    name: '所持枠+5',           cost: 35, desc: '所持品上限を永続+5',           icon: '🎒', type: 'stat' },
    // ── use: 消費効果 ─────────────────────────────────────────────────
    { id: 'ms_heal',     name: 'HP全回復',           cost: 10, desc: 'HPを100%回復する',             icon: '💊', type: 'use' },
    { id: 'ms_sp_rest',  name: 'SP全回復',           cost: 12, desc: 'SPを100%回復する',             icon: '🔋', type: 'use' },
    { id: 'ms_hunger',   name: '満腹度全回復',        cost: 8,  desc: '満腹度を最大まで回復',         icon: '🍖', type: 'use' },
    { id: 'ms_thirst',   name: '渇き全回復',          cost: 8,  desc: '渇きを最大まで回復',           icon: '💧', type: 'use' },
    { id: 'ms_mat3',     name: '全素材×3取得',        cost: 8,  desc: '全素材を3個ずつ追加',          icon: '🌿', type: 'use' },
    { id: 'ms_mat10',    name: '全素材×10取得',       cost: 18, desc: '全素材を10個ずつ追加',         icon: '🌿🌿', type: 'use' },
    { id: 'ms_gold100',  name: 'ゴールド+100',        cost: 15, desc: 'ゴールドを100増加',            icon: '💰', type: 'use' },
    { id: 'ms_gold500',  name: 'ゴールド+500',        cost: 50, desc: 'ゴールドを500増加',            icon: '💎', type: 'use' },
    { id: 'ms_revive',   name: '次戦自動復活',         cost: 30, desc: '次戦で力尽きた際HP50%で復活', icon: '🌟', type: 'use' },
    // ── buff: 次戦バフ ────────────────────────────────────────────────
    { id: 'ms_expx2',    name: 'EXP2倍(次戦)',       cost: 20, desc: '次戦の獲得EXPが2倍',           icon: '📚', type: 'buff' },
    { id: 'ms_frenzy',   name: 'テンション狂乱(次戦)', cost: 25, desc: '次戦開始時テンション狂乱固定', icon: '🔥', type: 'buff' },
    { id: 'ms_atkbuff',  name: 'ATK2倍(次戦)',       cost: 30, desc: '次戦の攻撃力が2倍',            icon: '⚡', type: 'buff' },
    { id: 'ms_shield',   name: '被ダメ半減(次戦)',    cost: 30, desc: '次戦の受けるダメージが50%減',   icon: '🛡', type: 'buff' },
    { id: 'ms_crithigh', name: '会心率100%(次戦)',    cost: 35, desc: '次戦の会心率が100%',           icon: '🎯', type: 'buff' },
    { id: 'ms_nospend',  name: 'SP消費0(次戦)',       cost: 40, desc: '次戦のSP消費が0',              icon: '✨', type: 'buff' },
    { id: 'ms_spdbuff',  name: '素早さ2倍(次戦)',     cost: 25, desc: '次戦の素早さが2倍',            icon: '💨', type: 'buff' },
    // ── perm: 永久解放 ────────────────────────────────────────────────
    { id: 'ms_dnaslot',  name: 'DNA変異スロット+1',   cost: 50, desc: 'DNA変異スロットを永久+1',      icon: '🧬', type: 'perm' },
    { id: 'ms_dnaslot2', name: 'DNA変異スロット+2',   cost: 90, desc: 'DNA変異スロットを永久+2',      icon: '🧬🧬', type: 'perm' },
    { id: 'ms_trapboost',name: 'トラップ威力+20%',    cost: 40, desc: 'トラップの基礎ダメージ永続+20%',icon: '🕸', type: 'perm' },
    { id: 'ms_jobboost', name: 'ジョブ習熟速度+50%',  cost: 45, desc: 'ジョブ討伐カウントが1.5倍',    icon: '🔧', type: 'perm' },
];

function renderMeritShop() {
    const listEl = document.getElementById('meritShopList');
    const countEl = document.getElementById('meritShopCount');
    if (!listEl) return;
    if (countEl) countEl.textContent = `(武勲: ${battleMerit})`;

    let html = '';
    meritShopItems.forEach(item => {
        const canBuy = battleMerit >= item.cost;
        const typeColor = item.type === 'perm' ? '#aa88ff' : item.type === 'buff' ? '#ffa040' : item.type === 'stat' ? '#6ccb5f' : '#60cdff';
        html += `<div class="lab-item" style="opacity:${canBuy ? '1' : '0.5'}; margin-bottom:3px;">
            <div style="flex:1; font-size:13px;"><span style="color:${typeColor};">${item.icon} ${item.name}</span> <span class="lab-desc">${item.desc}</span></div>
            <button class="mini-btn" style="border-color:${typeColor};color:${typeColor}; font-size:12px; padding:4px 8px; flex-shrink:0;"
                onclick="buyMeritShopItem('${item.id}')" ${canBuy ? '' : 'disabled'}>
                ⚔${item.cost}
            </button>
        </div>`;
    });
    listEl.innerHTML = html;
}

function buyMeritShopItem(id) {
    const item = meritShopItems.find(i => i.id === id);
    if (!item) return;
    if (battleMerit < item.cost) { addLog('武勲が足りない！'); return; }
    battleMerit -= item.cost;

    // stat系
    if (id === 'ms_maxhp') {
        permMaxHp += 10; maxHp = permMaxHp; currentHp = Math.min(currentHp + 10, maxHp);
        addLog(`<span style="color:#6ccb5f">❤ 最大HPが10増加した！(${maxHp})</span>`);
    } else if (id === 'ms_sp') {
        maxSp += 10; sp = Math.min(sp, maxSp);
        addLog(`<span style="color:#60cdff">✦ SP最大値が10増加した！(${maxSp})</span>`);
    } else if (id === 'ms_sp20') {
        maxSp += 20; sp = Math.min(sp, maxSp);
        addLog(`<span style="color:#60cdff">✦✦ SP最大値が20増加した！(${maxSp})</span>`);
    } else if (id === 'ms_atk') {
        permBaseAtk += 3; baseAttack = permBaseAtk;
        addLog(`<span style="color:var(--accent-cyan)">⚔ 攻撃力が永続+3！(${getTotalAttack()})</span>`);
    } else if (id === 'ms_def') {
        permBaseDef += 3; baseDefense = permBaseDef;
        addLog(`<span style="color:var(--accent-cyan)">🛡 防御力が永続+3！(${getTotalDef()})</span>`);
    } else if (id === 'ms_spd') {
        baseSpeed += 3;
        addLog(`<span style="color:var(--accent-cyan)">💨 素早さが永続+3！(${baseSpeed})</span>`);
    } else if (id === 'ms_crit') {
        if (typeof equipment.weapon !== 'undefined' || true) { window._meritCritBonus = (window._meritCritBonus || 0) + 5; }
        addLog(`<span style="color:#ffa040">💥 会心率が永続+5%！</span>`);
    } else if (id === 'ms_spirit') {
        baseSpirit += 5;
        addLog(`<span style="color:#88aaff">🔮 精神が永続+5！(${baseSpirit})</span>`);
    } else if (id === 'ms_medalap') {
        medalApLimit += 2;
        addLog(`<span style="color:#ffd700">🏅 メダルAP上限が${medalApLimit}に増加した！</span>`);
    } else if (id === 'ms_bagup') {
        bagUpgradeLevel = (bagUpgradeLevel || 0) + 1; maxInventory = 10 + bagUpgradeLevel * 5;
        addLog(`<span style="color:#c8a060">🎒 所持品枠が${maxInventory}に増加した！</span>`);
    // use系
    } else if (id === 'ms_heal') {
        currentHp = maxHp;
        addLog(`<span style="color:#6ccb5f">💊 HPが全回復した！</span>`);
    } else if (id === 'ms_sp_rest') {
        sp = maxSp;
        addLog(`<span style="color:#60cdff">🔋 SPが全回復した！(${sp})</span>`);
    } else if (id === 'ms_hunger') {
        hunger = maxHunger;
        addLog(`<span style="color:#c8a060">🍖 満腹度が全回復した！</span>`);
    } else if (id === 'ms_thirst') {
        thirst = maxThirst;
        addLog(`<span style="color:#88ccff">💧 渇きが全回復した！</span>`);
    } else if (id === 'ms_mat3') {
        craftMaterialTypes.forEach(m => { materials[m] = (materials[m] || 0) + 3; });
        addLog(`<span style="color:#aaffaa">🌿 全素材が3個ずつ追加された！</span>`);
    } else if (id === 'ms_mat10') {
        craftMaterialTypes.forEach(m => { materials[m] = (materials[m] || 0) + 10; });
        addLog(`<span style="color:#aaffaa">🌿🌿 全素材が10個ずつ追加された！</span>`);
    } else if (id === 'ms_gold100') {
        starDust += 100;
        addLog(`<span style="color:#ffd700">💰 ゴールドが100増加した！(${starDust}G)</span>`);
    } else if (id === 'ms_gold500') {
        starDust += 500;
        addLog(`<span style="color:#ffd700">💎 ゴールドが500増加した！(${starDust}G)</span>`);
    } else if (id === 'ms_revive') {
        window._meritReviveNext = true;
        addLog(`<span style="color:#ffffaa">🌟 次戦で力尽きてもHP50%で復活する！</span>`);
    // buff系
    } else if (id === 'ms_expx2') {
        window._meritExpDouble = true;
        addLog(`<span style="color:#ffa040">📚 次戦の獲得EXPが2倍になる！</span>`);
    } else if (id === 'ms_frenzy') {
        window._meritFrenzyNext = true;
        addLog(`<span style="color:#ffa040">🔥 次戦のテンションが「狂乱」に固定される！</span>`);
    } else if (id === 'ms_atkbuff') {
        window._meritAtkDouble = true;
        addLog(`<span style="color:var(--accent-cyan)">⚡ 次戦の攻撃力が2倍になる！</span>`);
    } else if (id === 'ms_shield') {
        window._meritShieldNext = true;
        addLog(`<span style="color:#88ccff">🛡 次戦の被ダメージが半減する！</span>`);
    } else if (id === 'ms_crithigh') {
        window._meritCritMax = true;
        addLog(`<span style="color:#ffa040">🎯 次戦の会心率が100%になる！</span>`);
    } else if (id === 'ms_nospend') {
        window._meritNoSpCost = true;
        addLog(`<span style="color:#aa88ff">✨ 次戦のSP消費が0になる！</span>`);
    } else if (id === 'ms_spdbuff') {
        window._meritSpdDouble = true;
        addLog(`<span style="color:#88ccff">💨 次戦の素早さが2倍になる！</span>`);
    // perm系
    } else if (id === 'ms_dnaslot') {
        mutationSlots = (mutationSlots || 3) + 1;
        addLog(`<span style="color:#aa88ff">🧬 DNA変異スロットが${mutationSlots}に増加した！</span>`);
        if (typeof renderDnaPanel === 'function') renderDnaPanel();
    } else if (id === 'ms_dnaslot2') {
        mutationSlots = (mutationSlots || 3) + 2;
        addLog(`<span style="color:#aa88ff">🧬🧬 DNA変異スロットが${mutationSlots}に増加した！</span>`);
        if (typeof renderDnaPanel === 'function') renderDnaPanel();
    } else if (id === 'ms_trapboost') {
        window._meritTrapBoost = (window._meritTrapBoost || 0) + 20;
        addLog(`<span style="color:#ffaa44">🕸 トラップ威力が永続+20%！(累計+${window._meritTrapBoost}%)</span>`);
    } else if (id === 'ms_jobboost') {
        window._meritJobBoost = true;
        addLog(`<span style="color:#aaffaa">🔧 ジョブ習熟速度が1.5倍になった！</span>`);
    }

    saveData();
    renderMeritShop();
    updateUI();
}

// =============================================================
// 称号パネル
// =============================================================
function checkTitleUnlocks() {
    if (typeof titleCatalog === 'undefined' || typeof unlockedTitles === 'undefined') return;
    let newUnlock = false;
    titleCatalog.forEach(t => {
        if (!unlockedTitles.includes(t.id) && t.unlockFn && t.unlockFn()) {
            unlockedTitles.push(t.id);
            addLog(`<span style="color:#ffd700">🏆 称号【${t.icon} ${t.name}】を解除した！</span>`);
            if (typeof showBanner === 'function') showBanner('🏆 称号解除！', '#ffd700', t.icon + ' ' + t.name);
            newUnlock = true;
        }
    });
    return newUnlock;
}

function equipTitle(id) {
    if (!unlockedTitles.includes(id)) return;
    equippedTitle = (equippedTitle === id) ? null : id;
    saveData();
    renderTitlePanel();
    updateUI();
    const t = titleCatalog.find(x => x.id === id);
    if (t) addLog(`<span style="color:#ffd700">🏆 称号【${t.icon} ${t.name}】を${equippedTitle === id ? '装備した！' : '外した。'}</span>`);
}

function renderTitlePanel() {
    const panel = document.getElementById('panelTitle');
    if (!panel) return;
    if (typeof titleCatalog === 'undefined') return;

    const equipped = equippedTitle;
    const unlocked = unlockedTitles || ['nameless'];

    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:5px;">
        <span style="color:#ffd700;font-size:13px;">🏆 称号（二つ名） <span class="info-icon" onclick="showHelp('称号（二つ名）','特定の条件を達成すると称号がアンロックされる。装備するとATK/DEF/SPD/CRITなどのステータスにボーナスが付く。一度に1つだけ装備可能。')">ⓘ</span></span>
        <span style="margin-left:8px;">装備中: <b style="color:#ffd700">${equipped ? titleCatalog.find(t=>t.id===equipped)?.name || 'なし' : 'なし'}</b></span>
    </div>`;

    const stars = ['', '★', '★★', '★★★'];
    titleCatalog.forEach(t => {
        const isUnlocked = unlocked.includes(t.id);
        const isEquipped = equipped === t.id;

        // エフェクト文字列を生成
        const eff = t.effects;
        const effParts = [];
        if (eff.atkMult)    effParts.push(`<span style="color:${eff.atkMult>1?'var(--accent-cyan)':'var(--danger-red)'}">ATK×${eff.atkMult}</span>`);
        if (eff.defMult)    effParts.push(`<span style="color:${eff.defMult>1?'var(--accent-cyan)':'var(--danger-red)'}">DEF×${eff.defMult}</span>`);
        if (eff.spdBonus)   effParts.push(`<span style="color:var(--accent-cyan)">SPD+${eff.spdBonus}</span>`);
        if (eff.spdMult)    effParts.push(`<span style="color:var(--accent-cyan)">SPD×${eff.spdMult}</span>`);
        if (eff.critBonus)  effParts.push(`<span style="color:var(--accent-orange)">会心+${eff.critBonus}%</span>`);
        if (eff.stealBonus) effParts.push(`<span style="color:var(--accent-green)">奪取+${eff.stealBonus}%</span>`);
        if (eff.spiritBonus)effParts.push(`<span style="color:#aa88ff">精神+${eff.spiritBonus}</span>`);
        if (eff.magicMult)  effParts.push(`<span style="color:#aa88ff">魔法×${eff.magicMult}</span>`);
        if (eff.expMult)    effParts.push(`<span style="color:var(--accent-orange)">EXP×${eff.expMult}</span>`);

        const effText = effParts.length > 0 ? effParts.join(' / ') : '<span style="color:var(--text-dim)">効果なし</span>';

        if (!isUnlocked) {
            html += `<div class="lab-item" style="opacity:0.5">
                <div>
                    <div style="font-weight:bold;color:var(--text-dim)">${t.icon} ${t.name}</div>
                    <div class="lab-desc">${t.desc}</div>
                    <div class="lab-desc" style="color:var(--accent-orange)">🔒 解除条件: ${t.unlockHint}</div>
                </div>
            </div>`;
        } else {
            html += `<div class="lab-item" style="${isEquipped ? 'border-color:#ffd700;background:rgba(255,215,0,0.07);' : ''}">
                <div style="flex:1">
                    <div style="font-weight:bold;color:${isEquipped ? '#ffd700' : 'var(--text-main)'}">${t.icon} ${t.name}${isEquipped ? ' ✓ 装備中' : ''}</div>
                    <div class="lab-desc">${t.desc}</div>
                    <div class="lab-desc" style="margin-top:1px">${effText}</div>
                </div>
                <button class="mini-btn ${isEquipped ? 'btn-equipped' : 'btn-equip'}" onclick="equipTitle('${t.id}')">
                    ${isEquipped ? '外す' : '装備する'}
                </button>
            </div>`;
        }
    });
    panel.innerHTML = html;
}

// =============================================================
// カスタムAI設定パネル
// =============================================================
function renderAiPanel() {
    const panel = document.getElementById('panelAi');
    if (!panel) return;

    const priority = (typeof customAiPriority !== 'undefined') ? customAiPriority : ['normal'];
    const aiHeaderHtml = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:5px;">
        <span style="color:var(--accent-cyan);font-size:13px;">🤖 カスタムAI <span class="info-icon" onclick="showHelp('カスタムAI','自動戦闘で使うスキルの優先順位を設定できる。▲▼で順番を入れ替え、上にあるほど優先して使用される。発動条件を満たせない場合は次の順位のスキルに移る。')">ⓘ</span></span>
    </div>`;
    const skillNames = {
        healingWave: '✦ 回復術',
        powerStrike: '💥 渾身の一撃',
        rapidStrike: '⚔ 連撃',
        guardStance: '🛡 鉄壁',
        normal:      '⚡ 通常攻撃'
    };
    const skillDescs = {
        healingWave: 'HP50%未満の時のみ発動',
        powerStrike: '高威力の一撃',
        rapidStrike: '複数回の連続攻撃',
        guardStance: '次の攻撃を軽減',
        normal:      '常に発動（最終手段）'
    };

    let html = aiHeaderHtml;

    priority.forEach((sid, idx) => {
        const learned = sid === 'normal' || (typeof skillBook !== 'undefined' && skillBook[sid]?.learned);
        const name  = skillNames[sid] || sid;
        const desc  = skillDescs[sid] || '';
        const canUp   = idx > 0;
        const canDown = idx < priority.length - 1;
        html += `<div class="lab-item" style="align-items:center;${!learned?'opacity:0.45;':''}">
            <div style="width:24px;text-align:center;font-size:16px;color:var(--accent-cyan);font-weight:bold">${idx + 1}</div>
            <div style="flex:1;margin:0 8px;">
                <div style="font-weight:bold">${name}${learned ? '' : ' <span style="font-size:10px;color:var(--text-disabled)">[未習得]</span>'}</div>
                <div class="lab-desc">${desc}</div>
            </div>
            <div style="display:flex;gap:4px;">
                <button class="mini-btn" style="padding:3px 8px;font-size:13px;" onclick="moveAiPriority(${idx},-1)" ${canUp?'':'disabled style="opacity:0.3;padding:3px 8px;font-size:13px;"'}>▲</button>
                <button class="mini-btn" style="padding:3px 8px;font-size:13px;" onclick="moveAiPriority(${idx},+1)" ${canDown?'':'disabled style="opacity:0.3;padding:3px 8px;font-size:13px;"'}>▼</button>
            </div>
        </div>`;
    });

    panel.innerHTML = html;
}

function moveAiPriority(idx, dir) {
    if (typeof customAiPriority === 'undefined') return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= customAiPriority.length) return;
    const tmp = customAiPriority[idx];
    customAiPriority[idx] = customAiPriority[newIdx];
    customAiPriority[newIdx] = tmp;
    saveData();
    renderAiPanel();
}

// =============================================================
// ジョブ選択パネル
// =============================================================
function renderJobPanel() {
    const panel = document.getElementById('panelJob');
    if (!panel) return;
    if (typeof jobCatalog === 'undefined') return;

    const current = typeof equippedJob !== 'undefined' ? equippedJob : 'none';
    const currentJob = jobCatalog.find(j => j.id === current);

    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:5px;">
        <span style="color:var(--accent-green);font-size:13px;">⚗ 職業 <span class="info-icon" onclick="showHelp('職業','職業を選択するとパッシブボーナスが永続的に適用される。職業変更にはGが必要（無職への変更は無料）。ジョブごとにATK/DEF/GOLD/EXP倍率や特殊効果が異なる。')">ⓘ</span></span>
        <span style="margin-left:8px;">現在: <b style="color:var(--accent-green)">${currentJob ? currentJob.icon + ' ' + currentJob.name : '無職'}</b></span>
    </div>`;

    jobCatalog.forEach(j => {
        const isActive = j.id === current;
        const eff = j.effects;
        const effParts = [];
        if (eff.atkMult)    effParts.push(`<span style="color:${eff.atkMult>1?'var(--accent-cyan)':'var(--danger-red)'}">ATK×${eff.atkMult}</span>`);
        if (eff.defMult)    effParts.push(`<span style="color:${eff.defMult>1?'var(--accent-cyan)':'var(--danger-red)'}">DEF×${eff.defMult}</span>`);
        if (eff.spdBonus)   effParts.push(`<span style="color:var(--accent-cyan)">SPD+${eff.spdBonus}</span>`);
        if (eff.critBonus)  effParts.push(`<span style="color:var(--accent-orange)">会心+${eff.critBonus}%</span>`);
        if (eff.stealBonus) effParts.push(`<span style="color:var(--accent-green)">奪取+${eff.stealBonus}%</span>`);
        if (eff.spiritBonus)effParts.push(`<span style="color:#aa88ff">精神+${eff.spiritBonus}</span>`);
        if (eff.magicMult)  effParts.push(`<span style="color:#aa88ff">魔法×${eff.magicMult}</span>`);
        if (eff.rangeMult)  effParts.push(`<span style="color:var(--accent-orange)">遠隔×${eff.rangeMult}</span>`);
        if (eff.spRegen)    effParts.push(`<span style="color:#c080ff">SP+${eff.spRegen}/turn</span>`);
        if (eff.matDropMult)effParts.push(`<span style="color:var(--accent-green)">素材+${Math.round((eff.matDropMult-1)*100)}%</span>`);
        if (eff.goldMult)   effParts.push(`<span style="color:var(--accent-orange)">G+${Math.round((eff.goldMult-1)*100)}%</span>`);
        const effText = effParts.length > 0 ? effParts.join(' / ') : '<span style="color:var(--text-dim)">効果なし</span>';

        const canAfford = starDust >= j.changeCost;
        const costLabel = j.changeCost === 0 ? '無料' : `G${j.changeCost}`;
        // 熟練度表示
        let lvBadge = '';
        if (j.id !== 'none') {
            const _jlv = (typeof getJobLevel === 'function') ? getJobLevel(j.id) : 0;
            const _jkc = (typeof jobKillCounts !== 'undefined') ? (jobKillCounts[j.id] || 0) : 0;
            const _thresh = [20, 50, 100, 200, 350];
            const _next = _thresh[_jlv] || null;
            const _bar = _jlv >= 5 ? '<span style="color:#ffd700">MAX</span>'
                       : `<span style="color:#aaa">${_jkc}/${_next}戦</span>`;
            const _stars = '★'.repeat(_jlv) + '☆'.repeat(5 - _jlv);
            lvBadge = `<div style="font-size:11px;color:#ffd700;margin-top:1px">${_stars} Lv${_jlv} ${_bar}</div>`;
        }

        html += `<div class="lab-item" style="${isActive ? 'border-color:var(--accent-green);background:rgba(0,200,100,0.07);' : ''}">
            <div style="flex:1;">
                <div style="font-weight:bold;color:${isActive ? 'var(--accent-green)' : 'var(--text-main)'}">${j.icon} ${j.name}${isActive ? ' ✓ 選択中' : ''}</div>
                <div class="lab-desc">${j.desc}</div>
                <div class="lab-desc" style="margin-top:1px">${effText}</div>
                ${lvBadge}
            </div>
            ${isActive ? '' : `<button class="mini-btn btn-equip" onclick="changeJob('${j.id}')" style="font-size:12px;" ${canAfford?'':'disabled style="opacity:0.5;font-size:12px;"'}>${costLabel}</button>`}
        </div>`;
    });
    panel.innerHTML = html;
}

function changeJob(id) {
    const j = (typeof jobCatalog !== 'undefined') ? jobCatalog.find(x => x.id === id) : null;
    if (!j) return;
    if (starDust < j.changeCost) { addLog(`<span class="damage-text">Gが足りない！ (必要: ${j.changeCost}G)</span>`); return; }
    starDust -= j.changeCost;
    equippedJob = id;
    saveData();
    renderJobPanel();
    updateUI();
    addLog(`<span style="color:var(--accent-green)">⚗ 職業を【${j.icon} ${j.name}】に変更した！${j.changeCost > 0 ? ' G-' + j.changeCost : ''}</span>`);
}

// 荷物拡張
function upgradeBag() {
    const costs = [50, 120, 220, 360, 550];
    if (bagUpgradeLevel >= 5) { addLog('<span style="color:#88ccff">荷物はすでに最大まで拡張されている。</span>'); return; }
    const cost = costs[bagUpgradeLevel];
    if (starDust < cost) { addLog(`<span style="color:var(--danger-red)">Gが足りない！(必要: G${cost})</span>`); return; }
    starDust -= cost;
    bagUpgradeLevel++;
    maxInventory += 5;
    addLog(`<span style="color:#88ccff">🎒 荷物を拡張した！ 所持品 +5 → 最大${maxInventory}個 (Lv${bagUpgradeLevel})</span>`);
    updateUI();
    saveData();
}
