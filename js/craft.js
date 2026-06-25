// =============================================================
// craft.js — 浅層クラフトシステム
// =============================================================

function renderCraft() {
    const panel = document.getElementById('panelCraft');
    if (!panel) return;
    panel.innerHTML = '';

    // 所持素材ヘッダー
    const matHeader = document.createElement('div');
    matHeader.className = 'log-entry';
    matHeader.style.cssText = 'color:#aaddaa; border:none; padding-bottom:4px; font-size:14px;';
    const matList = craftMaterialTypes.map(m =>
        `${m}: <b style="color:${(materials[m]||0)>0?'#aaffaa':'var(--text-dim)'}">${materials[m]||0}</b>`
    ).join('　');
    matHeader.innerHTML = `🌿 所持素材 ── ${matList}`;
    panel.appendChild(matHeader);

    // レシピ一覧
    const recipeHeader = document.createElement('div');
    recipeHeader.className = 'log-entry';
    recipeHeader.style.cssText = 'color:var(--accent-cyan); border:none; padding-top:8px; padding-bottom:4px; font-size:14px;';
    recipeHeader.textContent = '⚗ 合成レシピ';
    panel.appendChild(recipeHeader);

    craftRecipes.forEach((recipe, idx) => {
        const canCraft = Object.entries(recipe.ingredients).every(
            ([mat, count]) => (materials[mat] || 0) >= count
        );
        const ingText = Object.entries(recipe.ingredients)
            .map(([mat, cnt]) => `${mat}×${cnt}`)
            .join(' + ');

        const div = document.createElement('div');
        div.className = 'lab-item';
        div.style.cssText = 'align-items:center;';
        div.innerHTML = `
            <div style="flex:1;">
                <div style="color:var(--text-main); font-size:14px;">⚗ ${recipe.name}</div>
                <div class="lab-desc" style="color:#aaddaa;">${ingText} → ${recipe.desc.split('→')[1]?.trim() || recipe.desc}</div>
            </div>
            <button class="mini-btn btn-equip" style="font-size:13px; padding:5px 10px;"
                onclick="craftItem(${idx})" ${canCraft ? '' : 'disabled'}>
                合成
            </button>`;
        panel.appendChild(div);
    });
}

function craftItem(index) {
    const recipe = craftRecipes[index];
    if (!recipe) return;

    // 素材確認
    for (const [mat, count] of Object.entries(recipe.ingredients)) {
        if ((materials[mat] || 0) < count) {
            addLog(`<span class="damage-text">素材が足りない。${mat}が${count}個必要。</span>`);
            return;
        }
    }

    // 素材消費
    for (const [mat, count] of Object.entries(recipe.ingredients)) {
        materials[mat] -= count;
        if (materials[mat] <= 0) delete materials[mat];
    }

    // 結果アイテム生成
    const result = Object.assign({}, recipe.result);

    if (result.type === 'sp_potion' || result.type === 'water') {
        // 消費アイテム（インベントリへ）
        if (inventory.length < maxInventory) {
            inventory.push(result);
            addLog(`⚗ <span style="color:#aaddaa">【${result.name}】</span> を合成した！ インベントリに追加された。`);
        } else {
            // 即時使用
            if (result.spRestore) { sp = Math.min(maxSp, sp + result.spRestore); addLog(`⚗ 【${result.name}】SP +${result.spRestore}！`); }
            if (result.thirstRestore) { thirst = Math.min(maxThirst, thirst + result.thirstRestore); }
            addLog(`⚗ <span style="color:#aaddaa">荷物が満杯のため、${result.name}を即座に使用した。</span>`);
        }
    } else if (result.type === 'food') {
        if (inventory.length < maxInventory) {
            inventory.push(result);
            addLog(`⚗ <span style="color:#c8a060">【${result.name}】</span> を合成した！`);
        } else {
            hunger = Math.min(maxHunger, hunger + (result.hunger || 0));
            currentHp = Math.min(maxHp, currentHp + (result.hp || 0));
            addLog(`⚗ 荷物が満杯のため【${result.name}】を即座に食べた。`);
        }
    } else {
        // 装備品
        if (inventory.length < maxInventory) {
            inventory.push(result);
            const r = getRarityInfo(result);
            addLog(`⚗ <span style="color:${r.color}; font-weight:bold">【${result.name}】</span> ${r.label} を合成した！`);
        } else {
            addLog(`⚗ 【${result.name}】を合成したが、荷物が満杯で持てなかった。`);
        }
    }

    saveData();
    renderCraft();
    renderInventory ? renderInventory() : null;
    updateUI();
}
