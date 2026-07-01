// 대시보드 사이드바 앵커 정의(단일 출처).
//
// 사이드바 네비와 본문 섹션 id가 이 배열을 공유한다. 새 섹션(예: §4a "관심도")을
// 추가하려면 SECTIONS 배열의 원하는 위치에 항목을 한 줄 끼우고, DashboardShell 본문에
// 같은 id의 <section>을 렌더하면 끝이다. 사이드바/스크롤 추적은 자동으로 따라간다.
//
// ▶ 관심도 모듈(§4a)은 다음 단계 — "경쟁강도"와 "타겟" 사이에 아래 한 줄을 넣으면 된다:
//     { id: "관심도", label: "관심도", icon: "activity" },

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  TrendingUp,
  Gauge,
  Activity,
  Users,
  Database,
} from "lucide-react";

export type SectionIconKey =
  | "overview"
  | "market"
  | "competition"
  | "attention"
  | "target"
  | "sources";

export interface DashboardSection {
  /** DOM id이자 해시 앵커. 한글 그대로 사용(encode는 링크에서 처리). */
  id: string;
  /** 사이드바 노출 라벨. */
  label: string;
  /** 아이콘 키(컴포넌트 매핑). */
  icon: SectionIconKey;
  /** 하단 그룹(출처·신뢰도)으로 분리 표시할지. */
  footerGroup?: boolean;
}

/**
 * 본문 섹션 앵커 목록(위→아래). "관심도"는 다음 단계에서 competition과 target 사이에
 * 한 줄 추가만 하면 사이드바·스크롤 추적·본문이 함께 반영된다.
 */
export const DASHBOARD_SECTIONS: DashboardSection[] = [
  { id: "개요", label: "개요", icon: "overview" },
  { id: "시장규모", label: "시장 규모", icon: "market" },
  { id: "경쟁강도", label: "경쟁 강도", icon: "competition" },
  { id: "관심도", label: "관심도", icon: "attention" },
  { id: "타겟", label: "타겟 페르소나", icon: "target" },
  { id: "출처", label: "출처·신뢰도", icon: "sources", footerGroup: true },
];

export const SECTION_ICONS: Record<SectionIconKey, LucideIcon> = {
  overview: LayoutDashboard,
  market: TrendingUp,
  competition: Gauge,
  attention: Activity,
  target: Users,
  sources: Database,
};
