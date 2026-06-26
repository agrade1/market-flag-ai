// ⑥ 타겟 페르소나 — 연령/성별 분포(데이터)에서 도출하고, 동기·문제상황만 추론(태깅).
// 기획서 §3-3.

import { rngFor, normalizeToPercent } from "@/lib/inference/rng";
import type { MarketInputs } from "@/lib/inference/transform";
import type { KeywordAnalysis } from "@/lib/inference/keyword-analysis";
import type { Persona } from "@/features/market-diagnosis/types";

const TRAIT_POOL = [
  "가격보다 가치를 우선",
  "온라인 검색·리뷰 의존도 높음",
  "신제품 수용이 빠른 얼리어답터",
  "SNS·커뮤니티 공유 활발",
  "브랜드 충성도가 높음",
  "구독·정기결제에 익숙",
  "프리미엄 라인 선호",
  "실용성과 가성비 중시",
  "친환경·윤리적 소비 지향",
] as const;

const PAIN_POOL = [
  "선택지가 많아 비교에 피로를 느낀다",
  "신뢰할 만한 정보를 찾기 어렵다",
  "가격 대비 품질을 확신하기 어렵다",
  "기존 제품이 자신의 상황에 꼭 맞지 않는다",
  "구매 후 사후관리·재구매가 번거롭다",
] as const;

const NAME_BY_TIER: Record<string, string[]> = {
  premium: ["가치소비 직장인", "프리미엄 선호 소비자", "브랜드 충성 단골"],
  value: ["실속 우선 가성비러", "정보탐색형 신중구매자", "알뜰 소비자"],
  standard: ["트렌드 민감 얼리어답터", "정보탐색형 신중구매자", "편의 추구 구독족"],
};

type AgeBucket = "20대" | "30대" | "40대" | "50대+";

/** 분포에서 상위 연령대를 페르소나로 도출한다. */
export function buildPersonas(
  inputs: MarketInputs,
  analysis: KeywordAnalysis,
): Persona[] {
  const rng = rngFor(analysis.raw, "persona");
  const age = inputs.ageDistribution;

  // 상위 연령대 2~3개 선택
  const buckets = (Object.entries(age) as Array<[AgeBucket, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, age["20대"] + age["30대"] > 55 ? 2 : 3);

  const shares = normalizeToPercent(buckets.map(([, pct]) => pct));

  const dominantGender =
    inputs.genderDistribution.female >= 55
      ? "여성"
      : inputs.genderDistribution.male >= 55
        ? "남성"
        : "남녀 무관";

  const names = NAME_BY_TIER[analysis.priceTier] ?? NAME_BY_TIER.standard;
  const usedTraits = new Set<number>();

  return buckets.map(([bucket], index) => {
    const traits: string[] = [];
    // 가격대 성향 우선 반영
    if (analysis.priceTier === "premium") traits.push("프리미엄 라인 선호");
    if (analysis.priceTier === "value") traits.push("실용성과 가성비 중시");
    while (traits.length < 3) {
      const t = Math.floor(rng() * TRAIT_POOL.length);
      if (usedTraits.has(t)) continue;
      usedTraits.add(t);
      if (!traits.includes(TRAIT_POOL[t])) traits.push(TRAIT_POOL[t]);
    }

    return {
      id: `persona-${index + 1}`,
      name: names[index % names.length],
      ageRange: bucket,
      gender: dominantGender,
      traits,
      painPoint: PAIN_POOL[Math.floor(rng() * PAIN_POOL.length)],
      share: shares[index],
    };
  });
}
