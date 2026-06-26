// 검색·트렌드 데이터 소스 — 현재는 deterministic mock 어댑터.
//
// 네이버 데이터랩(검색어 트렌드)·쇼핑인사이트(연령/성별 클릭 분해)를 대응한다.
// 트렌드는 절대 규모가 아니라 "비율·기울기"로만 사용한다(기획서 §2-2).
// 실패 시 throw하지 않고 null을 반환한다.

import { rngFor, range, normalizeToPercent } from "@/lib/inference/rng";
import type { KeywordAnalysis } from "@/lib/inference/keyword-analysis";
import type {
  AgeDistribution,
  GenderDistribution,
  TrendData,
} from "@/lib/data-sources/types";

const BASE_DATE = "2024-12";

/**
 * 검색/쇼핑 트렌드를 가져온다(mock). 키워드 deterministic.
 * @returns 부분/전체 데이터, 수집 불가 시 null
 */
export async function fetchTrendData(
  analysis: KeywordAnalysis,
): Promise<TrendData | null> {
  const rng = rngFor(analysis.raw, "trend");

  // 카테고리 내 트렌드 점유 비율 (top-down 분해용): 3~40%
  const categoryShare = Number(range(rng, 0.03, 0.4).toFixed(3));
  // 관심도 추세 기울기: -0.3 ~ +0.6 (신규/성장 키워드는 상승)
  const momentum = Number(range(rng, -0.3, 0.6).toFixed(3));

  // 연령 분포(%) — 쇼핑인사이트 클릭 분해 가정
  const ageWeights = [
    range(rng, 10, 40), // 20대
    range(rng, 15, 45), // 30대
    range(rng, 10, 35), // 40대
    range(rng, 5, 30), // 50대+
  ];
  const agePct = normalizeToPercent(ageWeights);
  const ageDistribution: AgeDistribution = {
    "20대": agePct[0],
    "30대": agePct[1],
    "40대": agePct[2],
    "50대+": agePct[3],
  };

  // 성별 분포(%)
  const femaleWeight = range(rng, 30, 70);
  const genderPct = normalizeToPercent([femaleWeight, 100 - femaleWeight]);
  const genderDistribution: GenderDistribution = {
    female: genderPct[0],
    male: genderPct[1],
  };

  const trendAdjusted = "trend-adjusted" as const;

  return {
    categoryShare: {
      value: categoryShare,
      method: trendAdjusted,
      source: "네이버 데이터랩 검색어 트렌드",
      asOf: BASE_DATE,
    },
    momentum: {
      value: momentum,
      method: trendAdjusted,
      source: "네이버 데이터랩(기울기)",
      asOf: BASE_DATE,
    },
    ageDistribution: {
      value: ageDistribution,
      method: trendAdjusted,
      source: "네이버 쇼핑인사이트",
      asOf: BASE_DATE,
    },
    genderDistribution: {
      value: genderDistribution,
      method: trendAdjusted,
      source: "네이버 쇼핑인사이트",
      asOf: BASE_DATE,
    },
  };
}
