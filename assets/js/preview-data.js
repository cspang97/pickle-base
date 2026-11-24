/* Pickle_Base 프리뷰 스냅샷
   2026-11-20 기준 실제 Pickle_Base(구글 드라이브) 구조·문서 메타데이터를 옮긴 오프라인 데이터입니다.
   민감한 개인 파일(backup/private.xlsx 등)은 담지 않았습니다. */
window.PB_PREVIEW = (function () {
  var DOC = 'https://docs.google.com/document/d/';
  var FILE = 'https://drive.google.com/file/d/';
  var RESEARCH_DOC_ID = '1A425WHWYkF6hy9xZn9sIe8qMLdmtYnsEDgp8lix9cns';
  /* 03_리서치/요약노트/4대 AI 신규 기능 리서치 — 2026-11-23 1회차 문서 본문 스냅샷.
     실제 드라이브 문서와 같은 text/plain 내보내기 형식이라 같은 파서(PBResearch)로 읽습니다. */
  var RESEARCH_TEXT = "기준 기간: 2026년 10~11월 · 공식 발표만 · 회차 누적 노트\n2026년 10~11월 공식 발표를 기준으로 Claude·ChatGPT·Gemini·Grok의 신규 기능과 방찬석 님 관점의 인사이트를 회차별로 쌓는 노트입니다.\n작성 규칙: 회차는 \"## N회차 · YYYY-MM-DD\", 묶음은 \"### 핵심 인사이트\"·\"### Claude\"·\"### ChatGPT\"·\"### Gemini\"·\"### Grok\"·\"### 출처\"로 적습니다. 항목은 \"- 날짜 · 이름 — 설명 | 원문 URL\" 형식이고, 발표되지 않은 내용은 적지 않습니다.\n\n\n\n\n## 1회차 · 2026-11-23\n\n\n\n\n### 핵심 인사이트\n\n\n\n\n- 에이전트의 결과물이 문서·시트·페이지로 — 네 곳 모두 대화창 밖 결과물(Claude Sheets·Data, ChatGPT Space, Grok Bot Pages, Gemini Notebook 사이트)을 에이전트가 직접 만들고 사람은 승인·수정만 하는 구조로 이동했습니다. Pickle_Base의 \"스킬 → 결과물 → 다음 할 일\" 구조와 같은 방향이라, 태스크 블록에 \"승인 수준\" 한 줄만 더하면 지금 체계로 받아들일 수 있습니다.\n- 지표는 '인증된 정의' 하나로 — Claude Data의 certified queries는 같은 지표를 서로 다른 쿼리로 계산해 대시보드가 어긋나는 문제를 막습니다. 안전·생산성 지표도 \"정의 1개 + 인증 표시\"로 관리하면 보고서마다 숫자가 달라지는 일을 줄일 수 있습니다.\n- 100만 토큰·플랫 가격이 실무선 — Gemini 4 Hydrogen은 100만 토큰 전 구간 단일 가격(입력 $1.50·출력 $7.50/백만), 출력도 최대 100만 토큰입니다. 매뉴얼·PDF·시트를 통째로 넣는 리서치가 현실적인 비용이 됐습니다.\n- 전화·결제 대행은 '한도 + 승인'이 기본값 — Gemini Tasks(한국 무료), ChatGPT Wallet, Grok Bot 모두 지출 한도·생체 승인·도구별 권한(Always allow/Auto-review/Needs approval/Blocked)을 붙였습니다. \"되돌리기 어려운 일은 승인\" 원칙과 같은 모델이니, 자동화마다 이 4단계를 적어 두는 편이 좋습니다.\n- 자동화 보고에 '못 한 일' 칸을 — GPT-6.2는 성능이 크게 올랐지만, 평가에서 누락 파일·검색 실패 같은 장애물을 보고하지 않는 경향이 확인됐습니다(OpenAI 자체 공개). 자동화 결과에는 \"무엇을 못 했는지\"를 남기는 필드가 필요합니다.\n- AI 흔적 표시가 규제로 — Grok API는 EU AI Act 대응으로 텍스트 워터마크를 도입했고, 각 사가 승인·출처·안전 정책을 제품 기본값으로 넣고 있습니다. 블로그·보고서에 AI 도움 여부를 밝히는 규칙을 스킬에 넣을 만합니다.\n\n\n\n\n### Claude\n\n\n\n\n- 2026-11-10 · Claude Data 정식 출시(Whiteboards·Sheets 베타 동시) — BigQuery·Redshift·ClickHouse 등 웨어하우스에 붙어 지표 질의·데이터 스토리·실시간 공유. 인증된 쿼리, 대시보드 캐싱·새로고침 주기, 변경 추적·버전 되돌리기, 디자인 시스템을 지원. Sheets는 탭·수식·서식·드롭다운까지 만들고 셀 단위 편집을 추적. | https://claude.com/resources/articles/sheets-whiteboards-data\n- 2026-11-09 · Claude Fable 5.2·Mythos 5.2 — 코딩·추론·비전 개선, 출력 30% 빠름. 가격 $8/$40(백만 토큰), fast 모드는 2.5배 속도에 $16/$80. 같은 모델을 안전장치로 나눠 Fable은 전체 공개, Mythos는 검증 프로그램 대상. | https://www.anthropic.com/claude-fable-and-mythos-5-2\n- 2026-11-12 · Claude Meetings 베타 — Google Meet에 참여자로 들어가 회의 중 문서·화이트보드 초안을 만들고, 회의록과 액션 아이템을 정리. Team·Enterprise 대상, 오디오는 저장하지 않고 전사·요약·화면 설명만 저장. | https://claude.com/resources/articles/claude-meetings\n- 2026-11-02 · 메시지 스레드(API 베타) — 긴 에이전트 세션에서 전체 대화를 매번 다시 보내지 않아 첫 응답 대기가 약 35% 줄어듦(50만~100만 토큰 요청 기준). 가격·한도는 그대로. | https://thenextweb.com/news/anthropic-message-threads-beta-claude-api-agents\n\n\n\n\n### ChatGPT\n\n\n\n\n- 2026-11-17 · GPT-6.2 Astra·Sol — Astra는 어려운 전문 작업용(슬라이드·스프레드시트·문서가 제공한 템플릿과 업계 관행을 더 따름), Sol은 일상·다단계 에이전트 작업용. ChatGPT Work·Codex에서 Plus·Pro·Enterprise·Edu 제공, API는 Astra $8/$40(캐시 $0.40), Sol $2/$10(백만 토큰). | https://openai.com/index/introducing-gpt-6-2-astra-sol/\n- 2026-11-20 · ChatGPT Space Plus 확대 — 페이지·슬라이드·파일을 모으는 작업 공간으로 Library를 대체. 연결된 앱(Gmail·Slack 등)에서 자동 갱신되는 페이지, 댓글로 협업. 공개 링크 없음, Free 계정은 공유 페이지 열람 불가. | https://help.openai.com/en/articles/20001549-getting-started-with-space-in-chatgpt\n- 2026-11-13 · ChatGPT Wallet — 에이전트가 실제 카드 정보 없이 결제. 구매마다 항목·금액·카드를 확인하고 Face ID·지문으로 승인하며, 결제망이 토큰을 발급. 미국 Pro·dots 한정으로 시작. | https://openai.com/index/introducing-chatgpt-wallet/\n- 2026-11-18 · Live Dictation — 말하는 즉시 텍스트로 받아쓰고, 10분 녹음 제한을 없앰. 전 플랜, 웹·데스크톱·iOS·Android. | https://www.theverge.com/ai-artificial-intelligence/1037634/openai-chatgpt-live-dictation\n- 2026-11-04 · Images 2.6 — 생성 50% 빨라지고 편집 간 일관성 개선, GIF 생성 추가. API는 Flare(저지연)·Sunburst(고품질) 두 모델. | https://openai.com/index/introducing-images-2-6/\n\n\n\n\n### Gemini\n\n\n\n\n- 2026-11-17 · Gemini Tasks 무료 확대(한국 포함) — 홈 화면 토글을 Chat에서 Task로 바꿔 전화 걸기(예: 정비 예약), 결제, 이메일 전달(gemini@google.com)로 일정 등록까지 맡김. AP2 결제·지출 한도, 반복 작업은 \"Always allow\", 격리 VM과 프롬프트 인젝션 필터 적용. | https://blog.google/innovation-and-ai/products/gemini-app/tasks-in-gemini-free-new-features/\n- 2026-11-12 · Gemini 4 Hydrogen — 에이전트 워크플로용 모델. 100만 토큰 전 구간 단일 가격 $1.50/$7.50, 출력 최대 100만 토큰, 사고 수준 low·medium·high·xhigh. PDF·시트·차트·영상을 묶어 인용 있는 보고서로 만드는 MKA 53.4%, Agents' Last Exam 71.6%. | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/\n- 2026-11-19 · Gemini computer use(Mac) — 격리된 백그라운드 창에서 앱과 웹을 조작해 반복 작업을 처리. 앱별 권한 선택, 라이브 프리뷰, 단계별 승인. 미국 영어·Apple Silicon·AI Plus/Pro/Ultra 한정. | https://blog.google/innovation-and-ai/products/gemini-app/computer-use-mac/\n- 2026-11-16 · Gemini Notebook 인터랙티브 사이트 — 노트의 소스를 \"make me a site\" 한마디로 인터랙티브 사이트·대시보드·프로젝트 트래커로 변환. 웹에서 전 세계 18세 이상, 모바일은 추후. | https://blog.google/innovation-and-ai/products/gemini-notebook/interactive-sites/\n\n\n\n\n### Grok\n\n\n\n\n- 2026-11-02 · Data Bot — 데이터팀이 직접 가르친 팀 봇. 웨어하우스 질의, 실험 설계·검정, 차트·대시보드, dbt 모델·파이프라인 알림 규칙을 '스킬'로 공유하고, 팀 채널에서 정기 보고까지 수행. 도입 후 데이터팀 업무 약 70시간/주를 대신 처리한 것으로 추정. 메모리 추가는 관리자 승인 후 공유. | https://x.ai/news/data-bot\n- 2026-11-11 · Grok Bot 1.0 — 팀 봇을 Slack·Microsoft Teams·화상회의로 공유, 먼저 할 일을 찾아 제안하는 프로액티브 동작, 브라우저·문서·프레젠테이션·인터랙티브 Pages 작성. 권한을 지키고 민감한 작업은 먼저 확인. Team·Enterprise. | https://x.ai/news/grok-bot-1-0\n- 2026-11-18 · Grok Bot 1.2.3 — 커넥터별 도구 권한을 Always allow·Auto-review·Needs approval·Blocked 4단계로 설정. 재연결이 필요하면 알림과 Slack·Teams DM으로도 알려 주고, 팀 관리자가 제공 도구를 제한할 수 있음. | https://x.ai/changelog/bot\n- 2026-11-07 · Grok API 텍스트 워터마크 — EU AI Act 대응으로 grok-4.7·4.6·4.5·4.3·4.20 계열 텍스트에 보이지 않는 워터마크를 기본 적용. 응답 헤더 x-watermark로 확인. 이후 문서는 팀 관리자가 모델별로 켜는 방식으로 정리되어 도입 전 콘솔 설정 확인 필요. | https://docs.x.ai/developers/advanced-api-usage/watermarking\n\n\n\n\n### 출처\n\n\n\n\n- 2026-11-10 · Anthropic — Claude Whiteboards, Claude Sheets, Claude Data | https://claude.com/resources/articles/sheets-whiteboards-data\n- 2026-11-09 · Anthropic — Claude Fable 5.2 and Claude Mythos 5.2 | https://www.anthropic.com/claude-fable-and-mythos-5-2\n- 2026-11-12 · Anthropic — Introducing Claude Meetings | https://claude.com/resources/articles/claude-meetings\n- 2026-11-02 · The Next Web — Anthropic message threads beta | https://thenextweb.com/news/anthropic-message-threads-beta-claude-api-agents\n- 2026-11-17 · OpenAI — Introducing GPT-6.2 Astra and Sol | https://openai.com/index/introducing-gpt-6-2-astra-sol/\n- 2026-11-20 · OpenAI Help Center — Getting started with Space in ChatGPT | https://help.openai.com/en/articles/20001549-getting-started-with-space-in-chatgpt\n- 2026-11-13 · OpenAI — Introducing ChatGPT Wallet | https://openai.com/index/introducing-chatgpt-wallet/\n- 2026-11-18 · The Verge — ChatGPT Live Dictation | https://www.theverge.com/ai-artificial-intelligence/1037634/openai-chatgpt-live-dictation\n- 2026-11-04 · OpenAI — Introducing Images 2.6 | https://openai.com/index/introducing-images-2-6/\n- 2026-11-17 · Google — Put Gemini to work for you (Tasks) | https://blog.google/innovation-and-ai/products/gemini-app/tasks-in-gemini-free-new-features/\n- 2026-11-12 · Google — Introducing Gemini 4 Hydrogen | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/\n- 2026-11-19 · Google — Automate Mac tasks with Gemini computer use | https://blog.google/innovation-and-ai/products/gemini-app/computer-use-mac/\n- 2026-11-16 · Google — Turn Gemini Notebook sources into interactive sites | https://blog.google/innovation-and-ai/products/gemini-notebook/interactive-sites/\n- 2026-11-02 · xAI — Giving every team a data scientist with Grok Bot | https://x.ai/news/data-bot\n- 2026-11-11 · xAI — Introducing Grok Bot 1.0 | https://x.ai/news/grok-bot-1-0\n- 2026-11-18 · xAI — Grok Bot changelog 1.2.3 | https://x.ai/changelog/bot\n- 2026-11-07 · xAI Docs — Output Watermarking (문서 2026-10-31 갱신) | https://docs.x.ai/developers/advanced-api-usage/watermarking\n\n## 2회차 · 2026-11-24\n\n### 핵심 인사이트\n\n- 승인은 '정책 파일'로, 먼저 관찰 모드로 — Claude Ship은 팀이 저장소에 쓴 승인 정책 파일(Claude Approvals)로 \"AI가 스스로 승인해도 되는 변경\"을 정의하고, 권장 절차가 observe-only(관찰) 모드 선행입니다. 자동 발주·조업 조건 변경처럼 권한을 넘기는 과제는 승인 규칙을 문서 한 장으로 고정하고, 처음 몇 주는 판정만 남기게 하면 됩니다.\n- 대용량 계측·도면은 '범위 지정'이 비용을 정한다 — Gemini API 파일 슬라이싱은 페이지·시트 셀 범위·영상 구간·레이어를 지정해 그 부분만 과금하고, Claude Ship은 Code Review·PR Steward에 지출 한도를 둡니다. 원단위·품질 분석은 시트 전체가 아니라 필요한 셀 범위만 넣는 방식이 기본값이 되어야 합니다.\n- 민감 데이터는 '보관 없이 탐지'가 성립 — Claude Enterprise Frontier Safeguards는 입력·출력을 고객 스토리지에만 두고 Anthropic·클라우드 사업자가 보관하지 않으며, 사람 검토 없이 자동 안전 모니터링이 Safety Case만 만듭니다. Gemini도 기록은 남기고 학습만 끄는 선택지를 줍니다. 사내 실적·규정 데이터를 넣기 전에 확인할 항목이 이 두 가지입니다.\n- 한국어·현장 접근성의 격차 — Gemini는 한국어 포함 66개 지역 음성을 넣었지만, ChatGPT 모바일 새 화면은 한국을 제외했고 Gemini 4 Neon은 Pro·Ultra부터입니다. 도입 전에 지역·요금제·언어를 먼저 확인해야 현장에 헛수고를 안 합니다.\n- 프런티어는 계획, 사내 모델은 실행 — 포스코홀딩스는 40억 파라미터 철강 특화 모델 페라와 프런티어 LLM을 역할로 나누고, 민감 데이터는 비식별화한 뒤 프런티어에는 계획만 맡기는 구조를 제시했습니다. 벤더 신기능은 이 구조에서 '계획·검토' 자리에 붙이고, 실행·판정은 사내 모델과 규칙에 남기는 편이 승인도 쉽습니다.\n- 성과 지표를 '업무시간'에서 '이익'으로 — 포스코는 AX를 업무시간 단축이 아니라 판단·의사결정 지원으로 규정했고, 현대제철은 AX 공모 198건 중 5건을 최우수로 뽑았습니다. 과제 평가표도 수율·원단위·정지시간·재작업률·피크요금처럼 손익에 붙는 지표로 잡아야 후보 선별이 흔들리지 않습니다.\n\n### Claude\n\n- 2026-11-23 · Claude Ship(베타) — PR을 리뷰(Code Review, 정식)하고 고치고(PR Steward) 승인까지(Claude Approvals) 하는 에이전트 묶음. 팀이 저장소에 쓴 승인 정책 파일로 상시 변경은 AI가 승인하고 예외만 사람이 보며, observe-only 모드 선행을 권장. Team·Enterprise·GitHub 대상, Code Review와 PR Steward에 지출 한도 설정, ZDR·HIPAA·CMEK 조직은 미제공. | https://claude.com/resources/articles/introducing-claude-ship\n- 2026-11-23 · Enterprise Frontier Safeguards(ZDR) 공개 베타 — 입력·출력을 고객의 S3·GCS에만 저장하고 Anthropic과 클라우드 사업자는 보관하지 않음. 운영자 사람 검토 없이 자동 안전 모니터링이 Safety Case만 생성(입출력 미포함), 모델·분류기 학습에 미사용. Claude Platform·AWS·Bedrock·Google Cloud에서 사용, Foundry는 예정. | https://claude.com/resources/articles/zero-data-retention-with-enterprise-frontier-safeguards\n- 2026-11-23 · Claude Code 2.1.331 — 실험 기능 Code Mode(Claude이 JavaScript 한 편으로 여러 도구를 병렬 호출)를 Amazon Bedrock·Google Cloud Agent Platform·Microsoft Foundry·Claude Platform on AWS의 터미널 세션으로 확장. | https://code.claude.com/docs/en/changelog\n- 2026-11-16 · Enterprise 통합 Claude 기본 켜짐 — 채팅과 Cowork가 한 대화로 합쳐진 경험이 기존 Enterprise 조직에서 이날부터 기본 활성화. 작업은 격리 VM에서 돌고 유휴 시 중지·디스크는 암호화 스냅샷(30일 만료). ZDR·HIPAA·CMEK 조직은 계속 기존 구성. | https://support.claude.com/en/articles/17444462-set-up-and-manage-the-new-unified-claude-experience-for-your-enterprise-organization\n\n### ChatGPT\n\n- 2026-11-16 · ChatGPT for Healthcare — 기존 의료 소프트웨어 화면을 읽고 클릭·입력하는 computer-use 에이전트, 인용을 붙이는 임상 검색 개선, 20개 이상 의료 플러그인. 앱별 접근 지정과 사람 검토 단계를 두고, HIPAA 워크플로는 BAA 대상 서비스와 보존 설정이 필요하며 데이터는 학습에 미사용. | https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/\n- 2026-11-18 · Accounting 플러그인 — 거래·입금 대사, 인보이스 분개 초안, 월말 보고서를 기존 서식과 기록으로 작성. 데스크톱 앱(macOS·Windows)과 computer use 설정이 필요하고, Business는 자유 설치·Enterprise는 관리자 승인. QuickBooks·Xero·NetSuite 등 파트너 플러그인 연동, 최종 승인은 사람. | https://help.openai.com/en/articles/20001709-using-chatgpt-for-accounting-work\n- 2026-11-19 · 모바일 새 경험 — 하단 탭바에 dot 탭과 Codex·Projects·Images 고정. Pro 18세 이상부터 시작하고 일부 Plus도 포함되나 EEA·영국·스위스·한국은 제외. | https://help.openai.com/en/articles/20001723-using-the-new-experience-in-the-chatgpt-mobile-app\n- 2026-11-23 · GPT-6.2(Chat 탭) — Sol 기반으로 일상 대화에 맞춘 버전. 이미지 이해 71.7%(GPT-6 47.4%), 어려운 지시 이행 78.1%(62.5%), BrowseComp 64.5%(54.4%)로 OpenAI 자체 측정. Plus·Pro·Business·Enterprise 대상, Free·Go는 미제공. | https://help.openai.com/en/articles/6825453-chatgpt-release-notes\n\n### Gemini\n\n- 2026-11-18 · Gemini 4 Neon — 100만 토큰 창, 입력 $3·출력 $15(캐시 입력 $0.15, 95% 할인). Artificial Analysis 지능지수 61(3위), Agent Arena 2위(1336), 밀집 차트 판독 Chartography 73.5%, Zapier AutomationBench 1위, Vending-Bench 2 $16,843. 작업당 비용은 Carbon 대비 32% 낮고, Hydrogen 서브에이전트를 지휘하는 오케스트레이터로도 쓰임. Pro·Ultra 구독자와 API·Antigravity에서 제공. | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/\n- 2026-11-23 · Gemini API 파일 슬라이싱 — 업로드한 PDF·Office·스프레드시트·오디오·영상에서 페이지 범위, 시트·셀 범위, 구간·프레임·레이어를 지정해 그 부분만 로드·과금. Office·OpenDocument 네이티브 업로드 추가, 한 번 올린 파일을 여러 턴에서 재사용. | https://blog.google/innovation-and-ai/technology/developers-tools/file-slicing-controls/\n- 2026-11-16 · 지역 음성 66종(한국어 포함) — 미국·영국·인도 영어, 힌디, 브라질 포르투갈어, 인도네시아어, 한국어 등 66개 지역 음성을 Android·iOS Gemini 앱에 추가. Live와 읽어 주기에서 같은 목소리가 유지됨. | https://blog.google/innovation-and-ai/products/gemini-app/regional-voices/\n- 2026-11-16 · 기록·학습 통제 변경 — 대화 기록은 남기면서 생성 AI 학습만 옵트아웃하는 설정을 추가. 기록을 끄면 앞으로의 대화는 약 2개월 보관되며 응답·피드백·보호 목적으로 쓰임. | https://blog.google/innovation-and-ai/products/gemini-app/updated-controls/\n- 2026-11-18 · Android Go(저메모리) 지원 — 메모리가 적은 보급형 Android 기기에서도 Gemini 앱 핵심 기능을 쓰도록 재설계. 45개 이상 언어로 Live 대화·카메라 번역·이미지 생성 지원. | https://blog.google/innovation-and-ai/products/gemini-app/gemini-lower-memory-devices/\n\n### Grok\n\n- 2026-11-15 · Grok Imagine 통합 — 이미지·영상 생성이 별도 화면에서 Grok 대화 안으로 들어옴. 최대 2K 이미지, 15초·720p 영상, 대화에서 이어서 수정·재생성. 생성물에는 grok 워터마크가 붙고 끄는 설정은 없음. | https://x.ai/grok\n- 2026-11-16 · Grok Bot 항공권·호텔 개편 — 항공편을 펼쳐 수하물·변경·환불 규칙을 보고 Book으로 진행, 호텔 사진 확대 보기와 지도·주소 복사. SSO 커넥터 연결, 팀 관리자의 프로액티브 메시지 차단, Google 전화 확인 카드 추가. | https://x.ai/changelog/bot\n- 2026-11-16 · Grok Bot 회계팀 사례 — SpaceXSI에서 봇 5개가 고객 계정 개설부터 청구·수금까지 업무를 통째로 맡고, 판단이 필요한 지점에서만 사람을 부름. 인력 증가 속도보다 많은 업무를 처리했다는 회사 설명. | https://x.ai/news/grok-bot-accounting\n- 2026-11-19 · grok-build-0.1 API 종료 — 코딩용 모델 grok-build-0.1이 11월 19일자로 수명을 다해 API에서 더 이상 제공되지 않음. | https://docs.x.ai/developers/release-notes\n\n### 제조 AX 사례\n\n- 2026-11-04 · 포스코홀딩스 'AI 기반 4대 혁신' 발표자료 — 레거시 설비 로보타이제이션, 개별 최적화에서 공정 관통·전사 가치 최적화로, 제강 원터치 자율조업, 철강 지식 에이전트와 What-if 시뮬레이터, 다중 목적 야드 자동 관제·스케줄링. 자체 SLM과 프런티어 LLM을 역할로 나누는 하이브리드 체계도 제시(발표자료상 자체 모델 65.2점·pass@5 75.0점, GPT-5.4 60.5·70.5점, 평가 데이터셋은 미공개). | https://www.polinews.co.kr/news/articleView.html?idxno=747700\n- 2026-11-20 · 포스코홀딩스 철강 특화 모델 '페라(Ferra)' — 오픈웨이트 기반 40억 파라미터, 사내 기술기준·교재·논문·특허로 추가 학습. 특허 검색 자연어 질의에서 프런티어 모델과 유사한 정확도, 응답 시간 최대 80% 단축·추론 비용 최대 86% 절감(회사 자체 분석). 복합 추론은 프런티어, 반복·전문 업무는 페라로 나누는 하이브리드 에이전트 계획. | https://www.newsis.com/view/NISX20261120_0003876502\n- 2026-11-11 · 현대제철 AX 성과공유회 — 8월부터 공모해 제조 58건·업무 140건 등 198건 접수, 48건 전시, 최우수 5건 선정. 제조 부문은 원료 물류 최적화 가이드와 스크랩 원료 배합 최적화 가이던스, 업무 부문은 판매전략 의사결정 지원·코일 이송 업무 에이전트·구매 적정가 AI. | https://www.fnnews.com/news/202611110920113076\n- 2026-11-11 · 포스코그룹 테크포럼·AX Awards — 포항 품질기술부문이 대상을 받음. 슬라브 품질을 물리 기반 분석과 AI로 평가해 정확도와 생산성을 높인 사례로, 현장 엔지니어가 쌓은 공정 데이터와 AI를 결합한 점이 평가받음. | https://biz.heraldcorp.com/article/10933055\n- 2026-11-03 · 현대제철 생성형 AI 플랫폼 'Steel-X' — Teams·업무시스템 문서를 AI용으로 자동 자산화해 통합 검색·문서 질의·요약 제공, 사내 구축형과 외부 AI를 고르는 멀티 AI 환경, 개발 지식 없이 업무용 챗봇·에이전트를 만드는 Playground, 업무시스템 데이터 연계. 규정·매뉴얼 검색, 기술 문서 요약, 설비 이력·운영 데이터 분석에 활용 예정. | https://www.hyundaimotorgroup.com/ko/news/hyundai-steel-steel-x-generative-ai-platform-launch\n\n### AX 과제 후보\n\n선정 기준(순서): ① 고수익 — 손익에 직접 붙는가(수율·원단위·처리량·정지·재작업·피크요금·납기) ② 고성과 — 성과지표를 크게 움직이는가 ③ 고난도 — 공정 지식·데이터·시스템 연계가 필요해 쉽게 흉내 낼 수 없는가 ④ 고실적 — 3개월 안에 측정 가능한 실적이 나오는가. 그다음이 데이터 확보 가능성, 승인·보안 부담, 재사용성(다른 공정·사업장 확산)입니다. 대상은 철강(고로·전로·연주·압연·열처리·유틸리티)을 우선하고 화학·소재·자동차부품 등 다른 제조 기업에 그대로 옮길 수 있는 과제를 함께 두었습니다. 단순 편의 개선(문서 요약 한 줄, 알림 자동화)은 후보에서 뺐습니다.\n\n#### 후보 풀\n\n##### 생산·공정 최적화\n\n- 고로·전로 실시간 최적 운전점 탐색 — 적용 기능: Gemini 4 Neon(100만 토큰·차트 판독)·Claude Code Code Mode | 송풍·노즐·출탕 조건 조합별 대안 운전점과 예상 결과 제시 | 이익 경로: 연료 원단위·출탕 온도 편차 감소 → 톤당 원가 절감 | 난이도(상)\n- 압연·조업 스케줄링 최적화 — 적용 기능: Gemini 4 Neon(오케스트레이터)·Claude Code Code Mode | 롤 교체·폭 전환 순서 대안과 셋업 로스 비교 | 이익 경로: 셋업 로스·롤 소모 감소, 처리량 상승 | 난이도(상)\n- 품질 수준·비용 적정점 최적화 — 적용 기능: Gemini 4 Neon(제약 조건 준수·스프레드시트 모델링) | 품질 수준(규격·수위)을 올리거나 내릴 때 줄어드는 클레임·불량과 늘어나는 검사·재작업·수율 손실을 함께 계산 | 이익 경로: (클레임·불량 비용 + 검사·재작업·수율 손실 비용)의 합 최소화 | 난이도(상)\n- 연주 속도·냉각 조건 최적화 — 적용 기능: Gemini 4 Neon·Claude Code Code Mode | 주조 속도·2차 냉각 대안과 브레이크아웃·결함 위험 비교 | 이익 경로: 결함·브레이크아웃 감소 → 수율 상승 | 난이도(상)\n- 생산계획 재최적화 시나리오 — 적용 기능: Gemini 4 Neon·Claude Code Code Mode | 설비 고장·수주 변경 때 대안 계획 3안과 납기·전환비 영향 | 이익 경로: 납기 준수율 상승·긴급 전환 비용 감소 | 난이도(상)\n- 코일·야드 이송·크레인 스케줄링 — 적용 기능: Grok Bot(SSO 커넥터·확인 카드)·ChatGPT computer-use 에이전트 | 레거시 야드 화면을 조회해 이송·크레인 순서 초안 작성 | 이익 경로: 이송 대기시간 감소 → 톤당 고정비·에너지 절감 | 난이도(상)\n- 조업 조건 What-if 시뮬레이션 — 적용 기능: Gemini 4 Neon·Claude Code Code Mode | 디지털 트윈·과거 실적에 조건 변경을 걸어 에너지·생산량·품질 영향 비교 | 이익 경로: 시행착오 조업 비용·품질 로스 감소 | 난이도(중)\n\n##### 품질\n\n- 슬라브·코일 품질 판정 보조 — 적용 기능: Gemini 4 Neon(밀집 차트 판독 73.5%)·Claude Code Code Mode | 물리 지표와 AI 판정을 함께 보여 주고 판정 근거를 인용 | 이익 경로: 오판정 감소 → 재검사·재작업·클레임 감소 | 난이도(상)\n- 품질 이상 원인 후보 랭킹 — 적용 기능: Gemini 4 Neon(스프레드시트 모델링) | 불량·재작업 패턴별 원인 후보와 확인 순서 제시 | 이익 경로: 수율 1%p 상승 → 톤당 원가 절감 | 난이도(중)\n- 고객 규격 대비 공정 조건 대조 — 적용 기능: Gemini 파일 슬라이싱(페이지·시트 범위)·Claude EFS | 규격 문서와 실공정 조건을 조항·셀 단위로 대조해 차이표 작성 | 이익 경로: 품질 클레임·반품 감소 | 난이도(중)\n- 재작업·재검사 로스 분석 — 적용 기능: Gemini 4 Neon(대용량 시트)·Grok Bot 커넥터(이력 조회) | 로스 발생 지점과 반복 원인을 대시보드 초안으로 정리 | 이익 경로: 재작업률·재검사비 감소 | 난이도(중)\n- 품질 지표 정의·인증 체계 — 적용 기능: Claude Data(인증된 쿼리)·Gemini 4 Neon | 수율·불량률·클레임률 정의를 한 벌로 고정하고 보고서마다 같은 수치 보장 | 이익 경로: 보고 불일치·재작업 커뮤니케이션 비용 감소 | 난이도(중)\n\n##### 설비\n\n- 설비 예지보전 지식 에이전트 — 적용 기능: Gemini 4 Neon(100만 토큰)·파일 슬라이싱(영상 구간·오디오) | 정비 이력·도면·매뉴얼·정비 영상을 함께 검색해 조치 후보 제시 | 이익 경로: 설비 정지시간·보전비 감소 | 난이도(중)\n- 고장 대응 런북·조업 가이드 — 적용 기능: Claude Code Code Mode(로그·스크립트 병렬)·Claude Ship 승인 정책 | 고장 로그를 분석해 조치 순서·롤백·대체 조업안 초안 작성 | 이익 경로: 평균 복구시간(MTTR) 단축 → 정지 손실 감소 | 난이도(중)\n- 예비품 재고·발주 적정화 — 적용 기능: ChatGPT Accounting 플러그인(대사)·Grok Bot 루틴 | 소모 이력과 재고를 대사해 발주 초안과 과부족 표시 | 이익 경로: 재고자산·긴급구매비 감소 | 난이도(중)\n- 설비 부하·효율 이상 조기 감지 — 적용 기능: Gemini 4 Neon(시계열·차트 판독) | 설비별 부하·효율 패턴 이상을 조기에 표시하고 점검 우선순위 제시 | 이익 경로: 효율 저하 조기 발견 → 에너지비·정지비 감소 | 난이도(중)\n- 정비 표준서·숙련 지식 형식화 — 적용 기능: Claude EFS(민감 데이터 보존)·Gemini 4 Neon | 과거 정비 사례·육성 기록을 표준서 개정안으로 정리 | 이익 경로: 숙련 의존도·재작업 감소 | 난이도(중)\n\n##### 에너지·유틸리티\n\n- 에너지 원단위 최소화 운전 가이드 — 적용 기능: Gemini 4 Neon(대용량 시트·차트 판독)·파일 슬라이싱(셀 범위) | 라인·제품·교대별 원단위 편차의 원인 후보와 개선 운전안 | 이익 경로: 원단위 1% 개선 → 에너지비 절감 | 난이도(상)\n- 피크 전력·수요 반응 스케줄링 — 적용 기능: Gemini 4 Neon·Claude Code Code Mode | 생산계획과 전력요금제를 함께 보고 피크 회피·부하 이동안 작성 | 이익 경로: 피크요금·기본요금 절감 | 난이도(상)\n- 유틸리티(스팀·산소·수소·질소) 수급 최적화 — 적용 기능: Gemini 4 Neon(시계열)·파일 슬라이싱 | 생산계획 대비 유틸리티 수급 균형과 방출·손실 지점 분석 | 이익 경로: 방출 손실·외부 구매량 감소 | 난이도(상)\n- 가열로·열처리 효율 진단 — 적용 기능: Gemini 4 Neon(차트 판독)·Claude Code Code Mode | 가열 패턴·공기비·노 내 온도 편차 대안과 연료 영향 비교 | 이익 경로: 연료 원단위·스케일 로스 감소 | 난이도(중)\n- 탄소·전력요금 연계 원가 최적화 — 적용 기능: Gemini 4 Neon·Claude Code Code Mode | 배출량·요금·원단위를 함께 놓고 조업·구매 조합 비교 | 이익 경로: 탄소비용·전력비 동시 절감 | 난이도(상)\n- 에너지 절감안 검토·승인 게이트 — 적용 기능: Claude Ship(승인 정책 파일·관찰 모드)·Claude EFS | 절감안 초안을 관찰 모드로 검증한 뒤 승인 규칙으로 실행 연결 | 이익 경로: 절감안 실행률 상승 → 절감액 실현 | 난이도(상)\n\n#### 추천 7건\n\n- 고로·전로 실시간 최적 운전점 탐색 — Gemini 4 Neon·Claude Code Code Mode | 대상 업무: 고로 송풍·노즐, 전로 출탕 조건의 대안 운전점 탐색과 근거 제시 | 기대 효과: 숙련자별 편차를 줄이고 원단위·출탕 온도 편차를 함께 낮춤 | 필요한 데이터·연결: 고로·전로 계측 태그(1분 이하), 조업 실적, 출탕 온도·성분, 설비 제약 | 승인·보안 조건: 제어 명령은 금지(가이드만), 사내 데이터 보존 정책(Claude EFS 또는 사내 구축) 확인 | 이익 경로: 연간 생산량 × 톤당 연료·원단위 절감액. 원단위 개선폭과 톤당 단가는 사내 수치로 대입 | 임팩트 추정: 원단위 0.5~1% 개선 가정, 실제 기준선은 최근 12개월 조업 실적으로 산정 필요 | 왜 지금: 100만 토큰 창과 셀 범위 과금, 병렬 스크립트 실행이 갖춰져 계측 원본과 조업 조건을 한 번에 놓고 대안을 반복 계산할 수 있게 됨 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), Claude Code Code Mode(2026-11-23), 포스코 제강 원터치·공정 관통 최적화(2026-11-04)\n- 압연·조업 스케줄링 최적화 — Gemini 4 Neon(오케스트레이터)·Claude Code Code Mode | 대상 업무: 열연·냉연 롤 교체와 폭·강종 전환 순서 | 기대 효과: 셋업 로스와 롤 소모를 줄이고 처리량을 올림 | 필요한 데이터·연결: 설비 능력·롤 이력·주문 폭·납기, 전환 제약 규칙, 실제 전환 실적 | 승인·보안 조건: 확정은 계획 담당자, AI는 대안·비교만 | 이익 경로: 처리량 증가분 × 톤당 마진 + 롤·에너지 셋업비 절감 | 임팩트 추정: 전환 1회당 셋업 로스와 연간 전환 횟수는 사내 확인 필요 | 왜 지금: Neon이 Hydrogen 서브에이전트를 지휘하고 Code Mode가 여러 계산을 병렬 실행해, 과거 야간 엑셀 반복으로 하던 시나리오 비교가 대화 한 번에 가능해짐 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), Claude Code 2.1.331(2026-11-23), 현대제철 원료 물류·코일 이송 최적화(2026-11-11)\n- 에너지 원단위 최소화 운전 가이드 — Gemini 4 Neon·파일 슬라이싱 | 대상 업무: 라인·제품·교대별 전력·스팀·가스 원단위 편차 분석과 개선 운전안 | 기대 효과: 편차 원인과 기여도를 자동 제시해 개선 우선순위를 정함 | 필요한 데이터·연결: 15분~1시간 계측 전력·스팀·가스, 생산량·제품·교대 코드, 설비 가동 이력 | 승인·보안 조건: 읽기 전용, 요금·계약 정보 비식별화, 데이터 보존 정책 확인 | 이익 경로: 연간 에너지비 × 원단위 개선률. 원단위 목표·단가만 넣으면 계산 | 임팩트 추정: 원단위 1%p 개선 × 연간 에너지비, 실제 원단위·단가는 확인 필요 | 왜 지금: 계측 원본을 통째로 넣지 않고 필요한 셀 범위만 과금해 분석할 수 있게 되어, 원단위 분석의 비용 장벽이 사라짐 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), 파일 슬라이싱(2026-11-23), 포스코 에너지 저감 지식 에이전트·What-if(2026-11-04)\n- 피크 전력·수요 반응 스케줄링 — Gemini 4 Neon·Claude Code Code Mode | 대상 업무: 생산계획과 전력요금제를 함께 고려한 피크 회피·부하 이동 | 기대 효과: 피크 시간대 부하를 옮겨 요금을 낮추고 계약전력을 조정 | 필요한 데이터·연결: 15분 전력 계측, 생산계획, 요금제·계약전력, 설비 기동 제약 | 승인·보안 조건: 계획 변경은 승인, 요금·계약 정보 비식별화, 실행 전 관찰 모드 | 이익 경로: 피크 감축 kW × 요금 단가 × 12개월 + 기본요금 조정분 | 임팩트 추정: 감축 가능 kW와 요금 단가는 확인 필요, 최대수요 이력으로 산정 | 왜 지금: 대용량 시계열과 요금 구조를 한 창에 넣고 시나리오를 병렬 계산할 수 있게 되어, 요금제 대응이 자동화 범위에 들어옴 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), Claude Code Code Mode(2026-11-23), 포스코 전사 가치 최적화(2026-11-04)\n- 품질 수준·비용 적정점 최적화 — Gemini 4 Neon(제약 조건 준수) | 대상 업무: 품질 수준(규격·수위)과 검사 강도 조합별 총비용 비교 | 기대 효과: 수위를 올릴 때 늘어나는 검사·재작업·수율 손실과 줄어드는 클레임·불량을 함께 놓고 적정점을 제시 | 필요한 데이터·연결: 규격·판정 기준, 코일별 공정 파라미터, 클레임·반품 이력, 검사·재작업·수율 손실 실적 | 승인·보안 조건: 규격·수위 변경은 품질 부서 승인, AI는 비교표만 | 이익 경로: (클레임·불량 비용 + 검사·재작업·수율 손실 비용)의 합 최소화 — 수위 조정 폭별 두 비용을 더해 최소점을 찾음 | 임팩트 추정: 수위 조정 폭별 비용 곡선은 과거 클레임·재작업 실적으로 추정, 실제 단가·수율은 확인 필요 | 왜 지금: Neon이 제약 조건 준수와 스프레드시트 모델링에서 상위 성적을 내 규격·공정·비용을 한 창에서 비교하고 최소 비용점을 반복 계산할 수 있게 됨 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), 포스코 슬라브 품질 AI(2026-11-11)\n- 연주 속도·냉각 조건 최적화 — Gemini 4 Neon·Claude Code Code Mode | 대상 업무: 연주 속도와 2차 냉각 조건 대안 탐색 | 기대 효과: 브레이크아웃·내부 결함을 줄이고 주조 속도를 안정화 | 필요한 데이터·연결: 연주 계측(속도·냉각수·온도), 결함·브레이크아웃 이력, 몰드·노즐 조건 | 승인·보안 조건: 실조업 적용은 승인·시험 조업 절차, AI는 후보·근거만 | 이익 경로: 결함률 감소 × 연간 생산량 × 톤당 마진 + 정지 손실 감소 | 임팩트 추정: 결함률·브레이크아웃 건수는 사내 확인 필요 | 왜 지금: 결함 이력·계측·영상까지 한 창에 넣고 조건별 대안을 반복 계산할 수 있게 되어, 과거 단일 변수 실험을 다변수 비교로 바꿀 수 있음 | 난이도: 상 | 근거: Gemini 4 Neon(2026-11-18), Claude Code Code Mode(2026-11-23), 포스코 자율 협조 최적화(2026-11-04)\n- 설비 예지보전 지식 에이전트 — Gemini 4 Neon·파일 슬라이싱(영상·오디오) | 대상 업무: 정비 이력·도면·매뉴얼·정비 영상 통합 검색과 조치 후보 | 기대 효과: 고장 대응 중 자료 탐색 시간을 줄이고 조치 누락을 방지 | 필요한 데이터·연결: CMMS 정비 이력, 설비 도면·매뉴얼 PDF, 진동·온도 태그, 정비 동영상 | 승인·보안 조건: 설비 제어 명령 금지, 조회·초안만, 도면 보안 등급 확인 | 이익 경로: 연간 정지시간 × 시간당 마진 + 보전비 절감 | 임팩트 추정: 정지시간·보전비 단가는 확인 필요, 과거 고장 로그로 기준선 산정 | 왜 지금: 영상 구간·오디오 클립까지 지정해 넣을 수 있게 되어 육성·영상 자료가 처음으로 검색 대상이 됨 | 난이도: 중 | 근거: Gemini 파일 슬라이싱(2026-11-23), 현대제철 Steel-X 설비 이력 분석(2026-11-03)\n\n### 출처\n\n- 2026-11-23 · Anthropic — Introducing Claude Ship | https://claude.com/resources/articles/introducing-claude-ship\n- 2026-11-23 · Anthropic — Zero data retention with Enterprise Frontier Safeguards | https://claude.com/resources/articles/zero-data-retention-with-enterprise-frontier-safeguards\n- 2026-11-23 · Anthropic — Claude Code changelog 2.1.331 | https://code.claude.com/docs/en/changelog\n- 2026-11-16 · Anthropic Help Center — Unified Claude for Enterprise | https://support.claude.com/en/articles/17444462-set-up-and-manage-the-new-unified-claude-experience-for-your-enterprise-organization\n- 2026-11-16 · OpenAI — More ways to move care forward with ChatGPT for Healthcare | https://openai.com/index/more-ways-to-move-care-forward-with-chatgpt-for-healthcare/\n- 2026-11-18 · OpenAI Help Center — Using ChatGPT for accounting work | https://help.openai.com/en/articles/20001709-using-chatgpt-for-accounting-work\n- 2026-11-19 · OpenAI Help Center — New experience in the ChatGPT mobile app | https://help.openai.com/en/articles/20001723-using-the-new-experience-in-the-chatgpt-mobile-app\n- 2026-11-23 · OpenAI Help Center — ChatGPT release notes (GPT-6.2 in the chat tab) | https://help.openai.com/en/articles/6825453-chatgpt-release-notes\n- 2026-11-18 · Google — Introducing Gemini 4 Neon | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/\n- 2026-11-23 · Google — File slicing controls in the Gemini API | https://blog.google/innovation-and-ai/technology/developers-tools/file-slicing-controls/\n- 2026-11-16 · Google — New regional voices in the Gemini app | https://blog.google/innovation-and-ai/products/gemini-app/regional-voices/\n- 2026-11-16 · Google — Updated controls in the Gemini app | https://blog.google/innovation-and-ai/products/gemini-app/updated-controls/\n- 2026-11-18 · Google — Gemini app on lower-memory Android devices | https://blog.google/innovation-and-ai/products/gemini-app/gemini-lower-memory-devices/\n- 2026-11-15 · xAI — Grok (이미지·영상 생성 통합) | https://x.ai/grok\n- 2026-11-16 · xAI — Grok Bot changelog (Flight redesign and hotel maps) | https://x.ai/changelog/bot\n- 2026-11-16 · xAI — Building an accounting team with Grok Bot | https://x.ai/news/grok-bot-accounting\n- 2026-11-19 · xAI Docs — Release notes (grok-build-0.1 end of life) | https://docs.x.ai/developers/release-notes\n- 2026-11-04 · 폴리뉴스 — 포스코홀딩스 'AI 기반 4대 혁신' | https://www.polinews.co.kr/news/articleView.html?idxno=747700\n- 2026-11-20 · 뉴시스 — 포스코홀딩스 철강 특화 AI '페라' | https://www.newsis.com/view/NISX20261120_0003876502\n- 2026-11-11 · 파이낸셜뉴스 — 현대제철 AX 성과공유회 198건 | https://www.fnnews.com/news/202611110920113076\n- 2026-11-11 · 헤럴드경제 — 포스코그룹 테크포럼·AX Awards | https://biz.heraldcorp.com/article/10933055\n- 2026-11-03 · 현대자동차그룹 뉴스룸 — 현대제철 Steel-X 가동 | https://www.hyundaimotorgroup.com/ko/news/hyundai-steel-steel-x-generative-ai-platform-launch\n";

  var areas = [
    { key: 'hub', no: '01', name: '업무자동화목록', role: '허브 · 목록/스킬/기획메모', count: '문서 8', hub: true },
    { key: 'blog', no: '02', name: '네이버블로그', role: '원고 · 이미지', count: '원고 1 · 이미지 1' },
    { key: 'research', no: '03', name: '리서치', role: '자료 · 요약노트 · 출처', count: '폴더 3 · 요약노트 1' },
    { key: 'app', no: '04', name: '애플리케이션', role: '코드 · 배포 · 최종산출물', count: '폴더 3' },
    { key: 'daily', no: '05', name: '일상생활', role: '습관 체크 · 일일 실적', count: '시트 1 · 기록 2일' },
    { key: 'personal', no: '06', name: '개인', role: '개인 작업 공간', count: '비어 있음' }
  ];

  var items = [
    {
      id: 'doc-list', area: 'hub', kind: 'doc', title: '업무자동화 목록', status: 'progress',
      path: '01_업무자동화목록/업무자동화 목록', updated: '2026-11-20',
      summary: '태스크 4건의 기준표. 분류·상태·연결 스킬·결과물 위치·다음 할 일을 담은 허브 문서.',
      excerpt: 'Pickle_Base의 태스크 기준표입니다. 이 문서의 태스크 블록 하나가 태스크 한 건입니다.\n\n태스크 1. 네이버 블로그 첫 글 《새로운 시작》 발행 — 완료\n태스크 2. Pickle_Base 워크스페이스 웹앱 v1 제작·배포 — 완료\n태스크 3. 일상·건강 습관 체크 자동화 — 진행중\n태스크 4. 4대 AI(Claude·ChatGPT·Gemini·Grok) 신규 기능·인사이트 리서치 — 진행중',
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
      id: RESEARCH_DOC_ID, area: 'research', kind: 'doc', title: '4대 AI 신규 기능 리서치', status: 'progress',
      path: '03_리서치/요약노트/4대 AI 신규 기능 리서치', updated: '2026-11-23',
      summary: '1회차 · 2026-11-23 · 4대 AI(Claude·ChatGPT·Gemini·Grok) 2026년 10~11월 신규 기능 17건, 핵심 인사이트 6건.',
      excerpt: '1회차 핵심 인사이트: 에이전트의 결과물이 문서·시트·페이지로, 지표는 인증된 정의 하나로, 100만 토큰·플랫 가격이 실무선.',
      tags: ['리서치', '요약노트', '4대 AI'],
      url: DOC + RESEARCH_DOC_ID + '/edit'
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
      id: 'daily-folder', area: 'daily', kind: 'folder', title: '05_일상생활', status: 'progress',
      path: '05_일상생활', updated: '2026-11-22',
      summary: '하위 1개 항목 · 건강습관 일일실적 시트',
      tags: ['일상', '폴더']
    },
    {
      id: 'habit-sheet', area: 'daily', kind: 'sheet', title: '건강습관 일일실적', status: 'complete', statusLabel: '기록 중',
      path: '05_일상생활/건강습관 일일실적', updated: '2026-11-22',
      summary: '2일 기록 · 항목 4개 (통곡물·채단탄·산책·당류)',
      tags: ['실적', '시트', '습관'],
      url: 'https://docs.google.com/spreadsheets/d/1M5PbVI6DDaBhl0vBoLhEpmTfQloOyS-nhBVxEg3KjhU/edit'
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
    },
    {
      no: 4, title: '4대 AI(Claude·ChatGPT·Gemini·Grok) 신규 기능·인사이트 리서치', category: '리서치',
      status: 'progress', statusText: '진행중', skill: '리서치 요약',
      output: '03_리서치/요약노트/4대 AI 신규 기능 리서치',
      note: '1회차 2026-11-23 · 10~11월 신규 기능 17건 · 인사이트 6건',
      next: '1회차 결과 확인 후 추가 요청 시 2회차 누적 리서치'
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

  /* 일상·습관 실적 — 실제 시트(05_일상생활/건강습관 일일실적)의 현재 내용과 같은 2일 기록.
     시트 CSV와 같은 형식이라 앱의 실시간 읽기와 같은 파서를 씁니다. */
  var habitCsv = [
    '날짜,요일,통곡물 선택,채단탄 순서,식후 산책,액상과당·단순당 멀리하기,달성 수,메모',
    '2026-11-21,토,X,X,O,O,2/4,빵 섭취로 통곡물·채단탄 미실천',
    '2026-11-22,일,X,O,O,O,3/4,햄버거 섭취로 통곡물 미실천'
  ].join('\n');
  var habitSheet = (function () {
    var base = {
      status: 'missing', name: '건강습관 일일실적', sheetId: '', url: '', path: '05_일상생활/건강습관 일일실적',
      category: null, items: [], message: '프리뷰에는 실적 시트 스냅샷이 없습니다.'
    };
    if (!window.PBHabit) return base;
    var cat = window.PBHabit.parseSheet(habitCsv, {
      id: 'health', name: '건강·식습관',
      sheetId: '1M5PbVI6DDaBhl0vBoLhEpmTfQloOyS-nhBVxEg3KjhU',
      url: 'https://docs.google.com/spreadsheets/d/1M5PbVI6DDaBhl0vBoLhEpmTfQloOyS-nhBVxEg3KjhU/edit',
      source: 'preview'
    });
    base.status = cat.records.length ? 'ok' : 'empty';
    base.category = cat;
    base.items = cat.items;
    base.sheetId = '1M5PbVI6DDaBhl0vBoLhEpmTfQloOyS-nhBVxEg3KjhU';
    base.url = 'https://docs.google.com/spreadsheets/d/1M5PbVI6DDaBhl0vBoLhEpmTfQloOyS-nhBVxEg3KjhU/edit';
    base.message = '';
    return base;
  })();

  var researchNote = items.filter(function (i) { return i.id === RESEARCH_DOC_ID; })[0];
  var researchReport = (function () {
    var base = {
      status: 'empty', name: '4대 AI 신규 기능 리서치', docId: RESEARCH_DOC_ID,
      url: DOC + RESEARCH_DOC_ID + '/edit', path: '03_리서치/요약노트/4대 AI 신규 기능 리서치',
      rounds: [], latest: null, count: 0, itemCount: 0, insightCount: 0, message: ''
    };
    if (!window.PBResearch) return base;
    var parsed = window.PBResearch.parseReport(RESEARCH_TEXT);
    base.rounds = parsed.rounds;
    base.latest = parsed.latest;
    base.count = parsed.count;
    base.itemCount = parsed.itemCount;
    base.insightCount = parsed.insightCount;
    base.status = parsed.count ? 'ok' : 'empty';
    if (!parsed.count) base.message = '문서는 있지만 아직 회차 내용이 없습니다.';
    return base;
  })();

  var research = {
    buckets: [
      { name: '요약노트', files: researchNote ? [researchNote] : [] },
      { name: '자료', files: [] },
      { name: '출처', files: [] }
    ],
    topics: researchNote ? [{ title: researchNote.title, note: researchNote, data: [], sources: [] }] : []
  };

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
    habitSheet: habitSheet,
    researchReport: researchReport,
    research: research,
    stats: { automation: 3, skillsRun: 1, skillsTotal: 4, posts: 1, published: 1, drafts: 0, maxChars: 320, charLimit: 500, researchRounds: researchReport.count, researchItems: researchReport.itemCount, pending: 5, taskAll: taskStats.all, taskComplete: taskStats.complete, taskProgress: taskStats.progress, taskPending: taskStats.pending },
    blog: { limit: 500 }
  };
})();
