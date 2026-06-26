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
    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:8px;">装備中: <b style="color:var(--accent-cyan)">${equippedCount}/${slotMax}</b> スロット使用 | 変異を解除するにはDNAが必要</div>`;

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
                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:100px;margin-top:3px;overflow:hidden;">
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
    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:8px;">設置中: <b style="color:var(--accent-orange)">${placed}/${MAX_TRAPS}</b> / 戦闘突入時に敵へ先制ダメージ</div>`;

    // 設置済みトラップ
    if (traps.length > 0) {
        html += `<div style="font-size:11px;color:var(--text-dim);margin-bottom:4px;">── 設置済みトラップ ──</div>`;
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
        const canBuy = starDust >= t.cost && traps.length < MAX_TRAPS;
        html += `<div class="lab-item">
            <div><b>${t.icon||'🪤'} ${t.name}</b> <span class="lab-desc">${t.desc} / G${t.cost}</span></div>
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
    { id: 'ms_sp',       name: 'SP最大値+10',           cost: 15, desc: 'SP上限を恒久的に10増加',          icon: '✦', type: 'stat' },
    { id: 'ms_heal',     name: 'HP全回復',               cost: 10, desc: 'HPを100%回復する',               icon: '💊', type: 'use' },
    { id: 'ms_mat3',     name: '素材×3一括取得',          cost: 8,  desc: '全素材を3個ずつ追加取得',         icon: '🌿', type: 'use' },
    { id: 'ms_expx2',    name: 'スキル経験値2倍(次戦)',   cost: 20, desc: '次の戦闘のスキル使用数が2倍計上', icon: '📚', type: 'buff' },
    { id: 'ms_frenzy',   name: 'テンション「狂乱」固定(次戦)', cost: 25, desc: '次戦開始時にテンションを狂乱に固定', icon: '🔥', type: 'buff' },
    { id: 'ms_dnaslot',  name: 'DNA変異スロット+1',       cost: 50, desc: 'DNA変異スロットを永久に1増加',    icon: '🧬', type: 'perm' },
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
        html += `<div class="lab-item" style="opacity:${canBuy ? '1' : '0.5'}; margin-bottom:4px;">
            <div style="flex:1;">
                <span style="color:${typeColor}; font-size:13px;">${item.icon} ${item.name}</span>
                <div class="lab-desc">${item.desc}</div>
            </div>
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

    if (id === 'ms_sp') {
        maxSp += 10;
        sp = Math.min(sp, maxSp);
        addLog(`<span style="color:#60cdff">✦ SP最大値が10増加した！ (${maxSp})</span>`);
    } else if (id === 'ms_heal') {
        currentHp = maxHp;
        addLog(`<span style="color:#6ccb5f">💊 HPが全回復した！</span>`);
    } else if (id === 'ms_mat3') {
        craftMaterialTypes.forEach(m => { materials[m] = (materials[m] || 0) + 3; });
        addLog(`<span style="color:#aaffaa">🌿 全素材が3個ずつ追加された！</span>`);
    } else if (id === 'ms_expx2') {
        window._meritSkillExpDouble = true;
        addLog(`<span style="color:#ffa040">📚 次戦のスキル経験値が2倍になる！</span>`);
    } else if (id === 'ms_frenzy') {
        window._meritFrenzyNext = true;
        addLog(`<span style="color:#ffa040">🔥 次戦のテンションが「狂乱」に固定される！</span>`);
    } else if (id === 'ms_dnaslot') {
        mutationSlots = (mutationSlots || 3) + 1;
        addLog(`<span style="color:#aa88ff">🧬 DNA変異スロットが${mutationSlots}に増加した！</span>`);
        if (typeof renderDnaPanel === 'function') renderDnaPanel();
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

    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:10px;">
        称号を装備すると強力なステータス補正を得られます。一度に1つだけ装備できます。<br>
        装備中: <b style="color:#ffd700">${equipped ? titleCatalog.find(t=>t.id===equipped)?.name || 'なし' : 'なし'}</b>
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
                    <div class="lab-desc" style="margin-top:3px">${effText}</div>
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

    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:10px;">
        自動戦闘でのスキル使用優先順位を設定します。<br>
        上のスキルから順に、使用可能なものを選択して発動します。
    </div>`;

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
