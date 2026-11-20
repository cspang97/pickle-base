/* Pickle_Base 프리뷰 스냅샷
   2026-11-20 기준 실제 Pickle_Base(구글 드라이브) 구조·문서 메타데이터를 옮긴 오프라인 데이터입니다.
   민감한 개인 파일(backup/private.xlsx 등)은 담지 않았습니다. */
window.PB_PREVIEW = (function () {
  var DOC = 'https://docs.google.com/document/d/';
  var FILE = 'https://drive.google.com/file/d/';

  var areas = [
    { key: 'hub', no: '01', name: '업무자동화목록', role: '허브 · 목록/스킬/기획메모', count: '문서 8', hub: true },
    { key: 'blog', no: '02', name: '네이버블로그', role: '원고 · 이미지', count: '원고 1 · 이미지 1' },
    { key: 'research', no: '03', name: '리서치', role: '자료 · 요약노트 · 출처', count: '폴더 3 · 비어 있음' },
    { key: 'app', no: '04', name: '애플리케이션', role: '코드 · 배포 · 최종산출물', count: '폴더 3' },
    { key: 'daily', no: '05', name: '일상생활', role: '습관 체크 기록', count: '기록 없음' },
    { key: 'personal', no: '06', name: '개인', role: '개인 작업 공간', count: '비어 있음' }
  ];

  var items = [
    {
      id: 'doc-list', area: 'hub', kind: 'doc', title: '업무자동화 목록', status: 'progress',
      path: '01_업무자동화목록/업무자동화 목록', updated: '2026-11-20',
      summary: '태스크 3건의 기준표. 분류·상태·연결 스킬·결과물 위치·다음 할 일을 담은 허브 문서.',
      excerpt: 'Pickle_Base의 태스크 기준표입니다. 이 문서의 태스크 블록 하나가 태스크 한 건입니다.\n\n태스크 1. 네이버 블로그 첫 글 《새로운 시작》 발행 — 완료\n태스크 2. Pickle_Base 워크스페이스 웹앱 v1 제작·배포 — 완료\n태스크 3. 일상·건강 습관 체크 자동화 — 진행중',
      tags: ['허브', '색인', '자동화 목록'],
      url: DOC + '15LMQutQ9JL0XBFnhSQ81zM7bspdzvvtragD_tRbCc6U/edit'
    },
    {
      id: 'doc-map', area: 'hub', kind: 'doc', title: 'Pickle_Base 구조 지도', status: 'progress',
      path: 'Pickle_Base/구조 지도', updated: '2026-11-20',
      summary: '폴더 역할, 스킬 4종, 정해야 할 것, 다음 단계를 한 장으로 정리한 지도.',
      excerpt: '01_업무자동화목록: 허브. 자동화 항목 목록과 스킬 정의가 모입니다.\n02_네이버블로그: 블로그 결과물 (원고·이미지)\n03_리서치: 리서치 결과물 (자료·요약노트·출처)\n04_애플리케이션: 앱 결과물 (코드·배포·최종산출물)\n05_일상생활: 습관 체크 등 생활 기록\n06_개인: 개인 작업 공간\n\n원칙: 목록과 스킬은 01에, 결과물은 각 업무 폴더에.',
      tags: ['구조', '지도', '규칙'],
      url: DOC + '1RaD5cW3DFEE8NDTHQ_9_SdNcUgb28C4ZDYjnig5uUaA/edit'
    },
    {
      id: 'skill-blog', area: 'hub', kind: 'doc', title: '스킬: 네이버 블로그 글 발행', status: 'complete',
      path: '01_업무자동화목록/스킬/스킬: 네이버 블로그 글 발행', updated: '2026-11-20',
      summary: '500자 이내 원고 → 원고·이미지 저장 → 발행 승인 → 발행 후 URL·캡처 확인. 1회 실행 완료.',
      excerpt: '목적: 정해진 주제로 네이버 블로그 글을 써서 발행하고, 결과물을 02_네이버블로그에 남긴다.\n실행 조건: 주제를 주실 때 즉시 / 주제가 없으면 후보를 제안하고 고르신 뒤.\n절차: 주제 확정 → 500자 이내 원고 → 원고 저장 → 이미지 1~3개 → 이미지 선택 → 발행 → URL·캡처 확인.\n규칙: 500자 이내, 발행 전 제목·본문·이미지 순서 확인, 로그인 정보를 말로 받지 않음.\n실행 기록: 2026-11-19 《새로운 시작》 320자, 책상 이미지 본문 맨 위, 발행 완료.',
      tags: ['스킬', '블로그', '발행'],
      url: DOC + '1fplxKohBiAfvr-d9shbYNwB-CaiQPFccF0jCy65qkjU/edit'
    },
    {
      id: 'skill-research', area: 'hub', kind: 'doc', title: '스킬: 리서치 요약', status: 'pending',
      path: '01_업무자동화목록/스킬/스킬: 리서치 요약', updated: '2026-11-20',
      summary: '자료·출처·요약노트 3단 정리 절차만 정의됨. 실행 기록 없음, 주제 범위와 주기 미정.',
      excerpt: '목적: 궁금하거나 업무에 필요한 주제를 찾아보고 짧게 정리해 03_리서치에 남긴다.\n절차: 주제 확정·범위 축소 → 출처 수집(자료) → 출처 목록 정리(출처) → 요약노트(핵심 3~5줄 + 시사점) → 채팅 보고.\n규칙: 출처 없는 주장 금지, 숫자·날짜는 원문 기준, 확인 안 된 내용은 "확인 안 됨"으로 구분.\n아직 정하지 않은 것: 주제 범위, 주기.',
      tags: ['스킬', '리서치', '요약'],
      url: DOC + '193t8hA3MWqUq6J6mlUjuxjAZyUz_Pl_CyD2UGW9RILY/edit'
    },
    {
      id: 'skill-app', area: 'hub', kind: 'doc', title: '스킬: 애플리케이션 제작·배포', status: 'progress',
      path: '01_업무자동화목록/스킬/스킬: 애플리케이션 제작·배포', updated: '2026-11-20',
      summary: '기획 → 코드 → 배포 → 최종산출물 절차. 첫 실행으로 이 워크스페이스 v1을 배포.',
      excerpt: '목적: 필요한 웹앱·도구를 기획부터 배포까지 만들어 04_애플리케이션에 남긴다.\n절차: 기획(기획메모) 확인 → 코드 → 배포 준비물 → 최종산출물 → 접속 주소·사용법 보고.\n규칙: 기본은 비공개, 배포 시 비밀번호 보호, 확인 없이 공개 배포하지 않음, 비밀번호·키는 문서에 적지 않음.',
      tags: ['스킬', '앱', '배포'],
      url: DOC + '1Ef6lv4eEte0GNyz8p-orZ0LGuxB7AklL2FoMnBHDmpo/edit'
    },
    {
      id: 'skill-habit', area: 'hub', kind: 'doc', title: '스킬: 습관 체크', status: 'progress',
      path: '01_업무자동화목록/스킬/스킬: 습관 체크', updated: '2026-11-20',
      summary: '“습관 체크” 한마디에 등록된 8개 항목을 하나씩 확인하고 05_일상생활에 기록. 정기 확인 시각 미정.',
      excerpt: '목적: 정한 건강·식단 습관을 확인하고 지킨 것과 못 지킨 것을 기록한다.\n실행 조건: "습관 체크"라고 말할 때 — 등록된 항목을 하나씩 불러 오늘 어떻게 했는지 여쭙는다.\n규칙: 한 번에 한 항목만, 잔소리하지 않음, 못 지킨 날은 이유만 한 줄, 항목을 임의로 바꾸지 않음.\n지금 등록된 습관 8개 · 아직 정하지 않은 것: 정기 확인 시각, 기록 형식.',
      tags: ['스킬', '습관', '건강'],
      url: DOC + '1Hl5Q8OgS0Lo2l9L9f8jDq26NHbBedc5gQOVg3P05eks/edit'
    },
    {
      id: 'memo-sns', area: 'hub', kind: 'doc', title: 'SNS 유니버스 구상', status: 'pending',
      path: '01_업무자동화목록/기획메모/SNS 유니버스 구상', updated: '2026-11-19',
      summary: '네이버·인스타·유튜브·X를 잇는 SNS 유니버스 설계 구상. 설계는 아직 시작 전.',
      excerpt: 'SNS 유니버스 구상 — 여러 SNS를 하나의 흐름으로 묶는 설계 메모. 자동화 범위(X 읽기 전용, 노션·깃허브 연동, 브라우저로 초안 작성) 정리 단계.',
      tags: ['기획', 'SNS', '구상'],
      url: DOC + '1oOP1Qxf7ojKTtW-jJkZihHjVgz2ZrdxOcCsMPY7vtkI/edit'
    },
    {
      id: 'memo-webapp', area: 'hub', kind: 'doc', title: '웹앱 구상', status: 'progress',
      path: '01_업무자동화목록/기획메모/웹앱 구상', updated: '2026-11-20',
      summary: 'Pickle_Base 대시보드 웹앱 기획 — GitHub Pages, 구글 OAuth 실시간 읽기, 첫 버전은 정적 대시보드.',
      excerpt: '만들고 싶은 것: Pickle_Base 안의 자료를 한눈에 보는 대시보드, 웹앱을 직접 만들어 퍼블리시.\n정한 것: 배포는 GitHub Pages. 실시간 접근은 구글 OAuth. 첫 버전은 드라이브 목록을 미리 뽑아 넣은 정적 대시보드.\n추가 결정: 퍼블릭 운영 안 함, 비밀번호(접근 보호) 적용.',
      tags: ['기획', '웹앱', '대시보드'],
      url: DOC + '1_9sibMNO_ngodabuw8UMToA6iFkuk_5MzLL903t0I0Y/edit'
    },

    {
      id: 'post-1', area: 'blog', kind: 'doc', title: '새로운 시작', status: 'complete', statusLabel: '발행',
      path: '02_네이버블로그/원고/새로운 시작', updated: '2026-11-19',
      chars: 320, limit: 500,
      summary: 'AX를 내 삶에 적용하는 두 목표(작업의 혁신·일상의 혁신)를 밝힌 첫 글. 320자.',
      excerpt: 'AX(AI Transformation)를 내 삶에 직접 적용해 보려 합니다. 목표는 두 가지입니다.\n\n첫째, 작업의 혁신. 핵심은 \'본질탐구\'와 \'적자생존(기록하고 정리하는 힘)\'입니다.\n\n둘째, 일상의 혁신. 거창한 계획보다 가벼운 마음으로 하나씩 도전하고 실천하는 게 중요하다고 생각합니다.',
      body: 'AX(AI Transformation)를 내 삶에 직접 적용해 보려 합니다. 목표는 두 가지입니다.\n\n첫째, 작업의 혁신.\n핵심은 \'본질탐구\'와 \'적자생존(기록하고 정리하는 힘)\'입니다. 무엇이 진짜 중요한지 파고들고, 그 과정을 기록으로 남기는 일을 어떻게 자동화하고 지능화할 수 있을지 실험해 보려 합니다.\n\n둘째, 일상의 혁신.\n거창한 계획보다 가벼운 마음으로 하나씩 도전하고 실천하는 게 중요하다고 생각합니다. 작은 시도들을 일상 속 프로젝트로 가볍게 굴려 보려 합니다.\n\n이곳에는 그 시행착오와 배움을 짧고 담백하게 남겨 보겠습니다. 오늘이 그 새로운 시작입니다.',
      tags: ['원고', '발행', 'AX'],
      url: DOC + '1bdgCxzMUUsYqz60m78xrrRehzsd1U31sn05G48KYCbw/edit',
      publishedUrl: 'https://blog.naver.com/cspang97/224483535431',
      category: '일상의 프로젝트화'
    },
    {
      id: 'img-1', area: 'blog', kind: 'image', title: 'blog_img_1_desk.png', status: 'complete', statusLabel: '사용 중',
      path: '02_네이버블로그/이미지/blog_img_1_desk.png', updated: '2026-11-19',
      summary: '첫 글 대표 이미지(책상). 본문 맨 위에 들어감. 1.9MB.',
      tags: ['이미지', '대표'],
      url: FILE + '1cxpqmbXphBN8j37UIv-VIsfpijj1kMS1/view'
    },

    {
      id: 'rs-data', area: 'research', kind: 'folder', title: '자료', status: 'pending',
      path: '03_리서치/자료', updated: '2026-11-19',
      summary: '리서치 원자료(문서·PDF·캡처). 첫 주제를 정하면 여기부터 쌓입니다.',
      tags: ['자료', '폴더']
    },
    {
      id: 'rs-sum', area: 'research', kind: 'folder', title: '요약노트', status: 'pending',
      path: '03_리서치/요약노트', updated: '2026-11-19',
      summary: '주제별 핵심 3~5줄과 시사점을 적는 곳. 주제 하나 = 노트 하나.',
      tags: ['요약노트', '폴더']
    },
    {
      id: 'rs-src', area: 'research', kind: 'folder', title: '출처', status: 'pending',
      path: '03_리서치/출처', updated: '2026-11-19',
      summary: '링크·발행일·발행처 목록. 출처 없는 주장은 쓰지 않는 규칙의 근거.',
      tags: ['출처', '폴더']
    },

    {
      id: 'app-code', area: 'app', kind: 'folder', title: '코드', status: 'progress',
      path: '04_애플리케이션/코드', updated: '2026-11-20',
      summary: '앱 소스 보관 위치. v1 소스는 GitHub 저장소(cspang97/pickle-base)에 있습니다.',
      tags: ['코드', '폴더']
    },
    {
      id: 'app-deploy', area: 'app', kind: 'folder', title: '배포', status: 'progress',
      path: '04_애플리케이션/배포', updated: '2026-11-20',
      summary: '배포 설정·링크. v1은 GitHub Pages(main 루트)로 배포.',
      tags: ['배포', '폴더']
    },
    {
      id: 'app-final', area: 'app', kind: 'folder', title: '최종산출물', status: 'pending',
      path: '04_애플리케이션/최종산출물', updated: '2026-11-19',
      summary: '완성본과 스크린샷을 모으는 곳. v1 화면 캡처를 여기에 둘 수 있습니다.',
      tags: ['산출물', '폴더']
    },
    {
      id: 'app-v1', area: 'app', kind: 'app', title: 'Pickle_Base 워크스페이스 v1', status: 'complete', statusLabel: '배포',
      path: '04_애플리케이션/배포/pickle-base', updated: '2026-11-20',
      summary: '허브 대시보드·영역별 탭·통합 검색·Google Drive 읽기 연동을 담은 첫 웹앱.',
      tags: ['앱', '배포', 'GitHub Pages'],
      url: 'https://cspang97.github.io/pickle-base/'
    },

    {
      id: 'daily-log', area: 'daily', kind: 'folder', title: '습관 체크 기록', status: 'pending',
      path: '05_일상생활', updated: '2026-11-20',
      summary: '날짜별 한 줄 기록을 남기는 곳. 아직 기록이 없습니다.',
      tags: ['습관', '기록', '폴더']
    },
    {
      id: 'personal', area: 'personal', kind: 'folder', title: '06_개인', status: 'pending',
      path: '06_개인', updated: '2026-11-19',
      summary: '개인 작업 공간. 비어 있습니다.',
      tags: ['개인', '폴더']
    }
  ];

  var skills = [
    {
      no: 1, name: '네이버 블로그 글 발행', status: 'complete', statusText: '1회 발행',
      trigger: '주제를 주실 때 즉시', output: '02_네이버블로그/원고 · 이미지',
      lastRun: '2026-11-19 《새로운 시작》 320자 발행',
      next: '발행 주기와 주제 범위 정하기'
    },
    {
      no: 2, name: '리서치 요약', status: 'pending', statusText: '설계만 · 실행 0회',
      trigger: '주제를 주실 때 (주기 미정)', output: '03_리서치/요약노트 · 자료 · 출처',
      lastRun: '아직 없음',
      next: '첫 주제를 정해 요약노트 1건 만들기'
    },
    {
      no: 3, name: '애플리케이션 제작·배포', status: 'progress', statusText: '정의 완료 · 첫 실행',
      trigger: '만들 것을 정해 주실 때', output: '04_애플리케이션/코드 · 배포 · 최종산출물',
      lastRun: '2026-11-20 Pickle_Base 워크스페이스 v1 배포',
      next: 'v1 검증 후 다음 버전 범위 정하기'
    },
    {
      no: 4, name: '습관 체크', status: 'progress', statusText: '정의 완료 · 시각 미정',
      trigger: '“습관 체크”라고 말할 때', output: '05_일상생활 (날짜별 기록)',
      lastRun: '수동 트리거만 · 정기 확인 시각 미정',
      next: '퇴근 후 확인 시각 정하기'
    }
  ];

  /* 태스크 기준표 — 실제 '업무자동화 목록' 문서의 태스크 블록과 같은 내용.
     상단 전체·완료·진행중·미정 집계는 이 목록만 셉니다(폴더·파일 제외). */
  var tasks = [
    {
      no: 1, title: '네이버 블로그 첫 글 《새로운 시작》 발행', category: '네이버블로그',
      status: 'complete', statusText: '완료', skill: '네이버 블로그 글 발행',
      output: '02_네이버블로그/원고/새로운 시작',
      note: '2026-11-19 발행 · 320자 · 전체공개 · https://blog.naver.com/cspang97/224483535431',
      next: '발행 주기와 주제 범위 정하기'
    },
    {
      no: 2, title: 'Pickle_Base 워크스페이스 웹앱 v1 제작·배포', category: '애플리케이션',
      status: 'complete', statusText: '완료', skill: '애플리케이션 제작·배포',
      output: 'https://cspang97.github.io/pickle-base/ (코드 04_애플리케이션/코드 · 저장소 github.com/cspang97/pickle-base)',
      note: '2026-11-20 GitHub Pages 배포 · 드라이브 읽기 전용 연동 · 전체·완료·진행중·미정 집계를 이 문서의 태스크 기준으로 개편',
      next: 'v1 사용 점검 후 다음 버전 범위 정하기'
    },
    {
      no: 3, title: '일상·건강 습관 체크 자동화', category: '일상생활',
      status: 'progress', statusText: '진행중', skill: '습관 체크',
      output: '05_일상생활 (날짜별 기록)',
      note: '건강·식단 습관 8건을 구글 할 일 체크리스트로 운영 중',
      next: '정기 확인 시각과 기록 형식 정하기'
    }
  ];

  var taskStats = { all: tasks.length, complete: 0, progress: 0, pending: 0, categories: [] };
  var categoryMap = {};
  tasks.forEach(function (t) {
    taskStats[t.status]++;
    var name = t.category || '미분류';
    if (!categoryMap[name]) {
      categoryMap[name] = { name: name, all: 0, complete: 0, progress: 0, pending: 0 };
      taskStats.categories.push(categoryMap[name]);
    }
    categoryMap[name].all++;
    categoryMap[name][t.status]++;
  });

  var timeline = [
    { date: '2026-11-20', title: 'Pickle_Base 워크스페이스 v1 배포', desc: '허브 대시보드·영역 탭·통합 검색·드라이브 읽기 연동을 GitHub Pages에 올림.' },
    { date: '2026-11-20', title: '폴더 구조 재정렬 — 허브를 01로', desc: '01_업무자동화목록을 맨 위로, 스킬 4종 문서와 구조 지도·목록 문서 번호 정리.' },
    { date: '2026-11-19', title: '블로그 첫 글 《새로운 시작》 발행', desc: '320자, 카테고리 ‘일상의 프로젝트화’, 전체공개.' },
    { date: '2026-11-19', title: 'Pickle_Base 베이스캠프 구축', desc: '폴더 01~06 구성, 자동화 목록·스킬 정의, 건강 습관 8개 할 일 등록.' }
  ];

  var pending = [
    { title: '블로그 발행 주기', desc: '02_네이버블로그 · 주제 범위와 함께 정하기' },
    { title: '리서치 주제 범위·주기', desc: '03_리서치 · 매일/주 1회, 업무/관심사 범위' },
    { title: '자동화 실행 시각·알림 방식', desc: '01_업무자동화목록 · 습관 체크 정기 확인 시각 포함' },
    { title: '습관 기록 형식', desc: '05_일상생활 · 문서로 남길지 다른 형식일지' },
    { title: '웹앱 접근 보호 방식', desc: '04_애플리케이션 · PIN 잠금 유지 여부, 자료 공개 범위' }
  ];

  var habits = [
    { id: 'h1', name: '트리거 루틴 설정하기', note: '식사 전 신호 만들기' },
    { id: 'h2', name: '액상과당 및 단순당 멀리하기', note: '음료·간식 선택' },
    { id: 'h3', name: '정제 곡물 대신 통곡물 선택하기', note: '밥·빵 고르기' },
    { id: 'h4', name: '채소-단백질-탄수화물 순서로 식사하기', note: '식사 순서' },
    { id: 'h5', name: '[건강] 공복 상태에서 액상과당 및 단순당 금지', note: '공복 혈당 관리' },
    { id: 'h6', name: '최소 유효 분량(MVP) 정의 및 실행하기', note: '작게라도 실행' },
    { id: 'h7', name: '최소화 법칙(5분 룰)으로 시작하기', note: '시작 장벽 낮추기' },
    { id: 'h8', name: '식후 15~30분 가벼운 산책하기', note: '식후 혈당' }
  ];

  return {
    source: 'preview',
    sourceLabel: '프리뷰 데이터',
    snapshotAt: '2026-11-20',
    folderId: '1fpIsxCJsvKAyassJ8ABZcRXBht9tuxxx',
    areas: areas,
    items: items,
    skills: skills,
    tasks: tasks,
    taskStats: taskStats,
    taskSource: 'doc',
    taskDoc: {
      id: '15LMQutQ9JL0XBFnhSQ81zM7bspdzvvtragD_tRbCc6U',
      title: '업무자동화 목록',
      path: '01_업무자동화목록/업무자동화 목록',
      url: DOC + '15LMQutQ9JL0XBFnhSQ81zM7bspdzvvtragD_tRbCc6U/edit'
    },
    timeline: timeline,
    pending: pending,
    habits: habits,
    stats: { automation: 3, skillsRun: 1, skillsTotal: 4, posts: 1, published: 1, drafts: 0, maxChars: 320, charLimit: 500, pending: 5, taskAll: taskStats.all, taskComplete: taskStats.complete, taskProgress: taskStats.progress, taskPending: taskStats.pending },
    blog: { limit: 500 }
  };
})();
