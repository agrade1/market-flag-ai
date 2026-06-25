---
name: feature-workflow
description: Market Flag AI의 표준 기능 개발 사이클(이슈 → 브랜치 → 작업 → 커밋 → 푸시 → PR → 머지 → 최신화)을 실행한다. 새 기능/작업을 시작하거나 "다음 작업 진행하자", "이슈부터 만들고 진행" 같은 요청을 받았을 때 사용.
---

# Feature Workflow — 표준 작업 사이클

Market Flag AI의 모든 작업은 이 사이클을 따른다. 단계를 건너뛰지 않는다.

```
① 이슈 생성 → ② 브랜치 생성 → ③ 작업 → ④ 커밋 → ⑤ 푸시 → ⑥ PR 작성 → ⑦ 머지(사용자) → ⑧ 최신화
```

## 사전 정보

- 레포: `agrade1/market-flag-ai`
- `gh` CLI 경로: `~/.local/bin/gh` (PATH에 없으면 `export PATH="$HOME/.local/bin:$PATH"`)
- 인증: `GH_TOKEN` 환경변수 사용 (토큰은 사용자에게 요청; 평문 노출 시 폐기 안내)
- 통합 브랜치(PR base): `develop` / 배포 브랜치: `main`

## 단계별

### ① 이슈 생성
- 이슈는 **작업 요약 + 작업 내용 체크리스트**만 필수. 너무 디테일하게 쓰지 않는다.
- 제목: `[type] 한글 제목` — type은 커밋 컨벤션과 동일(feat/fix/chore/docs/style/refactor/test).
- `gh issue create --repo agrade1/market-flag-ai --title "[feat] ..." --body-file <file>`
- 템플릿: `.github/ISSUE_TEMPLATE/task.yml` 참고.

### ② 브랜치 생성
- 항상 최신 `develop`에서 분기: `git checkout develop && git pull && git checkout -b <type>/<이슈번호>-<설명>`
- 예: `feat/3-landing-page`, `chore/5-dev-environment`

### ③ 작업
- 작은 단위로. 컴포넌트/API 로직 분리. API Key는 서버에서만.
- UI 작업은 `ui-guideline` 스킬을 함께 참고.

### ④ 커밋 (컨벤션)
- `type: 한글 설명` — type 영어 소문자, 콜론 뒤 한 칸. 하나의 커밋 = 하나의 작업 단위.
- 본문에 `Refs #<이슈번호>` 포함.
- 끝에 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

### ⑤ 푸시
- `git push -u origin <branch>`

### ⑥ PR 작성
- `gh pr create --base develop --head <branch> --title "type: 제목" --body "..."`
- 본문에 `Closes #<이슈번호>` 포함(머지 시 이슈 자동 종료). 작업 요약 + 작업 내용 + 확인(lint/build) 기재.

### ⑦ 머지
- **사용자가 직접 한다.** Claude는 머지하지 않는다. PR 링크를 안내하고 대기.

### ⑧ 최신화
- 머지 확인 후: `git checkout develop && git pull origin develop`
- 머지된 작업 브랜치 삭제: `git branch -d <branch>`

## 주의
- 빌드/린트(`npm run build`, `npm run lint`)를 통과시킨 뒤 커밋한다.
- 토큰이 대화에 평문 노출되면 사용자에게 폐기·재발급을 안내한다.
