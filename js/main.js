// =============================================================
// main.js — イベントリスナー登録 & 初期化
// =============================================================

// 「戻る」ボタン
returnBtn.onclick = () => {
    if (eventState.active && eventState.type === 'console') {
        resolveConsoleEvent(false);
    } else if (battleState.active) {
        executeFlee();
    } else {
        executeReturnStep();
    }
};

// 「進む / 攻撃」ボタン
exploreBtn.onclick = () => {
    if (eventState.active && eventState.type === 'console') {
        resolveConsoleEvent(true);
    } else if (battleState.active) {
        executeBattleTurn();
    } else {
        executeExploreStep();
    }
};

// ゲーム起動
loadData();
