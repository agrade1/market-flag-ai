import { Sparkles, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { ConfidenceLevel } from "@/features/market-diagnosis/types";

interface DiagnosisSummaryCardProps {
  keyword: string;
  summary: string;
  confidence: ConfidenceLevel;
  isEstimated: boolean;
}

const CONFIDENCE_META: Record<
  ConfidenceLevel,
  {
    label: string;
    icon: typeof ShieldCheck;
    className: string;
  }
> = {
  high: {
    label: "신뢰도 높음",
    icon: ShieldCheck,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  },
  medium: {
    label: "신뢰도 보통",
    icon: Shield,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  },
  low: {
    label: "신뢰도 낮음 · 데이터 부족",
    icon: ShieldAlert,
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
  },
};

export default function DiagnosisSummaryCard({
  keyword,
  summary,
  confidence,
  isEstimated,
}: DiagnosisSummaryCardProps) {
  const meta = CONFIDENCE_META[confidence];
  const ConfidenceIcon = meta.icon;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            진단 요약
          </p>
          <h3 className="mt-1 flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            <span className="truncate">{keyword}</span>
          </h3>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}
          >
            <ConfidenceIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {meta.label}
          </span>
          {isEstimated && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI 추정 비중 높음
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 sm:text-base">
        {summary}
      </p>
    </section>
  );
}
