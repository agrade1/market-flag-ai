// ② 텍스트 분석 (Keyword Understanding) — 키워드 분해.
//
// 핵심명사/수식어/가격대/대략 카테고리를 뽑아 후속 추론 입력으로 쓴다.
// 현재는 룰 기반(소형 사전). 후속 이슈에서 표준 카테고리 매핑(KOSIS 업종코드)·
// LLM 보조 분류로 확장한다(기획서 ②③).

export type PriceTier = "premium" | "standard" | "value";

export interface KeywordAnalysis {
  /** 원본 키워드(trim) */
  raw: string;
  /** 수식어를 제거한 핵심 명사구 */
  core: string;
  /** 감지된 수식어 (예: "프리미엄", "친환경") */
  modifiers: string[];
  /** 가격대 추정 — ARPU·침투율 가정에 반영 */
  priceTier: PriceTier;
  /** 대략적 카테고리 라벨(현재 휴리스틱) */
  category: string;
}

const PREMIUM_WORDS = ["프리미엄", "고급", "럭셔리", "하이엔드", "명품"];
const VALUE_WORDS = ["저가", "가성비", "실속", "초저가", "알뜰"];
const OTHER_MODIFIERS = ["친환경", "비건", "수제", "유기농", "맞춤", "구독"];

const CATEGORY_HINTS: Array<[string[], string]> = [
  [["사료", "반려", "펫", "강아지", "고양이"], "반려동물"],
  [["화장품", "뷰티", "스킨", "코스메틱"], "뷰티"],
  [["식품", "밀키트", "간편식", "음료", "커피"], "식품"],
  [["헬스케어", "건강", "운동", "다이어트", "시니어"], "헬스케어"],
  [["세제", "생활", "주방", "청소"], "생활용품"],
  [["앱", "서비스", "플랫폼", "구독"], "디지털서비스"],
  [["패션", "의류", "옷", "신발"], "패션"],
];

/** 키워드를 분해한다. 외부 호출 없는 순수 함수. */
export function analyzeKeyword(keyword: string): KeywordAnalysis {
  const raw = keyword.trim();
  const lower = raw.toLowerCase();

  const modifiers: string[] = [];
  let core = raw;

  const allModifierWords = [...PREMIUM_WORDS, ...VALUE_WORDS, ...OTHER_MODIFIERS];
  for (const word of allModifierWords) {
    if (raw.includes(word)) {
      modifiers.push(word);
      core = core.replace(word, "").trim();
    }
  }
  // 핵심 명사구가 비면 원본 유지
  if (core.length === 0) core = raw;

  const priceTier: PriceTier = PREMIUM_WORDS.some((w) => raw.includes(w))
    ? "premium"
    : VALUE_WORDS.some((w) => raw.includes(w))
      ? "value"
      : "standard";

  let category = "기타";
  for (const [hints, label] of CATEGORY_HINTS) {
    if (hints.some((h) => lower.includes(h.toLowerCase()))) {
      category = label;
      break;
    }
  }

  return { raw, core, modifiers, priceTier, category };
}
