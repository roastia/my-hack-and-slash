// =============================================================
// save.js — セーブ・ロード・リセット
// =============================================================

let currentSlot = localStorage.getItem('rs_hns_current_slot') || '1';
let SAVE_KEY = 'rs_hns_save_' + currentSlot;
let resetConfirmTimer = null;

function selectSlot(slot) {
    currentSlot = String(slot);
    localStorage.setItem('rs_hns_current_slot', currentSlot);
    SAVE_KEY = 'rs_hns_save_' + currentSlot;
    // 状態リセット
    loadData();
    renderBaseScene();
    updateUI();
    renderSaveSlots();
    addLog(`>> セーブスロット ${currentSlot} を選択した。`);
}

function getSlotPreview(slot) {
    const saved = localStorage.getItem('rs_hns_save_' + slot);
    if (!saved) return null;
    try {
        const d = JSON.parse(saved);
        return { level: d.level || 1, kills: (d.stats && d.stats.kills) || 0, progress: d.currentProgress || 0 };
    } catch { return null; }
}

function renderSaveSlots() {
    const el = document.getElementById('saveSlotPanel');
    if (!el) return;
    let html = '<div style="color:var(--accent-cyan); font-size:13px; margin-bottom:6px;">セーブスロット選択</div>';
    for (let i = 1; i <= 3; i++) {
        const prev = getSlotPreview(i);
        const isActive = String(i) === currentSlot;
        const label = prev
            ? `Lv.${prev.level} / 討伐${prev.kills}体 / 進行度${prev.progress}`
            : '空のスロット';
        html += `<button class="mini-btn" style="display:block; width:100%; margin-bottom:4px; text-align:left;
            border-color:${isActive ? 'var(--accent-cyan)' : '#443'};
            color:${isActive ? 'var(--accent-cyan)' : 'var(--text-dim)'};
            font-size:12px; padding:5px 8px;"
            onclick="selectSlot(${i})">スロット${i}: ${label}${isActive ? ' ◀ 使用中' : ''}</button>`;
    }
    el.innerHTML = html;
}

function saveData() {
    const data = {
        starDust, battleMerit, permMaxHp, permBaseAtk, permBaseDef, hunger, maxHunger, baseSpeed, skillBook,
        sp, maxSp, thirst, maxThirst, baseMagic, baseSpirit, baseRange, tension, materials, enemyStack,
        equippedMedals, medalApLimit, costMedalAp,
        baseCondition, costRepairBase,
        dnaCounts, mutations, mutationSlots,
        traps,
        fishingRodLevel: fishingState ? fishingState.rodLevel : 1,
        fishingRodUpgradeCost: fishingState ? fishingState.rodUpgradeCost : 30,
        costHp, costAtk, costDef, stats,
        level, maxHp, currentHp, exp, nextExp,
        baseAttack, baseDefense,
        equipment, inventory, currentProgress, visitedDungeons,
        activeDungeonIndex: activeDungeon ? dungeons.indexOf(activeDungeon) : -1,
        currentFloor, stepCount, isBossDefeated, battleState, eventState
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
        renderBaseScene();
        updateUI();
        return;
    }

    try {
        const data = JSON.parse(saved);

        starDust     = data.starDust     || 0;
        battleMerit  = data.battleMerit  || 0;
        hunger       = data.hunger       !== undefined ? data.hunger : 100;
        maxHunger    = data.maxHunger    || 100;
        baseSpeed    = data.baseSpeed    || 10;
        permMaxHp    = data.permMaxHp    || 30;
        permBaseAtk  = data.permBaseAtk  || 2;
        permBaseDef  = data.permBaseDef  || 0;
        costHp       = data.costHp       || 10;
        costAtk      = data.costAtk      || 20;
        costDef      = data.costDef      || 15;
        stats        = data.stats        || { kills: 0, deaths: 0, returns: 0 };
        skillBook    = data.skillBook    || {};
        sp           = data.sp           !== undefined ? data.sp    : 100;
        maxSp        = data.maxSp        || 100;
        thirst       = data.thirst       !== undefined ? data.thirst : 100;
        maxThirst    = data.maxThirst    || 100;
        baseMagic    = data.baseMagic    || 0;
        baseSpirit   = data.baseSpirit   || 0;
        baseRange    = data.baseRange    || 0;
        tension      = data.tension      || 1;
        materials      = data.materials      || {};
        enemyStack     = [];  // セーブ後はスタックリセット
        equippedMedals = data.equippedMedals  || [];
        medalApLimit   = data.medalApLimit    || 10;
        costMedalAp    = data.costMedalAp     || 30;
        baseCondition  = data.baseCondition   !== undefined ? data.baseCondition : 100;
        costRepairBase = data.costRepairBase   || 20;
        dnaCounts      = data.dnaCounts        || {};
        mutations      = data.mutations        || [];
        mutationSlots  = data.mutationSlots    || 3;
        traps          = data.traps            || [];
        if (typeof fishingState !== 'undefined') {
            fishingState.rodLevel = data.fishingRodLevel || 1;
            fishingState.rodUpgradeCost = data.fishingRodUpgradeCost || 30;
        }

        level        = data.level        || 1;
        maxHp        = data.maxHp        || 30;
        currentHp    = data.currentHp    || 30;
        exp          = data.exp          || 0;
        nextExp      = data.nextExp      || 10;
        baseAttack   = data.baseAttack   || 2;
        baseDefense  = data.baseDefense  || 0;

        equipment        = data.equipment        || { weapon: null, helm: null, armor: null, shield: null };
        inventory        = data.inventory        || [];
        currentProgress  = data.currentProgress  || 0;
        visitedDungeons  = data.visitedDungeons  || [];

        const dIndex = data.activeDungeonIndex !== undefined ? data.activeDungeonIndex : -1;

        if (dIndex >= 0 && dIndex < dungeons.length) {
            if (currentHp <= 0) {
                // 死亡状態でセーブされていた場合は強制帰還
                activeDungeon = null;
                equipment     = { weapon: null, helm: null, armor: null, shield: null };
                inventory     = [];
                starDust      = 0;
                currentHp = maxHp = permMaxHp;
                baseAttack  = permBaseAtk;
                baseDefense = permBaseDef;
                level = 1; exp = 0;
                renderBaseScene();
                addLog('<span class="damage-text">>> 勇者は力尽きた状態で発見された。アイテムとゴールドを失っていた。</span>');
            } else {
                // 探索の復元
                activeDungeon  = dungeons[dIndex];
                currentFloor   = data.currentFloor   || 1;
                stepCount      = data.stepCount      || 0;
                isBossDefeated = data.isBossDefeated || false;
                battleState    = data.battleState    || { active: false, enemy: null, isBoss: false, turn: 0 };
                eventState     = data.eventState     || { active: false, type: null };

                baseScene.classList.add('hidden');
                exploreScene.classList.remove('hidden');
                locationDisplay.textContent = activeDungeon.name;
                floorDisplay.style.display  = 'inline';

                if (battleState.active) {
                    updateIllustration(battleState.isBoss ? 'boss' : 'battle', battleState.enemy);
                    clearLog();
                    addLog(`>> 冒険を再開した。<br><span class="event-text">戦闘が続いている...</span>`);
                } else if (eventState.active) {
                    updateIllustration('event');
                    clearLog();
                    addLog(`>> 冒険を再開した。<br><span class="event-text">謎めいた祭壇が目の前にある。触れてみるか？</span>`);
                } else {
                    updateIllustration('explore');
                    clearLog();
                    addLog(`>> 冒険を再開した。<br><span class="event-text">ダンジョンの探索を続けよう。</span>`);
                }
                updateActionButtons();
            }
        } else {
            renderBaseScene();
        }
    } catch (e) {
        console.error('Save data is corrupted', e);
        renderBaseScene();
    }

    updateUI();
}

function resetSaveData(btn) {
    if (btn.textContent.includes('本当によろしいですか')) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    } else {
        const originalText = btn.textContent;
        btn.textContent = '本当によろしいですか？（もう一度押す）';
        btn.style.backgroundColor = 'rgba(255, 51, 51, 0.2)';
        clearTimeout(resetConfirmTimer);
        resetConfirmTimer = setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = 'transparent';
        }, 3000);
    }
}
