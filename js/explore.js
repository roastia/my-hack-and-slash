// =============================================================
// explore.js — 探索ロジック（スタック・SP・渇き・素材対応）
// =============================================================

let _pendingDungeonIndex = -1;

function tryEnterDungeon(index) {
    if (!visitedDungeons.includes(index) && dungeons[index].story) {
        _pendingDungeonIndex = index;
        const d = dungeons[index];
        document.getElementById('storyLocation').textContent = `[ ${d.name} ]`;
        document.getElementById('storyText').innerHTML = d.story.replace(/\n/g, '<br>');
        document.getElementById('storyModal').classList.remove('hidden');
    } else {
        startDungeon(index);
    }
}

function closeStoryModal() {
    document.getElementById('storyModal').classList.add('hidden');
    if (_pendingDungeonIndex >= 0) {
        visitedDungeons.push(_pendingDungeonIndex);
        saveData();
        startDungeon(_pendingDungeonIndex);
        _pendingDungeonIndex = -1;
    }
}

// ダンジョン開始
function startDungeon(index) {
    activeDungeon  = dungeons[index];
    currentFloor   = 1;
    stepCount      = 0;
    isBossDefeated = false;
    enemyStack     = [];

    maxHp = currentHp = permMaxHp + (level - 1) * 8;
    baseAttack  = permBaseAtk + (level - 1);
    baseDefense = permBaseDef;
    baseSpeed   = 10 + (level - 1);

    sp      = maxSp;
    hunger  = maxHunger;
    thirst  = maxThirst;
    tension = 1;

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };

    clearLog();
    baseScene.classList.add('hidden');
    exploreScene.classList.remove('hidden');
    locationDisplay.textContent = activeDungeon.name;
    floorDisplay.style.display  = 'inline';

    addLog(`<br><span style="color:var(--accent-orange)">⚔ 冒険開始！</span><br>【${activeDungeon.name}】へ踏み込んだ...`);
    updateStackPanel();
    updateIllustration('explore');
    updateUI();
    updateActionButtons();
    if (typeof renderAutoRow === 'function') renderAutoRow();
}

// 拠点へ帰還
function returnToBase(isDead = false) {
    if (typeof stopAutoExplore === 'function') { stopAutoExplore(); autoExplore = false; }
    if (typeof stopAutoBattle  === 'function') { stopAutoBattle();  autoBattle  = false; }
    activeDungeon = null;
    enemyStack    = [];
    exploreScene.classList.add('hidden');
    baseScene.classList.remove('hidden');

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };

    if (isDead) {
        stats.deaths++;
        equipment = { weapon: null, helm: null, armor: null, shield: null };
        inventory = [];
        starDust  = 0;
        materials = {};
        // 死亡時は拠点が大きく劣化
        const deathDecay = 8 + Math.floor(Math.random() * 8);
        baseCondition = Math.max(0, baseCondition - deathDecay);
    } else {
        stats.returns++;
        // 帰還時もランダムに拠点が劣化
        if (Math.random() < 0.4) {
            const decay = 2 + Math.floor(Math.random() * 5);
            baseCondition = Math.max(0, baseCondition - decay);
        }
    }
    // 拠点劣化ログ
    if (baseCondition <= 30 && baseCondition > 0) {
        addLog(`<span style="color:var(--danger-red); font-size:12px;">⚠ 拠点コンディション低下中…(${baseCondition}/100) 修繕が必要だ。</span>`);
    } else if (baseCondition === 0) {
        addLog(`<span style="color:var(--danger-red); font-weight:bold;">💀 拠点が荒廃した！ 各種能力にペナルティが生じている。</span>`);
    }

    maxHp = currentHp = permMaxHp + (level - 1) * 8;
    baseAttack  = permBaseAtk + (level - 1);
    baseDefense = permBaseDef;
    baseSpeed   = 10 + (level - 1);
    sp = maxSp;
    hunger = maxHunger;
    thirst = maxThirst;

    updateStackPanel();
    renderBaseScene();
    updateUI();
}

// ================================================================
// スタック表示更新
// ================================================================
function updateStackPanel() {
    const panel = document.getElementById('stackPanel');
    if (!panel) return;

    if (!activeDungeon || enemyStack.length === 0) {
        panel.classList.add('hidden');
        panel.innerHTML = '';
        return;
    }

    panel.classList.remove('hidden');
    const count    = enemyStack.length;
    const risk     = count >= 4 ? 'var(--danger-red)' : count >= 2 ? 'var(--accent-orange)' : 'var(--accent-cyan)';
    const riskText = count >= 4 ? '【危険】' : count >= 2 ? '【警戒】' : '【待機】';
    const names    = enemyStack.map(e => e.name).join(' / ');
    panel.innerHTML = `
        <span style="color:${risk}; font-weight:bold;">${riskText} 敵スタック: ${count}体</span>
        <span style="color:var(--text-dim); font-size:11px; display:block; margin-top:2px;">${names}</span>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
            <button class="mini-btn btn-attack stack-fight-btn" onclick="fightStack()">⚔ 一括戦闘 (${count}体)</button>
            ${count >= 4 ? `<button class="mini-btn" style="border-color:var(--accent-orange);color:var(--accent-orange);" onclick="chainExplosion()">⚡ 連鎖爆発 (SP-20)</button>` : ''}
        </div>
    `;
}

// ================================================================
// スタック戦闘開始
// ================================================================
function fightStack() {
    if (enemyStack.length === 0) return;
    clearLog();

    const count       = enemyStack.length;
    let   totalHp     = enemyStack.reduce((s, e) => s + e.hp, 0);
    const avgAtk      = Math.ceil(enemyStack.reduce((s, e) => s + e.atk, 0) / count);
    const bonusAtk    = Math.floor(avgAtk * (count - 1) * 0.2);
    const totalExp    = Math.floor(enemyStack.reduce((s, e) => s + e.exp, 0) * Math.pow(1.1, count - 1));
    const maxSpd      = Math.max(...enemyStack.map(e => e.speed));
    const magicAtkAvg = Math.floor(enemyStack.reduce((s, e) => s + (e.magicAtk||0), 0) / count);

    const name = count === 1
        ? enemyStack[0].name
        : `${enemyStack[0].name} ほか${count - 1}体`;

    // DNA追跡用に種族リストを保存
    const dnaTypes = enemyStack.map(e => e.type || null);

    // SP半減
    const spBefore = sp;
    sp = Math.floor(sp / 2);
    addLog(`<span class="boss-text">⚡ スタック戦闘開始！ ${count}体の敵と一括対決！</span>`);
    addLog(`<span style="color:#aa88ff; font-size:11px;">⚠ 戦闘突入時SP半減: ${spBefore} → ${sp}</span>`);
    if (count >= 3) addLog(`<span class="damage-text">多数の敵が押し寄せる…極めて危険だ！</span>`);

    // トラップ発動（戦闘前先制ダメージ）
    if (typeof traps !== 'undefined' && traps.length > 0) {
        let trapDmgTotal = 0;
        const usedNames = [];
        traps = traps.filter(trap => {
            if (trap.usesLeft <= 0) return false;
            const dmg = trap.ignoresDef ? trap.dmgBase : Math.max(1, trap.dmgBase - Math.floor(avgAtk * 0.1));
            totalHp = Math.max(1, totalHp - dmg);
            trapDmgTotal += dmg;
            usedNames.push(trap.name);
            trap.usesLeft--;
            return trap.usesLeft > 0;
        });
        if (trapDmgTotal > 0) {
            addLog(`<span style="color:var(--accent-orange)">🪤 トラップ発動！ [${usedNames.join('・')}] → 敵に合計 <b>${trapDmgTotal}</b> ダメージ！</span>`);
            if (typeof renderTrapPanel === 'function') renderTrapPanel();
        }
    }

    enemyStack = [];
    updateStackPanel();

    startBattle(name, totalHp, avgAtk + bonusAtk, totalExp, false, maxSpd, magicAtkAvg, dnaTypes);
    if (typeof autoBattle !== 'undefined' && autoBattle) startAutoBattle();
}

// ================================================================
// 連鎖爆発（スタック4体以上で発動可能）
// ================================================================
function chainExplosion() {
    const count = enemyStack.length;
    if (count < 4) { addLog('<span class="damage-text">スタックが4体以上いないと使えない！</span>'); return; }
    const spCost = 20;
    if (sp < spCost) { addLog(`<span class="damage-text">SPが足りない！ (必要SP: ${spCost})</span>`); return; }

    sp -= spCost;
    clearLog();

    const myAtk = typeof getTotalAttack === 'function' ? getTotalAttack() : baseAttack;
    let chainDmg = myAtk * 3;
    let totalDmg = 0;
    let log = `<span style="color:var(--accent-orange); font-weight:bold;">⚡ 連鎖爆発発動！ (SP-${spCost})</span><br>`;

    enemyStack.forEach((e, i) => {
        const dmg = Math.max(1, Math.floor(chainDmg * (0.85 + Math.random() * 0.3)));
        const actual = Math.min(dmg, e.hp);
        e.hp -= actual;
        totalDmg += actual;
        log += `${i === 0 ? '💥' : '🔥'} ${e.name}に <b>${actual}</b> dmg${e.hp <= 0 ? ' <span style="color:var(--accent-green)">撃破！</span>' : ` (残HP:${e.hp})`}<br>`;
        chainDmg *= 0.75;
    });

    const before = enemyStack.length;
    enemyStack = enemyStack.filter(e => e.hp > 0);
    const killed = before - enemyStack.length;
    if (killed > 0) {
        if (typeof stats !== 'undefined') stats.kills = (stats.kills || 0) + killed;
        log += `<span class="attack-text">連鎖で ${killed}体 を消滅させた！ EXP等は加算なし。</span><br>`;
    }
    log += `<span style="color:var(--text-dim); font-size:12px">合計ダメージ: ${totalDmg}</span>`;
    addLog(log);

    updateStackPanel();
    updateUI();
    saveData();
}

// ================================================================
// 「進む」ボタン
// ================================================================
function executeExploreStep() {
    clearLog();
    stepCount++;
    if (typeof titleStats !== 'undefined') { titleStats.stepsTotal++; if(titleStats.stepsTotal % 50 === 0 && typeof checkTitleUnlocks === 'function') checkTitleUnlocks(); }

    // SP消費（移動コスト）
    const spCost = 3;
    if (!drainSP(spCost, '移動')) return;

    // 最深部
    if (currentFloor === activeDungeon.maxFloor && stepCount >= stepsToNextFloor) {
        if (isBossDefeated) {
            addLog('>> 最深部。残骸が散らばっているだけで、何もない。');
            updateActionButtons(); updateUI(); return;
        }
        // スタックを先に解決
        if (enemyStack.length > 0) {
            addLog('<span class="boss-text">⚠ ボスの前に敵がいる！先に片付けろ！</span>');
            fightStack(); return;
        }
        const boss = activeDungeon.boss;
        const spBeforeBoss = sp; sp = Math.floor(sp / 2);
        addLog(`<span style="color:#aa88ff; font-size:11px;">⚠ ボス戦突入でSP半減: ${spBeforeBoss} → ${sp}</span>`);
        startBattle(boss.name, boss.hp, boss.atk, boss.exp, true, boss.speed || 9, boss.magicAtk || 0);
        if (typeof autoBattle !== 'undefined' && autoBattle) startAutoBattle();
        return;
    }

    // 次の階へ
    if (stepCount >= stepsToNextFloor) {
        currentFloor++;
        stepCount = 0;
        addLog(`<div class="floor-text">階段を下りた。B${currentFloor}F へ進入。</div>`);
        updateIllustration('explore');
        if (currentFloor === activeDungeon.maxFloor)
            addLog(`<span class="boss-text">⚠ 強大な気配を感じる……最深部に何かいる。</span>`);
        updateActionButtons(); updateUI(); return;
    }

    // ランダムイベント
    const r = Math.floor(Math.random() * 100);
    if (r < 45) {
        addEnemyToStack();
    } else if (r < 58) {
        findItem();
    } else if (r < 65) {
        gatherMaterial();
    } else if (r < 73) {
        triggerChoiceEvent();
    } else {
        updateIllustration('explore');
        addLog(nothings[Math.floor(Math.random() * nothings.length)]);
    }

    if (applyHunger(5)) return;
    if (applyThirst(3)) return;

    // 変異：植物回生 HP自然回復
    if (typeof getMutationEffects === 'function') {
        const mu = getMutationEffects();
        if (mu.hpRegen && mu.hpRegen > 0) hp = Math.min(maxHp, hp + mu.hpRegen);
    }

    // 自動戦闘: スタック上限
    if (enemyStack.length >= 5) {
        addLog(`<span class="boss-text">⚡ 敵が溢れた！強制戦闘！</span>`);
        fightStack(); return;
    }

    updateStackPanel();
    updateUI();
}

// ================================================================
// 「戻る」ボタン
// ================================================================
function executeReturnStep() {
    clearLog();

    if (currentFloor === 1 && stepCount === 0) {
        addLog('>> 出口に到達した。村への帰還を開始。アイテムとゴールドを持ち帰りました。');
        exploreBtn.disabled = true;
        returnBtn.disabled  = true;
        setTimeout(() => returnToBase(false), 1500);
        return;
    }

    // SP消費（戻りは少なめ）
    if (!drainSP(1, '移動')) return;

    stepCount--;

    if (stepCount < 0) {
        currentFloor--;
        stepCount = stepsToNextFloor - 1;
        addLog(`<div class="floor-text">階段を上がった。B${currentFloor}F へ引き返す。</div>`);
        updateIllustration('explore');
        updateActionButtons(); updateUI(); return;
    }

    updateActionButtons();

    const isEscape = isBossDefeated;
    const r = Math.floor(Math.random() * 100);

    if (r < 35) {
        // 帰路のスタック蓄積
        addEnemyToStack(true);
    } else if (r < 45) {
        if (Math.random() < 0.5) {
            addLog('<< 道が崩落している！迂回を余儀なくされ、時間をロスした。', 'log-entry damage-text');
            stepCount++;
        } else {
            let dmg = Math.floor(currentHp * 0.1) + 1;
            currentHp = Math.max(0, currentHp - dmg);
            addLog(`<< 罠が作動！後退を急ぐあまり引っかかってしまった。 ${dmg} のダメージ。`, 'log-entry damage-text');
            if (currentHp === 0) { gameOver(); return; }
        }
        updateIllustration('event');
    } else if (r < 57) {
        findItem();
    } else if (r < 63) {
        gatherMaterial();
    } else if (r < 70) {
        triggerChoiceEvent();
    } else {
        updateIllustration('explore');
        const texts = isEscape ? escapeNothings : returnNothings;
        addLog(texts[Math.floor(Math.random() * texts.length)]);
    }

    if (applyHunger(4)) return;
    if (applyThirst(2)) return;

    if (enemyStack.length >= 5) {
        addLog(`<span class="boss-text">⚡ 退路を断たれた！強制戦闘！</span>`);
        fightStack(); return;
    }

    updateStackPanel();
    updateUI();
}

// ================================================================
// 内部ヘルパー
// ================================================================

// 敵をスタックに追加（auto-battleではない）
function addEnemyToStack(isReturn = false) {
    const pool = (activeDungeon.enemies && activeDungeon.enemies.length > 0)
        ? activeDungeon.enemies
        : (typeof getEnemiesForDungeon === 'function' ? getEnemiesForDungeon(activeDungeon) : enemiesBase);
    const baseEnemy = pool[Math.floor(Math.random() * pool.length)];
    const scale     = (1 + activeDungeon.diff * 0.07) * (1 + (currentFloor - 1) * 0.07);

    const prefixes = isReturn
        ? ['追跡する ', '待ち伏せていた ', '狂乱した ']
        : [''];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const enemy = {
        name:     prefix + baseEnemy.name,
        hp:       Math.floor(baseEnemy.hp  * scale),
        maxHp:    Math.floor(baseEnemy.hp  * scale),
        atk:      Math.floor(baseEnemy.atk * scale * 0.38) + 1,
        exp:      Math.floor(baseEnemy.exp * scale),
        speed:    baseEnemy.speed || 8,
        type:     baseEnemy.type  || '不明',
        magicAtk: Math.floor((baseEnemy.magicAtk || 0) * scale),
        mat:      baseEnemy.mat || null,
    };

    enemyStack.push(enemy);

    // 星座: extraEnemy（双子座）: 1体追加で出現
    if (!isReturn && typeof getConstellationEffects === 'function') {
        const _cex = getConstellationEffects();
        if (_cex.extraEnemy && enemyStack.length === 1) {
            const extraBase = pool[Math.floor(Math.random() * pool.length)];
            const extraEnemy = {
                name: '〔双〕' + extraBase.name,
                hp: Math.floor(extraBase.hp * scale * 0.8),
                maxHp: Math.floor(extraBase.hp * scale * 0.8),
                atk: Math.floor(extraBase.atk * scale * 0.3) + 1,
                exp: Math.floor(extraBase.exp * scale * 0.7),
                speed: extraBase.speed || 8,
                type: extraBase.type || '不明',
                magicAtk: Math.floor((extraBase.magicAtk || 0) * scale * 0.8),
                mat: extraBase.mat || null,
            };
            enemyStack.push(extraEnemy);
        }
    }

    // 星座: enemyHpMult（獅子座・死神座）
    if (typeof getConstellationEffects === 'function') {
        const _ceh = getConstellationEffects();
        if (_ceh.enemyHpMult) {
            enemy.hp    = Math.floor(enemy.hp    * _ceh.enemyHpMult);
            enemy.maxHp = Math.floor(enemy.maxHp * _ceh.enemyHpMult);
        }
    }

    const count = enemyStack.length;
    const risk  = count >= 4 ? 'var(--danger-red)' : count >= 2 ? 'var(--accent-orange)' : 'var(--accent-cyan)';
    addLog(`<span style="color:${risk}">⚠ ${enemy.name} <span style="color:var(--text-dim); font-size:11px">[${enemy.type}]</span> が近づいている！ スタック: ${count}体</span>`);
    updateIllustration('battle', enemy);
}

// 素材採集
function gatherMaterial() {
    updateIllustration('item');
    const matTypes = craftMaterialTypes || ['薬草','鉄くず','魔石','骨片','布切れ'];
    // ダンジョン難易度で素材の重み付け
    const weights = [3, 3, activeDungeon.diff, 2, 2]; // 難易度高いほど魔石が出やすい
    const totalW = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalW;
    let mat = matTypes[0];
    for (let i = 0; i < weights.length; i++) {
        roll -= weights[i];
        if (roll <= 0) { mat = matTypes[i]; break; }
    }

    materials[mat] = (materials[mat] || 0) + 1;
    addLog(`<span style="color:#aaddaa">🌿 素材を発見！ <b>【${mat}】</b> を拾った。（${mat}: ${materials[mat]}個）</span>`);
}

function spawnEnemy() {
    addEnemyToStack();
}

function findItem() {
    updateIllustration('item');

    let _matChance = 0.20;
    if (typeof getConstellationEffects === 'function') { const _cd = getConstellationEffects(); if(_cd.dropMult) _matChance *= _cd.dropMult; }
    if (Math.random() < _matChance) {
        const food = Object.assign({}, foodDatabase[Math.floor(Math.random() * foodDatabase.length)]);
        food.type = 'food';
        if (inventory.length < maxInventory) {
            inventory.push(food);
            addLog(`宝箱に <span style="color:#c8a060; font-weight:bold">🍖 【${food.name}】</span> が入っていた！`);
        } else {
            addLog(`🍖 【${food.name}】を発見したが、荷物が満杯で持てなかった。`);
        }
        return;
    }

    // 装備の倍率を大幅強化（アンディーメンテ仕様）
    const scale = Math.floor((1 + activeDungeon.diff * 0.5) * (1 + currentFloor * 0.3));
    const item  = generateItem(scale);

    if (inventory.length < maxInventory) {
        inventory.push(item);
        const r = getRarityInfo(item);
        addLog(`宝箱から <span style="color:${r.color}; font-weight:bold">［${item.name}］</span> <span style="color:${r.color}; font-size:12px">${r.label}</span> を入手した！`);
    } else {
        addLog(`［${item.name}］を発見したが、荷物が満杯で持てなかった。`);
    }
}

function triggerChoiceEvent() {
    updateIllustration('event');
    eventState = { active: true, type: 'console' };
    addLog(`<span class="event-text">謎めいた祭壇を発見した。触れてみるか？（危険かもしれない）</span>`);
    updateActionButtons();
}

function resolveConsoleEvent(isConnect) {
    eventState = { active: false, type: null };
    clearLog();

    if (isConnect) {
        let dmg = Math.floor(currentHp / 2);
        currentHp -= dmg;
        addLog(`<span class="damage-text">祭壇の呪いを受けた！ ${dmg} のダメージ！</span>`);

        const rareItem = generateItem(activeDungeon.diff + currentFloor + 5);
        rareItem.name  = '[祝福]' + rareItem.name;
        if (rareItem.type === 'weapon') rareItem.atk += 3; else rareItem.def += 3;

        if (inventory.length < maxInventory) {
            inventory.push(rareItem);
            addLog(`祭壇の加護として <span class="item-text">［${rareItem.name}］</span> を授かった！`);
        } else {
            addLog(`しかしストレージが満杯で抽出できなかった...`);
        }

        if (currentHp <= 0) { currentHp = 0; gameOver(); }
        else { updateActionButtons(); updateUI(); }
    } else {
        addLog(`>> 祭壇に近づかず通り過ぎた。何も起きなかった。`);
        updateActionButtons(); updateUI();
    }
}

// SP消費（0ならスキル不可だが移動は継続）
function drainSP(amount, reason) {
    if (!activeDungeon) return true;
    sp = Math.max(0, sp - amount);
    return true; // 移動は常に可能（SPゼロでも）
}

// 空腹減少
function applyHunger(amount = 5) {
    if (!activeDungeon) return;
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.hungerReduce) amount = Math.ceil(amount * me.hungerReduce);
    }
    hunger = Math.max(0, hunger - amount);
    if (hunger === 0) {
        const starvDmg = Math.max(1, Math.floor(maxHp * 0.08));
        currentHp = Math.max(0, currentHp - starvDmg);
        addLog(`<span class="damage-text">🍖 極度の飢餓で体力が奪われていく…… ${starvDmg} dmg！</span>`);
        if (currentHp <= 0) { currentHp = 0; gameOver(); return true; }
    } else if (hunger <= 25) {
        addLog(`<span style="color:var(--accent-orange); font-size:12px;">…お腹が空いてきた。食料を探せ。</span>`);
    }
    return false;
}

// 渇き減少
function applyThirst(amount = 3) {
    if (!activeDungeon) return;
    if (typeof getMedalEffects === 'function') {
        const me = getMedalEffects();
        if (me.thirstReduce) amount = Math.ceil(amount * me.thirstReduce);
    }
    thirst = Math.max(0, thirst - amount);
    if (thirst === 0) {
        const dehydrDmg = Math.max(1, Math.floor(maxHp * 0.05));
        currentHp = Math.max(0, currentHp - dehydrDmg);
        addLog(`<span class="damage-text">💧 激しい渇きで消耗している…… ${dehydrDmg} dmg！</span>`);
        if (currentHp <= 0) { currentHp = 0; gameOver(); return true; }
    } else if (thirst <= 25) {
        addLog(`<span style="color:#88aaff; font-size:12px;">…喉が渇いてきた。水を探せ。</span>`);
    }
    return false;
}

// ================================================================
// 自動探索システム
// ================================================================
let autoExplore      = false;
let autoExploreTimer = null;
let autoExploreSpeed = 1200; // ms

function toggleAutoExplore() {
    autoExplore = !autoExplore;
    if (autoExplore) {
        startAutoExplore();
    } else {
        stopAutoExplore();
    }
    renderAutoRow();
}

function setAutoSpeed(ms) {
    autoExploreSpeed = ms;
    if (autoExplore && autoExploreTimer) {
        stopAutoExplore();
        startAutoExplore();
    }
    renderAutoRow();
}

function startAutoExplore() {
    if (autoExploreTimer) clearInterval(autoExploreTimer);
    autoExploreTimer = setInterval(() => {
        if (!activeDungeon || battleState.active || eventState.active) return;
        if (isBossDefeated) { stopAutoExplore(); autoExplore = false; renderAutoRow(); return; }
        if (enemyStack.length > 0) { fightStack(); return; }
        executeExploreStep();
    }, autoExploreSpeed);
}

function stopAutoExplore() {
    if (autoExploreTimer) { clearInterval(autoExploreTimer); autoExploreTimer = null; }
}

function renderAutoRow() {
    const row = document.getElementById('autoRow');
    if (!row) return;
    if (!activeDungeon || isBossDefeated) { row.style.display = 'none'; return; }
    row.style.display = 'flex';

    const exOn  = autoExplore;
    const batOn = typeof autoBattle !== 'undefined' && autoBattle;
    const sp1   = autoExploreSpeed === 1200;
    const sp2   = autoExploreSpeed === 700;
    const sp3   = autoExploreSpeed === 350;

    const selStyle  = 'background:#60cdff;color:#111;border-color:#60cdff;font-weight:bold;box-shadow:0 0 8px rgba(96,205,255,0.6);';
    const exStyle   = 'background:#6ccb5f;color:#111;border-color:#6ccb5f;font-weight:bold;box-shadow:0 0 8px rgba(108,203,95,0.6);';
    const batStyle  = 'background:#ffa040;color:#111;border-color:#ffa040;font-weight:bold;box-shadow:0 0 8px rgba(255,165,0,0.6);';
    const offStyle  = '';
    row.innerHTML = `
        <button class="auto-btn" style="${exOn ? exStyle : offStyle}" onclick="toggleAutoExplore()">
            ${exOn ? '⏸ 自動停止' : '▶ 自動探索'}
        </button>
        <button class="auto-btn" style="${sp1 ? selStyle : offStyle}" onclick="setAutoSpeed(1200)">×1</button>
        <button class="auto-btn" style="${sp2 ? selStyle : offStyle}" onclick="setAutoSpeed(700)">×2</button>
        <button class="auto-btn" style="${sp3 ? selStyle : offStyle}" onclick="setAutoSpeed(350)">×3</button>
        <button class="auto-btn" style="margin-left:4px;${batOn ? batStyle : offStyle}" onclick="toggleAutoBattle()">
            ${batOn ? '⚔ 戦闘AUTO' : '⚔ AUTO'}
        </button>
    `;
}

function handleReturn() {
    if (typeof handleReturnBtn === 'function') handleReturnBtn();
    else {
        const returnBtn = document.getElementById('returnBtn');
        if (returnBtn && !returnBtn.disabled && !returnBtn.classList.contains('hidden')) returnBtn.click();
    }
}
