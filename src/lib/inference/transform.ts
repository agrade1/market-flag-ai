// ⑤ 데이터 가공 (Transform) — 거시·트렌드를 정규화하고 결측을 fallback으로 보정.
//
// 각 입력 필드에 method/source 메타를 유지한다(후속 confidence 산출 근거).
// 소스가 null이면 throw하지 않고 한 단계 아래 근거(inferred)로 채우고 fallback을 기록한다.

import type { EstimateMethod, SourceRef } from "@/features/market-diagnosis/types";
import type {
  AgeDistribution,
  GenderDistribution,
  MacroData,
  TrendData,
} from "@/lib/data-sources/types";
import type { KeywordAnalysis } from "@/lib/inference/keyword-analysis";

export interface FieldMeta {
  method: EstimateMethod;
  source: string;
}

/** 추론 단계가 소비하는 정규화된 입력 묶음. */
export interface MarketInputs {
  /** 카테고리 연 거래액 (원) */
  categoryAnnualSales: number;
  /** 카테고리 내 트렌드 점유 비율 (0~1) */
  categoryShare: number;
  /** 잠재 모수 인구 (명) */
  population: number;
  /** 침투율 (0~1) */
  penetrationRate: number;
  /** 1인 연간 지출 (원) */
  annualArpu: number;
  /** 관심도 추세 기울기 (-1~1) */
  momentum: number;
  /** 점포 수 */
  storeCount: number;
  /** 폐업률 (0~1) */
  closureRate: number;
  /** 거래액 CAGR (-1~1) */
  salesCagr: number;
  /** 연령 분포(%) */
  ageDistribution: AgeDistribution;
  /** 성별 분포(%) */
  genderDistribution: GenderDistribution;
  /** 필드별 method/source 메타 */
  meta: Record<string, FieldMeta>;
  /** 사용한 출처 목록(중복 제거) */
  sources: SourceRef[];
  /** 결측으로 fallback 처리한 항목 설명 */
  fallbacks: string[];
}

/** 인구 평균 연령 분포 — 트렌드 결측 시 fallback. */
const FALLBACK_AGE: AgeDistribution = {
  "20대": 22,
  "30대": 30,
  "40대": 28,
  "50대+": 20,
};
const FALLBACK_GENDER: GenderDistribution = { female: 50, male: 50 };

/**
 * 거시·트렌드 수집 결과를 정규화한다. 둘 다 null이어도 동작하며 confidence만 낮아진다.
 */
export function transform(
  analysis: KeywordAnalysis,
  macro: MacroData | null,
  trend: TrendData | null,
): MarketInputs {
  const meta: Record<string, FieldMeta> = {};
  const sources: SourceRef[] = [];
  const fallbacks: string[] = [];

  const addSource = (name: string, method: EstimateMethod) => {
    if (!sources.some((s) => s.name === name)) sources.push({ name, method });
  };

  // 가격대별 보수적 fallback 값 (거시 결측 시)
  const tierArpu =
    analysis.priceTier === "premium"
      ? 150_000
      : analysis.priceTier === "value"
        ? 35_000
        : 80_000;

  // --- 거시 ---
  let categoryAnnualSales: number;
  let population: number;
  let penetrationRate: number;
  let annualArpu: number;
  let storeCount: number;
  let closureRate: number;
  let salesCagr: number;

  if (macro) {
    categoryAnnualSales = macro.categoryAnnualSales.value;
    population = macro.population.value;
    penetrationRate = macro.penetrationRate.value;
    annualArpu = macro.annualArpu.value;
    storeCount = macro.storeCount.value;
    closureRate = macro.closureRate.value;
    salesCagr = macro.salesCagr.value;
    meta.categoryAnnualSales = {
      method: macro.categoryAnnualSales.method,
      source: macro.categoryAnnualSales.source,
    };
    meta.population = {
      method: macro.population.method,
      source: macro.population.source,
    };
    meta.penetrationRate = {
      method: macro.penetrationRate.method,
      source: macro.penetrationRate.source,
    };
    meta.annualArpu = {
      method: macro.annualArpu.method,
      source: macro.annualArpu.source,
    };
    meta.storeCount = {
      method: macro.storeCount.method,
      source: macro.storeCount.source,
    };
    meta.closureRate = {
      method: macro.closureRate.method,
      source: macro.closureRate.source,
    };
    meta.salesCagr = {
      method: macro.salesCagr.method,
      source: macro.salesCagr.source,
    };
    [
      macro.categoryAnnualSales,
      macro.population,
      macro.penetrationRate,
      macro.annualArpu,
      macro.storeCount,
      macro.closureRate,
      macro.salesCagr,
    ].forEach((d) => addSource(d.source, d.method));
  } else {
    // 거시 전면 결측 → 순수 추론 fallback
    categoryAnnualSales = 1_000_000_000_000; // 1조 가정
    population = 10_000_000;
    penetrationRate = 0.1;
    annualArpu = tierArpu;
    storeCount = 10_000;
    closureRate = 0.15;
    salesCagr = 0.05;
    for (const key of [
      "categoryAnnualSales",
      "population",
      "penetrationRate",
      "annualArpu",
      "storeCount",
      "closureRate",
      "salesCagr",
    ]) {
      meta[key] = { method: "inferred", source: "LLM 추론(거시 결측)" };
    }
    addSource("LLM 추론(거시 결측)", "inferred");
    fallbacks.push("거시 공공데이터 수집 실패 → 보수적 가정값으로 추정");
  }

  // --- 트렌드 ---
  let categoryShare: number;
  let momentum: number;
  let ageDistribution: AgeDistribution;
  let genderDistribution: GenderDistribution;

  if (trend) {
    categoryShare = trend.categoryShare.value;
    momentum = trend.momentum.value;
    ageDistribution = trend.ageDistribution.value;
    genderDistribution = trend.genderDistribution.value;
    meta.categoryShare = {
      method: trend.categoryShare.method,
      source: trend.categoryShare.source,
    };
    meta.momentum = {
      method: trend.momentum.method,
      source: trend.momentum.source,
    };
    meta.ageDistribution = {
      method: trend.ageDistribution.method,
      source: trend.ageDistribution.source,
    };
    meta.genderDistribution = {
      method: trend.genderDistribution.method,
      source: trend.genderDistribution.source,
    };
    [
      trend.categoryShare,
      trend.momentum,
      trend.ageDistribution,
      trend.genderDistribution,
    ].forEach((d) => addSource(d.source, d.method));
  } else {
    categoryShare = 0.1; // 상위 카테고리 ÷ 개수 가정
    momentum = 0;
    ageDistribution = FALLBACK_AGE;
    genderDistribution = FALLBACK_GENDER;
    for (const key of [
      "categoryShare",
      "momentum",
      "ageDistribution",
      "genderDistribution",
    ]) {
      meta[key] = { method: "inferred", source: "인구 평균 분포(트렌드 결측)" };
    }
    addSource("인구 평균 분포(트렌드 결측)", "inferred");
    fallbacks.push("검색 트렌드 수집 실패 → 인구 평균 분포로 대체");
  }

  return {
    categoryAnnualSales,
    categoryShare,
    population,
    penetrationRate,
    annualArpu,
    momentum,
    storeCount,
    closureRate,
    salesCagr,
    ageDistribution,
    genderDistribution,
    meta,
    sources,
    fallbacks,
  };
}
