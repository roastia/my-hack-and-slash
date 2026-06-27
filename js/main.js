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
// ゲームエフェクト関数群
// =============================================================

// ── フロートダメージ数字 ──────────────────────────────────────────
function showFloatDamage(amount, type) {
    const el = document.createElement('div');
    el.className = 'float-dmg ' + (type || 'normal');
    el.textContent = (type === 'heal') ? '+' + amount : (type === 'enemy' || type === 'poison') ? '-' + amount : '-' + amount;
    const vp = document.querySelector('.viewport-area') || document.body;
    const rect = vp.getBoundingClientRect();
    const cx = rect.left + rect.width  * (0.25 + Math.random() * 0.5);
    const cy = rect.top  + rect.height * (type === 'enemy' ? 0.6 : 0.2 + Math.random() * 0.4);
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}

// ── スキルカットイン ──────────────────────────────────────────────
function showSkillCutin(name, icon, color) {
    const old = document.querySelector('.skill-cutin');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'skill-cutin';
    el.style.borderColor = color || 'var(--accent-cyan)';
    el.innerHTML = '<span style="font-size:22px;margin-right:10px;">' + (icon||'⚡') + '</span>'
                 + '<span style="font-size:15px;font-weight:bold;color:#fff;letter-spacing:1px;">' + name + '</span>';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
}

// ── 爆発パーティクル ──────────────────────────────────────────────
function showExplosion() {
    const vp = document.querySelector('.viewport-area');
    const rect = vp ? vp.getBoundingClientRect()
                    : { left: window.innerWidth/2-50, top: window.innerHeight/2-50, width:100, height:100 };
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const colors = ['#ff6644','#ffaa00','#ff2200','#ffdd00','#ff8800','#ffbbaa'];
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'explosion-particle';
        const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
        const dist  = 55 + Math.random() * 90;
        p.style.left = (cx - 4) + 'px';
        p.style.top  = (cy - 4) + 'px';
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
        p.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
        p.style.animationDelay = (Math.random() * 0.08) + 's';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

// ── ボス撃破confetti ──────────────────────────────────────────────
function showConfetti() {
    showExplosion();
    const colors = ['#ffd700','#ff6699','#66ffcc','#ff9900','#66aaff','#ff44aa','#aaffaa'];
    for (let i = 0; i < 70; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        const sz = (6 + Math.random() * 9) + 'px';
        p.style.left   = (Math.random() * 100) + 'vw';
        p.style.top    = '-20px';
        p.style.width  = sz; p.style.height = sz;
        p.style.background   = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        p.style.animationDuration = (1.6 + Math.random() * 2.2) + 's';
        p.style.animationDelay   = (Math.random() * 0.9) + 's';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 5000);
    }
    triggerFlash('boss');
}

// ── バナー通知 ────────────────────────────────────────────────────
function showBanner(mainText, color, subText) {
    const el = document.createElement('div');
    el.className = 'game-banner';
    el.style.borderColor = color || '#ffd700';
    el.style.boxShadow   = '0 0 28px ' + (color || '#ffd700') + '55';
    el.innerHTML = '<div style="color:' + (color||'#ffd700') + ';font-size:17px;font-weight:bold;">' + mainText + '</div>'
                 + (subText ? '<div style="color:#bbb;font-size:12px;margin-top:3px;">' + subText + '</div>' : '');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3400);
}

// ── ボス遭遇エフェクト ────────────────────────────────────────────
function showBossEncounterEffect() {
    const vp = document.querySelector('.viewport-area');
    if (vp) {
        vp.classList.add('boss-encounter-pulse');
        setTimeout(() => vp.classList.remove('boss-encounter-pulse'), 2000);
    }
    const ov = document.getElementById('gameFlashOverlay');
    if (ov) {
        ov.style.background = 'rgba(255,0,0,0.25)';
        ov.classList.remove('game-flash-active');
        void ov.offsetWidth;
        ov.classList.add('game-flash-active');
        ov.addEventListener('animationend', () => ov.classList.remove('game-flash-active'), { once: true });
    }
}

// ── HPバー被弾シェイク ────────────────────────────────────────────
function shakeHpBar() {
    const row = document.querySelector('.gauge-row');
    if (!row) return;
    row.classList.remove('hp-bar-shake');
    void row.offsetWidth;
    row.classList.add('hp-bar-shake');
    row.addEventListener('animationend', () => row.classList.remove('hp-bar-shake'), { once: true });
}

// ── HP危険グロー更新 ──────────────────────────────────────────────
function updateHpDangerGlow() {
    const row = document.querySelector('.gauge-row');
    if (!row) return;
    if (typeof currentHp !== 'undefined' && typeof maxHp !== 'undefined'
        && currentHp > 0 && currentHp / maxHp <= 0.2) {
        row.classList.add('hp-danger-glow');
    } else {
        row.classList.remove('hp-danger-glow');
    }
}

// ── アイテムドロップポップ ────────────────────────────────────────
function showItemPopup(text, color) {
    const el = document.createElement('div');
    el.className = 'item-popup';
    el.innerHTML = text;
    el.style.color = color || '#ffd700';
    const vp = document.querySelector('.viewport-area');
    const rect = vp ? vp.getBoundingClientRect() : { left: window.innerWidth/2, bottom: window.innerHeight/2 };
    el.style.left = (rect.left + (vp ? vp.offsetWidth/2 : 0)) + 'px';
    el.style.top  = (rect.bottom - 30) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
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
