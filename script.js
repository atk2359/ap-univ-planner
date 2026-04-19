let appState = { activeTab: 'm1z', m1z: {}, m1k: {}, m2z: {}, m2k: {} };
let activeId = null;
let pendingCourse = null;
let editingIndex = -1;

const termLabels = {m1z:"M1前期", m1k:"M1後期", m2z:"M2前期", m2k:"M2後期"};

// 1. data.js をキャッシュ破棄しつつ読み込む
function loadDataScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const now = new Date();
        const cacheKey = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}`;
        
        script.src = `data.js?v=${cacheKey}`;
        script.onload = () => {
            console.log("Data loaded with version:", cacheKey);
            resolve();
        };
        script.onerror = () => reject(new Error("data.js not found"));
        document.head.appendChild(script);
    });
}

// 2. 初期化フローの統合
window.onload = async () => {
    try {
        await loadDataScript();
        
        // イベントリスナーの登録（HTMLから onchange を外した代わりにここで設定）
        document.getElementById('my-course-select')?.addEventListener('change', refresh);
        document.getElementById('catalog-course-select')?.addEventListener('change', loadCatalog);
        document.getElementById('sel-term')?.addEventListener('change', updateSelectorButtons);
        document.getElementById('sel-day')?.addEventListener('change', updateSelectorButtons);
        document.getElementById('sel-period')?.addEventListener('change', updateSelectorButtons);
        
        init();
    } catch (error) {
        alert("システムの初期化に失敗しました。data.jsが配置されているか確認してください。");
        console.error(error);
    }
};

function init() {
    const dateDisplay = document.getElementById('update-date-display');
    if (dateDisplay && typeof lastUpdated !== 'undefined') {
        dateDisplay.innerText = `Data: ${lastUpdated}`;
    }

    const grid = document.getElementById('grid');
    if (grid) {
        grid.innerHTML = "";
        for(let p=1; p<=6; p++) {
            let row = `<tr><td style="font-weight:bold; background:#f8f9fa;">${p}</td>`;
            for(let d=1; d<=5; d++) {
                const id = `c-${d}-${p}`;
                row += `<td id="${id}" class="cell" onclick="openEditor('${id}', '${['','月','火','水','木','金'][d]}曜 ${p}限')"></td>`;
            } grid.innerHTML += row + `</tr>`;
        }
    }
    refresh(); // 最初に一度描画。refresh() 内で loadCatalog() を呼ぶためここでは init だけでOK
}

function loadCatalog() {
    const catalogSelect = document.getElementById('catalog-course-select');
    if (!catalogSelect) return;
    
    const catCourseId = catalogSelect.value;
    const lists = { core: document.getElementById('list-core'), adv: document.getElementById('list-adv'), rel: document.getElementById('list-rel'), prac: document.getElementById('list-prac'), res: document.getElementById('list-res') };
    
    Object.values(lists).forEach(el => { if(el) el.innerHTML = ''; });
    
    const registeredNames = new Set();
    ['m1z','m1k','m2z','m2k'].forEach(t => {
        Object.values(appState[t]).forEach(arr => arr.forEach(v => registeredNames.add(v.name)));
    });

    if (typeof coreCourses !== 'undefined') {
        coreCourses.forEach(c => createDefinedItem(c, 'core', lists.core, registeredNames));
    }
    
    if (typeof majorMasters !== 'undefined' && majorMasters[catCourseId]) {
        const master = majorMasters[catCourseId];
        master.adv.forEach(c => createDefinedItem(c, 'adv', lists.adv, registeredNames));
        master.rel.forEach(c => createDefinedItem(c, 'rel', lists.rel, registeredNames));
    }
    
    createDefinedItem({ name: `情報科学演習1`, schedule: "M1前期のみ", sem: 'z' }, 'prac', lists.prac, registeredNames);
    createDefinedItem({ name: `情報科学演習2`, schedule: "M1後期のみ", sem: 'k' }, 'prac', lists.prac, registeredNames);
    createDefinedItem({ name: `情報科学演習3`, schedule: "M2前期のみ", sem: 'z' }, 'prac', lists.prac, registeredNames);
    createDefinedItem({ name: `情報科学特別研究`, schedule: "全学期共通" }, 'res', lists.res, registeredNames);
}

function createDefinedItem(c, type, container, registeredNames) {
    if (!container) return;
    const div = document.createElement('div');
    const isSelected = registeredNames.has(c.name);
    div.className = `item ${type} ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `${c.name} <br><span style="font-size:0.65rem; color:#95a5a6;">[${c.schedule}]</span>`;
    div.onclick = () => {
        const myCourseId = document.getElementById('my-course-select').value;
        const myMaster = majorMasters[myCourseId];
        const isMyAdv = myMaster?.adv.some(m => m.name === c.name);
        const isMyRel = myMaster?.rel.some(m => m.name === c.name);
        
        let detectedCat = 'other-adv';
        if(type === 'core') detectedCat = 'core';
        else if(type === 'prac') detectedCat = 'prac';
        else if(type === 'res') detectedCat = 'res';
        else if(isMyAdv) detectedCat = 'adv';
        else if(isMyRel) detectedCat = 'rel';
        else if(type === 'rel') detectedCat = 'other-rel';
        
        pendingCourse = { ...c, cat: detectedCat };
        document.getElementById('selected-course-name').innerText = c.name;
        
        const termSelect = document.getElementById('sel-term');
        termSelect.innerHTML = "";
        const options = [{ val: 'm1z', text: 'M1前期', sem: 'z' },{ val: 'm1k', text: 'M1後期', sem: 'k' },{ val: 'm2z', text: 'M2前期', sem: 'z' },{ val: 'm2k', text: 'M2後期', sem: 'k' }];
        
        options.forEach(opt => {
            let disabled = false;
            if (c.name === "情報科学演習1" && opt.val !== "m1z") disabled = true;
            if (c.name === "情報科学演習2" && opt.val !== "m1k") disabled = true;
            if (c.name === "情報科学演習3" && opt.val !== "m2z") disabled = true;
            if (c.sem && c.sem !== opt.sem) disabled = true;
            if (!disabled) {
                const el = document.createElement('option');
                el.value = opt.val; el.text = opt.text;
                termSelect.appendChild(el);
            }
        });

        const selectors = document.getElementById('day-period-selectors');
        const daySel = document.getElementById('sel-day');
        const perSel = document.getElementById('sel-period');
        
        if (c.name === "情報科学特別研究" || c.isIntensive || c.isOther) {
            selectors.style.display = 'none';
        } else {
            selectors.style.display = 'block';
            daySel.disabled = false; perSel.disabled = false;
            if (c.day) {
                daySel.value = c.day; perSel.value = c.period;
                daySel.disabled = true; perSel.disabled = true;
            }
        }
        updateSelectorButtons();
        document.getElementById('selector-dialog').showModal();
    };
    container.appendChild(div);
}

function updateSelectorButtons() {
    const term = document.getElementById('sel-term').value;
    const day = document.getElementById('sel-day').value;
    const per = document.getElementById('sel-period').value;
    const id = `c-${day}-${per}`;
    const exists = (appState[term][id] && appState[term][id].length > 0);
    document.getElementById('btn-confirm-overwrite').style.display = exists ? 'block' : 'none';
    document.getElementById('btn-confirm-add').innerText = exists ? '共存させる' : '登録';
}

function confirmSelector(overwrite) {
    const term = document.getElementById('sel-term').value;
    let id = "";
    if (pendingCourse.name === "情報科学特別研究") id = 'c-research';
    else if (pendingCourse.isIntensive) id = 'c-intensive';
    else if (pendingCourse.isOther) id = 'c-other';
    else id = `c-${document.getElementById('sel-day').value}-${document.getElementById('sel-period').value}`;
    
    const data = { name: pendingCourse.name, cat: pendingCourse.cat, unit: 2 };
    if (overwrite) appState[term][id] = [data];
    else {
        if (!appState[term][id]) appState[term][id] = [];
        appState[term][id].push(data);
    }
    if (id === 'c-research') ['m1z','m1k','m2z','m2k'].forEach(t => appState[t][id] = [data]);
    
    switchTab(term);
    document.getElementById('selector-dialog').close();
    refresh();
}

function switchTab(tabId) {
    appState.activeTab = tabId;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById('table-title').innerText = termLabels[tabId] + " 時間割";
    closeEditor(); 
    refresh();
}

function openEditor(id, label) {
    if(activeId) document.getElementById(activeId)?.classList.remove('active-target');
    activeId = id;
    document.getElementById(id)?.classList.add('active-target');
    document.getElementById('edit-pos').innerText = label;
    editingIndex = -1;
    document.getElementById('in-name').value = "";
    renderEditList();
    document.getElementById('editor').style.display = 'block';
}

function renderEditList() {
    const list = document.getElementById('lecture-edit-list');
    list.innerHTML = "";
    const dataArr = appState[appState.activeTab][activeId] || [];
    dataArr.forEach((v, idx) => {
        const div = document.createElement('div');
        div.className = "lecture-tile";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.innerHTML = `<span>${v.name}</span>
            <span>
                <button onclick="editLecture(${idx})" style="font-size:0.6rem;">編</button>
                <button onclick="deleteLecture(${idx})" style="font-size:0.6rem;">削</button>
            </span>`;
        list.appendChild(div);
    });
}

function editLecture(idx) {
    const data = appState[appState.activeTab][activeId][idx];
    document.getElementById('in-name').value = data.name;
    document.getElementById('in-cat').value = data.cat;
    document.getElementById('in-unit').value = data.unit;
    editingIndex = idx;
}

function deleteLecture(idx) {
    appState[appState.activeTab][activeId].splice(idx, 1);
    if (activeId === 'c-research') ['m1z','m1k','m2z','m2k'].forEach(t => appState[t][activeId] = []);
    renderEditList(); 
    refresh();
}

function closeEditor() {
    if(activeId) document.getElementById(activeId)?.classList.remove('active-target');
    document.getElementById('editor').style.display = 'none';
    activeId = null;
}

function updateCell() {
    const name = document.getElementById('in-name').value;
    if(!name) return;
    const data = { name, cat: document.getElementById('in-cat').value, unit: parseInt(document.getElementById('in-unit').value) };
    if (!appState[appState.activeTab][activeId]) appState[appState.activeTab][activeId] = [];
    if (editingIndex > -1) appState[appState.activeTab][activeId][editingIndex] = data;
    else appState[appState.activeTab][activeId].push(data);
    if (activeId === 'c-research') ['m1z','m1k','m2z','m2k'].forEach(t => appState[t][activeId] = [data]);
    refresh(); closeEditor();
}

function refresh() {
    const currentData = appState[appState.activeTab];
    const catMap = {core:'共通', adv:'専攻', rel:'関連', 'other-adv':'他専攻', 'other-rel':'他関連', prac:'演習', res:'研究'};
    
    // 描画処理
    document.querySelectorAll('.cell').forEach(td => {
        const arr = currentData[td.id] || [];
        td.innerHTML = arr.map(v => `
            <div class="lecture-tile">
                <div style="font-weight:bold;">${v.name}</div>
                <span class="cat-tag ${v.cat.includes('other') ? 'tag-other' : `tag-${v.cat}`}">${catMap[v.cat]}</span>
            </div>
        `).join('');
    });
    
    ['intensive', 'research', 'other'].forEach(key => {
        const arr = currentData[`c-${key}`] || [];
        const target = document.getElementById(`${key}-content`);
        if(target) target.innerHTML = arr.length > 0 ? arr.map(v => `<b>${v.name}</b>`).join('<br>') : "追加";
    });

    // 計算とカタログ更新
    calculateAndNotify();
    loadCatalog(); // 無限ループを避けるため、最後にカタログのみ更新
}

function calculateAndNotify() {
    let s = { core: 0, adv: 0, rel: 0, otheradv: 0, otherrel: 0, prac: 0, res: 0 };
    const msgs = [];
    const allCourseNames = [];
    
    ['m1z','m1k','m2z','m2k'].forEach(t => {
        Object.keys(appState[t]).forEach(id => {
            const arr = appState[t][id];
            if (arr.length > 1 && !id.includes('intensive') && !id.includes('other') && !id.includes('research')) {
                const info = id.replace('c-','').split('-');
                msgs.push(`<div class="msg-item">${termLabels[t]}の${['','月','火','水','木','金'][info[0]]}曜${info[1]}限に重複があります。</div>`);
            }
            arr.forEach(v => {
                const k = v.cat.replace('-',''); if(s.hasOwnProperty(k)) s[k] += v.unit;
                allCourseNames.push({name: v.name, term: t});
            });
        });
    });

    const tAdv = Math.min(s.otheradv, 4), tRel = Math.min(s.otherrel, 2);
    const items = [
        { n: `専門科目 合計 (16)`, v: s.core + s.adv + tAdv, r: 16 },
        { n: ` └ 共通 (4)`, v: s.core, r: 4 },
        { n: ` └ 専攻 (8)`, v: s.adv + tAdv, r: 8, extra: `(内、他専攻振替: ${tAdv}/4)` },
        { n: `関連科目 (4)`, v: s.rel + tRel, r: 4, extra: `(内、他コース振替: ${tRel}/2)` },
        { n: `情報科学演習 (6)`, v: s.prac, r: 6 },
        { n: `情報科学特別研究 (8)`, v: s.res, r: 8 }
    ];

    const statsContainer = document.getElementById('stats-container');
    if(statsContainer) {
        statsContainer.innerHTML = items.map(i => `
            <div class="stat-row">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="${i.n.includes('└') ? 'color:#7f8c8d;' : 'font-weight:bold;'}">${i.n}</span>
                    <span><b>${i.v}</b> <span class="badge ${i.v >= i.r ? 'bg-ok' : 'bg-no'}">${i.v >= i.r ? 'OK' : i.v - i.r}</span></span>
                </div>
                ${i.extra ? `<div style="font-size:0.6rem; color:#e67e22; margin-top:2px;">${i.extra}</div>` : ''}
            </div>
        `).join('');
    }

    const nameCounts = {};
    allCourseNames.forEach(x => { nameCounts[x.name] = (nameCounts[x.name] || 0) + 1; });
    for(let name in nameCounts) {
        if(nameCounts[name] > 1 && name !== "情報科学特別研究" && !name.includes("演習")) {
            msgs.push(`<div class="msg-item">「${name}」が重複登録されています。</div>`);
        }
    }
    const msgSpace = document.getElementById('msg-space');
    if(msgSpace) msgSpace.innerHTML = msgs.length > 0 ? msgs.join('') : '<span style="color:#bdc3c7;">通知はありません</span>';
}

function exportData() {
    const dataStr = JSON.stringify({ state: appState, myCourse: document.getElementById('my-course-select').value });
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([dataStr])); a.download = `plan.json`; a.click();
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        appState = data.state; document.getElementById('my-course-select').value = data.myCourse; 
        refresh();
    }; reader.readAsText(event.target.files[0]);
}

function importCatalogDiff(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const diffData = JSON.parse(e.target.result);
            if (diffData.coreCourses) {
                diffData.coreCourses.forEach(newCourse => {
                    const idx = coreCourses.findIndex(c => c.name === newCourse.name);
                    if (idx !== -1) coreCourses[idx] = newCourse;
                    else coreCourses.push(newCourse);
                });
            }
            if (diffData.majorMasters) {
                for (const majorId in diffData.majorMasters) {
                    if (!majorMasters[majorId]) majorMasters[majorId] = { adv: [], rel: [] };
                    ['adv', 'rel'].forEach(cat => {
                        if (diffData.majorMasters[majorId][cat]) {
                            diffData.majorMasters[majorId][cat].forEach(newCourse => {
                                const idx = majorMasters[majorId][cat].findIndex(c => c.name === newCourse.name);
                                if (idx !== -1) majorMasters[majorId][cat][idx] = newCourse;
                                else majorMasters[majorId][cat].push(newCourse);
                            });
                        }
                    });
                }
            }
            alert("カタログ情報を更新しました。");
            refresh();
        } catch (err) {
            alert("エラー: JSON形式が不正です。");
        }
        event.target.value = "";
    };
    reader.readAsText(file);
}