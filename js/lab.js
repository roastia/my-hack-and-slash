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

    const equipped = mutations.length;
    let html = `<div style="color:var(--text-dim);font-size:12px;margin-bottom:8px;">装備中: <b style="color:var(--accent-cyan)">${equipped}/${mutationSlots}</b> スロット使用 | 変異を解除するにはDNAが必要</div>`;

    mutationCatalog.forEach(mut => {
        const have     = dnaCounts[mut.req.type] || 0;
        const need     = mut.req.count;
        const unlocked = have >= need;
        const equipped = mutations.includes(mut.id);
        const pct      = Math.min(100, Math.floor(have / need * 100));

        let btnHtml = '';
        if (!unlocked) {
            btnHtml = `<span style="color:var(--text-disabled);font-size:11px;">未解除</span>`;
        } else if (equipped) {
            btnHtml = `<button class="mini-btn btn-equipped" onclick="toggleMutation('${mut.id}')">✓ 装備中</button>`;
        } else if (mutations.length < mutationSlots) {
            btnHtml = `<button class="mini-btn btn-equip" onclick="toggleMutation('${mut.id}')">装備する</button>`;
        } else {
            btnHtml = `<button class="mini-btn" disabled style="opacity:0.5;">スロット満杯</button>`;
        }

        html += `
        <div class="lab-item" style="${equipped ? 'border-color:var(--accent-cyan);background:rgba(96,205,255,0.05);' : ''}">
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
