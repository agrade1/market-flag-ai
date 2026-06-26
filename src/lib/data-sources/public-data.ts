// 거시·실측 데이터 소스 — 현재는 deterministic mock 어댑터.
//
// KOSIS(온라인쇼핑동향·인구총조사·가계동향)·소상공인 상권정보·LOCALDATA를 대응한다.
// 실 API 연동(후속 이슈 E)에서 이 함수 "내부"만 교체하면 된다 — 시그니처/반환형 고정.
// 실패 시 throw하지 않고 null을 반환한다(서비스가 fallback 결정).

import { rngFor, range, roundSig } from "@/lib/inference/rng";
import type { KeywordAnalysis } from "@/lib/inference/keyword-analysis";
import type { MacroData } from "@/lib/data-sources/types";

const BASE_YEAR = "2024";

/**
 * 카테고리 거시 데이터를 가져온다(mock). 키워드/가격대에 민감한 deterministic 값.
 * @returns 부분/전체 데이터, 수집 불가 시 null
 */
export async function fetchMacroData(
  analysis: KeywordAnalysis,
): Promise<MacroData | null> {
  const rng = rngFor(analysis.raw, "macro");

  // 가격대 → ARPU·침투율 가정 보정 (프리미엄=고ARPU·저침투, 가성비=저ARPU·고침투)
  const tierArpu =
    analysis.priceTier === "premium"
      ? range(rng, 80_000, 250_000)
      : analysis.priceTier === "value"
        ? range(rng, 15_000, 60_000)
        : range(rng, 40_000, 120_000);
  const tierPenetration =
    analysis.priceTier === "premium"
      ? range(rng, 0.03, 0.12)
      : analysis.priceTier === "value"
        ? range(rng, 0.15, 0.4)
        : range(rng, 0.08, 0.25);

  const population = Math.round(range(rng, 3_000_000, 25_000_000));
  const annualArpu = roundSig(tierArpu, 2);
  const penetrationRate = Number(tierPenetration.toFixed(3));

  // 카테고리 연 거래액: 5천억 ~ 30조 (원)
  const categoryAnnualSales = roundSig(range(rng, 5_000, 300_000) * 1e8, 3);
  const storeCount = Math.round(range(rng, 500, 80_000));
  const closureRate = Number(range(rng, 0.05, 0.25).toFixed(3));
  const salesCagr = Number(range(rng, -0.05, 0.18).toFixed(3));

  const measured = "measured" as const;

  return {
    categoryAnnualSales: {
      value: categoryAnnualSales,
      method: measured,
      source: "KOSIS 온라인쇼핑동향",
      asOf: BASE_YEAR,
    },
    population: {
      value: population,
      method: measured,
      source: "KOSIS 인구총조사",
      asOf: BASE_YEAR,
    },
    penetrationRate: {
      // 침투율은 직접 실측이 아닌 카테고리 비례 추정 → trend-adjusted
      value: penetrationRate,
      method: "trend-adjusted",
      source: "KOSIS 가계동향 + 카테고리 비례",
      asOf: BASE_YEAR,
    },
    annualArpu: {
      value: annualArpu,
      method: measured,
      source: "KOSIS 가계동향조사",
      asOf: BASE_YEAR,
    },
    storeCount: {
      value: storeCount,
      method: measured,
      source: "소상공인 상권정보",
      asOf: BASE_YEAR,
    },
    closureRate: {
      value: closureRate,
      method: measured,
      source: "LOCALDATA 인허가",
      asOf: BASE_YEAR,
    },
    salesCagr: {
      value: salesCagr,
      method: measured,
      source: "KOSIS 온라인쇼핑동향(추이)",
      asOf: BASE_YEAR,
    },
  };
}
