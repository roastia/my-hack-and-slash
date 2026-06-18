// =============================================================
// explore.js — 探索ロジック（進行・帰還・イベント）
// =============================================================

// ダンジョン選択時：初回ならストーリー表示、既訪問なら即開始
let _pendingDungeonIndex = -1;

function tryEnterDungeon(index) {
    if (!visitedDungeons.includes(index) && dungeons[index].story) {
        _pendingDungeonIndex = index;
        const d = dungeons[index];
        document.getElementById('storyLocation').textContent = `[ ${d.name} ]`;
        document.getElementById('storyText').innerHTML =
            d.story.replace(/\n/g, '<br>');
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

    level = 1; exp = 0; nextExp = 10;
    maxHp = currentHp = permMaxHp;
    baseAttack  = permBaseAtk;
    baseDefense = permBaseDef;

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };

    clearLog();
    baseScene.classList.add('hidden');
    exploreScene.classList.remove('hidden');
    locationDisplay.textContent = activeDungeon.name;
    floorDisplay.style.display  = 'inline';

    exploreBtn.disabled    = false;
    exploreBtn.textContent = '［ 進 む ］';
    returnBtn.classList.remove('hidden');
    returnBtn.disabled     = false;
    returnBtn.textContent  = '［ 戻 る ］';

    addLog(`<br><span style="color:var(--accent-orange)">⚔ 冒険開始！</span><br>【${activeDungeon.name}】へ踏み込んだ...`);
    updateIllustration('explore');
    updateUI();
    updateActionButtons();
}

// 拠点へ帰還
function returnToBase(isDead = false) {
    activeDungeon = null;
    exploreScene.classList.add('hidden');
    baseScene.classList.remove('hidden');

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };

    if (isDead) {
        stats.deaths++;
        equipment = { weapon: null, helm: null, armor: null, shield: null };
        inventory = [];
        starDust  = 0;
    } else {
        stats.returns++;
    }

    currentHp = maxHp = permMaxHp;
    baseAttack  = permBaseAtk;
    baseDefense = permBaseDef;
    level = 1; exp = 0;

    renderBaseScene();
    updateUI();
}

// 「進む」ボタン処理
function executeExploreStep() {
    clearLog();
    stepCount++;

    // 最深部での処理
    if (currentFloor === activeDungeon.maxFloor && stepCount >= stepsToNextFloor) {
        if (isBossDefeated) {
            addLog('>> 最深部。残骸が散らばっているだけで、何もない。');
            updateActionButtons();
            updateUI();
        } else {
            const boss = activeDungeon.boss;
            startBattle(boss.name, boss.hp, boss.atk, boss.exp, true);
        }
        return;
    }

    // 次の階層へ進む
    if (stepCount >= stepsToNextFloor) {
        currentFloor++;
        stepCount = 0;
        addLog(`<div class="floor-text">階段を下りた。<br>B${currentFloor}F へ進入。</div>`);
        updateIllustration('explore');
        if (currentFloor === activeDungeon.maxFloor) {
            addLog(`<span class="boss-text">⚠ 強大な気配を感じる……最深部に何かいる。</span>`);
        }
        updateUI();
        return;
    }

    const r = Math.floor(Math.random() * 100);
    if (r < 45) {
        spawnEnemy();
    } else if (r < 70) {
        findItem();
    } else if (r < 80) {
        triggerChoiceEvent();
    } else {
        updateIllustration('explore');
        addLog(nothings[Math.floor(Math.random() * nothings.length)]);
    }
    updateUI();
}

// 「戻る」ボタン処理
function executeReturnStep() {
    clearLog();

    // 入り口に着いたら帰還
    if (currentFloor === 1 && stepCount === 0) {
        addLog('>> 出口に到達した。村への帰還を開始。アイテムとゴールドを持ち帰りました。');
        exploreBtn.disabled = true;
        returnBtn.disabled  = true;
        setTimeout(() => returnToBase(false), 1500);
        return;
    }

    stepCount--;

    // 前の階層へ戻る
    if (stepCount < 0) {
        currentFloor--;
        stepCount = stepsToNextFloor - 1;
        addLog(`<div class="floor-text">階段を上がった。<br>B${currentFloor}F へ引き返す。</div>`);
        updateIllustration('explore');
        updateActionButtons();
        updateUI();
        return;
    }

    updateActionButtons();

    const isEscape = isBossDefeated;
    const r = Math.floor(Math.random() * 100);

    if (r < 35) {
        // 帰路で遭遇
        const baseEnemy = enemiesBase[Math.floor(Math.random() * enemiesBase.length)];
        const prefixes  = ['追跡する ', '待ち伏せていた ', '狂乱した '];
        const enName    = prefixes[Math.floor(Math.random() * prefixes.length)] + baseEnemy.name;
        const scale     = (1 + activeDungeon.diff * 0.07) * (1 + (currentFloor - 1) * 0.07);

        addLog(isEscape
            ? '<< 空間の崩壊から逃れる途中、敵に阻まれた！'
            : '<< 帰路を急ぐ中、敵の残党に見つかった！', 'log-entry damage-text');

        startBattle(
            enName,
            Math.floor(baseEnemy.hp  * scale),
            Math.floor(baseEnemy.atk * scale * 0.45) + 1,
            Math.floor(baseEnemy.exp * scale),
            false
        );
    } else if (r < 45) {
        if (Math.random() < 0.5) {
            addLog('<< 道が崩落している！迂回を余儀なくされ、時間をロスした。', 'log-entry damage-text');
            stepCount++;
        } else {
            let dmg   = Math.floor(currentHp * 0.1) + 1;
            currentHp = Math.max(0, currentHp - dmg);
            addLog(`<< 罠が作動！後退を急ぐあまり引っかかってしまった。 ${dmg} のダメージ。`, 'log-entry damage-text');
            if (currentHp === 0) gameOver();
        }
        updateIllustration('event');
    } else if (r < 60) {
        findItem();
    } else if (r < 70) {
        triggerChoiceEvent();
    } else {
        updateIllustration('explore');
        const texts = isEscape ? escapeNothings : returnNothings;
        addLog(texts[Math.floor(Math.random() * texts.length)]);
    }
    updateUI();
}

// --- 内部ヘルパー ---

function spawnEnemy() {
    const baseEnemy = enemiesBase[Math.floor(Math.random() * enemiesBase.length)];
    const scale     = (1 + activeDungeon.diff * 0.07) * (1 + (currentFloor - 1) * 0.07);

    startBattle(
        baseEnemy.name,
        Math.floor(baseEnemy.hp  * scale),
        Math.floor(baseEnemy.atk * scale * 0.38) + 1,
        Math.floor(baseEnemy.exp * scale),
        false
    );
}

function findItem() {
    updateIllustration('item');

    const scale = Math.floor((1 + activeDungeon.diff * 0.3) * (1 + currentFloor * 0.2));
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
        let dmg   = Math.floor(currentHp / 2);
        currentHp -= dmg;
        addLog(`<span class="damage-text">祭壇の呪いを受けた！ ${dmg} のダメージ！</span>`);

        const rareItem     = generateItem(activeDungeon.diff + currentFloor + 5);
        rareItem.name      = '[祝福]' + rareItem.name;
        if (rareItem.type === 'weapon') rareItem.atk += 3; else rareItem.def += 3;

        if (inventory.length < maxInventory) {
            inventory.push(rareItem);
            addLog(`祭壇の加護として <span class="item-text">［${rareItem.name}］</span> を授かった！`);
        } else {
            addLog(`しかしストレージが満杯で抽出できなかった...`);
        }

        if (currentHp <= 0) {
            currentHp = 0;
            gameOver();
        } else {
            updateActionButtons();
            updateUI();
        }
    } else {
        addLog(`>> 祭壇に近づかず通り過ぎた。何も起きなかった。`);
        updateActionButtons();
        updateUI();
    }
}
