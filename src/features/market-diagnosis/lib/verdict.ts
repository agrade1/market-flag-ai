// 경쟁강도 점수(0–100) → 5단계 시장 판정 매핑 헬퍼.
//
// 점수가 높을수록 레드오션(경쟁 치열). 색은 globals.css 의 --verdict-* 토큰을
// 사용한다(임의 hex 금지). 차트(recharts)에서 fill 로 var() 직접 참조,
// 배지/텍스트에서는 Tailwind 토큰 유틸(bg-verdict-* 등)을 쓴다.
//
// 모든 판정은 공공데이터·트렌드·AI 추론 기반의 참고용 추정치다.

import type { EstimateMethod, ConfidenceLevel } from "@/features/market-diagnosis/types";

export type VerdictKey = "blue" | "cyan" | "neutral" | "orange" | "red";

export interface VerdictMeta {
  key: VerdictKey;
  /** 사용자 노출 라벨 */
  label: string;
  /** recharts fill 등에 쓰는 CSS 변수 참조 */
  cssVar: string;
  /** 색 도트/텍스트용 토큰 클래스 */
  textClass: string;
  bgClass: string;
  borderClass: string;
  /** 배지 전체 스타일(soft) */
  badgeClass: string;
}

const VERDICT_TABLE: Record<VerdictKey, VerdictMeta> = {
  blue: {
    key: "blue",
    label: "블루오션",
    cssVar: "var(--verdict-blue)",
    textClass: "text-verdict-blue",
    bgClass: "bg-verdict-blue",
    borderClass: "border-verdict-blue",
    badgeClass:
      "border-verdict-blue/40 bg-verdict-blue/10 text-verdict-blue",
  },
  cyan: {
    key: "cyan",
    label: "약블루",
    cssVar: "var(--verdict-cyan)",
    textClass: "text-verdict-cyan",
    bgClass: "bg-verdict-cyan",
    borderClass: "border-verdict-cyan",
    badgeClass:
      "border-verdict-cyan/40 bg-verdict-cyan/10 text-verdict-cyan",
  },
  neutral: {
    key: "neutral",
    label: "중립",
    cssVar: "var(--verdict-neutral)",
    textClass: "text-verdict-neutral",
    bgClass: "bg-verdict-neutral",
    borderClass: "border-verdict-neutral",
    badgeClass:
      "border-verdict-neutral/50 bg-verdict-neutral/10 text-verdict-neutral",
  },
  orange: {
    key: "orange",
    label: "약레드",
    cssVar: "var(--verdict-orange)",
    textClass: "text-verdict-orange",
    bgClass: "bg-verdict-orange",
    borderClass: "border-verdict-orange",
    badgeClass:
      "border-verdict-orange/40 bg-verdict-orange/10 text-verdict-orange",
  },
  red: {
    key: "red",
    label: "레드오션",
    cssVar: "var(--verdict-red)",
    textClass: "text-verdict-red",
    bgClass: "bg-verdict-red",
    borderClass: "border-verdict-red",
    badgeClass: "border-verdict-red/40 bg-verdict-red/10 text-verdict-red",
  },
};

/**
 * 경쟁강도 점수(0–100)를 5단계 판정으로 환산한다.
 * 0–20 블루 / 20–40 약블루 / 40–60 중립 / 60–80 약레드 / 80–100 레드.
 */
export function verdictFromScore(score: number): VerdictMeta {
  const clamped = Math.min(100, Math.max(0, score));
  if (clamped < 20) return VERDICT_TABLE.blue;
  if (clamped < 40) return VERDICT_TABLE.cyan;
  if (clamped < 60) return VERDICT_TABLE.neutral;
  if (clamped < 80) return VERDICT_TABLE.orange;
  return VERDICT_TABLE.red;
}

// --- 출처 method 색코딩 (§2.3) ---

export interface MethodMeta {
  label: string;
  /** 색 도트/테두리 토큰 */
  colorClass: string;
  borderClass: string;
  bgClass: string;
  /** AI 추론만 점선 테두리 */
  dashed: boolean;
}

const METHOD_TABLE: Record<EstimateMethod, MethodMeta> = {
  measured: {
    label: "공공데이터 실측",
    colorClass: "bg-source-public",
    borderClass: "border-source-public/40",
    bgClass: "bg-source-public/10",
    dashed: false,
  },
  "trend-adjusted": {
    label: "트렌드 보정",
    colorClass: "bg-source-trend",
    borderClass: "border-source-trend/40",
    bgClass: "bg-source-trend/10",
    dashed: false,
  },
  inferred: {
    label: "AI 추론",
    colorClass: "bg-source-ai",
    borderClass: "border-source-ai/60",
    bgClass: "bg-source-ai/10",
    dashed: true,
  },
};

export function methodMeta(method: EstimateMethod): MethodMeta {
  return METHOD_TABLE[method];
}

// --- confidence 배지 라벨 ---

export interface ConfidenceMeta {
  label: string;
  /** 함께 보여줄 method 기준 라벨 */
  methodHint: EstimateMethod;
}

const CONFIDENCE_TABLE: Record<ConfidenceLevel, ConfidenceMeta> = {
  high: { label: "높음", methodHint: "measured" },
  medium: { label: "보통", methodHint: "trend-adjusted" },
  low: { label: "추정", methodHint: "inferred" },
};

export function confidenceMeta(confidence: ConfidenceLevel): ConfidenceMeta {
  return CONFIDENCE_TABLE[confidence];
}

/** 큰 금액을 조/억 단위 한글로 포맷. unit 미지정 시 "원". */
export function formatKoreanCurrency(value: number, unit = "원"): string {
  const JO = 1_0000_0000_0000; // 1조
  const EOK = 1_0000_0000; // 1억

  if (value >= JO) {
    const jo = Math.floor(value / JO);
    const eok = Math.round((value % JO) / EOK);
    return eok > 0
      ? `${jo.toLocaleString("ko-KR")}조 ${eok.toLocaleString("ko-KR")}억 ${unit}`
      : `${jo.toLocaleString("ko-KR")}조 ${unit}`;
  }
  if (value >= EOK) {
    return `${Math.round(value / EOK).toLocaleString("ko-KR")}억 ${unit}`;
  }
  return `${value.toLocaleString("ko-KR")} ${unit}`;
}
