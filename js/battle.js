// =============================================================
// battle.js — ターン制バトルシステム
// =============================================================

function startBattle(enemyName, enemyMaxHp, enemyAtk, enemyExp, isBoss) {
    battleState = {
        active: true,
        enemy:  { name: enemyName, hp: enemyMaxHp, maxHp: enemyMaxHp, atk: enemyAtk, exp: enemyExp },
        isBoss: isBoss,
        turn:   0
    };

    updateIllustration(isBoss ? 'boss' : 'battle', battleState.enemy);
    addLog(`<span class="${isBoss ? 'boss-text' : 'attack-text'}">${enemyName} が立ちはだかった！</span>`);
    updateActionButtons();
    updateUI();
}

// プレイヤーのダメージ計算（クリット・精霊込み）
function calcPlayerDamage() {
    let atk      = getTotalAttack();
    let critRate = getCritRate() / 100;
    let isCrit   = Math.random() < critRate;
    let dmg      = isCrit ? Math.floor(atk * 1.5) : atk;

    let spiritDmg = 0, spiritLog = '';
    let totalSpirits = getTotalSpirits();
    if (Object.keys(totalSpirits).length > 0) {
        let parts = [];
        for (let k in totalSpirits) {
            let sp   = totalSpirits[k];
            let sDmg = sp.val * 2;
            spiritDmg += sDmg;
            parts.push(`<span style="color:${sp.color}">${k}+${sDmg}</span>`);
        }
        spiritLog = ` <span style="font-size:12px;">[共鳴: ${parts.join(' ')}]</span>`;
    }

    dmg += spiritDmg;
    dmg  = Math.floor(dmg * (0.9 + Math.random() * 0.2));
    if (dmg < 1) dmg = 1;

    return { total: dmg, isCrit, spiritLog };
}

// 敵のダメージ計算（防御減算込み）
function calcEnemyDamage(atk) {
    let rawDmg = Math.floor(atk * (0.8 + Math.random() * 0.4));
    return Math.max(1, rawDmg - getTotalDef());
}

// 攻撃ボタン押下時の1ターン処理
function executeBattleTurn() {
    clearLog();
    let enemy = battleState.enemy;
    battleState.turn++;

    // プレイヤー攻撃
    let myDmgData = calcPlayerDamage();
    enemy.hp = Math.max(0, enemy.hp - myDmgData.total);

    let logMsg = `<span class="attack-text">>> ${myDmgData.isCrit ? 'CRITICAL!! ' : ''}${myDmgData.total} dmgを与えた！</span>${myDmgData.spiritLog}`;

    // HP吸収
    let heal = Math.floor(myDmgData.total * (getStealRate() / 100));
    if (heal > 0) {
        currentHp = Math.min(maxHp, currentHp + heal);
        logMsg += ` <span class="event-text">(吸収 +${heal})</span>`;
    }

    if (enemy.hp <= 0) {
        // 勝利
        stats.kills++;
        exp      += enemy.exp;
        let dust  = Math.floor(Math.random() * (activeDungeon.diff + currentFloor)) + (battleState.isBoss ? 20 : 2);
        starDust += dust;

        logMsg += `<br><span class="${battleState.isBoss ? 'boss-text' : 'attack-text'}">${enemy.name} を倒した！</span><br>EXP +${enemy.exp} / <span style="color:var(--accent-orange)">G +${dust}</span>`;
        addLog(logMsg);

        checkLevelUp();

        if (battleState.isBoss) {
            if (dungeons.indexOf(activeDungeon) === currentProgress) currentProgress++;
            isBossDefeated = true;

            // ボス撃破時のレアドロップ
            const bossScale = activeDungeon.diff * 2 + currentFloor * 2 + 8;
            const bossItem  = generateItem(bossScale);
            const bonus     = Math.floor(activeDungeon.diff * 1.5) + 3;
            bossItem.name   = '[伝説]' + bossItem.name;
            if (bossItem.type === 'weapon') bossItem.atk += bonus;
            else bossItem.def += bonus;
            if (inventory.length < 10) {
                inventory.push(bossItem);
                addLog(`<span class="levelup-text">✦ ボスの遺品として <span class="item-text">［${bossItem.name}］</span> を手に入れた！</span>`);
            } else {
                addLog(`<span class="levelup-text">✦ ボスは <span class="item-text">［${bossItem.name}］</span> を落としたが、荷物が満杯で持てなかった！</span>`);
            }

            addLog('<span class="event-text">ボスを討伐した！これ以上進む道はない。<br>……自力で出口まで帰還せよ。</span>');
        }

        battleState.active = false;
        updateIllustration('explore');
        updateActionButtons();
    } else {
        // 敵の反撃
        let enemyDmg = calcEnemyDamage(enemy.atk);
        currentHp   -= enemyDmg;
        logMsg      += `<br><span class="damage-text"><< 敵の反撃！ ${enemyDmg} dmgを受けた！</span>`;
        addLog(logMsg);

        updateIllustration(battleState.isBoss ? 'boss' : 'battle', enemy);

        if (currentHp <= 0) {
            currentHp = 0;
            gameOver();
        }
    }
    updateUI();
}

// 逃走
function executeFlee() {
    clearLog();

    if (battleState.isBoss) {
        addLog(`<span class="damage-text">ボスとの戦い！逃げることはできない！</span>`);
        return;
    }

    if (Math.random() < 0.7) {
        addLog(`>> 戦闘から離脱し、後方へ退避した。`);
        battleState.active = false;

        stepCount--;
        if (stepCount < 0) {
            if (currentFloor > 1) {
                currentFloor--;
                stepCount = stepsToNextFloor - 1;
                addLog(`<div class="floor-text"><< Sector: ${currentFloor} へ後退。</div>`);
            } else {
                stepCount = 0;
            }
        }

        updateIllustration('explore');
        updateActionButtons();
        updateUI();
    } else {
        let enemy    = battleState.enemy;
        let enemyDmg = calcEnemyDamage(enemy.atk);
        currentHp   -= enemyDmg;
        addLog(`>> 逃走に失敗！ 隙を突かれ <span class="damage-text">${enemyDmg} dmg</span> を受けた！`);

        if (currentHp <= 0) {
            currentHp = 0;
            gameOver();
        }
        updateUI();
    }
}

// レベルアップ確認
function checkLevelUp() {
    if (exp >= nextExp) {
        level++;
        exp     = exp - nextExp;
        nextExp = Math.floor(nextExp * 1.6);
        maxHp  += 8;
        currentHp = maxHp;
        baseAttack += 1;
        addLog(`<span class="levelup-text">★ レベルアップ！ ★<br>Lv.${level}に成長した！ HPが全回復し、力が増した！</span>`);
    }
}

// ゲームオーバー
function gameOver() {
    updateIllustration('death');
    battleState.active = false;
    updateActionButtons();
    exploreBtn.disabled    = true;
    returnBtn.disabled     = true;
    exploreBtn.textContent = 'SYSTEM REBOOT...';
    addLog('<br><div class="death-text">力尽きた……<br>......<br>勇者の旅は、ここで幕を閉じた。</div><br>', '');

    setTimeout(() => {
        addLog('―― 勇者は村で目を覚ました。<br><span class="damage-text">装備、アイテム、ゴールドをすべて失った。</span>村から再出発しよう。');
        returnToBase(true);
    }, 3000);
}
