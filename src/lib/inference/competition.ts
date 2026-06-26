// ⑥ 레드/블루오션 — 다신호 가중 합성 점수(0~100). 기획서 §3-2.
// 단일 지표 의존 금지: 4개 신호를 가중 합성하고 신호별 기여도를 함께 반환(설명 가능).

import type { MarketInputs } from "@/lib/inference/transform";
import type { KeywordAnalysis } from "@/lib/inference/keyword-analysis";
import type {
  CompetitionSignal,
  OceanType,
} from "@/features/market-diagnosis/types";

export interface CompetitionResult {
  ocean: OceanType;
  score: number;
  summary: string;
  signals: CompetitionSignal[];
}

/** 신호별 가중치 (기획서 §3-2 초안). 합 = 1.0 */
const WEIGHTS = {
  searchTrend: 0.3,
  rivalry: 0.3,
  growth: 0.25,
  barrier: 0.15,
};

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));

/** 점수 → 오션 타입. (mock/프론트 게이지와 임계값 일치) */
function oceanFromScore(score: number): OceanType {
  if (score >= 67) return "red";
  if (score <= 40) return "blue";
  return "mixed";
}

function summarize(ocean: OceanType, score: number): string {
  switch (ocean) {
    case "red":
      return `경쟁 강도 ${score}점으로 이미 다수 사업자가 경쟁 중인 레드오션에 가깝습니다. 차별화 포인트 확보가 관건입니다.`;
    case "blue":
      return `경쟁 강도 ${score}점으로 경쟁이 상대적으로 적은 블루오션 성향입니다. 수요 검증과 초기 시장 선점이 중요합니다.`;
    default:
      return `경쟁 강도 ${score}점으로 경쟁과 기회가 공존하는 혼합 시장입니다. 명확한 세분 시장 타겟팅이 유효합니다.`;
  }
}

/** 진입장벽 추정(0~1) — 가격대/카테고리 휴리스틱. 높을수록 진입 어려움. */
function estimateBarrier(analysis: KeywordAnalysis): number {
  let barrier = 0.4;
  if (analysis.priceTier === "premium") barrier += 0.2;
  if (["헬스케어", "디지털서비스"].includes(analysis.category)) barrier += 0.15;
  return Math.min(0.9, barrier);
}

/**
 * 경쟁 강도를 평가한다. 각 신호의 "레드 기여도(0~100)"에 가중치를 곱해 합산한다.
 */
export function assessCompetition(
  inputs: MarketInputs,
  analysis: KeywordAnalysis,
): CompetitionResult {
  // ① 검색 관심 추세: 상승할수록 신규 진입 압력↑ (momentum -0.3~0.6 → 0~100)
  const searchRed = clamp(((inputs.momentum + 0.3) / 0.9) * 100);

  // ② 경쟁 강도: 점포 밀도 + 폐업률 (둘 다 높을수록 레드)
  const storeNorm = clamp(
    ((Math.log10(Math.max(inputs.storeCount, 1)) - Math.log10(500)) /
      (Math.log10(80_000) - Math.log10(500))) *
      100,
  );
  const closureNorm = clamp(((inputs.closureRate - 0.05) / 0.2) * 100);
  const rivalryRed = clamp(storeNorm * 0.6 + closureNorm * 0.4);

  // ③ 시장 성장성: 성장률 높을수록 여유(블루) → 레드 기여는 역방향 (cagr -0.05~0.18)
  const growthRed = clamp(((0.18 - inputs.salesCagr) / 0.23) * 100);

  // ④ 진입장벽: 높을수록 경쟁자 적음(레드 기여 역방향)
  const barrier = estimateBarrier(analysis);
  const barrierRed = clamp((1 - barrier) * 100);

  const parts: Array<{ label: string; raw: number; weight: number; note: string }> = [
    {
      label: "검색 관심 추세",
      raw: searchRed,
      weight: WEIGHTS.searchTrend,
      note: `관심도 기울기 ${(inputs.momentum * 100).toFixed(0)}% — 상승할수록 진입 압력↑`,
    },
    {
      label: "경쟁 강도(점포·폐업)",
      raw: rivalryRed,
      weight: WEIGHTS.rivalry,
      note: `점포 ${inputs.storeCount.toLocaleString()}개 · 폐업률 ${(inputs.closureRate * 100).toFixed(0)}%`,
    },
    {
      label: "시장 성장성",
      raw: growthRed,
      weight: WEIGHTS.growth,
      note: `거래액 CAGR ${(inputs.salesCagr * 100).toFixed(0)}% — 높을수록 여유(블루)`,
    },
    {
      label: "진입장벽",
      raw: barrierRed,
      weight: WEIGHTS.barrier,
      note: `진입장벽 ${(barrier * 100).toFixed(0)}% — 높을수록 경쟁자 적음`,
    },
  ];

  const score = Math.round(
    parts.reduce((sum, p) => sum + p.raw * p.weight, 0),
  );
  const ocean = oceanFromScore(score);

  const signals: CompetitionSignal[] = parts.map((p) => ({
    label: p.label,
    contribution: Math.round(p.raw * p.weight), // 가중 기여점수 (합≈score)
    note: p.note,
  }));

  return { ocean, score, summary: summarize(ocean, score), signals };
}
