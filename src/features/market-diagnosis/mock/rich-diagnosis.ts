// 프론트 소유의 rich mock 픽스처 (백엔드 영역 침범 금지).
//
// zod 스키마(report-schema.ts)의 optional 신뢰 필드까지 모두 채운, 키워드 시드
// 기반의 결정성(deterministic) 데이터다. 백엔드 diagnose() 가 준비되면 이 파일의
// getRichDiagnosis 호출을 그 함수로 교체한다(교체 지점은 DiagnosisResult.tsx 의
// import 한 줄 — 아래 ▶ 표기 참고).
//
// 주의: src/lib/data-sources/mock-market-data.ts(백엔드 영역)는 수정하지 않는다.
// 이 파일은 프론트 디자인 검증/신뢰 UI 시연 전용 픽스처다.
//
// 모든 수치는 공공데이터·검색 트렌드·AI 추론을 가정한 참고용 추정치다.

import type {
  CompetitionSignal,
  ConfidenceLevel,
  DiagnosisResult,
  EstimateMethod,
  EstimateRange,
  Persona,
  SourceRef,
} from "@/features/market-diagnosis/types";

/** 문자열을 32-bit 정수 해시로 변환 (FNV-1a 변형, deterministic). */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** 시드 기반 의사난수 생성기 (mulberry32). */
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

function pickInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

const AGE_RANGES = [
  "20대 후반",
  "30대 초반",
  "30대 후반",
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
] as const;

const PAIN_POINTS = [
  "선택지가 너무 많아 비교에 피로를 느낀다",
  "신뢰할 만한 정보를 찾기 어렵다",
  "가격 대비 품질을 확신하기 어렵다",
  "기존 제품이 자신의 상황에 꼭 맞지 않는다",
  "구매 후 사후 관리·재구매가 번거롭다",
] as const;

const PERSONA_NAMES = [
  "가치소비 직장인",
  "정보탐색형 신중구매자",
  "트렌드 민감 얼리어답터",
  "실속 우선 가성비러",
  "브랜드 충성 단골",
] as const;

// 한국 데이터 출처 (정체성 — competitive-strategy §3)
const PUBLIC_SOURCES: SourceRef[] = [
  {
    name: "KOSIS 국가통계포털",
    method: "measured",
    url: "https://kosis.kr",
    note: "가구·인구 추계 및 산업 분류별 거시 지표",
  },
  {
    name: "통계청 가계동향조사",
    method: "measured",
    url: "https://kostat.go.kr",
    note: "품목별 가구 소비지출 통계",
  },
  {
    name: "LOCALDATA 지방행정 인허가",
    method: "measured",
    url: "https://www.localdata.go.kr",
    note: "업종별 사업체 등록·밀도",
  },
];

const TREND_SOURCES: SourceRef[] = [
  {
    name: "네이버 데이터랩 검색어 트렌드",
    method: "trend-adjusted",
    url: "https://datalab.naver.com",
    note: "최근 12개월 검색 관심도 추이로 거시 지표를 보정",
  },
  {
    name: "네이버 쇼핑인사이트",
    method: "trend-adjusted",
    url: "https://datalab.naver.com/shoppingInsight",
    note: "카테고리 클릭량 분포",
  },
];

const AI_SOURCE: SourceRef = {
  name: "Market Flag AI 추론 엔진",
  method: "inferred",
  note: "인접 시장·거시 지표를 결합한 LLM 통계적 추정. 직접 데이터가 없는 항목 보강",
};

const COMMON_NOTICES = [
  "본 리포트의 시장 규모·경쟁 강도·타겟 정보는 공공데이터·검색 트렌드·AI 추론에 기반한 참고용 추정치입니다.",
  "실제 창업·투자 의사결정 전에는 1차 자료 조사 등 추가 검증이 필요합니다.",
];

const LOW_DATA_NOTICE =
  "입력한 키워드의 직접 데이터가 부족해, 인접 시장·거시 지표를 활용한 AI 추정 비중이 높습니다. 아래 수치는 논리적 추정 리포트로, 해석에 주의하세요.";

/** base 값과 편차율로 보수/기본/낙관 범위를 만든다. */
function rangeFromBase(base: number, downPct: number, upPct: number): EstimateRange {
  return {
    low: Math.round(base * (1 - downPct)),
    base: Math.round(base),
    high: Math.round(base * (1 + upPct)),
  };
}

function buildPersonas(rng: () => number): Persona[] {
  const count = pickInt(rng, 2, 3);
  const weights = Array.from({ length: count }, () => pickInt(rng, 20, 60));
  const total = weights.reduce((sum, w) => sum + w, 0);
  const shares = weights.map((w) => Math.round((w / total) * 100));
  shares[0] += 100 - shares.reduce((sum, s) => sum + s, 0);

  const usedNames = new Set<number>();
  const usedPains = new Set<number>();

  return Array.from({ length: count }, (_, index) => {
    let nameIdx = pickInt(rng, 0, PERSONA_NAMES.length - 1);
    while (usedNames.has(nameIdx)) nameIdx = (nameIdx + 1) % PERSONA_NAMES.length;
    usedNames.add(nameIdx);

    let painIdx = pickInt(rng, 0, PAIN_POINTS.length - 1);
    while (usedPains.has(painIdx)) painIdx = (painIdx + 1) % PAIN_POINTS.length;
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

function buildSignals(rng: () => number, score: number): CompetitionSignal[] {
  // 신호 기여도 합이 대략 score 근처가 되도록 분배 (시각화용 상대값)
  const base = [
    { label: "검색 관심도 추세", note: "네이버 데이터랩 12개월 추이 기반" },
    { label: "사업체 밀도", note: "LOCALDATA 동종 업종 등록 수 기반" },
    { label: "신규 진입 속도", note: "최근 등록 증가율로 추정" },
    { label: "진입장벽", note: "초기 투자·규제 난이도 AI 추정" },
  ];
  // score를 4개 신호에 가중 분배
  const raw = base.map(() => 0.5 + rng());
  const sum = raw.reduce((a, b) => a + b, 0);
  return base.map((b, i) => ({
    label: b.label,
    contribution: Math.round((raw[i] / sum) * score),
    note: b.note,
  }));
}

/**
 * ▶ 백엔드 diagnose() 교체 시 이 함수를 대체한다.
 * 키워드 기반 rich mock 시장진단 결과를 생성한다.
 */
export function getRichDiagnosis(
  keyword: string,
  generatedAt = "2024-01-01T00:00:00.000Z",
): DiagnosisResult {
  const trimmed = keyword.trim();
  const isLowData = trimmed.length < 2;

  const seed = hashString(trimmed.toLowerCase() || "market-flag-fallback");
  const rng = createRng(seed);

  // --- 시장 규모 (TAM > SAM > SOM 보장) ---
  const tam = pickInt(rng, 500, 50000) * 100_000_000;
  const sam = Math.round((tam * (0.25 + rng() * 0.3)) / 100_000_000) * 100_000_000;
  const som = Math.round((sam * (0.08 + rng() * 0.14)) / 100_000_000) * 100_000_000;

  // method: 데이터 부족이면 대부분 inferred, 아니면 단계별 신뢰 하락
  const tamMethod: EstimateMethod = isLowData ? "inferred" : "measured";
  const samMethod: EstimateMethod = isLowData ? "inferred" : "trend-adjusted";
  const somMethod: EstimateMethod = "inferred";

  // 편차밴드: 데이터 부족이면 더 넓게
  const tamDown = isLowData ? 0.3 : 0.12;
  const tamUp = isLowData ? 0.45 : 0.18;
  const somDown = isLowData ? 0.4 : 0.3;
  const somUp = isLowData ? 0.6 : 0.4;

  const publicSrc = pick(rng, PUBLIC_SOURCES);
  const trendSrc = pick(rng, TREND_SOURCES);

  const marketSize = {
    tam,
    sam,
    som,
    unit: "원",
    currency: "KRW",
    baseYear: 2024,
    tamRange: rangeFromBase(tam, tamDown, tamUp),
    samRange: rangeFromBase(sam, (tamDown + somDown) / 2, (tamUp + somUp) / 2),
    somRange: rangeFromBase(som, somDown, somUp),
    methods: { tam: tamMethod, sam: samMethod, som: somMethod },
    assumptions: isLowData
      ? [
          "직접 시장 통계가 없어 인접 카테고리 거시 지표에서 안분 추정",
          "SOM은 초기 진입 3년 내 현실적 점유 가정(보수적)",
        ]
      : [
          "TAM은 KOSIS 거시 지표 × 해당 카테고리 소비지출 비율로 산정",
          "SAM은 네이버 데이터랩 검색 관심도로 접근 가능 비율 보정",
          "SOM은 초기 3년 내 현실적 점유율 5~12% 가정",
        ],
    sources: isLowData
      ? [AI_SOURCE, publicSrc]
      : [publicSrc, trendSrc, AI_SOURCE],
  };

  // --- 경쟁 강도 ---
  const score = isLowData ? pickInt(rng, 40, 60) : pickInt(rng, 12, 92);
  const ocean = score >= 67 ? "red" : score <= 40 ? "blue" : "mixed";
  const signals = buildSignals(rng, score);

  const competition = {
    ocean: ocean as DiagnosisResult["competition"]["ocean"],
    score,
    summary: isLowData
      ? `경쟁 강도 ${score}점은 직접 데이터 부족으로 인접 시장에서 보수적으로 추정한 값입니다. 키워드를 구체화하면 정확도가 올라갑니다.`
      : score >= 67
        ? `경쟁 강도 ${score}점으로 다수 사업자가 경쟁 중인 레드오션에 가깝습니다. 뚜렷한 차별화 포인트 확보가 관건입니다.`
        : score <= 40
          ? `경쟁 강도 ${score}점으로 경쟁이 상대적으로 적은 블루오션 성향입니다. 수요 검증과 초기 선점이 중요합니다.`
          : `경쟁 강도 ${score}점으로 기회와 경쟁이 공존하는 시장입니다. 명확한 세분 시장 타겟팅이 유효합니다.`,
    signals,
  };

  // --- 페르소나 ---
  const personas = buildPersonas(rng);

  // --- 신뢰도 ---
  const isEstimated = isLowData || score >= 80 || rng() < 0.35;
  const confidence: ConfidenceLevel = isLowData
    ? "low"
    : isEstimated
      ? "medium"
      : "high";

  const displayKeyword = trimmed || "(키워드 없음)";

  const summary = isLowData
    ? `"${displayKeyword}" 키워드는 직접 데이터가 부족합니다. 아래는 거시 지표와 AI 추론을 결합한 논리적 추정 리포트입니다. 키워드를 조금 더 구체화하면 정확도가 올라갑니다.`
    : `"${displayKeyword}" 시장은 ${
        ocean === "red"
          ? "경쟁이 치열한 레드오션 성향"
          : ocean === "blue"
            ? "경쟁이 적은 블루오션 성향"
            : "기회와 경쟁이 공존하는 시장"
      }으로 추정됩니다. 아래 시장 규모와 타겟 페르소나를 참고해 진입 전략을 점검해 보세요.`;

  const dataSources: SourceRef[] = isLowData
    ? [AI_SOURCE, publicSrc]
    : [publicSrc, trendSrc, AI_SOURCE];

  const confidenceReasons = isLowData
    ? [
        "입력 키워드의 직접 검색·사업체 데이터가 충분히 수집되지 않음",
        "TAM/SAM/SOM 대부분을 인접 시장에서 안분·AI 추론으로 보강함",
        "편차밴드가 넓어(±40~60%) 수치는 방향성 참고용으로만 사용 권장",
      ]
    : [
        "TAM은 KOSIS 거시 지표 실측값을 기반으로 산정됨(신뢰 높음)",
        "SAM은 네이버 데이터랩 검색 트렌드로 보정됨(신뢰 보통)",
        "SOM·페르소나 비중은 AI 추론 비중이 있어 편차밴드를 함께 확인 필요",
      ];

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
    dataSources,
    confidenceReasons,
  };
}
