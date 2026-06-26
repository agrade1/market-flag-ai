// ⑥ TAM/SAM/SOM 추정 — 이중 경로(top-down/bottom-up) + 삼각측량 + 편차밴드 범위.
// 기획서 §3-1, §4. 모든 값은 유효숫자 2~3자리로 반올림하고 (보수/기본/낙관) 범위를 동반한다.

import { roundSig } from "@/lib/inference/rng";
import type { MarketInputs } from "@/lib/inference/transform";
import type {
  EstimateMethod,
  EstimateRange,
  SourceRef,
} from "@/features/market-diagnosis/types";

export interface MarketSizeResult {
  tam: number;
  sam: number;
  som: number;
  unit: string;
  currency: string;
  baseYear: number;
  tamRange: EstimateRange;
  samRange: EstimateRange;
  somRange: EstimateRange;
  methods: { tam: EstimateMethod; sam: EstimateMethod; som: EstimateMethod };
  assumptions: string[];
  sources: SourceRef[];
  /** 삼각측량 결과(설명용) */
  triangulation: { topDown: number; bottomUp: number; gapPct: number };
}

const METHOD_RANK: Record<EstimateMethod, number> = {
  inferred: 0,
  "trend-adjusted": 1,
  measured: 2,
};

/** 여러 method 중 가장 약한(신뢰 낮은) 것을 고른다. */
function weakest(...methods: EstimateMethod[]): EstimateMethod {
  return methods.reduce((acc, m) => (METHOD_RANK[m] < METHOD_RANK[acc] ? m : acc));
}

/** method별 기본 편차밴드 배수 (기획서 §4-2). */
function bandMultipliers(method: EstimateMethod): { low: number; high: number } {
  switch (method) {
    case "measured":
      return { low: 0.85, high: 1.15 }; // ±15%
    case "trend-adjusted":
      return { low: 0.6, high: 1.4 }; // ±40%
    case "inferred":
      return { low: 0.5, high: 2.0 }; // ×0.5~×2
  }
}

/** base에 편차밴드를 적용해 범위를 만든다. gap이 크면 밴드를 추가로 넓힌다. */
function toRange(
  base: number,
  method: EstimateMethod,
  gapPct: number,
): EstimateRange {
  const band = bandMultipliers(method);
  // 삼각측량 괴리가 50%↑면 불확실 → 밴드 추가 확장
  const widen = gapPct > 50 ? { low: 0.8, high: 1.3 } : { low: 1, high: 1 };
  return {
    low: roundSig(base * band.low * widen.low, 2),
    base: roundSig(base, 2),
    high: roundSig(base * band.high * widen.high, 2),
  };
}

/**
 * TAM/SAM/SOM를 추정한다.
 * @param competitionScore 0~100 (높을수록 레드오션) — SOM 초기 점유율 가정에 반영
 */
export function estimateMarketSize(
  inputs: MarketInputs,
  competitionScore: number,
): MarketSizeResult {
  const m = inputs.meta;

  // --- TAM 이중 추정 ---
  const tamTop = inputs.categoryAnnualSales * inputs.categoryShare;
  const tamBottom =
    inputs.population * inputs.penetrationRate * inputs.annualArpu;
  const mean = (tamTop + tamBottom) / 2 || 1;
  const gap = Math.abs(tamTop - tamBottom) / mean;
  const gapPct = Math.round(gap * 100);

  // gap에 따라 기본값 선택: <20% 산술평균 / 그 외 기하평균
  const geomean = Math.sqrt(Math.max(tamTop, 1) * Math.max(tamBottom, 1));
  const tamBase = gap < 0.2 ? mean : geomean;

  const tamMethod = weakest(
    m.categoryAnnualSales?.method ?? "inferred",
    m.categoryShare?.method ?? "inferred",
    m.penetrationRate?.method ?? "inferred",
    m.annualArpu?.method ?? "inferred",
  );

  // --- SAM: 채널 × 세그먼트 필터 ---
  const onlineChannel = 0.5; // 온라인 채널 비중 가정
  const segmentShare =
    inputs.categoryShare > 0 ? Math.min(1, inputs.categoryShare * 1.2) : 0.3;
  const samFilter = onlineChannel * Math.max(0.15, segmentShare);
  const samBase = tamBase * samFilter;
  const samMethod = weakest(tamMethod, "trend-adjusted");

  // --- SOM: 초기 점유율 가정 (1~5%), 경쟁 강도에 반비례 ---
  const initialShare = 0.05 - (competitionScore / 100) * 0.04; // 0.01~0.05
  const somBase = samBase * initialShare;
  const somMethod: EstimateMethod = "inferred"; // 점유율은 가정

  const assumptions = [
    `TAM top-down = 카테고리 거래액 × 트렌드 점유 ${(inputs.categoryShare * 100).toFixed(0)}%`,
    `TAM bottom-up = 인구 ${(inputs.population / 10000).toFixed(0)}만 × 침투율 ${(inputs.penetrationRate * 100).toFixed(0)}% × 1인 연지출 ${roundSig(inputs.annualArpu).toLocaleString()}원`,
    `삼각측량 괴리 ${gapPct}% → 기본값 ${gap < 0.2 ? "산술평균" : "기하평균"} 채택`,
    `SAM = TAM × (온라인 ${onlineChannel * 100}% × 세그먼트 필터)`,
    `SOM = SAM × 초기 점유율 ${(initialShare * 100).toFixed(1)}% (경쟁강도 ${competitionScore}점 반영)`,
  ];

  return {
    tam: roundSig(tamBase, 2),
    sam: roundSig(samBase, 2),
    som: roundSig(somBase, 2),
    unit: "원",
    currency: "KRW",
    baseYear: 2024,
    tamRange: toRange(tamBase, tamMethod, gapPct),
    samRange: toRange(samBase, samMethod, gapPct),
    somRange: toRange(somBase, somMethod, gapPct),
    methods: { tam: tamMethod, sam: samMethod, som: somMethod },
    assumptions,
    sources: inputs.sources,
    triangulation: {
      topDown: roundSig(tamTop, 2),
      bottomUp: roundSig(tamBottom, 2),
      gapPct,
    },
  };
}
