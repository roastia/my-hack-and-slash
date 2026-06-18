// =============================================================
// ui.js — DOM参照、ステータス計算、画面描画
// =============================================================

// --- DOM参照 ---
const locationDisplay  = document.getElementById('locationDisplay');
const floorDisplay     = document.getElementById('floorDisplay');
const currentHpDisplay = document.getElementById('currentHpDisplay');
const maxHpDisplay     = document.getElementById('maxHpDisplay');
const levelDisplay     = document.getElementById('levelDisplay');
const expDisplay       = document.getElementById('expDisplay');
const nextExpDisplay   = document.getElementById('nextExpDisplay');
const attackDisplay    = document.getElementById('attackDisplay');
const defenseDisplay   = document.getElementById('defenseDisplay');
const critDisplay      = document.getElementById('critDisplay');
const stealDisplay     = document.getElementById('stealDisplay');
const spiritDisplay    = document.getElementById('spiritDisplay');
const itemCountDisplay = document.getElementById('itemCountDisplay');
const inventoryList    = document.getElementById('inventoryList');
const stardustDisplay  = document.getElementById('stardustDisplay');

const baseScene    = document.getElementById('baseScene');
const exploreScene = document.getElementById('exploreScene');
const logContent   = document.getElementById('logContent');
const exploreBtn   = document.getElementById('exploreBtn');
const returnBtn    = document.getElementById('returnBtn');

const progressContainer = document.getElementById('progressContainer');
const distBase          = document.getElementById('distBase');
const distBoss          = document.getElementById('distBoss');
const progressBar       = document.getElementById('progressBar');

// =============================================================
// ステータス計算（装備込み）
// =============================================================

function getTotalAttack() {
    let total = baseAttack;
    Object.values(equipment).forEach(eq => { if (eq && eq.atk) total += eq.atk; });
    return total;
}

function getTotalDef() {
    let total = baseDefense;
    Object.values(equipment).forEach(eq => { if (eq && eq.def) total += eq.def; });
    return total;
}

function getCritRate() {
    let total = 0;
    Object.values(equipment).forEach(eq => { if (eq && eq.crit) total += eq.crit; });
    return total;
}

function getStealRate() {
    let total = 0;
    Object.values(equipment).forEach(eq => { if (eq && eq.steal) total += eq.steal; });
    return total;
}

function getTotalSpirits() {
    let total = {};
    Object.values(equipment).forEach(eq => {
        if (eq && eq.spirits) {
            for (let k in eq.spirits) {
                if (total[k]) total[k].val += eq.spirits[k].val;
                else total[k] = { ...eq.spirits[k] };
            }
        }
    });
    return total;
}

function getSpiritText(spiritsObj) {
    if (!spiritsObj || Object.keys(spiritsObj).length === 0) return '無';
    let parts = [];
    for (let k in spiritsObj) parts.push(`<span style="color:${spiritsObj[k].color}">${k}${spiritsObj[k].val}</span>`);
    return parts.join(' ');
}

// =============================================================
// イラスト（中央ビューポート）
// =============================================================

function updateIllustration(type, enemy = null) {
    const content = document.getElementById('viewportContent');
    const cCyan = 'var(--accent-cyan)', cRed = 'var(--danger-red)';
    const cGreen = 'var(--accent-green)', cMag = 'var(--accent-magenta)';
    const cOrg = 'var(--accent-orange)', cDim = 'var(--text-dim)';

    let enemyInfo = '';
    if (enemy) {
        let hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        enemyInfo = `<text x="50" y="10" fill="white" font-size="6" text-anchor="middle" font-family="monospace">${enemy.name}</text>
                     <rect x="20" y="13" width="60" height="2" fill="#222" />
                     <rect x="20" y="13" width="${60 * hpRatio}" height="2" fill="${cRed}" />
                     <text x="50" y="21" fill="white" font-size="5" text-anchor="middle" font-family="monospace">HP: ${enemy.hp} / ${enemy.maxHp}</text>`;
    }

    let svg = '';
    switch (type) {
        case 'base':
            svg = `<svg viewBox="0 0 100 100" stroke="${cCyan}" fill="none" stroke-width="2"><rect x="10" y="20" width="80" height="60"/><line x1="10" y1="85" x2="90" y2="85"/><circle cx="80" cy="30" r="3" fill="${cCyan}"/></svg>`;
            content.style.color = cCyan; break;
        case 'lab':
            svg = `<svg viewBox="0 0 100 100" stroke="${cGreen}" fill="none" stroke-width="2"><path d="M 30 20 Q 50 50 30 80 M 70 20 Q 50 50 70 80"/><line x1="35" y1="30" x2="65" y2="30"/><line x1="40" y1="50" x2="60" y2="50"/><line x1="35" y1="70" x2="65" y2="70"/><circle cx="50" cy="50" r="2" fill="${cGreen}"/></svg>`;
            content.style.color = cGreen; break;
        case 'explore':
            svg = `<svg viewBox="0 0 100 100" stroke="${cDim}" fill="none" stroke-width="1"><path d="M 50 50 L 10 100 M 50 50 L 90 100" stroke-dasharray="5,5"/><circle cx="20" cy="30" r="1.5" fill="${cCyan}" stroke="none"/><circle cx="80" cy="20" r="1" fill="${cCyan}" stroke="none"/><path d="M 45 45 L 55 45 L 50 50 Z" fill="${cDim}"/></svg>`;
            content.style.color = cDim; break;
        case 'battle':
            svg = `<svg viewBox="0 0 100 100" stroke="${cRed}" fill="none" stroke-width="2">${enemyInfo}<polygon points="50,30 80,80 20,80"/><circle cx="50" cy="60" r="10" fill="${cRed}" opacity="0.5"/><line x1="10" y1="90" x2="90" y2="90" stroke="${cDim}" stroke-dasharray="2,2"/></svg>`;
            content.style.color = cRed; break;
        case 'boss':
            svg = `<svg viewBox="0 0 100 100" stroke="${cMag}" fill="none" stroke-width="3">${enemyInfo}<circle cx="50" cy="60" r="30" stroke-dasharray="10 5"/><circle cx="50" cy="60" r="10" fill="${cRed}" opacity="0.3"/><polygon points="50,50 60,70 40,70" fill="${cMag}"/></svg>`;
            content.style.color = cMag; break;
        case 'item':
            svg = `<svg viewBox="0 0 100 100" stroke="${cGreen}" fill="none" stroke-width="2"><polygon points="50,20 80,40 50,60 20,40" fill="${cGreen}" opacity="0.2"/><polygon points="20,40 50,60 50,90 20,70"/><polygon points="80,40 50,60 50,90 80,70"/></svg>`;
            content.style.color = cGreen; break;
        case 'event':
            svg = `<svg viewBox="0 0 100 100" stroke="${cOrg}" fill="none" stroke-width="3"><polygon points="50,15 90,85 10,85"/><line x1="50" y1="35" x2="50" y2="65" stroke-width="4"/><circle cx="50" cy="75" r="3" fill="${cOrg}"/></svg>`;
            content.style.color = cOrg; break;
        case 'death':
            svg = `<svg viewBox="0 0 100 100" stroke="${cRed}" fill="none" stroke-width="2"><circle cx="42" cy="50" r="4" fill="${cRed}"/><circle cx="58" cy="50" r="4" fill="${cRed}"/><line x1="10" y1="10" x2="90" y2="90" stroke="${cRed}" opacity="0.5"/><line x1="90" y1="10" x2="10" y2="90" stroke="${cRed}" opacity="0.5"/></svg>`;
            content.style.color = cRed; break;
    }
    content.innerHTML = svg;
}

// =============================================================
// ログ
// =============================================================

function addLog(message, className = 'log-entry') {
    const el = document.createElement('div');
    el.className = className;
    el.innerHTML = message;
    logContent.appendChild(el);
    exploreScene.scrollTop = exploreScene.scrollHeight;
}

function clearLog() {
    logContent.innerHTML = '';
}

// =============================================================
// アクションボタン状態管理
// =============================================================

function updateActionButtons() {
    if (!activeDungeon) {
        exploreBtn.disabled = true;
        exploreBtn.textContent = '［ 目 標 を 選 択 ］';
        returnBtn.classList.add('hidden');
        exploreBtn.classList.remove('btn-attack');
        returnBtn.classList.remove('btn-flee');
        exploreScene.classList.remove('battle-mode-bg');
        exploreBtn.style.order = '1';
        returnBtn.style.order = '2';
        exploreBtn.style.fontSize = '';
        exploreBtn.style.letterSpacing = '';
        returnBtn.style.fontSize = '';
        returnBtn.style.letterSpacing = '';
        return;
    }

    if (eventState.active && eventState.type === 'console') {
        exploreBtn.disabled = false;
        exploreBtn.textContent = '［接続: HP半減/遺物］';
        returnBtn.classList.remove('hidden');
        returnBtn.disabled = false;
        returnBtn.textContent = '［ 無視する ］';
        exploreBtn.style.order = '1';
        returnBtn.style.order = '2';
        exploreBtn.style.fontSize = '16px';
        exploreBtn.style.letterSpacing = '1px';
        returnBtn.style.fontSize = '16px';
        returnBtn.style.letterSpacing = '2px';
        exploreBtn.classList.remove('btn-attack');
        returnBtn.classList.remove('btn-flee');
        exploreScene.classList.remove('battle-mode-bg');
        return;
    }

    // スタイルリセット
    exploreBtn.style.fontSize = '';
    exploreBtn.style.letterSpacing = '';
    returnBtn.style.fontSize = '';
    returnBtn.style.letterSpacing = '';

    if (battleState.active) {
        exploreBtn.disabled = false;
        exploreBtn.textContent = '［ 攻 撃 ］';
        exploreBtn.classList.add('btn-attack');
        returnBtn.classList.remove('hidden');
        returnBtn.disabled = false;
        returnBtn.textContent = '［ 逃 走 ］';
        returnBtn.classList.add('btn-flee');
        exploreScene.classList.add('battle-mode-bg');
        exploreBtn.style.order = '1';
        returnBtn.style.order = '2';
    } else {
        if (isBossDefeated) {
            exploreBtn.disabled = true;
            exploreBtn.textContent = '［ 最 深 部 ］';
            exploreBtn.style.order = '2';
            returnBtn.style.order = '1';
        } else {
            exploreBtn.disabled = false;
            exploreBtn.textContent = '［ 進 む ］';
            exploreBtn.style.order = '1';
            returnBtn.style.order = '2';
        }
        exploreBtn.classList.remove('btn-attack');
        returnBtn.classList.remove('hidden');
        returnBtn.disabled = false;
        returnBtn.textContent = '［ 戻 る ］';
        returnBtn.classList.remove('btn-flee');
        exploreScene.classList.remove('battle-mode-bg');
    }
}

// =============================================================
// メインUI更新
// =============================================================

function formatEq(eq, prop) {
    if (!eq) return '<span style="color:var(--text-dim)">未装備</span>';
    let val = eq[prop] || 0;
    return `<span style="color:var(--text-main)">${eq.name}</span> <span style="font-size:12px;">(+${val})</span>`;
}

function updateUI() {
    // プログレスバー
    if (activeDungeon) {
        floorDisplay.textContent = `(Sec:${currentFloor}/${activeDungeon.maxFloor} Step:${stepCount})`;
        progressContainer.style.display = 'flex';

        let totalSteps   = activeDungeon.maxFloor * stepsToNextFloor;
        let currentSteps = (currentFloor - 1) * stepsToNextFloor + stepCount;
        let remainToBoss = Math.max(0, totalSteps - currentSteps);

        distBase.textContent = currentSteps;
        distBoss.textContent = remainToBoss;

        let pct = Math.min(100, (currentSteps / totalSteps) * 100);
        progressBar.style.width = `${pct}%`;

        const color = isBossDefeated ? 'var(--accent-orange)' : 'var(--accent-cyan)';
        progressContainer.querySelector('div').style.color = color;
        progressBar.style.backgroundColor = color;
        progressBar.style.boxShadow = `0 0 5px ${color}`;
    } else {
        progressContainer.style.display = 'none';
    }

    // ステータス
    currentHpDisplay.textContent = currentHp;
    maxHpDisplay.textContent     = maxHp;
    levelDisplay.textContent     = level;
    expDisplay.textContent       = exp;
    nextExpDisplay.textContent   = nextExp;
    attackDisplay.textContent    = getTotalAttack();
    defenseDisplay.textContent   = getTotalDef();
    critDisplay.textContent      = getCritRate();
    stealDisplay.textContent     = getStealRate();
    stardustDisplay.textContent  = starDust;
    spiritDisplay.innerHTML      = getSpiritText(getTotalSpirits());

    // 装備欄
    document.getElementById('eqWeapon').innerHTML = formatEq(equipment.weapon, 'atk');
    document.getElementById('eqHelm').innerHTML   = formatEq(equipment.helm,   'def');
    document.getElementById('eqArmor').innerHTML  = formatEq(equipment.armor,  'def');
    document.getElementById('eqShield').innerHTML = formatEq(equipment.shield, 'def');

    // インベントリ
    itemCountDisplay.textContent = inventory.length;
    inventoryList.innerHTML = '';
    const typeIcons = { weapon: '⚔️', helm: '🪖', armor: '👕', shield: '🛡️' };

    if (inventory.length === 0) {
        inventoryList.innerHTML = '<li class="empty-text">空間は虚無に包まれている</li>';
    } else {
        inventory.forEach((item, index) => {
            const li = document.createElement('li');
            let statsText = '';
            if (item.atk > 0)  statsText += `ATK+${item.atk} `;
            if (item.def > 0)  statsText += `DEF+${item.def} `;
            if (item.crit)     statsText += `CRI+${item.crit}% `;
            if (item.steal)    statsText += `ABS+${item.steal}% `;
            let spText = getSpiritText(item.spirits);
            if (spText !== '無') statsText += `[${spText}]`;

            li.innerHTML = `
                <div style="display:flex; flex-direction:column; flex-grow:1;">
                    <span class="item-name">${typeIcons[item.type] || ''} ${item.name}</span>
                    <span class="item-stats">${statsText}</span>
                </div>
                <div class="item-actions">
                    <button class="mini-btn btn-equip" onclick="equipItem(${index})">装備</button>
                    <button class="mini-btn btn-mix"   onclick="mixItem(${index})">合成</button>
                </div>
            `;
            inventoryList.appendChild(li);
        });
    }

    // LAB UI
    document.getElementById('labHpDisp').textContent   = permMaxHp;
    document.getElementById('costHpDisp').textContent  = costHp;
    document.getElementById('btnUpgradeHp').disabled   = starDust < costHp;

    document.getElementById('labAtkDisp').textContent  = permBaseAtk;
    document.getElementById('costAtkDisp').textContent = costAtk;
    document.getElementById('btnUpgradeAtk').disabled  = starDust < costAtk;

    document.getElementById('labDefDisp').textContent  = permBaseDef;
    document.getElementById('costDefDisp').textContent = costDef;
    document.getElementById('btnUpgradeDef').disabled  = starDust < costDef;

    // アーカイブ UI
    document.getElementById('statKills').textContent   = stats.kills;
    document.getElementById('statReturns').textContent = stats.returns;
    document.getElementById('statDeaths').textContent  = stats.deaths;

    // 自動セーブ
    saveData();
}

// =============================================================
// タブ切替・拠点画面描画
// =============================================================

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.base-panel').forEach(p => p.classList.add('hidden'));

    if (tab === 'map') {
        document.getElementById('tabMap').classList.add('active');
        document.getElementById('panelMap').classList.remove('hidden');
        updateIllustration('base');
    }
    if (tab === 'lab') {
        document.getElementById('tabLab').classList.add('active');
        document.getElementById('panelLab').classList.remove('hidden');
        updateIllustration('lab');
    }
    if (tab === 'archive') {
        document.getElementById('tabArchive').classList.add('active');
        document.getElementById('panelArchive').classList.remove('hidden');
        updateIllustration('base');
    }
}

function renderBaseScene() {
    locationDisplay.textContent = '管制室';
    floorDisplay.style.display  = 'none';
    switchTab('map');

    battleState = { active: false, enemy: null, isBoss: false, turn: 0 };
    eventState  = { active: false, type: null };
    updateActionButtons();

    const list = document.getElementById('dungeonList');
    list.innerHTML = '';
    for (let i = 0; i <= currentProgress && i < dungeons.length; i++) {
        const d          = dungeons[i];
        const totalSteps = d.maxFloor * stepsToNextFloor;
        const btn        = document.createElement('button');
        btn.className    = `dungeon-btn ${i < currentProgress ? 'cleared' : ''}`;
        btn.innerHTML    = `<span>Sec:${i + 1} ${d.name}</span><span style="font-size:13px; color:var(--text-dim)">全${totalSteps}歩</span>`;
        btn.onclick      = () => tryEnterDungeon(i);  // explore.js で定義
        list.appendChild(btn);
    }

    exploreBtn.disabled = true;
    exploreBtn.textContent = '［ 目 標 を 選 択 ］';
    returnBtn.classList.add('hidden');
}
