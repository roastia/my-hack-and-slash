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
