/* 일상·습관 실적 해석 — Google Sheet(CSV)를 읽어 날짜별 기록·항목별 달성률·인사이트로 바꿉니다.
   브라우저(app.js·drive.js)와 테스트(node)에서 같은 함수를 씁니다. 의존성 없음. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PBHabit = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  /* 헤더 이름 → 역할. 시트에서 헤더 문구가 조금 달라도 받습니다. */
  var HEADER = {
    date: /^(날짜|일자|일시|date)$/i,
    weekday: /^(요일|day|weekday)$/i,
    done: /^(달성\s*수|달성수|달성|점수|done|score)$/i,
    memo: /^(메모|비고|사유|memo|note|remark)$/i
  };

  var CATEGORY = {
    id: 'health',
    name: '건강·식습관',
    sheetName: '건강습관 일일실적',
    folder: '05_일상생활'
  };

  /* ---------- CSV ---------- */
  /* 따옴표로 감싼 칸(쉼표·줄바꿈·"" 이스케이프)까지 안전하게 나눕니다. */
  function parseCsv(text) {
    var s = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (inQuotes) {
        if (c === '"') {
          if (s.charAt(i + 1) === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else {
          field += c;
        }
        continue;
      }
      if (c === '"') { inQuotes = true; continue; }
      if (c === ',') { row.push(field); field = ''; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
      if (c === '\r') {
        if (s.charAt(i + 1) !== '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        continue;
      }
      field += c;
    }
    row.push(field);
    rows.push(row);
    while (rows.length && isBlankRow(rows[rows.length - 1])) rows.pop();
    return rows;
  }

  function isBlankRow(row) {
    return (row || []).every(function (c) { return String(c == null ? '' : c).trim() === ''; });
  }

  /* ---------- 날짜·표시 ---------- */
  function normalizeDate(value) {
    var m = String(value == null ? '' : value).trim().match(/^(\d{4})[-./년\s]+(\d{1,2})[-./월\s]+(\d{1,2})/);
    if (!m) return '';
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var d = Number(m[3]);
    if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
    return y + '-' + pad(mo) + '-' + pad(d);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function weekdayOf(dateStr) {
    var m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    var d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    return WEEKDAYS[d.getUTCDay()];
  }
  function isWeekend(dateStr) {
    var w = weekdayOf(dateStr);
    return w === '토' || w === '일';
  }
  function shortDate(dateStr) {
    var m = String(dateStr || '').match(/^\d{4}-(\d{2})-(\d{2})$/);
    return m ? Number(m[1]) + '-' + m[2] : String(dateStr || '');
  }
  function daysBetween(a, b) {
    var A = parseUTC(a), B = parseUTC(b);
    if (A == null || B == null) return null;
    return Math.round((B - A) / 86400000);
  }
  function parseUTC(dateStr) {
    var m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  function minusDays(dateStr, n) {
    var t = parseUTC(dateStr);
    if (t == null) return '';
    var d = new Date(t - n * 86400000);
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }

  /* ---------- O/X ---------- */
  var ON = /^(o|O|○|◯|ㅇ|y|Y|yes|true|1|달성)$/;
  var OFF = /^(x|X|×|✕|N|n|no|false|0|미달성)$/;

  function readMark(value) {
    var t = String(value == null ? '' : value).trim();
    if (!t) return null;
    if (ON.test(t)) return true;
    if (OFF.test(t)) return false;
    return null;
  }

  /* ---------- 시트 → 카테고리 ---------- */
  /* 반환: { id, name, sheetId, url, source, items:[{key,name,index}], records:[...], skipped } */
  function parseSheet(csv, opts) {
    opts = opts || {};
    var cat = {
      id: opts.id || CATEGORY.id,
      name: opts.name || CATEGORY.name,
      sheetId: opts.sheetId || '',
      url: opts.url || '',
      source: opts.source || '',
      items: [],
      records: [],
      skipped: 0
    };
    var rows = parseCsv(csv);
    if (!rows.length) return cat;

    var headerRow = rows[0].map(function (h) { return String(h == null ? '' : h).replace(/^\uFEFF/, '').trim(); });
    /* 헤더 없이 날짜부터 시작하는 시트도 받습니다 — 첫 칸이 날짜이거나
       헤더로 보이는 이름이 둘 이상일 때만 헤더로 봅니다. */
    var headerHits = headerRow.filter(function (h) {
      return HEADER.date.test(h) || HEADER.weekday.test(h) || HEADER.done.test(h) || HEADER.memo.test(h);
    }).length;
    var hasHeader = HEADER.date.test(headerRow[0] || '') || headerHits >= 2;
    var start = 1;
    if (!hasHeader) {
      headerRow = ['날짜', '요일', '통곡물 선택', '채단탄 순서', '식후 산책', '액상과당·단순당 멀리하기', '달성 수', '메모'].slice(0, Math.max(headerRow.length, 1));
      start = 0;
    }

    var cols = { date: -1, weekday: -1, done: -1, memo: -1 };
    headerRow.forEach(function (h, i) {
      if (!h) return;
      if (HEADER.date.test(h)) { if (cols.date < 0) cols.date = i; return; }
      if (HEADER.weekday.test(h)) { if (cols.weekday < 0) cols.weekday = i; return; }
      if (HEADER.done.test(h)) { if (cols.done < 0) cols.done = i; return; }
      if (HEADER.memo.test(h)) { if (cols.memo < 0) cols.memo = i; return; }
      cat.items.push({ key: 'c' + i, name: h, index: i });
    });
    if (cols.date < 0) cols.date = 0;

    var seen = {};
    for (var r = start; r < rows.length; r++) {
      var row = rows[r] || [];
      var date = normalizeDate(row[cols.date]);
      if (!date) {
        if (!isBlankRow(row)) cat.skipped++;
        continue;
      }
      if (seen[date]) { cat.skipped++; continue; }
      seen[date] = true;
      var marks = cat.items.map(function (it) { return readMark(row[it.index]); });
      var done = 0;
      var counted = 0;
      marks.forEach(function (m) { if (m !== null) counted++; if (m === true) done++; });
      if (!cat.items.length) continue;
      if (!counted && !String(row[cols.memo] || '').trim()) { cat.skipped++; continue; }
      var total = cat.items.length;
      cat.records.push({
        date: date,
        weekday: String((cols.weekday >= 0 ? row[cols.weekday] : '') || '').trim() || weekdayOf(date),
        marks: marks,
        done: done,
        counted: counted,
        total: total,
        rate: total ? Math.round((done / total) * 100) : 0,
        sheetDone: cols.done >= 0 ? String(row[cols.done] || '').trim() : '',
        memo: cols.memo >= 0 ? String(row[cols.memo] || '').trim() : ''
      });
    }
    cat.records.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
    return cat;
  }

  /* ---------- 집계 ---------- */
  function itemStats(cat) {
    var recs = (cat && cat.records) || [];
    return ((cat && cat.items) || []).map(function (it, idx) {
      var hit = 0;
      var miss = 0;
      var blank = 0;
      recs.forEach(function (rec) {
        var m = rec.marks[idx];
        if (m === true) hit++;
        else if (m === false) miss++;
        else blank++;
      });
      var counted = hit + miss;
      return {
        key: it.key,
        name: it.name,
        index: idx,
        hit: hit,
        miss: miss,
        blank: blank,
        counted: counted,
        rate: counted ? Math.round((hit / counted) * 100) : 0
      };
    });
  }

  function summarize(cat) {
    var recs = (cat && cat.records) || [];
    var stats = itemStats(cat);
    var totalDone = 0;
    var totalCount = 0;
    recs.forEach(function (r) { totalDone += r.done; totalCount += r.total; });
    var sorted = stats.slice().sort(function (a, b) {
      if (b.rate !== a.rate) return b.rate - a.rate;
      return b.counted - a.counted;
    });
    var last = recs[0] || null;
    var avgRate = totalCount ? Math.round((totalDone / totalCount) * 100) : 0;
    var perfect = recs.filter(function (r) { return r.rate === 100; }).length;
    return {
      days: recs.length,
      items: stats.length,
      last: last,
      lastRate: last ? last.rate : 0,
      avgRate: avgRate,
      perfect: perfect,
      totalDone: totalDone,
      totalCount: totalCount,
      best: sorted.length ? sorted[0] : null,
      worst: sorted.length ? sorted[sorted.length - 1] : null,
      streak: recordStreak(recs)
    };
  }

  /* 최근 기록일부터 하루씩 거슬러 올라가며 빠짐없이 기록된 날 수 */
  function recordStreak(recs) {
    if (!recs || !recs.length) return 0;
    var byDate = {};
    recs.forEach(function (r) { byDate[r.date] = true; });
    var n = 0;
    var d = recs[0].date;
    while (byDate[d]) { n++; d = minusDays(d, 1); }
    return n;
  }

  /* ---------- 인사이트 ---------- */
  var MEMO_GROUPS = [
    { label: '밀가루·빵', josa: '이', re: /(빵|베이커리|토스트|샌드위치|햄버거|버거|라면|국수|면)/ },
    { label: '외식·배달', josa: '이', re: /(외식|회식|배달|식당|술자리|술)/ },
    { label: '단 음료·디저트', josa: '가', re: /(음료|콜라|사이다|주스|라떼|아메리카노|케이크|과자|디저트|아이스크림|초콜릿)/ }
  ];

  var TIPS = [
    { re: /(통곡물|잡곡|현미|귀리)/, text: '밥은 잡곡·현미로 미리 지어 두고, 빵은 통밀 100%로 바꾸면 같은 자리에서 바꿀 수 있습니다. 외식에서는 메뉴 이름에 ‘현미’·‘통밀’이 있는 것을 먼저 찾아보세요.' },
    { re: /(채소|채단탄|순서)/, text: '한 끼에 채소 한 접시를 먼저 놓고 단백질 → 탄수화물 순서로 먹습니다. 외식에서도 샐러드나 나물을 먼저 주문하면 순서가 지켜집니다.' },
    { re: /(산책|걷기|운동|15분)/, text: '식후 15분 타이머를 걸고 현관만 나갔다 오는 정도로 시작하세요. 비가 오는 날은 실내 5분 걷기로 대신합니다.' },
    { re: /(과당|단순당|당|음료|디저트)/, text: '공복에는 물·보리차를 먼저 마시고, 단 음료는 식후로 미룹니다. 눈에 보이는 곳에는 물을, 단 음료는 아래 칸에 두세요.' }
  ];

  function tipFor(name) {
    var n = String(name || '');
    for (var i = 0; i < TIPS.length; i++) if (TIPS[i].re.test(n)) return TIPS[i].text;
    return '가장 자주 빠지는 항목 하나만 골라, 그 항목의 최소 실행(예: 하루 한 끼만)을 정해 보세요.';
  }

  function memoReason(cat, item) {
    if (!item) return '';
    var recs = (cat && cat.records) || [];
    var misses = recs.filter(function (r) { return r.marks[item.index] === false; });
    if (!misses.length) return '';
    var memo = misses.filter(function (r) { return r.memo; });
    if (!memo.length) return '';
    var core = String(item.name).replace(/(선택|하기|하기\s*:|순서|섭취|멀리하기)/g, '').trim();
    var hit = memo.filter(function (r) {
      return (core && r.memo.indexOf(core) >= 0) || r.memo.length <= 30;
    })[0];
    return hit ? ' — 메모: ' + hit.memo : '';
  }

  function memoInsights(cat) {
    var recs = (cat && cat.records) || [];
    var items = (cat && cat.items) || [];
    var out = [];
    MEMO_GROUPS.forEach(function (g) {
      var days = recs.filter(function (r) { return r.memo && g.re.test(r.memo); });
      if (!days.length) return;
      var missed = items.filter(function (it, idx) {
        return days.every(function (r) { return r.marks[idx] === false; });
      }).map(function (it) { return it.name; });
      var text = '메모에 ‘' + g.label + '’' + g.josa + ' 나온 날 ' + days.length + '일(' +
        days.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (r) { return shortDate(r.date); }).join(', ') + ').';
      if (missed.length) text += ' 그 날 모두 X였던 항목: ' + missed.join(', ') + '.';
      else text += ' 그 날 빠진 항목은 따로 없었습니다.';
      out.push({ kind: 'memo', tone: missed.length ? 'warn' : 'good', group: g.label, days: days.length, title: '메모 패턴 · ' + g.label, text: text });
    });
    return out;
  }

  function weekendSplit(recs) {
    var weekend = { days: 0, done: 0, total: 0 };
    var weekday = { days: 0, done: 0, total: 0 };
    (recs || []).forEach(function (r) {
      var b = isWeekend(r.date) ? weekend : weekday;
      b.days++;
      b.done += r.done;
      b.total += r.total;
    });
    weekend.rate = weekend.total ? Math.round((weekend.done / weekend.total) * 100) : 0;
    weekday.rate = weekday.total ? Math.round((weekday.done / weekday.total) * 100) : 0;
    return { weekend: weekend, weekday: weekday };
  }

  function buildInsights(cat) {
    var recs = (cat && cat.records) || [];
    var stats = itemStats(cat);
    var out = [];
    if (!recs.length) {
      out.push({
        kind: 'empty', tone: 'info', title: '아직 쌓인 기록이 없습니다',
        text: '시트에 날짜별 O/X가 한 줄씩 쌓이면 가장 잘 지키는 항목, 자주 빠지는 항목, 메모 패턴을 여기에서 분석해 보여드립니다.'
      });
      return out;
    }
    var sum = summarize(cat);
    var best = sum.best;
    var worst = sum.worst;

    if (best) {
      out.push({
        kind: 'best', tone: 'good',
        title: '가장 잘 지키는 항목 · ' + best.name,
        text: best.hit + '/' + best.counted + '일 O (' + best.rate + '%)' +
          (best.rate === 100 && best.counted >= 2 ? ' — 아직 빠짐없이 지켰습니다. 이 항목은 그대로 두고 다른 항목에 힘을 쓰세요.' : '.')
      });
    }
    if (worst && worst.rate < 100) {
      out.push({
        kind: 'weak', tone: 'warn',
        title: '가장 자주 빠지는 항목 · ' + worst.name,
        text: worst.miss + '일 X (' + worst.rate + '%)' + memoReason(cat, worst)
      });
    }
    if (recs.length >= 2) {
      var cur = recs[0];
      var prev = recs[1];
      var diff = cur.done - prev.done;
      out.push({
        kind: 'trend', tone: diff > 0 ? 'good' : 'info',
        title: '최근 기록 ' + shortDate(cur.date) + ' (' + cur.weekday + ') · ' + cur.done + '/' + cur.total,
        text: diff > 0
          ? '직전 기록(' + shortDate(prev.date) + ', ' + prev.done + '/' + prev.total + ')보다 ' + diff + '개 늘었습니다.'
          : (diff === 0
            ? '직전 기록(' + shortDate(prev.date) + ')과 같은 달성 수입니다.'
            : '직전 기록(' + shortDate(prev.date) + ', ' + prev.done + '/' + prev.total + ')보다 ' + (-diff) + '개 줄었습니다.')
      });
    }
    var wp = weekendSplit(recs);
    if (wp.weekend.days && wp.weekday.days) {
      var gap = wp.weekday.rate - wp.weekend.rate;
      out.push({
        kind: 'weekend', tone: gap > 0 ? 'warn' : 'good',
        title: '주말 ' + wp.weekend.rate + '% · 평일 ' + wp.weekday.rate + '%',
        text: gap > 0
          ? '평일보다 주말 달성률이 ' + gap + '점 낮습니다. 주말 한 끼(예: 점심)는 평일과 같은 식사로 맞춰 보세요.'
          : (gap < 0
            ? '주말이 평일보다 ' + (-gap) + '점 높습니다. 주말에 잘 되는 방식을 평일 아침·점심에 옮겨 보세요.'
            : '주말과 평일 달성률이 같습니다.')
      });
    } else if (wp.weekend.days) {
      out.push({
        kind: 'weekend', tone: 'info',
        title: '아직 주말 기록만 ' + wp.weekend.days + '일',
        text: '평일 기록이 쌓이면 주말과 평일 달성률을 나란히 비교해 보여드립니다.'
      });
    } else if (wp.weekday.days) {
      out.push({
        kind: 'weekend', tone: 'info',
        title: '아직 평일 기록만 ' + wp.weekday.days + '일',
        text: '주말 기록이 쌓이면 평일과 주말 달성률을 나란히 비교해 보여드립니다.'
      });
    }

    var memos = memoInsights(cat);
    if (memos.length) out.push(memos[0]);

    if (worst) {
      out.push({
        kind: 'tip', tone: 'info',
        title: '다음 실천 팁 · ' + worst.name,
        text: tipFor(worst.name)
      });
    }
    if (recs.length < 3) {
      out.push({
        kind: 'note', tone: 'info',
        title: '기록 ' + recs.length + '일 — 경향으로만 봐 주세요',
        text: '3일 이상 쌓이면 항목별 흐름과 주말·평일 차이가 더 분명해집니다. 지금은 잘 지키는 항목과 빠지는 항목 한 가지씩만 기억해도 충분합니다.'
      });
    }
    return out;
  }

  /* 카드 한 줄 요약 */
  function cardSummary(cat) {
    var s = summarize(cat);
    var last = s.last;
    return {
      itemCount: s.items,
      days: s.days,
      avgRate: s.avgRate,
      lastRate: s.lastRate,
      lastDate: last ? last.date : '',
      lastWeekday: last ? last.weekday : '',
      lastDone: last ? last.done : 0,
      lastTotal: last ? last.total : 0,
      bestName: s.best ? s.best.name : '',
      worstName: s.worst ? s.worst.name : '',
      streak: s.streak,
      perfect: s.perfect
    };
  }

  return {
    CATEGORY: CATEGORY,
    WEEKDAYS: WEEKDAYS,
    parseCsv: parseCsv,
    parseSheet: parseSheet,
    readMark: readMark,
    normalizeDate: normalizeDate,
    weekdayOf: weekdayOf,
    shortDate: shortDate,
    isWeekend: isWeekend,
    itemStats: itemStats,
    summarize: summarize,
    buildInsights: buildInsights,
    cardSummary: cardSummary,
    tipFor: tipFor
  };
});
