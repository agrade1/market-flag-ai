// 시장진단 LLM 보완 — 프롬프트 빌더 + 서술 생성 호출.
//
// LLM은 "정성적 서술"만 담당한다: 진단 한줄 요약, 페르소나의 문제상황·소비 동기.
// 시장 규모·점수·분포 등 숫자는 데이터 기반으로 이미 확정돼 있으므로 LLM이 바꾸지
// 않는다(환각 방지, 기획서 §4-2 ⑦). 키가 없거나 실패하면 null을 반환하고 호출부가
// 휴리스틱 서술로 fallback 한다.

import { getLlmClient, LLM_MODEL } from "@/lib/llm/client";
import type { OceanType } from "@/features/market-diagnosis/types";

/** LLM에 넘길 (숫자가 제거된) 진단 맥락. */
export interface NarrativeDraft {
  keyword: string;
  category: string;
  priceTier: string;
  ocean: OceanType;
  /** 0~100 경쟁 점수 (해석 맥락용, 변경 금지) */
  score: number;
  personas: Array<{
    id: string;
    name: string;
    ageRange: string;
    gender: string;
    traits: string[];
  }>;
}

/** LLM이 돌려주는 서술 보완 결과. */
export interface NarrativeEnrichment {
  summary?: string;
  personas?: Array<{ id: string; painPoint?: string; motivation?: string }>;
}

const SYSTEM_PROMPT = `너는 한국 시장진단 리포트의 카피라이터다. 입력으로 주어진 키워드·카테고리·경쟁 성향·페르소나 정보를 바탕으로 "정성적 서술"만 작성한다.

엄격한 규칙:
- 시장 규모, 점수, 비중 같은 구체적 통계·수치를 새로 지어내지 않는다. 입력에 없는 숫자를 언급하지 않는다.
- 주어진 경쟁 성향(레드/블루/혼합)과 모순되는 서술을 하지 않는다.
- 과장 없이, 창업 진단 리포트에 어울리는 차분하고 구체적인 한국어로 쓴다.
- summary는 1문장(한국어, 90자 내외). 각 페르소나의 painPoint는 1문장, motivation은 1문장.
- 모든 출력은 한국어.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    personas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          painPoint: { type: "string" },
          motivation: { type: "string" },
        },
        required: ["id", "painPoint", "motivation"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "personas"],
  additionalProperties: false,
} as const;

function buildUserPrompt(draft: NarrativeDraft): string {
  const oceanLabel =
    draft.ocean === "red"
      ? "레드오션(경쟁 치열)"
      : draft.ocean === "blue"
        ? "블루오션(경쟁 적음)"
        : "혼합 시장(기회·경쟁 공존)";
  const personaLines = draft.personas
    .map(
      (p) =>
        `- id:${p.id} | ${p.name} | ${p.ageRange} ${p.gender} | 특징: ${p.traits.join(", ")}`,
    )
    .join("\n");

  return `키워드: "${draft.keyword}"
카테고리: ${draft.category}
가격대: ${draft.priceTier}
경쟁 성향: ${oceanLabel} (점수 ${draft.score}/100, 이 숫자는 변경 금지)

페르소나:
${personaLines}

위 정보를 바탕으로:
1) summary: 이 시장 진단을 요약하는 한 문장.
2) personas: 각 페르소나(id를 그대로 유지)에 대해 핵심 문제상황(painPoint)과 소비 동기(motivation)를 한 문장씩.`;
}

/**
 * Claude로 서술을 보완한다. 키가 없거나 호출/파싱이 실패하면 null을 반환한다(예외 던지지 않음).
 */
export async function enrichNarrative(
  draft: NarrativeDraft,
): Promise<NarrativeEnrichment | null> {
  const client = getLlmClient();
  if (!client) return null;

  try {
    const response = await client.messages.create({
      model: LLM_MODEL,
      max_tokens: 1500,
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RESPONSE_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(draft) }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    const parsed = JSON.parse(textBlock.text) as NarrativeEnrichment;
    return parsed;
  } catch (error) {
    console.error("[market-diagnosis] LLM 서술 보완 실패, 휴리스틱 사용:", error);
    return null;
  }
}
