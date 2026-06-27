// =============================================================
// battle.js — ATBバトルシステム（スキル対応版）
// =============================================================

function startBattle(enemyName, enemyMaxHp, enemyAtk, enemyExp, isBoss, enemySpeed, enemyMagicAtk, pendingTypes) {
    const pSpd = getTotalSpeed();
    const eSpd = enemySpeed || 8;
    window._pendingDnaTypes = pendingTypes || [];
    // 属性弱点情報取得（explore.jsで保存済み）
    const _stackWeak = (typeof window._fightStackWeakElement !== 'undefined') ? window._fightStackWeakElement : null;
    window._fightStackWeakElement = null; // 使用後リセット
    battleState = {
        active:      true,
        enemy:       { name: enemyName, hp: enemyMaxHp, maxHp: enemyMaxHp, atk: enemyAtk, exp: enemyExp, magicAtk: enemyMagicAtk || 0, weakElement: _stackWeak },
        isBoss:      isBoss,
        turn:        0,
        playerAtb:   0,
        enemyAtb:    0,
        playerSpeed: pSpd,
        enemySpeed:  eSpd,
        guardActive: false,
        guardMult:   1.0,
    };

    updateIllustration(isBoss ? 'boss' : 'battle', battleState.enemy);
    const spdCmp = pSpd >= eSpd
        ? `<span style="color:var(--accent-cyan)">▲ 素早さ有利</span>`
        : `<span style="color:var(--danger-red)">▼ 素早さ不利</span>`;
    const _weakEl = _stackWeak;
    const _weakElInfo = (_weakEl && typeof ELEMENTS !== 'undefined' && ELEMENTS[_weakEl])
        ? ` <span style="color:${ELEMENTS[_weakEl].color};font-size:11px">[弱点: ${ELEMENTS[_weakEl].icon}${_weakEl}]</span>` : '';
    addLog(`<span class="${isBoss ? 'boss-text' : 'attack-text'}">${enemyName} が立ちはだかった！</span>${_weakElInfo} ${spdCmp}<br><span style="color:var(--text-dim);font-size:12px">SPD 勇者:${pSpd} / 敵:${eSpd}</span>`);
    updateActionButtons();
    updateUI();
}

// プレイヤーのダメージ計算（クリット・精霊込み）
function calcPlayerDamage(atkOverride, skillElement) {
    let atk      = atkOverride !== undefined ? atkOverride : getTotalAttack();
    let critRate = getCritRate() / 100;
    let isCrit   = Math.random() < critRate;
    if (isCrit && typeof titleStats !== 'undefined') { titleStats.critHits++; if(typeof checkTitleUnlocks==='function') checkTitleUnlocks(); }
    let dmg      = isCrit ? Math.floor(atk * 1.5) : atk;
    // 属性弱点ボーナス
    const weaponElem   = (equipment.weapon && equipment.weapon.element) ? equipment.weapon.element : null;
    const activeElem   = skillElement || weaponElem;
    const enemyWeak    = battleState.enemy && battleState.enemy.weakElement ? battleState.enemy.weakElement : null;
    const elemBonus    = (typeof getElementBonus === 'function') ? getElementBonus(activeElem, enemyWeak) : 1.0;
    if (elemBonus > 1.0) dmg = Math.floor(dmg * elemBonus);

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

// 敵のダメージ計算（物理＋魔法分離・精神軽減込み）
function calcEnemyDamage(atk, magicAtk) {
    // 物理ダメージ
    let physDmg = Math.floor(atk * (0.8 + Math.random() * 0.4));
    physDmg = Math.max(0, physDmg - getTotalDef());

    // 魔法ダメージ（精神ステータムで軽減）
    let magDmg = 0;
    if (magicAtk && magicAtk > 0) {
        const spiritTotal = baseSpirit + (equipment.armor && equipment.armor.spirit ? equipment.armor.spirit : 0)
            + (equipment.helm && equipment.helm.spirit ? equipment.helm.spirit : 0)
            + (equipment.shield && equipment.shield.spirit ? equipment.shield.spirit : 0);
        const spiritReduction = Math.min(0.85, spiritTotal * 0.04); // 1精神=4%軽減(最大85%)
        magDmg = Math.max(0, Math.floor(magicAtk * (0.8 + Math.random() * 0.4) * (1 - spiritReduction)));
    }

    return { total: Math.max(1, physDmg + magDmg), phys: physDmg, magic: magDmg };
}

// ATBシミュレーション：プレイヤーのターンが来るまでティックを進める
// atbCost: 必要ATB (スキルで変動)
// 戻り値: true = ゲームオーバー発生
function tickUntilPlayerTurn(atbCost) {
    atbCost = atbCost || 100;
    const MAX_ENEMY_HITS = 6;
    let enemyHits = 0;

    const tensionMult = (typeof tension !== 'undefined') ? [1.0, 1.5, 2.5][tension - 1] : 1.0;
    while (battleState.playerAtb < atbCost) {
        battleState.playerAtb += battleState.playerSpeed;
        battleState.enemyAtb  += battleState.enemySpeed * tensionMult;

        if (battleState.enemyAtb >= 100 && enemyHits < MAX_ENEMY_HITS) {
            battleState.enemyAtb -= 100;
            enemyHits++;
            let dmgData = calcEnemyDamage(battleState.enemy.atk, battleState.enemy.magicAtk || 0);
            let dmg = dmgData.total;
            currentHp = Math.max(0, currentHp - dmg);
            const magPart = dmgData.magic > 0 ? ` <span style="color:#88aaff; font-size:11px">(魔${dmgData.magic})</span>` : '';
            addLog(`<span class="damage-text">⚡ ${battleState.enemy.name}が先手！ ${dmg} dmgを受けた！${magPart}</span>`);
            if (currentHp <= 0) {
                currentHp = 0;
                gameOver();
                return true;
            }
            updateUI();
        }
    }
    battleState.playerAtb -= atbCost;
    return false;
}

// ================================================================
// 攻撃・スキル実行
// skillId: 'normal' / 'powerStrike' / 'rapidStrike' / 'healingWave' / 'guardStance'
// ================================================================
function executeBattleTurn(skillId) {
    skillId = skillId || 'normal';
    clearLog();
    battleState.turn++;

    const skill    = skillId !== 'normal' ? combatSkills.find(s => s.id === skillId) : null;
    const atbCost  = skill ? Math.round(100 * skill.atbMultiplier) : 100;
    let enemy      = battleState.enemy;

    // ATBが足りなければティックを進める
    if (battleState.playerAtb < atbCost) {
        if (tickUntilPlayerTurn(atbCost)) return;
    } else {
        battleState.playerAtb -= atbCost;
    }

    let logMsg = '';
    let enemyDied = false;

    // ── スキル実行 ──
    if (skill) {
        // SPコスト確認
        const spCosts = { powerStrike: 20, rapidStrike: 15, healingWave: 25, guardStance: 10 };
        const spCost  = spCosts[skillId] || 15;
        if (sp < spCost) {
            addLog(`<span class="damage-text">SPが足りない！ (必要: ${spCost} / 現在: ${sp})</span>`);
            return;
        }
        sp -= spCost;
        const skillLvBefore = getSkillLevel(skillId);
        skillBook[skillId].uses++;
        if (typeof titleStats !== 'undefined') { titleStats.skillUseCount++; if(typeof checkTitleUnlocks==='function') checkTitleUnlocks(); }
        const skillLvAfter  = getSkillLevel(skillId);
        const skillLv       = skillLvAfter;

        // レベルアップ通知
        if (skillLvAfter > skillLvBefore) {
            addLog(`<span class="levelup-text">✦ スキル「${skill.name}」がLv${skillLvAfter}に上昇した！</span>`);
        }

        if (skillId === 'powerStrike') {
            // 渾身の一撃：高倍率1ヒット
            const mult   = skill.dmgMults[skillLv - 1];
            const rawAtk = getTotalAttack();
            const dmg    = Math.max(1, Math.floor(rawAtk * mult * (0.9 + Math.random() * 0.2)));
            enemy.hp     = Math.max(0, enemy.hp - dmg);
            logMsg = `<span class="attack-text">💥 渾身の一撃！ ${dmg} dmgを与えた！ (Lv${skillLv} × ${mult.toFixed(1)})</span>`;
            const heal = Math.floor(dmg * (getStealRate() / 100));
            if (heal > 0) { currentHp = Math.min(maxHp, currentHp + heal); logMsg += ` <span class="event-text">(吸収 +${heal})</span>`;
                if (typeof titleStats !== 'undefined') { titleStats.stealCount++; if(typeof checkTitleUnlocks==='function') checkTitleUnlocks(); } }
            sp = Math.min(maxSp, sp + 5);

        } else if (skillId === 'rapidStrike') {
            // 連撃：複数回ヒット
            const hits    = skill.hitsPerLevel[skillLv - 1];
            const hitMult = skill.hitMult;
            const rawAtk  = getTotalAttack();
            let dmgParts  = [];
            for (let i = 0; i < hits; i++) {
                const d  = Math.max(1, Math.floor(rawAtk * hitMult * (0.85 + Math.random() * 0.3)));
                enemy.hp = Math.max(0, enemy.hp - d);
                dmgParts.push(d);
            }
            const total = dmgParts.reduce((a, b) => a + b, 0);
            logMsg = `<span class="attack-text">⚔ ${hits}連撃！ [${dmgParts.join('+')}] 計 ${total} dmg！ (Lv${skillLv})</span>`;
            sp = Math.min(maxSp, sp + 3);

        } else if (skillId === 'healingWave') {
            // 回復術：HP回復（精神で強化）
            const spiritBonus = 1 + baseSpirit * 0.05;
            const healPct = skill.healPcts[skillLv - 1];
            const healAmt = Math.max(1, Math.floor(maxHp * healPct * spiritBonus));
            currentHp     = Math.min(maxHp, currentHp + healAmt);
            logMsg = `<span class="event-text">✦ 回復術！ HP +${healAmt} 回復した！ (Lv${skillLv} / 精神補正×${spiritBonus.toFixed(2)})</span>`;

        } else if (skillId === 'guardStance') {
            // 鉄壁：次の被ダメを軽減
            const defMult = skill.defMults[skillLv - 1];
            battleState.guardActive = true;
            battleState.guardMult   = defMult;
            logMsg = `<span class="event-text">🛡 鉄壁の構え！ 次の被ダメを ${Math.round((1 - defMult) * 100)}% 軽減！ (Lv${skillLv})</span>`;
            sp = Math.min(maxSp, sp + 4);
        } else if (skillId === 'flameBurst') {
            const mult = skill.dmgMults[skillLv - 1];
            const elemB = (typeof getElementBonus==='function'&&battleState.enemy) ? getElementBonus('炎',battleState.enemy.weakElement) : 1.0;
            const dmg = Math.max(1, Math.floor(getTotalAttack() * mult * elemB * (0.9 + Math.random()*0.2)));
            enemy.hp = Math.max(0, enemy.hp - dmg);
            const wMsg = elemB>1 ? ' <span style="color:#ff6644">【弱点！×1.5】</span>' : '';
            logMsg = `<span class="attack-text">🔥 炎撃！ ${dmg} dmg${wMsg} (Lv${skillLv})</span>`;
            const h = Math.floor(dmg*(getStealRate()/100)); if(h>0){currentHp=Math.min(maxHp,currentHp+h);}
            if(typeof showFloatingDamage==='function')showFloatingDamage(dmg,'player');
            sp = Math.min(maxSp, sp + 4);
        } else if (skillId === 'iceEdge') {
            const mult = skill.dmgMults[skillLv - 1];
            const elemB = (typeof getElementBonus==='function'&&battleState.enemy) ? getElementBonus('氷',battleState.enemy.weakElement) : 1.0;
            const dmg = Math.max(1, Math.floor(getTotalAttack() * mult * elemB * (0.9 + Math.random()*0.2)));
            enemy.hp = Math.max(0, enemy.hp - dmg);
            const origS = battleState.enemySpeed;
            battleState.enemySpeed = Math.max(1, Math.floor(origS * 0.8));
            setTimeout(()=>{ if(battleState.active) battleState.enemySpeed=origS; }, 2500);
            const wMsg = elemB>1 ? ' <span style="color:#44ccff">【弱点！×1.5】</span>' : '';
            logMsg = `<span class="attack-text">❄ 氷刃！ ${dmg} dmg${wMsg} 敵の動きが鈍った！ (Lv${skillLv})</span>`;
            if(typeof showFloatingDamage==='function')showFloatingDamage(dmg,'player');
            sp = Math.min(maxSp, sp + 4);
        } else if (skillId === 'thunderClap') {
            const mult = skill.dmgMults[skillLv - 1];
            const elemB = (typeof getElementBonus==='function'&&battleState.enemy) ? getElementBonus('雷',battleState.enemy.weakElement) : 1.0;
            const dmg = Math.max(1, Math.floor(getTotalAttack() * mult * elemB * (0.9 + Math.random()*0.2)));
            enemy.hp = Math.max(0, enemy.hp - dmg);
            const wMsg = elemB>1 ? ' <span style="color:#ffee44">【弱点！×1.5】</span>' : '';
            logMsg = `<span class="attack-text">⚡ 雷霆！ 天雷がスタックを貫く！ ${dmg} dmg${wMsg} (Lv${skillLv})</span>`;
            if(typeof showFloatingDamage==='function')showFloatingDamage(dmg,'player');
            sp = Math.min(maxSp, sp + 4);
        }

        saveData();

    } else {
        // ── 通常攻撃 ──
        const isRange = typeof isRangeWeapon === 'function' && isRangeWeapon();
        const atkOverride = isRange ? (typeof getTotalRangeAttack === 'function' ? getTotalRangeAttack() : undefined) : undefined;
        let myDmgData = calcPlayerDamage(atkOverride);
        enemy.hp = Math.max(0, enemy.hp - myDmgData.total);
        const atkLabel = isRange ? '🏹 射撃！' : '>>';
        logMsg   = `<span class="attack-text">${atkLabel} ${myDmgData.isCrit ? 'CRITICAL!! ' : ''}${myDmgData.total} dmgを与えた！</span>${myDmgData.spiritLog}`;
        showFloatingDamage(myDmgData.total, myDmgData.isCrit ? 'crit' : 'player');
        if (myDmgData.isCrit) {
            if (typeof triggerShake === 'function') triggerShake();
            if (typeof triggerFlash === 'function') triggerFlash('crit');
        }
        const heal = Math.floor(myDmgData.total * (getStealRate() / 100));
        if (heal > 0) {
            currentHp = Math.min(maxHp, currentHp + heal);
            logMsg   += ` <span class="event-text">(吸収 +${heal})</span>`;
        }
        // 通常攻撃はSP-2消費（スキルを使う動機付け）
        sp = Math.max(0, sp - 2);
    }

    // ── 撃破判定 ──
    if (enemy.hp <= 0) {
        stats.kills++;
        let _gainedExp = enemy.exp;
        // 称号 EXP補正
        if (typeof getTitleEffects === 'function') { const _te=getTitleEffects(); if(_te.expMult) _gainedExp = Math.floor(_gainedExp * _te.expMult); }
        // 星座 EXP補正
        if (typeof getConstellationEffects === 'function') { const _ce=getConstellationEffects(); if(_ce.expMult) _gainedExp = Math.floor(_gainedExp * _ce.expMult); }
        exp      += _gainedExp;
        // DNA追跡
        if (typeof dnaCounts !== 'undefined' && window._pendingDnaTypes && window._pendingDnaTypes.length > 0) {
            window._pendingDnaTypes.forEach(t => { if (t) dnaCounts[t] = (dnaCounts[t] || 0) + 1; });
            window._pendingDnaTypes = [];
        }
        let dust  = Math.floor(Math.random() * (activeDungeon.diff + currentFloor)) + (battleState.isBoss ? 20 : 2);
        // 星座 GOLD補正
        if (typeof getConstellationEffects === 'function') { const _cg=getConstellationEffects(); if(_cg.goldMult) dust = Math.floor(dust * _cg.goldMult); }
        if (typeof getJobEffects === 'function') { const _jg=getJobEffects(); if(_jg.goldMult) dust = Math.floor(dust * _jg.goldMult); }
        starDust += dust;

        // テンションボーナス
        const tensionExpMult = (typeof tension !== 'undefined') ? [1.0, 1.3, 1.8][tension - 1] : 1.0;
        exp      = exp - enemy.exp + Math.floor(enemy.exp * tensionExpMult); // テンション補正後のEXPに修正
        // ↑ checkLevelUpでexpに加算済みなので調整は不要、代わりに追加で加算
        const bonusExp = Math.floor(enemy.exp * (tensionExpMult - 1.0));
        exp += bonusExp;
        if (bonusExp > 0) logMsg += ` <span style="color:var(--accent-magenta); font-size:11px">[テンションボーナス EXP+${bonusExp}]</span>`;
        // メダルEXP倍率
        if (typeof getMedalEffects === 'function') {
            const me = getMedalEffects();
            if (me.expMult && me.expMult > 1) {
                const medalExpBonus = Math.floor(enemy.exp * (me.expMult - 1));
                exp += medalExpBonus;
                logMsg += ` <span style="color:#aaddaa; font-size:11px">[賢者の章 EXP+${medalExpBonus}]</span>`;
            }
        }

        // 武勲: ボスは多め、通常は難易度比例
        const meritGain = battleState.isBoss
            ? (8 + activeDungeon.diff * 2)
            : Math.max(1, Math.floor(activeDungeon.diff * 0.5 + currentFloor * 0.3 + Math.random() * 2));
        battleMerit += meritGain;

        logMsg += `<br><span class="${battleState.isBoss ? 'boss-text' : 'attack-text'}">${enemy.name} を倒した！</span><br>EXP +${enemy.exp} / <span style="color:var(--accent-orange)">G +${dust}</span> / <span style="color:#88ccff">武勲 +${meritGain}</span>`;
        addLog(logMsg);
        checkLevelUp();

        if (battleState.isBoss) {
            if (typeof triggerFlash === 'function') triggerFlash('boss');
            if (dungeons.indexOf(activeDungeon) === currentProgress) currentProgress++;
            isBossDefeated = true;
            const bossScale = activeDungeon.diff * 2 + currentFloor * 2 + 8;
            const bossItem  = generateItem(bossScale);
            const bonus     = Math.floor(activeDungeon.diff * 1.5) + 3;
            bossItem.name   = '[伝説]' + bossItem.name;
            if (bossItem.type === 'weapon') bossItem.atk += bonus;
            else bossItem.def += bonus;
            if (inventory.length < maxInventory) {
                inventory.push(bossItem);
                const br = getRarityInfo(bossItem);
                const _bossLogMsg = `✦ ボスの遺品として <span style="color:${br.color}; font-weight:bold" ${bossItem.stars >= 2 ? 'id="latestRareItemName"' : ''}>［${bossItem.name}］</span> <span style="color:${br.color}; font-size:12px">${br.label}</span> を手に入れた！`;
                addLog(_bossLogMsg);
                if (bossItem.stars >= 2 && typeof triggerRainbow === 'function') {
                    setTimeout(() => triggerRainbow(document.getElementById('latestRareItemName')), 50);
                }
            } else {
                addLog(`<span class="levelup-text">✦ ボスは <span class="item-text">［${bossItem.name}］</span> を落としたが、荷物が満杯で持てなかった！</span>`);
            }
            addLog('<span class="event-text">ボスを討伐した！これ以上進む道はない。<br>……自力で出口まで帰還せよ。</span>');
        }

        battleState.active = false;
        stopAutoBattle();
        if (typeof renderAutoRow === 'function') renderAutoRow();
        updateIllustration('explore');
        updateActionButtons();

    } else {
        // ── 敵の反撃 ──
        battleState.enemyAtb += battleState.enemySpeed;
        if (battleState.enemyAtb >= 100) {
            battleState.enemyAtb -= 100;
            let counterData = calcEnemyDamage(enemy.atk, enemy.magicAtk || 0);
            let counterDmg = counterData.total;
            const cMagPart = counterData.magic > 0 ? ` <span style="color:#88aaff; font-size:11px">(魔${counterData.magic})</span>` : '';

            if (battleState.guardActive) {
                const reduced = Math.max(1, Math.floor(counterDmg * battleState.guardMult));
                logMsg += `<br><span class="damage-text"><< 敵の反撃！ 🛡 鉄壁！ ${reduced} dmgに軽減！${cMagPart}</span>`;
                showFloatingDamage(reduced, 'enemy');
                currentHp -= reduced;
                battleState.guardActive = false;
            } else {
                logMsg += `<br><span class="damage-text"><< 敵の反撃！ ${counterDmg} dmg！${cMagPart}</span>`;
                showFloatingDamage(counterDmg, 'enemy');
                currentHp -= counterDmg;
            }
        }
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
                addLog(`<div class="floor-text"><< B${currentFloor}F へ後退。</div>`);
            } else {
                stepCount = 0;
            }
        }

        updateIllustration('explore');
        updateActionButtons();
        updateUI();
    } else {
        let enemy       = battleState.enemy;
        let fleeData    = calcEnemyDamage(enemy.atk, enemy.magicAtk || 0);
        let enemyDmg    = fleeData.total;
        currentHp      -= enemyDmg;
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
        nextExp = Math.floor(nextExp * 2.0);
        maxHp  += 8;
        currentHp = maxHp;
        baseAttack += 1;
        baseSpeed  += 1;
        addLog(`<span class="levelup-text">★ レベルアップ！ ★<br>Lv.${level}に成長した！ HPが全回復し、力と素早さが増した！</span>`);
    }
}

// ゲームオーバー
function gameOver() {
    if (typeof checkTitleUnlocks === 'function') checkTitleUnlocks();
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

// ================================================================
// オートバトル + 浮遊ダメージ演出
// ================================================================
let autoBattle      = false;
let autoBattleTimer = null;

function toggleAutoBattle() {
    autoBattle = !autoBattle;
    if (autoBattle && battleState.active) {
        startAutoBattle();
    } else {
        stopAutoBattle();
    }
    if (typeof renderAutoRow === 'function') renderAutoRow();
}

function startAutoBattle() {
    if (autoBattleTimer) clearInterval(autoBattleTimer);
    autoBattleTimer = setInterval(() => {
        if (!battleState.active) { stopAutoBattle(); return; }
        // カスタムAI優先度でスキルを選択
        const priority = (typeof customAiPriority !== 'undefined') ? customAiPriority : ['normal'];
        const spCosts  = { powerStrike: 20, rapidStrike: 15, healingWave: 25, guardStance: 10, flameBurst: 18, iceEdge: 15, thunderClap: 30 };
        let chosen = 'normal';
        for (const sid of priority) {
            if (sid === 'normal') { chosen = 'normal'; break; }
            const entry = skillBook[sid];
            if (!entry || !entry.learned) continue;
            const cost  = spCosts[sid] || 15;
            // healingWave はHP50%未満のときのみ発動
            if (sid === 'healingWave' && currentHp > maxHp * 0.5) continue;
            if (sp >= cost) { chosen = sid; break; }
        }
        executeBattleTurn(chosen);
    }, 900);
}

function stopAutoBattle() {
    if (autoBattleTimer) { clearInterval(autoBattleTimer); autoBattleTimer = null; }
}

// 浮遊ダメージ数字
function showFloatingDamage(value, type) {
    const color = type === 'player'  ? 'var(--accent-cyan)'
                : type === 'enemy'   ? 'var(--danger-red)'
                : type === 'heal'    ? 'var(--accent-green)'
                : type === 'crit'    ? 'var(--accent-orange)'
                : 'var(--text-main)';
    const prefix = type === 'heal' ? '+' : type === 'player' || type === 'crit' ? '' : '-';
    const el = document.createElement('div');
    el.className   = 'float-dmg';
    el.textContent = prefix + value;
    el.style.color = color;
    // ビューポートの中央付近にランダム配置
    const vp = document.getElementById('viewportContent');
    if (vp) {
        const rect = vp.getBoundingClientRect();
        el.style.left = (rect.left + rect.width  * (0.3 + Math.random() * 0.4)) + 'px';
        el.style.top  = (rect.top  + rect.height * (0.3 + Math.random() * 0.3)) + 'px';
    } else {
        el.style.left = (window.innerWidth  * 0.4 + Math.random() * 80) + 'px';
        el.style.top  = (window.innerHeight * 0.4) + 'px';
    }
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
}
