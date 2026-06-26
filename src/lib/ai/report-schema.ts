// 시장진단 응답 스키마 — 계약의 단일 출처(source of truth).
//
// zod 스키마를 여기서 정의하고, `features/market-diagnosis/types.ts` 가 z.infer 타입을
// re-export 한다. LLM 출력 검증과 프론트/백엔드 공유 TS 타입이 한곳에서 일치한다.
//
// 설계 원칙(2026-06-26 확정, [[api-contract-decisions]]):
// - v1 lean 필드(tam/sam/som, ocean/score 등)는 그대로 유지 → 프론트 무중단.
// - market-inference 방법론이 요구하는 범위(보수/기본/낙관)·출처·method 태깅·
//   신호별 기여도 등은 모두 **optional** 로 추가(additive-optional). 프론트는 현재
//   UI 그대로 동작하고, 추후 점진적으로 풍부한 데이터를 노출한다.
//
// 모든 수치는 공공데이터·검색 트렌드·AI 추론 기반의 참고용 추정치다.

import { z } from "zod";

/** 레드/블루오션 분류. */
export const oceanTypeSchema = z.enum(["red", "blue", "mixed"]);

/** 데이터 충분도(confidence). high=주로 실데이터 / medium=트렌드 보정 / low=주로 추론. */
export const confidenceLevelSchema = z.enum(["high", "medium", "low"]);

/** 수치 산출 방법 태그. measured=실측 / trend-adjusted=트렌드 보정 / inferred=LLM 추론. */
export const estimateMethodSchema = z.enum([
  "measured",
  "trend-adjusted",
  "inferred",
]);

/** 추정 범위(보수/기본/낙관). low=보수, base=기본, high=낙관. */
export const estimateRangeSchema = z.object({
  low: z.number(),
  base: z.number(),
  high: z.number(),
});

/** 출처/근거 참조. */
export const sourceRefSchema = z.object({
  /** 출처명 (예: "KOSIS 가구추계", "네이버 데이터랩") */
  name: z.string(),
  /** 이 출처에서 얻은 값의 산출 방법 */
  method: estimateMethodSchema.optional(),
  /** 원본 링크 */
  url: z.string().optional(),
  /** 보조 설명 */
  note: z.string().optional(),
});

/** 레드/블루 판정에 기여한 개별 신호. */
export const competitionSignalSchema = z.object({
  /** 신호명 (예: "검색 관심도 추세", "사업체 밀도", "진입장벽") */
  label: z.string(),
  /** 점수 기여도 (0–100, 높을수록 경쟁 심화 방향) */
  contribution: z.number(),
  /** 신호 해석 보조 설명 */
  note: z.string().optional(),
});

/** 시장 규모 추정치 (단위는 unit, 기본 "원"). */
export const marketSizeSchema = z.object({
  /** Total Addressable Market — 전체 시장 (기본/대표값) */
  tam: z.number(),
  /** Serviceable Available Market — 접근 가능 시장 (기본/대표값) */
  sam: z.number(),
  /** Serviceable Obtainable Market — 현실적 확보 가능 시장 (기본/대표값) */
  som: z.number(),
  /** 표시 단위 (기본 "원") */
  unit: z.string().optional(),

  // --- additive-optional (방법론 확장) ---
  /** TAM 추정 범위(보수/기본/낙관) */
  tamRange: estimateRangeSchema.optional(),
  /** SAM 추정 범위 */
  samRange: estimateRangeSchema.optional(),
  /** SOM 추정 범위 */
  somRange: estimateRangeSchema.optional(),
  /** TAM/SAM/SOM 각각의 산출 방법 태그 */
  methods: z
    .object({
      tam: estimateMethodSchema,
      sam: estimateMethodSchema,
      som: estimateMethodSchema,
    })
    .optional(),
  /** 기준 연도 (예: 2024) */
  baseYear: z.number().optional(),
  /** 통화 (예: "KRW") */
  currency: z.string().optional(),
  /** 추정에 사용한 가정 */
  assumptions: z.array(z.string()).optional(),
  /** 추정 근거 출처 */
  sources: z.array(sourceRefSchema).optional(),
});

/** 경쟁 강도 / 레드·블루오션 판별. */
export const competitionInfoSchema = z.object({
  ocean: oceanTypeSchema,
  /** 0–100, 높을수록 경쟁이 치열(레드오션)함. */
  score: z.number(),
  summary: z.string(),

  // --- additive-optional (방법론 확장) ---
  /** 점수를 합성한 신호별 기여도 */
  signals: z.array(competitionSignalSchema).optional(),
});

/** 타겟 고객 페르소나. */
export const personaSchema = z.object({
  id: z.string(),
  /** 페르소나 별칭 (예: "가치소비 직장인") */
  name: z.string(),
  /** 연령대 (예: "30대 초반") */
  ageRange: z.string(),
  /** 성별 표기 (예: "여성", "남녀 무관") */
  gender: z.string(),
  /** 소비 성향·특징 */
  traits: z.array(z.string()),
  /** 핵심 문제 상황 */
  painPoint: z.string(),
  /** 타겟 내 비중 (0–100, %) */
  share: z.number(),
});

/** 시장진단 결과 전체. 대시보드가 이 형태를 렌더한다. */
export const diagnosisResultSchema = z.object({
  keyword: z.string(),
  /** 생성 시각 (ISO 8601) */
  generatedAt: z.string(),
  confidence: confidenceLevelSchema,
  /** 데이터 부족으로 AI 추정 비중이 큰 리포트인지 여부 */
  isEstimated: z.boolean(),
  /** 진단 한줄 요약 */
  summary: z.string(),
  competition: competitionInfoSchema,
  marketSize: marketSizeSchema,
  personas: z.array(personaSchema),
  /** 가정·한계 등 사용자에게 보여줄 안내 문구 */
  notices: z.array(z.string()),

  // --- additive-optional (방법론 확장) ---
  /** 리포트 전체에서 사용한 데이터 출처 */
  dataSources: z.array(sourceRefSchema).optional(),
  /** confidence 산정 근거 */
  confidenceReasons: z.array(z.string()).optional(),
});

/** 시장진단 요청 입력. */
export const diagnosisRequestSchema = z.object({
  keyword: z.string(),
});
