// 시장진단 오케스트레이터 — market-research 7단계 파이프라인의 진입점.
//
// 서버 전용 모듈. API Route Handler와 (후속) 서버 컴포넌트가 이 `diagnose()`를
// 호출한다. 외부 API/LLM Key는 이 레이어(및 하위 data-sources/llm)에서만 다루고
// 클라이언트로 노출하지 않는다(키 서버 전용 원칙).
//
// 현재 단계(골격): ①입력검증 → ⑦스키마검증만 실제 동작하고, ②~⑥ 파이프라인은
// 기존 deterministic mock을 경유하는 자리표시다. 후속 이슈에서 keyword-analysis →
// source-routing → fetch(public/trend) → transform → infer 로 단계별 교체한다.

import { getMockDiagnosis } from "@/lib/data-sources/mock-market-data";
import { diagnosisResultSchema } from "@/lib/ai/report-schema";
import { KEYWORD_MAX_LENGTH } from "@/constants/market";
import type { DiagnosisResult } from "@/features/market-diagnosis/types";

/** 입력 키워드 자체가 유효하지 않을 때(빈 값/과길이). 호출부에서 400으로 변환한다. */
export class InvalidKeywordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidKeywordError";
  }
}

/**
 * 키워드를 받아 시장진단 결과를 생성한다.
 *
 * 데이터 부족(예: 너무 짧은 키워드)은 에러가 아니라 저신뢰 추정 리포트로 처리한다.
 * 빈 값이나 과도한 길이만 {@link InvalidKeywordError}로 거부한다.
 */
export async function diagnose(keyword: string): Promise<DiagnosisResult> {
  // ① 입력 검증 — 신뢰할 수 없는 클라이언트 입력을 서버에서 독립 검증
  const trimmed = keyword.trim();
  if (trimmed.length === 0) {
    throw new InvalidKeywordError("진단할 키워드를 입력해 주세요.");
  }
  if (trimmed.length > KEYWORD_MAX_LENGTH) {
    throw new InvalidKeywordError(
      `키워드는 최대 ${KEYWORD_MAX_LENGTH}글자까지 입력할 수 있습니다.`,
    );
  }

  // ②~⑥ 파이프라인 (현재는 mock 경유 자리표시 — 후속 이슈에서 단계별 교체)
  //   ② analyzeKeyword(trimmed)
  //   ③ routeSources(analysis)
  //   ④ fetch: public-data / trend-data (실패 시 null → fallback)
  //   ⑤ transform(raw) → 정규화 + method 태깅
  //   ⑥ infer: marketSize / competition / persona (+범위·confidence)
  const generatedAt = new Date().toISOString();
  const result = getMockDiagnosis(trimmed, generatedAt);

  // ⑦ 새너티 게이트 + 스키마 검증 — 계약(zod)에 맞는 형태만 반환
  return diagnosisResultSchema.parse(result);
}
