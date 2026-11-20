/* Pickle_Base 워크스페이스 — 앱 로직
   프리뷰 데이터와 드라이브 실시간 데이터를 같은 모델로 그립니다. */
(function () {
  'use strict';

  var PREVIEW = window.PB_PREVIEW;
  var CFG_KEY = 'pb.config.v1';
  var HABIT_KEY = 'pb.habits.v1';

  var TABS = [
    { key: 'dashboard', label: '대시보드', icon: '◎' },
    { key: 'hub', label: '업무자동화', icon: '⌗' },
    { key: 'blog', label: '블로그', icon: '✎' },
    { key: 'research', label: '리서치', icon: '⌕' },
    { key: 'app', label: '앱', icon: '▣' },
    { key: 'daily', label: '일상·습관', icon: '☑' }
  ];

  var STATUS = {
    complete: { label: '완료', cls: 'complete' },
    progress: { label: '진행중', cls: 'progress' },
    pending: { label: '미정', cls: 'pending' }
  };

  var state = {
    view: 'dashboard',
    query: '',
    filter: 'all',
    model: PREVIEW,
    source: 'preview',
    token: null,
    loading: false,
    error: null,
    connectedEmail: ''
  };

  var cfg = loadCfg();
  var habits = loadHabits();
  var tokenExpiry = 0;
  var toastTimer = null;
  /* 주소 기준(해시만 바꿔 씁니다) — GitHub Pages 하위 경로에서도 그대로 동작합니다. */
  var BASE_URL = (window.location.pathname || '/') + (window.location.search || '');

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ================= util ================= */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function loadCfg() {
    try {
      var raw = localStorage.getItem(CFG_KEY);
      var o = raw ? JSON.parse(raw) : {};
      return { clientId: o.clientId || '', folderId: o.folderId || '', folderName: o.folderName || 'Pickle_Base', lock: o.lock || { enabled: false, hash: '' } };
    } catch (e) {
      return { clientId: '', folderId: '', folderName: 'Pickle_Base', lock: { enabled: false, hash: '' } };
    }
  }
  function saveCfg() {
    try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) { /* 저장 불가 */ }
  }
  function loadHabits() {
    try { return JSON.parse(localStorage.getItem(HABIT_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveHabits() {
    try { localStorage.setItem(HABIT_KEY, JSON.stringify(habits)); } catch (e) { /* 저장 불가 */ }
  }
  function dateKey(d) {
    var t = d || new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }
  function todayKey() { return dateKey(new Date()); }
  function weekdayShort(d) { return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]; }
  function fmtDateTime(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return String(iso).slice(0, 16);
    return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. ' +
      String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function statusMeta(item) {
    var st = STATUS[item.status] || STATUS.pending;
    return { label: item.statusLabel || st.label, cls: st.cls };
  }
  function statusChip(item) {
    var m = statusMeta(item);
    return '<span class="status status--' + m.cls + '">' + esc(m.label) + '</span>';
  }
  function chip(key) {
    var m = STATUS[key];
    return '<span class="status status--' + m.cls + '">' + m.label + '</span>';
  }
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('toast--on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('toast--on'); }, 2600);
  }
  function itemsOf(area) {
    return state.model.items.filter(function (i) { return i.area === area; });
  }
  function matchesQuery(item) {
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    var hay = [item.title, item.summary, item.path, (item.tags || []).join(' '), item.excerpt || ''].join(' ').toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function matching(item) {
    if (state.filter !== 'all' && item.status !== state.filter) return false;
    return matchesQuery(item);
  }
  function visible(list) { return list.filter(matching); }
  function countBy(key) { return state.model.items.filter(function (i) { return i.status === key && matchesQuery(i); }).length; }

  /* ---------- 태스크 (01_업무자동화목록/업무자동화 목록) ----------
     전체·완료·진행중·미정 집계는 폴더·파일이 아니라 이 태스크 목록만 셉니다. */
  function taskList() { return (state.model && state.model.tasks) || []; }
  function taskMatchesQuery(t) {
    var q = state.query.trim().toLowerCase();
    if (!q) return true;
    var hay = [t.title, t.category, t.statusText, t.skill, t.output, t.note, t.next].join(' ').toLowerCase();
    return q.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function matchingTask(t) {
    if (state.filter !== 'all' && t.status !== state.filter) return false;
    return taskMatchesQuery(t);
  }
  function visibleTasks() { return taskList().filter(matchingTask); }
  /* ---------- 화면 범위(scoped) 태스크 ----------
     상단 상태 필터 칩은 지금 보고 있는 탭의 태스크만 셉니다.
     대시보드·업무자동화는 전체 태스크, 영역 탭(블로그·리서치·앱·일상)은 그 영역 분류의 태스크,
     통합 검색 뷰에서는 검색어에 걸린 태스크 기준입니다. */
  function scopeArea() {
    if (state.query.trim()) return '';
    return AREA_CAT[state.view] ? state.view : '';
  }
  function scopeTasks() {
    var area = scopeArea();
    return area ? areaTasks(area) : taskList();
  }
  function taskCount(key) {
    return scopeTasks().filter(function (t) {
      return (key === 'all' || t.status === key) && taskMatchesQuery(t);
    }).length;
  }
  function scopeTitle() {
    var area = scopeArea();
    if (area) return '지금 탭의 분류 ‘' + AREA_CAT[area].label + '’ 태스크 기준';
    if (state.query.trim()) return '검색어에 걸린 태스크 기준';
    return '01_업무자동화목록/업무자동화 목록의 태스크 기준';
  }
  function scopeLabel() {
    if (scopeArea()) return '이 영역 태스크';
    if (state.query.trim()) return '검색 결과 태스크';
    return '태스크';
  }
  function taskCounts() {
    var c = { all: 0, complete: 0, progress: 0, pending: 0 };
    taskList().forEach(function (t) { c.all++; if (c[t.status] !== undefined) c[t.status]++; });
    return c;
  }
  /* ---------- 영역(탭)별 태스크 ----------
     태스크의 '분류' 문자열을 탭 영역 키로 맞춥니다. 목록 문서의 분류는
     네이버블로그 / 리서치 / 애플리케이션 / 일상생활 네 가지이지만, 표기가 조금 달라도 받습니다. */
  var AREA_CAT = {
    blog: { label: '네이버블로그', test: /네이버블로그|블로그/ },
    research: { label: '리서치', test: /리서치/ },
    app: { label: '애플리케이션', test: /애플리케이션|앱|어플/ },
    daily: { label: '일상생활', test: /일상생활|일상|습관|건강/ }
  };
  function normCategory(s) { return String(s || '').replace(/[\s·・]/g, '').toLowerCase(); }
  function taskAreaKey(t) {
    var c = normCategory(t && t.category);
    if (!c) return '';
    var keys = ['blog', 'research', 'app', 'daily'];
    for (var i = 0; i < keys.length; i++) {
      if (AREA_CAT[keys[i]].test.test(c)) return keys[i];
    }
    return '';
  }
  function areaTasks(areaKey) {
    return taskList().filter(function (t) { return taskAreaKey(t) === areaKey; });
  }

  function taskCategories(list) {
    var out = [];
    var map = {};
    (list || taskList()).forEach(function (t) {
      var name = t.category || '미분류';
      if (!map[name]) { map[name] = { name: name, all: 0, complete: 0, progress: 0, pending: 0, shown: 0 }; out.push(map[name]); }
      map[name].all++;
      if (map[name][t.status] !== undefined) map[name][t.status]++;
      if (matchingTask(t)) map[name].shown++;
    });
    return out;
  }

  /* ================= chrome ================= */
  function renderTabs() {
    var nav = $('#tabs');
    nav.innerHTML = TABS.map(function (t) {
      var n = tabCount(t.key);
      return '<button class="tab" role="tab" data-tab="' + t.key + '" aria-selected="' + (state.view === t.key) + '">' +
        '<span aria-hidden="true">' + t.icon + '</span>' + t.label +
        (n ? '<span class="tab__badge">' + n + '</span>' : '') + '</button>';
    }).join('');
  }
  function tabCount(key) {
    var m = state.model;
    if (!m) return 0;
    if (key === 'dashboard') return 0;
    if (key === 'hub') return (m.skills || []).length;
    if (key === 'blog') return m.items.filter(function (i) { return i.area === 'blog' && i.kind === 'doc'; }).length;
    if (key === 'research') return m.items.filter(function (i) { return i.area === 'research'; }).length;
    if (key === 'app') return m.items.filter(function (i) { return i.area === 'app'; }).length;
    if (key === 'daily') return (m.habits || []).length;
    return 0;
  }
  function renderStatusChips() {
    var box = $('#statusChips');
    var defs = [{ k: 'all', label: '전체' }, { k: 'complete', label: '완료' }, { k: 'progress', label: '진행중' }, { k: 'pending', label: '미정' }];
    box.innerHTML = '<span class="chips__label" title="' + esc(scopeTitle()) + '">' + esc(scopeLabel()) + '</span>' + defs.map(function (d) {
      var n = taskCount(d.k);
      return '<button class="chip" data-filter="' + d.k + '" aria-pressed="' + (state.filter === d.k) + '" title="' + esc(scopeTitle()) + '">' +
        d.label + '<span class="chip__count">' + n + '</span></button>';
    }).join('');
  }
  function renderChrome() {
    var live = state.source === 'drive';
    var pill = $('#modePill');
    pill.className = 'pill ' + (live ? 'pill--live' : 'pill--preview');
    $('#modeText').textContent = live ? (state.connectedEmail ? '드라이브 연결됨' : '드라이브 실시간') : '프리뷰 데이터';
    $('#btnSync').hidden = !(live || state.source === 'preview' && state.token);
    $('#btnConnect').hidden = !!state.token;
    if ($('#btnDisconnect')) $('#btnDisconnect').hidden = !state.token;
    $('#footerSource').textContent = live
      ? '드라이브 실시간 · ' + (state.connectedEmail || '내 계정') + (state.model.syncedAt ? ' · ' + fmtDateTime(state.model.syncedAt) : '')
      : '프리뷰 데이터 · 2026-11-20 스냅샷';
    var notice = $('#notice');
    if (state.error) {
      notice.hidden = false;
      notice.className = 'notice notice--error';
      notice.textContent = state.error;
    } else if (!live) {
      notice.hidden = false;
      notice.className = 'notice';
      notice.innerHTML = '프리뷰 모드입니다 — 2026-11-20 기준 Pickle_Base의 태스크 3건·스킬 4종·첫 글 메타데이터를 담은 오프라인 스냅샷이에요. 실제 드라이브를 읽으려면 <strong>Google 계정 연결</strong>이 필요합니다.';
      var b = document.createElement('button');
      b.className = 'btn btn--sm';
      b.style.marginLeft = '8px';
      b.textContent = cfg.clientId ? 'Google 계정 연결' : '클라이언트 ID 넣기';
      b.addEventListener('click', function () { cfg.clientId ? doConnect() : openSettings(); });
      notice.appendChild(b);
    } else {
      notice.hidden = true;
    }
  }

  /* ================= views ================= */
  function render() {
    renderTabs();
    renderStatusChips();
    renderChrome();
    var main = $('#main');
    if (state.query.trim()) { main.innerHTML = viewSearch(); attach(); return; }
    var map = { dashboard: viewDashboard, hub: viewHub, blog: viewBlog, research: viewResearch, app: viewApp, daily: viewDaily };
    main.innerHTML = (map[state.view] || viewDashboard)();
    attach();
  }

  function pageHead(eyebrow, title, lede, meta) {
    return '<section class="card hero"><div>' +
      '<p class="eyebrow">' + esc(eyebrow) + '</p>' +
      '<h1>' + esc(title) + '</h1>' +
      '<p class="lede">' + lede + '</p>' +
      '</div>' +
      (meta ? '<div class="hero__meta">' + meta + '</div>' : '') +
      '</section>';
  }

  function itemRow(item, opts) {
    opts = opts || {};
    var icon = { doc: '📄', folder: '📁', image: '🖼', app: '▣', file: '📎' }[item.kind] || '📄';
    var side = opts.showArea ? '<div class="item__side"><span class="tag">' + esc(areaName(item.area)) + '</span></div>'
      : '<div class="item__side">' + (item.updated ? '<span>' + esc(item.updated) + '</span>' : '') + '</div>';
    return '<button class="item" data-item="' + esc(item.id) + '" type="button">' +
      '<span class="item__icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="item__main"><span class="item__title">' + esc(item.title) + statusChip(item) + '</span>' +
      '<span class="item__path">' + esc(item.path) + '</span>' +
      (item.summary ? '<span class="item__summary">' + esc(item.summary) + '</span>' : '') +
      '</span>' + side + '</button>';
  }

  function areaName(key) {
    var a = (state.model.areas || []).filter(function (x) { return x.key === key; })[0];
    return a ? a.no + '_' + a.name : key;
  }

  function skillCard(s) {
    return '<article class="card skill">' +
      '<div class="skill__top"><span class="skill__name"><span class="skill__no">' + s.no + '</span>' + esc(s.name) + '</span>' + chip(s.status) + '</div>' +
      '<p class="small muted">' + esc(s.statusText) + '</p>' +
      '<dl class="skill__meta">' +
      '<dt>실행 조건</dt><dd>' + esc(s.trigger) + '</dd>' +
      '<dt>결과물</dt><dd>' + esc(s.output) + '</dd>' +
      '<dt>마지막 실행</dt><dd>' + esc(s.lastRun) + '</dd>' +
      '</dl>' +
      '<div class="skill__next"><b>다음</b> · ' + esc(s.next) + '</div>' +
      '</article>';
  }

  function taskTable(list) {
    if (!list.length) {
      return emptyInline('조건에 맞는 태스크가 없습니다', '상태 필터를 “전체”로 바꾸거나 검색어를 지워 보세요.');
    }
    return '<div class="tablewrap"><table class="table table--tasks"><thead><tr>' +
      '<th class="taskno">#</th><th>태스크</th><th>분류</th><th>상태</th><th>연결 스킬</th><th>결과물 위치</th><th>다음 할 일</th>' +
      '</tr></thead><tbody>' +
      list.map(function (t) {
        return '<tr class="taskrow" data-task="' + esc(String(t.no || '')) + '" title="태스크 상세 보기">' +
          '<td class="taskno">' + esc(String(t.no || '')) + '</td>' +
          '<td><button class="table__link" type="button">' + esc(t.title) + '</button>' + (t.note ? '<div class="path">' + esc(t.note) + '</div>' : '') + '</td>' +
          '<td>' + esc(t.category || '미분류') + '</td>' +
          '<td>' + chip(t.status) + '</td>' +
          '<td class="path">' + esc(t.skill || '—') + '</td>' +
          '<td class="path">' + esc(t.output || '—') + '</td>' +
          '<td class="path">' + esc(t.next || '—') + '</td>' +
          '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* 영역 탭 상단의 "이 영역 태스크 현황" 카드 */
  function areaTaskCard(areaKey) {
    var def = AREA_CAT[areaKey];
    if (!def) return '';
    var all = areaTasks(areaKey);
    var rows = all.filter(matchingTask);
    var counts = { complete: 0, progress: 0, pending: 0 };
    all.forEach(function (t) { if (counts[t.status] !== undefined) counts[t.status]++; });
    var head = '<div class="card__head"><div><h2>이 영역 태스크 현황</h2><p>' +
      rows.length + '건 · ' + (state.filter === 'all' ? '전체' : ((STATUS[state.filter] || {}).label || '')) +
      ' · 분류 ‘' + esc(def.label) + '’ 태스크 · 업무자동화 목록 기준</p></div>' +
      '<div class="row row--gap">' +
      '<span class="tag">완료 ' + counts.complete + '</span>' +
      '<span class="tag">진행중 ' + counts.progress + '</span>' +
      '<span class="tag">미정 ' + counts.pending + '</span>' +
      (all.length ? '<button class="btn btn--ghost btn--sm" data-tab-jump="hub" type="button">업무자동화 탭에서 전체 보기</button>' : '') +
      '</div></div>';
    var body;
    if (!all.length) {
      body = emptyInline('이 분류에 등록된 태스크가 없습니다.',
        '업무자동화 목록에 분류 ‘' + esc(def.label) + '’ 태스크를 적으면 여기에 함께 보입니다. 아래 내용은 그대로 볼 수 있습니다.');
    } else if (!rows.length) {
      body = emptyInline('조건에 맞는 태스크가 없습니다', '상태 필터를 “전체”로 바꾸거나 검색어를 지워 보세요.');
    } else {
      body = taskTable(rows);
    }
    return '<section class="card" data-area-tasks="' + areaKey + '">' + head + body + '</section>';
  }

  function taskCategoryStrip(list) {
    var cats = taskCategories(list);
    if (!cats.length) return '';
    var narrowed = state.filter !== 'all' || !!state.query.trim();
    var rows = cats.filter(function (c) { return !narrowed || c.shown > 0; });
    if (!rows.length) return '';
    return '<div class="taskcats">' + rows.map(function (c) {
      var head = narrowed ? c.shown + '/' + c.all : String(c.all);
      return '<span class="tag">' + esc(c.name) + ' ' + head + ' · 완료 ' + c.complete + '</span>';
    }).join('') + '</div>';
  }

  /* 대시보드의 ‘분류별 태스크’ 카드 — 표는 업무자동화 탭에 두고, 여기서는 분류별 숫자만 봅니다. */
  function taskCategoryCard() {
    var list = scopeTasks();
    var cats = taskCategories(list);
    var total = list.filter(matchingTask).length;
    var label = state.filter === 'all' ? '전체' : ((STATUS[state.filter] || {}).label || '');
    var head = '<div class="card__head"><div><h2>분류별 태스크</h2><p>' + total + '건 · ' + esc(label) +
      ' · 분류 ' + cats.length + '종 · ' + esc(taskSourceLabel()) + '</p></div>' +
      '<button class="btn btn--ghost btn--sm" data-tab-jump="hub" type="button">업무자동화 탭에서 표 보기</button></div>';
    var strip = taskCategoryStrip(list);
    if (!cats.length) {
      return '<section class="card" data-task-categories>' + head +
        emptyInline('등록된 태스크가 없습니다', '업무자동화 목록에 태스크 블록을 적으면 분류별 숫자가 여기에 모입니다.') + '</section>';
    }
    if (!strip) {
      return '<section class="card" data-task-categories>' + head +
        emptyInline('조건에 맞는 태스크가 없습니다', '상태 필터를 “전체”로 바꾸거나 검색어를 지워 보세요.') + '</section>';
    }
    return '<section class="card" data-task-categories>' + head + strip +
      '<p class="small muted">태스크별 표는 <b>업무자동화</b> 탭에 있습니다. 폴더·파일은 태스크 집계에 포함되지 않습니다.</p></section>';
  }

  function taskSourceLabel() {
    return (state.model && state.model.taskSource === 'skills')
      ? '태스크 기준표를 읽지 못해 스킬 정의로 대신 셉니다'
      : '01_업무자동화목록/업무자동화 목록의 태스크';
  }

  function viewDashboard() {
    var m = state.model;
    var tc = taskCounts();
    var sourceNote = state.source === 'drive'
      ? '드라이브 실시간 · ' + fmtDateTime(m.syncedAt)
      : '프리뷰 스냅샷 · 2026-11-20';
    var out = pageHead('허브 대시보드', '지금 Pickle_Base의 상태',
      '폴더를 열지 않아도 태스크와 스킬의 진행 상태, 최근 작업, 아직 정하지 않은 것이 한 화면에 모입니다. 상태 집계는 폴더·파일이 아니라 <code>업무자동화 목록</code>의 태스크 기준입니다.',
      '<span>데이터 · ' + esc(sourceNote) + '</span><span>태스크 ' + tc.all + '건 · 완료 ' + tc.complete + '</span>');

    out += taskCategoryCard();

    out += '<div class="section-label">스킬 ' + (m.skills || []).length + '종</div>';
    out += '<div class="grid grid--auto">' + (m.skills || []).map(skillCard).join('') + '</div>';

    out += '<div class="grid grid--2">';
    out += '<section class="card"><div class="card__head"><div><h2>최근 작업</h2><p>문서 수정일 기준</p></div></div>' +
      '<ol class="timeline">' + (m.timeline || []).map(function (t) {
        return '<li><time>' + esc(t.date) + '</time><strong>' + esc(t.title) + '</strong><p>' + esc(t.desc) + '</p></li>';
      }).join('') + '</ol></section>';

    out += '<section class="card"><div class="card__head"><div><h2>아직 정하지 않은 것</h2><p>스킬 문서 기준 ' + (m.pending || []).length + '건 · 태스크 ‘미정’과는 별개</p></div></div>' +
      ((m.pending || []).length ? '<ul class="pending">' + m.pending.slice(0, 8).map(function (p) {
        return '<li><span class="pending__box" aria-hidden="true"></span><span><b>' + esc(p.title) + '</b><span>' + esc(p.desc) + '</span></span></li>';
      }).join('') + '</ul>' : '<div class="empty"><span class="empty__icon">✓</span><h3>정해야 할 것이 없습니다</h3><p>문서에서 “아직 정하지 않은 것” 항목을 찾지 못했습니다.</p></div>') +
      '</section></div>';

    out += '<section class="card"><div class="card__head"><div><h2>폴더 구조</h2><p>탐색용입니다 — 태스크 집계에는 포함되지 않습니다</p></div></div>' +
      '<div class="folders">' + (m.areas || []).map(function (a) {
        return '<button class="folder' + (a.hub ? ' folder--hub' : '') + '" data-tab-jump="' + a.key + '" type="button">' +
          '<em>' + esc(a.no) + '</em><b>' + esc(a.name) + '</b><span>' + esc(a.role) + '</span><span>' + esc(a.count || '') + '</span></button>';
      }).join('') + '</div></section>';

    return '<div class="view">' + out + '</div>';
  }

  function viewHub() {
    var hubItems = visible(itemsOf('hub'));
    var skillItems = hubItems.filter(function (i) { return /스킬/.test(i.path); });
    var memoItems = hubItems.filter(function (i) { return /기획메모/.test(i.path); });
    var otherItems = hubItems.filter(function (i) { return !/스킬|기획메모/.test(i.path); });
    var tc = taskCounts();

    var out = pageHead('01_업무자동화목록', '업무자동화 허브',
      '태스크는 <code>업무자동화 목록</code>의 태스크 블록이 유일한 기준표입니다. 스킬 정의는 <code>스킬</code> 폴더에, 결과물은 각 업무 폴더에 쌓습니다.',
      '<span>태스크 ' + tc.all + '건 · 완료 ' + tc.complete + '</span><span>스킬 문서 ' + (state.model.skills || []).length + '개</span>');

    out += '<section class="card"><div class="card__head"><div><h2>태스크 목록</h2><p>전체 · 완료 · 진행중 · 미정 집계의 기준</p></div>' +
      (state.model.taskDoc ? '<a class="btn btn--ghost btn--sm" href="' + esc(state.model.taskDoc.url) + '" target="_blank" rel="noopener">목록 문서 열기</a>' : '') +
      '</div>' +
      taskCategoryStrip() + taskTable(visibleTasks()) + '</section>';

    out += '<section class="card"><div class="card__head"><div><h2>스킬 문서</h2><p>목적·실행 조건·입력·절차·결과물·규칙</p></div></div>' +
      '<div class="stack">' + (skillItems.length ? skillItems.map(function (i) { return itemRow(i); }).join('') : emptyInline(hubEmptyText('스킬 문서'))) + '</div></section>';

    out += '<section class="card"><div class="card__head"><div><h2>기획메모</h2><p>SNS 유니버스 · 웹앱 구상</p></div></div>' +
      '<div class="stack">' + (memoItems.length ? memoItems.map(function (i) { return itemRow(i); }).join('') : emptyInline(hubEmptyText('기획메모'))) + '</div></section>';

    out += '<section class="card"><div class="card__head"><div><h2>목록·지도 문서</h2><p>허브 색인과 구조 지도</p></div></div>' +
      '<div class="stack">' + (otherItems.length ? otherItems.map(function (i) { return itemRow(i); }).join('') : emptyInline(hubEmptyText('문서'))) + '</div></section>';

    return '<div class="view">' + out + '</div>';
  }

  function hubEmptyText(label) {
    return state.filter === 'all' ? label + '를 찾지 못했습니다' : '필터에 맞는 ' + label + '가 없습니다';
  }

  function emptyInline(text, sub) {
    return '<div class="empty"><span class="empty__icon">📭</span><h3>' + esc(text) + '</h3>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>';
  }

  function viewBlog() {
    var m = state.model;
    var posts = visible(m.items.filter(function (i) { return i.area === 'blog' && i.kind === 'doc' && /\/원고\//.test(i.path); }));
    var images = visible(m.items.filter(function (i) { return i.area === 'blog' && i.kind !== 'doc'; }));
    var limit = (m.blog && m.blog.limit) || 500;
    var s = m.stats || {};

    var out = pageHead('02_네이버블로그', '원고와 발행 상태',
      '원고마다 상태(초안·발행)와 글자 수를 500자 기준으로 관리합니다. 발행 링크는 원고에 함께 남깁니다.',
      '<span>발행 ' + (s.published || 0) + '편 · 초안 ' + (s.drafts || 0) + '편</span><span>글자 수 기준 ' + limit + '자</span>');

    out += areaTaskCard('blog');

    if (!posts.length) {
      out += '<section class="card">' + emptyInline('조건에 맞는 원고가 없습니다', '검색어나 상태 필터를 바꿔 보세요. 새 원고는 <code>02_네이버블로그/원고</code>에 저장합니다.') + '</section>';
    }

    out += posts.map(function (p) {
      var limit2 = p.limit || limit;
      var pct = Math.min(100, Math.round(((p.chars || 0) / limit2) * 100));
      var body = p.body || p.excerpt || p.summary || '';
      var idSafe = esc(p.id);
      return '<section class="card">' +
        '<div class="card__head"><div><h2>' + esc(p.title) + '</h2><p>' + esc(p.path) + '</p></div>' + statusChip(p) + '</div>' +
        '<p class="small muted">' + esc(p.summary || '') + '</p>' +
        '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
        '<div class="meter__label"><span>' + (p.chars || 0) + '자 / ' + limit2 + '자 기준 (' + pct + '%)</span><span>여유 ' + Math.max(0, limit2 - (p.chars || 0)) + '자</span></div>' +
        (body ? '<div class="dsection"><div class="pre" style="margin-top:14px">' + esc(body) + '</div></div>' : '') +
        '<div class="row row--gap" style="margin-top:14px">' +
        (p.publishedUrl ? '<a class="btn btn--primary btn--sm" href="' + esc(p.publishedUrl) + '" target="_blank" rel="noopener">발행 글 보기</a>' : '') +
        (p.url ? '<a class="btn btn--ghost btn--sm" href="' + esc(p.url) + '" target="_blank" rel="noopener">원고 열기</a>' : '') +
        '<button class="btn btn--ghost btn--sm" data-item="' + idSafe + '" type="button">상세</button>' +
        '</div></section>';
    }).join('');

    out += '<div class="grid grid--2">' +
      '<section class="card"><div class="card__head"><div><h2>다음 원고</h2><p>스킬: 네이버 블로그 글 발행</p></div>' + chip('progress') + '</div>' +
      '<div class="empty"><span class="empty__icon">✎</span><h3>주제를 정하면 바로 초안</h3>' +
      '<p>500자 이내, 간단명료하게. 원고는 <code>02_네이버블로그/원고</code>, 이미지는 <code>02_네이버블로그/이미지</code>에 저장하고 발행 전에 제목·본문·이미지 순서를 확인합니다.</p></div></section>' +
      '<section class="card"><div class="card__head"><div><h2>이미지</h2><p>02_네이버블로그/이미지</p></div></div>' +
      '<div class="stack">' + (images.length ? images.map(function (i) { return itemRow(i); }).join('') : emptyInline('이미지가 없습니다')) + '</div></section>' +
      '</div>';

    return '<div class="view">' + out + '</div>';
  }

  function viewResearch() {
    var m = state.model;
    var buckets = (m.research && m.research.buckets) || [
      { name: '요약노트', files: m.items.filter(function (i) { return i.path.indexOf('03_리서치/요약노트/') === 0; }) },
      { name: '자료', files: m.items.filter(function (i) { return i.path.indexOf('03_리서치/자료/') === 0; }) },
      { name: '출처', files: m.items.filter(function (i) { return i.path.indexOf('03_리서치/출처/') === 0; }) }
    ];
    var topics = (m.research && m.research.topics) || [];
    var out = pageHead('03_리서치', '주제별 리서치 연결',
      '주제 하나를 정하면 자료 → 출처 → 요약노트가 한 묶음으로 쌓입니다. 요약은 핵심 3~5줄과 나에게 의미 있는 시사점까지.',
      '<span>버킷 3 · 요약노트 · 자료 · 출처</span><span>주기 · 미정</span>');

    out += areaTaskCard('research');

    out += '<div class="buckets">' + buckets.map(function (b) {
      return '<div class="bucket"><div class="bucket__head"><b>' + esc(b.name) + '</b><span>' + (b.files || []).length + '</span></div>' +
        ((b.files || []).length
          ? '<ul>' + b.files.map(function (f) { return '<li>' + esc(f.title) + '</li>'; }).join('') + '</ul>'
          : '<p class="empty-mini">아직 비어 있습니다.</p>') +
        '</div>';
    }).join('') + '</div>';

    out += '<section class="card"><div class="card__head"><div><h2>주제별 묶음</h2><p>요약노트를 기준으로 자료와 출처를 묶습니다</p></div></div>' +
      (topics.length
        ? '<div class="stack">' + topics.map(function (t) {
            return '<div class="item" style="cursor:default"><span class="item__icon">🧩</span><span class="item__main">' +
              '<span class="item__title">' + esc(t.title) + '</span>' +
              '<span class="item__path">자료 ' + t.data.length + ' · 출처 ' + t.sources.length + '</span></span></div>';
          }).join('') + '</div>'
        : '<div class="empty"><span class="empty__icon">⌕</span><h3>첫 주제를 기다리는 중</h3>' +
          '<p>스킬 “리서치 요약”은 아직 설계만 된 상태입니다. 주제를 하나 주시면 <code>03_리서치/요약노트</code>에 첫 노트가 생기고, 여기에서 자료·출처와 함께 묶여 보입니다.</p></div>') +
      '</section>';

    out += '<section class="card"><div class="card__head"><div><h2>리서치 규칙</h2><p>스킬 문서에서 가져온 기준</p></div></div>' +
      '<ul class="rulelist">' +
      '<li>출처 없는 주장은 쓰지 않는다 — 링크·발행일·발행처를 <code>출처</code>에 남긴다.</li>' +
      '<li>숫자·날짜는 원문 기준으로 적고, 추정이면 추정이라고 밝힌다.</li>' +
      '<li>요약은 핵심 3~5줄 + 나에게 의미 있는 시사점. 길게 쓰지 않는다.</li>' +
      '<li>확인되지 않은 내용은 “확인 안 됨”으로 구분해 적는다.</li>' +
      '</ul></section>';

    var rsItems = visible(itemsOf('research')).filter(function (i) { return i.kind === 'folder'; });
    if (rsItems.length) {
      out += '<section class="card"><div class="card__head"><div><h2>폴더 상태</h2><p>03_리서치</p></div></div><div class="stack">' +
        rsItems.map(function (i) { return itemRow(i); }).join('') + '</div></section>';
    }
    return '<div class="view">' + out + '</div>';
  }

  function viewApp() {
    var m = state.model;
    var appItem = m.items.filter(function (i) { return i.kind === 'app'; })[0];
    var appUrl = (appItem && appItem.url) || 'https://cspang97.github.io/pickle-base/';
    var plans = visible(m.items.filter(function (i) { return /기획메모/.test(i.path); }));
    var appItems = visible(itemsOf('app')).filter(function (i) { return i.kind === 'folder' || i.kind === 'file'; });

    var out = pageHead('04_애플리케이션', '기획 문서와 앱 배포 현황',
      '기획은 <code>01_업무자동화목록/기획메모</code>에, 앱 결과물은 <code>04_애플리케이션</code>에 남깁니다. 배포는 확인 없이 공개하지 않고, 기본은 비공개입니다.',
      '<span>이 페이지가 v1 산출물</span><span>GitHub Pages</span>');

    out += areaTaskCard('app');

    out += '<section class="card appcard"><div class="card__head"><div><h2>Pickle_Base 워크스페이스 v1</h2><p>첫 번째 앱 — 이 화면</p></div>' + chip('complete') + '</div>' +
      '<div class="appcard__url"><span aria-hidden="true">🔗</span><a href="' + esc(appUrl) + '" target="_blank" rel="noopener">' + esc(appUrl.replace(/^https?:\/\//, '')) + '</a></div>' +
      '<dl class="kv">' +
      '<dt>저장소</dt><dd><a href="https://github.com/cspang97/pickle-base" target="_blank" rel="noopener">github.com/cspang97/pickle-base</a> (public)</dd>' +
      '<dt>배포</dt><dd>GitHub Pages · main 브랜치 루트 · 2026-11-20</dd>' +
      '<dt>구성</dt><dd>정적 HTML/CSS/JS · Google Identity Services + Drive API v3 (읽기 전용)</dd>' +
      '<dt>담은 것</dt><dd>허브 대시보드 · 영역별 탭 · 통합 검색/상태 필터 · 습관 체크 · 프리뷰 데이터 · 로그인 유지 · 뒤로가기 기록</dd>' +
      '<dt>다음 후보</dt><dd>습관 기록을 드라이브 문서로 남기기 · 원고 상태 자동 갱신 · 실행 주기 정하기</dd>' +
      '</dl>' +
      '<div class="row row--gap"><a class="btn btn--primary btn--sm" href="' + esc(appUrl) + '" target="_blank" rel="noopener">앱 열기</a>' +
      '<button class="btn btn--ghost btn--sm" data-item="' + esc(appItem ? appItem.id : '') + '" type="button">상세</button></div></section>';

    out += '<div class="grid grid--2">' +
      '<section class="card"><div class="card__head"><div><h2>기획 문서</h2><p>01_업무자동화목록/기획메모</p></div></div>' +
      '<div class="stack">' + (plans.length ? plans.map(function (i) { return itemRow(i); }).join('') : emptyInline('기획메모가 없습니다')) + '</div></section>' +
      '<section class="card"><div class="card__head"><div><h2>04_애플리케이션</h2><p>코드 · 배포 · 최종산출물</p></div></div>' +
      '<div class="stack">' + (appItems.length ? appItems.map(function (i) { return itemRow(i); }).join('') : emptyInline('폴더가 없습니다')) + '</div></section>' +
      '</div>';

    return '<div class="view">' + out + '</div>';
  }

  function viewDaily() {
    var m = state.model;
    var list = (m.habits && m.habits.length) ? m.habits : PREVIEW.habits;
    var fallback = !(m.habits && m.habits.length) && state.source === 'drive';
    var today = habits[todayKey()] || {};
    var done = list.filter(function (h) { return today[h.id]; }).length;
    var pct = list.length ? Math.round((done / list.length) * 100) : 0;

    var out = pageHead('05_일상생활', '오늘의 습관 체크',
      '“습관 체크” 한마디면 등록된 8개 항목을 하나씩 확인합니다. 여기서는 직접 체크하고 주간 흐름을 봅니다. 체크는 이 브라우저에 저장됩니다.',
      '<span>' + esc(weekLabel(new Date())) + '</span><span id="dailyDone">' + done + ' / ' + list.length + ' 완료</span>');

    if (fallback) {
      out += '<p class="notice">드라이브에서 습관 목록을 찾지 못해 기본 8개 항목을 표시합니다.</p>';
    }

    out += areaTaskCard('daily');

    out += '<section class="card"><div class="card__head"><div><h2>오늘 체크리스트</h2><p>' + esc(todayKey()) + ' (' + weekdayShort(new Date()) + ') · 클릭하면 저장됩니다</p></div>' +
      '<button id="habitReset" class="btn btn--ghost btn--sm" type="button">오늘 초기화</button></div>' +
      '<div class="progressline"><b>' + done + '/' + list.length + '</b><div class="meter"><i style="width:' + pct + '%"></i></div><span class="small muted">' + pct + '%</span></div>' +
      '<div class="habits" style="margin-top:14px">' + list.map(function (h) {
        var on = !!today[h.id];
        return '<label class="habit" data-checked="' + on + '"><input type="checkbox" data-habit="' + esc(h.id) + '"' + (on ? ' checked' : '') + '>' +
          '<span><span class="habit__text">' + esc(h.name) + '</span>' + (h.note ? '<span class="habit__note">' + esc(h.note) + '</span>' : '') + '</span></label>';
      }).join('') + '</div></section>';

    out += '<div class="grid grid--2">' +
      '<section class="card"><div class="card__head"><div><h2>최근 7일</h2><p>저장된 체크 수 / ' + list.length + '</p></div></div>' + weekStrip(list) + '</section>' +
      '<section class="card"><div class="card__head"><div><h2>기록 규칙</h2><p>스킬: 습관 체크</p></div>' + chip('progress') + '</div>' +
      '<ul class="rulelist">' +
      '<li>한 번에 한 항목만 묻는다. 몰아서 묻지 않는다.</li>' +
      '<li>잔소리하지 않는다. 못 지킨 날은 이유만 한 줄.</li>' +
      '<li>정한 항목을 임의로 바꾸거나 지우지 않는다.</li>' +
      '<li>기록 위치는 <code>05_일상생활</code> — 아직 기록 형식과 정기 확인 시각은 미정.</li>' +
      '</ul></section>' +
      '</div>';

    var dailyItems = visible(itemsOf('daily'));
    if (dailyItems.length) {
      out += '<section class="card"><div class="card__head"><div><h2>05_일상생활 폴더</h2><p>날짜별 기록이 쌓이는 곳</p></div></div>' +
        '<div class="stack">' + dailyItems.map(function (i) { return itemRow(i); }).join('') + '</div></section>';
    }
    return '<div class="view">' + out + '</div>';
  }

  function weekLabel(d) { return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '. (' + weekdayShort(d) + ')'; }

  function weekStrip(list) {
    var days = [];
    var now = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var k = dateKey(d);
      var rec = habits[k] || {};
      var n = list.filter(function (h) { return rec[h.id]; }).length;
      days.push('<div class="week__day' + (i === 0 ? ' week__day--today' : '') + (n === 0 ? ' week__day--empty' : '') + '">' +
        '<b>' + weekdayShort(d) + '</b><span>' + (n ? n : '–') + '</span></div>');
    }
    return '<div class="week">' + days.join('') + '</div>';
  }

  function viewSearch() {
    var q = state.query.trim();
    var taskHits = visibleTasks();
    var hits = state.model.items.filter(matching);
    var total = taskHits.length + hits.length;
    var out = '<section class="card hero"><div><p class="eyebrow">통합 검색</p><h1>“' + esc(q) + '” 검색 결과 ' + total + '건</h1>' +
      '<p class="lede">태스크 ' + taskHits.length + '건 · 문서·항목 ' + hits.length + '건. 폴더를 열지 않고 제목·요약·경로·태그로 찾습니다. 상태 필터를 함께 쓸 수 있습니다.</p></div></section>';
    if (!total) {
      return '<div class="view">' + out + '<section class="card">' + emptyInline('일치하는 항목이 없습니다', '다른 낱말로 찾아보거나 상태 필터를 “전체”로 바꿔 보세요.') + '</section></div>';
    }
    if (taskHits.length) {
      out += '<section class="card"><div class="card__head"><div><h2>태스크</h2><p>' + taskHits.length + '건 · 업무자동화 목록 기준</p></div></div>' +
        taskTable(taskHits) + '</section>';
    }
    var groups = {};
    hits.forEach(function (i) { (groups[i.area] = groups[i.area] || []).push(i); });
    Object.keys(groups).forEach(function (k) {
      out += '<section class="card"><div class="card__head"><div><h2>' + esc(areaName(k)) + '</h2><p>' + groups[k].length + '건</p></div></div>' +
        '<div class="stack">' + groups[k].map(function (i) { return itemRow(i, { showArea: false }); }).join('') + '</div></section>';
    });
    return '<div class="view">' + out + '</div>';
  }

  /* ================= 상세 패널 ================= */
  function openDrawer(id, opts) {
    opts = opts || {};
    var item = state.model.items.filter(function (i) { return String(i.id) === String(id); })[0];
    if (!item) return false;
    var body = $('#drawerBody');
    var m = statusMeta(item);
    var rows = [
      ['영역', areaName(item.area)],
      ['경로', item.path],
      ['상태', m.label],
      ['수정일', item.updated || ''],
      item.chars ? ['글자 수', item.chars + '자 / ' + (item.limit || 500) + '자 기준'] : null,
      item.publishedUrl ? ['발행 링크', item.publishedUrl] : null
    ].filter(Boolean);

    body.innerHTML = '<h2 id="drawerTitle">' + esc(item.title) + '</h2>' +
      '<div class="dpath">' + esc(item.path) + '</div>' +
      '<div class="row row--gap" style="margin-top:12px">' + statusChip(item) +
      ((item.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('')) + '</div>' +
      (item.chars ? '<div class="meter"><i style="width:' + Math.min(100, Math.round(item.chars / (item.limit || 500) * 100)) + '%"></i></div>' : '') +
      '<div class="dsection"><h3>내용</h3><div class="dbody">' + esc(item.body || item.excerpt || item.summary || '내용 요약이 없습니다.') + '</div></div>' +
      '<div class="dsection"><h3>정보</h3><dl>' + rows.map(function (r) {
        return '<div class="drow"><dt>' + esc(r[0]) + '</dt><dd>' + (r[1] && /^https?:/.test(r[1]) ? '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener">열기</a>' : esc(r[1])) + '</dd></div>';
      }).join('') + '</dl></div>' +
      '<div class="row row--gap" style="margin-top:18px">' +
      (item.publishedUrl ? '<a class="btn btn--primary btn--sm" href="' + esc(item.publishedUrl) + '" target="_blank" rel="noopener">발행 글 보기</a>' : '') +
      (item.url ? '<a class="btn ' + (item.publishedUrl ? 'btn--ghost' : 'btn--primary') + ' btn--sm" href="' + esc(item.url) + '" target="_blank" rel="noopener">드라이브에서 열기</a>' : '') +
      '</div>' +
      (state.source === 'preview' ? '<p class="small muted" style="margin-top:14px">프리뷰 모드에서는 요약만 보입니다. Google 계정을 연결하면 문서 전체를 드라이브에서 바로 읽습니다.</p>' : '');
    $('#drawer').hidden = false;
    document.body.style.overflow = 'hidden';
    if (opts.history !== false) pushRoute(state.view, { kind: 'item', id: item.id });
    return true;
  }
  function openTaskDrawer(no, opts) {
    opts = opts || {};
    var t = taskList().filter(function (x) { return String(x.no) === String(no); })[0];
    if (!t) return false;
    var doc = state.model && state.model.taskDoc;
    var rows = [
      ['분류', t.category || '미분류'],
      ['상태', t.statusText || ((STATUS[t.status] || STATUS.pending).label)],
      ['연결 스킬', t.skill],
      ['결과물 위치', t.output],
      ['비고', t.note],
      ['다음 할 일', t.next]
    ].filter(function (r) { return !!r[1]; });

    $('#drawerBody').innerHTML = '<h2 id="drawerTitle">' + esc(t.title) + '</h2>' +
      '<div class="dpath">태스크 ' + esc(String(t.no || '—')) + ' · ' + esc(taskSourceLabel()) + '</div>' +
      '<div class="row row--gap" style="margin-top:12px">' + chip(t.status) + '</div>' +
      '<div class="dsection"><h3>태스크 정보</h3><dl>' + rows.map(function (r) {
        return '<div class="drow"><dt>' + esc(r[0]) + '</dt><dd>' + (/^https?:/.test(String(r[1])) ? '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener">열기</a>' : esc(r[1])) + '</dd></div>';
      }).join('') + '</dl></div>' +
      (doc ? '<div class="row row--gap" style="margin-top:18px"><a class="btn btn--primary btn--sm" href="' + esc(doc.url) + '" target="_blank" rel="noopener">업무자동화 목록 열기</a></div>' : '') +
      '<p class="small muted" style="margin-top:14px">태스크 상태는 <code>01_업무자동화목록/업무자동화 목록</code> 문서의 태스크 블록에서 읽습니다.</p>';
    $('#drawer').hidden = false;
    document.body.style.overflow = 'hidden';
    if (opts.history !== false) pushRoute(state.view, { kind: 'task', id: t.no });
    return true;
  }
  /* 닫기는 히스토리에서 이 드로어 항목을 되감습니다. ✕로 닫은 다음 뒤로가기를 누르면
     같은 탭이 아니라 직전 화면으로 갑니다(같은 화면이 두 번 나오지 않게). */
  function closeOverlayHistory() {
    var s = window.history.state;
    if (s && s.pb && s.overlay) {
      try { window.history.back(); return; } catch (e) { /* 아래로 */ }
    }
    replaceRoute(state.view, null);
  }
  function closeDrawerRaw() {
    if ($('#drawer').hidden) return false;
    $('#drawer').hidden = true;
    document.body.style.overflow = '';
    return true;
  }
  function closeDrawer() {
    if (!closeDrawerRaw()) return;
    closeOverlayHistory();
  }

  /* ================= 설정 ================= */
  function openSettings(opts) {
    opts = opts || {};
    $('#cfgClientId').value = cfg.clientId || '';
    $('#cfgFolderId').value = cfg.folderId || '';
    $('#cfgLockEnabled').checked = !!(cfg.lock && cfg.lock.enabled);
    $('#cfgLockPin').value = '';
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    if (opts.history !== false) pushRoute(state.view, { kind: 'modal', id: 'settings' });
    return true;
  }
  function closeModalRaw() {
    if ($('#modal').hidden) return false;
    $('#modal').hidden = true;
    if ($('#drawer').hidden) document.body.style.overflow = '';
    return true;
  }
  function closeSettings() {
    if (!closeModalRaw()) return;
    closeOverlayHistory();
  }
  function sha256(text) {
    if (!(window.crypto && window.crypto.subtle)) return Promise.resolve('plain:' + text);
    var enc = new TextEncoder().encode(text);
    return window.crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('00' + b.toString(16)).slice(-2); }).join('');
    });
  }

  /* ================= 연결 / 동기화 ================= */
  function setBusy(on, msg) {
    state.loading = on;
    var btn = $('#btnConnect');
    btn.disabled = on;
    btn.textContent = on ? (msg || '연결 중…') : 'Google 계정 연결';
    var syncBtn = $('#btnSync');
    syncBtn.disabled = on;
    syncBtn.textContent = on ? '읽는 중…' : '동기화';
  }

  function doConnect() {
    if (!cfg.clientId) { openSettings(); toast('먼저 OAuth 클라이언트 ID를 넣어 주세요'); return; }
    state.error = null;
    setBusy(true, 'Google 로그인 중…');
    window.PBDrive.connect(cfg.clientId)
      .then(function (res) {
        state.token = res.token;
        state.connectedEmail = '';
        tokenExpiry = res.expiresAt || 0;
        if (window.PBDrive.saveToken) window.PBDrive.saveToken(res.token, res.expiresAt);
        return doSync('연결됨');
      })
      .catch(function (err) {
        state.error = err.friendly || err.message || String(err);
        render();
      })
      .then(function () { setBusy(false); });
  }

  /* 로그인 상태 정리 — 메모리와 브라우저 저장본을 함께 지웁니다. */
  function forgetToken() {
    state.token = null;
    tokenExpiry = 0;
    if (window.PBDrive && window.PBDrive.clearToken) window.PBDrive.clearToken();
  }

  /* 페이지를 새로 열거나 뒤로가기로 돌아왔 때 저장된 로그인을 되살립니다. */
  function restoreToken() {
    if (!(window.PBDrive && window.PBDrive.loadToken)) return false;
    if (!cfg.clientId) {
      // 클라이언트 ID가 없으면 이 토큰은 쓸 수 없습니다 — 남겨 두지 않고 지웁니다.
      if (window.PBDrive.clearToken) window.PBDrive.clearToken();
      return false;
    }
    var saved = window.PBDrive.loadToken();
    if (!saved || !saved.token) return false;
    state.token = saved.token;
    tokenExpiry = saved.expiresAt || 0;
    return true;
  }

  /* 연결 해제 — 저장된 토큰을 지우고 구글 쪽 토큰도 가능하면 폐기합니다. */
  function disconnect() {
    var t = state.token;
    if (window.PBDrive && window.PBDrive.revoke) window.PBDrive.revoke(t);
    forgetToken();
    state.model = PREVIEW;
    state.source = 'preview';
    state.connectedEmail = '';
    state.error = null;
    render();
    toast('연결을 해제했습니다 · 저장된 로그인도 지웠습니다');
  }

  function doSync(doneMsg) {
    if (!state.token) { openSettings(); return Promise.resolve(); }
    if (tokenExpiry && Date.now() > tokenExpiry - 60000) {
      forgetToken();
      state.error = '구글 로그인이 만료되었습니다. “Google 계정 연결”을 다시 눌러 주세요.';
      render();
      return Promise.resolve();
    }
    setBusy(true, '드라이브 읽는 중…');
    return window.PBDrive.fetchModel({ token: state.token, folderId: cfg.folderId || '', folderName: cfg.folderName || 'Pickle_Base' })
      .then(function (model) {
        state.model = model;
        state.source = 'drive';
        state.connectedEmail = model.account || '';
        state.error = null;
        render();
        var n = model.items.length;
        toast((doneMsg ? doneMsg + ' · ' : '') + '드라이브에서 ' + n + '개 항목을 읽었습니다');
      })
      .catch(function (err) {
        if (err && err.status === 401) { forgetToken(); }
        state.error = (err && (err.friendly || err.message)) || '드라이브를 읽지 못했습니다.';
        render();
      })
      .then(function () { setBusy(false); });
  }

  /* ================= 주소·히스토리 (모바일 뒤로가기) =================
     탭과 상세 드로어·설정 모달을 브라우저 히스토리에 쌓습니다. 그래서 모바일
     뒤로가기는 앱 밖으로 나가지 않고, 드로어를 닫거나 이전 탭으로 돌아갑니다.
     주소 해시(#blog)도 함께 맞춰 새로고침·링크 공유에서도 같은 화면이 열립니다. */
  var VIEWS = TABS.map(function (t) { return t.key; });
  function validView(key) { return VIEWS.indexOf(String(key)) >= 0; }
  function routeUrl(view, overlay) {
    var v = validView(view) ? view : 'dashboard';
    var h = v !== 'dashboard' ? '#' + v : '';
    if (overlay && overlay.kind && overlay.id != null) {
      h = '#' + v + '/' + overlay.kind + '/' + encodeURIComponent(String(overlay.id));
    }
    return BASE_URL + h;
  }
  function routeFromHash() {
    var raw = String(window.location.hash || '').replace(/^#\/?/, '');
    if (!raw) return { view: 'dashboard', overlay: null };
    var parts = raw.split('/');
    var view = validView(parts[0]) ? parts[0] : 'dashboard';
    var overlay = null;
    if (parts[2] && (parts[1] === 'item' || parts[1] === 'task' || parts[1] === 'modal')) {
      overlay = { kind: parts[1], id: decodeURIComponent(parts.slice(2).join('/')) };
    }
    return { view: view, overlay: overlay };
  }
  function pushRoute(view, overlay) {
    var url = routeUrl(view, overlay);
    var s = window.history.state;
    if (s && s.pb && routeUrl(s.view, s.overlay) === url) return false;
    try {
      window.history.pushState({ pb: 1, view: view, overlay: overlay || null }, '', url);
      return true;
    } catch (e) { return false; }
  }
  function replaceRoute(view, overlay) {
    try {
      window.history.replaceState({ pb: 1, view: view, overlay: overlay || null }, '', routeUrl(view, overlay));
      return true;
    } catch (e) { return false; }
  }
  function scrollTop() {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* 스크롤 불가 */ }
  }

  /* 탭 이동 — 화면을 바꾸고 히스토리에 한 칸 쌓습니다. */
  function goTab(key) {
    if (!validView(key)) return;
    state.view = key;
    state.query = '';
    var si = $('#search');
    if (si) si.value = '';
    closeDrawerRaw();
    closeModalRaw();
    render();
    pushRoute(key, null);
    scrollTop();
  }

  /* 히스토리 한 칸을 거슬러 올 때(뒤로가기) 그 칸의 화면을 그대로 복원합니다. */
  function applyRoute(route) {
    var r = route || routeFromHash();
    var target = validView(r.view) ? r.view : 'dashboard';
    var changed = state.view !== target;
    state.view = target;
    state.query = '';
    var si = $('#search');
    if (si) si.value = '';
    closeDrawerRaw();
    closeModalRaw();
    render();
    var o = r.overlay;
    var opened = true;
    if (o && o.kind === 'task') opened = openTaskDrawer(o.id, { history: false });
    else if (o && o.kind === 'item') opened = openDrawer(o.id, { history: false });
    else if (o && o.kind === 'modal') opened = openSettings({ history: false });
    if (!opened) replaceRoute(state.view, null);
    if (changed) scrollTop();
  }
  function currentRoute() {
    var s = window.history.state;
    if (s && s.pb) return { view: s.view || 'dashboard', overlay: s.overlay || null };
    return routeFromHash();
  }

  /* ================= 이벤트 ================= */
  function attach() {
    $$('#main [data-item]').forEach(function (el) {
      el.addEventListener('click', function () { openDrawer(el.getAttribute('data-item')); });
    });
    $$('#main tr[data-task]').forEach(function (tr) {
      tr.addEventListener('click', function () { openTaskDrawer(tr.getAttribute('data-task')); });
    });
    $$('#main [data-tab-jump]').forEach(function (el) {
      el.addEventListener('click', function () { goTab(el.getAttribute('data-tab-jump')); });
    });
    var reset = $('#habitReset');
    if (reset) reset.addEventListener('click', function () {
      delete habits[todayKey()];
      saveHabits();
      render();
      toast('오늘 체크를 초기화했습니다');
    });
    $$('#main [data-habit]').forEach(function (input) {
      input.addEventListener('change', function () {
        var k = todayKey();
        habits[k] = habits[k] || {};
        if (input.checked) habits[k][input.getAttribute('data-habit')] = true;
        else delete habits[k][input.getAttribute('data-habit')];
        saveHabits();
        var label = input.closest('.habit');
        if (label) label.setAttribute('data-checked', input.checked ? 'true' : 'false');
        var list = (state.model.habits && state.model.habits.length) ? state.model.habits : PREVIEW.habits;
        var today = habits[k] || {};
        var done = list.filter(function (h) { return today[h.id]; }).length;
        var pct = list.length ? Math.round(done / list.length * 100) : 0;
        var line = $('.progressline');
        if (line) {
          line.querySelector('b').textContent = done + '/' + list.length;
          line.querySelector('.meter i').style.width = pct + '%';
          line.querySelector('.small').textContent = pct + '%';
        }
        var heroDone = $('#dailyDone');
        if (heroDone) heroDone.textContent = done + ' / ' + list.length + ' 완료';
      });
    });
  }

  function boot() {
    // 탭
    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]');
      if (!b) return;
      goTab(b.getAttribute('data-tab'));
    });

    // 모바일 뒤로가기 — 앱 밖으로 나가기 전에 먼저 앱 안에서 한 칸 돌아갑니다.
    window.addEventListener('popstate', function () {
      applyRoute(currentRoute());
    });

    // 상태 필터
    $('#statusChips').addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      state.filter = b.getAttribute('data-filter');
      render();
    });

    // 검색
    var si = $('#search');
    si.addEventListener('input', function () {
      state.query = si.value;
      render();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== si && !e.metaKey && !e.ctrlKey) {
        e.preventDefault(); si.focus();
      }
      if (e.key === 'Escape') {
        if (!$('#modal').hidden) closeSettings();
        else if (!$('#drawer').hidden) closeDrawer();
        else if (si.value) { si.value = ''; state.query = ''; render(); }
      }
    });

    // 헤더 버튼
    $('#btnConnect').addEventListener('click', doConnect);
    $('#btnSync').addEventListener('click', function () { doSync(); });
    $('#btnDisconnect').addEventListener('click', disconnect);
    $('#btnSettings').addEventListener('click', function () { openSettings(); });

    // 닫기
    $$('[data-close-modal]').forEach(function (el) { el.addEventListener('click', closeSettings); });
    $$('[data-close-drawer]').forEach(function (el) { el.addEventListener('click', closeDrawer); });

    // 설정 저장
    $('#cfgSave').addEventListener('click', function () {
      var v = $('#cfgClientId').value.trim();
      if (v && !/\.apps\.googleusercontent\.com$/.test(v)) {
        toast('클라이언트 ID 형식이 아닙니다 (…apps.googleusercontent.com)');
        return;
      }
      cfg.clientId = v;
      cfg.folderId = $('#cfgFolderId').value.trim();
      saveCfg();
      if (!v) forgetToken();
      closeSettings();
      render();
      toast(v ? '저장했습니다. 상단의 Google 계정 연결을 눌러 주세요.' : '클라이언트 ID를 비웠습니다.');
    });
    $('#cfgClear').addEventListener('click', function () {
      disconnect();
      closeSettings();
    });
    $('#cfgPreview').addEventListener('click', function () {
      state.model = PREVIEW; state.source = 'preview'; state.error = null;
      closeSettings(); render(); toast('프리뷰 데이터로 보는 중');
    });
    $('#cfgLockSave').addEventListener('click', function () {
      var enabled = $('#cfgLockEnabled').checked;
      var pin = $('#cfgLockPin').value.trim();
      if (!enabled) { cfg.lock = { enabled: false, hash: '' }; saveCfg(); toast('화면 잠금을 껐습니다'); return; }
      if (pin.length < 4) { toast('PIN은 4자 이상으로 정해 주세요'); return; }
      sha256(pin).then(function (h) {
        cfg.lock = { enabled: true, hash: h };
        saveCfg();
        toast('화면 잠금을 켰습니다. 다음 접속부터 PIN을 묻습니다.');
      });
    });
    $('#cfgLockRemove').addEventListener('click', function () {
      cfg.lock = { enabled: false, hash: '' };
      $('#cfgLockEnabled').checked = false;
      $('#cfgLockPin').value = '';
      saveCfg();
      toast('화면 잠금을 껐습니다');
    });
    $('#cfgReset').addEventListener('click', function () {
      try { localStorage.removeItem(CFG_KEY); localStorage.removeItem(HABIT_KEY); } catch (e) { /* noop */ }
      if (window.PBDrive && window.PBDrive.clearToken) window.PBDrive.clearToken();
      location.reload();
    });

    // 화면 잠금
    if (cfg.lock && cfg.lock.enabled) {
      var lock = $('#lockScreen');
      lock.hidden = false;
      document.body.style.overflow = 'hidden';
      $('#lockPin').focus();
      $('#lockForm').addEventListener('submit', function (e) {
        e.preventDefault();
        sha256($('#lockPin').value.trim()).then(function (h) {
          if (h === cfg.lock.hash) {
            lock.hidden = true;
            document.body.style.overflow = '';
            toast('열렸습니다');
          } else {
            $('#lockError').hidden = false;
            $('#lockPin').value = '';
            $('#lockPin').focus();
          }
        });
      });
    }

    // 주소(해시)에 적힌 화면에서 시작하고, 지금 상태를 히스토리에 기록합니다.
    // 모바일 뒤로가기 파일이 앱 안에서 먼저 움직이도록 하는 출발점입니다.
    var bootRoute = routeFromHash();
    if (validView(bootRoute.view)) state.view = bootRoute.view;
    replaceRoute(state.view, null);
    if (bootRoute.overlay) pushRoute(state.view, bootRoute.overlay);

    // 저장된 구글 로그인이 살아 있으면 다시 묻지 않고 이어서 읽습니다.
    var resumed = restoreToken();

    render();

    if (bootRoute.overlay) {
      var opened = bootRoute.overlay.kind === 'task'
        ? openTaskDrawer(bootRoute.overlay.id, { history: false })
        : bootRoute.overlay.kind === 'item'
          ? openDrawer(bootRoute.overlay.id, { history: false })
          : true;
      if (!opened) replaceRoute(state.view, null);
    }

    if (resumed) doSync('연결 유지');

    // 저장된 클라이언트 ID가 있으면 한 번 안내
    if (cfg.clientId) {
      var b = $('#btnConnect');
      b.textContent = 'Google 계정 연결';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
