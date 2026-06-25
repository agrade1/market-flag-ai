---
name: ui-guideline
description: Market Flag AI의 UI를 구현할 때 따르는 디자인 시스템·컴포넌트 규칙. 페이지/컴포넌트/대시보드/폼/차트 등 프론트엔드 화면을 만들거나 수정할 때 사용.
---

# UI Guideline — Market Flag AI 디자인 시스템

## 스택
- **shadcn/ui** (style: `base-nova`, baseColor: `neutral`, 아이콘: `lucide-react`)
- **Tailwind CSS v4** — 설정은 `src/app/globals.css`의 `@theme` / CSS 변수 토큰
- 컴포넌트 추가: `npx shadcn@latest add <name>` → `src/components/ui/`에 생성

## 컴포넌트 계층
- `src/components/ui/*` — shadcn 원자 컴포넌트(button, card, input, label, badge…). **직접 수정 최소화**, 가능한 그대로 사용.
- `src/components/common/*` — 프로젝트 공통: `Container`(max-w-6xl 가운데 정렬), `SectionTitle`(eyebrow/title/description), `LoadingSpinner`.
- `src/features/<feature>/components/*` — 기능별 컴포넌트(예: market-diagnosis).

## 디자인 규칙
- 색상은 토큰/유틸리티만 사용. 강조색은 blue 계열(`text-blue-600`, `bg-blue-600`). 임의 hex 지양.
- 다크 모드 대응 필수: `dark:` variant 항상 함께 작성.
- 간격: 섹션 `py-20 sm:py-24`, 카드 `p-6`, 둥근 모서리 `rounded-xl`(카드)/`rounded-lg`(버튼).
- 반응형: 모바일 우선. 그리드는 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 패턴.
- 접근성: 아이콘에 `aria-hidden`, 로딩에 `role="status"`, 포커스 링 유지.
- 아이콘은 lucide-react에서 가져오고 크기 `h-4 w-4`~`h-5 w-5`.

## 콘텐츠 규칙 (한국어 서비스)
- 모든 사용자 노출 문구는 한국어. 간결하고 창업자 친화적인 톤.
- 추정 데이터를 보여주는 화면에는 **"참고용 추정치, 추가 검증 필요"** 안내를 반드시 노출(`AssumptionNotice` 패턴).
- 데이터 부족 시: 에러 대신 "데이터 부족으로 인한 AI 추정 리포트"임을 명시(서비스 핵심 제약).

## 차트
- `recharts` 사용(가벼운 차트). 시장 규모/경쟁 강도/타겟 분포 시각화.
- 차트도 다크 모드 색상 토큰을 고려.

## 검증
- 화면 작업 후 `npm run build`로 타입/빌드 확인. 가능하면 `/run` 또는 verify 스킬로 실제 렌더 확인.
