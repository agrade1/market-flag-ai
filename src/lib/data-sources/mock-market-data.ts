// Mock 시장진단 데이터 소스 (서버 사용 가능한 순수 함수).
// 같은 키워드 → 같은 결과가 나오도록 keyword 기반 deterministic 시드를 사용한다.
// Math.random()/Date.now()를 쓰지 않아 빌드/렌더 결정성을 보장한다.
//
// 여기서 만들어지는 모든 수치는 공공데이터·검색 트렌드·AI 추론을 가정한
// 참고용 추정치이며, 실제 데이터 연동 전까지의 임시 Mock이다.

import type {
  CompetitionInfo,
  ConfidenceLevel,
  DiagnosisResult,
  OceanType,
  Persona,
} from "@/features/market-diagnosis/types";

/** 문자열을 32-bit 정수 해시로 변환 (FNV-1a 변형, deterministic). */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // FNV prime 곱셈을 32-bit 안에서 수행
    hash = Math.imul(hash, 0x01000193);
  }
  // 부호 없는 32-bit 정수로 정규화
  return hash >>> 0;
}

/** 시드 기반 의사난수 생성기 (mulberry32). 호출할 때마다 0~1 값을 반환. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** [min, max] 범위의 정수를 시드 난수에서 뽑는다. */
function pickInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** 배열에서 시드 난수로 한 요소를 고른다. */
function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

const AGE_RANGES = [
  "20대 초반",
  "20대 후반",
  "30대 초반",
  "30대 후반",
  "40대",
  "20~30대",
  "30~40대",
] as const;

const GENDERS = ["여성", "남성", "남녀 무관"] as const;

const TRAIT_POOL = [
  "가격보다 가치를 우선",
  "온라인 검색·리뷰 의존도 높음",
  "신제품 수용이 빠른 얼리어답터",
  "SNS·커뮤니티 공유 활발",
  "브랜드 충성도가 높음",
  "구독·정기결제에 익숙",
  "프리미엄 라인 선호",
  "실용성과 가성비 중시",
  "모바일 앱 사용에 능숙",
  "친환경·윤리적 소비 지향",
] as const;

const PAIN_POINTS = [
  "선택지가 너무 많아 비교에 피로를 느낀다",
  "신뢰할 만한 정보를 찾기 어렵다",
  "가격 대비 품질을 확신하기 어렵다",
  "기존 제품이 자신의 상황에 꼭 맞지 않는다",
  "구매 후 사후 관리·재구매가 번거롭다",
  "정보가 분산되어 의사결정에 시간이 오래 걸린다",
] as const;

const PERSONA_NAMES = [
  "가치소비 직장인",
  "정보탐색형 신중구매자",
  "트렌드 민감 얼리어답터",
  "실속 우선 가성비러",
  "브랜드 충성 단골",
  "편의 추구 구독족",
] as const;

const COMMON_NOTICES = [
  "본 리포트의 시장 규모·경쟁 강도·타겟 정보는 공공데이터·검색 트렌드·AI 추론에 기반한 참고용 추정치입니다.",
  "실제 창업·투자 의사결정 전에는 1차 자료 조사 등 추가 검증이 필요합니다.",
];

const LOW_DATA_NOTICE =
  "입력한 키워드의 직접 데이터가 부족해, 인접 시장·거시 지표를 활용한 AI 추정 비중이 높습니다. 수치 해석에 주의하세요.";

/** competition.score → 오션 타입. 높을수록 레드오션. */
function oceanFromScore(score: number): OceanType {
  if (score >= 67) return "red";
  if (score <= 40) return "blue";
  return "mixed";
}

function competitionSummary(ocean: OceanType, score: number): string {
  switch (ocean) {
    case "red":
      return `경쟁 강도 ${score}점으로 이미 다수의 사업자가 경쟁 중인 레드오션에 가깝습니다. 차별화 포인트 확보가 관건입니다.`;
    case "blue":
      return `경쟁 강도 ${score}점으로 경쟁이 상대적으로 적은 블루오션 성향입니다. 수요 검증과 초기 시장 선점이 중요합니다.`;
    default:
      return `경쟁 강도 ${score}점으로 경쟁과 기회가 공존하는 혼합 시장입니다. 명확한 세분 시장 타겟팅이 유효합니다.`;
  }
}

/** TAM/SAM/SOM를 시드 기반으로 생성 (TAM > SAM > SOM 보장). */
function buildMarketSize(rng: () => number) {
  // TAM: 500억 ~ 5조 사이
  const tam = pickInt(rng, 500, 50000) * 100_000_000;
  // SAM: TAM의 25~55%
  const samRatio = 0.25 + rng() * 0.3;
  const sam = Math.round((tam * samRatio) / 100_000_000) * 100_000_000;
  // SOM: SAM의 8~22%
  const somRatio = 0.08 + rng() * 0.14;
  const som = Math.round((sam * somRatio) / 100_000_000) * 100_000_000;
  return { tam, sam, som, unit: "원" };
}

function buildPersonas(rng: () => number): Persona[] {
  const count = pickInt(rng, 2, 3);

  // 비중을 시드 기반 가중치로 만들고 합이 100이 되도록 정규화
  const weights = Array.from({ length: count }, () => pickInt(rng, 20, 60));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const shares = weights.map((w) => Math.round((w / total) * 100));
  // 반올림 오차를 첫 페르소나에서 보정해 합 100 보장
  const diff = 100 - shares.reduce((sum, s) => sum + s, 0);
  shares[0] += diff;

  // 중복 없이 이름/페인포인트/연령/성별을 고르기 위한 인덱스 셔플 보조
  const usedNames = new Set<number>();
  const usedPains = new Set<number>();

  return Array.from({ length: count }, (_, index) => {
    let nameIdx = pickInt(rng, 0, PERSONA_NAMES.length - 1);
    while (usedNames.has(nameIdx)) {
      nameIdx = (nameIdx + 1) % PERSONA_NAMES.length;
    }
    usedNames.add(nameIdx);

    let painIdx = pickInt(rng, 0, PAIN_POINTS.length - 1);
    while (usedPains.has(painIdx)) {
      painIdx = (painIdx + 1) % PAIN_POINTS.length;
    }
    usedPains.add(painIdx);

    const traitCount = pickInt(rng, 2, 3);
    const traits: string[] = [];
    const usedTraits = new Set<number>();
    while (traits.length < traitCount) {
      const t = pickInt(rng, 0, TRAIT_POOL.length - 1);
      if (usedTraits.has(t)) continue;
      usedTraits.add(t);
      traits.push(TRAIT_POOL[t]);
    }

    return {
      id: `persona-${index + 1}`,
      name: PERSONA_NAMES[nameIdx],
      ageRange: pick(rng, AGE_RANGES),
      gender: pick(rng, GENDERS),
      traits,
      painPoint: PAIN_POINTS[painIdx],
      share: shares[index],
    };
  });
}

/**
 * 키워드 기반 Mock 시장진단 결과를 생성한다.
 *
 * @param keyword 진단 대상 키워드
 * @param generatedAt 생성 시각 (미지정 시 결정성을 위한 고정 placeholder)
 */
export function getMockDiagnosis(
  keyword: string,
  generatedAt = "2024-01-01T00:00:00.000Z",
): DiagnosisResult {
  const trimmed = keyword.trim();

  // 데이터 부족 시나리오: 키워드가 비었거나 너무 짧음 → 에러 없이 저신뢰 추정 리포트
  const isLowData = trimmed.length < 2;

  const seed = hashString(trimmed.toLowerCase() || "market-flag-fallback");
  const rng = createRng(seed);

  const marketSize = buildMarketSize(rng);

  const competitionScore = isLowData
    ? pickInt(rng, 40, 60) // 데이터 부족 시 중간대로 보수적 추정
    : pickInt(rng, 18, 92);
  const ocean = oceanFromScore(competitionScore);
  const competition: CompetitionInfo = {
    ocean,
    score: competitionScore,
    summary: competitionSummary(ocean, competitionScore),
  };

  const personas = buildPersonas(rng);

  const isEstimated = isLowData || competitionScore >= 80 || rng() < 0.4;
  const confidence: ConfidenceLevel = isLowData
    ? "low"
    : isEstimated
      ? "medium"
      : "high";

  const displayKeyword = trimmed || "(키워드 없음)";

  const summary = isLowData
    ? `"${displayKeyword}" 키워드의 직접 데이터가 부족해, 인접 시장과 거시 지표를 바탕으로 한 AI 추정 리포트입니다. 우선 키워드를 조금 더 구체화해 보세요.`
    : `"${displayKeyword}" 시장은 ${
        ocean === "red"
          ? "경쟁이 치열한 레드오션 성향"
          : ocean === "blue"
            ? "경쟁이 적은 블루오션 성향"
            : "기회와 경쟁이 공존하는 혼합 시장"
      }으로 추정됩니다. 아래 시장 규모와 타겟 페르소나를 참고해 진입 전략을 점검해 보세요.`;

  const notices = isLowData
    ? [LOW_DATA_NOTICE, ...COMMON_NOTICES]
    : [...COMMON_NOTICES];

  return {
    keyword: displayKeyword,
    generatedAt,
    confidence,
    isEstimated,
    summary,
    competition,
    marketSize,
    personas,
    notices,
  };
}
