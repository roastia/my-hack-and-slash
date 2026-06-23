// =============================================================
// shop.js — 道具屋システム
// =============================================================

function renderShop() {
    const panel = document.getElementById('panelShop');
    if (!panel) return;
    panel.innerHTML = '';

    // ── 食料セクション ──
    const foodHeader = document.createElement('div');
    foodHeader.className = 'log-entry';
    foodHeader.style.cssText = 'color:var(--accent-cyan); border:none; padding-bottom:4px; font-size:14px;';
    foodHeader.textContent = '🍖 食料';
    panel.appendChild(foodHeader);

    shopItems.filter(s => s.category === 'food').forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'lab-item';
        div.style.cssText = 'align-items:center;';
        const canBuy = starDust >= item.cost && inventory.length < maxInventory;
        div.innerHTML = `
            <div>
                <div style="color:var(--text-main); font-size:14px;">${item.name}</div>
                <div class="lab-desc" style="color:#c8a060;">満腹+${item.food.hunger}${item.food.hp ? ' / HP+'+item.food.hp : ''}</div>
            </div>
            <button class="mini-btn btn-equip" style="font-size:13px; padding:5px 10px;"
                onclick="buyShopFood(${shopItems.indexOf(item)})"
                ${canBuy ? '' : 'disabled'}>
                購入 (G ${item.cost})
            </button>`;
        panel.appendChild(div);
    });

    // ── スキル書セクション ──
    const skillHeader = document.createElement('div');
    skillHeader.className = 'log-entry';
    skillHeader.style.cssText = 'color:var(--accent-magenta); border:none; padding-top:8px; padding-bottom:4px; font-size:14px;';
    skillHeader.textContent = '📖 スキル書';
    panel.appendChild(skillHeader);

    shopItems.filter(s => s.category === 'skill').forEach((item) => {
        const div = document.createElement('div');
        div.className = 'lab-item';
        div.style.cssText = 'align-items:center;';
        const canBuy = starDust >= item.cost;
        div.innerHTML = `
            <div>
                <div style="color:var(--text-main); font-size:14px;">${item.name}</div>
                <div class="lab-desc" style="color:var(--accent-magenta);">${item.desc}</div>
            </div>
            <button class="mini-btn btn-mix" style="font-size:13px; padding:5px 10px;"
                onclick="buyShopSkill(${shopItems.indexOf(item)})"
                ${canBuy ? '' : 'disabled'}>
                購入 (G ${item.cost})
            </button>`;
        panel.appendChild(div);
    });
}

function buyShopFood(index) {
    const item = shopItems[index];
    if (!item || item.category !== 'food') return;
    if (starDust < item.cost) { addLog('<span class="damage-text">ゴールドが足りない。</span>'); return; }
    if (inventory.length >= maxInventory) { addLog('<span class="damage-text">荷物が満杯で購入できない。</span>'); return; }

    starDust -= item.cost;
    inventory.push(Object.assign({}, item.food));
    addLog(`🍖 <span class="item-text">【${item.name}】</span> を購入した。 <span style="color:var(--accent-orange)">-G${item.cost}</span>`);
    renderShop();
    updateUI();
}

function buyShopSkill(index) {
    const item = shopItems[index];
    if (!item || item.category !== 'skill') return;
    if (starDust < item.cost) { addLog('<span class="damage-text">ゴールドが足りない。</span>'); return; }

    starDust -= item.cost;
    const eff = item.effect;
    if (eff.permBaseAtk) { permBaseAtk += eff.permBaseAtk; baseAttack = permBaseAtk + (level - 1); }
    if (eff.permBaseDef) { permBaseDef += eff.permBaseDef; baseDefense = permBaseDef; }
    if (eff.permMaxHp)   { permMaxHp   += eff.permMaxHp;   maxHp = permMaxHp + (level - 1) * 8; currentHp = Math.min(currentHp, maxHp); }
    if (eff.baseSpeed)   { baseSpeed   += eff.baseSpeed; }
    if (eff.maxHunger)   { maxHunger   += eff.maxHunger; }

    addLog(`📖 <span style="color:var(--accent-magenta)">【${item.name}】</span> を習得した！ ${item.desc} <span style="color:var(--accent-orange)">-G${item.cost}</span>`);
    renderShop();
    updateUI();
}
