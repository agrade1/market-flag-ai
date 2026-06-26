// 시장진단 공유 타입 — 검색 폼 / 결과 대시보드 / (후속) API가 공유하는 스키마.
// 모든 수치는 공공데이터·검색 트렌드·AI 추론 기반의 참고용 추정치다.

export type OceanType = "red" | "blue" | "mixed";

export type ConfidenceLevel = "high" | "medium" | "low";

/** 시장 규모 추정치 (단위는 unit, 기본 "원"). */
export interface MarketSize {
  /** Total Addressable Market — 전체 시장 */
  tam: number;
  /** Serviceable Available Market — 접근 가능 시장 */
  sam: number;
  /** Serviceable Obtainable Market — 현실적 확보 가능 시장 */
  som: number;
  /** 표시 단위 (기본 "원") */
  unit?: string;
}

/** 경쟁 강도 / 레드·블루오션 판별. */
export interface CompetitionInfo {
  ocean: OceanType;
  /** 0–100, 높을수록 경쟁이 치열(레드오션)함. */
  score: number;
  summary: string;
}

/** 타겟 고객 페르소나. */
export interface Persona {
  id: string;
  /** 페르소나 별칭 (예: "가치소비 직장인") */
  name: string;
  /** 연령대 (예: "30대 초반") */
  ageRange: string;
  /** 성별 표기 (예: "여성", "남녀 무관") */
  gender: string;
  /** 소비 성향·특징 */
  traits: string[];
  /** 핵심 문제 상황 */
  painPoint: string;
  /** 타겟 내 비중 (0–100, %) */
  share: number;
}

/** 시장진단 결과 전체. 대시보드가 이 형태를 렌더한다. */
export interface DiagnosisResult {
  keyword: string;
  /** 생성 시각 (ISO 8601) */
  generatedAt: string;
  confidence: ConfidenceLevel;
  /** 데이터 부족으로 AI 추정 비중이 큰 리포트인지 여부 */
  isEstimated: boolean;
  /** 진단 한줄 요약 */
  summary: string;
  competition: CompetitionInfo;
  marketSize: MarketSize;
  personas: Persona[];
  /** 가정·한계 등 사용자에게 보여줄 안내 문구 */
  notices: string[];
}

/** 시장진단 요청 입력. */
export interface DiagnosisRequest {
  keyword: string;
}
