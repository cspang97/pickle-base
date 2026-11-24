/* Pickle_Base 리서치 노트 해석
   드라이브의 Google 문서(text/plain 내보내기)를 회차 구조로 읽습니다.
   문서 규칙:
     ## N회차 · YYYY-MM-DD
     ### 핵심 인사이트 | ### Claude | ### ChatGPT | ### Gemini | ### Grok | ### 출처
     - 날짜 · 이름 — 설명 | 원문 URL
   구조가 조금 달라도(굵게 표시된 제목, 별표 목록) 읽히도록 느슨하게 맞춥니다. */
window.PBResearch = (function () {
  'use strict';

  var VENDORS = [
    { key: 'claude', name: 'Claude', test: /^(claude|클로드)\b/i },
    { key: 'chatgpt', name: 'ChatGPT', test: /^(chatgpt|chat\s?gpt|openai|오픈ai)\b/i },
    { key: 'gemini', name: 'Gemini', test: /^(gemini|제미나이)\b/i },
    { key: 'grok', name: 'Grok', test: /^(grok|그록)\b/i }
  ];
  var INSIGHT_LABEL = '핵심 인사이트';
  var SOURCE_LABEL = '출처';
  /* 벤더·인사이트·출처 외의 ### / #### / ##### 소제목(예: 제조 AX 사례, AX 과제 후보)은
     별도 절로 읽고, 한 단계 더 깊은 소제목은 그 절 안의 묶음으로 읽습니다. */

  function cleanLines(raw) {
    var text = String(raw == null ? '' : raw).replace(/^\uFEFF/, '');
    return text.split(/\r\n|\r|\n/).map(function (line) {
      var l = line.replace(/\u00a0/g, ' ').trim();
      var guard = 0;
      while (guard++ < 5) {
        if (l.indexOf('* ') === 0) { l = l.slice(2); continue; }
        if (l.indexOf('• ') === 0) { l = l.slice(2); continue; }
        break;
      }
      return l.trim() === '*' ? '' : l;
    });
  }

  function vendorOf(label) {
    for (var i = 0; i < VENDORS.length; i++) {
      if (VENDORS[i].test.test(label)) return VENDORS[i];
    }
    return null;
  }

  function splitLink(raw) {
    var body = String(raw || '').trim();
    var url = '';
    var idx = body.lastIndexOf(' | ');
    if (idx > 0) {
      var tail = body.slice(idx + 3).trim();
      if (/^https?:\/\//i.test(tail)) { url = tail; body = body.slice(0, idx).trim(); }
    }
    return { body: body, url: url };
  }

  function splitDash(body) {
    var idx = body.indexOf(' — ');
    if (idx < 0) return { name: body.trim(), desc: '' };
    return { name: body.slice(0, idx).trim(), desc: body.slice(idx + 3).trim() };
  }

  function parseItem(raw) {
    var link = splitLink(raw);
    var body = link.body.replace(/^[-•·]\s+/, '');
    var m = body.match(/^(\d{4}-\d{2}-\d{2})\s*[·.]\s*(.+)$/);
    var date = m ? m[1] : '';
    var rest = m ? m[2] : body;
    var parts = splitDash(rest);
    return { date: date, name: parts.name, desc: parts.desc, text: parts.desc || parts.name, url: link.url };
  }

  function splitFields(raw) {
    return String(raw || '').split(' | ').map(function (p) { return p.trim(); }).filter(function (p) { return p; });
  }

  function parseExtraItem(raw) {
    var link = splitLink(raw);
    var body = link.body.replace(/^[-•·]\s+/, '');
    var m = body.match(/^(\d{4}-\d{2}-\d{2})\s*[·.]\s*(.+)$/);
    var date = m ? m[1] : '';
    var rest = m ? m[2] : body;
    var parts = splitDash(rest);
    var fields = splitFields(parts.desc);
    return {
      date: date,
      name: parts.name,
      desc: fields[0] || '',
      fields: fields,
      url: link.url
    };
  }

  function parseReport(raw) {
    var lines = cleanLines(raw);
    var rounds = [];
    var cur = null;
    var section = null;

    function vendorSlot(key) {
      var hit = cur.vendors.filter(function (v) { return v.key === key; })[0];
      if (!hit) {
        hit = { key: key, name: vendorName(key), items: [] };
        cur.vendors.push(hit);
      }
      return hit;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (!line) continue;

      var round = line.match(/^#{1,4}\s*(\d+)\s*회차(?:\s*[·.\-:]?\s*(\d{4}-\d{2}-\d{2}))?/);
      if (round) {
        cur = {
          no: Number(round[1]) || rounds.length + 1,
          date: round[2] || '',
          insights: [], vendors: [], sources: [], extras: [], itemCount: 0
        };
        cur.label = cur.no + '회차' + (cur.date ? ' · ' + cur.date : '');
        rounds.push(cur);
        section = null;
        continue;
      }
      if (!cur) continue;

      /* 소제목: "### Claude", "**Claude**", "Claude" 처럼 표식이 달라도 받습니다.
         긴 문장이 우연히 벤더 이름으로 시작해도 제목으로 오인하지 않도록
         표식이 있거나 짧은 줄일 때만 제목으로 봅니다. */
      var hash = line.match(/^(#{1,6})\s*/);
      var level = hash ? hash[1].length : 0;
      var isMarked = /^#{1,6}\s/.test(line) || /^\*\*.+\*\*$/.test(line);
      var head = line.replace(/^#{1,6}\s*/, '').replace(/^\*\*(.+)\*\*$/, '$1').trim();
      var isShort = head.length <= 24;
      var v = (isMarked || isShort) ? vendorOf(head) : null;
      var isInsight = head === INSIGHT_LABEL || (isMarked && head.indexOf(INSIGHT_LABEL) === 0);
      var isSource = head === SOURCE_LABEL || (isMarked && head.indexOf(SOURCE_LABEL) === 0);
      if (isInsight) { section = { type: 'insight' }; continue; }
      if (isSource) { section = { type: 'sources' }; continue; }
      if (v) { section = { type: 'vendor', key: v.key }; continue; }

      if (head && (level >= 3 || /^\*\*.+\*\*$/.test(line))) {
        var last = cur.extras[cur.extras.length - 1];
        if (level >= 5 && last && level > last.level) {
          var group = { title: head, items: [] };
          last.groups.push(group);
          section = { type: 'extra', sec: last, group: group };
        } else {
          var extra = { title: head, level: level || 3, items: [], groups: [] };
          cur.extras.push(extra);
          section = { type: 'extra', sec: extra, group: null };
        }
        continue;
      }

      if (!section) continue;
      if (!/^[-•·]\s+/.test(line)) continue;   

      if (section.type === 'extra') {
        var ex = parseExtraItem(line);
        if (section.group) section.group.items.push(ex);
        else section.sec.items.push(ex);
        continue;
      }

      if (section.type === 'insight') {
        var ins = splitDash(line.replace(/^[-•·]\s+/, ''));
        cur.insights.push({ title: ins.name, text: ins.desc, tone: 'info' });
      } else if (section.type === 'sources') {
        var src = parseItem(line);
        src.publisher = src.name;
        src.title = src.desc;
        cur.sources.push(src);
      } else {
        var item = parseItem(line);
        vendorSlot(section.key).items.push(item);
        cur.itemCount++;
      }
    }

    rounds.sort(function (a, b) { return b.no - a.no; });
    var totalInsights = 0;
    var totalItems = 0;
    rounds.forEach(function (r) {
      totalInsights += r.insights.length;
      totalItems += r.itemCount;
      if (!r.extraCount) {
        r.extraCount = r.extras.reduce(function (n, e) {
          var own = e.items.length;
          return n + own + e.groups.reduce(function (m, g) { return m + g.items.length; }, 0);
        }, 0);
      }
    });
    return {
      rounds: rounds,
      latest: rounds[0] || null,
      count: rounds.length,
      insightCount: totalInsights,
      itemCount: totalItems
    };
  }

  function vendorName(key) {
    for (var i = 0; i < VENDORS.length; i++) if (VENDORS[i].key === key) return VENDORS[i].name;
    return key;
  }

  function hostOf(url) {
    var m = String(url || '').match(/^https?:\/\/([^/?#]+)/i);
    if (!m) return '';
    return m[1].replace(/^www\./, '');
  }

  return {
    parseReport: parseReport,
    vendorName: vendorName,
    vendorKeys: VENDORS.map(function (v) { return v.key; }),
    hostOf: hostOf,
    cleanLines: cleanLines
  };
})();
