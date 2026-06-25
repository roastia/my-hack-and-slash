// =============================================================
// items.js — アイテム生成・装備・合成
// =============================================================

/**
 * スケール値に応じてランダムなアイテムを生成する
 * @param {number} scale - ダンジョン難易度×階層で決まる強さ係数
 */
function generateItem(scale) {
    let base  = Object.assign({}, itemsDatabase[Math.floor(Math.random() * itemsDatabase.length)]);
    base.crit  = base.crit  || 0;
    base.steal = base.steal || 0;
    base.atk   = base.atk   || 0;
    base.def   = base.def   || 0;
    base.spirits = {};

    const r = Math.random();
    if (base.type === 'weapon') {
        if      (r < 0.15) { base.name = '[吸血の]' + base.name; base.steal += 5 + Math.floor(Math.random() * 5); }
        else if (r < 0.30) { base.name = '[致命の]' + base.name; base.crit  += 5 + Math.floor(Math.random() * 10); }
        else if (r < 0.45) { base.name = '[重圧の]' + base.name; base.atk   += Math.floor(scale) + 2; }
        else if (r < 0.50) { base.name = '[狂気の]' + base.name; base.atk   += Math.floor(scale / 2) + 1; base.crit += 10; base.steal += 5; }
        if (scale > 5 && Math.random() < 0.4) { base.atk += Math.floor(scale); base.name = '異界・' + base.name; }
    } else {
        if      (r < 0.15) { base.name = '[強靭な]' + base.name; base.def   += Math.floor(scale) + 1; }
        else if (r < 0.30) { base.name = '[反射の]' + base.name; base.crit  += Math.floor(Math.random() * 5); }
        else if (r < 0.45) { base.name = '[癒しの]' + base.name; base.steal += Math.floor(Math.random() * 5); }
        else if (r < 0.50) { base.name = '[神聖な]' + base.name; base.def   += Math.floor(scale / 2) + 1; base.steal += 2; }
        if (scale > 5 && Math.random() < 0.4) { base.def += Math.floor(scale); base.name = '異界・' + base.name; }
    }

    // 精霊付与
    if (Math.random() < 0.4) {
        const types  = ['火', '水', '風', '土', '光', '闇'];
        const colors = { '火': '#ff5555', '水': '#55ccff', '風': '#55ff55', '土': '#ddaa55', '光': '#ffffaa', '闇': '#dd55ff' };
        const type   = types[Math.floor(Math.random() * types.length)];
        const val    = Math.floor(Math.random() * (scale / 2 + 1)) + 1;
        base.spirits[type] = { val, color: colors[type] };
    }

    return base;
}

// --- インベントリ操作 ---

function equipItem(index) {
    const selected = inventory.splice(index, 1)[0];
    const type     = selected.type;

    if (equipment[type] !== null) inventory.push(equipment[type]);
    equipment[type] = selected;

    const typeNames = { weapon: '武器', helm: '兜', armor: '鎧', shield: '盾' };
    addLog(`E: <span class="item-text">${selected.name}</span> を${typeNames[type]}スロットに接続した。`);
    updateUI();
}

function mixItem(index) {
    const mat       = inventory[index];
    const type      = mat.type;
    const typeNames = { weapon: '武器', helm: '兜', armor: '鎧', shield: '盾' };

    if (equipment[type] === null) {
        addLog(`<span class="damage-text">ERR: ベースとなる${typeNames[type]}を装備していません。</span>`);
        return;
    }

    inventory.splice(index, 1);
    let baseEq = equipment[type];

    baseEq.atk   = (baseEq.atk   || 0) + (mat.atk   || 0);
    baseEq.def   = (baseEq.def   || 0) + (mat.def   || 0);
    if (mat.crit)  baseEq.crit  = (baseEq.crit  || 0) + mat.crit;
    if (mat.steal) baseEq.steal = (baseEq.steal || 0) + mat.steal;

    if (mat.spirits) {
        if (!baseEq.spirits) baseEq.spirits = {};
        for (let k in mat.spirits) {
            if (baseEq.spirits[k]) baseEq.spirits[k].val += mat.spirits[k].val;
            else                   baseEq.spirits[k] = { ...mat.spirits[k] };
        }
    }

    const prefixes = ['改', '・極', 'Ω', 'の残骸', '・レプリカ', '・真'];
    if (Math.random() < 0.3) baseEq.name = baseEq.name.replace(/(\+|改|・極|Ω|の残骸|・レプリカ|・真)+/g, '') + prefixes[Math.random() * prefixes.length | 0];
    else if (!baseEq.name.includes('+')) baseEq.name += '+';

    addLog(`【${baseEq.name}】に【${mat.name}】を融解・結合した。<br><span class="mix-text">>> ${typeNames[type]}の物理演算書き換え完了。ステータスが上昇。</span>`);
    updateUI();
}

// =============================================================
// レアリティ判定
// =============================================================

function getRarityInfo(item) {
    if (!item) return { label: '未装備', color: 'var(--text-dim)' };

    // [伝説] プレフィックスは常にレジェンド
    if (item.name.includes('[伝説]')) return { label: '✦ 伝 説', color: '#d4a830' };

    // スコア計算
    let score = 0;
    score += (item.atk   || 0);
    score += (item.def   || 0);
    score += (item.crit  || 0) * 0.4;
    score += (item.steal || 0) * 0.4;
    score += Object.keys(item.spirits || {}).length * 4;
    if (item.name.includes('異界・'))                             score += 6;
    if (item.name.includes('[祝福]'))                             score += 5;
    if (item.name.includes('[狂気の]') || item.name.includes('[神聖な]')) score += 3;

    if (score >= 30) return { label: '✦ 伝 説', color: '#d4a830' };
    if (score >= 18) return { label: '★ 至 宝', color: '#a050d8' };
    if (score >= 10) return { label: '◆ 貴 重', color: '#5090e0' };
    if (score >= 4)  return { label: '◇ 上 位', color: '#4ab848' };
    return                  { label: '  普 通', color: '#8a8070' };
}

// =============================================================
// 食料操作
// =============================================================

function eatFood(index) {
    const food = inventory[index];
    if (!food || food.type !== 'food') return;

    inventory.splice(index, 1);

    const restored = Math.min(maxHunger - hunger, food.hunger);
    hunger = Math.min(maxHunger, hunger + food.hunger);

    let msg = `🍖 <span class="item-text">【${food.name}】</span> を食べた。満腹度 +${restored}`;

    if (food.hp > 0) {
        const healed = Math.min(maxHp - currentHp, food.hp);
        currentHp = Math.min(maxHp, currentHp + food.hp);
        msg += ` / HP +${healed}`;
    }

    addLog(msg);
    updateUI();
}


// 水を飲む
function drinkWater(index) {
    const item = inventory[index];
    if (!item || item.type !== 'water') return;
    thirst = Math.min(maxThirst, thirst + (item.thirstRestore || 0));
    if (item.sp) sp = Math.min(maxSp, sp + item.sp);
    inventory.splice(index, 1);
    addLog(`💧 <span style="color:#88ccff">【${item.name}】</span> を飲んだ。渇き +${item.thirstRestore}${item.sp ? ' / SP +' + item.sp : ''}`);
    updateUI();
    saveData();
}

// SP回復ポーション使用
function useSpPotion(index) {
    const item = inventory[index];
    if (!item || item.type !== 'sp_potion') return;
    sp = Math.min(maxSp, sp + (item.spRestore || 0));
    inventory.splice(index, 1);
    addLog(`✦ <span style="color:#c080ff">【${item.name}】</span> を使った。SP +${item.spRestore}`);
    updateUI();
    saveData();
}

// テンション変更
function setTension(t) {
    tension = Math.max(1, Math.min(3, t));
    const labels = ['通常', '高揚', '狂乱'];
    addLog(`<span style="color:var(--accent-orange)">テンション → ${labels[tension-1]}！ (×${[1.0,1.3,1.8][tension-1]} EXP)</span>`);
    updateUI();
}
