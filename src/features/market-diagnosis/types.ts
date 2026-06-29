// 시장진단 공유 타입 — 검색 폼 / 결과 대시보드 / API가 공유하는 스키마.
//
// 타입의 단일 출처(source of truth)는 `src/lib/ai/report-schema.ts` 의 zod 스키마다.
// 여기서는 z.infer 로 추론한 TS 타입을 re-export 만 한다(2026-06-26 확정,
// [[api-contract-decisions]]). 필드를 바꾸려면 report-schema.ts 를 수정한다.
//
// 모든 수치는 공공데이터·검색 트렌드·AI 추론 기반의 참고용 추정치다.

import type { z } from "zod";
import type {
  attentionChannelSchema,
  attentionDemographicsSchema,
  attentionInfoSchema,
  buzzIndexSchema,
  channelMixEntrySchema,
  channelTrendSchema,
  competitionInfoSchema,
  competitionSignalSchema,
  confidenceLevelSchema,
  diagnosisRequestSchema,
  diagnosisResultSchema,
  distributionBinSchema,
  estimateMethodSchema,
  estimateRangeSchema,
  issueKeywordSchema,
  marketSizeSchema,
  oceanTypeSchema,
  personaSchema,
  sentimentSchema,
  sourceRefSchema,
  trendPointSchema,
} from "@/lib/ai/report-schema";

export type OceanType = z.infer<typeof oceanTypeSchema>;

export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

/** 수치 산출 방법 태그. measured | trend-adjusted | inferred. */
export type EstimateMethod = z.infer<typeof estimateMethodSchema>;

/** 추정 범위(보수/기본/낙관). */
export type EstimateRange = z.infer<typeof estimateRangeSchema>;

/** 출처/근거 참조. */
export type SourceRef = z.infer<typeof sourceRefSchema>;

/** 레드/블루 판정에 기여한 개별 신호. */
export type CompetitionSignal = z.infer<typeof competitionSignalSchema>;

/** 시장 규모 추정치 (단위는 unit, 기본 "원"). */
export type MarketSize = z.infer<typeof marketSizeSchema>;

/** 경쟁 강도 / 레드·블루오션 판별. */
export type CompetitionInfo = z.infer<typeof competitionInfoSchema>;

/** 타겟 고객 페르소나. */
export type Persona = z.infer<typeof personaSchema>;

// === 관심도·이슈 트래킹 (attention) — SNS/트렌드 대시보드 모듈 ===

/** 관심도 집계 채널. */
export type AttentionChannel = z.infer<typeof attentionChannelSchema>;

/** 감성 태그(pos/neu/neg, inferred). */
export type SentimentTag = z.infer<typeof sentimentSchema>;

/** 분포 한 칸({label, pct}). */
export type DistributionBin = z.infer<typeof distributionBinSchema>;

/** 관심 집중지수(0–100 Buzz Index). */
export type BuzzIndex = z.infer<typeof buzzIndexSchema>;

/** 채널별 점유 비중. */
export type ChannelMixEntry = z.infer<typeof channelMixEntrySchema>;

/** 추이 한 점(상대값). */
export type TrendPoint = z.infer<typeof trendPointSchema>;

/** 채널별 언급량 상대 추이. */
export type ChannelTrend = z.infer<typeof channelTrendSchema>;

/** 관심 주체 연령·성별 분해(대화주체). */
export type AttentionDemographics = z.infer<typeof attentionDemographicsSchema>;

/** 이슈·연관어 + 감성. */
export type IssueKeyword = z.infer<typeof issueKeywordSchema>;

/** 관심도·이슈 트래킹 묶음. */
export type AttentionInfo = z.infer<typeof attentionInfoSchema>;

/** 시장진단 결과 전체. 대시보드가 이 형태를 렌더한다. */
export type DiagnosisResult = z.infer<typeof diagnosisResultSchema>;

/** 시장진단 요청 입력. */
export type DiagnosisRequest = z.infer<typeof diagnosisRequestSchema>;
