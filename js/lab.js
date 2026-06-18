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
        addLog(`>> クローンの基礎細胞を強化。初期HPが上昇した。`, 'log-entry mix-text');
        updateUI();
    }
}

function upgradeAtk() {
    if (starDust >= costAtk) {
        starDust     -= costAtk;
        permBaseAtk  += 2;
        costAtk       = Math.floor(costAtk * 1.6);
        baseAttack   += 2;
        addLog(`>> 筋繊維リミッター解除。初期ATKが上昇した。`, 'log-entry mix-text');
        updateUI();
    }
}

function upgradeDef() {
    if (starDust >= costDef) {
        starDust     -= costDef;
        permBaseDef  += 2;
        costDef       = Math.floor(costDef * 1.6);
        baseDefense  += 2;
        addLog(`>> 外殻コーティング完了。初期DEFが上昇した。`, 'log-entry mix-text');
        updateUI();
    }
}
