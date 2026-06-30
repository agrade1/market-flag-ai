// 시장진단 오케스트레이터 — market-research 7단계 파이프라인의 진입점.
//
// 서버 전용 모듈. API Route Handler와 (후속) 서버 컴포넌트가 이 `diagnose()`를
// 호출한다. 외부 API/LLM Key는 이 레이어(및 하위 data-sources/llm)에서만 다루고
// 클라이언트로 노출하지 않는다(키 서버 전용 원칙).
//
// 파이프라인: ①검증 → ②키워드분석 → (③소스라우팅: 후속) → ④수집(public/trend) →
// ⑤가공 → ⑥추론(market-size/competition/persona) → ⑦새너티게이트+스키마검증.
// 외부 수집 실패는 에러가 아니라 fallback으로 처리하고 confidence만 낮춘다.

import { diagnosisResultSchema } from "@/lib/ai/report-schema";
import { KEYWORD_MAX_LENGTH, KEYWORD_MIN_LENGTH } from "@/constants/market";
import { analyzeKeyword } from "@/lib/inference/keyword-analysis";
import { fetchMacroData } from "@/lib/data-sources/public-data";
import { fetchTrendData } from "@/lib/data-sources/trend-data";
import { transform } from "@/lib/inference/transform";
import { assessCompetition } from "@/lib/inference/competition";
import { estimateMarketSize } from "@/lib/inference/market-size";
import { buildPersonas } from "@/lib/inference/persona";
import { runSanity } from "@/lib/inference/sanity";
import { enrichNarrative } from "@/lib/ai/market-diagnosis-prompt";
import type {
  DiagnosisResult,
  OceanType,
  Persona,
} from "@/features/market-diagnosis/types";

/** 입력 키워드 자체가 유효하지 않을 때(빈 값/과길이). 호출부에서 400으로 변환한다. */
export class InvalidKeywordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidKeywordError";
  }
}

const COMMON_NOTICES = [
  "본 리포트의 시장 규모·경쟁 강도·타겟 정보는 공공데이터·검색 트렌드·AI 추론에 기반한 참고용 추정치입니다.",
  "실제 창업·투자 의사결정 전에는 1차 자료 조사 등 추가 검증이 필요합니다.",
];

const LOW_CONFIDENCE_NOTICE =
  "데이터가 부족해 인접 시장·거시 지표 기반 AI 추정 비중이 높은 리포트입니다. 수치 해석에 주의하세요.";

/** Promise.allSettled 결과에서 값 또는 null을 꺼낸다(수집 실패 = null). */
function settled<T>(result: PromiseSettledResult<T | null>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function buildSummary(keyword: string, ocean: OceanType): string {
  const phrase =
    ocean === "red"
      ? "경쟁이 치열한 레드오션 성향"
      : ocean === "blue"
        ? "경쟁이 적은 블루오션 성향"
        : "기회와 경쟁이 공존하는 혼합 시장";
  return `"${keyword}" 시장은 ${phrase}으로 추정됩니다. 아래 시장 규모와 타겟 페르소나를 참고해 진입 전략을 점검해 보세요.`;
}

/**
 * LLM 서술 보완 결과를 결과에 병합한다. 숫자(점수·규모·비중)는 건드리지 않고
 * summary와 페르소나의 painPoint/동기(traits에 추가)만 교체한다.
 */
function applyEnrichment(
  result: DiagnosisResult,
  enrichment: Awaited<ReturnType<typeof enrichNarrative>>,
): DiagnosisResult {
  if (!enrichment) return result;

  const summary = enrichment.summary?.trim() || result.summary;

  const byId = new Map(
    (enrichment.personas ?? []).map((p) => [p.id, p]),
  );
  const personas: Persona[] = result.personas.map((persona) => {
    const e = byId.get(persona.id);
    if (!e) return persona;
    const motivation = e.motivation?.trim();
    return {
      ...persona,
      painPoint: e.painPoint?.trim() || persona.painPoint,
      traits: motivation
        ? [...persona.traits, `동기: ${motivation}`]
        : persona.traits,
    };
  });

  return { ...result, summary, personas };
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

  // ② 키워드 분석
  const analysis = analyzeKeyword(trimmed);

  // 너무 짧은 키워드는 카테고리 라우팅이 불가 → 거시 소스 결측으로 간주(저신뢰 경로).
  const isSparse = trimmed.length < KEYWORD_MIN_LENGTH;

  // ④ 데이터 수집 — 병렬, 각 소스 실패해도 죽지 않음
  const [macroSettled, trendSettled] = await Promise.allSettled([
    isSparse ? Promise.resolve(null) : fetchMacroData(analysis),
    fetchTrendData(analysis),
  ]);
  const macro = settled(macroSettled);
  const trend = settled(trendSettled);

  // ⑤ 가공
  const inputs = transform(analysis, macro, trend);

  // ⑥ 추론 — 경쟁 점수가 SOM 점유율 가정에 쓰이므로 competition 먼저
  const competition = assessCompetition(inputs, analysis);
  const marketSize = estimateMarketSize(inputs, competition.score);
  const personas = buildPersonas(inputs, analysis);

  // ⑦ 새너티 게이트 + confidence
  const sanity = runSanity(inputs, marketSize);

  const notices =
    sanity.confidence === "high"
      ? [...COMMON_NOTICES]
      : [LOW_CONFIDENCE_NOTICE, ...COMMON_NOTICES];

  const result: DiagnosisResult = {
    keyword: trimmed,
    generatedAt: new Date().toISOString(),
    confidence: sanity.confidence,
    isEstimated: sanity.isEstimated,
    summary: buildSummary(trimmed, competition.ocean),
    competition: {
      ocean: competition.ocean,
      score: competition.score,
      summary: competition.summary,
      signals: competition.signals,
    },
    marketSize: {
      tam: marketSize.tam,
      sam: marketSize.sam,
      som: marketSize.som,
      unit: marketSize.unit,
      tamRange: marketSize.tamRange,
      samRange: marketSize.samRange,
      somRange: marketSize.somRange,
      methods: marketSize.methods,
      baseYear: marketSize.baseYear,
      currency: marketSize.currency,
      assumptions: marketSize.assumptions,
      sources: marketSize.sources,
    },
    personas,
    notices,
    dataSources: inputs.sources,
    confidenceReasons: sanity.confidenceReasons,
  };

  // ⑥' LLM 서술 보완 — 키가 없거나 실패하면 null → 휴리스틱 서술 유지(숫자 불변)
  const enrichment = await enrichNarrative({
    keyword: trimmed,
    category: analysis.category,
    priceTier: analysis.priceTier,
    ocean: competition.ocean,
    score: competition.score,
    personas: personas.map((p) => ({
      id: p.id,
      name: p.name,
      ageRange: p.ageRange,
      gender: p.gender,
      traits: p.traits,
    })),
  });
  const enriched = applyEnrichment(result, enrichment);

  // ⑦ 계약(zod)에 맞는 형태만 반환
  return diagnosisResultSchema.parse(enriched);
}
