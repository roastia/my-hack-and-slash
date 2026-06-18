// =============================================================
// save.js — セーブ・ロード・リセット
// =============================================================

const SAVE_KEY = 'rs_hns_save';
let resetConfirmTimer = null;

function saveData() {
    const data = {
        starDust, permMaxHp, permBaseAtk, permBaseDef,
        costHp, costAtk, costDef, stats,
        level, maxHp, currentHp, exp, nextExp,
        baseAttack, baseDefense,
        equipment, inventory, currentProgress,
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
        permMaxHp    = data.permMaxHp    || 30;
        permBaseAtk  = data.permBaseAtk  || 2;
        permBaseDef  = data.permBaseDef  || 0;
        costHp       = data.costHp       || 10;
        costAtk      = data.costAtk      || 20;
        costDef      = data.costDef      || 15;
        stats        = data.stats        || { kills: 0, deaths: 0, returns: 0 };

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
                addLog('<span class="damage-text">>> システムエラー。致命的な損傷から復旧しました。アイテムと星屑を喪失しました。</span>');
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
                    addLog(`>> セーブデータを復元しました。<br><span class="event-text">戦闘を再開します...</span>`);
                } else if (eventState.active) {
                    updateIllustration('event');
                    clearLog();
                    addLog(`>> セーブデータを復元しました。<br><span class="event-text">>> 未知のコンソールを発見した。アクセスを要求している。</span>`);
                } else {
                    updateIllustration('explore');
                    clearLog();
                    addLog(`>> セーブデータを復元しました。<br><span class="event-text">探索を再開します...</span>`);
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
