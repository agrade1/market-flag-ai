// ⑦ 새너티 게이트 + confidence 자동 산출. 기획서 §4-2 ⑤⑥.
//
// - 경계 검증: SOM ≤ SAM ≤ TAM, 비율 0~100%, 분포합≈100%, 음수 없음.
// - confidence: method 가중평균(measured=1.0, trend-adjusted=0.6, inferred=0.3).
//   삼각측량 괴리·fallback이 있으면 한 단계 강등.

import type { ConfidenceLevel, EstimateMethod } from "@/features/market-diagnosis/types";
import type { MarketInputs } from "@/lib/inference/transform";
import type { MarketSizeResult } from "@/lib/inference/market-size";

export interface SanityResult {
  confidence: ConfidenceLevel;
  isEstimated: boolean;
  confidenceReasons: string[];
  violations: string[];
}

const METHOD_WEIGHT: Record<EstimateMethod, number> = {
  measured: 1.0,
  "trend-adjusted": 0.6,
  inferred: 0.3,
};

const DOWNGRADE: Record<ConfidenceLevel, ConfidenceLevel> = {
  high: "medium",
  medium: "low",
  low: "low",
};

/** method 가중평균 점수를 confidence 라벨로 변환. */
function labelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

export function runSanity(
  inputs: MarketInputs,
  marketSize: MarketSizeResult,
): SanityResult {
  const violations: string[] = [];
  const reasons: string[] = [];

  // --- 경계 검증 ---
  if (!(marketSize.som <= marketSize.sam && marketSize.sam <= marketSize.tam)) {
    violations.push("SOM ≤ SAM ≤ TAM 위반");
  }
  if (inputs.penetrationRate < 0 || inputs.penetrationRate > 1) {
    violations.push("침투율이 0~100% 범위를 벗어남");
  }
  if (inputs.closureRate < 0 || inputs.closureRate > 1) {
    violations.push("폐업률이 0~100% 범위를 벗어남");
  }
  const ageSum = Object.values(inputs.ageDistribution).reduce(
    (a, b) => a + b,
    0,
  );
  if (Math.abs(ageSum - 100) > 2) {
    violations.push(`연령 분포 합이 100%에서 벗어남(${ageSum}%)`);
  }
  if ([marketSize.tam, marketSize.sam, marketSize.som].some((v) => v < 0)) {
    violations.push("시장 규모에 음수가 존재");
  }

  // --- confidence: method 가중평균 ---
  const methods = Object.values(inputs.meta).map((x) => x.method);
  const avg =
    methods.reduce((sum, m) => sum + METHOD_WEIGHT[m], 0) /
    (methods.length || 1);

  let confidence = labelFromScore(avg);

  const counts = methods.reduce<Record<string, number>>((acc, m) => {
    acc[m] = (acc[m] ?? 0) + 1;
    return acc;
  }, {});
  reasons.push(
    `데이터 구성 — 실측 ${counts.measured ?? 0} · 트렌드 ${counts["trend-adjusted"] ?? 0} · 추론 ${counts.inferred ?? 0}개 (가중평균 ${avg.toFixed(2)})`,
  );

  // 삼각측량 괴리 반영
  const { gapPct } = marketSize.triangulation;
  if (gapPct > 50) {
    confidence = DOWNGRADE[confidence];
    reasons.push(
      `TAM 이중추정 괴리 ${gapPct}% (>50%) — 추정 불확실성 큼, 신뢰도 강등`,
    );
  } else if (gapPct < 20) {
    reasons.push(`TAM 이중추정 괴리 ${gapPct}% (<20%) — top-down/bottom-up 일치도 높음`);
  }

  // fallback(수집 실패) 반영
  if (inputs.fallbacks.length > 0) {
    confidence = DOWNGRADE[confidence];
    reasons.push(...inputs.fallbacks);
  }

  // 경계 위반 시 강등
  if (violations.length > 0) {
    confidence = DOWNGRADE[confidence];
    reasons.push(`새너티 위반 ${violations.length}건 — 신뢰도 강등`);
  }

  return {
    confidence,
    isEstimated: confidence !== "high",
    confidenceReasons: reasons,
    violations,
  };
}
