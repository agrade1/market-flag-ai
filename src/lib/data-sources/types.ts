// 데이터 소스 공용 타입 — 수집값 메타(기획서 §2-2).
//
// 모든 수집값에 출처/방법/기준시점을 부착해 후속 편차·confidence 산출의 근거로 쓴다.
// 각 소스 어댑터는 throw하지 않고 null/부분데이터를 반환한다(fallback 판단은 서비스).

import type { EstimateMethod } from "@/features/market-diagnosis/types";

/** 출처/방법/시점 메타가 붙은 단일 수집값. */
export interface DataPoint<T = number> {
  value: T;
  method: EstimateMethod;
  /** 출처명 (예: "KOSIS 온라인쇼핑동향") */
  source: string;
  /** 기준 시점 (연도 또는 ISO 날짜) */
  asOf: string;
}

/** 거시·실측 데이터 묶음 (KOSIS·상권정보·LOCALDATA 대응). */
export interface MacroData {
  /** 카테고리 연간 거래액 (원) — TAM top-down 모수 */
  categoryAnnualSales: DataPoint;
  /** 잠재 고객 모수 인구 (명) */
  population: DataPoint;
  /** 카테고리 침투율 (0~1) */
  penetrationRate: DataPoint;
  /** 1인당 연간 지출 (원) — bottom-up ARPU */
  annualArpu: DataPoint;
  /** 업종 점포/사업체 수 */
  storeCount: DataPoint;
  /** 폐업률 (0~1) — 경쟁·성장 모멘텀 프록시 */
  closureRate: DataPoint;
  /** 거래액 연성장률 CAGR (-1~1) */
  salesCagr: DataPoint;
}

/** 연령/성별 분포(%). 합은 100 근사. */
export interface AgeDistribution {
  "20대": number;
  "30대": number;
  "40대": number;
  "50대+": number;
}
export interface GenderDistribution {
  female: number;
  male: number;
}

/** 검색·트렌드 데이터 묶음 (네이버 데이터랩·쇼핑인사이트 대응). */
export interface TrendData {
  /** 키워드의 카테고리 내 트렌드 점유 비율 (0~1) — top-down 분해용 */
  categoryShare: DataPoint;
  /** 관심도 추세 기울기 (-1~1, +면 상승) */
  momentum: DataPoint;
  /** 연령 분포 (쇼핑인사이트 클릭 분해) */
  ageDistribution: DataPoint<AgeDistribution>;
  /** 성별 분포 */
  genderDistribution: DataPoint<GenderDistribution>;
}
