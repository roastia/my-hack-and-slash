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

// ============================================================
// モバイルUI
// ============================================================

let _currentMobileView = 'action';
let _exploreSceneMoved = false;

function handleMobileLayout() {
    const isMobile = window.innerWidth <= 768;
    const exploreScene = document.getElementById('exploreScene');
    const centerPanel  = document.querySelector('.center-panel');
    const rightPanel   = document.querySelector('.right-panel');
    const actionGroup  = document.querySelector('.action-group');

    if (isMobile && !_exploreSceneMoved) {
        // #exploreScene を center-panel の action-group の前に移動
        centerPanel.insertBefore(exploreScene, actionGroup);
        _exploreSceneMoved = true;
    } else if (!isMobile && _exploreSceneMoved) {
        // デスクトップに戻したら right-panel へ戻す
        rightPanel.appendChild(exploreScene);
        _exploreSceneMoved = false;
        // パネルの表示をリセット
        document.querySelector('.left-panel').classList.remove('mob-active');
        rightPanel.classList.remove('mob-active');
    }
}

function mobileSwitchView(view) {
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    _currentMobileView = view;
    const leftPanel  = document.querySelector('.left-panel');
    const rightPanel = document.querySelector('.right-panel');
    const centerPanel = document.querySelector('.center-panel');

    // すべてのパネルを隠す
    leftPanel.classList.remove('mob-active');
    rightPanel.classList.remove('mob-active');
    centerPanel.style.display = '';

    // ボタンの active 状態をリセット
    document.querySelectorAll('#mobileBottomNav button').forEach(b => b.classList.remove('mob-tab-active'));

    if (view === 'action') {
        document.getElementById('mnavAction').classList.add('mob-tab-active');
        // 中央パネルはそのまま表示
    } else if (view === 'inventory') {
        document.getElementById('mnavInventory').classList.add('mob-tab-active');
        rightPanel.classList.add('mob-active');
        centerPanel.style.display = 'none';
    } else if (view === 'status') {
        document.getElementById('mnavStatus').classList.add('mob-tab-active');
        leftPanel.classList.add('mob-active');
        centerPanel.style.display = 'none';
    }
}

function updateMobileTopBar() {
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    const locEl   = document.getElementById('mobileLocDisplay');
    const fillEl  = document.getElementById('mobileHpFill');
    const textEl  = document.getElementById('mobileHpText');
    const goldEl  = document.getElementById('mobileGoldDisp');

    if (locEl)  locEl.textContent  = document.getElementById('locationDisplay').textContent;
    if (textEl) textEl.textContent = `${currentHp}/${maxHp}`;
    if (goldEl) goldEl.textContent = starDust;

    if (fillEl) {
        const pct = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
        fillEl.style.width = pct + '%';
        fillEl.style.background = pct > 50
            ? 'var(--accent-green)'
            : pct > 25 ? 'var(--accent-orange)' : 'var(--danger-red)';
    }
}

// リサイズ時にレイアウト再調整
window.addEventListener('resize', handleMobileLayout);

// ゲーム起動（JSONデータを先にロード → セーブデータ復元）
async function initGame() {
    await loadGameData();   // data/*.json を fetch
    loadData();             // localStorage からセーブ復元
    handleMobileLayout();
}
initGame();
