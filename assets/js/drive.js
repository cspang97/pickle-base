/* Google Drive 읽기 연동 (Google Identity Services + Drive API v3)
   - 사용자가 넣은 OAuth 클라이언트 ID로 브라우저에서 바로 토큰을 받습니다(암묵적 흐름, 토큰은 메모리에만).
   - 요청 범위는 읽기 전용 drive.readonly 하나입니다.
   - 받아온 드라이브 구조·문서를 앱 모델(areas/items/skills/...)로 변환합니다. */
window.PBDrive = (function () {
  var SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
  var API = 'https://www.googleapis.com/drive/v3/';
  var FOLDER = 'application/vnd.google-apps.folder';
  var DOC = 'application/vnd.google-apps.document';
  var GIS_SRC = 'https://accounts.google.com/gsi/client';

  /* ---------- 스크립트 / 인증 ---------- */
  function loadGis() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-gis]');
      if (existing) {
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', function () { reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다. 네트워크를 확인해 주세요.')); });
        return;
      }
      var s = document.createElement('script');
      s.src = GIS_SRC;
      s.async = true;
      s.defer = true;
      s.setAttribute('data-gis', '1');
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('Google 로그인 스크립트를 불러오지 못했습니다. 네트워크를 확인해 주세요.')); };
      document.head.appendChild(s);
    });
  }

  function connect(clientId) {
    if (!clientId) return Promise.reject(new Error('OAuth 클라이언트 ID가 없습니다. 설정에서 먼저 넣어 주세요.'));
    return loadGis().then(function () {
      return new Promise(function (resolve, reject) {
        var settled = false;
        var client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: SCOPE,
          callback: function (resp) {
            if (settled) return;
            settled = true;
            if (resp && resp.error) {
              reject(new Error(friendlyAuthError(resp.error, resp.error_description)));
              return;
            }
            resolve({ token: resp.access_token, expiresAt: Date.now() + ((resp.expires_in || 3500) * 1000) });
          },
          error_callback: function (err) {
            if (settled) return;
            settled = true;
            var type = (err && (err.type || err.message)) || '';
            if (type === 'popup_closed') reject(new Error('로그인 창이 닫혔습니다. 다시 “Google 계정 연결”을 눌러 주세요.'));
            else if (type === 'popup_failed_to_open') reject(new Error('팝업이 차단되었습니다. 이 사이트의 팝업을 허용하고 다시 시도해 주세요.'));
            else reject(new Error('Google 로그인에 실패했습니다: ' + type));
          }
        });
        client.requestAccessToken({ prompt: '' });
      });
    });
  }

  function friendlyAuthError(code, desc) {
    var c = String(code || '');
    if (c === 'access_denied') return '연결이 취소되었습니다.';
    if (c === 'invalid_client' || c === 'invalid_request') return '클라이언트 ID가 올바르지 않습니다. 설정에서 값을 확인해 주세요.';
    if (c === 'origin_mismatch' || c === 'idpiframe_initialization_failed') {
      return '이 주소가 OAuth 클라이언트의 “승인된 JavaScript 출처”에 없습니다. Google Cloud에서 https://cspang97.github.io 를 추가해 주세요.';
    }
    return 'Google 인증 오류: ' + c + (desc ? ' — ' + desc : '');
  }

  /* ---------- API ---------- */
  function driveGet(path, params, token) {
    var url = new URL(API + path);
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') url.searchParams.set(k, params[k]);
    });
    return fetch(url.toString(), { headers: { Authorization: 'Bearer ' + token } }).then(function (r) {
      if (r.ok) return r.json();
      return r.text().then(function (body) {
        var msg = body;
        try { msg = JSON.parse(body).error.message || body; } catch (e) { /* keep body */ }
        var err = new Error(msg);
        err.status = r.status;
        if (r.status === 401) err.friendly = '구글 로그인이 만료되었습니다. “Google 계정 연결”을 다시 눌러 주세요.';
        else if (r.status === 403) err.friendly = '드라이브 접근 권한이 없습니다. 연결 시 드라이브 읽기 권한을 허용했는지 확인해 주세요. (' + msg + ')';
        else if (r.status === 404) err.friendly = '드라이브 항목을 찾지 못했습니다. 폴더 ID를 확인해 주세요.';
        else err.friendly = '드라이브 요청 실패(' + r.status + '): ' + msg;
        throw err;
      });
    });
  }

  function listChildren(folderId, token) {
    var out = [];
    function page(token2) {
      return driveGet('files', {
        q: "'" + folderId + "' in parents and trashed = false",
        fields: 'nextPageToken, files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)',
        pageSize: 200,
        orderBy: 'name_natural',
        pageToken: token2
      }, token).then(function (res) {
        out = out.concat(res.files || []);
        if (res.nextPageToken) return page(res.nextPageToken);
        return out;
      });
    }
    return page('');
  }

  function walk(folderId, prefix, depth, token, acc) {
    if (depth > 6) return Promise.resolve();
    return listChildren(folderId, token).then(function (kids) {
      return kids.reduce(function (p, k) {
        return p.then(function () {
          var path = prefix ? prefix + '/' + k.name : k.name;
          acc.push({ id: k.id, name: cleanName(k.name), mimeType: k.mimeType, modifiedTime: k.modifiedTime, size: k.size, webViewLink: k.webViewLink, path: path, depth: depth });
          if (k.mimeType === FOLDER) return walk(k.id, path, depth + 1, token, acc);
        });
      }, Promise.resolve());
    });
  }

  function findBaseFolder(name, token) {
    var q = "name = '" + String(name || 'Pickle_Base').replace(/'/g, "\\'") + "' and mimeType = '" + FOLDER + "' and trashed = false";
    return driveGet('files', { q: q, fields: 'files(id,name,webViewLink)', pageSize: 10, orderBy: 'modifiedTime desc' }, token)
      .then(function (res) {
        var files = res.files || [];
        return files.length ? files[0] : null;
      });
  }

  function exportText(id, token) {
    var url = API + 'files/' + encodeURIComponent(id) + '/export?mimeType=text/plain';
    return fetch(url, { headers: { Authorization: 'Bearer ' + token } }).then(function (r) {
      if (!r.ok) return null;
      return r.text().then(normalizeExport);
    }).catch(function () { return null; });
  }

  /* text/plain 내보내기는 BOM·CRLF를 붙이고, 목록 문단을 "* "로 그립니다.
     두 경우를 모두 벗겨서 본문을 줄 단위로 읽습니다. */
  function normalizeExport(raw) {
    var text = String(raw == null ? '' : raw).replace(/^\uFEFF/, '');
    return text.split(/\r\n|\r|\n/).map(function (line) {
      var l = line;
      var guard = 0;
      while (guard++ < 5) {
        if (l.indexOf('* ') === 0) { l = l.slice(2); continue; }
        if (l.indexOf('• ') === 0) { l = l.slice(2); continue; }
        break;
      }
      return l.trim() === '*' ? '' : l;
    }).join('\n');
  }

  function pool(list, limit, fn) {
    var i = 0;
    function worker() {
      if (i >= list.length) return Promise.resolve();
      var item = list[i++];
      return Promise.resolve(fn(item)).then(worker, worker);
    }
    var workers = [];
    for (var n = 0; n < Math.min(limit, list.length); n++) workers.push(worker());
    return Promise.all(workers);
  }

  /* ---------- 문서 해석 ---------- */
  function cleanName(name) {
    return String(name || '').replace(/^<<<EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>\s*/, '').replace(/<<<END_EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>/g, '').trim();
  }

  var HEADINGS = ['목적', '실행 조건', '입력', '절차', '결과물', '규칙', '아직 정하지 않은 것', '실행 기록', '지금 등록된 습관'];

  function isHeadingLine(line) {
    return HEADINGS.some(function (h) {
      return line === h || line.indexOf(h + ' ') === 0 || line.indexOf(h + '(') === 0;
    });
  }

  function sectionLines(text, heading) {
    var lines = String(text || '').split('\n');
    var idx = -1;
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t === heading || t.indexOf(heading + ' ') === 0 || t.indexOf(heading + '(') === 0) { idx = i; break; }
    }
    if (idx < 0) return [];
    var out = [];
    for (var j = idx + 1; j < lines.length; j++) {
      var line = lines[j].trim();
      if (!line) { if (out.length) break; continue; }
      if (isHeadingLine(line)) break;
      out.push(line);
    }
    return out;
  }

  function bodyText(text, name) {
    var lines = String(text || '').split('\n');
    if (lines.length && (lines[0].trim() === String(name || '').trim() || /^제목\s*:/.test(lines[0].trim()))) lines = lines.slice(1);
    lines = lines.filter(function (l) { return !/^(발행|URL|작성|날짜|카테고리)\s*:/.test(l.trim()); });
    return lines.join('\n').trim();
  }

  function detectStatus(path, text) {
    if (!text) return 'pending';
    if (/네이버블로그/.test(path)) {
      return /https?:\/\/blog\.naver\.com\/\S+/.test(text) ? 'complete' : 'progress';
    }
    if (/\/스킬\//.test(path) || /^스킬\s*:/.test(path.split('/').pop() || '')) {
      var rec = sectionLines(text, '실행 기록');
      var hasRun = rec.length && !(rec.length === 1 && /아직 없음/.test(rec[0]));
      if (hasRun) return 'complete';
      return /아직 정하지 않은 것/.test(text) ? 'pending' : 'progress';
    }
    if (/발행 완료|배포 완료/.test(text)) return 'complete';
    return 'progress';
  }

  function areaKey(path) {
    var first = String(path || '').split('/')[0];
    if (/^01_/.test(first) || first === 'Pickle_Base') return 'hub';
    if (/^02_/.test(first)) return 'blog';
    if (/^03_/.test(first)) return 'research';
    if (/^04_/.test(first)) return 'app';
    if (/^05_/.test(first)) return 'daily';
    if (/^06_/.test(first)) return 'personal';
    return 'hub';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    return String(iso).slice(0, 10);
  }

  function extractBlogUrl(text) {
    var m = String(text || '').match(/https?:\/\/blog\.naver\.com\/[^\s)>\]]+/);
    return m ? m[0] : '';
  }

  /* ---------- 태스크 기준표: 01_업무자동화목록/업무자동화 목록 ----------
     이 문서의 '태스크:' 블록만 태스크로 셉니다. 폴더·파일은 태스크가 아닙니다.
     블록 라벨은 이름을 바꾸지 않는 규칙이라, 라벨 단위로 읽습니다. */
  var TASK_DOC_ID = '15LMQutQ9JL0XBFnhSQ81zM7bspdzvvtragD_tRbCc6U';
  var TASK_DOC_NAME = '업무자동화 목록';
  var TASK_LABELS = ['분류', '상태', '연결 스킬', '결과물 위치', '다음 할 일', '비고'];

  function statusKey(value) {
    var t = String(value || '').replace(/\s+/g, ' ').trim();
    if (!t) return 'pending';
    if (/^(완료|완료됨|done)/i.test(t)) return 'complete';
    if (/^(진행|진행중|진행 중|in progress|doing)/i.test(t)) return 'progress';
    if (/^(미정|설계 전|설계전|예정|보류|pending|todo)/i.test(t)) return 'pending';
    return 'pending';
  }

  function parseTasks(text) {
    var lines = String(text || '').split('\n');
    var out = [];
    var cur = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/\u00a0/g, ' ').trim();
      if (!line) continue;
      var head = line.match(/^태스크\s*[:：]+\s*(.+)$/);
      if (head) {
        cur = { no: out.length + 1, title: head[1].trim(), category: '', status: 'pending', statusText: '', skill: '', output: '', note: '', next: '' };
        out.push(cur);
        continue;
      }
      if (!cur) continue;
      var label = null;
      for (var k = 0; k < TASK_LABELS.length; k++) {
        if (line.indexOf(TASK_LABELS[k] + ':') === 0 || line.indexOf(TASK_LABELS[k] + '：') === 0) { label = TASK_LABELS[k]; break; }
      }
      if (!label) continue;
      var value = line.slice(label.length + 1).trim();
      if (label === '분류') cur.category = value;
      else if (label === '상태') { cur.statusText = value; cur.status = statusKey(value); }
      else if (label === '연결 스킬') cur.skill = value.replace(/^스킬\s*[:：]\s*/, '');
      else if (label === '결과물 위치') cur.output = value;
      else if (label === '다음 할 일') cur.next = value;
      else if (label === '비고') cur.note = value;
    }
    return out.filter(function (t) { return t.title && (t.statusText || t.category || t.output); });
  }

  function statsOfTasks(tasks) {
    var out = { all: tasks.length, complete: 0, progress: 0, pending: 0, categories: [] };
    var byName = {};
    tasks.forEach(function (t) {
      var st = t.status === 'complete' ? 'complete' : (t.status === 'progress' ? 'progress' : 'pending');
      out[st]++;
      var name = t.category || '미분류';
      if (!byName[name]) { byName[name] = { name: name, all: 0, complete: 0, progress: 0, pending: 0 }; out.categories.push(byName[name]); }
      byName[name].all++;
      byName[name][st]++;
    });
    return out;
  }

  /* ---------- 모델 만들기 ---------- */
  function fetchModel(opts) {
    var token = opts.token;
    var folderName = opts.folderName || 'Pickle_Base';
    var folderId = opts.folderId;
    var problems = [];

    var basePromise = folderId
      ? Promise.resolve({ id: folderId, name: folderName })
      : findBaseFolder(folderName, token).then(function (f) {
          if (!f) throw new Error('드라이브에서 “' + folderName + '” 폴더를 찾지 못했습니다. 설정의 폴더 ID를 직접 넣어 주세요.');
          return f;
        });

    return Promise.all([
      basePromise,
      driveGet('about', { fields: 'user(displayName,emailAddress)' }, token).catch(function () { return { user: {} }; })
    ]).then(function (res) {
      var base = res[0];
      var user = (res[1] && res[1].user) || {};
      var flat = [];
      return walk(base.id, '', 0, token, flat).then(function () {
        var docs = flat.filter(function (f) { return f.mimeType === DOC; });
        var texts = {};
        return pool(docs, 4, function (d) {
          return exportText(d.id, token).then(function (t) {
            texts[d.id] = t;
            if (t === null) problems.push('문서 본문을 읽지 못했습니다: ' + d.name);
          });
        }).then(function () {
          return buildModel({ base: base, user: user, flat: flat, texts: texts, problems: problems });
        });
      });
    });
  }

  function buildModel(ctx) {
    var flat = ctx.flat;
    var texts = ctx.texts;
    var problems = ctx.problems;

    var areas = [];
    var areaMeta = {
      hub: { key: 'hub', no: '01', name: '업무자동화목록', role: '허브 · 목록/스킬/기획메모', hub: true },
      blog: { key: 'blog', no: '02', name: '네이버블로그', role: '원고 · 이미지' },
      research: { key: 'research', no: '03', name: '리서치', role: '자료 · 요약노트 · 출처' },
      app: { key: 'app', no: '04', name: '애플리케이션', role: '코드 · 배포 · 최종산출물' },
      daily: { key: 'daily', no: '05', name: '일상생활', role: '습관 체크 기록' },
      personal: { key: 'personal', no: '06', name: '개인', role: '개인 작업 공간' }
    };

    var items = [];
    var childrenCount = {};
    flat.forEach(function (f) {
      var seg = f.path.split('/');
      if (seg.length > 1) {
        var parent = seg.slice(0, -1).join('/');
        childrenCount[parent] = (childrenCount[parent] || 0) + 1;
      }
    });

    flat.forEach(function (f) {
      var key = areaKey(f.path);
      var isFolder = f.mimeType === FOLDER;
      var text = texts[f.id] || '';
      var status = isFolder ? ((childrenCount[f.path] || 0) > 0 ? 'progress' : 'pending') : detectStatus(f.path, text);
      if (!isFolder && f.mimeType !== DOC) status = 'complete';
      var item = {
        id: f.id,
        area: key,
        kind: isFolder ? 'folder' : (f.mimeType === DOC ? 'doc' : (f.mimeType.indexOf('image/') === 0 ? 'image' : 'file')),
        title: f.name,
        path: f.path,
        status: status,
        updated: fmtDate(f.modifiedTime),
        summary: isFolder
          ? ((childrenCount[f.path] || 0) ? '하위 ' + childrenCount[f.path] + '개 항목' : '비어 있음')
          : firstLine(bodyText(text, f.name)) || mimeLabel(f.mimeType),
        excerpt: text ? bodyText(text, f.name).slice(0, 900) : '',
        tags: [areaMeta[key].name, isFolder ? '폴더' : '문서'],
        url: f.webViewLink || ('https://drive.google.com/file/d/' + f.id + '/view'),
        live: true
      };
      if (!isFolder && f.mimeType === DOC) {
        var body = bodyText(text, f.name);
        item.chars = body.length;
        item.limit = 500;
        item.body = body;
      }
      if (key === 'blog' && /\/원고\//.test(f.path)) {
        var pub = extractBlogUrl(text);
        item.statusLabel = pub ? '발행' : '초안';
        item.publishedUrl = pub;
        item.status = pub ? 'complete' : 'progress';
      }
      items.push(item);
    });

    // 영역 요약
    Object.keys(areaMeta).forEach(function (k) {
      var inArea = items.filter(function (i) { return i.area === k; });
      if (!inArea.length) return;
      var docs = inArea.filter(function (i) { return i.kind === 'doc'; }).length;
      var files = inArea.length - docs;
      var meta = Object.assign({}, areaMeta[k]);
      meta.count = docs + '개 문서' + (files ? ' · ' + files + '개 항목' : '');
      areas.push(meta);
    });

    // 스킬
    var skills = items.filter(function (i) { return i.kind === 'doc' && (/\/스킬\//.test(i.path) || /(^|\/)스킬\s*:/.test(i.title)); });
    var skillModels = skills.map(function (s, idx) {
      var text = texts[s.id] || '';
      var rec = sectionLines(text, '실행 기록');
      var next = sectionLines(text, '아직 정하지 않은 것');
      var trigger = sectionLines(text, '실행 조건');
      var output = sectionLines(text, '결과물');
      var runs = rec.filter(function (l) { return !/아직 없음/.test(l); });
      return {
        no: idx + 1,
        name: s.title.replace(/^스킬\s*:\s*/, ''),
        status: s.status,
        statusText: runs.length ? runs.length + '회 실행' : (s.status === 'pending' ? '설계만 · 실행 0회' : '정의 완료 · 실행 기록 없음'),
        trigger: trigger[0] || '문서의 실행 조건 참고',
        output: output.join(' · ') || '문서의 결과물 항목 참고',
        lastRun: runs.length ? runs[runs.length - 1] : '아직 없음',
        next: next[0] || '문서의 “아직 정하지 않은 것” 참고',
        docUrl: s.url
      };
    });

    // 태스크 기준표 — 폴더·파일이 아니라 '업무자동화 목록'의 태스크 블록만 셉니다.
    var taskDoc = flat.filter(function (f) {
      return f.mimeType === DOC && (f.id === TASK_DOC_ID || f.name === TASK_DOC_NAME);
    })[0];
    var tasks = parseTasks(taskDoc ? texts[taskDoc.id] : '');
    var taskSource = 'doc';
    if (!tasks.length) {
      // 목록 문서를 못 읽거나 블록이 없을 때만 스킬 정의로 대신합니다.
      taskSource = 'skills';
      tasks = skillModels.map(function (s) {
        return {
          no: s.no, title: s.name, category: '', status: s.status, statusText: '',
          skill: s.name, output: s.output, note: s.statusText, next: s.next
        };
      });
    }
    var taskStats = statsOfTasks(tasks);

    // 블로그
    var posts = items.filter(function (i) { return i.area === 'blog' && i.kind === 'doc' && /\/원고\//.test(i.path); });
    var published = posts.filter(function (p) { return p.publishedUrl; });

    // 리서치: 버킷 + 주제
    var buckets = ['요약노트', '자료', '출처'];
    var researchBuckets = buckets.map(function (b) {
      var files = items.filter(function (i) { return i.path.indexOf('03_리서치/' + b + '/') === 0; });
      return { name: b, files: files, count: files.length };
    });
    var notes = researchBuckets[0].files;
    var topics = notes.map(function (n) {
      var key = n.title.replace(/\s*(요약|정리|노트)\s*$/,'');
      function related(list) {
        return list.filter(function (f) {
          if (f.id === n.id) return false;
          return f.title.indexOf(key) >= 0 || key.indexOf(f.title.replace(/\.[^.]+$/, '')) >= 0;
        });
      }
      return {
        title: n.title, note: n,
        data: related(researchBuckets[1].files),
        sources: related(researchBuckets[2].files)
      };
    });

    // 습관
    var habitDoc = items.filter(function (i) { return /(^|\/)스킬\s*:/.test(i.title) && /습관/.test(i.title); })[0];
    var habitLines = habitDoc ? sectionLines(texts[habitDoc.id] || '', '지금 등록된 습관') : [];
    var habits = habitLines.filter(function (l) { return l.length > 1; }).map(function (l, i) {
      return { id: 'h' + (i + 1), name: l.replace(/^[-•·]\s*/, ''), note: '' };
    });

    // 미정 사항
    var pending = [];
    items.filter(function (i) { return i.kind === 'doc'; }).forEach(function (i) {
      var lines = sectionLines(texts[i.id] || '', '아직 정하지 않은 것');
      lines.slice(0, 4).forEach(function (l) {
        pending.push({ title: l.replace(/^[-•·]\s*/, ''), desc: i.path });
      });
    });

    // 최근 작업
    var timeline = items
      .filter(function (i) { return i.kind === 'doc' && i.updated; })
      .sort(function (a, b) { return a.updated < b.updated ? 1 : -1; })
      .slice(0, 6)
      .map(function (i) { return { date: i.updated, title: i.title, desc: i.path }; });

    var maxChars = 0;
    posts.forEach(function (p) { maxChars = Math.max(maxChars, p.chars || 0); });

    return {
      source: 'drive',
      sourceLabel: '드라이브 실시간',
      account: ctx.user.emailAddress || '',
      accountName: ctx.user.displayName || '',
      folderId: ctx.base.id,
      syncedAt: new Date().toISOString(),
      areas: areas,
      items: items,
      skills: skillModels,
      tasks: tasks,
      taskStats: taskStats,
      taskSource: taskSource,
      taskDoc: taskDoc ? {
        id: taskDoc.id,
        title: taskDoc.name,
        path: taskDoc.path,
        url: taskDoc.webViewLink || ('https://docs.google.com/document/d/' + taskDoc.id + '/edit')
      } : null,
      timeline: timeline,
      pending: pending,
      habits: habits,
      research: { buckets: researchBuckets, topics: topics },
      stats: {
        automation: taskStats.all,
        taskAll: taskStats.all,
        taskComplete: taskStats.complete,
        taskProgress: taskStats.progress,
        taskPending: taskStats.pending,
        skillsRun: skillModels.filter(function (s) { return s.status === 'complete'; }).length,
        skillsTotal: skillModels.length,
        posts: posts.length,
        published: published.length,
        drafts: posts.length - published.length,
        maxChars: maxChars,
        charLimit: 500,
        pending: pending.length
      },
      blog: { limit: 500 },
      problems: problems
    };
  }

  function firstLine(s) {
    var line = String(s || '').split('\n').filter(function (l) { return l.trim(); })[0] || '';
    return line.length > 140 ? line.slice(0, 140) + '…' : line;
  }

  function mimeLabel(m) {
    if (m === DOC) return 'Google 문서';
    if (m === FOLDER) return '폴더';
    if (m.indexOf('image/') === 0) return '이미지';
    if (m === 'application/pdf') return 'PDF';
    return '파일';
  }

  return {
    connect: connect,
    fetchModel: fetchModel,
    SCOPE: SCOPE
  };
})();
