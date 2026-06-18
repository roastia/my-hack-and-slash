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
