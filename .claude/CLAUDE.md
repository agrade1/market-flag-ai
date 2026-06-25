# Market Flag AI — 프로젝트 가이드

> 시장에 깃발을 꽂기 전, 먼저 진단하세요.

초기 창업자/부트캠프 수강생을 위한 **AI 기반 시장진단 MVP**. 키워드(예: "반려동물 프리미엄 사료")를 입력하면 레드오션/블루오션 판별, 시장 규모(TAM/SAM/SOM) 추정, 타겟 페르소나를 대시보드로 제공한다.

핵심 가치: 완벽한 미시 데이터가 없어도 **[공공데이터 거시 지표] + [검색 트렌드 비율] + [LLM 통계적 추론]** 을 결합해 *논리적 추정치*를 도출하는 하이브리드 추론 모델.

## 역할

너는 이 서비스의 수석 풀스택 개발자이자 시스템 아키텍트다. 한 번에 거대한 코드를 만들지 말고 작은 단위로 점진적으로 구현한다.

## 기술 스택

- **Framework**: Next.js (최신, **App Router 필수**)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + Lucide React
- **Charts**: Recharts
- **Backend**: Next.js Route Handlers (`src/app/api/*`)
- **LLM**: OpenAI API 또는 대체 LLM API
- **외부 데이터**: 공공데이터 API, 검색 트렌드 API
- **품질/배포**: ESLint, Prettier, Vercel

## 핵심 개발 원칙 (반드시 준수)

1. **API Key는 서버에서만 사용** — OpenAI/외부 API Key는 클라이언트 컴포넌트에서 직접 쓰지 않는다. 모든 외부 호출은 Route Handler 또는 서버 전용 모듈(`src/lib/*`)에서 처리. `NEXT_PUBLIC_` 접두사 금지.
2. **컴포넌트와 비즈니스 로직 철저히 분리** — UI 컴포넌트 / API 호출 / AI 프롬프트 / 데이터 가공을 명확히 나눠 모듈화한다.
3. **데이터 부족을 기본 시나리오로 처리** — 데이터가 부족한 틈새 키워드도 에러 없이 동작해야 한다. 이 경우 "데이터 부족으로 인한 AI 추정 리포트"임을 명시하고 논리적 뼈대를 제공한다.
4. **작은 단위 개발** — 기본 레이아웃 → 입력 폼 → Mock 리포트 → 차트 → API Route → LLM 연결 → 외부 데이터 → 예외처리/신뢰도 순으로.

## 폴더 구조 (목표)

```txt
src/
├── app/
│   ├── api/market-diagnosis/route.ts   # 시장진단 Route Handler
│   ├── diagnosis/page.tsx              # 진단 결과 페이지
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                        # 랜딩
├── features/market-diagnosis/
│   ├── components/                     # KeywordSearchForm, DiagnosisSummaryCard,
│   │                                   # MarketSizeChart, CompetitionGauge,
│   │                                   # PersonaCard, AssumptionNotice
│   ├── hooks/useMarketDiagnosis.ts
│   └── types.ts
├── lib/
│   ├── ai/                             # market-diagnosis-prompt, -service, report-schema
│   ├── data-sources/                   # mock-market-data, public-data, trend-data
│   └── utils.ts
├── components/common/                  # Container, SectionTitle, LoadingSpinner
└── constants/market.ts
```

## 개발 로드맵 (Phase)

1. **초기 세팅** — Next.js(App Router) 생성, Tailwind, 폴더 구조, README, GitHub 연결
2. **화면 MVP** — 랜딩 / 입력 페이지 / 결과 대시보드 UI (Mock 데이터 렌더링)
3. **진단 API** — `/api/market-diagnosis` Route Handler, 입력 검증, Mock 응답 구조, 데이터 부족 응답
4. **AI 리포트 연결** — LLM 프롬프트, 응답 스키마, 요약/페르소나/TAM-SAM-SOM 생성, 추정 안내 문구
5. **시각화 개선** — 시장 규모 차트, 경쟁 강도 게이지, 타겟 분포 차트, 신뢰도 표시
6. **외부 데이터 연동** — 공공데이터 API, 검색 트렌드, 수집 실패 시 fallback
7. **배포** — Vercel, 환경변수, README/포트폴리오 문서

## 환경 변수

루트에 `.env.local` 생성. 서버 전용으로만 사용.

```env
OPENAI_API_KEY=your_openai_api_key
```

## Git 컨벤션

브랜치: `main`(배포) / `dev`(개발 통합) / `feat/*` / `fix/*` / `chore/*`

커밋: `type: 한글 설명` (type은 영어 소문자, 콜론 뒤 한 칸). type = feat | fix | chore | docs | style | refactor | test. 하나의 커밋에는 하나의 작업 단위만.

```bash
git commit -m "feat: 시장진단 입력 페이지 추가"
```

## 주의

제공되는 시장 규모·경쟁 강도·타겟 정보는 공공데이터·트렌드·AI 추론 기반의 **참고용 추정치**다. 실제 창업/투자 의사결정 전 추가 검증이 필요하다는 점을 항상 명시한다.
