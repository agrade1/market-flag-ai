# Market Flag AI

> 시장에 깃발을 꽂기 전, 먼저 진단하세요.

**Market Flag AI**는 초기 창업자와 창업 부트캠프 수강생을 위한 AI 기반 시장진단 및 아이디어 검증 MVP입니다.
사용자가 창업 아이디어나 시장 키워드를 입력하면, 공공데이터, 검색 트렌드, AI 추론을 결합해 시장 규모, 경쟁 강도, 주요 타겟 고객, 진입 가능성을 대시보드 형태로 제공합니다.

---

## 프로젝트 개요

초기 창업자는 아이디어를 떠올린 뒤 다음과 같은 질문에 자주 부딪힙니다.

* 이 시장은 이미 경쟁이 너무 치열한가?
* 내 아이디어가 진입할 만한 시장인가?
* 대략적인 시장 규모는 어느 정도인가?
* 주요 이용자는 어떤 성별과 연령대인가?
* 데이터가 부족한 틈새시장도 논리적으로 판단할 수 있는가?

Market Flag AI는 완벽한 민간 미시 데이터를 확보하지 못하더라도, 공개된 거시 데이터와 검색 트렌드, LLM 기반 추론을 활용해 초기 의사결정에 도움이 되는 시장진단 리포트를 제공합니다.

---

## 핵심 기능

### 1. 키워드 기반 시장진단

사용자가 입력한 키워드를 기반으로 시장성을 분석합니다.

예시:

```txt
반려동물 프리미엄 사료
1인 가구 밀키트
시니어 헬스케어 앱
AI 자기소개서 첨삭 서비스
```

### 2. 레드오션 / 블루오션 판단

검색 관심도, 경쟁 강도, 시장 성장 가능성 등을 바탕으로 해당 시장이 레드오션인지 블루오션인지 추정합니다.

### 3. TAM / SAM / SOM 추정

공공데이터와 AI 추론을 활용해 다음 시장 규모를 대략적으로 추정합니다.

* TAM: 전체 시장 규모
* SAM: 실제 접근 가능한 시장 규모
* SOM: 초기 창업자가 현실적으로 확보 가능한 시장 규모

### 4. 타겟 페르소나 도출

성별, 연령대, 소비 성향, 문제 상황 등을 기반으로 주요 고객 페르소나를 제안합니다.

### 5. 데이터 부족 대응

입력한 키워드에 대한 데이터가 부족하더라도 서비스가 실패하지 않도록 처리합니다.

데이터가 충분하지 않은 경우, 다음과 같이 명시합니다.

```txt
이 리포트는 데이터 부족으로 인해 AI 추정 기반으로 생성되었습니다.
실제 창업 의사결정 전 추가 검증이 필요합니다.
```

---

## 기술 스택

### Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* Recharts

### Backend

* Next.js Route Handlers
* OpenAI API 또는 대체 LLM API
* 외부 공공데이터 API
* 검색 트렌드 API

### 기타

* ESLint
* Prettier
* Vercel 배포 예정

---

## 프로젝트 구조

```txt
src/
├── app/
│   ├── api/
│   │   └── market-diagnosis/
│   │       └── route.ts
│   ├── diagnosis/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── features/
│   └── market-diagnosis/
│       ├── components/
│       │   ├── KeywordSearchForm.tsx
│       │   ├── DiagnosisSummaryCard.tsx
│       │   ├── MarketSizeChart.tsx
│       │   ├── CompetitionGauge.tsx
│       │   ├── PersonaCard.tsx
│       │   └── AssumptionNotice.tsx
│       ├── hooks/
│       │   └── useMarketDiagnosis.ts
│       └── types.ts
│
├── lib/
│   ├── ai/
│   │   ├── market-diagnosis-prompt.ts
│   │   ├── market-diagnosis-service.ts
│   │   └── report-schema.ts
│   ├── data-sources/
│   │   ├── mock-market-data.ts
│   │   ├── public-data.ts
│   │   └── trend-data.ts
│   └── utils.ts
│
├── components/
│   └── common/
│       ├── Container.tsx
│       ├── SectionTitle.tsx
│       └── LoadingSpinner.tsx
│
└── constants/
    └── market.ts
```

---

## 시작하기

### 1. 프로젝트 클론

```bash
git clone https://github.com/사용자명/market-flag-ai.git
cd market-flag-ai
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경 변수 설정

루트 디렉토리에 `.env.local` 파일을 생성합니다.

```env
OPENAI_API_KEY=your_openai_api_key
```

API Key는 반드시 서버에서만 사용해야 하며, 클라이언트에 노출되는 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:3000
```

---

## 개발 원칙

### 1. API Key는 서버에서만 사용

OpenAI API Key 및 외부 API Key는 클라이언트 컴포넌트에서 직접 사용하지 않습니다.
모든 외부 API 호출은 Next.js Route Handler 또는 서버 전용 모듈에서 처리합니다.

### 2. 컴포넌트와 비즈니스 로직 분리

UI 컴포넌트, API 호출 로직, AI 프롬프트, 데이터 가공 로직을 명확히 분리합니다.

### 3. 데이터 부족 상황을 기본 시나리오로 처리

시장 데이터가 부족한 틈새 키워드도 서비스가 중단되지 않도록 처리합니다.
데이터가 부족할 경우 AI 추정 리포트임을 명확히 표시합니다.

### 4. 작은 단위로 개발

한 번에 거대한 기능을 만들지 않고, 다음 순서로 점진적으로 구현합니다.

1. 기본 레이아웃
2. 키워드 입력 폼
3. Mock 데이터 기반 리포트 출력
4. 차트 시각화
5. API Route Handler 연결
6. LLM 응답 연결
7. 외부 데이터 API 연결
8. 예외 처리 및 리포트 신뢰도 개선

---

## 초기 개발 로드맵

### Phase 1. 프로젝트 초기 세팅

* Next.js App Router 프로젝트 생성
* Tailwind CSS 설정
* 기본 폴더 구조 구성
* README 작성
* GitHub 레포 연결

### Phase 2. 화면 MVP 구현

* 메인 랜딩 페이지 구현
* 시장진단 입력 페이지 구현
* 결과 대시보드 UI 구현
* Mock 데이터 기반 렌더링

### Phase 3. 시장진단 API 구현

* `/api/market-diagnosis` Route Handler 생성
* 키워드 입력값 검증
* Mock 데이터 응답 구조 정의
* 에러 및 데이터 부족 응답 처리

### Phase 4. AI 리포트 생성 연결

* LLM 프롬프트 작성
* AI 응답 스키마 정의
* 시장진단 요약, 페르소나, TAM/SAM/SOM 추정 생성
* AI 추정 리포트 안내 문구 표시

### Phase 5. 데이터 시각화 개선

* 시장 규모 차트
* 경쟁 강도 게이지
* 타겟 고객 분포 차트
* 데이터 신뢰도 표시

### Phase 6. 외부 데이터 연동

* 공공데이터 API 연동
* 검색 트렌드 데이터 연동
* 데이터 수집 실패 시 fallback 처리

### Phase 7. 배포

* Vercel 배포
* 환경변수 등록
* README 정리
* 사용 예시 추가
* 포트폴리오용 소개 문서 작성

---

## 브랜치 전략

```txt
main: 배포용 브랜치
dev: 개발 통합 브랜치
feat/*: 기능 개발 브랜치
fix/*: 버그 수정 브랜치
chore/*: 설정 및 기타 작업 브랜치
```

예시:

```bash
git checkout -b feat/1-init-project
git checkout -b feat/2-diagnosis-page
git checkout -b feat/3-market-diagnosis-api
```

---

## 커밋 컨벤션

```txt
feat: 새로운 기능 추가
fix: 버그 수정
chore: 설정, 패키지, 빌드 관련 작업
docs: 문서 수정
style: 스타일 수정
refactor: 리팩토링
test: 테스트 코드 추가 또는 수정


작성 규칙
커밋 타입은 영어 소문자로 작성합니다.
콜론 뒤에는 한 칸을 띄웁니다.
작업 내용은 한글로 간결하게 작성합니다.
하나의 커밋에는 하나의 작업 단위만 포함합니다.
너무 큰 변경사항은 여러 커밋으로 나눕니다.

예시:

bash
git commit -m "chore: 마켓플래그 프로젝트 초기화" 
git commit -m "docs: README 프로젝트 개요 작성" 
git commit -m "feat: 시장진단 입력 페이지 추가"
```

---

## 주의사항

이 서비스에서 제공하는 시장 규모, 경쟁 강도, 타겟 고객 정보는 공공데이터, 검색 트렌드, AI 추론을 바탕으로 한 참고용 추정치입니다.
실제 투자, 창업, 사업화 의사결정 전에는 반드시 추가적인 시장조사와 검증이 필요합니다.

---

## License

This project is currently for MVP development and portfolio purposes.
