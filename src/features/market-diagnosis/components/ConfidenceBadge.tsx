import { ShieldCheck, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { confidenceMeta } from "@/features/market-diagnosis/lib/verdict";
import type { ConfidenceLevel } from "@/features/market-diagnosis/types";

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  /** 작은 사이즈(카드 우상단용) */
  size?: "sm" | "md";
  className?: string;
}

const STYLE: Record<
  ConfidenceLevel,
  { icon: typeof ShieldCheck; className: string; methodLabel: string }
> = {
  high: {
    icon: ShieldCheck,
    className: "border-source-public/40 bg-source-public/10 text-source-public",
    methodLabel: "measured · 실측",
  },
  medium: {
    icon: Shield,
    className: "border-source-trend/40 bg-source-trend/10 text-source-trend",
    methodLabel: "trend-adjusted · 트렌드 보정",
  },
  low: {
    icon: ShieldAlert,
    className: "border-source-ai/60 border-dashed bg-source-ai/10 text-source-ai",
    methodLabel: "inferred · AI 추론",
  },
};

/**
 * 신뢰도 배지. confidence → 높음(measured) / 보통(trend-adjusted) / 추정(inferred).
 * 추정(inferred)은 점선 테두리로 형태로도 구분(§2.3).
 */
export default function ConfidenceBadge({
  confidence,
  size = "sm",
  className,
}: ConfidenceBadgeProps) {
  const meta = confidenceMeta(confidence);
  const style = STYLE[confidence];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        style.className,
        className,
      )}
      title={`신뢰도 산출 기준: ${style.methodLabel}`}
    >
      <Icon
        className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}
        aria-hidden="true"
      />
      신뢰 {meta.label}
    </span>
  );
}
