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
