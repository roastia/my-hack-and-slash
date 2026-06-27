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
        // 中央パネルはそのまま。拠点にいるなら地図タブへ
        const inBase = !document.getElementById('exploreScene') ||
            document.getElementById('exploreScene').classList.contains('hidden');
        if (inBase && typeof switchTab === 'function') switchTab('map');
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
function initGame() {
    loadGameData();
    loadData();
    // オフライン報酬チェック
    setTimeout(() => { if (typeof checkOfflineRewards === 'function') checkOfflineRewards(); }, 500);             // localStorage からセーブ復元
    handleMobileLayout();
}
initGame();

// ヘルプTooltipシステム
function showHelp(title, desc) {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    document.getElementById('helpTitle').textContent = title;
    document.getElementById('helpDesc').innerHTML = desc;
    modal.style.display = 'block';
}
function closeHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) modal.style.display = 'none';
}

// ============================================================
// 画面エフェクト
// ============================================================

// クリティカル時：ログの最新エントリを揺らす
function triggerShake() {
    const log = document.getElementById('logContent');
    if (!log) return;
    const last = log.lastElementChild;
    if (!last) return;
    last.classList.remove('game-shake');
    void last.offsetWidth;
    last.classList.add('game-shake');
    last.addEventListener('animationend', () => last.classList.remove('game-shake'), { once: true });
}

// ヒット・ボス撃破時：画面フラッシュ
function triggerFlash(intensity) {
    const ov = document.getElementById('gameFlashOverlay');
    if (!ov) return;
    ov.style.background = intensity === 'boss' ? '#ffe8aa' : '#ffffff';
    ov.classList.remove('game-flash-active');
    void ov.offsetWidth;
    ov.classList.add('game-flash-active');
    ov.addEventListener('animationend', () => ov.classList.remove('game-flash-active'), { once: true });
}

// レアアイテム入手時：指定要素に虹色アニメ（6秒後に解除）
function triggerRainbow(el) {
    if (!el) return;
    el.classList.add('game-rainbow');
    setTimeout(() => el.classList.remove('game-rainbow'), 6000);
}


// =============================================================
// プルトゥリフレッシュ（イラスト下スワイプでリロード）
// =============================================================
(function initPullToRefresh() {
    const THRESHOLD = 65;  // px: この距離以上引っ張ったらリロード
    let startY = 0, pulling = false, indicator = null;

    function getIndicator() {
        if (!indicator) {
            indicator = document.getElementById('ptrIndicator');
        }
        return indicator;
    }

    function setIndicatorState(progress, releasing) {
        const el = getIndicator();
        if (!el) return;
        const pct = Math.min(progress / THRESHOLD, 1);
        const rotate = pct * 180;
        el.style.opacity = pct.toFixed(2);
        el.style.transform = `translateY(${Math.min(progress * 0.6, 40)}px)`;
        const arrow = el.querySelector('.ptr-arrow');
        if (arrow) arrow.style.transform = `rotate(${rotate}deg)`;
        const label = el.querySelector('.ptr-label');
        if (label) label.textContent = releasing ? '🔄 リロード！' : (pct >= 1 ? '↑ 離してリロード' : '↓ 引っ張ってリロード');
        if (releasing) el.classList.add('ptr-releasing');
        else el.classList.remove('ptr-releasing');
    }

    function hideIndicator() {
        const el = getIndicator();
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px)';
        el.classList.remove('ptr-releasing');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const vp = document.querySelector('.viewport-area');
        if (!vp) return;

        vp.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            pulling = false;
        }, { passive: true });

        vp.addEventListener('touchmove', (e) => {
            const dy = e.touches[0].clientY - startY;
            if (dy > 0) {
                pulling = true;
                setIndicatorState(dy, false);
            }
        }, { passive: true });

        vp.addEventListener('touchend', (e) => {
            if (!pulling) return;
            const dy = e.changedTouches[0].clientY - startY;
            if (dy >= THRESHOLD) {
                setIndicatorState(dy, true);
                setTimeout(() => location.reload(), 500);
            } else {
                hideIndicator();
            }
            pulling = false;
        });
    });
})();
