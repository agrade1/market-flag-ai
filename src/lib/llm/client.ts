// Claude API 클라이언트 래퍼 — 서버 전용.
//
// API Key(ANTHROPIC_API_KEY)는 이 모듈 등 서버 코드에서만 읽는다. NEXT_PUBLIC_ 금지.
// 키가 없으면 null을 반환해 호출부가 LLM 단계를 건너뛰고 휴리스틱으로 fallback 한다.

import Anthropic from "@anthropic-ai/sdk";

/** 기본 모델 (claude-api 스킬 기준 최신 Opus). */
export const LLM_MODEL = "claude-opus-4-8";

let cached: Anthropic | null | undefined;

/** 키가 설정돼 있으면 Anthropic 클라이언트를, 아니면 null을 반환(메모이즈). */
export function getLlmClient(): Anthropic | null {
  if (cached !== undefined) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  cached = apiKey ? new Anthropic() : null;
  return cached;
}

/** LLM 보완을 사용할 수 있는지(키 존재) 여부. */
export function isLlmEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
